#!/usr/bin/env python
"""Migration script: Access (.accdb) → PostgreSQL with Unicode conversion.

Prerequisites
-------------
* Windows 10/11 with 64‑bit Python 3.11+ installed.
* Microsoft Access ODBC driver ("Microsoft Access Driver (*.mdb, *.accdb)") – already present on this system.
* PostgreSQL server running locally (or remote) and reachable via a connection string supplied in the environment variable ``PG_CONN``.
* Python packages: ``pyodbc``, ``psycopg2-binary``, ``preeti2unicode`` (for legacy Nepali font conversion).

Usage
-----
```bash
# From the project root directory
python scripts/migrate_access_to_pg.py
```
Make sure the environment variable ``PG_CONN`` is set, e.g.:
```powershell
$env:PG_CONN = "postgresql://postgres:yourpassword@localhost:5432/basistha_astrology"
```
The script will:
1. Scan the folder ``वेदश्चक्षु फलित`` for the three .accdb files.
2. For each file it will:
   * Connect via ODBC, list tables, and create matching tables in PostgreSQL.
   * Fetch rows, convert every text column from legacy Nepali fonts to Unicode using ``preeti2unicode``.
   * Insert data in batches (10 000 rows) for efficiency.
3. Log progress to ``migration.log`` and any rows that could not be converted to ``failed_rows.json``.

Configuration
-------------
* ``ACCESS_ROOT`` – directory where the .accdb files live (default: ``c:/Users/Hp Victus/Documents/aiclass/Basistha/Database``).
* ``BATCH_SIZE`` – number of rows per ``INSERT`` batch (default: 10000).

---
"""
import os, sys, json, logging
from pathlib import Path

# ---------- Logging ----------
logging.basicConfig(
    filename="migration.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# ---------- Helpers ----------
def to_unicode(text: str) -> str:
    """Convert legacy Nepali font text (Preeti/Kantipur) to Unicode.
    If conversion fails, the original text is returned.
    """
    try:
        # The preeti2unicode package provides a ``convert`` function.
        from preeti_unicode import convert_text
        return convert_text(text)
    except Exception as e:
        logger.warning(f"Unicode conversion failed for '{text[:30]}…': {e}")
        return text

def map_access_type(access_type: str) -> str:
    """Map MS‑Access column type to a PostgreSQL column type.
    This is a simple heuristic; most astronomical tables use TEXT, INTEGER, DOUBLE, DATE.
    """
    typ = access_type.upper()
    if "CHAR" in typ or "TEXT" in typ:
        return "TEXT"
    if "INT" in typ:
        return "INTEGER"
    if "DOUBLE" in typ or "FLOAT" in typ or "NUMERIC" in typ:
        return "DOUBLE PRECISION"
    if "DATE" in typ or "TIME" in typ:
        return "TIMESTAMP"
    # Fallback
    return "TEXT"

def get_odbc_connection(accdb_path: Path):
    """Return a pyodbc connection to the given Access file."""
    conn_str = (
        r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
        f"DBQ={str(accdb_path)};"
    )
    import pyodbc
    return pyodbc.connect(conn_str)

def get_pg_connection():
    """Return a psycopg2 connection using keyword arguments (safe for passwords with @ or #)."""
    import psycopg2
    pg_conn_str = os.getenv("PG_CONN", "")
    if pg_conn_str:
        # Try direct connection string first
        try:
            return psycopg2.connect(pg_conn_str)
        except Exception:
            pass
    # Fallback to keyword arguments
    return psycopg2.connect(
        host=os.getenv("PG_HOST", "localhost"),
        port=int(os.getenv("PG_PORT", "5432")),
        user=os.getenv("PG_USER", "postgres"),
        password=os.getenv("PG_PASSWORD", "Biswash@#12"),
        dbname=os.getenv("PG_DBNAME", "basistha_astrology"),
    )

def create_pg_table(pg_cur, table_name: str, columns: list):
    col_defs = []
    for col_name, acc_type in columns:
        pg_type = map_access_type(acc_type)
        col_defs.append(f'"{col_name}" {pg_type}')
    create_stmt = f'CREATE TABLE IF NOT EXISTS "{table_name}" ({", ".join(col_defs)});'
    pg_cur.execute(create_stmt)
    logger.info(f"Created/validated table {table_name}")

def migrate_table(access_cur, pg_conn, table_name: str, columns: list):
    pg_cur = pg_conn.cursor()
    # Build INSERT statement with placeholders
    col_names = [col for col, _ in columns]
    placeholders = ["%s"] * len(col_names)
    col_list = ", ".join([f'"{c}"' for c in col_names])
    placeholder_list = ", ".join(placeholders)
    insert_sql = f'INSERT INTO "{table_name}" ({col_list}) VALUES ({placeholder_list})'
    batch = []
    batch_size = int(os.getenv("BATCH_SIZE", "10000"))
    total = 0
    failed = []
    for row in access_cur.fetchall():
        converted = []
        for val, (col, typ) in zip(row, columns):
            if isinstance(val, str):
                converted.append(to_unicode(val))
            else:
                converted.append(val)
        batch.append(tuple(converted))
        if len(batch) >= batch_size:
            try:
                pg_cur.executemany(insert_sql, batch)
                pg_conn.commit()
                total += len(batch)
                logger.info(f"Inserted {len(batch)} rows into {table_name} (total {total})")
            except Exception as e:
                logger.error(f"Batch insert failed for {table_name}: {e}")
                failed.extend(batch)
                pg_conn.rollback()
            batch.clear()
    # Remaining rows
    if batch:
        try:
            pg_cur.executemany(insert_sql, batch)
            pg_conn.commit()
            total += len(batch)
            logger.info(f"Inserted final {len(batch)} rows into {table_name} (total {total})")
        except Exception as e:
            logger.error(f"Final batch insert failed for {table_name}: {e}")
            failed.extend(batch)
            pg_conn.rollback()
    if failed:
        with open("failed_rows.json", "w", encoding="utf-8") as f:
            json.dump(failed, f, ensure_ascii=False, indent=2)
        logger.warning(f"{len(failed)} rows could not be inserted – written to failed_rows.json")
    pg_cur.close()

def main():
    access_root = Path(os.getenv("ACCESS_ROOT", Path(__file__).resolve().parent.parent / "Database"))
    accdb_files = [p for p in access_root.rglob("*.accdb")]
    if not accdb_files:
        logger.error(f"No .accdb files found in {access_root}")
        sys.exit(1)
    pg_conn = get_pg_connection()
    pg_cur = pg_conn.cursor()
    for accdb in accdb_files:
        logger.info(f"Processing {accdb.name}")
        access_conn = get_odbc_connection(accdb)
        access_cur = access_conn.cursor()
        # Get table list
        tables = [row[2] for row in access_cur.tables(tableType='TABLE')]
        for tbl in tables:
            # Retrieve column info
            cols = [(c.column_name, c.type_name) for c in access_cur.columns(table=tbl)]
            create_pg_table(pg_cur, tbl, cols)
            # Pull data
            access_cur.execute(f"SELECT * FROM [{tbl}]")
            migrate_table(access_cur, pg_conn, tbl, cols)
        access_cur.close()
        access_conn.close()
    pg_cur.close()
    pg_conn.close()
    logger.info("Migration completed.")

if __name__ == "__main__":
    main()
