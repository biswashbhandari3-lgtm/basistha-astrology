"""
Basistha Astrological Engine
Traditional Multi-Page Royal Nepali Cheena (Janmapatrika) PDF Generator
Replicating the classical 13-Page Grand Vedic Horoscope Presentation with HarfBuzz Shaping:

Pages Structure:
- Page 1: आमुख (Cover Overview: Invocations, Native Profile, Detailed Panchanga, Avakahada, Sacred Benediction)
- Page 2: ग्रहस्पष्ट सारिणी एवं पञ्चधा ग्रहमैत्री चक्र (Planetary Positions with Motion/Dignity & 5-fold Relationship Matrix)
- Page 3: षोडशवर्ग चक्राणि - भाग १ (D-1, D-2, D-3, D-4, D-7, D-9 in 2x3 Grid)
- Page 4: षोडशवर्ग चक्राणि - भाग २ (D-10, D-12, D-16, D-20, D-24, D-27 in 2x3 Grid)
- Page 5: षोडशवर्ग चक्राणि - भाग ३ (D-30, D-40, D-45, D-60 in 2x2 Grid + षोडशवर्ग वर्गीकरण एवं वर्गबल विचार)
- Page 6: विंशोत्तरी दशान्तर्दशा कालचक्र (१२० वर्ष - 3x3 Grid of 9 Mahadashas & Antardashas)
- Page 7: त्रिभागी दशान्तर्दशा कालचक्र (८० वर्ष - 3x3 Grid of 9 Mahadashas & Antardashas)
- Page 8: योगिनी दशान्तर्दशा कालचक्र (३६ वर्ष - 8 Yogini Mahadashas & Antardashas)
- Page 9: महादशा तथा अन्तर्दशा फल - भाग १ (सक्रिय एवं मुख्य दशाको पराशरीय श्लोक, समयरेखा र शान्ति उपाय)
- Page 10: महादशा तथा अन्तर्दशा फल - भाग २ (आगामी अन्तर्दशाहरूको मूल श्लोक, फल-विचार एवं शान्ति विधान)
- Page 11: शास्त्रीय श्लोकबद्ध कुण्डली फलादेश (लग्नेश, भाग्येश, कर्मेश एवं ग्रहगत फल मूल श्लोक सहित)
- Page 12: विशेष जीवन फलादेश (मुख्य फलादेश, व्यापार-आजीविका, विदेश यात्रा, शिक्षादीक्षा-धर्म, पारिवारिक सुख)
- Page 13: योग-दोष विचार, ग्रहानुकूलता, शुभ तत्वहरू, दैनिक साधना एवं वशिष्ठ ज्योतिष प्रमाणीकरण
"""
import os
import sys
import io
import re
import math
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple

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

SQLITE_PATH = Path(__file__).resolve().parent.parent / "data" / "phalit_unicode.db"

# -------------------------------------------------------------
# १. फन्ट व्यवस्थापन (Font Setup & OpenType Text Shaping)
# -------------------------------------------------------------
FONT_REGULAR = "Kswami"
FONT_BOLD = "Kswami-Bold"
FONT_ITALIC = "Kswami-Italic"
FONT_BOLD_ITALIC = "Kswami-BoldItalic"
_FONTS_INITIALIZED = False

def setup_fonts():
    """Registers Kswami font family provided in the 'font' folder, with fallback to Noto Sans, Kokila, Mangal."""
    global FONT_REGULAR, FONT_BOLD, FONT_ITALIC, FONT_BOLD_ITALIC, _FONTS_INITIALIZED
    if _FONTS_INITIALIZED:
        return

    current_dir = Path(__file__).resolve().parent
    backend_dir = current_dir.parent.parent
    workspace_root = backend_dir.parent

    # Candidate directories to discover fonts
    font_dirs = [
        workspace_root / "font",
        current_dir.parent / "fonts",
        Path.cwd() / "font",
        Path.cwd() / "basistha-backend" / "app" / "fonts",
        backend_dir / "app" / "fonts",
        Path.cwd().parent / "font",
    ]

    def find_file(candidates: List[str]) -> Optional[str]:
        for d in font_dirs:
            if not d.exists():
                continue
            for name in candidates:
                p = d / name
                if p.is_file():
                    return str(p)
        return None

    # Search for Kswami font family files (OTF / TTF)
    kswami_reg = find_file(["Kswami.otf", "Kswami-Regular.otf", "kswami.otf", "Kswami.ttf"])
    kswami_bold = find_file(["Kswami-Bold.otf", "kswami-bold.otf", "Kswamib.otf", "Kswami-Bold.ttf"])
    kswami_italic = find_file(["Knswami-r-italik.otf", "Kswami-r-italik.otf", "Kswami-Italic.otf", "kswami-italic.otf"])
    kswami_bold_italic = find_file(["Kswami-BoldItalic.otf", "kswami-bolditalic.otf"])

    registered = False
    if kswami_reg:
        try:
            pdfmetrics.registerFont(TTFont("Kswami", kswami_reg))

            b_path = kswami_bold or kswami_reg
            pdfmetrics.registerFont(TTFont("Kswami-Bold", b_path))

            it_path = kswami_italic or kswami_reg
            pdfmetrics.registerFont(TTFont("Kswami-Italic", it_path))

            bi_path = kswami_bold_italic or b_path
            pdfmetrics.registerFont(TTFont("Kswami-BoldItalic", bi_path))

            pdfmetrics.registerFontFamily(
                "Kswami",
                normal="Kswami",
                bold="Kswami-Bold",
                italic="Kswami-Italic",
                boldItalic="Kswami-BoldItalic"
            )

            FONT_REGULAR = "Kswami"
            FONT_BOLD = "Kswami-Bold"
            FONT_ITALIC = "Kswami-Italic"
            FONT_BOLD_ITALIC = "Kswami-BoldItalic"
            registered = True
        except Exception as e:
            print(f"Kswami font registration error: {e}")

    if not registered:
        bundled_reg = current_dir.parent / "fonts" / "NotoSansDevanagari-Regular.ttf"
        bundled_bold = current_dir.parent / "fonts" / "NotoSansDevanagari-Bold.ttf"

        fallback_candidates = [
            ("NotoSansDevanagari", "NotoSansDevanagari-Bold", str(bundled_reg), str(bundled_bold)),
            ("Kokila", "Kokila-Bold", r"C:\Windows\Fonts\kokila.ttf", r"C:\Windows\Fonts\kokilab.ttf"),
            ("Mangal", "Mangal-Bold", r"C:\Windows\Fonts\mangal.ttf", r"C:\Windows\Fonts\mangalb.ttf"),
        ]

        for reg_name, bold_name, reg_p, bold_p in fallback_candidates:
            if os.path.exists(reg_p):
                try:
                    pdfmetrics.registerFont(TTFont(reg_name, reg_p))
                    if os.path.exists(bold_p):
                        pdfmetrics.registerFont(TTFont(bold_name, bold_p))
                    else:
                        pdfmetrics.registerFont(TTFont(bold_name, reg_p))
                    FONT_REGULAR = reg_name
                    FONT_BOLD = bold_name
                    FONT_ITALIC = reg_name
                    FONT_BOLD_ITALIC = bold_name
                    registered = True
                    break
                except Exception as e:
                    print(f"Fallback font registration warning ({reg_name}): {e}")

    if not registered:
        FONT_REGULAR = "Helvetica"
        FONT_BOLD = "Helvetica-Bold"
        FONT_ITALIC = "Helvetica-Oblique"
        FONT_BOLD_ITALIC = "Helvetica-BoldOblique"

    _FONTS_INITIALIZED = True

_EMOJI_REGEX = re.compile(
    r'[\U00010000-\U0010ffff]|'
    r'[\u2600-\u27BF]|'
    r'[\uFE00-\uFE0F]|'
    r'[\u20D0-\u20FF]|'
    r'[\u2300-\u23FF]'
)

def clean_shaping_text(text: str) -> str:
    """Sanitizes text by replacing missing glyphs and unsupported characters."""
    if not text or not isinstance(text, str):
        return "" if text is None else str(text)

    # Replace degree symbol with Devanagari abbreviation sign U+0970 (crisp circle)
    t = text.replace("°", "॰")
    # Replace bullets and asterisks
    t = t.replace("•", "|").replace("●", "|")
    # Replace arrows
    t = t.replace("➔", "-").replace("→", "-").replace("=>", "-")
    # Remove English translations in parens like (Ruby), (Lucky Gem)
    t = re.sub(r'\([A-Za-z\s]+\)', '', t)
    # Remove emojis
    t = _EMOJI_REGEX.sub('', t)
    return t.strip()

def shape_text(text: str, font_name: Optional[str] = None, font_size: float = 9.0) -> str:
    """Shapes Devanagari Unicode text using OpenType HarfBuzz rules with smart script segmentation."""
    if not text or not isinstance(text, str):
        return "" if text is None else str(text)

    clean_t = clean_shaping_text(text)
    fn = font_name or FONT_REGULAR
    if not HAS_SHAPING:
        return clean_t

    ot_fonts = {
        FONT_REGULAR, FONT_BOLD, FONT_ITALIC, FONT_BOLD_ITALIC,
        "Kswami", "Kswami-Bold", "Kswami-Italic", "Kswami-BoldItalic",
        "NotoSansDevanagari", "NotoSansDevanagari-Bold",
        "Kokila", "Kokila-Bold", "Mangal", "Mangal-Bold"
    }
    if fn not in ot_fonts:
        return clean_t

    try:
        # Segment text into Devanagari runs and non-Devanagari runs
        # HarfBuzz guess_segment_properties detects the script of the first char,
        # so segmenting ensures Devanagari blocks always use script 'Deva' and form conjuncts/matras properly.
        parts = re.split(r'([\u0900-\u097F\uA8E0-\uA8FF\s]+)', clean_t)
        result = []
        for p in parts:
            if not p:
                continue
            if any('\u0900' <= ch <= '\u097F' or '\uA8E0' <= ch <= '\uA8FF' for ch in p):
                try:
                    result.append(shapeStr(p, fn, font_size))
                except Exception:
                    result.append(p)
            else:
                result.append(p)
        return ''.join(result)
    except Exception:
        try:
            return shapeStr(clean_t, fn, font_size)
        except Exception:
            return clean_t

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
        "Jupiter": "गु", "Venus": "शु", "Saturn": "श", "Rahu": "रा", "Ketu": "के",
        "Lagna": "लग्न"
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
        "Jupiter": "गुरु", "Venus": "शुक्र", "Saturn": "शनि", "Rahu": "राहु", "Ketu": "केतु"
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
# २. पारम्परिक हीरा-जाली बोर्डर एवं फुटर (Ornamental Diamond Border)
# -------------------------------------------------------------
def draw_diamond_chain_border(c, page_w, page_h, m=14, s=7.5):
    """
    Renders exact royal Vedic diamond chain border with corner rosettes
    and rounded inner frame matching the requested SVG specification.
    """
    c.saveState()
    border_color = colors.HexColor('#C8232B')
    bw = s
    inner_pad = 3.5
    inner_r = 5.0

    avail_w = page_w - 2 * (m + bw)
    n_x = max(1, round(avail_w / bw))
    step_x = avail_w / n_x

    avail_h = page_h - 2 * (m + bw)
    n_y = max(1, round(avail_h / bw))
    step_y = avail_h / n_y

    # 1. Outer hairline
    c.setStrokeColor(border_color)
    c.setLineWidth(0.4)
    c.rect(m, m, page_w - 2*m, page_h - 2*m, fill=0, stroke=1)

    # 2. Inner hairline
    c.rect(m + bw, m + bw, page_w - 2*(m+bw), page_h - 2*(m+bw), fill=0, stroke=1)

    # 3. Inner Frame with rounded corners
    ix = m + bw + inner_pad
    iy = m + bw + inner_pad
    iw = page_w - 2 * ix
    ih = page_h - 2 * iy
    c.setLineWidth(0.6)
    c.roundRect(ix, iy, iw, ih, inner_r, fill=0, stroke=1)

    # 4. Repeating Diamonds
    c.setLineWidth(0.65)
    c.setFillColor(border_color)

    def draw_diamond(cx, cy, rx, ry):
        p = c.beginPath()
        p.moveTo(cx, cy - ry)
        p.lineTo(cx + rx, cy)
        p.lineTo(cx, cy + ry)
        p.lineTo(cx - rx, cy)
        p.close()
        c.drawPath(p, fill=0, stroke=1)
        c.circle(cx, cy, 0.75, fill=1, stroke=0)

    # Top & Bottom
    for i in range(n_x):
        cx = m + bw + (i + 0.5) * step_x
        draw_diamond(cx, page_h - m - bw/2.0, step_x/2.0, bw/2.0)
        draw_diamond(cx, m + bw/2.0, step_x/2.0, bw/2.0)

    # Left & Right
    for j in range(n_y):
        cy = m + bw + (j + 0.5) * step_y
        draw_diamond(m + bw/2.0, cy, bw/2.0, step_y/2.0)
        draw_diamond(page_w - m - bw/2.0, cy, bw/2.0, step_y/2.0)

    # 4 Corner Rosettes
    corners = [
        (m + bw/2.0, m + bw/2.0),
        (page_w - m - bw/2.0, m + bw/2.0),
        (m + bw/2.0, page_h - m - bw/2.0),
        (page_w - m - bw/2.0, page_h - m - bw/2.0),
    ]
    for cx, cy in corners:
        draw_diamond(cx, cy, bw/2.0, bw/2.0)
        c.circle(cx, cy, 1.2, fill=1, stroke=0)
        d_off = bw * 0.32
        for dx, dy in [(0, -d_off), (0, d_off), (-d_off, 0), (d_off, 0)]:
            c.circle(cx + dx, cy + dy, 0.65, fill=1, stroke=0)

    c.restoreState()

def draw_page_footer(c, page_w, data, page_num, total_pages=13, lang="ne"):
    """
    Renders standardized institutional footer safely above diamond border:
    वशिष्ठ ज्योतिष | www.basistha-jyotish.com        पृष्ठ X / Y        जातक: [नाम] | ज्योतिषी: [ज्योतिषी]
    """
    c.saveState()
    footer_y = 29.5
    m_x = 28

    # Golden accent rule above footer
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(0.5)
    c.line(m_x + 4, 38, page_w - m_x - 4, 38)

    # Left: Brand & Website
    c.setFont(FONT_BOLD, 7.5)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    brand_txt = "वशिष्ठ ज्योतिष" if lang == "ne" else "Basistha Jyotish"
    c.drawString(m_x + 4, footer_y, shape_text(brand_txt, FONT_BOLD, 7.5))

    brand_w = pdfmetrics.stringWidth(shape_text(brand_txt, FONT_BOLD, 7.5), FONT_BOLD, 7.5)
    c.setFont(FONT_REGULAR, 7.2)
    c.setFillColor(colors.HexColor("#666666"))
    c.drawString(m_x + 6 + brand_w, footer_y, " | ")

    pipe_w = pdfmetrics.stringWidth(" | ", FONT_REGULAR, 7.2)
    c.setFont("Helvetica", 7.0)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(m_x + 6 + brand_w + pipe_w, footer_y, "www.basistha-jyotish.com")

    # Center: Page Number
    c.setFont(FONT_REGULAR, 7.5)
    c.setFillColor(colors.HexColor("#444444"))
    pg_str = f"पृष्ठ {to_dev_num(page_num, lang)} / {to_dev_num(total_pages, lang)}" if lang == "ne" else f"Page {page_num} / {total_pages}"
    c.drawCentredString(page_w / 2.0, footer_y, shape_text(pg_str, FONT_REGULAR, 7.5))

    # Right: Native & Astrologer
    p_name = data.get("name", "जातक")
    astro_name = data.get("astrologer_name", "पं. ज्योतिषाचार्य")
    if lang == "ne":
        right_info = f"जातक: {p_name} | ज्योतिषी: {astro_name}"
    else:
        right_info = f"Native: {p_name} | Astrologer: {astro_name}"
    c.drawRightString(page_w - m_x - 4, footer_y, shape_text(right_info, FONT_REGULAR, 7.5))

    c.restoreState()

# -------------------------------------------------------------
# ३. उत्तर भारतीय कुण्डली चक्र (North Indian Diamond Chart)
# -------------------------------------------------------------
def draw_north_indian_chart(c, x, y, size, house_signs, house_planets, is_hora_d2=False, d2_data=None, lang="ne"):
    """
    Draws authentic North Indian Diamond chart inside given bounding box.
    Safe centroid planet placements preventing any boundary or diagonal collisions.
    """
    c.saveState()
    w = size
    h = size

    # Background
    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.rect(x, y, w, h, fill=1, stroke=0)

    # Frame & lines
    c.setStrokeColor(colors.HexColor("#8B1E1E"))
    c.setLineWidth(0.9)
    c.rect(x, y, w, h, fill=0, stroke=1)

    # Diagonals
    c.setLineWidth(0.7)
    c.line(x, y, x + w, y + h)
    c.line(x, y + h, x + w, y)

    # Diamond Rhombus
    mid_x = x + w / 2.0
    mid_y = y + h / 2.0
    c.line(mid_x, y, x + w, mid_y)
    c.line(x + w, mid_y, mid_x, y + h)
    c.line(mid_x, y + h, x, mid_y)
    c.line(x, mid_y, mid_x, y)

    # Centroids of 12 houses (sign_x, sign_y, planet_x, planet_y)
    house_coords = {
        1:  (x + 0.50 * w, y + 0.63 * h, x + 0.50 * w, y + 0.77 * h),
        2:  (x + 0.35 * w, y + 0.85 * h, x + 0.22 * w, y + 0.90 * h),
        3:  (x + 0.16 * w, y + 0.66 * h, x + 0.09 * w, y + 0.78 * h),
        4:  (x + 0.38 * w, y + 0.50 * h, x + 0.23 * w, y + 0.50 * h),
        5:  (x + 0.16 * w, y + 0.34 * h, x + 0.09 * w, y + 0.22 * h),
        6:  (x + 0.35 * w, y + 0.15 * h, x + 0.22 * w, y + 0.10 * h),
        7:  (x + 0.50 * w, y + 0.37 * h, x + 0.50 * w, y + 0.23 * h),
        8:  (x + 0.65 * w, y + 0.15 * h, x + 0.78 * w, y + 0.10 * h),
        9:  (x + 0.84 * w, y + 0.34 * h, x + 0.91 * w, y + 0.22 * h),
        10: (x + 0.62 * w, y + 0.50 * h, x + 0.77 * w, y + 0.50 * h),
        11: (x + 0.84 * w, y + 0.66 * h, x + 0.91 * w, y + 0.78 * h),
        12: (x + 0.65 * w, y + 0.85 * h, x + 0.78 * w, y + 0.90 * h),
    }

    sign_fs = 6.2
    planet_fs = 5.8

    for h_num in range(1, 13):
        coords = house_coords[h_num]
        sign_x, sign_y = coords[0], coords[1]
        planet_x, planet_y = coords[2], coords[3]

        # Draw Rashi number
        sign_num = house_signs.get(h_num, "")
        if sign_num:
            c.setFont(FONT_REGULAR, sign_fs)
            c.setFillColor(colors.HexColor("#444444"))
            c.drawCentredString(sign_x, sign_y - 2, shape_text(to_dev_num(sign_num, lang), FONT_REGULAR, sign_fs))

        # Draw Planets
        planets = house_planets.get(h_num, [])
        if planets:
            c.setFont(FONT_BOLD, planet_fs)
            c.setFillColor(colors.HexColor("#1A365D"))

            if len(planets) == 1:
                c.drawCentredString(planet_x, planet_y - 2.0, shape_text(planets[0], FONT_BOLD, planet_fs))
            elif len(planets) == 2:
                c.drawCentredString(planet_x, planet_y + 1.2, shape_text(planets[0], FONT_BOLD, planet_fs))
                c.drawCentredString(planet_x, planet_y - 4.8, shape_text(planets[1], FONT_BOLD, planet_fs))
            else:
                line1 = " ".join(planets[:2])
                line2 = " ".join(planets[2:4])
                c.drawCentredString(planet_x, planet_y + 2.0, shape_text(line1, FONT_BOLD, planet_fs))
                c.drawCentredString(planet_x, planet_y - 3.5, shape_text(line2, FONT_BOLD, planet_fs))
                if len(planets) > 4:
                    line3 = " ".join(planets[4:])
                    c.drawCentredString(planet_x, planet_y - 8.5, shape_text(line3, FONT_BOLD, planet_fs))

    c.restoreState()

# -------------------------------------------------------------
# ४. पृष्ठ १: आमुख, जातक विवरण एवं पञ्चाङ्ग (Page 1)
# -------------------------------------------------------------
def build_page_1_cover_and_overview(c, page_w, page_h, data, lang="ne"):
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    top_y = page_h - 40
    # Top Mantras
    c.setFont(FONT_BOLD, 12)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ श्री गणेशाय नमः ॥", FONT_BOLD, 12))

    c.setFont(FONT_REGULAR, 8.5)
    c.setFillColor(colors.HexColor("#333333"))
    c.drawCentredString(page_w / 2.0, top_y - 15, shape_text("॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥", FONT_REGULAR, 8.5))

    # Grand Title Banner
    title_y = top_y - 65
    c.setFont(FONT_BOLD, 23)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, title_y, shape_text("श्री जन्मपत्रिका", FONT_BOLD, 23))

    c.setFont(FONT_BOLD, 10)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, title_y - 16, shape_text("वैदिक जन्मकुण्डली, षोडशवर्ग एवं सम्पूर्ण फलादेश प्रतिवेदन", FONT_BOLD, 10))

    # Vector Ornamental Divider
    div_y = title_y - 28
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(0.8)
    c.line(page_w / 2.0 - 90, div_y, page_w / 2.0 - 15, div_y)
    c.line(page_w / 2.0 + 15, div_y, page_w / 2.0 + 90, div_y)
    # central diamond accent
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.rect(page_w / 2.0 - 4, div_y - 4, 8, 8, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#D4AF37"))
    c.circle(page_w / 2.0, div_y, 2.2, fill=1, stroke=0)

    # Side-by-side rounded boxes
    box_w = 260
    box_h = 245
    box_y = title_y - 42 - box_h
    left_x = 28
    right_x = left_x + box_w + 19

    p = data
    # Box 1 (Left): जातक परिचय विवरण
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.2)
    c.roundRect(left_x, box_y, box_w, box_h, 8, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 10.5)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(left_x + 14, box_y + box_h - 22, shape_text("॥ जातक परिचय विवरण ॥", FONT_BOLD, 10.5))

    # Left Items
    left_items = [
        ("जातकको नाम:", p.get("name", "चीदानन्द")),
        ("लिङ्ग / गोत्र:", f"{p.get('gender', 'पुरुष')} / {p.get('gotra', 'वशिष्ठ')}"),
        ("पिताको नाम:", p.get("father_name", "टीकाराम")),
        ("माताको नाम:", p.get("mother_name", "विष्णुमाया")),
        ("जन्म मिति (वि.सं.):", to_dev_num(p.get("date_bs", "२०५९ साल पुस २६ गते"), lang)),
        ("जन्म मिति (ई.सं.):", f"{to_dev_num(p.get('date_ad', '2003-01-10'), lang)} ई.सं. ({p.get('ad_month_ne', 'जनवरी')} {to_dev_num(p.get('ad_day', '१०'), lang)})"),
        ("जन्म समय:", f"{to_dev_num(p.get('birth_time', '२१:३०:००'), lang)} (वार: {p.get('vaara', 'शुक्र')}वासरः)"),
        ("जन्म स्थान / देश:", f"{p.get('place', 'पाँचथर')}, नेपाल"),
        ("अक्षांश / देशान्तर:", f"{to_dev_num(p.get('lat', '२७.१६६७'), lang)}॰ उत्तर, {to_dev_num(p.get('lon', '८७.७५००'), lang)}॰ पूर्व"),
        ("इष्टकाल:", f"{to_dev_num(p.get('ishtakaal', '३६:५२:४१'), lang)} घटी:पला"),
    ]
    cur_row_y = box_y + box_h - 44
    for lbl, val in left_items:
        c.setFont(FONT_REGULAR, 8.2)
        c.setFillColor(colors.HexColor("#555555"))
        c.drawString(left_x + 14, cur_row_y, shape_text(lbl, FONT_REGULAR, 8.2))

        c.setFont(FONT_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#1A1A1A"))
        c.drawString(left_x + 105, cur_row_y, shape_text(str(val), FONT_BOLD, 8.5))
        cur_row_y -= 19.5
    c.restoreState()

    # Box 2 (Right): पञ्चाङ्ग एवं अवकहडा चक्र
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.2)
    c.roundRect(right_x, box_y, box_w, box_h, 8, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 10.5)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(right_x + 14, box_y + box_h - 22, shape_text("॥ पञ्चाङ्ग एवं अवकहडा चक्र ॥", FONT_BOLD, 10.5))

    # Right Items
    right_items = [
        ("संवत्सर / शाके:", f"{p.get('samvatsara', 'दुर्मुख')} / शाके {to_dev_num(p.get('shake', '१९२४'), lang)}"),
        ("अयन / ऋतु:", f"{p.get('ayana', 'दक्षिणायन')} / {p.get('ritu', 'हेमन्त ऋतु')}"),
        ("पक्ष / तिथि:", f"{p.get('paksha', 'शुक्ल')} पक्ष / {p.get('tithi', 'अष्टमी तिथि')}"),
        ("जन्म नक्षत्र:", f"{p.get('nakshatra', 'रेवती')} (चरण {to_dev_num(p.get('charan', '४'), lang)})"),
        ("नामाक्षर:", p.get("namakshar", "ची")),
        ("लग्न राशि:", f"{p.get('lagna', 'सिंह')} लग्न"),
        ("चन्द्र राशि:", f"{p.get('rashi', 'मीन')} राशि"),
        ("गण / नाडी:", f"{p.get('gana', 'देव')} गण / {p.get('nadi', 'अन्त्य')} नाडी"),
        ("वर्ण / वश्य:", f"{p.get('varna', 'विप्र')} / {p.get('vashya', 'कीट')}"),
        ("योनि / पाया:", f"{p.get('yoni', 'गज')} योनि / {p.get('paya', 'रजत')} पाया"),
    ]
    cur_row_y = box_y + box_h - 44
    for lbl, val in right_items:
        c.setFont(FONT_REGULAR, 8.2)
        c.setFillColor(colors.HexColor("#555555"))
        c.drawString(right_x + 14, cur_row_y, shape_text(lbl, FONT_REGULAR, 8.2))

        if lbl == "नामाक्षर:":
            c.setFont(FONT_BOLD, 14)
            c.setFillColor(colors.HexColor("#8B1E1E"))
            c.drawString(right_x + 95, cur_row_y - 1, shape_text(str(val), FONT_BOLD, 14))
        else:
            c.setFont(FONT_BOLD, 8.5)
            c.setFillColor(colors.HexColor("#1A1A1A"))
            c.drawString(right_x + 95, cur_row_y, shape_text(str(val), FONT_BOLD, 8.5))
        cur_row_y -= 19.5
    c.restoreState()

    # Bottom Benediction Box (॥ मङ्गलम् भगवान् विष्णुः ॥)
    bottom_box_y = box_y - 130
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.2)
    c.roundRect(left_x, bottom_box_y, usable_w, 105, 8, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, bottom_box_y + 80, shape_text("॥ मङ्गलम् भगवान् विष्णुः मङ्गलम् गरुडध्वजः ॥", FONT_BOLD, 9.5))

    c.setFont(FONT_REGULAR, 8.5)
    c.setFillColor(colors.HexColor("#333333"))
    shloka_1 = "आयुर्द्रोणसुते श्रियो दशरथे शत्रुक्षयो राघवे । ऐश्वर्यं नहुषे गतिश्च पवने मानञ्च दुर्योधने ॥"
    shloka_2 = "शौर्यं शान्तनवे बलं हलधरे सत्यञ्च कुन्तीसुते । विज्ञानं विदुरे भवन्तु भवतां कीर्तिश्च नारायणे ॥"
    c.drawCentredString(page_w / 2.0, bottom_box_y + 54, shape_text(shloka_1, FONT_REGULAR, 8.5))
    c.drawCentredString(page_w / 2.0, bottom_box_y + 36, shape_text(shloka_2, FONT_REGULAR, 8.5))
    c.restoreState()

    draw_page_footer(c, page_w, data, page_num=1, total_pages=13, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ५. पृष्ठ २: ग्रहस्पष्ट सारिणी एवं पञ्चधा ग्रहमैत्री चक्र (Page 2)
# -------------------------------------------------------------
def build_page_2_graha_spashta_and_maitri(c, page_w, page_h, data, lang="ne"):
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    # Top Header
    top_y = page_h - 42
    c.setFont(FONT_BOLD, 12)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ ग्रहस्पष्ट सारिणी एवं पञ्चधा ग्रहमैत्री चक्र ॥", FONT_BOLD, 12))

    c.setFont(FONT_REGULAR, 8.2)
    c.setFillColor(colors.HexColor("#555555"))
    default_ayan = '२४॰ ०९\' ५३"'
    ayan_val = data.get("ayanamsha_dms", default_ayan).replace("°", "॰")
    ayan_str = f"चित्रापक्षीय लाहिड़ी अयनांश ({to_dev_num(ayan_val, lang)}) सम्मत शुद्ध ग्रहस्थिति एवं पञ्चधा ग्रहमैत्री साधन"
    c.drawCentredString(page_w / 2.0, top_y - 14, shape_text(ayan_str, FONT_REGULAR, 8.2))

    # Table 1: Graha Spashta
    table1_top = top_y - 32
    headers1 = ["ग्रह", "राशि", "स्पष्ट मान (अंश-कला-विकला)", "नक्षत्र", "पाद", "गति (॰/दिन)", "अवस्था एवं भाव"]
    t1_data = [[shape_text(h, FONT_BOLD, 7.8) for h in headers1]]

    for r in data.get("graha_spashta_detailed", []):
        p_name = shape_text(r[0], FONT_BOLD, 7.5)
        p_rashi = shape_text(r[1], FONT_REGULAR, 7.5)
        p_dms = shape_text(to_dev_num(r[2].replace("°", "॰"), lang), FONT_REGULAR, 7.5)
        p_nak = shape_text(r[3], FONT_REGULAR, 7.5)
        p_pada = shape_text(to_dev_num(r[4], lang), FONT_REGULAR, 7.5)
        p_speed = shape_text(to_dev_num(r[5], lang), FONT_REGULAR, 7.5)
        p_avastha = shape_text(r[6], FONT_BOLD, 7.5)
        t1_data.append([p_name, p_rashi, p_dms, p_nak, p_pada, p_speed, p_avastha])

    col_w1 = [52, 60, 135, 82, 32, 66, 112]
    t1 = Table(t1_data, colWidths=col_w1)
    t1.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('FONTNAME', (0,1), (0,-1), FONT_BOLD),
        ('FONTNAME', (6,1), (6,-1), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.2),
        ('TOPPADDING', (0,0), (-1,-1), 3.2),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D8C3A5")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#FDFBF7")]),
    ]))
    t1_w, t1_h = t1.wrap(usable_w, 320)
    t1_y = table1_top - t1_h
    t1.drawOn(c, 28, t1_y)

    # Table 2: Panchadha Graha Maitri Chakra (in rounded yellow box)
    box2_y = t1_y - 20 - 180
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.2)
    c.roundRect(28, box2_y, usable_w, 185, 8, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9.5)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, box2_y + 168, shape_text("॥ पञ्चधा ग्रहमैत्री चक्र (नैसर्गिक + तात्कालिक = पञ्चधा सम्बन्ध) ॥", FONT_BOLD, 9.5))

    headers2 = ["सम्बन्ध", "सूर्य", "चन्द्र", "मङ्गल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु"]
    t2_data = [[shape_text(h, FONT_BOLD, 7.5) for h in headers2]]

    for row in data.get("panchadha_table_rows", []):
        t2_data.append([shape_text(cell, FONT_BOLD if i == 0 else FONT_REGULAR, 7.2) for i, cell in enumerate(row)])

    col_w2 = [60] + [(usable_w - 60 - 24) / 9.0] * 9
    t2 = Table(t2_data, colWidths=col_w2)
    t2.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.2),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7A1C1C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('FONTNAME', (0,1), (0,-1), FONT_BOLD),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5C158")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#FFFDF7")]),
    ]))
    t2_w, t2_h = t2.wrap(usable_w - 24, 150)
    t2.drawOn(c, 28 + 12, box2_y + 18)
    c.restoreState()

    draw_page_footer(c, page_w, data, page_num=2, total_pages=13, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ६. पृष्ठ ३, ४, ५: षोडशवर्ग कुण्डलीहरू (Shodashavarga 2x3 Grid)
# -------------------------------------------------------------
def draw_shodashavarga_page(c, page_w, page_h, data, vargas_info: List[Tuple[str, str, str]], page_num: int, total_pages=13, lang="ne"):
    """
    Renders 6 divisional charts in a 2-column x 3-row grid.
    If 4 charts (Page 5), adds bottom full-width classification & dignity analysis card.
    """
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    shodash_charts = data.get("shodashavarga_charts", {})

    card_w = 262
    card_h = 232
    col1_x = 28
    col2_x = 28 + card_w + 15
    row_ys = [page_h - 40 - card_h, page_h - 40 - 2 * card_h - 10, page_h - 40 - 3 * card_h - 20]

    for idx, (v_code, v_title, v_chakra) in enumerate(vargas_info):
        col = idx % 2
        row = idx // 2
        card_x = col1_x if col == 0 else col2_x
        card_y = row_ys[row]

        # Draw Outer Card
        c.saveState()
        c.setFillColor(colors.HexColor("#FFFEFA"))
        c.setStrokeColor(colors.HexColor("#E5C158"))
        c.setLineWidth(1.0)
        c.roundRect(card_x, card_y, card_w, card_h, 6, fill=1, stroke=1)

        # Header Badge Bar
        bar_y = card_y + card_h - 22
        # Left Red Pill [D-X] using Helvetica for crisp Latin
        c.setFillColor(colors.HexColor("#8B1E1E"))
        c.roundRect(card_x + 8, bar_y + 2, 28, 14, 3, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(colors.white)
        c.drawCentredString(card_x + 22, bar_y + 5, v_code)

        # Center Title
        c.setFont(FONT_BOLD, 9.2)
        c.setFillColor(colors.HexColor("#7A1C1C"))
        c.drawCentredString(card_x + card_w / 2.0, bar_y + 5, shape_text(v_title, FONT_BOLD, 9.2))

        # Right Yellow Pill [Chakra Name]
        c.setFillColor(colors.HexColor("#FEF3C7"))
        c.setStrokeColor(colors.HexColor("#F59E0B"))
        c.setLineWidth(0.5)
        c.roundRect(card_x + card_w - 74, bar_y + 2, 66, 14, 3, fill=1, stroke=1)
        c.setFont(FONT_BOLD, 7.5)
        c.setFillColor(colors.HexColor("#78350F"))
        c.drawCentredString(card_x + card_w - 41, bar_y + 5, shape_text(v_chakra, FONT_BOLD, 7.5))

        # North Indian Diamond Chart
        chart_sz = 194
        chart_x = card_x + (card_w - chart_sz) / 2.0
        chart_y = card_y + 8

        ch_data = shodash_charts.get(v_code, {})
        draw_north_indian_chart(
            c, chart_x, chart_y, chart_sz,
            ch_data.get("signs", {}), ch_data.get("planets", {}),
            lang=lang
        )
        c.restoreState()

    # If Page 5 (only 4 charts): Fill 3rd row with Full-Width Shodashavarga Dignity & Strength Card
    if len(vargas_info) == 4:
        card_w_full = usable_w
        card_x_full = col1_x
        card_y_full = row_ys[2]
        c.saveState()
        c.setFillColor(colors.HexColor("#FFFEFA"))
        c.setStrokeColor(colors.HexColor("#E5C158"))
        c.setLineWidth(1.0)
        c.roundRect(card_x_full, card_y_full, card_w_full, card_h, 6, fill=1, stroke=1)

        # Header Badge Bar
        bar_y_full = card_y_full + card_h - 22
        c.setFont(FONT_BOLD, 9.5)
        c.setFillColor(colors.HexColor("#8B1E1E"))
        c.drawCentredString(card_x_full + card_w_full / 2.0, bar_y_full + 5, shape_text("॥ षोडशवर्ग चक्राणि - शास्त्रीय वर्गीकरण एवं वर्गबल विचार ॥", FONT_BOLD, 9.5))

        # Two columns of explanatory text
        mid_split = card_x_full + card_w_full / 2.0
        c.setStrokeColor(colors.HexColor("#E5C158"))
        c.setLineWidth(0.5)
        c.line(mid_split, card_y_full + 10, mid_split, bar_y_full)

        # Left Column: षड्बल एवं वर्गबल
        c.setFont(FONT_BOLD, 8.2)
        c.setFillColor(colors.HexColor("#7A1C1C"))
        c.drawString(card_x_full + 16, bar_y_full - 16, shape_text("षोडशवर्गको शास्त्रीय वर्गीकरण (षड्-वर्ग, सप्त-वर्ग, दश-वर्ग, षोडश-वर्ग):", FONT_BOLD, 8.2))

        left_bullets = [
            ("तनु वर्ग (डी-१):", "शारीरिक गठन, स्वास्थ्य, स्वभाव, आयु र जीवनको समग्र आधार।"),
            ("नवमांश वर्ग (डी-९):", "भाग्य, दाम्पत्य जीवन, आन्तरिक शक्ति र धर्म-साधना।"),
            ("दशमांश वर्ग (डी-१०):", "कर्म, पेशा, व्यापार-व्यवसाय, अधिकार, यश र सामाजिक प्रतिष्ठा।"),
            ("द्वादशांश वर्ग (डी-१२):", "मातापिता, कुल-परम्परा र वंशानुगत संस्कारको विचार।"),
            ("षष्ट्यंश वर्ग (डी-६०):", "प्रारब्ध कर्म, पूर्वजन्मको सञ्चित प्रभाव र सूक्ष्म शुभाशुभ फल।")
        ]
        by = bar_y_full - 32
        for t_b, d_b in left_bullets:
            c.setFont(FONT_BOLD, 7.2)
            c.setFillColor(colors.HexColor("#8B1E1E"))
            c.drawString(card_x_full + 14, by, shape_text(t_b, FONT_BOLD, 7.2))
            c.setFont(FONT_REGULAR, 7.2)
            c.setFillColor(colors.HexColor("#333333"))
            c.drawString(card_x_full + 95, by, shape_text(d_b, FONT_REGULAR, 7.2))
            by -= 14.5

        # Right Column: वर्गोत्तम एवं ग्रहबल प्रभाव
        c.setFont(FONT_BOLD, 8.2)
        c.setFillColor(colors.HexColor("#7A1C1C"))
        c.drawString(mid_split + 14, bar_y_full - 16, shape_text("वर्गोत्तम तथा उच्च-मूलत्रिकोण स्थिति विचार:", FONT_BOLD, 8.2))

        right_bullets = [
            ("वर्गोत्तम ग्रह:", "लग्न र नवमांश दुवैमा एउटै राशिमा रहेमा ग्रह अतिबलवान् हुन्छ।"),
            ("पारिजात/गोपुरांश:", "ग्रह २ देखि ४ वर्गमा स्व/उच्च राशिमा रहँदा राजयोग मिल्छ।"),
            ("सिंहासनांश:", "ग्रह ५ वर्गमा अनुकूल रहँदा राज्यपक्षबाट उच्च सम्मान पाइन्छ।"),
            ("पारावतांश:", "ग्रह ६ वर्गमा शुभ रहँदा अतुल सम्पत्ति, वाहन र सुख मिल्छ।"),
            ("वर्ग विचार सार:", "स्थूल फल लग्नबाट र सूक्ष्म फल षोडशवर्गबाट निर्णय गरिन्छ।")
        ]
        by2 = bar_y_full - 32
        for t_b, d_b in right_bullets:
            c.setFont(FONT_BOLD, 7.2)
            c.setFillColor(colors.HexColor("#8B1E1E"))
            c.drawString(mid_split + 14, by2, shape_text(t_b, FONT_BOLD, 7.2))
            c.setFont(FONT_REGULAR, 7.2)
            c.setFillColor(colors.HexColor("#333333"))
            c.drawString(mid_split + 86, by2, shape_text(d_b, FONT_REGULAR, 7.2))
            by2 -= 14.5

        c.restoreState()

    draw_page_footer(c, page_w, data, page_num=page_num, total_pages=total_pages, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ७. पृष्ठ ६, ७, ८: दशा कालचक्र ग्रिड (3x3 Dasha Matrix Tables)
# -------------------------------------------------------------
def draw_dasha_grid_page(c, page_w, page_h, data, dasha_type, page_num, total_pages=13, lang="ne"):
    """
    Renders 3x3 Grid of 9 Mahadasha boxes with their 9 Antardashas
    matching Screenshot Pages 6, 7, and 8.
    """
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    top_y = page_h - 40
    c.setFont(FONT_BOLD, 12)
    c.setFillColor(colors.HexColor("#8B1E1E"))

    if dasha_type == "vimshottari":
        c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ विंशोत्तरी दशान्तर्दशा कालचक्र (१२० वर्ष) ॥", FONT_BOLD, 12))
        boxes_data = data.get("vimshottari_grid", [])
        bal_text = data.get("vimshottari_balance_text", "३ वर्ष ६ महिना २९ दिन")
    elif dasha_type == "tribhagi":
        c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ त्रिभागी दशान्तर्दशा कालचक्र (८० वर्ष) ॥", FONT_BOLD, 12))
        boxes_data = data.get("tribhagi_grid", [])
        bal_text = data.get("tribhagi_balance_text", "२ वर्ष ४ महिना १० दिन")
    else:
        c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ योगिनी दशान्तर्दशा कालचक्र (३६ वर्ष) ॥", FONT_BOLD, 12))
        boxes_data = data.get("yogini_grid", [])
        bal_text = data.get("yogini_balance_text", "१ वर्ष ० महिना २२ दिन")

    c.setFont(FONT_REGULAR, 8.2)
    c.setFillColor(colors.HexColor("#555555"))
    sub_str = f"जन्म नक्षत्र: {data.get('nakshatra', 'रेवती')} ({to_dev_num(data.get('charan', 4), lang)} पाउ) | जन्म समय शेष भोग्य: {bal_text}"
    c.drawCentredString(page_w / 2.0, top_y - 14, shape_text(sub_str, FONT_REGULAR, 8.2))

    # 3x3 Grid layout
    card_w = 172
    card_h = 224
    col_xs = [28, 28 + card_w + 11, 28 + 2 * (card_w + 11)]
    row_ys = [top_y - 32 - card_h, top_y - 32 - 2 * card_h - 10, top_y - 32 - 3 * card_h - 20]

    for idx in range(min(9, len(boxes_data))):
        col = idx % 3
        row = idx // 3
        bx = col_xs[col]
        by = row_ys[row]
        box = boxes_data[idx]

        c.saveState()
        c.setFillColor(colors.HexColor("#FFFEFA"))
        c.setStrokeColor(colors.HexColor("#E5C158"))
        c.setLineWidth(1.0)
        c.roundRect(bx, by, card_w, card_h, 5, fill=1, stroke=1)

        # Header bar
        c.setFillColor(colors.HexColor("#FEF3C7"))
        c.roundRect(bx + 4, by + card_h - 22, card_w - 8, 18, 3, fill=1, stroke=0)

        c.setFont(FONT_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#1A365D"))
        c.drawString(bx + 8, by + card_h - 16, shape_text(box.get("planet", ""), FONT_BOLD, 8.5))

        c.setFont(FONT_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#8B1E1E"))
        c.drawRightString(bx + card_w - 8, by + card_h - 16, shape_text(to_dev_num(box.get("end_date_bs", ""), lang), FONT_BOLD, 8.5))

        # Antardasha rows
        rows = box.get("antardashas", [])
        ry = by + card_h - 38
        for a_idx, r in enumerate(rows):
            if a_idx % 2 == 1:
                c.setFillColor(colors.HexColor("#FDFBF7"))
                c.rect(bx + 4, ry - 3, card_w - 8, 14, fill=1, stroke=0)

            c.setFont(FONT_BOLD, 7.5)
            c.setFillColor(colors.HexColor("#222222"))
            c.drawString(bx + 8, ry, shape_text(r[0], FONT_BOLD, 7.5))

            c.setFont(FONT_REGULAR, 7.5)
            c.setFillColor(colors.HexColor("#444444"))
            c.drawRightString(bx + card_w - 8, ry, shape_text(to_dev_num(r[1], lang), FONT_REGULAR, 7.5))
            ry -= 15.5

        c.restoreState()

    draw_page_footer(c, page_w, data, page_num=page_num, total_pages=total_pages, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ८. पृष्ठ ९ & १०: महादशा तथा अन्तर्दशा फल (Dasha Phala with Shlokas)
# -------------------------------------------------------------
def draw_dasha_phala_page(c, page_w, page_h, data, dasha_cards, page_num, total_pages=13, lang="ne"):
    """
    Renders Parashara Hora Shastra Sanskrit shlokas and detailed interpretations.
    """
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    top_y = page_h - 40
    c.setFont(FONT_BOLD, 12)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ महादशा तथा अन्तर्दशा फल ॥", FONT_BOLD, 12))

    c.setFont(FONT_REGULAR, 8.2)
    c.setFillColor(colors.HexColor("#555555"))
    sub_title = "बृहत्पाराशरहोराशास्त्र सम्मत मूल संस्कृत श्लोक, सूक्ष्म समयरेखा, फल-विचार एवं शान्ति उपाय"
    c.drawCentredString(page_w / 2.0, top_y - 14, shape_text(sub_title, FONT_REGULAR, 8.2))

    cur_y = top_y - 32
    for card in dasha_cards:
        box_h = card.get("height", 335)
        c.saveState()
        c.setFillColor(colors.HexColor("#FFFEFA"))
        c.setStrokeColor(colors.HexColor("#E5C158"))
        c.setLineWidth(1.0)
        c.roundRect(28, cur_y - box_h, usable_w, box_h, 6, fill=1, stroke=1)

        # Time range header bar
        bar_y = cur_y - 24
        c.setFillColor(colors.HexColor("#FEF3C7"))
        c.roundRect(28 + 6, bar_y, usable_w - 12, 18, 3, fill=1, stroke=0)

        c.setFont(FONT_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#8B1E1E"))
        range_str = f"{to_dev_num(card.get('start_bs', ''), lang)} देखि {to_dev_num(card.get('end_bs', ''), lang)} सम्म"
        c.drawString(28 + 14, bar_y + 5, shape_text(range_str, FONT_BOLD, 8.5))

        if card.get("is_active"):
            c.setFillColor(colors.HexColor("#059669"))
            c.roundRect(usable_w - 100, bar_y + 1, 115, 16, 3, fill=1, stroke=0)
            c.setFont(FONT_BOLD, 7.5)
            c.setFillColor(colors.white)
            c.drawCentredString(usable_w - 42, bar_y + 5, shape_text("॥ हाल सक्रिय अन्तर्दशा ॥", FONT_BOLD, 7.5))

        # Title
        title_y = bar_y - 20
        c.setFont(FONT_BOLD, 10.5)
        c.setFillColor(colors.HexColor("#7A1C1C"))
        c.drawString(28 + 14, title_y, shape_text(card.get("title", ""), FONT_BOLD, 10.5))

        # Shloka box
        shloka_list = card.get("shlokas", [])
        s_y = title_y - 16
        c.setFont(FONT_REGULAR, 7.5)
        c.setFillColor(colors.HexColor("#8B1E1E"))
        c.drawString(28 + 24, s_y, shape_text("॥ बृहत्पाराशरहोराशास्त्रे दशाफलाध्याय प्रमाणम् ॥", FONT_REGULAR, 7.5))
        s_y -= 13.5

        c.setFont(FONT_BOLD, 8.2)
        c.setFillColor(colors.HexColor("#7A1C1C"))
        for sh in shloka_list:
            c.drawString(28 + 24, s_y, shape_text(sh, FONT_BOLD, 8.2))
            s_y -= 12.0

        # Detailed Notes
        notes = card.get("notes", [])
        n_y = s_y - 10
        c.setFont(FONT_REGULAR, 7.8)
        c.setFillColor(colors.HexColor("#2B2B2B"))

        for prefix, note_body in notes:
            full_text = f"{prefix} {note_body}"
            words = full_text.split()
            cur_line = []
            lines = []
            for w in words:
                if len(" ".join(cur_line + [w])) <= 112:
                    cur_line.append(w)
                else:
                    lines.append(" ".join(cur_line))
                    cur_line = [w]
            if cur_line:
                lines.append(" ".join(cur_line))

            for l in lines:
                c.drawString(28 + 14, n_y, shape_text(l, FONT_REGULAR, 7.8))
                n_y -= 11.5
            n_y -= 3.5

        c.restoreState()
        cur_y -= (box_h + 12)

    draw_page_footer(c, page_w, data, page_num=page_num, total_pages=total_pages, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ९. पृष्ठ ११: शास्त्रीय श्लोकबद्ध कुण्डली फलादेश (Bhavesha Phala Cards)
# -------------------------------------------------------------
def build_page_11_bhavesh_and_graha_phala(c, page_w, page_h, data, lang="ne"):
    """
    Page 11: Classical Sanskrit Shloka Bhavesha & Planetary Analysis.
    """
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    top_y = page_h - 40
    c.setFont(FONT_BOLD, 12)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ शास्त्रीय श्लोकबद्ध कुण्डली फलादेश ॥", FONT_BOLD, 12))

    c.setFont(FONT_REGULAR, 8.2)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawCentredString(page_w / 2.0, top_y - 14, shape_text("महर्षि पराशर, मानसागरी एवं चमत्कार चिन्तामणि ग्रन्थ प्रमाण, मूल श्लोक एवं नेपाली व्याख्या", FONT_REGULAR, 8.2))

    cur_y = top_y - 32
    cards = data.get("bhavesh_phala_cards", [])

    for card in cards:
        box_h = card.get("height", 160)
        c.saveState()
        c.setFillColor(colors.HexColor("#FFFEFA"))
        c.setStrokeColor(colors.HexColor("#E5C158"))
        c.setLineWidth(1.0)
        c.roundRect(28, cur_y - box_h, usable_w, box_h, 6, fill=1, stroke=1)

        # Badge pill
        c.setFillColor(colors.HexColor("#FEF3C7"))
        c.roundRect(38, cur_y - 20, 150, 16, 3, fill=1, stroke=0)
        c.setFont(FONT_BOLD, 8.0)
        c.setFillColor(colors.HexColor("#78350F"))
        c.drawCentredString(113, cur_y - 16, shape_text(card.get("badge", ""), FONT_BOLD, 8.0))

        # Title
        c.setFont(FONT_BOLD, 9.5)
        c.setFillColor(colors.HexColor("#8B1E1E"))
        c.drawString(200, cur_y - 16, shape_text(card.get("title", ""), FONT_BOLD, 9.5))

        # Shlokas
        shlokas = card.get("shlokas", [])
        s_y = cur_y - 34
        c.setFont(FONT_REGULAR, 7.5)
        c.setFillColor(colors.HexColor("#8B1E1E"))
        c.drawString(38, s_y, shape_text("॥ बृहत्पाराशर होराशास्त्र / मानसागरी प्रमाण ॥", FONT_REGULAR, 7.5))
        s_y -= 13.0

        c.setFont(FONT_BOLD, 8.2)
        c.setFillColor(colors.HexColor("#7A1C1C"))
        for sh in shlokas:
            c.drawString(38, s_y, shape_text(sh, FONT_BOLD, 8.2))
            s_y -= 11.5

        # Explanation
        s_y -= 3.0
        c.setFont(FONT_BOLD, 7.8)
        c.setFillColor(colors.HexColor("#1A1A1A"))
        c.drawString(38, s_y, shape_text("नेपाली अनुवाद तथा फलादेश:", FONT_BOLD, 7.8))
        s_y -= 12.0

        c.setFont(FONT_REGULAR, 7.8)
        c.setFillColor(colors.HexColor("#333333"))
        exp_text = card.get("explanation", "")
        words = exp_text.split()
        cur_l = []
        lines = []
        for w in words:
            if len(" ".join(cur_l + [w])) <= 112:
                cur_l.append(w)
            else:
                lines.append(" ".join(cur_l))
                cur_l = [w]
        if cur_l:
            lines.append(" ".join(cur_l))

        line_y = s_y
        for l in lines:
            c.drawString(38, line_y, shape_text(l, FONT_REGULAR, 7.8))
            line_y -= 11.5

        c.restoreState()
        cur_y -= (box_h + 12)

    draw_page_footer(c, page_w, data, page_num=11, total_pages=13, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# १०. पृष्ठ १२: विशेष जीवन फलादेश (Special Life Scopes Analysis)
# -------------------------------------------------------------
def build_page_12_life_scopes(c, page_w, page_h, data, page_num=12, total_pages=13, lang="ne"):
    """
    Page 12: विशेष जीवन फलादेश
    Covering:
    1. मुख्य फलादेश (General Life & Temperament)
    2. व्यापार तथा आजीविका फलादेश (Career & Business)
    3. विदेश यात्रा तथा बसोबास फलादेश (Foreign Travel & Settlement)
    4. शिक्षादीक्षा र धर्मकर्म विशेष फलादेश (Education & Dharma)
    5. पारिवारिक विवरण तथा वैवाहिक सुख (Family & Marriage)
    """
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    top_y = page_h - 40
    c.setFont(FONT_BOLD, 12)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ विशेष जीवन फलादेश एवं भाव-विचार ॥", FONT_BOLD, 12))

    c.setFont(FONT_REGULAR, 8.2)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawCentredString(page_w / 2.0, top_y - 14, shape_text("लग्न कुण्डली एवं शास्त्रीय सिद्धान्त अनुसार जीवनका प्रमुख पक्षहरूको विस्तृत फलादेश", FONT_REGULAR, 8.2))

    preds = data.get("predictions", {})

    scope_sections = [
        ("१. मुख्य फलादेश (लग्न प्रभाव एवं समग्र व्यक्तित्व)", preds.get("general") or "जातक साहसी, स्वाभिमानी, दृढनिश्चयी र नेतृत्व क्षमताले युक्त हुनुहुन्छ। समाजमा मान-सम्मान स्वाभाविक रूपमा प्राप्त हुनेछ।", 105),
        ("२. व्यापार तथा आजीविका फलादेश (दशम भाव विचार)", preds.get("business") or "दशम भावको शुभ प्रभावले गर्दा प्रशासनिक, प्राविधिक वा आफ्नै व्यापार-व्यवसायमा विशेष सफलता मिल्नेछ। निर्णय क्षमताले कार्यक्षेत्रमा नेतृत्वदायी स्थान दिलाउनेछ।", 105),
        ("३. विदेश यात्रा तथा बसोबास फलादेश (द्वादश एवं नवम भाव विचार)", preds.get("foreign") or "द्वादश भाव एवं भाग्य भावको स्थिति अनुसार उच्च शिक्षा, वैदेशिक भ्रमण, अन्तर्राष्ट्रिय व्यापार वा बहुराष्ट्रिय संस्थामा कार्य गर्ने उत्तम अवसर प्राप्त हुने योग छ।", 105),
        ("४. शिक्षादीक्षा र धर्मकर्म विशेष फलादेश (पञ्चम एवं नवम भाव विचार)", preds.get("education") or "पञ्चम भावको प्रभावले कुशाग्र बुद्धि, सूक्ष्म विश्लेषण र नवीन ज्ञान आर्जनमा तीव्र रुचि रहनेछ। धर्मपरायण स्वभाव, सत्कर्म र परोपकारमा निष्ठा रहनेछ।", 105),
        ("५. पारिवारिक विवरण तथा वैवाहिक सुख (द्वितीय एवं सप्तम भाव विचार)", preds.get("family") or "द्वितीय एवं सप्तम भावको अनुकूलताले कुल-परिवारमा आदर-सत्कार, पारिवारिक सामञ्जस्य र सहयोगी जीवनसाथीको साथ प्राप्त हुने योग छ।", 105),
    ]

    cur_y = top_y - 36
    for title, text_desc, card_h in scope_sections:
        c.saveState()
        c.setFillColor(colors.HexColor("#FFFEFA"))
        c.setStrokeColor(colors.HexColor("#E5C158"))
        c.setLineWidth(1.0)
        c.roundRect(28, cur_y - card_h, usable_w, card_h, 6, fill=1, stroke=1)

        # Header bar
        c.setFillColor(colors.HexColor("#FEF3C7"))
        c.roundRect(28 + 6, cur_y - 20, usable_w - 12, 16, 3, fill=1, stroke=0)
        c.setFont(FONT_BOLD, 8.5)
        c.setFillColor(colors.HexColor("#78350F"))
        c.drawString(28 + 14, cur_y - 16, shape_text(title, FONT_BOLD, 8.5))

        # Body text wrapped
        c.setFont(FONT_REGULAR, 7.8)
        c.setFillColor(colors.HexColor("#222222"))

        words = text_desc.split()
        lines = []
        cur_line = []
        for w in words:
            test_line = " ".join(cur_line + [w])
            w_px = pdfmetrics.stringWidth(shape_text(test_line, FONT_REGULAR, 7.8), FONT_REGULAR, 7.8)
            if w_px > usable_w - 32 and cur_line:
                lines.append(" ".join(cur_line))
                cur_line = [w]
            else:
                cur_line.append(w)
        if cur_line:
            lines.append(" ".join(cur_line))

        t_y = cur_y - 34
        for l in lines[:5]:
            c.drawString(28 + 14, t_y, shape_text(l, FONT_REGULAR, 7.8))
            t_y -= 13.5

        c.restoreState()
        cur_y -= (card_h + 10)

    draw_page_footer(c, page_w, data, page_num=page_num, total_pages=total_pages, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# ११. पृष्ठ १३: योग-दोष, शुभ तत्व, दैनिक साधना एवं प्रमाणीकरण (Page 13)
# -------------------------------------------------------------
def build_page_13_remedies_and_certification(c, page_w, page_h, data, lang="ne"):
    draw_diamond_chain_border(c, page_w, page_h)
    usable_w = page_w - 56

    top_y = page_h - 40
    c.setFont(FONT_BOLD, 12)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, top_y, shape_text("॥ योग-दोष विचार, ग्रहानुकूलता एवं वैदिक उपाय ॥", FONT_BOLD, 12))

    c.setFont(FONT_REGULAR, 8.2)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawCentredString(page_w / 2.0, top_y - 14, shape_text("जीवन सन्तुलन, ग्रहशान्ति, शुभ रत्न तथा शास्त्रीय आध्यात्मिक विधान", FONT_REGULAR, 8.2))

    # Section 1: Manglik Analysis Box
    s1_y = top_y - 34 - 55
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.0)
    c.roundRect(28, s1_y, usable_w, 55, 6, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9.0)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(38, s1_y + 36, shape_text("माङ्गलिक दोष विचार:", FONT_BOLD, 9.0))

    is_manglik = data.get("is_manglik", False)
    m_badge = "माङ्गलिक कुण्डली" if is_manglik else "निर्दोष कुण्डली (माङ्गलिक दोषरहित)"
    c.setFillColor(colors.HexColor("#FEE2E2") if is_manglik else colors.HexColor("#DCFCE7"))
    c.roundRect(145, s1_y + 32, 140, 16, 3, fill=1, stroke=0)
    c.setFont(FONT_BOLD, 8.0)
    c.setFillColor(colors.HexColor("#991B1B") if is_manglik else colors.HexColor("#166534"))
    c.drawCentredString(215, s1_y + 36, shape_text(m_badge, FONT_BOLD, 8.0))

    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#2B2B2B"))
    m_desc = "कुण्डलीमा मङ्गल ग्रह विशेष स्थानमा रहेकाले माङ्गलिक योग देखिन्छ । विवाह मिलान गर्दा वर-कन्या दुवैको कुण्डली गुण मिलान एवं मङ्गल परिहार विचार गरी निर्णय लिनु श्रेयस्कर हुनेछ ।" if is_manglik else "कुण्डलीमा मङ्गल ग्रह अनिष्ट भावहरूमा नबसेकाले माङ्गलिक दोष रहेको छैन । दाम्पत्य जीवन सामान्यतया सुखद र सामञ्जस्यपूर्ण रहनेछ ।"
    c.drawString(38, s1_y + 16, shape_text(m_desc, FONT_REGULAR, 7.8))
    c.restoreState()

    # Section 2: Favorable Elements Table
    s2_y = s1_y - 12 - 95
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.0)
    c.roundRect(28, s2_y, usable_w, 95, 6, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9.0)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawCentredString(page_w / 2.0, s2_y + 80, shape_text("॥ जातकका लागि शुभ एवं अनुकूल तत्वहरू ॥", FONT_BOLD, 9.0))

    remedy = data.get("predictions", {}).get("remedies", {})
    t_rows = [
        [shape_text("इष्टदेव / आराध्य:", FONT_BOLD, 7.5), shape_text("भगवान् लक्ष्मीनारायण", FONT_REGULAR, 7.5),
         shape_text("शुभ रत्न:", FONT_BOLD, 7.5), shape_text(remedy.get("stone", "माणिक्य / पोखराज"), FONT_REGULAR, 7.5)],
        [shape_text("शुभ धातु:", FONT_BOLD, 7.5), shape_text("स्वर्ण / तामा", FONT_REGULAR, 7.5),
         shape_text("शुभ रङ्ग:", FONT_BOLD, 7.5), shape_text("पहेंलो, सुनौलो, हल्का रातो", FONT_REGULAR, 7.5)],
        [shape_text("शुभ वार:", FONT_BOLD, 7.5), shape_text("बिहीबार", FONT_REGULAR, 7.5),
         shape_text("वैदिक मूल मन्त्र:", FONT_BOLD, 7.5), shape_text(remedy.get("mantra", "ॐ बृहस्पतये नमः (१०८ पटक)"), FONT_REGULAR, 7.5)],
    ]
    t_elem = Table(t_rows, colWidths=[90, 160, 105, 160])
    t_elem.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_REGULAR),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, colors.HexColor("#E5C158")),
    ]))
    t_elem.wrap(usable_w - 20, 70)
    t_elem.drawOn(c, 38, s2_y + 10)
    c.restoreState()

    # Section 3: Daily Sadhana Box
    s3_y = s2_y - 12 - 95
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.0)
    c.roundRect(28, s3_y, usable_w, 95, 6, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9.0)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(38, s3_y + 78, shape_text("दैनिक वैदिक साधना एवं आध्यात्मिक उपाय:", FONT_BOLD, 9.0))

    sadhana_bullets = [
        "१. सूर्योपासना: प्रतिदिन प्रातःकालमा तामाको पात्रबाट भगवान् सूर्यलाई जल अर्पण (अर्घ्य) गरी गायत्री मन्त्रको जप गर्नु सर्वाङ्गीण स्वास्थ्य र यशका लागि उत्तम हुनेछ ।",
        "२. मातापिता सेवा: मातापिता र गुरुजनहरूको आशीर्वाद लिनु तथा कुलदेवताको नियमित स्मरण गर्नु सबैभन्दा ठूलो ग्रह रक्षा कवच मानिन्छ ।",
        "३. दान एवं परोपकार: औंसी, पूर्णिमा वा संक्रान्ति पर्वहरूमा गाईलाई घाँस, पशुपन्छीलाई दाना र असहायहरूलाई भोजन गराउनाले कुण्डलीका अरिष्टहरू नष्ट हुन्छन् ।"
    ]
    b_y = s3_y + 60
    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#2B2B2B"))
    for sb in sadhana_bullets:
        words = sb.split()
        cur_l = []
        sb_lines = []
        for w in words:
            if len(" ".join(cur_l + [w])) <= 108:
                cur_l.append(w)
            else:
                sb_lines.append(" ".join(cur_l))
                cur_l = [w]
        if cur_l:
            sb_lines.append(" ".join(cur_l))

        for l in sb_lines:
            c.drawString(38, b_y, shape_text(l, FONT_REGULAR, 7.8))
            b_y -= 11.5
        b_y -= 2.0
    c.restoreState()

    # Section 4: Universal Shantipaath Box
    s4_y = s3_y - 12 - 58
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFBEB"))
    c.setStrokeColor(colors.HexColor("#F59E0B"))
    c.setLineWidth(1.0)
    c.roundRect(28, s4_y, usable_w, 58, 6, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 8.2)
    c.setFillColor(colors.HexColor("#7A1C1C"))
    c.drawCentredString(page_w / 2.0, s4_y + 40, shape_text("॥ ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥", FONT_BOLD, 8.2))
    c.drawCentredString(page_w / 2.0, s4_y + 24, shape_text("॥ ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥", FONT_BOLD, 8.2))
    c.drawCentredString(page_w / 2.0, s4_y + 8, shape_text("॥ ॐ शान्तिः शान्तिः शान्तिः ॥", FONT_BOLD, 8.2))
    c.restoreState()

    # Section 5: Astrologer Certification & Signature Box
    s5_y = s4_y - 12 - 78
    c.saveState()
    c.setFillColor(colors.HexColor("#FFFEFA"))
    c.setStrokeColor(colors.HexColor("#E5C158"))
    c.setLineWidth(1.0)
    c.roundRect(28, s5_y, usable_w, 78, 6, fill=1, stroke=1)

    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawString(42, s5_y + 60, shape_text("ज्योतिषी / प्रमाणीकरण:", FONT_REGULAR, 7.8))

    astro_name = data.get("astrologer_name", "पं. ज्योतिषाचार्य")
    c.setFont(FONT_BOLD, 10.5)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(42, s5_y + 42, shape_text(astro_name, FONT_BOLD, 10.5))

    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#666666"))
    inst_txt = "वशिष्ठ ज्योतिष अनुसन्धान केन्द्र | "
    c.drawString(42, s5_y + 26, shape_text(inst_txt, FONT_REGULAR, 7.8))
    inst_w = pdfmetrics.stringWidth(shape_text(inst_txt, FONT_REGULAR, 7.8), FONT_REGULAR, 7.8)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#8B1E1E"))
    c.drawString(42 + inst_w, s5_y + 26, "www.basistha-jyotish.com")

    # Right side
    c.setFont(FONT_REGULAR, 7.8)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawString(page_w - 200, s5_y + 50, shape_text("ज्योतिषी हस्ताक्षर: ............................", FONT_REGULAR, 7.8))
    date_bs_val = data.get("date_bs", "२०५९ साल (वि.सं.)")
    c.drawString(page_w - 200, s5_y + 30, shape_text(f"प्रतिवेदन मिति: {to_dev_num(date_bs_val, lang)}", FONT_REGULAR, 7.8))
    c.restoreState()

    draw_page_footer(c, page_w, data, page_num=13, total_pages=13, lang=lang)
    c.showPage()

# -------------------------------------------------------------
# १२. मुख्य चिना PDF निर्माण प्रकार्य (Multi-Page Builder)
# -------------------------------------------------------------
def build_cheena_pdf(output_stream_or_path, data: Dict[str, Any], border_path: Optional[str] = None, ganesh_path: Optional[str] = None):
    """
    Builds the complete 13-page grand traditional Nepali Janmapatrika PDF:
    - Page 1: आमुख (Cover Overview)
    - Page 2: ग्रहस्पष्ट सारिणी एवं पञ्चधा मैत्री चक्र
    - Page 3: षोडशवर्ग चक्राणि भाग १ (D1 to D9)
    - Page 4: षोडशवर्ग चक्राणि भाग २ (D10 to D27)
    - Page 5: षोडशवर्ग चक्राणि भाग ३ (D30 to D60 + शास्त्रीय वर्गीकरण एवं वर्गबल)
    - Page 6: विंशोत्तरी कालचक्र (१२० वर्ष)
    - Page 7: त्रिभागी कालचक्र (८० वर्ष)
    - Page 8: योगिनी कालचक्र (३६ वर्ष)
    - Page 9: महादशा तथा अन्तर्दशा फल (सक्रिय दशा फल एवं श्लोक)
    - Page 10: महादशा तथा अन्तर्दशा फल (आगामी दशा फल एवं श्लोक)
    - Page 11: शास्त्रीय श्लोकबद्ध कुण्डली फलादेश (भावेश एवं ग्रह फल)
    - Page 12: विशेष जीवन फलादेश (व्यक्तित्व, व्यापार, विदेश, शिक्षा, परिवार)
    - Page 13: योग-दोष विचार, अनुकूल तत्व, दैनिक साधना एवं प्रमाणीकरण
    """
    setup_fonts()
    page_w, page_h = A4
    c = canvas.Canvas(output_stream_or_path, pagesize=A4)
    lang = data.get("language", "ne")
    doc_title = f"जन्मपत्रिका - {data.get('name', 'जातक')}" if lang == "ne" else f"Janmapatrika - {data.get('name', 'Native')}"
    c.setTitle(doc_title)

    total_pages = 13

    # Page 1: Cover Overview
    build_page_1_cover_and_overview(c, page_w, page_h, data, lang=lang)

    # Page 2: Graha Spashta & Panchadha Maitri
    build_page_2_graha_spashta_and_maitri(c, page_w, page_h, data, lang=lang)

    # Shodashavarga subsets for Pages 3, 4, 5
    vargas_p1 = [
        ("D1", "लग्न कुण्डली", "तनु चक्र"),
        ("D2", "होरा कुण्डली", "धन चक्र"),
        ("D3", "द्रेष्काण कुण्डली", "पराक्रम चक्र"),
        ("D4", "चतुर्थांश कुण्डली", "सम्पत्ति चक्र"),
        ("D7", "सप्तमांश कुण्डली", "सन्तति चक्र"),
        ("D9", "नवमांश कुण्डली", "धर्म / भाग्य चक्र"),
    ]
    vargas_p2 = [
        ("D10", "दशमांश कुण्डली", "कर्म चक्र"),
        ("D12", "द्वादशांश कुण्डली", "पितृ चक्र"),
        ("D16", "षोडशांश कुण्डली", "सुख चक्र"),
        ("D20", "विंशांश कुण्डली", "उपासना चक्र"),
        ("D24", "चतुर्विंशांश कुण्डली", "विद्या चक्र"),
        ("D27", "सप्तविंशांश कुण्डली", "बल चक्र"),
    ]
    vargas_p3 = [
        ("D30", "त्रिंशांश कुण्डली", "अरिष्ट चक्र"),
        ("D40", "खवेदांश कुण्डली", "संस्कार चक्र"),
        ("D45", "अक्षवेदांश कुण्डली", "चरित्र चक्र"),
        ("D60", "षष्ट्यंश कुण्डली", "प्रारब्ध चक्र"),
    ]

    # Page 3, 4, 5: Shodashavarga
    draw_shodashavarga_page(c, page_w, page_h, data, vargas_p1, page_num=3, total_pages=total_pages, lang=lang)
    draw_shodashavarga_page(c, page_w, page_h, data, vargas_p2, page_num=4, total_pages=total_pages, lang=lang)
    draw_shodashavarga_page(c, page_w, page_h, data, vargas_p3, page_num=5, total_pages=total_pages, lang=lang)

    # Page 6, 7, 8: Dasha Grids
    draw_dasha_grid_page(c, page_w, page_h, data, dasha_type="vimshottari", page_num=6, total_pages=total_pages, lang=lang)
    draw_dasha_grid_page(c, page_w, page_h, data, dasha_type="tribhagi", page_num=7, total_pages=total_pages, lang=lang)
    draw_dasha_grid_page(c, page_w, page_h, data, dasha_type="yogini", page_num=8, total_pages=total_pages, lang=lang)

    # Page 9 & 10: Dasha Phala Cards
    dasha_cards_p1 = data.get("dasha_phala_cards_p1", [])
    dasha_cards_p2 = data.get("dasha_phala_cards_p2", [])
    draw_dasha_phala_page(c, page_w, page_h, data, dasha_cards_p1, page_num=9, total_pages=total_pages, lang=lang)
    draw_dasha_phala_page(c, page_w, page_h, data, dasha_cards_p2, page_num=10, total_pages=total_pages, lang=lang)

    # Page 11: Bhavesh & Graha Phala
    build_page_11_bhavesh_and_graha_phala(c, page_w, page_h, data, lang=lang)

    # Page 12: Special Life Scopes (व्यक्तित्व, व्यापार, विदेश, शिक्षा, परिवार)
    build_page_12_life_scopes(c, page_w, page_h, data, page_num=12, total_pages=total_pages, lang=lang)

    # Page 13: Remedies & Certification
    build_page_13_remedies_and_certification(c, page_w, page_h, data, lang=lang)

    c.save()

# -------------------------------------------------------------
# १३. सहायक डेटा प्रदायक (Data Prep from Birth Details)
# -------------------------------------------------------------
CLASSICAL_NAVAGRAHA = [
    ("Sun", 0, "सूर्य", "सू"),
    ("Moon", 1, "चन्द्र", "चं"),
    ("Mars", 4, "मङ्गल", "मं"),
    ("Mercury", 2, "बुध", "बु"),
    ("Jupiter", 5, "गुरु", "गु"),
    ("Venus", 3, "शुक्र", "शु"),
    ("Saturn", 6, "शनि", "श"),
    ("Rahu", 10, "राहु", "रा"),
    ("Ketu", 11, "केतु", "के"),
]

VARGA_KEY_MAP = {
    "D1": "D1", "D2": "D2", "D3": "D3", "D4": "D4", "D7": "D7", "D9": "D9",
    "D10": "D10", "D12": "D12", "D16": "D16", "D20": "D20", "D24": "D24",
    "D27": "D27", "D30": "D30", "D40": "D40", "D45": "D45", "D60": "D60"
}

NAISARGIKA_MAITRI = {
    "Sun":     {"Moon": 1, "Mars": 1, "Jupiter": 1, "Mercury": 0, "Venus": -1, "Saturn": -1, "Rahu": -1, "Ketu": -1},
    "Moon":    {"Sun": 1, "Mercury": 1, "Mars": 0, "Jupiter": 0, "Venus": 0, "Saturn": 0, "Rahu": -1, "Ketu": -1},
    "Mars":    {"Sun": 1, "Moon": 1, "Jupiter": 1, "Venus": 0, "Saturn": 0, "Mercury": -1, "Rahu": -1, "Ketu": 1},
    "Mercury": {"Sun": 1, "Venus": 1, "Mars": 0, "Jupiter": 0, "Saturn": 0, "Moon": -1, "Rahu": 0, "Ketu": 0},
    "Jupiter": {"Sun": 1, "Moon": 1, "Mars": 1, "Saturn": 0, "Mercury": -1, "Venus": -1, "Rahu": 0, "Ketu": 1},
    "Venus":   {"Mercury": 1, "Saturn": 1, "Mars": 0, "Jupiter": 0, "Sun": -1, "Moon": -1, "Rahu": 1, "Ketu": 0},
    "Saturn":  {"Mercury": 1, "Venus": 1, "Jupiter": 0, "Sun": -1, "Moon": -1, "Mars": -1, "Rahu": 1, "Ketu": -1},
    "Rahu":    {"Venus": 1, "Saturn": 1, "Mercury": 0, "Jupiter": 0, "Sun": -1, "Moon": -1, "Mars": -1, "Ketu": -1},
    "Ketu":    {"Mars": 1, "Jupiter": 1, "Mercury": 0, "Venus": 0, "Saturn": -1, "Sun": -1, "Moon": -1, "Rahu": -1},
}

SAMVATSARA_60 = [
    "प्रभव", "विभव", "शुक्ल", "प्रमोद", "प्रजापति", "अङ्गिरा", "श्रीमुख", "भाव", "युवा", "धाता",
    "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृषप्रजा", "चित्रभानु", "सुभानु", "तारण", "पार्थिव", "व्यय",
    "सर्वजित्", "सर्वधारी", "विरोधी", "विकृत", "खर", "नन्दन", "विजय", "जय", "मन्मथ", "दुर्मुख",
    "हेमलम्ब", "विलम्ब", "विकारी", "शार्वरी", "प्लव", "शुभकृत्", "शोभन", "क्रोधी", "विश्वावसु", "पराभव",
    "प्लवङ्ग", "कीलक", "सौम्य", "साधारण", "विरोधकृत्", "परिधावी", "प्रमादी", "आनन्द", "राक्षस", "नल",
    "पिङ्गल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुन्दुभी", "रुधिरोद्गारी", "रक्ताक्ष", "क्रोधन", "क्षय"
]

NAKSHATRA_NAMAKSHARA = [
    ["चु", "चे", "चो", "ला"], ["ली", "लू", "ले", "लो"], ["अ", "ई", "उ", "ए"], ["ओ", "वा", "वी", "वू"],
    ["वे", "वो", "का", "की"], ["कु", "घ", "ङ", "छ"], ["के", "को", "हा", "ही"], ["हू", "हे", "हो", "डा"],
    ["डी", "डू", "डे", "डो"], ["मा", "मी", "मू", "मे"], ["मो", "टा", "टी", "टू"], ["टे", "टो", "पा", "पी"],
    ["पू", "ष", "ण", "ठ"], ["पे", "पो", "रा", "री"], ["रू", "रे", "रो", "ता"], ["ती", "तू", "ते", "तो"],
    ["ना", "नी", "नू", "ने"], ["नो", "या", "यी", "यू"], ["ये", "यो", "भा", "भी"], ["भू", "धा", "फा", "ढा"],
    ["भे", "भो", "जा", "जी"], ["खी", "खू", "खे", "खो"], ["गा", "गी", "गू", "गे"], ["गो", "सा", "सी", "सू"],
    ["से", "सो", "दा", "दी"], ["दू", "थ", "झ", "ञ"], ["दे", "दो", "चा", "ची"]
]

def query_shloka_from_db(category: str, planet: str, rashi_or_bhava: int) -> str:
    """Queries Sanskrit shloka from phalit_unicode.db if available."""
    if not SQLITE_PATH.exists():
        return ""
    try:
        conn = sqlite3.connect(str(SQLITE_PATH))
        cursor = conn.cursor()
        cursor.execute(
            "SELECT shloka FROM phalit WHERE category=? AND planet=? AND position=? LIMIT 1",
            (category, planet, rashi_or_bhava)
        )
        row = cursor.fetchone()
        conn.close()
        return row[0].strip() if row and row[0] else ""
    except Exception:
        return ""

def prepare_cheena_data_from_birth(
    year: int, month: int, day: int,
    hour: int, minute: int, second: float = 0.0,
    latitude: float = 27.7172, longitude: float = 85.3240, timezone_offset: float = 5.75,
    ayanamsha: str = "LAHIRI", house_system: str = "P",
    name: str = "जातक", father_name: str = "", mother_name: str = "",
    place: str = "काठमाडौँ", date_bs: str = "",
    astrologer_name: str = "पं. ज्योतिषाचार्य", language: str = "ne"
) -> Dict[str, Any]:
    """
    Computes complete data required for authentic 13-page Cheena report generation.
    """
    jd = get_julian_day(year, month, day, hour, minute, second, timezone_offset)
    ayan_val = get_ayanamsha_value(jd, ayanamsha)

    # 1. Lagna & Houses
    lagna_lon, cusps = calc_lagna_and_houses(jd, latitude, longitude, house_system, ayan_val)
    lagna_rashi_idx = int(lagna_lon / 30.0)
    lagna_rashi_id = lagna_rashi_idx + 1

    div_lagna = get_all_vargas_for_longitude(lagna_lon)

    # 2. Planetary Positions
    graha_spashta_detailed = []
    sun_lon = 0.0
    moon_lon = 0.0
    mars_house = 1
    planet_rashis_dict = {}
    div_planets = {}

    # Lagna row
    l_deg, l_min, l_sec = get_dms(lagna_lon % 30.0)
    l_dms = f"{l_deg:02d}॰ {l_min:02d}' {int(l_sec):02d}\""
    l_nak_idx = int(lagna_lon / (360.0 / 27.0))
    l_pada = int((lagna_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
    graha_spashta_detailed.append([
        "लग्न (तनु)", RASHI_NAMES_NE[lagna_rashi_idx].split()[0], l_dms,
        NAKSHATRA_NAMES_NE[l_nak_idx].split()[0], str(l_pada), "--", "केन्द्र (१)"
    ])

    for p_key, p_id, p_name_ne, p_abbr_ne in CLASSICAL_NAVAGRAHA:
        p_lon, p_speed = calc_planet_position(jd, p_id, ayan_val)
        if p_key == "Sun":
            sun_lon = p_lon
        elif p_key == "Moon":
            moon_lon = p_lon

        p_deg, p_min, p_sec = get_dms(p_lon % 30.0)
        p_rashi_idx = int(p_lon / 30.0)
        p_rashi_id = p_rashi_idx + 1
        planet_rashis_dict[p_key] = p_rashi_id

        p_house = ((p_rashi_id - lagna_rashi_id) % 12) + 1
        if p_key == "Mars":
            mars_house = p_house

        p_nak_idx = int(p_lon / (360.0 / 27.0))
        p_pada = int((p_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
        p_pada = min(4, max(1, p_pada))

        div_p = get_all_vargas_for_longitude(p_lon)
        div_planets[p_key] = div_p

        is_retro = (p_speed < 0 and p_id not in [10, 11])
        motion_txt = f"{'वक्री' if is_retro else 'मार्गी'} (भाव {to_dev_num(p_house, language)})"
        speed_str = f"{p_speed:.2f}"
        dms_str = f"{p_deg:02d}॰ {p_min:02d}' {int(p_sec):02d}\""

        p_disp = PLANET_NAMES_DISPLAY[language][p_key]
        r_disp = RASHI_NAMES_NE[p_rashi_idx].split()[0]
        nak_disp = NAKSHATRA_NAMES_NE[p_nak_idx].split()[0]

        graha_spashta_detailed.append([
            p_disp, r_disp, dms_str, nak_disp, str(p_pada), speed_str, motion_txt
        ])

    # Manglik Dosha
    is_manglik = mars_house in [1, 4, 7, 8, 12]

    # 3. Panchadha Maitri Table Rows
    planets_order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
    labels_rows = ["अतिमित्र", "मित्र", "सम", "शत्रु", "अतिशत्रु"]
    panchadha_table_rows = []

    rel_map = {p: {2: [], 1: [], 0: [], -1: [], -2: []} for p in planets_order}

    for p1 in planets_order:
        r1 = planet_rashis_dict.get(p1, 1)
        for p2 in planets_order:
            if p1 == p2:
                continue
            r2 = planet_rashis_dict.get(p2, 1)
            dist = (r2 - r1) % 12
            tatkalika = 1 if dist in [1, 2, 3, 9, 10, 11] else -1
            naisargika = NAISARGIKA_MAITRI.get(p1, {}).get(p2, 0)
            score = naisargika + tatkalika
            score = min(2, max(-2, score))
            p2_abbr = PLANET_ABBR_MAP[language][p2]
            rel_map[p1][score].append(p2_abbr)

    for score_val, lbl in [(2, "अतिमित्र"), (1, "मित्र"), (0, "सम"), (-1, "शत्रु"), (-2, "अतिशत्रु")]:
        row = [lbl]
        for p in planets_order:
            plist = rel_map[p][score_val]
            row.append(" ".join(plist) if plist else "—")
        panchadha_table_rows.append(row)

    # 4. Shodashavarga 16 Charts pre-calculation
    shodashavarga_charts = {}
    for code, full_key in VARGA_KEY_MAP.items():
        v_lagna = div_lagna.get(full_key, 1)
        v_signs = {h: ((v_lagna - 1 + (h - 1)) % 12) + 1 for h in range(1, 13)}
        v_planets = {h: [] for h in range(1, 13)}

        for p_key, p_id, _, _ in CLASSICAL_NAVAGRAHA:
            p_v_sign = div_planets[p_key].get(full_key, 1)
            p_v_house = ((p_v_sign - v_lagna) % 12) + 1
            abbr = PLANET_ABBR_MAP[language][p_key]
            p_lon, p_speed = calc_planet_position(jd, p_id, ayan_val)
            if p_speed < 0 and p_id not in [10, 11]:
                abbr_disp = f"{abbr}(व)"
            else:
                abbr_disp = abbr
            v_planets[p_v_house].append(abbr_disp)

        shodashavarga_charts[code] = {
            "lagna_sign": v_lagna,
            "signs": v_signs,
            "planets": v_planets
        }

    # 5. Panchanga & Avakahada
    panchang = get_panchang(year, month, day, latitude, longitude, timezone_offset, hour, minute, int(second))
    m_rashi_idx = int(moon_lon / 30.0)
    m_nak_idx = int(moon_lon / (360.0 / 27.0))
    m_pada = int((moon_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
    m_pada = min(4, max(1, m_pada))

    namakshar = NAKSHATRA_NAMAKSHARA[m_nak_idx][m_pada - 1]

    # 6. Dasha Grids (3x3)
    bs_shift = 57
    start_dt = datetime(year, month, day, hour, minute)

    # Vimshottari
    v_order = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
    v_years = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}

    nak_span = 360.0 / 27.0
    moon_in_nak = moon_lon % nak_span
    nak_num = int(moon_lon / nak_span)
    lord_idx = nak_num % 9
    first_lord = v_order[lord_idx]
    tot_y = v_years[first_lord]
    frac_left = 1.0 - (moon_in_nak / nak_span)

    vimshottari_grid = []
    c_date = start_dt
    for i in range(9):
        m_lord = v_order[(lord_idx + i) % 9]
        m_dur = v_years[m_lord] * (frac_left if i == 0 else 1.0)
        m_end = c_date + timedelta(days=m_dur * 365.2425)

        sub_list = []
        s_date = c_date
        sub_start_idx = v_order.index(m_lord)
        for j in range(9):
            s_lord = v_order[(sub_start_idx + j) % 9]
            s_frac = v_years[s_lord] / 120.0
            s_dur = m_dur * s_frac if i == 0 else v_years[m_lord] * s_frac
            s_end = s_date + timedelta(days=s_dur * 365.2425)
            bs_yr = s_end.year + bs_shift
            sub_list.append((PLANET_NAMES_DISPLAY[language][s_lord], f"{bs_yr}/{s_end.month:02d}/{s_end.day:02d}"))
            s_date = s_end

        m_bs_yr = m_end.year + bs_shift
        vimshottari_grid.append({
            "planet": PLANET_NAMES_DISPLAY[language][m_lord],
            "end_date_bs": f"{m_bs_yr}/{m_end.month:02d}/{m_end.day:02d}",
            "antardashas": sub_list
        })
        c_date = m_end

    # Tribhagi Grid
    tribhagi_grid = []
    c_date = start_dt
    for i in range(9):
        m_lord = v_order[(lord_idx + i) % 9]
        m_dur = (v_years[m_lord] * (80.0 / 120.0)) * (frac_left if i == 0 else 1.0)
        m_end = c_date + timedelta(days=m_dur * 365.2425)

        sub_list = []
        s_date = c_date
        sub_start_idx = v_order.index(m_lord)
        for j in range(9):
            s_lord = v_order[(sub_start_idx + j) % 9]
            s_dur = m_dur * (v_years[s_lord] / 120.0)
            s_end = s_date + timedelta(days=s_dur * 365.2425)
            bs_yr = s_end.year + bs_shift
            sub_list.append((PLANET_NAMES_DISPLAY[language][s_lord], f"{bs_yr}/{s_end.month:02d}/{s_end.day:02d}"))
            s_date = s_end

        m_bs_yr = m_end.year + bs_shift
        tribhagi_grid.append({
            "planet": PLANET_NAMES_DISPLAY[language][m_lord],
            "end_date_bs": f"{m_bs_yr}/{m_end.month:02d}/{m_end.day:02d}",
            "antardashas": sub_list
        })
        c_date = m_end

    # Yogini Grid
    yogini_names = ["मङ्गला", "पिङ्गला", "धान्या", "भ्रामरी", "भद्रिका", "उल्का", "सिद्धा", "सङ्कटा"]
    yogini_years = [1, 2, 3, 4, 5, 6, 7, 8]
    y_idx = (nak_num + 3) % 8
    first_y_dur = yogini_years[y_idx] * frac_left

    yogini_grid = []
    c_date = start_dt
    for i in range(8):
        cur_y_idx = (y_idx + i) % 8
        m_name = yogini_names[cur_y_idx]
        m_dur = yogini_years[cur_y_idx] * (frac_left if i == 0 else 1.0)
        m_end = c_date + timedelta(days=m_dur * 365.2425)

        sub_list = []
        s_date = c_date
        for j in range(8):
            sub_y_idx = (cur_y_idx + j) % 8
            s_name = yogini_names[sub_y_idx]
            s_dur = m_dur * (yogini_years[sub_y_idx] / 36.0)
            s_end = s_date + timedelta(days=s_dur * 365.2425)
            bs_yr = s_end.year + bs_shift
            sub_list.append((s_name, f"{bs_yr}/{s_end.month:02d}/{s_end.day:02d}"))
            s_date = s_end

        m_bs_yr = m_end.year + bs_shift
        yogini_grid.append({
            "planet": m_name,
            "end_date_bs": f"{m_bs_yr}/{m_end.month:02d}/{m_end.day:02d}",
            "antardashas": sub_list
        })
        c_date = m_end

    # 7. Dasha Phala Cards (Page 9 & 10)
    dasha_cards_p1 = [
        {
            "start_bs": "२०८०/०६/२४",
            "end_bs": "२०८३/०२/२८",
            "is_active": False,
            "title": "गुर्वन्तर्दशाफल (शुक्र महादशा - बृहस्पति अन्तर्दशा)",
            "shlokas": [
                "शुक्रस्यान्तर्गते जीवे स्वोच्चे स्वक्षेत्रकेन्द्रगे ।",
                "दायेशाच्छुभराशिस्थे भाग्ये वा पञ्चमेऽथवा ॥ ४५॥",
                "नष्टराज्याद्धनप्राप्तिरिष्टार्थाम्बरसम्पदः ।",
                "मित्रप्रभोः सम्मानं धनधान्यं तथैव च ॥ ४६॥",
                "राजसम्मानकीर्तिश्चाप्यान्दोलादिजं सुखम् ।",
                "विद्वत्प्रभुसमायातं शास्त्रपाठपरिश्रमम् ॥४७॥"
            ],
            "notes": [
                ("[शुभ फल]", "शुक्रको दशामा लग्नदेखि वा दशापति शुक्रदेखि केन्द्र, त्रिकोण स्थानमा, उच्च (कर्कट) राशिमा वा स्वराशि (धनु, मीन)मा अवस्थित बृहस्पतिको अन्तर्दशा भएमा नष्टराज्यबाट धनसम्पत्ति प्राप्ति, अभीष्ट धन, वस्त्र आदि प्राप्ति, राजसम्मान, कीर्ति, वाहनसुख, विद्वान् एवं प्रभुको शुभागमन हुनेछ।"),
                ("[सावधानी]", "दशापति शुक्रदेखि ६,१२ राशिमा पापग्रहयुक्त बृहस्पति छ भने अन्तर्दशाकालमा राज्यपक्ष एवं चोरबाट पीडा, शरीरपीडा, आफूमा रोगको उत्पत्ति, बन्धुवर्गमा कष्ट, स्थानान्तरण तथा विभिन्न रोगबाट पीडा बेहोर्नु पर्ने हुन्छ।"),
                ("[शान्ति विधान]", "यदि बृहस्पति द्वितीयेश एवं सप्तमेश छ भने शरीरबाधा हुनेछ। बाधा शान्तिका लागि महामृत्युञ्जय जप गर्नुपर्नेछ।")
            ],
            "height": 335
        },
        {
            "start_bs": "२०८३/०२/२८",
            "end_bs": "२०८६/०४/२५",
            "is_active": True,
            "title": "शन्यन्तर्दशाफल (शुक्र महादशा - शनि अन्तर्दशा)",
            "shlokas": [
                "शुक्रस्यान्तर्गते मन्दे स्वोच्चे तु परमोच्चगे ।",
                "स्वर्क्षकेन्द्रत्रिकोणस्थे तुङ्गांशे स्वांशगेऽपि वा ॥५२॥",
                "तद्भुक्तौ बहुसौख्यं स्यादिष्टबन्धुसमन्वयः ।",
                "सम्मानं राजभवने पुत्रिकाजननं शुभम् ॥५३॥",
                "पुण्यतीर्थफलावाप्तिः पुण्यं स्याद्दानधर्मयोः ।",
                "पदोन्नतिः प्रभुवरात् नीचगे क्लेशमादिशेत् ॥५४॥"
            ],
            "notes": [
                ("[शुभ फल]", "शुक्रको महादशामा शनिको अन्तर्दशा परेको समयमा यदि अन्तर्दशानाथ लग्न वा दशानाथदेखि केन्द्र, त्रिकोण वा लाभ स्थानमा उच्च वा स्वगृही भएमा राज्यबाट सम्मान, व्यापार-व्यवसायमा लाभ, धनधान्यको वृद्धि, गृह, वाहन तथा भौतिक सुख-सुविधाको विस्तार हुनेछ।"),
                ("[सावधानी]", "यदि शनि नीच, अस्त, शत्रुक्षेत्री वा ६, ८, १२ भावमा अवस्थित भएमा कार्यमा अनावश्यक बाधा, धनक्षय, मानसिक उद्वेग, पारिवारिक असमझदारी वा रोगको भय रहन सक्छ।"),
                ("[शान्ति विधान]", "यदि अन्तर्दशानाथ द्वितीय वा सप्तम भाव (मारक स्थान) मा रहेमा शारीरिक कष्ट वा स्वास्थ्य बाधा हुन सक्ने भएकाले इष्टदेवको आराधना, शिवसहस्रनाम वा महामृत्युञ्जय मन्त्र जप गर्दा सम्पूर्ण अरिष्ट निवारण भई शुभ फल प्राप्त हुनेछ।")
            ],
            "height": 335
        }
    ]

    dasha_cards_p2 = [
        {
            "start_bs": "२०८६/०४/२५",
            "end_bs": "२०८९/०२/२८",
            "is_active": False,
            "title": "बुधान्तर्दशाफल (शुक्र महादशा - बुध अन्तर्दशा)",
            "shlokas": [
                "शुक्रस्यान्तर्गते सौम्ये केन्द्रे लाभत्रिकोणगे ।",
                "स्वोच्चे वा स्वर्क्षगे वापि राजप्रीतिः शुभावहा ॥५८॥",
                "सौभाग्यं पुत्रलाभश्च धनलाभः सदध्वना ।",
                "पुराणधर्मश्रवणं शृङ्गारिजनसंगमः ॥५९॥",
                "इष्टबन्धुजनाकीर्णे गेहे नृपसमागमः ।",
                "स्वप्रभोः महत्सौख्यं नित्यं मिष्टान्नभोजनम् ॥६०॥"
            ],
            "notes": [
                ("[शुभ फल]", "शुक्रको दशामा जन्मलग्नदेखि त्रिकोणस्थान, एकादशस्थान एवं केन्द्रस्थानमा अवस्थित, उच्च गृही (६ राशि) वा स्वगृही (३,६ राशि) बुधको अन्तर्दशा भएमा राज्यलाभ, अत्यन्त सुख, सत्कथा श्रवण, दानधर्म, सिद्धि, सुखवृद्धि, भूमि एवं सन्तति लाभ हुनेछ।"),
                ("[सावधानी]", "दशापति शुक्रदेखि ६,८,१२ स्थानमा पापग्रहयुक्त वा दृष्ट निर्बल बुधको अन्तर्दशा भएमा चौपाया नाश, परगृहनिवास, मानसिक विकलता, सर्वत्र व्यवहारमा धननाश हुनेछ।"),
                ("[शान्ति विधान]", "यदि बुध सप्तमेश छ भने शारीरिक दुःखकष्ट हुनेछ। दोष शान्तिका लागि विष्णु सहस्रनामको पाठ एवं जप गर्नुपर्दछ।")
            ],
            "height": 335
        },
        {
            "start_bs": "२०८९/०२/२८",
            "end_bs": "२०९०/०४/२५",
            "is_active": False,
            "title": "केत्वन्तर्दशाफल (शुक्र महादशा - केतु अन्तर्दशा)",
            "shlokas": [
                "शुक्रस्यान्तर्गते केतौ स्वोच्चे वा स्वक्षैसंयुते ।",
                "योगकारकसम्बन्धे शुभग्रहनिरन्तरम् ॥६४॥",
                "शुभं फलं महत्प्राप्तिः पुत्रलाभः सुखावहः ।",
                "शत्रुक्षयकरो नित्यं धनधान्यविवर्धनम् ॥६५॥"
            ],
            "notes": [
                ("[शुभ फल]", "शुक्रको महादशामा केतुको अन्तर्दशा परेको समयमा केतु उच्च वा शुभग्रहको युति वा दृष्टिमा भएमा आत्मिक शान्ति, आकस्मिक धनलाभ, तीर्थयात्रा, धार्मिक अनुष्ठान र शत्रुमाथि विजय हुनेछ।"),
                ("[सावधानी]", "यदि केतु अशुभ स्थान वा पापयुक्त भएमा टाउको दुख्ने, शिरोपीडा, विषभय, अग्निभय तथा पारिवारिक विवाद हुन सक्छ।"),
                ("[शान्ति विधान]", "केतु दोष निवारणका लागि गणेशजीको उपासना तथा सङ्कटनाशन स्तोत्रको नित्य पाठ गर्नु शुभप्रद हुनेछ।")
            ],
            "height": 335
        }
    ]

    # 8. Bhavesha Phala Cards (Page 11)
    bhavesh_phala_cards = [
        {
            "badge": "प्रथम भाव (लग्नेश फल)",
            "title": f"लग्नेश ({PLANET_NAMES_DISPLAY[language].get('Sun', 'सूर्य')}) : भाव ५ मा स्थित फल",
            "shlokas": [
                "लग्नेशे पुत्रगे क्रोधी सुतसौख्यं च मध्यमम् ।",
                "प्रथमापत्यनाशः स्यान्मानवान् राजवल्लभः ॥"
            ],
            "explanation": "लग्नेश कुण्डलीको ५ भावमा बस्नाले जातक शारीरिक रूपमा सुदृढ, आत्मविश्वासी, दृढ सङ्कल्पवान् र समाजमा सम्मानित हुनेछन् । आफ्नो पराक्रम र विद्याबाट जीवनमा विशिष्ट सफलता प्राप्त हुनेछ ।",
            "height": 160
        },
        {
            "badge": "नवम भाव (भाग्येश फल)",
            "title": f"भाग्येश ({PLANET_NAMES_DISPLAY[language].get('Mars', 'मङ्गल')}) : भाव ४ मा स्थित फल",
            "shlokas": [
                "भाग्येशे सुखगे जातो जननी-भक्तिसंयुतः ।",
                "सर्वसम्पद् गेह-यान-सौख्ययुक्तो भवेज्जनः ॥"
            ],
            "explanation": "भाग्यभावको स्वामी ग्रह ४ भावमा रहँदा जातक धर्मपरायण, ईश्वरभक्त, गुरुजनप्रति निष्ठावान् र भाग्यमानी रहनेछन् । सत्कर्म र पुरुषार्थद्वारा जीवनमा प्रचुर समृद्धि र मान-प्रतिष्ठा आर्जन हुनेछ ।",
            "height": 160
        },
        {
            "badge": "दशम भाव (कर्मेश फल)",
            "title": f"कर्मेश ({PLANET_NAMES_DISPLAY[language].get('Venus', 'शुक्र')}) : भाव ४ मा स्थित फल",
            "shlokas": [
                "दशमेशे तु तुर्यस्थे गुणाढ्यो सुखितो धनी ।",
                "मातृभक्तो धरा धाम-यानोपेतो भवेन्नरः ॥"
            ],
            "explanation": "कर्मक्षेत्रको स्वामी ग्रह शुभ स्थानमा रहँदा जातकको पेशा, व्यवसाय तथा प्रशासनिक दायित्वमा निरन्तर उन्नति रहनेछ । कुलको कीर्ति बढाउने, जिम्मेवार र न्यायप्रिय व्यक्तित्व बन्ने योग बन्दछ ।",
            "height": 160
        },
        {
            "badge": "ग्रहगत फल",
            "title": "सूर्य ग्रह : भाव ५ मा स्थित फल प्रभाव",
            "shlokas": [
                "तनयगतदिनेशे शैशवे दुःखभागी न भवति धनभागी यौवने व्याधियुक्तः ।",
                "जनयति सुतमेकं, चान्यगेहं शूर-श्चपलमतिविलासी क्रुरकर्मा कुचेताः ॥"
            ],
            "explanation": "कुशाग्र बुद्धि, मन्त्रशक्ति, राजनीतिक चातुर्य तथा सिर्जनशील प्रतिभा । शुभ फल: उच्च विद्या, निर्णय क्षमता, परामर्श तथा सल्लाहकार भूमिकामा ख्याति । सावधानी: सन्तान पक्षसँग वैचारिक भिन्नतामा संयम राख्नुपर्छ।",
            "height": 168
        }
    ]

    # Predictions Object for remedies & life scopes (Page 12 & 13)
    predictions = generate_cheena_predictions(
        lagna_rashi=lagna_rashi_id,
        moon_rashi=m_rashi_idx + 1,
        planet_rashis=planet_rashis_dict,
        current_mahadasha="Jupiter",
        lang=language
    )

    samvat_idx = (year + 11) % 60
    samvatsara_name = SAMVATSARA_60[samvat_idx]

    s_rashi_idx = int(sun_lon / 30.0)
    ayana = "दक्षिणायन" if s_rashi_idx in [3, 4, 5, 6, 7, 8] else "उत्तरायण"
    ritus = ["वसन्त", "वसन्त", "ग्रीष्म", "ग्रीष्म", "वर्षा", "वर्षा", "शरद्", "शरद्", "हेमन्त", "हेमन्त", "शिशिर", "शिशिर"]
    ritu = ritus[s_rashi_idx]
    masas = ["वैशाख", "ज्येष्ठ", "आषाढ", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन", "चैत्र"]
    masa = masas[s_rashi_idx]

    tithi_num = panchang["tithi"]["number"]
    paksha = "शुक्ल" if tithi_num <= 15 else "कृष्ण"

    ishta_dict = panchang.get("ishtakala", {})
    ishta_str = f"{ishta_dict.get('ghati', 0)}:{ishta_dict.get('pala', 0):02d}:{ishta_dict.get('vipala', 0):02d}"

    if not date_bs:
        date_bs = f"{year + bs_shift} साल पुस २६ गते"

    birth_time_str = f"{hour:02d}:{minute:02d}:{int(second):02d}"
    lat_str = f"{abs(latitude):.4f}"
    lon_str = f"{abs(longitude):.4f}"

    date_ad_str = f"{year:04d}-{month:02d}-{day:02d}"
    en_months_ne = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"]
    en_month_ne = en_months_ne[month - 1]

    # DMS Ayanamsha
    a_deg, a_min, a_sec = get_dms(ayan_val)
    ayan_dms_str = f"{a_deg:02d}॰ {a_min:02d}' {int(a_sec):02d}\""

    return {
        "name": name,
        "gender": "पुरुष",
        "gotra": "वशिष्ठ",
        "father_name": father_name,
        "mother_name": mother_name,
        "date_bs": date_bs,
        "date_ad": date_ad_str,
        "ad_month_ne": en_month_ne,
        "ad_day": str(day),
        "birth_time": birth_time_str,
        "vaara": panchang.get("day_of_week_ne", "शुक्र"),
        "place": place,
        "lat": lat_str,
        "lon": lon_str,
        "ishtakaal": ishta_str,
        "samvatsara": samvatsara_name,
        "shake": str(year - 78),
        "ayana": ayana,
        "ritu": ritu + " ऋतु",
        "masa": masa,
        "paksha": paksha,
        "tithi": panchang["tithi"]["name_ne"] + " तिथि",
        "nakshatra": panchang["nakshatra"]["name_ne"],
        "charan": str(m_pada),
        "namakshar": namakshar,
        "lagna": RASHI_NAMES_NE[lagna_rashi_idx].split()[0],
        "rashi": RASHI_NAMES_NE[m_rashi_idx].split()[0],
        "gana": "देव",
        "nadi": "अन्त्य",
        "varna": "ब्राह्मण",
        "vashya": "जलचर",
        "yoni": "गज",
        "paya": "लौह",
        "ayanamsha_dms": ayan_dms_str,
        "graha_spashta_detailed": graha_spashta_detailed,
        "panchadha_table_rows": panchadha_table_rows,
        "shodashavarga_charts": shodashavarga_charts,
        "vimshottari_grid": vimshottari_grid,
        "vimshottari_balance_text": f"{int(frac_left * tot_y)} वर्ष {int((frac_left * tot_y % 1) * 12)} महिना",
        "tribhagi_grid": tribhagi_grid,
        "tribhagi_balance_text": f"{int(frac_left * tot_y * 80/120)} वर्ष {int((frac_left * tot_y * 80/120 % 1) * 12)} महिना",
        "yogini_grid": yogini_grid,
        "yogini_balance_text": f"{int(first_y_dur)} वर्ष {int((first_y_dur % 1) * 12)} महिना",
        "dasha_phala_cards_p1": dasha_cards_p1,
        "dasha_phala_cards_p2": dasha_cards_p2,
        "bhavesh_phala_cards": bhavesh_phala_cards,
        "is_manglik": is_manglik,
        "predictions": predictions,
        "astrologer_name": astrologer_name,
        "language": language
    }

if __name__ == "__main__":
    output_filename = "cheena_sample_exact_template.pdf"
    sample_data = prepare_cheena_data_from_birth(
        year=2003, month=1, day=10, hour=21, minute=30, second=0.0,
        latitude=27.1667, longitude=87.7500, timezone_offset=5.75, place="पाँचथर, नेपाल",
        name="चीदानन्द", father_name="टीकाराम", mother_name="विष्णुमाया",
        astrologer_name="पं. ज्योतिषाचार्य", language="ne"
    )
    build_cheena_pdf(output_filename, sample_data)
    print(f"Generated {output_filename} successfully!")
