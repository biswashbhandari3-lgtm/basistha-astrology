"""
Basistha Astrological Engine
Traditional Multi-Page Nepali Cheena (Janmapatrika) PDF Generator using ReportLab
Powered by Google Noto Sans Devanagari with OpenType HarfBuzz Text Shaping

Page Structure:
- Page 1: Auspicious Invocations, Native Birth Details, Detailed Panchanga, Avakahada Chakra
- Page 2: Graha Spashta Table (with Chara Karakas), Panchadha Graha Maitri Chakra, Main Charts (D-1 Lagna & D-9 Navamsha)
- Page 3: Shodashavarga (16 Divisional Charts in a balanced 4x4 North Indian Diamond Grid)
- Page 4: Three Comprehensive Dasha Systems: Vimshottari (120y), Tribhagi (80y), Yogini (36y) with Mahadashas & Antardashas
- Page 5: Comprehensive Predictions Part 1 (Core Life, Business/Career, Foreign Travel/Settlement, Family/Marriage, Education/Spirituality)
- Page 6: Comprehensive Predictions Part 2 (9 Mahadasha Interpretations, Benefic Gemstones & Remedies, Astrologer Certification Block)
"""
import os
import sys
import io
import math
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
try:
    from reportlab.pdfbase.ttfonts import shapeStr
    import uharfbuzz
    HAS_SHAPING = True
except ImportError:
    HAS_SHAPING = False

from reportlab.platypus import Table, TableStyle

from app.core.swisseph_wrapper import (
    get_julian_day, get_ayanamsha_value, calc_planet_position,
    calc_lagna_and_houses, get_dms, PLANET_IDS, PLANET_NAMES_NE,
    RASHI_NAMES_NE, NAKSHATRA_NAMES_NE
)
from app.core.shodashavarga import get_all_vargas_for_longitude
from app.core.panchang import get_panchang
from app.core.dasha import (
    calculate_vimshottari_dasha, calculate_tribhagi_dasha, calculate_yogini_dasha
)
from app.core.cheena_predictions import generate_cheena_predictions

# -------------------------------------------------------------
# १. फन्ट व्यवस्थापन (Font Setup & OpenType Text Shaping)
# -------------------------------------------------------------
FONT_REGULAR = "NotoSansDevanagari"
FONT_BOLD = "NotoSansDevanagari-Bold"
_FONTS_INITIALIZED = False

def setup_fonts():
    """Registers Google Noto Sans Devanagari TTF fonts."""
    global FONT_REGULAR, FONT_BOLD, _FONTS_INITIALIZED
    if _FONTS_INITIALIZED:
        return

    current_dir = Path(__file__).resolve().parent
    local_fonts_dir = current_dir.parent / "fonts"

    bundled_reg = local_fonts_dir / "NotoSansDevanagari-Regular.ttf"
    bundled_bold = local_fonts_dir / "NotoSansDevanagari-Bold.ttf"

    font_candidates = [
        ("NotoSansDevanagari", "NotoSansDevanagari-Bold", str(bundled_reg), str(bundled_bold)),
        ("Kokila", "Kokila-Bold", r"C:\Windows\Fonts\kokila.ttf", r"C:\Windows\Fonts\kokilab.ttf"),
        ("Mangal", "Mangal-Bold", r"C:\Windows\Fonts\mangal.ttf", r"C:\Windows\Fonts\mangalb.ttf"),
    ]

    registered = False
    for reg_name, bold_name, reg_path, bold_path in font_candidates:
        if os.path.exists(reg_path):
            try:
                pdfmetrics.registerFont(TTFont(reg_name, reg_path))
                if os.path.exists(bold_path):
                    pdfmetrics.registerFont(TTFont(bold_name, bold_path))
                else:
                    pdfmetrics.registerFont(TTFont(bold_name, reg_path))
                FONT_REGULAR = reg_name
                FONT_BOLD = bold_name
                registered = True
                break
            except Exception as e:
                print(f"Font registration warning ({reg_name}): {e}")

    if not registered:
        FONT_REGULAR = "Helvetica"
        FONT_BOLD = "Helvetica-Bold"

    _FONTS_INITIALIZED = True

def shape_text(text: str, font_name: Optional[str] = None, font_size: float = 9.0) -> str:
    """Shapes Devanagari Unicode text using OpenType HarfBuzz rules."""
    if not text or not isinstance(text, str):
        return "" if text is None else str(text)

    fn = font_name or FONT_REGULAR
    if HAS_SHAPING:
        try:
            return shapeStr(text, fn, font_size)
        except Exception:
            return text
    return text

def to_dev_num(val, lang="ne"):
    """Converts digits to Devanagari numerals when lang is Nepali."""
    if val is None:
        return ""
    if lang == "en":
        return str(val)
    dev_digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
    return "".join(dev_digits[int(d)] if d.isdigit() else d for d in str(val))

PLANET_ABBR_MAP = {
    "ne": {
        "Sun": "सू", "Moon": "चं", "Mars": "मं", "Mercury": "बु",
        "Jupiter": "बृह", "Venus": "शु", "Saturn": "शनि", "Rahu": "रा", "Ketu": "के",
        "Lagna": "ल"
    },
    "en": {
        "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
        "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke",
        "Lagna": "Asc"
    }
}

PLANET_NAMES_DISPLAY = {
    "ne": {
        "Sun": "सूर्य", "Moon": "चन्द्र", "Mars": "मङ्गल", "Mercury": "बुध",
        "Jupiter": "बृहस्पति", "Venus": "शुक्र", "Saturn": "शनि", "Rahu": "राहु", "Ketu": "केतु"
    },
    "en": {
        "Sun": "Sun", "Moon": "Moon", "Mars": "Mars", "Mercury": "Mercury",
        "Jupiter": "Jupiter", "Venus": "Venus", "Saturn": "Saturn", "Rahu": "Rahu", "Ketu": "Ketu"
    }
}

RASHI_NAMES_EN = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# -------------------------------------------------------------
# २. पारम्परिक बोर्डर एवं फुटर (Regal Borders & Dynamic Footers)
# -------------------------------------------------------------
def draw_page_border(c, page_w, page_h, margin_x=20, margin_y=20):
    """Draws ornamental multi-layer traditional Vedic border."""
    usable_w = page_w - 2 * margin_x
    usable_h = page_h - 2 * margin_y

    c.saveState()
    # Outer Crimson Line
    c.setStrokeColor(colors.HexColor("#9E2A2B"))
    c.setLineWidth(2.2)
    c.rect(margin_x + 5, margin_y + 5, usable_w - 10, usable_h - 10)

    # Middle Gold Line
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1.0)
    c.rect(margin_x + 8, margin_y + 8, usable_w - 16, usable_h - 16)

    # Inner Delicate Line
    c.setStrokeColor(colors.HexColor("#9E2A2B"))
    c.setLineWidth(0.5)
    c.rect(margin_x + 11, margin_y + 11, usable_w - 22, usable_h - 22)

    # Corner Accents (Decorative corner diamonds)
    c.setFillColor(colors.HexColor("#9E2A2B"))
    corner_size = 4
    corners = [
        (margin_x + 8, margin_y + 8),
        (margin_x + usable_w - 8, margin_y + 8),
        (margin_x + 8, margin_y + usable_h - 8),
        (margin_x + usable_w - 8, margin_y + usable_h - 8)
    ]
    for cx, cy in corners:
        p = c.beginPath()
        p.moveTo(cx, cy + corner_size)
        p.lineTo(cx + corner_size, cy)
        p.lineTo(cx, cy - corner_size)
        p.lineTo(cx - corner_size, cy)
        p.close()
        c.drawPath(p, fill=1, stroke=0)

    c.restoreState()

def draw_page_footer(c, page_w, margin_x, margin_y, data, page_num, total_pages=6, lang="ne"):
    """
    Renders standardized institutional footer with Vasistha branding,
    sample website link, used Ayanamsha, logged-in Astrologer name, and page number.
    """
    c.saveState()
    footer_y = margin_y + 14
    c.setFont(FONT_REGULAR, 7.5)
    c.setFillColor(colors.HexColor("#555555"))

    # System & Website
    if lang == "ne":
        sys_info = "प्रणाली: वशिष्ठ ज्योतिष | वेबसाइट: www.basisthajyotish.com"
    else:
        sys_info = "System: Vasistha Jyotish | Web: www.basisthajyotish.com"
    c.drawString(margin_x + 16, footer_y, shape_text(sys_info, FONT_REGULAR, 7.5))

    # Ayanamsha details
    ayan_name = data.get("ayanamsha_name", "लाहिरी (चित्रपक्ष)")
    ayan_dms = data.get("ayanamsha_dms", "२४° १४' ३२''")
    if lang == "ne":
        ayan_info = f"अयनांश: {ayan_name} ({to_dev_num(ayan_dms, lang)})"
    else:
        ayan_info = f"Ayanamsha: {ayan_name} ({ayan_dms})"
    c.drawCentredString(page_w / 2.0, footer_y, shape_text(ayan_info, FONT_REGULAR, 7.5))

    # Astrologer & Page Number
    astro_name = data.get("astrologer_name", "ज्योतिषाचार्य")
    if lang == "ne":
        astro_info = f"ज्योतिषी: {astro_name}  |  पृष्ठ {to_dev_num(page_num, lang)}/{to_dev_num(total_pages, lang)}"
    else:
        astro_info = f"Astrologer: {astro_name}  |  Page {page_num}/{total_pages}"
    c.drawRightString(page_w - margin_x - 16, footer_y, shape_text(astro_info, FONT_REGULAR, 7.5))

    # Subtle top divider
    c.setStrokeColor(colors.HexColor("#D8C3A5"))
    c.setLineWidth(0.5)
    c.line(margin_x + 16, footer_y + 9, page_w - margin_x - 16, footer_y + 9)

    c.restoreState()

# -------------------------------------------------------------
# ३. उत्तर भारतीय कुण्डली चक्र (North Indian Diamond Kundali)
# -------------------------------------------------------------
def draw_north_indian_chart(c, x, y, size, title, house_signs, house_planets, is_mini=False, lang="ne"):
    """
    Renders high-precision North Indian Diamond Chart (चक्र)
    with exact geometric interior centroids to guarantee zero line collisions.
    """
    c.saveState()
    w = size
    h = size

    # Title
    font_title_size = 6.8 if is_mini else 9.5
    c.setFont(FONT_BOLD, font_title_size)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawCentredString(x + w / 2.0, y + h + (2.5 if is_mini else 4.0), shape_text(title, FONT_BOLD, font_title_size))

    # Chart Background
    c.setFillColor(colors.HexColor("#FFFDF7"))
    c.rect(x, y, w, h, fill=1, stroke=0)

    # Outer Border
    c.setStrokeColor(colors.HexColor("#9E2A2B"))
    c.setLineWidth(0.8 if is_mini else 1.2)
    c.rect(x, y, w, h, fill=0, stroke=1)

    # Diagonals
    c.setStrokeColor(colors.HexColor("#9E2A2B"))
    c.setLineWidth(0.5 if is_mini else 0.8)
    c.line(x, y, x + w, y + h)
    c.line(x, y + h, x + w, y)

    # Diamond Rhombus
    mid_x = x + w / 2.0
    mid_y = y + h / 2.0
    c.line(mid_x, y, x + w, mid_y)
    c.line(x + w, mid_y, mid_x, y + h)
    c.line(mid_x, y + h, x, mid_y)
    c.line(x, mid_y, mid_x, y)

    # House coordinates (sign_x, sign_y, planet_x, planet_y)
    # Analytically calibrated centroids within each house boundary
    house_coords = {
        1:  (x + 0.50 * w, y + 0.62 * h, x + 0.50 * w, y + 0.77 * h), # तनु (Top Diamond)
        2:  (x + 0.35 * w, y + 0.85 * h, x + 0.22 * w, y + 0.90 * h), # धन (Top-Left Triangle)
        3:  (x + 0.16 * w, y + 0.66 * h, x + 0.09 * w, y + 0.78 * h), # सहज (Left-Top Triangle)
        4:  (x + 0.38 * w, y + 0.50 * h, x + 0.23 * w, y + 0.50 * h), # सुख (Left Diamond)
        5:  (x + 0.16 * w, y + 0.34 * h, x + 0.09 * w, y + 0.22 * h), # सुत (Left-Bottom Triangle)
        6:  (x + 0.35 * w, y + 0.15 * h, x + 0.22 * w, y + 0.10 * h), # रिपु (Bottom-Left Triangle)
        7:  (x + 0.50 * w, y + 0.38 * h, x + 0.50 * w, y + 0.23 * h), # जाया (Bottom Diamond)
        8:  (x + 0.65 * w, y + 0.15 * h, x + 0.78 * w, y + 0.10 * h), # मृत्यु (Bottom-Right Triangle)
        9:  (x + 0.84 * w, y + 0.34 * h, x + 0.91 * w, y + 0.22 * h), # धर्म (Right-Bottom Triangle)
        10: (x + 0.62 * w, y + 0.50 * h, x + 0.77 * w, y + 0.50 * h), # कर्म (Right Diamond)
        11: (x + 0.84 * w, y + 0.66 * h, x + 0.91 * w, y + 0.78 * h), # आय (Right-Top Triangle)
        12: (x + 0.65 * w, y + 0.85 * h, x + 0.78 * w, y + 0.90 * h), # व्यय (Top-Right Triangle)
    }

    sign_font_size = 5.6 if is_mini else 7.5
    planet_font_size = 5.2 if is_mini else 7.0

    for h_num in range(1, 13):
        coords = house_coords[h_num]
        sign_x, sign_y = coords[0], coords[1]
        planet_x, planet_y = coords[2], coords[3]

        # Draw Rashi sign number
        sign_num = house_signs.get(h_num, "")
        if sign_num:
            c.setFont(FONT_REGULAR, sign_font_size)
            c.setFillColor(colors.HexColor("#A85507"))
            c.drawCentredString(sign_x, sign_y - 2, shape_text(to_dev_num(sign_num, lang), FONT_REGULAR, sign_font_size))

        # Draw Planets in this house
        planets = house_planets.get(h_num, [])
        if planets:
            c.setFont(FONT_BOLD, planet_font_size)
            c.setFillColor(colors.HexColor("#1A365D"))

            if len(planets) == 1:
                c.drawCentredString(planet_x, planet_y - 2.5, shape_text(planets[0], FONT_BOLD, planet_font_size))
            elif len(planets) == 2:
                c.drawCentredString(planet_x, planet_y + (1.2 if is_mini else 2.0), shape_text(planets[0], FONT_BOLD, planet_font_size))
                c.drawCentredString(planet_x, planet_y - (4.8 if is_mini else 6.0), shape_text(planets[1], FONT_BOLD, planet_font_size))
            else:
                line1 = " ".join(planets[:2])
                line2 = " ".join(planets[2:4])
                c.drawCentredString(planet_x, planet_y + (2.0 if is_mini else 3.5), shape_text(line1, FONT_BOLD, planet_font_size))
                c.drawCentredString(planet_x, planet_y - (3.5 if is_mini else 4.5), shape_text(line2, FONT_BOLD, planet_font_size))
                if len(planets) > 4:
                    line3 = " ".join(planets[4:])
                    c.drawCentredString(planet_x, planet_y - (8.5 if is_mini else 11.0), shape_text(line3, FONT_BOLD, planet_font_size))

    c.restoreState()

# -------------------------------------------------------------
# ४. पञ्चधा ग्रहमैत्री चक्र (Panchadha Maitri Calculation)
# -------------------------------------------------------------
NAISARGIKA_MAITRI = {
    "Sun": {"Sun": 0, "Moon": 1, "Mars": 1, "Mercury": 0, "Jupiter": 1, "Venus": -1, "Saturn": -1, "Rahu": -1, "Ketu": -1},
    "Moon": {"Sun": 1, "Moon": 0, "Mars": 0, "Mercury": 1, "Jupiter": 0, "Venus": 0, "Saturn": 0, "Rahu": -1, "Ketu": -1},
    "Mars": {"Sun": 1, "Moon": 1, "Mars": 0, "Mercury": -1, "Jupiter": 1, "Venus": 0, "Saturn": 0, "Rahu": -1, "Ketu": 1},
    "Mercury": {"Sun": 1, "Moon": -1, "Mars": 0, "Mercury": 0, "Jupiter": 0, "Venus": 1, "Saturn": 0, "Rahu": 1, "Ketu": 0},
    "Jupiter": {"Sun": 1, "Moon": 1, "Mars": 1, "Mercury": -1, "Jupiter": 0, "Venus": -1, "Saturn": 0, "Rahu": 0, "Ketu": 0},
    "Venus": {"Sun": -1, "Moon": -1, "Mars": 0, "Mercury": 1, "Jupiter": 0, "Venus": 0, "Saturn": 1, "Rahu": 1, "Ketu": 1},
    "Saturn": {"Sun": -1, "Moon": -1, "Mars": -1, "Mercury": 1, "Jupiter": 0, "Venus": 1, "Saturn": 0, "Rahu": 1, "Ketu": 0},
    "Rahu": {"Sun": -1, "Moon": -1, "Mars": -1, "Mercury": 1, "Jupiter": 0, "Venus": 1, "Saturn": 1, "Rahu": 0, "Ketu": -1},
    "Ketu": {"Sun": -1, "Moon": -1, "Mars": 1, "Mercury": 0, "Jupiter": 0, "Venus": 1, "Saturn": 0, "Rahu": -1, "Ketu": 0},
}

def calculate_panchadha_maitri(planet_rashis: Dict[str, int], lang="ne") -> List[List[str]]:
    """Computes classical 5-fold Panchadha Maitri relationship matrix."""
    planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    labels_ne = {2: "अतिमित्र", 1: "मित्र", 0: "सम", -1: "शत्रु", -2: "अतिशत्रु"}
    labels_en = {2: "Gr.Friend", 1: "Friend", 0: "Neutral", -1: "Enemy", -2: "BitterEn"}

    abbrs = [PLANET_ABBR_MAP[lang][p] for p in planets]
    header = [shape_text("ग्रह", FONT_BOLD, 7.5)] + [shape_text(a, FONT_BOLD, 7.5) for a in abbrs]
    rows = [header]

    for p1 in planets:
        r1 = planet_rashis.get(p1, 1)
        row = [shape_text(PLANET_ABBR_MAP[lang][p1], FONT_BOLD, 7.5)]
        for p2 in planets:
            if p1 == p2:
                row.append(shape_text("—", FONT_REGULAR, 7.5))
                continue
            r2 = planet_rashis.get(p2, 1)
            dist = (r2 - r1) % 12
            tatkalika = 1 if dist in [1, 2, 3, 9, 10, 11] else -1
            naisargika = NAISARGIKA_MAITRI[p1].get(p2, 0)
            score = naisargika + tatkalika
            txt = labels_ne.get(score, "सम") if lang == "ne" else labels_en.get(score, "Neutral")
            row.append(shape_text(txt, FONT_REGULAR, 7.0))
        rows.append(row)

    return rows

# -------------------------------------------------------------
# ५. पृष्ठ १: जातकको सम्पूर्ण विवरण एवं पञ्चाङ्ग (Page 1)
# -------------------------------------------------------------
def build_page_1_native_details(c, page_w, page_h, margin_x, margin_y, data, lang="ne"):
    draw_page_border(c, page_w, page_h, margin_x, margin_y)
    usable_w = page_w - 2 * margin_x

    # Auspicious Invocations (Top Mantras)
    header_top = page_h - margin_y - 28
    c.setFont(FONT_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(margin_x + 36, header_top - 16, shape_text("॥ श्री गणेशाय नमः ॥", FONT_BOLD, 9.5))
    c.drawString(margin_x + 36, header_top - 32, shape_text("॥ श्री सरस्वत्यै नमः ॥", FONT_BOLD, 9.5))
    c.drawRightString(page_w - margin_x - 36, header_top - 16, shape_text("॥ श्री कुलदेवतायै नमः ॥", FONT_BOLD, 9.5))
    c.drawRightString(page_w - margin_x - 36, header_top - 32, shape_text("॥ श्री नवग्रहेभ्यो नमः ॥", FONT_BOLD, 9.5))

    # Center Emblem (ॐ)
    ganesh_y = header_top - 46
    c.setFont(FONT_BOLD, 38)
    c.setFillColor(colors.HexColor("#9E2A2B"))
    c.drawCentredString(page_w / 2.0, ganesh_y + 10, shape_text("ॐ", FONT_BOLD, 38))

    # Title Banner
    title_y = ganesh_y - 22
    c.setFont(FONT_BOLD, 19)
    c.setFillColor(colors.HexColor("#800000"))
    title_text = "॥ अथ जन्मपत्रिका ॥" if lang == "ne" else "|| VEDIC BIRTH HOROSCOPE ||"
    c.drawCentredString(page_w / 2.0, title_y, shape_text(title_text, FONT_BOLD, 19))

    # Classical Shloka Subtitle
    c.setFont(FONT_REGULAR, 8.5)
    c.setFillColor(colors.HexColor("#555555"))
    shloka = "वेदश्चक्षुः क्वचित् ज्ञानं ज्योतिषं शास्त्रमुत्तमम् । जन्मकाले ग्रहा यत्र तत्रायुः शुभाशुभम् ॥" if lang == "ne" else "Veda's Divine Eye: Supreme Science of Time & Planetary Wisdom"
    c.drawCentredString(page_w / 2.0, title_y - 13, shape_text(shloka, FONT_REGULAR, 8.5))

    # (क) जातक विवरण तथा पञ्चाङ्ग तालिका
    table_top = title_y - 28
    p = data
    col1 = [
        ("श्रीमान् / सुश्री", p.get("name", "जातक")),
        ("पिताको नाम", p.get("father_name", "")),
        ("माताको नाम", p.get("mother_name", "")),
        ("जन्म मिति (वि.सं.)", to_dev_num(p.get("date_bs", ""), lang)),
        ("जन्म मिति (ई.सं.)", to_dev_num(p.get("date_ad", ""), lang)),
        ("जन्म समय", to_dev_num(p.get("birth_time", ""), lang)),
        ("जन्म स्थान", p.get("place", "काठमाडौँ")),
        ("अक्षांश / देशान्तर", f"{to_dev_num(p.get('lat', ''), lang)} उ. / {to_dev_num(p.get('lon', ''), lang)} पू."),
    ] if lang == "ne" else [
        ("Native Name", p.get("name", "Native")),
        ("Father's Name", p.get("father_name", "")),
        ("Mother's Name", p.get("mother_name", "")),
        ("Birth Date (B.S.)", p.get("date_bs", "")),
        ("Birth Date (A.D.)", p.get("date_ad", "")),
        ("Birth Time", p.get("birth_time", "")),
        ("Birth Place", p.get("place", "Kathmandu")),
        ("Latitude / Longitude", f"{p.get('lat', '')} N / {p.get('lon', '')} E"),
    ]

    col2 = [
        ("संवत्सर / अयन", f"{p.get('samvatsara', '')} / {p.get('ayana', '')}"),
        ("ऋतु / मास / पक्ष", f"{p.get('ritu', '')} / {p.get('masa', '')} / {p.get('paksha', '')}"),
        ("वार / तिथि", f"{p.get('vaara', '')}वार / {p.get('tithi', '')}"),
        ("नक्षत्र / पाद", f"{p.get('nakshatra', '')} ({to_dev_num(p.get('charan', ''), lang)} चरण)"),
        ("योग / करण", f"{p.get('yoga', '')} / {p.get('karana', '')}"),
        ("सूर्योदय / सूर्यास्त", f"{to_dev_num(p.get('sunrise', ''), lang)} / {to_dev_num(p.get('sunset', ''), lang)}"),
        ("इष्टकाल", f"{to_dev_num(p.get('ishtakaal', ''), lang)} घटी-पला"),
        ("चन्द्र राशि / लग्न", f"{p.get('rashi', '')} / {p.get('lagna', '')}"),
    ] if lang == "ne" else [
        ("Samvatsara / Ayana", f"{p.get('samvatsara', '')} / {p.get('ayana', '')}"),
        ("Season / Month / Paksha", f"{p.get('ritu', '')} / {p.get('masa', '')} / {p.get('paksha', '')}"),
        ("Day / Tithi", f"{p.get('vaara', '')} / {p.get('tithi', '')}"),
        ("Nakshatra / Pada", f"{p.get('nakshatra', '')} (Pada {p.get('charan', '')})"),
        ("Yoga / Karana", f"{p.get('yoga', '')} / {p.get('karana', '')}"),
        ("Sunrise / Sunset", f"{p.get('sunrise', '')} / {p.get('sunset', '')}"),
        ("Ishtakala", f"{p.get('ishtakaal', '')} Ghati-Pala"),
        ("Moon Sign / Ascendant", f"{p.get('rashi', '')} / {p.get('lagna', '')}"),
    ]

    table_rows = []
    for i in range(len(col1)):
        table_rows.append([
            shape_text(col1[i][0] + " :", FONT_BOLD, 9.0),
            shape_text(str(col1[i][1]), FONT_REGULAR, 9.0),
            shape_text(col2[i][0] + " :", FONT_BOLD, 9.0),
            shape_text(str(col2[i][1]), FONT_REGULAR, 9.0)
        ])

    t_info = Table(table_rows, colWidths=[100, 155, 110, 160])
    t_info.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 9.0),
        ('FONTNAME', (0,0), (0,-1), FONT_BOLD),
        ('FONTNAME', (2,0), (2,-1), FONT_BOLD),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (2,0), (2,-1), colors.HexColor("#7A1C1C")),
        ('ALIGN', (0,0), (0,-1), 'RIGHT'),
        ('ALIGN', (1,0), (1,-1), 'LEFT'),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('ALIGN', (3,0), (3,-1), 'LEFT'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, colors.HexColor("#F0E6D8")),
        ('LINEBELOW', (0,-1), (-1,-1), 0.8, colors.HexColor("#D8C3A5")),
    ]))
    t_w, t_h = t_info.wrap(usable_w, 280)
    info_y = table_top - t_h
    t_info.drawOn(c, margin_x + 15, info_y)

    # (ख) अवकहडा चक्र ब्याण्ड (Avakahada Chakra)
    badges_y = info_y - 36
    c.setFillColor(colors.HexColor("#FBF6EE"))
    c.setStrokeColor(colors.HexColor("#D8C3A5"))
    c.roundRect(margin_x + 20, badges_y, usable_w - 40, 24, 4, fill=1, stroke=1)

    if lang == "ne":
        badges_text = f"नामाक्षर: {p.get('namakshar', '')}  |  गण: {p.get('gana', '')}  |  नाडी: {p.get('nadi', '')}  |  योनि: {p.get('yoni', '')}  |  वर्ण: {p.get('varna', '')}  |  वश्य: {p.get('vashya', '')}  |  तारा: {p.get('tara', '')}  |  पाया: {p.get('paya', '')}"
    else:
        badges_text = f"Name Initial: {p.get('namakshar', '')} | Gana: {p.get('gana', '')} | Nadi: {p.get('nadi', '')} | Yoni: {p.get('yoni', '')} | Varna: {p.get('varna', '')} | Paya: {p.get('paya', '')}"
    c.setFont(FONT_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#5C1D1D"))
    c.drawCentredString(page_w / 2.0, badges_y + 8, shape_text(badges_text, FONT_BOLD, 8.5))

    # (ग) मङ्गलाचरण एवं वैदिक शान्ति पाठ (Sacred Benediction)
    bless_top = badges_y - 32
    c.setFont(FONT_BOLD, 11)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawCentredString(page_w / 2.0, bless_top, shape_text("॥ मङ्गलाचरणम् एवं शुभाशीर्वादः ॥", FONT_BOLD, 11))

    c.setFont(FONT_REGULAR, 9.0)
    c.setFillColor(colors.HexColor("#444444"))
    bless_lines = [
        "आयुष्मान् भव, आरोग्यवान् भव, सर्वत्र कीर्तिमान् भव ।",
        "ग्रहाणां शुभदृष्ट्या जातकस्य समग्रजीवनं सुख-शान्ति-समृद्धियुक्तं भवतु ॥",
        "कुलदेवतायाः पितृणां च आशिषा विद्या, बुद्धि, यशः, वैभवश्च उत्तरोत्तरं वर्धन्ताम् ।"
    ] if lang == "ne" else [
        "May divine celestial rays bestow radiant longevity, profound health, and boundless fortune.",
        "May ancestral guardians and benevolent Grahas illumine the path with wisdom and prosperity."
    ]
    cur_y = bless_top - 18
    for line in bless_lines:
        c.drawCentredString(page_w / 2.0, cur_y, shape_text(line, FONT_REGULAR, 9.0))
        cur_y -= 14

    # Official Certification Box on Page 1
    seal_y = cur_y - 60
    c.setFillColor(colors.HexColor("#FDFBF7"))
    c.setStrokeColor(colors.HexColor("#CBB279"))
    c.roundRect(margin_x + 50, seal_y, usable_w - 100, 52, 6, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawCentredString(page_w / 2.0, seal_y + 35, shape_text("॥ वशिष्ठ ज्योतिषीय प्रमाणीकरण ॥", FONT_BOLD, 9.5))

    c.setFont(FONT_REGULAR, 8.5)
    c.setFillColor(colors.HexColor("#333333"))
    astro_name = p.get("astrologer_name", "ज्योतिषाचार्य")
    cert_txt = f"प्रस्तुत जन्मपत्रिका शास्त्रीय गणित एवं पञ्चाङ्ग पद्धतिबाट प्रमाणीकरण गरिएको छ ।  ज्योतिषी: {astro_name}" if lang == "ne" else f"This Horoscope is authentically computed via classical Vedic Siddhantic algorithms. Astrologer: {astro_name}"
    c.drawCentredString(page_w / 2.0, seal_y + 16, shape_text(cert_txt, FONT_REGULAR, 8.5))

    draw_page_footer(c, page_w, margin_x, margin_y, p, page_num=1, total_pages=6, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ६. पृष्ठ २: ग्रहस्पष्ट, पञ्चधा मैत्री चक्र एवं मुख्य कुण्डली (Page 2)
# -------------------------------------------------------------
def build_page_2_grahas_maitri_main_charts(c, page_w, page_h, margin_x, margin_y, data, lang="ne"):
    draw_page_border(c, page_w, page_h, margin_x, margin_y)
    usable_w = page_w - 2 * margin_x

    # Header
    top_y = page_h - margin_y - 28
    c.setFont(FONT_BOLD, 13)
    c.setFillColor(colors.HexColor("#800000"))
    title_text = "॥ ग्रहस्पष्ट तालिका, पञ्चधा मैत्री चक्र एवं मुख्य कुण्डली ॥" if lang == "ne" else "|| PLANETARY POSITIONS, PANCHADHA MAITRI & MAIN CHARTS ||"
    c.drawCentredString(page_w / 2.0, top_y, shape_text(title_text, FONT_BOLD, 13))

    # (क) ग्रह स्पष्ट तालिका (Graha Spashta Table with Chara Karakas)
    graha_top = top_y - 14
    graha_headers = ["ग्रह", "राशि", "अंश:कला:वि.", "नक्षत्र", "पाद", "गति", "अवस्था", "कारक"] if lang == "ne" else ["Planet", "Sign", "Deg:Min:Sec", "Nakshatra", "Pada", "Motion", "Dignity", "Karaka"]
    graha_table_data = [[shape_text(h, FONT_BOLD, 7.5) for h in graha_headers]]

    for row in data.get("graha_spashta", []):
        graha_table_data.append([
            shape_text(row[0], FONT_REGULAR, 7.5),
            shape_text(row[1], FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[2], lang), FONT_REGULAR, 7.5),
            shape_text(row[3], FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[4], lang), FONT_REGULAR, 7.5),
            shape_text(row[5], FONT_REGULAR, 7.5),
            shape_text(row[6], FONT_REGULAR, 7.5),
            shape_text(row[7], FONT_REGULAR, 7.5)
        ])

    t_graha = Table(graha_table_data, colWidths=[40, 52, 62, 60, 24, 34, 40, 36])
    t_graha.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.6),
        ('TOPPADDING', (0,0), (-1,-1), 1.6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))
    g_w, g_h = t_graha.wrap(348, 200)
    g_x = margin_x + 14
    t_graha.drawOn(c, g_x, graha_top - g_h)

    # (ख) पञ्चधा ग्रहमैत्री चक्र (Panchadha Maitri Matrix Table)
    maitri_x = g_x + g_w + 12
    maitri_rows = calculate_panchadha_maitri(data.get("planet_rashis_dict", {}), lang=lang)
    t_maitri = Table(maitri_rows, colWidths=[24] + [22]*7)
    t_maitri.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 6.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('FONTNAME', (0,0), (0,-1), FONT_BOLD),
        ('BACKGROUND', (0,1), (0,-1), colors.HexColor("#F2EAE1")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (1,1), (-1,-1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))
    m_w, m_h = t_maitri.wrap(185, 200)
    t_maitri.drawOn(c, maitri_x, graha_top - m_h)

    # Maitri Legend / Note
    c.setFont(FONT_REGULAR, 6.5)
    c.setFillColor(colors.HexColor("#666666"))
    legend_txt = "पञ्चधा सम्बन्ध: अतिमित्र (+२), मित्र (+१), सम (०), शत्रु (-१), अतिशत्रु (-२)" if lang == "ne" else "Panchadha: Gr.Friend (+2), Friend (+1), Neutral (0), Enemy (-1), BitterEn (-2)"
    c.drawString(maitri_x, graha_top - m_h - 10, shape_text(legend_txt, FONT_REGULAR, 6.5))

    # (ग) दुईवटा मुख्य कुण्डली चक्रहरू (Lagna & Navamsha Charts)
    chart_size = 230
    charts_y = margin_y + 45
    chart_gap = (usable_w - (2 * chart_size)) / 3.0

    c1_x = margin_x + chart_gap
    c2_x = c1_x + chart_size + chart_gap

    t_lagna = "॥ लग्न कुण्डली चक्रम् (D-1) ॥" if lang == "ne" else "|| LAGNA RASHI CHART (D-1) ||"
    t_nav = "॥ नवमांश कुण्डली (D-9) ॥" if lang == "ne" else "|| NAVAMSHA CHART (D-9) ||"

    draw_north_indian_chart(
        c, c1_x, charts_y, chart_size,
        t_lagna,
        data.get("lagna_signs", {}), data.get("lagna_planets", {}),
        is_mini=False, lang=lang
    )
    draw_north_indian_chart(
        c, c2_x, charts_y, chart_size,
        t_nav,
        data.get("navamsha_signs", {}), data.get("navamsha_planets", {}),
        is_mini=False, lang=lang
    )

    draw_page_footer(c, page_w, margin_x, margin_y, data, page_num=2, total_pages=6, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ७. पृष्ठ ३: षोडशवर्ग चक्राणि (16 Divisional Charts Grid - Page 3)
# -------------------------------------------------------------
SHODASHAVARGA_DEFS = [
    ("D1_Rashi", "D-1 लग्न (शरीर/तनु)", "D-1 Lagna (Body)"),
    ("D2_Hora", "D-2 होरा (सम्पत्ति/धन)", "D-2 Hora (Wealth)"),
    ("D3_Drekkana", "D-3 द्रेष्काण (पराक्रम)", "D-3 Drekkana (Courage)"),
    ("D4_Chaturthamsha", "D-4 चतुर्थांश (भाग्य/सुख)", "D-4 Chaturthamsha (Fortune)"),
    ("D7_Saptamamsha", "D-7 सप्तमांश (सन्तान)", "D-7 Saptamamsha (Children)"),
    ("D9_Navamsha", "D-9 नवमांश (दाम्पत्य/धर्म)", "D-9 Navamsha (Spouse)"),
    ("D10_Dashamamsha", "D-10 दशमांश (कर्म/पेशा)", "D-10 Dashamamsha (Career)"),
    ("D12_Dwadasamsha", "D-12 द्वादशांश (मातापिता)", "D-12 Dwadasamsha (Parents)"),
    ("D16_Shodashamsha", "D-16 षोडशांश (वाहन/सुख)", "D-16 Shodashamsha (Vehicles)"),
    ("D20_Vimshamsha", "D-20 विंशांश (उपासना)", "D-20 Vimshamsha (Spirituality)"),
    ("D24_Chaturvimshamsha", "D-24 चतुर्विंशांश (विद्या)", "D-24 Siddhamsa (Learning)"),
    ("D27_Saptavimshamsha", "D-27 सप्तविंशांश (बल)", "D-27 Bhamsa (Strengths)"),
    ("D30_Trimshamsha", "D-30 त्रिंशांश (अरिष्ट)", "D-30 Trimshamsha (Arishta)"),
    ("D40_Khavedamsha", "D-40 खवेदांश (शुभफल)", "D-40 Khavedamsha (Auspicious)"),
    ("D45_Akshavedamsha", "D-45 अक्षवेदांश (संस्कार)", "D-45 Akshavedamsha (Ethics)"),
    ("D60_Shastiamsha", "D-60 षष्ट्यंश (सम्पूर्ण फल)", "D-60 Shashtiamsha (All Matters)"),
]

def build_page_3_shodashavarga(c, page_w, page_h, margin_x, margin_y, data, lang="ne"):
    draw_page_border(c, page_w, page_h, margin_x, margin_y)
    usable_w = page_w - 2 * margin_x

    # Header
    top_y = page_h - margin_y - 26
    c.setFont(FONT_BOLD, 13)
    c.setFillColor(colors.HexColor("#800000"))
    title_text = "॥ षोडशवर्ग चक्राणि (१६ वर्ग कुण्डलीहरू) ॥" if lang == "ne" else "|| SHODASHAVARGA CHARTS (16 DIVISIONAL CHARTS) ||"
    c.drawCentredString(page_w / 2.0, top_y, shape_text(title_text, FONT_BOLD, 13))

    c.setFont(FONT_REGULAR, 7.5)
    c.setFillColor(colors.HexColor("#666666"))
    subtitle = "महर्षि पराशर विरचित षोडशवर्ग विधान अनुसार शरीर, सम्पत्ति, भ्रातृ, भाग्य, सन्तान, दाम्पत्य, कर्म र सम्पूर्ण फल विचार" if lang == "ne" else "Maharishi Parashara's 16 Divisional Charts for Exhaustive Life Spheres Analysis"
    c.drawCentredString(page_w / 2.0, top_y - 11, shape_text(subtitle, FONT_REGULAR, 7.5))

    # 4x4 Chart Grid Layout
    cols = 4
    rows = 4
    chart_w = 124
    chart_h = 124
    start_y = top_y - 25

    h_gap = (usable_w - (cols * chart_w)) / (cols + 1)
    v_gap = 14

    shodash_dict = data.get("shodashavarga_charts", {})

    for idx, (v_key, title_ne, title_en) in enumerate(SHODASHAVARGA_DEFS):
        r = idx // cols
        col = idx % cols

        ch_x = margin_x + h_gap + col * (chart_w + h_gap)
        ch_y = start_y - (r + 1) * chart_h - r * v_gap

        chart_data = shodash_dict.get(v_key, {})
        h_signs = chart_data.get("signs", {})
        h_planets = chart_data.get("planets", {})
        title_disp = title_ne if lang == "ne" else title_en

        draw_north_indian_chart(
            c, ch_x, ch_y, chart_w,
            title_disp,
            h_signs, h_planets,
            is_mini=True, lang=lang
        )

    draw_page_footer(c, page_w, margin_x, margin_y, data, page_num=3, total_pages=6, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ८. पृष्ठ ४: विंशोत्तरी, त्रिभागी एवं योगिनी महादशान्तर्दशा (Page 4)
# -------------------------------------------------------------
def build_page_4_three_dashas(c, page_w, page_h, margin_x, margin_y, data, lang="ne"):
    draw_page_border(c, page_w, page_h, margin_x, margin_y)
    usable_w = page_w - 2 * margin_x

    # Header
    top_y = page_h - margin_y - 26
    c.setFont(FONT_BOLD, 13)
    c.setFillColor(colors.HexColor("#800000"))
    title_text = "॥ त्रिविध महादशा एवं अन्तर्दशा तालिका (विंशोत्तरी, त्रिभागी, योगिनी) ॥" if lang == "ne" else "|| THREE DASHA SYSTEMS: VIMSHOTTARI, TRIBHAGI & YOGINI ||"
    c.drawCentredString(page_w / 2.0, top_y, shape_text(title_text, FONT_BOLD, 13))

    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#666666"))
    sub_txt = "मानव जीवनका विभिन्न कालखण्डमा ग्रह तथा योगिनीहरूको शुभाशुभ प्रभाव निरूपण" if lang == "ne" else "Timing of Celestial Influences across 120y, 80y and 36y Planetary Periods"
    c.drawCentredString(page_w / 2.0, top_y - 11, shape_text(sub_txt, FONT_REGULAR, 7.8))

    content_top = top_y - 24
    table_w = (usable_w - 20) / 3.0

    # 1. विंशोत्तरी महादशा तालिका (Vimshottari Dasha - 120y)
    v_headers = ["विंशोत्तरी", "अवधि", "समाप्ति (वि.सं.)"] if lang == "ne" else ["Vimshottari", "Duration", "End Date"]
    v_data = [[shape_text(h, FONT_BOLD, 7.5) for h in v_headers]]
    for row in data.get("vimshottari_rows", []):
        v_data.append([
            shape_text(row[0], FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[1], lang), FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[2], lang), FONT_REGULAR, 7.5)
        ])
    t_v = Table(v_data, colWidths=[table_w * 0.35, table_w * 0.28, table_w * 0.37])
    t_v.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))
    v_w, v_h = t_v.wrap(table_w, 280)
    x1 = margin_x + 5
    t_v.drawOn(c, x1, content_top - v_h)

    # 2. त्रिभागी महादशा तालिका (Tribhagi Dasha - 80y)
    tr_headers = ["त्रिभागी (८०)", "अवधि", "समाप्ति (वि.सं.)"] if lang == "ne" else ["Tribhagi (80y)", "Duration", "End Date"]
    tr_data = [[shape_text(h, FONT_BOLD, 7.5) for h in tr_headers]]
    for row in data.get("tribhagi_rows", []):
        tr_data.append([
            shape_text(row[0], FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[1], lang), FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[2], lang), FONT_REGULAR, 7.5)
        ])
    t_tr = Table(tr_data, colWidths=[table_w * 0.35, table_w * 0.28, table_w * 0.37])
    t_tr.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))
    tr_w, tr_h = t_tr.wrap(table_w, 280)
    x2 = x1 + table_w + 5
    t_tr.drawOn(c, x2, content_top - tr_h)

    # 3. योगिनी महादशा तालिका (Yogini Dasha - 36y)
    y_headers = ["योगिनी (३६)", "अवधि", "समाप्ति (वि.सं.)"] if lang == "ne" else ["Yogini (36y)", "Duration", "End Date"]
    y_data = [[shape_text(h, FONT_BOLD, 7.5) for h in y_headers]]
    for row in data.get("yogini_rows", []):
        y_data.append([
            shape_text(row[0], FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[1], lang), FONT_REGULAR, 7.5),
            shape_text(to_dev_num(row[2], lang), FONT_REGULAR, 7.5)
        ])
    t_y = Table(y_data, colWidths=[table_w * 0.35, table_w * 0.28, table_w * 0.37])
    t_y.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))
    y_w, y_h = t_y.wrap(table_w, 280)
    x3 = x2 + table_w + 5
    t_y.drawOn(c, x3, content_top - y_h)

    # (ख) विस्तृत अन्तर्दशा विवरण खण्ड (Detailed Sub-Period Antardasha Section)
    sub_top = content_top - max(v_h, tr_h, y_h) - 18
    c.setFont(FONT_BOLD, 10.5)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawString(margin_x + 10, sub_top, shape_text("॥ विंशोत्तरी एवं त्रिभागी सक्रिय अन्तर्दशा विस्तार (Antardasha Breakdown) ॥", FONT_BOLD, 10.5))

    sub_headers = ["महादशेश", "अन्तर्दशेश", "प्रारम्भ मिति", "समाप्ति मिति", "अवधि (महिना)"] if lang == "ne" else ["Mahadasha", "Antardasha", "Start Date", "End Date", "Months"]
    sub_data = [[shape_text(h, FONT_BOLD, 7.5) for h in sub_headers]]

    for s_row in data.get("antardasha_breakdown", []):
        sub_data.append([
            shape_text(s_row[0], FONT_REGULAR, 7.5),
            shape_text(s_row[1], FONT_REGULAR, 7.5),
            shape_text(to_dev_num(s_row[2], lang), FONT_REGULAR, 7.5),
            shape_text(to_dev_num(s_row[3], lang), FONT_REGULAR, 7.5),
            shape_text(to_dev_num(s_row[4], lang), FONT_REGULAR, 7.5),
        ])

    t_sub = Table(sub_data, colWidths=[90, 95, 125, 125, 95])
    t_sub.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#800000")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.0),
        ('TOPPADDING', (0,0), (-1,-1), 2.0),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))
    s_w, s_h = t_sub.wrap(usable_w, 240)
    t_sub.drawOn(c, margin_x + 10, sub_top - 12 - s_h)

    draw_page_footer(c, page_w, margin_x, margin_y, data, page_num=4, total_pages=6, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ९. पृष्ठ ५: विशेष फलादेश (भाग - १: मुख्य, व्यापार, विदेश, परिवार, शिक्षा) (Page 5)
# -------------------------------------------------------------
def build_page_5_predictions_part1(c, page_w, page_h, margin_x, margin_y, data, lang="ne"):
    draw_page_border(c, page_w, page_h, margin_x, margin_y)
    usable_w = page_w - 2 * margin_x

    # Header
    top_y = page_h - margin_y - 26
    c.setFont(FONT_BOLD, 13)
    c.setFillColor(colors.HexColor("#800000"))
    title_text = "॥ जन्मपत्रिका विशेष फलादेश (भाग - १) ॥" if lang == "ne" else "|| SPECIAL HOROSCOPE PREDICTIONS (PART - 1) ||"
    c.drawCentredString(page_w / 2.0, top_y, shape_text(title_text, FONT_BOLD, 13))

    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#666666"))
    sub_txt = "लग्न, दशम (कर्म), द्वादश (विदेश), चतुर्थ/सप्तम (परिवार/दाम्पत्य) एवं पञ्चम (शिक्षा/धर्म) भावको शास्त्रीय विवेचना" if lang == "ne" else "Synthesized Predictive Analysis of Ascendant, Career, Foreign Prospects, Family & Education"
    c.drawCentredString(page_w / 2.0, top_y - 11, shape_text(sub_txt, FONT_REGULAR, 7.8))

    preds = data.get("predictions", {})

    # Helper function to draw an interpretation card box
    cur_y = top_y - 28

    def draw_prediction_card(box_title, content_text, box_height):
        nonlocal cur_y
        c.saveState()
        # Card Background
        c.setFillColor(colors.HexColor("#FFFDF9"))
        c.setStrokeColor(colors.HexColor("#D8C3A5"))
        c.roundRect(margin_x + 10, cur_y - box_height, usable_w - 20, box_height, 4, fill=1, stroke=1)

        # Header ribbon
        c.setFillColor(colors.HexColor("#F5EBE1"))
        c.roundRect(margin_x + 10, cur_y - 20, usable_w - 20, 20, 4, fill=1, stroke=0)
        c.setStrokeColor(colors.HexColor("#D8C3A5"))
        c.line(margin_x + 10, cur_y - 20, margin_x + usable_w - 10, cur_y - 20)

        # Title
        c.setFont(FONT_BOLD, 9.0)
        c.setFillColor(colors.HexColor("#7A1C1C"))
        c.drawString(margin_x + 20, cur_y - 14, shape_text(box_title, FONT_BOLD, 9.0))

        # Body text with word wrap
        c.setFont(FONT_REGULAR, 8.5)
        c.setFillColor(colors.HexColor("#2B2B2B"))

        words = content_text.split()
        lines = []
        cur_line = []
        max_chars = 95
        for w in words:
            if len(" ".join(cur_line + [w])) <= max_chars:
                cur_line.append(w)
            else:
                lines.append(" ".join(cur_line))
                cur_line = [w]
        if cur_line:
            lines.append(" ".join(cur_line))

        text_y = cur_y - 34
        for l in lines[:5]:
            c.drawString(margin_x + 22, text_y, shape_text(l, FONT_REGULAR, 8.5))
            text_y -= 13

        c.restoreState()
        cur_y -= (box_height + 12)

    # 1. मुख्य फलादेश
    t1 = "१. मुख्य फलादेश (समग्र व्यक्तित्व, स्वभाव, शारीरिक स्वास्थ्य एवं जीवन दिशा)" if lang == "ne" else "1. Core Life Analysis (Personality, Constitution & Vitality)"
    draw_prediction_card(t1, preds.get("general", ""), 92)

    # 2. व्यापार तथा आजीविका फलादेश
    t2 = "२. व्यापार तथा आजीविका फलादेश (पेशा, व्यापार, नोकरी, धनसम्पत्ति एवं सफलता)" if lang == "ne" else "2. Career, Business & Wealth (Professional Trajectory & Prosperity)"
    draw_prediction_card(t2, preds.get("business", ""), 84)

    # 3. विदेश यात्रा तथा बसोबास फलादेश
    t3 = "३. विदेश यात्रा तथा वैदेशिक बसोबास फलादेश (विदेश गमन, अध्ययन र बसोबास योग)" if lang == "ne" else "3. Foreign Travel & Settlement (Overseas Opportunities & Global Mobility)"
    draw_prediction_card(t3, preds.get("foreign", ""), 84)

    # 4. पारिवारिक विवरण तथा वैवाहिक फलादेश
    t4 = "४. पारिवारिक जीवन तथा दाम्पत्य फलादेश (गृहसुख, विवाह, जीवनसाथी र सन्तान)" if lang == "ne" else "4. Family, Marriage & Lineage (Domestic Harmony & Progeny)"
    draw_prediction_card(t4, preds.get("family", ""), 84)

    # 5. शिक्षादीक्षा र धर्मकर्म फलादेश
    t5 = "५. शिक्षादीक्षा र धर्मकर्म सम्बन्धी विशेष फलादेश (विद्या-बुद्धि, आध्यात्मिक साधना र कुलधर्म)" if lang == "ne" else "5. Higher Education & Spiritual Pursuits (Knowledge, Wisdom & Divine Grace)"
    draw_prediction_card(t5, preds.get("education", ""), 84)

    draw_page_footer(c, page_w, margin_x, margin_y, data, page_num=5, total_pages=6, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# १०. पृष्ठ ६: महादशा फलादेश, शुभ रत्न एवं प्रमाणीकरण (Page 6)
# -------------------------------------------------------------
def build_page_6_predictions_part2(c, page_w, page_h, margin_x, margin_y, data, lang="ne"):
    draw_page_border(c, page_w, page_h, margin_x, margin_y)
    usable_w = page_w - 2 * margin_x

    # Header
    top_y = page_h - margin_y - 26
    c.setFont(FONT_BOLD, 13)
    c.setFillColor(colors.HexColor("#800000"))
    title_text = "॥ महादशा फलादेश, शुभ रत्न, रुद्राक्ष एवं प्रमाणीकरण (भाग - २) ॥" if lang == "ne" else "|| MAHADASHA PREDICTIONS, REMEDIES & CERTIFICATION ||"
    c.drawCentredString(page_w / 2.0, top_y, shape_text(title_text, FONT_BOLD, 13))

    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#666666"))
    sub_txt = "नवग्रह महादशा फल, शुभ रत्न, रुद्राक्ष, मन्त्र साधना र ज्योतिषीको आधिकारिक परामर्श" if lang == "ne" else "Planetary Mahadasha Effects, Astrological Gemstones, Rudraksha & Certification"
    c.drawCentredString(page_w / 2.0, top_y - 11, shape_text(sub_txt, FONT_REGULAR, 7.8))

    preds = data.get("predictions", {})
    dasha_dict = preds.get("dasha_predictions", {})

    # (क) ९ ग्रह महादशा फल सारांश तालिका (All 9 Mahadasha Interpretations)
    dasha_top = top_y - 25
    c.setFont(FONT_BOLD, 10)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawString(margin_x + 12, dasha_top, shape_text("॥ नवग्रह महादशा फल सारांश (Vedic Mahadasha Effects) ॥", FONT_BOLD, 10))

    d_headers = ["महादशा", "शास्त्रीय फल तथा निर्देश"] if lang == "ne" else ["Mahadasha", "Classical Effects & Guidance"]
    d_rows = [[shape_text(h, FONT_BOLD, 7.5) for h in d_headers]]

    for p_key in ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"]:
        p_disp = PLANET_NAMES_DISPLAY[lang].get(p_key, p_key)
        d_text = dasha_dict.get(p_key, "")
        d_rows.append([
            shape_text(p_disp, FONT_BOLD, 7.5),
            shape_text(d_text, FONT_REGULAR, 7.5)
        ])

    t_dasha_phala = Table(d_rows, colWidths=[70, usable_w - 94])
    t_dasha_phala.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (1,0), (1,-1), 'LEFT'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
        ('TOPPADDING', (0,0), (-1,-1), 2.2),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]))
    dp_w, dp_h = t_dasha_phala.wrap(usable_w - 24, 300)
    t_dasha_phala.drawOn(c, margin_x + 12, dasha_top - 10 - dp_h)

    # (ख) शुभ रत्न, रुद्राक्ष एवं ग्रह शान्ति उपाय (Benefic Gemstones & Remedies)
    rem_top = dasha_top - 10 - dp_h - 16
    remedies = preds.get("remedies", {})

    c.setFont(FONT_BOLD, 10)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawString(margin_x + 12, rem_top, shape_text("॥ शुभ रत्न, रुद्राक्ष एवं मन्त्र साधना (Auspicious Remedies) ॥", FONT_BOLD, 10))

    rem_headers = ["जीवनरत्न (Life Stone)", "भाग्यरत्न (Fortune Stone)", "शुभ रुद्राक्ष (Rudraksha)", "दैनिक मन्त्र (Daily Mantra)"] if lang == "ne" else ["Life Stone", "Fortune Stone", "Rudraksha", "Daily Mantra"]
    rem_row = [
        shape_text(remedies.get("stone", ""), FONT_BOLD, 8.0),
        shape_text(remedies.get("sub_stone", ""), FONT_REGULAR, 8.0),
        shape_text(remedies.get("rudraksha", ""), FONT_REGULAR, 8.0),
        shape_text(remedies.get("mantra", ""), FONT_BOLD, 8.0)
    ]
    t_rem = Table([[shape_text(h, FONT_BOLD, 7.5) for h in rem_headers], rem_row], colWidths=[usable_w * 0.25 - 6]*4)
    t_rem.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#5C1D1D")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FDFBF7")]),
    ]))
    rem_w, rem_h = t_rem.wrap(usable_w - 24, 70)
    t_rem.drawOn(c, margin_x + 12, rem_top - 10 - rem_h)

    # (ग) ज्योतिषाचार्य प्रमाणीकरण एवं आधिकारिक हस्ताक्षर खण्ड (Astrologer Certification Box)
    sign_box_top = rem_top - 10 - rem_h - 16
    sign_box_h = 74
    c.setFillColor(colors.HexColor("#FFFDF7"))
    c.setStrokeColor(colors.HexColor("#9E2A2B"))
    c.roundRect(margin_x + 12, sign_box_top - sign_box_h, usable_w - 24, sign_box_h, 6, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawString(margin_x + 24, sign_box_top - 16, shape_text("॥ ज्योतिषाचार्य प्रमाणीकरण एवं परामर्श टिप्पणी ॥", FONT_BOLD, 9.5))

    c.setFont(FONT_REGULAR, 8.0)
    c.setFillColor(colors.HexColor("#444444"))
    note_txt = "प्रस्तुत जन्मपत्रिका महर्षि पराशर विरचित वृहत्पाराशर होराशास्त्र एवं मानसागरी ग्रन्थको सिद्धान्त अनुसार तयार गरिएको हो। जातकको कर्म, काल र परिस्थितिको अनुकूलताबाट भाग्य वृद्धि हुनेछ।" if lang == "ne" else "This Janmapatrika is mathematically formulated based on Brihat Parashara Hora Shastra and Mansagari principles."
    c.drawString(margin_x + 24, sign_box_top - 32, shape_text(note_txt, FONT_REGULAR, 8.0))

    astro_name = data.get("astrologer_name", "ज्योतिषाचार्य")
    c.setFont(FONT_BOLD, 8.5)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawString(margin_x + 24, sign_box_top - 54, shape_text(f"तयार पार्ने / प्रमाणित गर्ने: {astro_name}", FONT_BOLD, 8.5))
    c.drawRightString(page_w - margin_x - 36, sign_box_top - 54, shape_text("हस्ताक्षर / कार्यालय छाप: .......................................", FONT_REGULAR, 8.0))

    draw_page_footer(c, page_w, margin_x, margin_y, data, page_num=6, total_pages=6, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ११. मुख्य चिना PDF निर्माण प्रकार्य (Multi-Page Builder)
# -------------------------------------------------------------
def build_cheena_pdf(output_stream_or_path, data: Dict[str, Any], border_path: Optional[str] = None, ganesh_path: Optional[str] = None):
    """
    Builds the complete 6-page royal Vedic Janmapatrika PDF:
    - Page 1: Native Details, Panchanga, Avakahada Chakra
    - Page 2: Graha Spashta, Panchadha Maitri, Lagna & Navamsha Charts
    - Page 3: Shodashavarga (16 Divisional Charts in a 4x4 Grid)
    - Page 4: Vimshottari, Tribhagi, Yogini Mahadashas & Antardashas
    - Page 5: Comprehensive Predictions Part 1 (Career, Foreign, Family, Education)
    - Page 6: Comprehensive Predictions Part 2 (Mahadashas, Gemstones, Remedies, Astrologer Certification)
    """
    setup_fonts()
    page_w, page_h = A4
    c = canvas.Canvas(output_stream_or_path, pagesize=A4)
    lang = data.get("language", "ne")
    doc_title = f"जन्मपत्रिका - {data.get('name', 'जातक')}" if lang == "ne" else f"Janmapatrika - {data.get('name', 'Native')}"
    c.setTitle(doc_title)

    margin_x = 20
    margin_y = 20

    # Build all 6 pages systematically
    build_page_1_native_details(c, page_w, page_h, margin_x, margin_y, data, lang=lang)
    build_page_2_grahas_maitri_main_charts(c, page_w, page_h, margin_x, margin_y, data, lang=lang)
    build_page_3_shodashavarga(c, page_w, page_h, margin_x, margin_y, data, lang=lang)
    build_page_4_three_dashas(c, page_w, page_h, margin_x, margin_y, data, lang=lang)
    build_page_5_predictions_part1(c, page_w, page_h, margin_x, margin_y, data, lang=lang)
    build_page_6_predictions_part2(c, page_w, page_h, margin_x, margin_y, data, lang=lang)

    c.save()

# -------------------------------------------------------------
# १२. कुण्डली गणनाबाट Cheena Data स्वतः तयार गर्ने प्रकार्य
# -------------------------------------------------------------
NAKSHATRA_NAMAKSHARA = [
    ["चू", "चे", "चो", "ला"], ["ली", "लू", "ले", "लो"], ["अ", "ई", "उ", "ए"],
    ["ओ", "वा", "वी", "वू"],  ["वे", "वो", "का", "की"], ["कू", "घ", "ङ", "छ"],
    ["के", "को", "हा", "ही"], ["हू", "हे", "हो", "डा"], ["डी", "डू", "डे", "डो"],
    ["मा", "मी", "मू", "मे"], ["मो", "टा", "टी", "टू"], ["टे", "टो", "पा", "पी"],
    ["पू", "ष", "ण", "ठ"],    ["पे", "पो", "रा", "री"], ["रू", "रे", "रो", "ता"],
    ["ती", "तू", "ते", "तो"], ["ना", "नी", "नू", "ने"], ["नो", "या", "यी", "यू"],
    ["ये", "यो", "भा", "भी"], ["भू", "धा", "फा", "ढा"], ["भे", "भो", "जा", "जी"],
    ["खी", "खू", "खे", "खो"], ["गा", "गी", "गू", "गे"], ["गो", "सा", "सी", "सू"],
    ["से", "सो", "दा", "दी"], ["दू", "थ", "झ", "ञ"],   ["दे", "दो", "चा", "ची"]
]

NAKSHATRA_GANA = [
    "देव", "मनुष्य", "राक्षस", "मनुष्य", "देव", "मनुष्य", "देव", "देव", "राक्षस",
    "राक्षस", "मनुष्य", "मनुष्य", "देव", "राक्षस", "देव", "राक्षस", "देव", "राक्षस",
    "राक्षस", "मनुष्य", "मनुष्य", "देव", "राक्षस", "राक्षस", "मनुष्य", "मनुष्य", "देव"
]

NAKSHATRA_NADI = [
    "आद्य", "मध्य", "अन्त्य", "अन्त्य", "मध्य", "आद्य", "आद्य", "मध्य", "अन्त्य",
    "आद्य", "मध्य", "अन्त्य", "अन्त्य", "मध्य", "आद्य", "आद्य", "मध्य", "अन्त्य",
    "आद्य", "मध्य", "अन्त्य", "अन्त्य", "मध्य", "आद्य", "आद्य", "मध्य", "अन्त्य"
]

NAKSHATRA_YONI = [
    "अश्व", "गज", "मेष", "सर्प", "सर्प", "श्वान",
    "मार्जार", "मेष", "मार्जार", "मूषक", "मूषक", "गौ",
    "महिष", "व्याघ्र", "महिष", "व्याघ्र", "मृग", "मृग",
    "श्वान", "वानर", "नकुल", "वानर", "सिंह", "अश्व",
    "सिंह", "गौ", "गज"
]

RASHI_VARNA = [
    "क्षत्रिय", "वैश्य", "शूद्र", "ब्राह्मण",
    "क्षत्रिय", "वैश्य", "शूद्र", "ब्राह्मण",
    "क्षत्रिय", "वैश्य", "शूद्र", "ब्राह्मण"
]

RASHI_VASHYA = [
    "चतुष्पद", "चतुष्पद", "द्विपद", "जलचर",
    "वनचर", "द्विपद", "द्विपद", "कीट",
    "द्विपद", "चतुष्पद", "द्विपद", "जलचर"
]

SAMVATSARA_60 = [
    "प्रभव", "विभव", "शुक्ल", "प्रमोद", "प्रजापति", "अङ्गिरा", "श्रीमुख", "भाव", "युवा", "धाता",
    "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृषप्रजा", "चित्रभानु", "सुभानु", "तारण", "पार्थिव", "व्यय",
    "सर्वजित्", "सर्वधारी", "विरोधी", "विकृति", "खर", "नन्दन", "विजय", "जय", "मन्मथ", "दुर्मुख",
    "हेमलम्ब", "विलम्ब", "विकारी", "शार्वरी", "प्लव", "शुभकृत", "शोभन", "क्रोधन", "विश्वावसु", "पराभव",
    "प्लवङ्ग", "कीलक", "सौम्य", "साधारण", "विरोधकृत", "परिधावी", "प्रमादी", "आनन्द", "राक्षस", "नल",
    "पिङ्गल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुन्दुभी", "रुधिरोद्गारी", "रक्ताक्ष", "क्रोधन", "क्षय"
]

CLASSICAL_NAVAGRAHA = [
    ("Sun", 0, "सूर्य", "सू"),
    ("Moon", 1, "चन्द्र", "चं"),
    ("Mars", 4, "मङ्गल", "मं"),
    ("Mercury", 2, "बुध", "बु"),
    ("Jupiter", 5, "बृहस्पति", "बृह"),
    ("Venus", 3, "शुक्र", "शु"),
    ("Saturn", 6, "शनि", "शनि"),
    ("Rahu", 10, "राहु", "रा"),
    ("Ketu", 11, "केतु", "के"),
]

CHARA_KARAKA_NAMES = ["आत्मकारक", "अमात्यकारक", "भ्रातृकारक", "मातृकारक", "पुत्रकारक", "ज्ञातिकारक", "दारककारक"]
CHARA_KARAKA_NAMES_EN = ["Atmakaraka", "Amatyakaraka", "Bhratrikaraka", "Matrikaraka", "Putrakaraka", "Gnatikaraka", "Darakaraka"]

def prepare_cheena_data_from_birth(
    year: int, month: int, day: int,
    hour: int, minute: int, second: float = 0.0,
    latitude: float = 27.7172, longitude: float = 85.3240, timezone_offset: float = 5.75,
    ayanamsha: str = "LAHIRI", house_system: str = "P",
    name: str = "जातक", father_name: str = "", mother_name: str = "",
    place: str = "काठमाडौँ", date_bs: str = "",
    astrologer_name: str = "वशिष्ठ ज्योतिषी", language: str = "ne"
) -> Dict[str, Any]:
    """
    Computes complete data dictionary required for multi-page Cheena PDF generation.
    """
    jd = get_julian_day(year, month, day, hour, minute, second, timezone_offset)
    ayan_val = get_ayanamsha_value(jd, ayanamsha)

    # 1. Lagna & Houses
    lagna_lon, cusps = calc_lagna_and_houses(jd, latitude, longitude, house_system, ayan_val)
    lagna_rashi_idx = int(lagna_lon / 30.0) # 0 to 11
    lagna_rashi_id = lagna_rashi_idx + 1

    # North Indian Lagna Chart signs & planets
    lagna_signs = {h: ((lagna_rashi_id - 1 + (h - 1)) % 12) + 1 for h in range(1, 13)}
    lagna_planets = {h: [] for h in range(1, 13)}

    # All Vargas for Lagna
    div_lagna = get_all_vargas_for_longitude(lagna_lon)
    nav_lagna_rashi_id = div_lagna.get("D9_Navamsha", 1)
    navamsha_signs = {h: ((nav_lagna_rashi_id - 1 + (h - 1)) % 12) + 1 for h in range(1, 13)}
    navamsha_planets = {h: [] for h in range(1, 13)}

    # 2. Planetary positions & Vargas
    graha_spashta = []
    moon_lon = 0.0
    sun_lon, _ = calc_planet_position(jd, 0, ayan_val)

    planet_rashis_dict = {}
    div_planets = {}
    planet_degs_for_karaka = []

    for p_key, p_id, p_name_ne, p_abbr_ne in CLASSICAL_NAVAGRAHA:
        p_lon, p_speed = calc_planet_position(jd, p_id, ayan_val)
        if p_key == "Moon":
            moon_lon = p_lon

        p_deg, p_min, p_sec = get_dms(p_lon % 30.0)
        p_rashi_idx = int(p_lon / 30.0)
        p_rashi_id = p_rashi_idx + 1
        planet_rashis_dict[p_key] = p_rashi_id

        p_nak_idx = int(p_lon / (360.0 / 27.0))
        p_pada = int((p_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
        p_pada = min(4, max(1, p_pada))

        div_p = get_all_vargas_for_longitude(p_lon)
        div_planets[p_key] = div_p

        # Lagna chart placement
        p_house = ((p_rashi_id - lagna_rashi_id) % 12) + 1
        abbr = PLANET_ABBR_MAP[language][p_key]
        if p_speed < 0 and p_id not in [10, 11]:
            abbr_disp = f"{abbr}(व)" if language == "ne" else f"{abbr}(R)"
        else:
            abbr_disp = abbr
        lagna_planets[p_house].append(abbr_disp)

        # Navamsha placement
        p_d9_rashi = div_p.get("D9_Navamsha", 1)
        p_nav_house = ((p_d9_rashi - nav_lagna_rashi_id) % 12) + 1
        navamsha_planets[p_nav_house].append(abbr)

        # Dignity (Avastha)
        own_signs = {0: [4], 1: [3], 4: [0, 7], 2: [2, 5], 5: [8, 11], 3: [1, 6], 6: [9, 10], 10: [], 11: []}
        exalt_signs = {0: 0, 1: 1, 4: 9, 2: 5, 5: 3, 3: 11, 6: 6, 10: 1, 11: 7}
        deb_signs = {0: 6, 1: 7, 4: 3, 2: 11, 5: 9, 3: 5, 6: 0, 10: 7, 11: 1}

        if p_rashi_idx == exalt_signs.get(p_id, -1):
            avastha = "उच्च" if language == "ne" else "Exalted"
        elif p_rashi_idx == deb_signs.get(p_id, -1):
            avastha = "नीच" if language == "ne" else "Debilitated"
        elif p_rashi_idx in own_signs.get(p_id, []):
            avastha = "स्वक्षेत्री" if language == "ne" else "Own Sign"
        else:
            avastha = "सम/मित्र" if language == "ne" else "Neutral"

        motion = ("वक्री" if p_speed < 0 and p_id not in [10, 11] else "मार्गी") if language == "ne" else ("Retrograde" if p_speed < 0 and p_id not in [10, 11] else "Direct")
        dms_clean = f"{p_deg:02d}:{p_min:02d}:{int(p_sec):02d}"

        p_name_disp = PLANET_NAMES_DISPLAY[language][p_key]
        rashi_name_disp = RASHI_NAMES_NE[p_rashi_idx].split()[0] if language == "ne" else RASHI_NAMES_EN[p_rashi_idx]
        nak_name_disp = NAKSHATRA_NAMES_NE[p_nak_idx].split()[0] if language == "ne" else NAKSHATRA_NAMES_NE[p_nak_idx].split()[0]

        graha_spashta.append({
            "key": p_key,
            "name": p_name_disp,
            "rashi": rashi_name_disp,
            "dms": dms_clean,
            "nakshatra": nak_name_disp,
            "pada": str(p_pada),
            "motion": motion,
            "avastha": avastha,
            "deg_in_sign": p_lon % 30.0
        })

        if p_key in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
            planet_degs_for_karaka.append((p_lon % 30.0, p_key))

    # Chara Karakas (Sort 7 planets by descending degree in sign)
    planet_degs_for_karaka.sort(key=lambda x: x[0], reverse=True)
    karaka_map = {}
    for i, (_, p_k) in enumerate(planet_degs_for_karaka):
        k_name = CHARA_KARAKA_NAMES[i] if language == "ne" else CHARA_KARAKA_NAMES_EN[i]
        karaka_map[p_k] = k_name

    graha_spashta_rows = []
    for g in graha_spashta:
        k = karaka_map.get(g["key"], "—")
        graha_spashta_rows.append([
            g["name"], g["rashi"], g["dms"], g["nakshatra"], g["pada"], g["motion"], g["avastha"], k
        ])

    # 3. 16 Shodashavarga Charts pre-calculation
    shodashavarga_charts = {}
    for v_key, _, _ in SHODASHAVARGA_DEFS:
        v_lagna = div_lagna.get(v_key, 1)
        v_signs = {h: ((v_lagna - 1 + (h - 1)) % 12) + 1 for h in range(1, 13)}
        v_planets = {h: [] for h in range(1, 13)}

        for p_key, _, _, _ in CLASSICAL_NAVAGRAHA:
            p_v_sign = div_planets[p_key].get(v_key, 1)
            p_v_house = ((p_v_sign - v_lagna) % 12) + 1
            v_planets[p_v_house].append(PLANET_ABBR_MAP[language][p_key])

        shodashavarga_charts[v_key] = {
            "lagna_sign": v_lagna,
            "signs": v_signs,
            "planets": v_planets
        }

    # 4. Panchang Calculation
    panchang = get_panchang(year, month, day, latitude, longitude, timezone_offset, hour, minute, int(second))
    m_rashi_idx = int(moon_lon / 30.0)
    m_nak_idx = int(moon_lon / (360.0 / 27.0))
    m_pada = int((moon_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
    m_pada = min(4, max(1, m_pada))

    # Avakahada Details
    namakshar = NAKSHATRA_NAMAKSHARA[m_nak_idx][m_pada - 1]
    gana = NAKSHATRA_GANA[m_nak_idx]
    nadi = NAKSHATRA_NADI[m_nak_idx]
    yoni = NAKSHATRA_YONI[m_nak_idx]
    varna = RASHI_VARNA[m_rashi_idx]
    vashya = RASHI_VASHYA[m_rashi_idx]
    tara = "साधक / शुभ" if language == "ne" else "Auspicious"

    moon_house_from_lagna = ((m_rashi_idx - lagna_rashi_idx + 12) % 12) + 1
    if moon_house_from_lagna in [1, 6, 11]:
        paya = "स्वर्ण" if language == "ne" else "Gold"
    elif moon_house_from_lagna in [2, 5, 9]:
        paya = "रजत" if language == "ne" else "Silver"
    elif moon_house_from_lagna in [3, 7, 10]:
        paya = "ताम्र" if language == "ne" else "Copper"
    else:
        paya = "लौह" if language == "ne" else "Iron"

    # 5. Dasha Systems: Vimshottari, Tribhagi, Yogini
    birth_dt = datetime(year, month, day, hour, minute, int(second))
    bs_shift = 57

    # (a) Vimshottari
    vim_res = calculate_vimshottari_dasha(moon_lon, birth_dt, max_years=120)
    vim_rows = []
    antardasha_breakdown = []
    for d in vim_res.get("dasha_tree", []):
        p_name = d.get("planet_ne", "") if language == "ne" else d.get("planet", "")
        dur = f"{int(round(d.get('duration_years', 0)))} वर्ष" if language == "ne" else f"{int(round(d.get('duration_years', 0)))} yrs"
        end_ad = d.get("end_date", "")
        if end_ad and "-" in end_ad:
            parts = end_ad.split("-")
            end_bs_yr = int(parts[0]) + bs_shift
            end_bs_str = f"{end_bs_yr}/{parts[1]}/{parts[2]}"
        else:
            end_bs_str = end_ad
        vim_rows.append([p_name, dur, end_bs_str])

        # Collect antardashas for first 2 dashas
        if len(antardasha_breakdown) < 18 and d.get("sub_dashas"):
            for s in d.get("sub_dashas", []):
                s_name = s.get("sub_planet_ne", "") if language == "ne" else s.get("sub_planet", "")
                s_st = s.get("start", "")
                s_en = s.get("end", "")
                if s_st and "-" in s_st:
                    p1 = s_st.split("-")
                    st_bs = f"{int(p1[0]) + bs_shift}/{p1[1]}/{p1[2]}"
                else:
                    st_bs = s_st
                if s_en and "-" in s_en:
                    p2 = s_en.split("-")
                    en_bs = f"{int(p2[0]) + bs_shift}/{p2[1]}/{p2[2]}"
                else:
                    en_bs = s_en
                antardasha_breakdown.append([p_name, s_name, st_bs, en_bs, str(s.get("duration_months", 0))])

    # (b) Tribhagi
    tr_res = calculate_tribhagi_dasha(moon_lon, birth_dt, max_years=80)
    tr_rows = []
    for d in tr_res.get("dasha_tree", []):
        p_name = d.get("planet_ne", "") if language == "ne" else d.get("planet", "")
        dur = f"{d.get('duration_years', 0):.1f} वर्ष" if language == "ne" else f"{d.get('duration_years', 0):.1f} yrs"
        end_ad = d.get("end_date", "")
        if end_ad and "-" in end_ad:
            parts = end_ad.split("-")
            end_bs_yr = int(parts[0]) + bs_shift
            end_bs_str = f"{end_bs_yr}/{parts[1]}/{parts[2]}"
        else:
            end_bs_str = end_ad
        tr_rows.append([p_name, dur, end_bs_str])

    # (c) Yogini
    yog_res = calculate_yogini_dasha(moon_lon, birth_dt)
    yog_rows = []
    for d in yog_res.get("dasha_tree", []):
        p_name = d.get("planet_ne", "") if language == "ne" else d.get("planet", "")
        dur = f"{int(round(d.get('duration_years', 0)))} वर्ष" if language == "ne" else f"{int(round(d.get('duration_years', 0)))} yrs"
        end_ad = d.get("end_date", "")
        if end_ad and "-" in end_ad:
            parts = end_ad.split("-")
            end_bs_yr = int(parts[0]) + bs_shift
            end_bs_str = f"{end_bs_yr}/{parts[1]}/{parts[2]}"
        else:
            end_bs_str = end_ad
        yog_rows.append([p_name, dur, end_bs_str])

    # 6. Predictions Synthesis
    active_dasha_name = vim_rows[0][0] if vim_rows else "Jupiter"
    predictions = generate_cheena_predictions(
        lagna_rashi=lagna_rashi_id,
        moon_rashi=m_rashi_idx + 1,
        planet_rashis=planet_rashis_dict,
        current_mahadasha=active_dasha_name,
        lang=language
    )

    # Samvatsara, Ayana, Ritu
    samvat_idx = (year + 11) % 60
    samvatsara_name = SAMVATSARA_60[samvat_idx] if language == "ne" else f"Samvat {samvat_idx + 1}"
    s_rashi_idx = int(sun_lon / 30.0)
    ayana = ("उत्तरायण" if s_rashi_idx in [9, 10, 11, 0, 1, 2] else "दक्षिणायन") if language == "ne" else ("Uttarayana" if s_rashi_idx in [9, 10, 11, 0, 1, 2] else "Dakshinayana")
    ritus = ["वसन्त", "वसन्त", "ग्रीष्म", "ग्रीष्म", "वर्षा", "वर्षा", "शरद्", "शरद्", "हेमन्त", "हेमन्त", "शिशिर", "शिशिर"]
    ritu = ritus[s_rashi_idx] if language == "ne" else "Vedic Season"
    masas = ["वैशाख", "ज्येष्ठ", "आषाढ", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन", "चैत्र"]
    masa = masas[s_rashi_idx] if language == "ne" else "Vedic Month"

    tithi_num = panchang["tithi"]["number"]
    paksha = ("शुक्ल" if tithi_num <= 15 else "कृष्ण") if language == "ne" else ("Shukla" if tithi_num <= 15 else "Krishna")

    ishta_dict = panchang.get("ishtakala", {})
    ishta_str = f"{ishta_dict.get('ghati', 0)}:{ishta_dict.get('pala', 0):02d}"

    if not date_bs:
        date_bs = f"{year + bs_shift}/{month:02d}/{day:02d}"

    birth_time_str = f"{hour:02d}:{minute:02d}:{int(second):02d}"
    lat_str = f"{abs(latitude):.2f}"
    lon_str = f"{abs(longitude):.2f}"

    ayan_deg, ayan_min, ayan_sec = get_dms(ayan_val)
    ayan_dms_str = f"{ayan_deg}° {ayan_min}' {int(ayan_sec)}''"

    ayan_display_name = ayanamsha
    if ayanamsha.upper() == "LAHIRI":
        ayan_display_name = "लाहिरी (चित्रपक्ष)" if language == "ne" else "N.C. Lahiri (Chitrapaksha)"
    elif ayanamsha.upper() == "RAMAN":
        ayan_display_name = "बि.भि. रमण" if language == "ne" else "B.V. Raman"
    elif ayanamsha.upper() == "KP":
        ayan_display_name = "के.पि. (कृष्णमूर्ति)" if language == "ne" else "Krishnamurti (KP)"

    return {
        "name": name,
        "father_name": father_name,
        "mother_name": mother_name,
        "date_bs": date_bs,
        "date_ad": f"{year:04d}-{month:02d}-{day:02d}",
        "birth_time": birth_time_str,
        "place": place,
        "lat": lat_str,
        "lon": lon_str,
        "samvatsara": samvatsara_name,
        "ayana": ayana,
        "ritu": ritu,
        "masa": masa,
        "paksha": paksha,
        "vaara": panchang["vara"]["name_ne"].split()[0] if language == "ne" else panchang["vara"]["name"],
        "tithi": panchang["tithi"]["name_ne"].replace("शुक्ल ", "").replace("कृष्ण ", "") if language == "ne" else panchang["tithi"]["name"],
        "nakshatra": NAKSHATRA_NAMES_NE[m_nak_idx].split()[0] if language == "ne" else NAKSHATRA_NAMES_NE[m_nak_idx].split()[0],
        "charan": str(m_pada),
        "yoga": panchang["yoga"]["name_ne"] if language == "ne" else panchang["yoga"]["name"],
        "karana": panchang["karana"]["name_ne"] if language == "ne" else panchang["karana"]["name"],
        "sunrise": panchang["sunrise"][:5],
        "sunset": panchang["sunset"][:5],
        "ishtakaal": ishta_str,
        "rashi": RASHI_NAMES_NE[m_rashi_idx].split()[0] if language == "ne" else RASHI_NAMES_EN[m_rashi_idx],
        "lagna": RASHI_NAMES_NE[lagna_rashi_idx].split()[0] if language == "ne" else RASHI_NAMES_EN[lagna_rashi_idx],
        "namakshar": namakshar,
        "gana": gana,
        "nadi": nadi,
        "yoni": yoni,
        "varna": varna,
        "vashya": vashya,
        "tara": tara,
        "paya": paya,
        "lagna_signs": lagna_signs,
        "lagna_planets": lagna_planets,
        "navamsha_signs": navamsha_signs,
        "navamsha_planets": navamsha_planets,
        "planet_rashis_dict": planet_rashis_dict,
        "graha_spashta": graha_spashta_rows,
        "shodashavarga_charts": shodashavarga_charts,
        "vimshottari_rows": vim_rows,
        "tribhagi_rows": tr_rows,
        "yogini_rows": yog_rows,
        "antardasha_breakdown": antardasha_breakdown,
        "predictions": predictions,
        "astrologer_name": astrologer_name,
        "ayanamsha_name": ayan_display_name,
        "ayanamsha_dms": ayan_dms_str,
        "language": language
    }

if __name__ == "__main__":
    sample_data = prepare_cheena_data_from_birth(
        year=2026, month=10, day=22, hour=14, minute=30, second=0,
        latitude=27.7172, longitude=85.3240, timezone_offset=5.75,
        name="राम प्रसाद अधिकारी", father_name="हरि प्रसाद", mother_name="सीता देवी",
        place="काठमाडौँ", date_bs="२०८३/०७/०५", astrologer_name="पण्डित धर्मानन्द जोशी", language="ne"
    )
    output_filename = "cheena_sample_6pages_complete.pdf"
    build_cheena_pdf(output_filename, sample_data)
    print(f"Generated {output_filename} successfully with 6 pages!")
