# Basistha Astronomical & Astrological Backend Engine

**Basistha (वसिष्ठ)** is an enterprise-grade astrological and astronomical calculation backend API written in **Python (FastAPI)**. It provides a complete mathematical calculation suite powered by **NASA JPL Swiss Ephemeris (`pyswisseph`)** and classical Vedic mathematical treatises (**Surya Siddhanta & Brihat Parashara Hora Shastra**).

---

## 🌟 मुख्य विशेषताहरू (Key Features)

1. **स्पष्ट लग्न र ग्रह साधन (Horoscope / Janmakundali):**
   * ९ ग्रहहरू (सूर्यदेखि केतुसम्म), लग्न, भाव चलित चक्र (Placidus, Sripati, Whole Sign)।
   * राशि, अंश, कला, विकला, नक्षत्र, चरण, गति, वक्री/मार्गी, र अस्त स्थिति।
   * **षोडशवर्ग चक्रहरू ($D_1$ देखि $D_{60}$):** D1, D2, D3, D4, D7, D9, D10, D12, D16, D30, D60।
2. **दैनिक पञ्चाङ्ग तथा मुहूर्त (Daily Panchang & Muhurta):**
   * स्थानीय सूर्योदय, सूर्यास्त, दिनमान र रात्रिमान।
   * ५ अङ्ग: **तिथि, वार, नक्षत्र, योग, करण** को समाप्ति समय र घटी-पला।
   * **चौघडिया/बारवेला** (दिन र रातका ८-८ चौघडियाहरू), **अभिजित मुहूर्त**, र **राहुकाल**।
3. **बहु-दशा प्रणाली (Multi-Dasha Systems):**
   * **विंशोत्तरी महादशा (१२० वर्ष):** ५ तह (महादशा $\rightarrow$ अन्तर्दशा $\rightarrow$ प्रत्यन्तर) सम्मको सटीक मिति सहित।
   * **योगिनी दशा (३६ वर्ष):** ८ योगिनीहरूको चक्र।
4. **ग्रह बल तथा अष्टकवर्ग (Shadbala & Ashtakavarga):**
   * **षड्बल:** स्थान बल, दिग्बल, काल बल, चेष्टा बल, नैसर्गिक बल, र दृग्बल (रूप र षष्ट्यंशमा)।
   * **अष्टकवर्ग:** भिन्नाष्टकवर्ग (BAV), सामुदायिकाष्टकवर्ग (SAV - ३३७ बिन्दु), त्रिकोण शोधन र शोध्य पिण्ड।
5. **ताजिक वर्षफल (Annual Varshaphala):**
   * वर्षप्रवेश सटीक समय, वर्ष लग्न, **मुन्था राशि**, **वर्षेश (वर्षको स्वामी)**।
   * १६ ताजिक योगहरू (इत्थशाल, ईशराफ, नक्त, आदि), ५० सहमहरू, र **मुद्दा दशा (३६५ दिनको)**।
6. **कुण्डली मिलान (Matchmaking):**
   * वर र वधूको **अष्टकूट ३६ गुण मिलान** (वर्ण १, वश्य २, तारा ३, योनि ४, ग्रहमैत्री ५, गण ६, भकूट ७, नाडी ८)।
   * **मङ्गल दोष (माङ्गलिक विचार)** र परिहार विश्लेषण।

---

## 🚀 स्थापना तथा चलाउने तरिका (Installation & Quickstart)

### १. आवश्यकता (Prerequisites)
* Python 3.10 वा नयाँ संस्करण

### २. भर्चुअल इन्भायरोन्मेन्ट बनाउने र निर्भरताहरू इन्स्टल गर्ने
```bash
cd basistha-backend

# भर्चुअल इन्भायरोन्मेन्ट बनाउने
python -m venv venv

# सक्रिय (Activate) गर्ने:
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# आवश्यक प्याकेजहरू इन्स्टल गर्ने
pip install -r requirements.txt
```

### ३. सर्भर सुरु गर्ने
```bash
python run.py
```
* **API Home:** `http://localhost:8000`
* **इन्टरएक्टिभ Swagger Docs:** `http://localhost:8000/docs`
* **Redoc Documentation:** `http://localhost:8000/redoc`

---

## 📡 मुख्य API Endpoints

| विधि (Method) | Endpoint | विवरण |
| :--- | :--- | :--- |
| `POST` | `/api/v1/kundali/calculate` | पूर्ण जन्मकुण्डली, ९ ग्रह, भाव र षोडशवर्ग गणना |
| `POST` | `/api/v1/panchang/daily` | दैनिक पञ्चाङ्ग, सूर्योदय, चौघडिया र राहुकाल |
| `POST` | `/api/v1/dasha/vimshottari` | विंशोत्तरी महादशा र अन्तर्दशा वृक्ष |
| `POST` | `/api/v1/dasha/yogini` | योगिनी दशा (३६ वर्ष) |
| `POST` | `/api/v1/strength/shadbala` | षड्बल साधन (६-बल, रूप र र्‍याङ्किङ) |
| `POST` | `/api/v1/strength/ashtakvarga` | अष्टकवर्ग (BAV, SAV र त्रिकोण शोधन) |
| `POST` | `/api/v1/varshaphala/calculate` | ताजिक वर्षफल, मुन्था, सहम र मुद्दा दशा |
| `POST` | `/api/v1/matchmaking/ashtakoota`| अष्टकूट ३६ गुण मिलान र मङ्गल दोष |

---

## 📝 API Request उदाहरण (cURL Example)

### कुण्डली गणना (`/api/v1/kundali/calculate`):
```bash
curl -X POST "http://localhost:8000/api/v1/kundali/calculate" \
     -H "Content-Type: application/json" \
     -d '{
       "year": 2026,
       "month": 10,
       "day": 22,
       "hour": 14,
       "minute": 30,
       "second": 0,
       "latitude": 27.7172,
       "longitude": 85.3240,
       "timezone_offset": 5.75,
       "ayanamsha": "LAHIRI",
       "house_system": "P"
     }'
```
