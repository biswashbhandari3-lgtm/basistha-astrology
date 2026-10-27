"""
Basistha Astrological Engine
Comprehensive Phalit (Predictive Astrology) Generator for Cheena PDF
Provides structured interpretations for:
1. मुख्य फलादेश (General Personality & Life)
2. व्यापार तथा आजीविका फलादेश (Business, Career & Wealth)
3. विदेश यात्रा तथा बसोबास फलादेश (Foreign Travel & Settlement)
4. पारिवारिक विवरण तथा वैवाहिक फलादेश (Family & Marriage)
5. शिक्षादीक्षा र धर्मकर्म विशेष फलादेश (Education & Spirituality)
6. महादशा फलादेश (Vedic Mahadasha Interpretations)
7. शुभ रत्न तथा रुद्राक्ष (Benefic Gemstones & Remedies)
"""
from typing import Dict, Any, Optional

# Rashi Lords (1: Aries to 12: Pisces)
RASHI_LORDS = {
    1: ("MARS", "मङ्गल"), 2: ("VENUS", "शुक्र"), 3: ("MERCURY", "बुध"),
    4: ("MOON", "चन्द्र"), 5: ("SUN", "सूर्य"), 6: ("MERCURY", "बुध"),
    7: ("VENUS", "शुक्र"), 8: ("MARS", "मङ्गल"), 9: ("JUPITER", "बृहस्पति"),
    10: ("SATURN", "शनि"), 11: ("SATURN", "शनि"), 12: ("JUPITER", "बृहस्पति")
}

# 1. मुख्य फलादेश (General Life & Temperament) by Lagna Rashi
LAGNA_PREDICTIONS = {
    1: {
        "ne": "मेष लग्नमा जन्म भएकाले तपाईं साहसी, ऊर्जावान्, दृढनिश्चयी र नेतृत्व क्षमताले युक्त हुनुहुन्छ। स्वतन्त्र विचार, स्वाभिमान र कुनै पनि काम द्रुत गतिमा सम्पन्न गर्ने तपाईंको विशेष स्वभाव हो। स्वास्थ्य सामान्यतया सबल रहनेछ, यद्यपि रिस र हतारमा निर्णय लिने बानीमा संयम राख्नु हितकर हुन्छ।",
        "en": "Born in Aries Ascendant, you are energetic, courageous, determined, and possess natural leadership abilities. You value independence and initiative. Maintaining calm during hasty decisions will bring sustained success."
    },
    2: {
        "ne": "वृष लग्नमा जन्म भएकाले तपाईं गम्भीर, धैर्यवान्, कलाप्रेमी र व्यावहारिक स्वभावको हुनुहुन्छ। धनसञ्चय, भौतिक सुखसुविधा र स्थिरता तपाईंको प्राथमिकतामा पर्दछन्। मित्र र परिवारप्रति निष्ठावान् रहनुहुनेछ। भोजन र सौन्दर्यप्रति विशेष रुचि रहनेछ।",
        "en": "With Taurus Ascendant, you possess stability, patience, artistic taste, and practical wisdom. You excel in financial accumulation and value loyalty, aesthetics, and enduring security."
    },
    3: {
        "ne": "मिथुन लग्नमा जन्म भएकाले तपाईं तीव्र बुद्धियुक्त, बहुमुखी प्रतिभाका धनी, सञ्चारकुशल र अध्ययनशील हुनुहुन्छ। नवीन विचारहरूको खोजी र द्रुत सिकाइ तपाईंको मुख्य शक्ति हो। लेखन, बौद्धिक विमर्श र सामाजिक सम्बन्धमा तपाईं अग्रणी रहनुहुनेछ।",
        "en": "Gemini Ascendant grants high intellect, versatile talent, excellent communication skills, and adaptability. You are curious, witty, and thrive in intellectual and social pursuits."
    },
    4: {
        "ne": "कर्कट लग्नमा जन्म भएकाले तपाईं संवेदनशील, दयालु, कल्पनाशील र परिवारप्रति गहिरो समर्पण राख्ने स्वभावको हुनुहुन्छ। समाजसेवा, जनसम्पर्क र मातृवात्सल्य तपाईंमा प्रचुर रहन्छ। मानसिक भावुकतालाई नियन्त्रणमा राखी अगाडि बढेमा ठूलो प्रतिष्ठा प्राप्त हुन्छ।",
        "en": "Cancer Ascendant makes you intuitive, emotionally deep, caring, and attached to home and family. Balancing emotional sensitivity with practical resolve leads to high respect and popularity."
    },
    5: {
        "ne": "सिंह लग्नमा जन्म भएकाले तपाईं तेजस्वी, स्वाभिमानी, उदार र राजसी व्यक्तित्वका धनी हुनुहुन्छ। अन्याय नसहने, सत्यको पक्ष लिने र उच्च प्रशासनिक वा नेतृत्वदायी भूमिकामा चम्किने योग छ। समाजमा मान-सम्मान र प्रतिष्ठा स्वाभाविक रूपमा प्राप्त हुनेछ।",
        "en": "Leo Ascendant bestows royal charisma, self-respect, magnanimity, and command. You naturally gravitate towards leadership, executive responsibility, and widespread social honor."
    },
    6: {
        "ne": "कन्या लग्नमा जन्म भएकाले तपाईं विश्लेषणात्मक, विवेकशील, कर्तव्यनिष्ठ र सूक्ष्मदर्शी हुनुहुन्छ। हरेक कार्यलाई पूर्णताका साथ सम्पादन गर्ने क्षमता छ। स्वास्थ्य, लेखा, व्यवस्थापन र बौद्धिक क्षेत्रमा तपाईंको विशेष दखल रहनेछ।",
        "en": "Virgo Ascendant imparts methodical precision, sharp analytical intellect, duty-consciousness, and organizational excellence. You excel in management, data, and problem-solving."
    },
    7: {
        "ne": "तुला लग्नमा जन्म भएकाले तपाईं सन्तुलित, न्यायप्रिय, सौम्य र कूटनीतिक स्वभावको हुनुहुन्छ। कला, संस्कृति, साझेदारी र सामाजिक सामञ्जस्यमा तपाईं विशेष सफल रहनुहुनेछ। सबैलाई समेटेर अघि बढ्ने तपाईंको नीतिले उच्च आदर दिलाउनेछ।",
        "en": "Libra Ascendant provides harmony, sense of justice, diplomatic finesse, and refined aesthetic appreciation. You build strong partnerships and maintain gracious social relationships."
    },
    8: {
        "ne": "वृश्चिक लग्नमा जन्म भएकाले तपाईं दृढ संकल्पी, गूढ रहस्यवेत्ता, साहसी र गम्भीर प्रवृत्तिका हुनुहुन्छ। बाधा-अड्चनलाई सामना गरेर पुनरुत्थान गर्ने अद्भूत आत्मबल तपाईंमा छ। अनुसन्धान, रक्षा र प्राविधिक क्षेत्रमा विशेष सफलता मिल्नेछ।",
        "en": "Scorpio Ascendant gives profound willpower, passion, resilience, and depth. You excel in uncovering hidden truths, overcoming obstacles, and emerging victorious in crisis."
    },
    9: {
        "ne": "धनु लग्नमा जन्म भएकाले तपाईं दार्शनिक, आशावादी, धर्मपरायण र ज्ञानपिपासु हुनुहुन्छ। उच्च आदर्श, सत्यनिष्ठा र गुरुजनप्रतिको भक्तिले तपाईंलाई जीवनमा उच्च पद र भाग्यको साथ दिलाउनेछ। समाजलाई मार्गदर्शन गर्ने क्षमता रहनेछ।",
        "en": "Sagittarius Ascendant brings philosophical wisdom, optimism, righteous values, and spiritual inclination. Your adherence to truth and higher learning attracts fortune and mentorship."
    },
    10: {
        "ne": "मकर लग्नमा जन्म भएकाले तपाईं कर्मठ, अनुशासित, धैर्यवान् र दूरदर्शी हुनुहुन्छ। कठिन परिश्रमबाट शून्यबाट शिखरसम्म पुग्ने दृढता तपाईंमा हुन्छ। संगठनात्मक क्षमता र दीर्घकालीन योजनाबाट जीवनको उत्तरार्ध अत्यन्त समुन्नत रहनेछ।",
        "en": "Capricorn Ascendant gives immense discipline, pragmatic realism, patience, and executive resilience. Through steady perseverance, you rise to authoritative positions and lasting legacy."
    },
    11: {
        "ne": "कुम्भ लग्नमा जन्म भएकाले तपाईं नवीन सोचयुक्त, मानवतावादी, मौलिक र अनुसन्धानशील स्वभावको हुनुहुन्छ। समाज सुधार, प्रविधि र सामूहिक हितका कार्यमा तपाईंको विशेष चासो रहन्छ। तपाईंको दृष्टिकोण समयभन्दा अगाडिको रहनेछ।",
        "en": "Aquarius Ascendant grants progressive vision, humanitarian compassion, inventive intellect, and independence. You contribute meaningfully to societal progress and technology."
    },
    12: {
        "ne": "मीन लग्नमा जन्म भएकाले तपाईं करुणामय, आध्यात्मिक, शान्तप्रिय र परोपकारी हुनुहुन्छ। अन्तर्ज्ञान, कलात्मक कल्पना र आध्यात्मिक साधनामा तपाईंको विशेष रुचि रहन्छ। समाजमा परोपकार र सल्लाहकारको रूपमा सम्मानित स्थान प्राप्त हुनेछ।",
        "en": "Pisces Ascendant bestows deep compassion, intuition, artistic imagination, and spiritual grace. You naturally inspire others through counseling, philanthropy, and noble service."
    }
}

# 2. व्यापार तथा आजीविका फलादेश (Business & Career) by 10th House
BUSINESS_PREDICTIONS = {
    1: {
        "ne": "दशम भावमा मेष राशि रहेकाले प्रशासनिक, प्राविधिक, सैन्य, धातु वा आफ्नै एकल स्वामित्वको व्यापारमा उच्च सफलता मिल्नेछ। जोखिम मोल्ने साहसले व्यवसायमा अग्रणी बनाउनेछ।",
        "en": "With Aries in the 10th house, you thrive in administrative, technical, engineering, or self-driven entrepreneurial ventures requiring initiative and courage."
    },
    2: {
        "ne": "दशम भावमा वृष राशि रहेकाले बैंकिङ, वित्त, सौन्दर्य प्रसाधन, खाद्य, कृषि वा बहुमूल्य वस्तुको व्यापारबाट प्रचुर धनलाभ हुनेछ। स्थिरता र गुणस्तर तपाईंको व्यवसायिक पहिचान बन्नेछ।",
        "en": "Taurus in the 10th house favors banking, financial services, luxury commodities, food industry, and real estate, promising steady prosperity."
    },
    3: {
        "ne": "दशम भावमा मिथुन राशि रहेकाले सञ्चार, पत्रकारिता, सूचना प्रविधि, प्रकाशन, व्यापारिक एजेन्सी वा परामर्श सेवाबाट उन्नति हुनेछ। बौद्धिक व्यापारमा विशेष लाभ हुनेछ।",
        "en": "Gemini in the 10th house points to success in IT, media, publishing, brokerage, marketing, and intellectual consultancy."
    },
    4: {
        "ne": "दशम भावमा कर्कट राशि रहेकाले जलसम्बन्धी व्यवसाय, दुग्ध व्यवसाय, पर्यटन, होटल, शिक्षा वा जनसम्पर्क क्षेत्रमा विशेष लाभ हुनेछ। जनतासँग प्रत्यक्ष जोडिएका काममा यश मिल्नेछ।",
        "en": "Cancer in the 10th house aligns with hospitality, education, public relations, water resources, real estate, and consumer goods."
    },
    5: {
        "ne": "दशम भावमा सिंह राशि रहेकाले सरकारी सेवा, उच्च व्यवस्थापन, राजनीतिक नेतृत्व वा ठूला उद्योगको सञ्चालनबाट कीर्ति र लाभ मिल्नेछ। मातहतका कर्मचारीलाई नेतृत्व दिने क्षमता रहनेछ।",
        "en": "Leo in the 10th house indicates leadership in public administration, corporate governance, politics, and prestigious government-linked contracts."
    },
    6: {
        "ne": "दशम भावमा कन्या राशि रहेकाले लेखापरीक्षण, वित्तीय योजना, औषधी, स्वास्थ्य सेवा, सफ्टवेयर र कानुनी परामर्शमा विशिष्ट सफलता मिल्नेछ। कार्यदक्षताले व्यवसाय विस्तार हुनेछ।",
        "en": "Virgo in the 10th house favors auditing, health sciences, legal analysis, pharmaceuticals, software testing, and operational logistics."
    },
    7: {
        "ne": "दशम भावमा तुला राशि रहेकाले व्यापारिक साझेदारी, आयात-निर्यात, फेसन, कानुनी सेवा र सामाजिक मध्यस्थतामा ठूलो प्रगति हुने योग छ। जनसम्पर्कबाट आर्थिक लाभ हुनेछ।",
        "en": "Libra in the 10th house brings great prosperity through partnerships, trade diplomacy, import-export, law, and high-end merchandising."
    },
    8: {
        "ne": "दशम भावमा वृश्चिक राशि रहेकाले अनुसन्धान, खानी, इन्जिनियरिङ, रक्षा, गुप्तचर वा जटिल प्राविधिक उद्यममा सफलता मिल्नेछ। प्रतिकूल परिस्थितिमा पनि नाफा कमाउने क्षमता हुनेछ।",
        "en": "Scorpio in the 10th house supports deep research, mining, chemical engineering, forensic sciences, and strategic management."
    },
    9: {
        "ne": "दशम भावमा धनु राशि रहेकाले प्राध्यापन, न्याय सेवा, धर्म-संस्कृति, परामर्श, अन्तर्राष्ट्रिय व्यापार वा उच्च नीति निर्माणमा सफलता मिल्नेछ। नैतिक व्यापारबाट दिगो सम्पत्ति बन्नेछ।",
        "en": "Sagittarius in the 10th house favors higher education, judiciary, international trade, advisory boards, and ethical commerce."
    },
    10: {
        "ne": "दशम भावमा मकर राशि रहेकाले उद्योग, निर्माण, फलाम, कृषि उपकरण, ठेक्कापट्टा वा ठूला संस्थाको प्रशासनिक नेतृत्वमा सफलता मिल्नेछ। धैर्य र कठोर परिश्रमले साम्राज्य खडा गर्ने योग छ।",
        "en": "Capricorn in the 10th house brings massive long-term success in infrastructure, manufacturing, contracting, and executive corporate roles."
    },
    11: {
        "ne": "दशम भावमा कुम्भ राशि रहेकाले आधुनिक प्रविधि, अनुसन्धान, हवाई क्षेत्र, सामाजिक संस्था, नवीकरणीय ऊर्जा वा नेटवर्किङ व्यापारमा उन्नति हुनेछ। नवीन सोचले आर्थिक लाभ दिलाउनेछ।",
        "en": "Aquarius in the 10th house promotes breakthroughs in technological innovation, aviation, social enterprise, renewable energy, and digital ventures."
    },
    12: {
        "ne": "दशम भावमा मीन राशि रहेकाले स्वास्थ्योपचार, परोपकार, वैदेशिक कम्पनी, सिर्जनात्मक कला वा जलमार्गसम्बन्धी व्यवसायमा लाभ हुनेछ। परामर्श र सेवामूलक कार्यबाट विशेष सम्मान मिल्नेछ।",
        "en": "Pisces in the 10th house grants success in pharmaceuticals, foreign enterprise, international healthcare, arts, and spiritual-humanitarian counseling."
    }
}

# 3. विदेश सम्बन्धी फलादेश (Foreign Travel & Settlement) by 12th & 9th House
FOREIGN_PREDICTIONS = {
    "movable": {
        "ne": "द्वादश भावमा चर (Movable) राशि रहेकाले जीवनमा सुदूर विदेश यात्रा, वैदेशिक अध्ययन वा अन्तर्राष्ट्रिय कार्यक्षेत्रको प्रबल योग छ। जन्मस्थानभन्दा टाढा वा विदेशमा बसोबास गर्दा भाग्य वृद्धि हुनेछ।",
        "en": "With a movable sign in the 12th house, there are strong yogas for long-distance international travel, overseas higher education, and prosperous foreign settlement."
    },
    "dual": {
        "ne": "द्वादश भावमा द्विस्वभाव (Dual) राशि रहेकाले स्वदेश र विदेश दुवै स्थानमा आवतजावत, बहुराष्ट्रिय कम्पनीमा कार्य वा व्यापारिक प्रयोजनले निरन्तर विदेश भ्रमणको योग बन्दछ।",
        "en": "A dual sign in the 12th house indicates frequent international commuting, multinational corporate career, or alternating residence between home and abroad."
    },
    "fixed": {
        "ne": "द्वादश भावमा स्थिर (Fixed) राशि रहेकाले स्वदेशमै रहेर वैदेशिक स्रोतबाट लाभ लिन सकिने वा तीर्थाटन तथा अध्ययनका लागि अल्पकालीन विदेश भ्रमणको सम्भावना रहन्छ।",
        "en": "A fixed sign in the 12th house favors earning from foreign clients/resources while anchored at home, alongside focused short-term overseas visits."
    }
}

# 4. पारिवारिक तथा वैवाहिक फलादेश (Family & Marriage)
FAMILY_PREDICTIONS = {
    1: {"ne": "चतुर्थ तथा सप्तम भावको शुभ स्थितिले परिवारमा सौहार्दता, मातृस्नेह र सहयोगी जीवनसाथी प्राप्त हुने संकेत गर्दछ। आपसी समझदारीबाट गृहस्थ जीवन सुखी रहनेछ।", "en": "Favorable domestic and marital harmony, supportive spouse, and affectionate maternal blessings."},
    2: {"ne": "पारिवारिक जीवनमा स्थिरता र सुख रहनेछ। जीवनसाथी सुसंस्कृत, व्यावहारिक र आर्थिक रूपमा सहयोगी हुनेछन्। कुटुम्बको साथ-सहयोग निरन्तर प्राप्त हुनेछ।", "en": "Stability and grace in family life with a culturally refined, practical, and supportive partner."},
    3: {"ne": "पारिवारिक सम्बन्धमा बौद्धिक संवाद र सौहार्दता रहनेछ। जीवनसाथी बुद्धिमान्, कामकाजी र सामाजिक प्रतिष्ठा वृद्धिमा सहयोगी सिद्ध हुनेछन्।", "en": "Intellectual rapport with spouse and joyous domestic collaboration enhancing social standing."},
    4: {"ne": "घरपरिवारप्रति विशेष स्नेह रहनेछ। जीवनसाथी दयालु, पारिवारिक मूल्यमान्यता जोगाउने र भावनात्मक सहारा दिने प्रकृतिका हुनेछन्।", "en": "Devoted domestic affection with a deeply caring partner who preserves family traditions."},
    5: {"ne": "पारिवारिक जीवनमा आत्मसम्मान र अनुशासन रहनेछ। जीवनसाथी प्रभावशाली, स्वाभिमानी र सन्तान पक्षबाट आनन्द दिलाउने योग छ।", "en": "Dignified domestic environment with an influential partner and auspicious progeny blessings."},
    6: {"ne": "दाम्पत्य जीवनमा स-साना कुरामा मतभेद आउन नदिन संयम अपनाउनु पर्नेछ। जीवनसाथी मेहनती र कर्तव्यनिष्ठ हुनेछन्।", "en": "Constructive marital growth requiring mutual accommodation; spouse is industrious and duty-bound."},
    7: {"ne": "सप्तम भावको प्रभावले सुन्दर, कलात्मक र सामाजिक जीवनसाथी प्राप्त हुनेछ। वैवाहिक जीवन रोमान्टिक र साझेदारीयुक्त रहनेछ।", "en": "Charming, socially gracious spouse bringing refined romance, shared aesthetics, and partnership joy."},
    8: {"ne": "वैवाहिक जीवन गम्भीर र समर्पित रहनेछ। जीवनसाथीसँगको सम्बन्धमा पारदर्शिता र आपसी विश्वासले दाम्पत्यलाई मजबुत बनाउनेछ।", "en": "Deeply committed partnership built upon unwavering loyalty and mutual emotional transparency."},
    9: {"ne": "धार्मिक र संस्कारयुक्त परिवारको साथ मिल्नेछ। जीवनसाथी सदाचारी, शिक्षित र आध्यात्मिक विचारका हुनेछन्।", "en": "Virtuous family legacy with an educated, morally grounded, and spiritually aligned partner."},
    10: {"ne": "पारिवारिक कर्तव्यप्रति समर्पित रहनुहुनेछ। जीवनसाथी अनुशासित, कर्मठ र व्यवसायिक क्षेत्रमा पनि भरथेग गर्ने हुनुहुनेछ।", "en": "High responsibility towards family; partner is disciplined, capable, and professionally supportive."},
    11: {"ne": "परिवारमा खुलापन, मित्रता र प्रगतिशील विचार रहनेछ। जीवनसाथी सामाजिक, बौद्धिक र मित्रवत् व्यवहार गर्ने प्रकृतिका हुनेछन्।", "en": "Progressive, amicable family atmosphere with an intellectually engaging and supportive spouse."},
    12: {"ne": "पारिवारिक सुखमा शान्ति र परोपकारको भावना रहनेछ। जीवनसाथी संवेदनशील, सहयोगी र धार्मिक प्रवृत्तिका हुनेछन्।", "en": "Peaceful domestic sanctuary with an empathetic, spiritually inclined, and benevolent spouse."}
}

# 5. शिक्षादीक्षा र धर्मकर्म फलादेश (Education & Spirituality) by 5th & 9th House
EDUCATION_PREDICTIONS = {
    1: {"ne": "पञ्चम भावमा अग्नि तत्वको प्रभावले इन्जिनियरिङ, व्यवस्थापन, विज्ञान वा प्राविधिक शिक्षामा उत्कृष्ट सफलता मिल्नेछ। धर्मकर्ममा सक्रियता र कुलदेवताको विशेष कृपा रहनेछ।", "en": "Excellence in engineering, scientific research, and executive management. Strong devotion to ancestral deities."},
    2: {"ne": "वाणिज्य, अर्थशास्त्र, ललितकला, कृषि वा व्यवस्थापन शिक्षामा विशेष दक्षता हासिल हुनेछ। धार्मिक अनुष्ठान र दानपुण्यमा रुचि रहनेछ।", "en": "Distinction in finance, commerce, fine arts, and institutional administration. Generous patron of sacred causes."},
    3: {"ne": "सूचना प्रविधि, आमसञ्चार, भाषा, गणित र साहित्यमा उच्च शिक्षाको योग छ। ज्ञान-विज्ञानको चिन्तन र शास्त्रीय अध्ययनमा मन लाग्नेछ।", "en": "Academic success in computer science, mathematics, media, and linguistics with deep curiosity for classical texts."},
    4: {"ne": "चिकित्सा, जीवविज्ञान, मनोविज्ञान वा शिक्षा शास्त्रमा सफलता मिल्नेछ। तीर्थाटन, गुरुसेवा र भक्ति मार्गमा विशेष रुचि रहनेछ।", "en": "Success in medical sciences, psychology, environmental studies, and education with devotion to sacred pilgrimage."},
    5: {"ne": "राजनीतिशास्त्र, प्रशासनिक नेतृत्व वा मौलिक अनुसन्धानमा प्रखर प्रतिभा देखिनेछ। कुलधर्मको पालना र मन्त्रसाधनामा सफलता मिल्नेछ।", "en": "Leadership in political sciences, constitutional law, and governance. Auspicious aptitude for mantra sadhana."},
    6: {"ne": "व्यावहारिक विज्ञान, कानून, लेखापरीक्षण, सूचना प्रविधि वा विश्लेषणमा दक्षता रहनेछ। सेवाभावले युक्त धार्मिक कर्ममा आस्था रहनेछ।", "en": "Sharp capability in applied analytical sciences, legal jurisprudence, and audit with pragmatic spiritual ethics."},
    7: {"ne": "कानून, कूटनीति, व्यवस्थापन र सिर्जनात्मक कलामा उच्च शिक्षा मिल्नेछ। समाज कल्याण र धार्मिक मन्दिर निर्माण जस्ता सत्कर्ममा रुचि हुनेछ।", "en": "High achievements in international diplomacy, jurisprudence, and creative arts with active patronage of noble shrines."},
    8: {"ne": "गूढ विज्ञान, खगोल, शल्यचिकित्सा वा अनुसन्धानमा गहिरो ज्ञान आर्जन हुनेछ। तन्त्र, योग र आध्यात्मिक साधनाप्रति आकर्षण रहनेछ।", "en": "Profound insights into occult sciences, astronomy, surgery, and advanced research with affinity for yoga and sadhana."},
    9: {"ne": "उच्च दर्शन, धर्मशास्त्र, प्राध्यापन वा अन्तर्राष्ट्रिय कानुनमा विशिष्टता मिल्नेछ। गुरु, पितृ र भगवान् प्रतिको अगाध श्रद्धाले भाग्योदय हुनेछ।", "en": "Mastery over philosophy, theology, and higher pedagogy. Divine grace from preceptors and ancestors guarantees fortune."},
    10: {"ne": "इन्जिनियरिङ, भूगर्भ, उद्योग व्यवस्थापन वा प्राविधिक विषयमा शिक्षा मिल्नेछ। कर्म नै धर्म हो भन्ने सिद्धान्तमा दृढ विश्वास रहनेछ।", "en": "Technical excellence in civil/industrial engineering, geology, and administration. Strong belief in righteous duty."},
    11: {"ne": "आधुनिक विज्ञान, विद्युतीय प्रविधि वा सामाजिक अनुसन्धानमा प्रगति हुनेछ। रूढिवादिताभन्दा तर्कसङ्गत अध्यात्ममा विश्वास रहनेछ।", "en": "Success in cutting-edge electronics, data science, and modern sociology with an enlightened rational spiritual outlook."},
    12: {"ne": "दर्शन, योग, चिकित्सा वा आध्यात्मिक साहित्यमा उच्च रुचि रहनेछ। मोक्ष, ध्यान, परोपकार र सन्त-महात्माहरूको सत्सङ्गबाट जीवन सार्थक बन्नेछ।", "en": "Spiritual inclination towards meditation, transcendental philosophy, and selfless service leading to inner liberation."}
}

# 6. महादशा फल (Vedic Mahadasha Predictions for 9 Planets)
MAHADASHA_PREDICTIONS = {
    "Sun": {
        "ne": "सूर्य महादशा: मान-सम्मान, प्रशासनिक प्रतिष्ठा, आत्मबल, सरकारी क्षेत्रबाट लाभ र पदोन्नतिको समय। स्वास्थ्य सबल रहन्छ, तर आँखा र पित्तजन्य समस्यामा ध्यान दिनुहोला।",
        "en": "Sun Mahadasha brings authoritative power, government honors, self-confidence, vitality, and career elevation. Guard against fiery/bilious ailments."
    },
    "Moon": {
        "ne": "चन्द्र महादशा: मानसिक प्रसन्नता, सिर्जनात्मकता, जनसम्पर्क, पारिवारिक सुख र धनलाभको समय। यात्रा र नयाँ योजनाहरू सफल हुन्छन्, भावुकतामा संयम राख्नुपर्छ।",
        "en": "Moon Mahadasha yields emotional tranquility, artistic breakthroughs, maternal warmth, domestic luxury, and fruitful travels."
    },
    "Mars": {
        "ne": "मङ्गल महादशा: पराक्रम, साहस, जग्गाजमिन र सम्पत्ति जोडिने समय। प्रतिस्पर्धीहरू परास्त हुन्छन् र प्राविधिक काममा सफलता मिल्छ, क्रोधमा नियन्त्रण आवश्यक छ।",
        "en": "Mars Mahadasha enhances courage, real estate acquisition, competitive dominance, and technical triumph. Control temper and impulsiveness."
    },
    "Rahu": {
        "ne": "राहु महादशा: अचानक परिवर्तन, विदेश यात्रा, आधुनिक प्रविधि र अप्रत्याशित आर्थिक लाभको समय। भ्रम, अपरिचित व्यक्तिसँगको कारोबार र स्वास्थ्यमा सतर्कता अपनाउनु पर्छ।",
        "en": "Rahu Mahadasha creates sudden material breakthroughs, foreign connections, and digital success. Exercise prudence against deception."
    },
    "Jupiter": {
        "ne": "बृहस्पति महादशा: ज्ञान, सन्तान सुख, धर्मकर्म, पदोन्नति, समाजमा उच्च प्रतिष्ठा र आध्यात्मिक उन्नतिको समय। भाग्यको पूर्ण साथ मिल्ने अत्यन्त शुभ काल।",
        "en": "Jupiter Mahadasha unfolds supreme wisdom, scholastic honors, progeny bliss, spiritual elevation, wealth accumulation, and preceptor's grace."
    },
    "Saturn": {
        "ne": "शनि महादशा: धैर्य, कठोर परिश्रम, दीर्घकालीन स्थायित्व र शून्यबाट सफलता प्राप्त गर्ने समय। अनुशासित जीवनशैली र न्यायपूर्ण कर्मले स्थायी समृद्धि दिनेछ।",
        "en": "Saturn Mahadasha rewards sustained discipline, structural foundations, and profound resilience, granting enduring legacy and stability."
    },
    "Mercury": {
        "ne": "बुध महादशा: व्यापार, वाणिज्य, लेखन, अध्ययन, सञ्चार र बौद्धिक क्षेत्रमा अभूतपूर्व सफलता मिल्ने समय। मित्र र आफन्तजनसँग सम्बन्ध सुमधुर बन्नेछ।",
        "en": "Mercury Mahadasha accelerates commerce, financial intellect, literary mastery, diplomatic alliances, and joyful communications."
    },
    "Ketu": {
        "ne": "केतु महादशा: आध्यात्मिक चिन्तन, आत्मज्ञान, वैराग्य, तीर्थाटन र गूढ विद्या आर्जनको समय। सांसारिक काममा धैर्य राख्दै कुलदेवताको आराधना गर्नु शुभ हुन्छ।",
        "en": "Ketu Mahadasha stimulates spiritual awakening, philosophical detachment, research breakthroughs, and deeper introspective liberation."
    },
    "Venus": {
        "ne": "शुक्र महादशा: भौतिक सुखसुविधा, वाहन, सौन्दर्य, कला, विवाह, रोमान्स र ऐश्वर्य प्राप्तिको समय। विलासिता र सामाजिक प्रतिष्ठामा चौतर्फी वृद्धि हुनेछ।",
        "en": "Venus Mahadasha showers aesthetic luxury, matrimonial happiness, vehicular comforts, artistic prominence, and widespread social magnetism."
    }
}

# 7. शुभ रत्न तथा रुद्राक्ष (Benefic Gemstones & Rudraksha) by Lagna
LUCKY_REMEDIES = {
    1: {"stone": "मुगा (Red Coral)", "sub_stone": "माणिक्य (Ruby) / पुखराज (Yellow Sapphire)", "rudraksha": "३ मुखी वा ५ मुखी रुद्राक्ष", "mantra": "ॐ भौमाय नमः"},
    2: {"stone": "हीरा (Diamond) / ओपल (Opal)", "sub_stone": "पन्ना (Emerald) / नीलम (Blue Sapphire)", "rudraksha": "६ मुखी रुद्राक्ष", "mantra": "ॐ शुक्राय नमः"},
    3: {"stone": "पन्ना (Emerald)", "sub_stone": "हीरा (Diamond) / नीलम (Blue Sapphire)", "rudraksha": "४ मुखी रुद्राक्ष", "mantra": "ॐ बुधाय नमः"},
    4: {"stone": "मोती (Pearl)", "sub_stone": "मुगा (Red Coral) / पुखराज (Yellow Sapphire)", "rudraksha": "२ मुखी रुद्राक्ष", "mantra": "ॐ सोमाय नमः"},
    5: {"stone": "माणिक्य (Ruby)", "sub_stone": "मुगा (Red Coral) / पुखराज (Yellow Sapphire)", "rudraksha": "१ मुखी वा १२ मुखी रुद्राक्ष", "mantra": "ॐ सूर्याय नमः"},
    6: {"stone": "पन्ना (Emerald)", "sub_stone": "हीरा (Diamond) / नीलम (Blue Sapphire)", "rudraksha": "४ मुखी रुद्राक्ष", "mantra": "ॐ बुधाय नमः"},
    7: {"stone": "हीरा (Diamond) / ओपल (Opal)", "sub_stone": "पन्ना (Emerald) / नीलम (Blue Sapphire)", "rudraksha": "६ मुखी रुद्राक्ष", "mantra": "ॐ शुक्राय नमः"},
    8: {"stone": "मुगा (Red Coral)", "sub_stone": "पुखराज (Yellow Sapphire) / मोती (Pearl)", "rudraksha": "३ मुखी रुद्राक्ष", "mantra": "ॐ भौमाय नमः"},
    9: {"stone": "पुखराज (Yellow Sapphire)", "sub_stone": "माणिक्य (Ruby) / मुगा (Red Coral)", "rudraksha": "५ मुखी रुद्राक्ष", "mantra": "ॐ बृहस्पतये नमः"},
    10: {"stone": "नीलम (Blue Sapphire)", "sub_stone": "हीरा (Diamond) / पन्ना (Emerald)", "rudraksha": "७ मुखी वा १४ मुखी रुद्राक्ष", "mantra": "ॐ शनैश्चराय नमः"},
    11: {"stone": "नीलम (Blue Sapphire)", "sub_stone": "पन्ना (Emerald) / हीरा (Diamond)", "rudraksha": "७ मुखी रुद्राक्ष", "mantra": "ॐ शनैश्चराय नमः"},
    12: {"stone": "पुखराज (Yellow Sapphire)", "sub_stone": "मोती (Pearl) / मुगा (Red Coral)", "rudraksha": "५ मुखी रुद्राक्ष", "mantra": "ॐ बृहस्पतये नमः"}
}

def generate_cheena_predictions(
    lagna_rashi: int,
    moon_rashi: int,
    planet_rashis: Dict[str, int],
    current_mahadasha: str = "Jupiter",
    lang: str = "ne"
) -> Dict[str, Any]:
    """
    Synthesizes complete classical Phalit prediction package based on Lagna chart coordinates.
    """
    l_idx = ((lagna_rashi - 1) % 12) + 1
    m_idx = ((moon_rashi - 1) % 12) + 1
    
    # 10th house sign (Business & Career)
    tenth_rashi = ((l_idx + 9 - 1) % 12) + 1
    
    # 12th house sign (Foreign travel: movable/dual/fixed)
    twelfth_rashi = ((l_idx + 11 - 1) % 12) + 1
    if twelfth_rashi in [1, 4, 7, 10]:
        foreign_type = "movable"
    elif twelfth_rashi in [3, 6, 9, 12]:
        foreign_type = "dual"
    else:
        foreign_type = "fixed"
        
    # 5th house sign (Education)
    fifth_rashi = ((l_idx + 4 - 1) % 12) + 1
    
    # 7th house sign (Marriage & Family)
    seventh_rashi = ((l_idx + 6 - 1) % 12) + 1

    general = LAGNA_PREDICTIONS.get(l_idx, {}).get(lang, LAGNA_PREDICTIONS[1]["ne"])
    business = BUSINESS_PREDICTIONS.get(tenth_rashi, {}).get(lang, BUSINESS_PREDICTIONS[1]["ne"])
    foreign = FOREIGN_PREDICTIONS.get(foreign_type, {}).get(lang, FOREIGN_PREDICTIONS["movable"]["ne"])
    family = FAMILY_PREDICTIONS.get(seventh_rashi, {}).get(lang, FAMILY_PREDICTIONS[1]["ne"])
    education = EDUCATION_PREDICTIONS.get(fifth_rashi, {}).get(lang, EDUCATION_PREDICTIONS[1]["ne"])
    
    # Dasha predictions
    dasha_dict = {}
    for p_name, d_text in MAHADASHA_PREDICTIONS.items():
        dasha_dict[p_name] = d_text.get(lang, d_text["ne"])
        
    remedy = LUCKY_REMEDIES.get(l_idx, LUCKY_REMEDIES[1])
    
    return {
        "lagna_rashi": l_idx,
        "moon_rashi": m_idx,
        "general": general,
        "business": business,
        "foreign": foreign,
        "family": family,
        "education": education,
        "dasha_predictions": dasha_dict,
        "active_dasha": current_mahadasha,
        "remedies": remedy
    }
