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
