# Migration Guide – Access → PostgreSQL (Unicode)

## 1️⃣ Prerequisites
- **Windows 10/11** with **Python 3.11+** installed.
- **Microsoft Access ODBC driver** (`Microsoft Access Driver (*.mdb, *.accdb)`).
  - We verified it is installed on your machine.
- A running **PostgreSQL** server (local or remote).
- Required Python packages:
  ```
  pip install pyodbc psycopg2-binary preeti2unicode
  ```
  Add them to the project's `requirements.txt` if you use a virtual‑env.

## 2️⃣ Configure environment variables
Create a file called **`.env.example`** (copy it to `.env` later) and fill the values:
```
# PostgreSQL connection string – replace user, password, host, port and dbname as needed
PG_CONN=postgresql://postgres:YOUR_PASSWORD@localhost:5432/basistha_astrology

# Root folder where the three .accdb files live (default points to your existing folder)
ACCESS_ROOT=./Database

# Optional – batch size for inserts (default 10000)
BATCH_SIZE=10000
```
Load the variables in PowerShell before running the script:
```powershell
$env:PG_CONN = "postgresql://postgres:myPass@localhost:5432/basistha_astrology"
$env:ACCESS_ROOT = "./Database"
```
(If you use a `.env` file, you can `pip install python-dotenv` and prepend `from dotenv import load_dotenv; load_dotenv()` at the top of the script.)

## 3️⃣ Create the target PostgreSQL database
Open `psql` (or any client) and run:
```sql
CREATE DATABASE basistha_astrology;
```
You can also let the script create it, but having the DB ready avoids permission surprises.

## 4️⃣ Run the migration
From the project root:
```bash
python scripts/migrate_access_to_pg.py
```
The script will:
1. Scan `ACCESS_ROOT` for `Phalit.accdb`, `bibaran1.accdb`, `places.accdb`.
2. For each table it creates a matching PostgreSQL table.
3. Reads rows, converts every Nepali text column from Preeti/Kantipur to Unicode using `preeti2unicode`.
4. Inserts rows in batches (default 10 000).
5. Logs progress to **`migration.log`** and any rows that could not be inserted to **`failed_rows.json`**.

## 5️⃣ Verify the migration
After the script finishes, connect to PostgreSQL and compare row counts:
```sql
\c basistha_astrology
SELECT table_name, table_rows FROM (SELECT table_name, reltuples::bigint AS table_rows FROM pg_class WHERE relkind='r') AS stats;
```
Pick a few records and ensure Nepali text displays correctly (Unicode characters, not glyph‑code of Preeti).

## 6️⃣ Troubleshooting
- **ODBC driver not found** – run `Get-OdbcDriver` again; reinstall the 64‑bit Access Database Engine if missing.
- **`PG_CONN` not set** – you will see `Environment variable PG_CONN is not set.` error.
- **Permission errors on PostgreSQL** – make sure the user in the connection string has `CREATE` and `INSERT` privileges on the target DB.
- **Unicode conversion failures** – the script logs a warning and leaves the original text unchanged; you may inspect `failed_rows.json`.

---
**Next steps**
1. Set up PostgreSQL and environment variables as described.
2. Install the Python packages.
3. Run the migration script.
4. Once data is verified, you can expose it via your FastAPI backend (add SQLAlchemy models if needed).

If you run into any issues, let me know the exact error message and we’ll address it together.
