/**
 * Basistha Vedic Astrological Platform
 * कुण्डली पत्रिका PDF रिपोर्ट जेनेरेटर
 * Generates a beautiful, print-ready Nepali Janmakundali PDF report.
 */
"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Line,
  Polygon,
  Rect,
  Circle,
} from "@react-pdf/renderer";
import { KundaliData, PanchangData, DashaData, BirthDetails } from "@/types/astrology";

// ─── Register Fonts ────────────────────────────────────────────────────────────
// Using Helvetica (built-in) for Latin; Nepali text may render as boxes without
// a bundled Devanagari font. For production, embed a Devanagari .ttf font here.
// Font.register({ family: "NotoDevanagari", src: "/fonts/NotoSansDevanagari-Regular.ttf" });

// ─── Colour Palette ────────────────────────────────────────────────────────────
const C = {
  burgundy: "#7B1C4A",
  saffron:  "#EA580C",
  gold:     "#D97706",
  amber:    "#F59E0B",
  parchment:"#FEFCE8",
  lightAmber:"#FEF3C7",
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate200: "#E2E8F0",
  white:    "#FFFFFF",
  emerald:  "#065F46",
  red:      "#B91C1C",
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    backgroundColor: C.parchment,
    paddingHorizontal: 32,
    paddingVertical: 28,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.slate900,
  },

  // Header
  header: {
    backgroundColor: C.burgundy,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: C.white, fontSize: 18, fontFamily: "Helvetica-Bold" },
  headerSub:   { color: "#FED7AA", fontSize: 8, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerBadge: {
    backgroundColor: C.saffron,
    color: C.white,
    fontSize: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  headerDate: { color: "#FED7AA", fontSize: 7 },

  // Section
  section: {
    marginBottom: 12,
    backgroundColor: C.white,
    borderRadius: 8,
    overflow: "hidden",
    border: "1 solid #FDE68A",
  },
  sectionHeader: {
    backgroundColor: C.lightAmber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "1 solid #FDE68A",
  },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.burgundy },
  sectionBody:  { padding: 10 },

  // Info Grid
  infoRow:  { flexDirection: "row", marginBottom: 5, flexWrap: "wrap" },
  infoItem: { width: "50%", flexDirection: "row", marginBottom: 3 },
  infoLabel:{ color: C.slate500, width: 85, fontSize: 8 },
  infoValue:{ color: C.slate900, fontFamily: "Helvetica-Bold", fontSize: 8, flex: 1 },

  // Tables
  table:     { width: "100%" },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.lightAmber,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 2,
  },
  tableHeadCell: { fontFamily: "Helvetica-Bold", color: C.burgundy, fontSize: 7.5 },
  tableRow:  {
    flexDirection: "row",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderBottom: "0.5 solid #E2E8F0",
  },
  tableRowAlt: {
    backgroundColor: "#FFFBEB",
  },
  tableCell: { fontSize: 8, color: C.slate700 },
  retro:     { color: C.red, fontFamily: "Helvetica-Bold" },
  combust:   { color: C.gold, fontFamily: "Helvetica-Bold" },

  // Panchang
  panchangGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  panchangBox: {
    width: "47%",
    backgroundColor: C.parchment,
    border: "0.5 solid #FDE68A",
    borderRadius: 5,
    padding: 7,
    marginBottom: 5,
  },
  panchangLabel: { color: C.slate500, fontSize: 7, marginBottom: 2 },
  panchangValue: { color: C.burgundy, fontFamily: "Helvetica-Bold", fontSize: 9 },

  // Dasha
  dashaRow:    { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottom: "0.5 solid #E2E8F0" },
  dashaMain:   { width: "30%", fontFamily: "Helvetica-Bold", fontSize: 8.5, color: C.burgundy },
  dashaDate:   { width: "45%", fontSize: 7.5, color: C.slate700 },
  dashaDur:    { width: "25%", fontSize: 7.5, color: C.slate700, textAlign: "right" },
  subDashaRow: { flexDirection: "row", paddingVertical: 2.5, paddingHorizontal: 20, borderBottom: "0.5 solid #F1F5F9", backgroundColor: "#FEFCE8" },
  subDashaMain:{ width: "30%", fontSize: 7.5, color: C.slate700 },
  subDashaDate:{ width: "50%", fontSize: 7, color: C.slate500 },
  subDashaDur: { width: "20%", fontSize: 7, color: C.slate500, textAlign: "right" },

  // Footer
  footer: {
    marginTop: 10,
    borderTop: "1 solid #FDE68A",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { color: C.slate500, fontSize: 7 },
  footerBrand:{ color: C.burgundy, fontFamily: "Helvetica-Bold", fontSize: 7 },

  // Lagna box
  lagnaBox: {
    backgroundColor: C.lightAmber,
    border: "1 solid #FDE68A",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lagnaItem: { width: "30%" },
  lagnaLabel:{ color: C.slate500, fontSize: 7.5, marginBottom: 1 },
  lagnaValue:{ color: C.burgundy, fontFamily: "Helvetica-Bold", fontSize: 9 },

  // SVG Chart wrapper
  chartWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.burgundy,
    textAlign: "center",
    marginBottom: 6,
  },
});

// ─── Column widths for planet table ─────────────────────────────────────────
const PW = {
  name:    "14%",
  lon:     "12%",
  rashi:   "14%",
  nak:     "20%",
  pada:    "6%",
  speed:   "10%",
  retro:   "12%",
  combust: "12%",
};

// ─── North Indian SVG Chart (embedded in PDF) ───────────────────────────────
const HOUSE_CENTROIDS: Record<number, { x: number; y: number }> = {
  1:  { x: 200, y: 110 },
  2:  { x: 100, y: 55  },
  3:  { x: 55,  y: 105 },
  4:  { x: 105, y: 200 },
  5:  { x: 55,  y: 295 },
  6:  { x: 100, y: 345 },
  7:  { x: 200, y: 290 },
  8:  { x: 300, y: 345 },
  9:  { x: 345, y: 295 },
  10: { x: 295, y: 200 },
  11: { x: 345, y: 105 },
  12: { x: 300, y: 55  },
};

const PLANET_SHORT: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me",
  Jupiter: "Ju", Venus: "Ve", Saturn: "Sa",
  Rahu: "Ra", Ketu: "Ke", Uranus: "Ur", Neptune: "Ne", Pluto: "Pl",
};

function NorthChartSvg({ data }: { data: KundaliData }) {
  const lagnaRashi = data.lagna.rashi_id;
  const houseRashiMap: Record<number, number> = {};
  for (let h = 1; h <= 12; h++) {
    houseRashiMap[h] = ((lagnaRashi - 1 + (h - 1)) % 12) + 1;
  }

  const housePlanets: Record<number, { name: string; retro: boolean }[]> = {};
  for (let h = 1; h <= 12; h++) housePlanets[h] = [];
  data.planets.forEach((p) => {
    for (let h = 1; h <= 12; h++) {
      if (houseRashiMap[h] === p.rashi_id) {
        housePlanets[h].push({ name: PLANET_SHORT[p.name] || p.name.slice(0, 2), retro: p.is_retrograde });
        break;
      }
    }
  });

  return (
    <Svg width={240} height={240} viewBox="0 0 400 400">
      {/* Background */}
      <Rect x={0} y={0} width={400} height={400} fill={C.parchment} rx={10} />
      {/* Border */}
      <Rect x={4} y={4} width={392} height={392} fill="none" stroke={C.saffron} strokeWidth={3} rx={8} />
      {/* Diagonals */}
      <Line x1={4} y1={4} x2={396} y2={396} stroke={C.gold} strokeWidth={1.5} />
      <Line x1={396} y1={4} x2={4} y2={396} stroke={C.gold} strokeWidth={1.5} />
      {/* Inner Diamond */}
      <Polygon points="200,4 396,200 200,396 4,200" fill="none" stroke={C.saffron} strokeWidth={2} />
      {/* Lagna House (1) highlight */}
      <Polygon points="200,4 300,102 200,200 100,102" fill={C.amber} fillOpacity={0.18} />

      {/* House numbers + planets */}
      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
        const c = HOUSE_CENTROIDS[h];
        const planets = housePlanets[h];
        return (
          <React.Fragment key={h}>
            {/* Rashi number */}
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", fill: C.burgundy }}
              x={c.x} y={c.y - 14}>{houseRashiMap[h]}</Text>
            {/* Planets */}
            {planets.map((p, idx) => (
              <Text
                key={`${h}-${p.name}-${idx}`}
                style={{ fontSize: 8, fill: p.retro ? C.red : C.slate900 }}
                x={c.x + (idx % 2 === 0 ? -12 : 10)}
                y={c.y + Math.floor(idx / 2) * 12}
              >
                {p.name}{p.retro ? "(R)" : ""}
              </Text>
            ))}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─── Main PDF Document ────────────────────────────────────────────────────────
interface Props {
  kundali: KundaliData;
  panchang: PanchangData | null;
  dasha: DashaData | null;
  birth: BirthDetails;
  personName?: string;
}

export const KundaliPdfDocument: React.FC<Props> = ({ kundali, panchang, dasha, birth, personName = "जातक" }) => {
  const now = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const birthDateStr = `${birth.year}-${String(birth.month).padStart(2, "0")}-${String(birth.day).padStart(2, "0")}`;
  const birthTimeStr = `${String(birth.hour).padStart(2, "0")}:${String(birth.minute).padStart(2, "0")}`;

  return (
    <Document
      title={`${personName} - Janmakundali`}
      author="Basistha Astronomical Engine"
      subject="Vedic Astrological Birth Chart"
      creator="Basistha v2.0"
    >
      {/* ══════════════════════ PAGE 1: Kundali Chart + Planets ══════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.headerTitle}>🕉 Basistha (वसिष्ठ)</Text>
            <Text style={S.headerSub}>जन्म कुण्डली पत्रिका • Janmakundali Patrika</Text>
            <Text style={[S.headerSub, { marginTop: 4 }]}>
              {personName} • जन्म: {birthDateStr}  {birthTimeStr}
            </Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.headerBadge}>Basistha Engine v2.0</Text>
            <Text style={S.headerDate}>तयार मिति: {now}</Text>
            <Text style={S.headerDate}>अयनांश: {kundali.ayanamsha_name} ({kundali.ayanamsha_value.toFixed(4)}°)</Text>
          </View>
        </View>

        {/* Birth Details */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>📋 जन्म विवरण (Birth Details)</Text>
          </View>
          <View style={S.sectionBody}>
            <View style={S.infoRow}>
              <View style={S.infoItem}>
                <Text style={S.infoLabel}>जन्म मिति:</Text>
                <Text style={S.infoValue}>{birthDateStr}</Text>
              </View>
              <View style={S.infoItem}>
                <Text style={S.infoLabel}>जन्म समय:</Text>
                <Text style={S.infoValue}>{birthTimeStr} (स्थानीय)</Text>
              </View>
              <View style={S.infoItem}>
                <Text style={S.infoLabel}>जन्म स्थान:</Text>
                <Text style={S.infoValue}>{birth.city_name || "N/A"}</Text>
              </View>
              <View style={S.infoItem}>
                <Text style={S.infoLabel}>Lat / Lon:</Text>
                <Text style={S.infoValue}>{birth.latitude}° N, {birth.longitude}° E</Text>
              </View>
              <View style={S.infoItem}>
                <Text style={S.infoLabel}>Time Zone:</Text>
                <Text style={S.infoValue}>UTC +{birth.timezone_offset}</Text>
              </View>
              <View style={S.infoItem}>
                <Text style={S.infoLabel}>Julian Day:</Text>
                <Text style={S.infoValue}>{kundali.julian_day}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lagna Summary */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>🔯 लग्न विवरण (Ascendant / Lagna)</Text>
          </View>
          <View style={S.sectionBody}>
            <View style={S.lagnaBox}>
              <View style={S.lagnaItem}>
                <Text style={S.lagnaLabel}>लग्न राशि</Text>
                <Text style={S.lagnaValue}>{kundali.lagna.rashi_name_ne} ({kundali.lagna.rashi_name})</Text>
              </View>
              <View style={S.lagnaItem}>
                <Text style={S.lagnaLabel}>अंश</Text>
                <Text style={S.lagnaValue}>{kundali.lagna.degree}° {kundali.lagna.minute}' {kundali.lagna.second}"</Text>
              </View>
              <View style={S.lagnaItem}>
                <Text style={S.lagnaLabel}>नक्षत्र</Text>
                <Text style={S.lagnaValue}>{kundali.lagna.nakshatra_name_ne} (पाद {kundali.lagna.nakshatra_pada})</Text>
              </View>
            </View>
          </View>
        </View>

        {/* North Indian Chart */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>🔯 उत्तर भारतीय जन्म कुण्डली (North Indian Lagna Chart D1)</Text>
          </View>
          <View style={[S.sectionBody, S.chartWrapper]}>
            <NorthChartSvg data={kundali} />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
              <Text style={{ fontSize: 7, color: C.red }}>(R) = वक्री (Retrograde)</Text>
              <Text style={{ fontSize: 7, color: C.gold }}>Comb = अस्त (Combust)</Text>
              <Text style={{ fontSize: 7, color: C.burgundy }}>Number = राशि क्रमांक</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>Basistha Vedic Astrological Platform • www.basistha.app</Text>
          <Text style={S.footerBrand}>Powered by Swiss Ephemeris + Surya Siddhanta</Text>
          <Text style={S.footerText}>पृष्ठ १ / ३</Text>
        </View>
      </Page>

      {/* ══════════════════════ PAGE 2: Planetary Positions + Panchang ════════════════ */}
      <Page size="A4" style={S.page}>

        {/* Mini header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: C.burgundy }}>🪐 ग्रह स्पष्ट तालिका (Planetary Positions)</Text>
          <Text style={{ fontSize: 8, color: C.slate500 }}>{personName} • {birthDateStr}</Text>
        </View>

        {/* Planet Table */}
        <View style={S.section}>
          <View style={S.sectionBody}>
            {/* Table head */}
            <View style={S.tableHead}>
              <Text style={[S.tableHeadCell, { width: PW.name }]}>ग्रह</Text>
              <Text style={[S.tableHeadCell, { width: PW.lon }]}>अंश°</Text>
              <Text style={[S.tableHeadCell, { width: PW.rashi }]}>राशि</Text>
              <Text style={[S.tableHeadCell, { width: PW.nak }]}>नक्षत्र</Text>
              <Text style={[S.tableHeadCell, { width: PW.pada }]}>पाद</Text>
              <Text style={[S.tableHeadCell, { width: PW.speed }]}>गति</Text>
              <Text style={[S.tableHeadCell, { width: PW.retro }]}>स्थिति</Text>
              <Text style={[S.tableHeadCell, { width: PW.combust }]}>अस्त</Text>
            </View>

            {/* Table rows */}
            {kundali.planets.map((p, idx) => (
              <View key={p.planet_id} style={[S.tableRow, idx % 2 !== 0 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCell, { width: PW.name, fontFamily: "Helvetica-Bold", color: C.burgundy }]}>
                  {p.name}
                </Text>
                <Text style={[S.tableCell, { width: PW.lon }]}>
                  {p.degree}°{p.minute}'{p.second}"
                </Text>
                <Text style={[S.tableCell, { width: PW.rashi }]}>{p.rashi_name}</Text>
                <Text style={[S.tableCell, { width: PW.nak }]}>{p.nakshatra_name}</Text>
                <Text style={[S.tableCell, { width: PW.pada, textAlign: "center" }]}>{p.nakshatra_pada}</Text>
                <Text style={[S.tableCell, { width: PW.speed }]}>{p.speed.toFixed(4)}°</Text>
                <Text style={[S.tableCell, { width: PW.retro }, p.is_retrograde ? S.retro : {}]}>
                  {p.is_retrograde ? "वक्री (R)" : "मार्गी"}
                </Text>
                <Text style={[S.tableCell, { width: PW.combust }, p.is_combust ? S.combust : {}]}>
                  {p.is_combust ? "अस्त" : "उदित"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Divisional Chart summary */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>📊 षोडशवर्ग राशि (Divisional Charts - D1 to D60)</Text>
          </View>
          <View style={S.sectionBody}>
            {/* D9 and D10 for each planet */}
            <View style={S.tableHead}>
              <Text style={[S.tableHeadCell, { width: "20%" }]}>ग्रह</Text>
              <Text style={[S.tableHeadCell, { width: "12%" }]}>D1 लग्न</Text>
              <Text style={[S.tableHeadCell, { width: "12%" }]}>D2 होरा</Text>
              <Text style={[S.tableHeadCell, { width: "12%" }]}>D3 दृक्काण</Text>
              <Text style={[S.tableHeadCell, { width: "12%" }]}>D9 नवमांश</Text>
              <Text style={[S.tableHeadCell, { width: "12%" }]}>D10 दशमांश</Text>
              <Text style={[S.tableHeadCell, { width: "12%" }]}>D12 द्वादशांश</Text>
              <Text style={[S.tableHeadCell, { width: "8%" }]}>D60</Text>
            </View>
            {kundali.planets.slice(0, 9).map((p, idx) => {
              const dc = kundali.divisional_charts?.[p.name] || {};
              return (
                <View key={p.planet_id} style={[S.tableRow, idx % 2 !== 0 ? S.tableRowAlt : {}]}>
                  <Text style={[S.tableCell, { width: "20%", fontFamily: "Helvetica-Bold", color: C.burgundy }]}>{p.name}</Text>
                  <Text style={[S.tableCell, { width: "12%" }]}>{dc.D1_Rashi || p.rashi_id}</Text>
                  <Text style={[S.tableCell, { width: "12%" }]}>{dc.D2_Hora || "-"}</Text>
                  <Text style={[S.tableCell, { width: "12%" }]}>{dc.D3_Drekkana || "-"}</Text>
                  <Text style={[S.tableCell, { width: "12%" }]}>{dc.D9_Navamsha || "-"}</Text>
                  <Text style={[S.tableCell, { width: "12%" }]}>{dc.D10_Dashamamsha || "-"}</Text>
                  <Text style={[S.tableCell, { width: "12%" }]}>{dc.D12_Dwadasamsha || "-"}</Text>
                  <Text style={[S.tableCell, { width: "8%" }]}>{dc.D60_Shastiamsha || "-"}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Panchang */}
        {panchang && (
          <View style={S.section}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>📅 दैनिक पञ्चाङ्ग (Panchanga) — {panchang.date_str}</Text>
            </View>
            <View style={S.sectionBody}>
              <View style={S.panchangGrid}>
                {[
                  { label: "वार (Vara)", value: panchang.vara.name_ne },
                  { label: "तिथि (Tithi)", value: panchang.tithi.name_ne },
                  { label: "नक्षत्र (Nakshatra)", value: panchang.nakshatra.name_ne },
                  { label: "योग (Yoga)", value: panchang.yoga.name_ne },
                  { label: "करण (Karana)", value: panchang.karana.name_ne },
                  { label: "सूर्योदय (Sunrise)", value: panchang.sunrise },
                  { label: "सूर्यास्त (Sunset)", value: panchang.sunset },
                  { label: "दिनमान", value: panchang.day_length_hours },
                  { label: "अभिजित मुहूर्त", value: `${panchang.abhijit_muhurta.start} - ${panchang.abhijit_muhurta.end}` },
                  { label: "राहुकाल", value: `${panchang.rahukaal.start} - ${panchang.rahukaal.end}` },
                ].map((item) => (
                  <View key={item.label} style={S.panchangBox}>
                    <Text style={S.panchangLabel}>{item.label}</Text>
                    <Text style={S.panchangValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={S.footer}>
          <Text style={S.footerText}>Basistha Vedic Astrological Platform</Text>
          <Text style={S.footerBrand}>Swiss Ephemeris + Lahiri Ayanamsha</Text>
          <Text style={S.footerText}>पृष्ठ २ / ३</Text>
        </View>
      </Page>

      {/* ══════════════════════ PAGE 3: Vimshottari Dasha ═══════════════════════════ */}
      <Page size="A4" style={S.page}>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: C.burgundy }}>⏳ विंशोत्तरी महादशा (Vimshottari Dasha System)</Text>
          <Text style={{ fontSize: 8, color: C.slate500 }}>{personName} • {birthDateStr}</Text>
        </View>

        {dasha ? (
          <View style={S.section}>
            <View style={S.sectionHeader}>
              <Text style={S.sectionTitle}>{dasha.dasha_system}</Text>
            </View>
            <View style={S.sectionBody}>
              {/* Balance */}
              <View style={{
                backgroundColor: C.lightAmber,
                borderRadius: 6,
                padding: 8,
                marginBottom: 8,
                flexDirection: "row",
                gap: 16,
              }}>
                <View>
                  <Text style={{ fontSize: 7.5, color: C.slate500 }}>चालु महादशा</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: C.burgundy }}>
                    {dasha.balance_of_dasha.first_lord_ne} ({dasha.balance_of_dasha.first_lord})
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 7.5, color: C.slate500 }}>शेष अवधि</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: C.saffron }}>
                    {dasha.balance_of_dasha.balance_text || `${dasha.balance_of_dasha.balance_years.toFixed(2)} वर्ष`}
                  </Text>
                </View>
              </View>

              {/* Table head */}
              <View style={[S.tableHead]}>
                <Text style={[S.tableHeadCell, { width: "30%" }]}>महादशा ग्रह</Text>
                <Text style={[S.tableHeadCell, { width: "45%" }]}>अवधि (मिति)</Text>
                <Text style={[S.tableHeadCell, { width: "25%", textAlign: "right" }]}>वर्ष</Text>
              </View>

              {dasha.dasha_tree.map((d, idx) => (
                <React.Fragment key={d.planet}>
                  <View style={[S.dashaRow, idx % 2 !== 0 ? S.tableRowAlt : {}]}>
                    <Text style={S.dashaMain}>{d.planet_ne} ({d.planet})</Text>
                    <Text style={S.dashaDate}>{d.start_date} → {d.end_date}</Text>
                    <Text style={S.dashaDur}>{d.duration_years.toFixed(1)} yr</Text>
                  </View>
                  {d.sub_dashas?.map((sub) => (
                    <View key={sub.sub_planet} style={S.subDashaRow}>
                      <Text style={S.subDashaMain}>  └ {sub.sub_planet_ne}</Text>
                      <Text style={S.subDashaDate}>{sub.start} → {sub.end}</Text>
                      <Text style={S.subDashaDur}>{sub.duration_months.toFixed(1)} mo</Text>
                    </View>
                  ))}
                </React.Fragment>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: C.slate500, fontSize: 9 }}>दशा डेटा उपलब्ध छैन। कुण्डली गणना पश्चात् पुनः प्रयास गर्नुहोस्।</Text>
          </View>
        )}

        {/* Disclaimer */}
        <View style={{ marginTop: 12, padding: 10, backgroundColor: C.lightAmber, borderRadius: 6, border: "0.5 solid #FDE68A" }}>
          <Text style={{ fontSize: 7, color: C.slate700, lineHeight: 1.5 }}>
            सूचना: यो कुण्डली पत्रिका Basistha Astronomical Engine (Swiss Ephemeris + Surya Siddhanta) द्वारा स्वतः गणना गरिएको हो।
            ज्योतिषीय फलादेशको लागि कृपया अनुभवी ज्योतिषाचार्यसँग परामर्श लिनुहोस्।
            This report is for informational purposes only and should be verified by a qualified astrologer.
          </Text>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>© {new Date().getFullYear()} Basistha Astronomical Platform. सर्वाधिकार सुरक्षित।</Text>
          <Text style={S.footerBrand}>www.basistha.app</Text>
          <Text style={S.footerText}>पृष्ठ ३ / ३</Text>
        </View>
      </Page>
    </Document>
  );
};
