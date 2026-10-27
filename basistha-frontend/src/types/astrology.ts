/**
 * Basistha Astrological Engine - TypeScript Type Definitions
 */

export interface BirthDetails {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  ayanamsha: string;
  house_system: string;
  city_name?: string;
  name?: string;
  thar?: string;
  gender?: string;
  father_name?: string;
  mother_name?: string;
  gotra?: string;
  bs_year?: number;
  bs_month?: number;
  bs_day?: number;
}

export interface PlanetaryPosition {
  planet_id: number;
  name: string;
  name_ne: string;
  longitude: number;
  degree: number;
  minute: number;
  second: number;
  rashi_id: number;
  rashi_name: string;
  rashi_name_ne: string;
  nakshatra_id: number;
  nakshatra_name: string;
  nakshatra_name_ne: string;
  nakshatra_pada: number;
  speed: number;
  is_retrograde: boolean;
  is_combust: boolean;
}

export interface LagnaDetails {
  longitude: number;
  degree: number;
  minute: number;
  second: number;
  rashi_id: number;
  rashi_name: string;
  rashi_name_ne: string;
  nakshatra_name: string;
  nakshatra_name_ne: string;
  nakshatra_pada: number;
}

export interface BhavaCusp {
  bhava: number;
  start_degree: number;
  madhya_degree: number;
  end_degree: number;
  rashi_id: number;
  rashi_name_ne: string;
}

export interface KundaliData {
  engine_name: string;
  julian_day: number;
  ayanamsha_name: string;
  ayanamsha_value: number;
  lagna: LagnaDetails;
  planets: PlanetaryPosition[];
  bhavas: BhavaCusp[];
  divisional_charts: Record<string, Record<string, number>>;
}

export interface PanchangData {
  engine_name: string;
  date_str: string;
  sunrise: string;
  sunset: string;
  day_length_ghati: string;
  dinmaan_ghati?: string;
  day_length_hours: string;
  night_length_hours: string;
  vara: { name: string; name_ne: string; number: number; progress_percentage: number };
  tithi: { name: string; name_ne: string; number: number; progress_percentage: number; ghati?: string; ghati_val?: string; end_time?: string };
  nakshatra: { name: string; name_ne: string; number: number; progress_percentage: number; ghati?: string; ghati_val?: string; end_time?: string };
  yoga: { name: string; name_ne: string; number: number; progress_percentage: number; ghati?: string; ghati_val?: string; end_time?: string };
  karana: { name: string; name_ne: string; number: number; progress_percentage: number; ghati?: string; ghati_val?: string; end_time?: string };
  abhijit_muhurta: { start: string; end: string };
  rahukaal: { start: string; end: string };
  choghadiya_day: Array<{ order: number; name: string; name_ne: string; start: string; end: string }>;
}

export interface DashaPeriod {
  planet: string;
  planet_ne: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  sub_dashas?: Array<{ sub_planet: string; sub_planet_ne: string; start: string; end: string; duration_months: number }>;
}

export interface DashaData {
  engine_name: string;
  dasha_system: string;
  balance_of_dasha: { first_lord: string; first_lord_ne: string; balance_years: number; balance_text?: string };
  dasha_tree: DashaPeriod[];
}

export interface BhaveshInterpretation {
  bhavesh: number;
  bhavesh_name_ne: string;
  in_bhava: number;
  in_bhava_name_ne: string;
  parashar_sloka: string;
}

export interface ClassicalAuthorSloka {
  author_id: number;
  author_name_ne: string;
  sloka: string;
}

export interface PlanetOccupantPhalit {
  bhava: number;
  bhava_name_ne: string;
  planet: string;
  planet_ne: string;
  mansagari_sloka: string;
  classical_interpretations: ClassicalAuthorSloka[];
}

export interface BhavaInterpretation {
  bhava: number;
  bhava_name_ne: string;
  rashi_number: number;
  lord_planet: string;
  lord_planet_ne: string;
  lord_placed_in_bhava: number;
  bhavesh_interpretation?: BhaveshInterpretation | null;
  planets_present: PlanetOccupantPhalit[];
}

export interface DashaInterpretation {
  mahadasha?: string;
  mahadasha_ne?: string;
  mahadasha_sloka?: string;
  antardasha?: string;
  antardasha_ne?: string;
  antardasha_sloka?: string;
}

export interface PhalitData {
  engine_name: string;
  lagna_rashi: number;
  bhava_analysis: BhavaInterpretation[];
  dasha_interpretation?: DashaInterpretation | null;
}
