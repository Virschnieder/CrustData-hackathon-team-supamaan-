// Frontend types matching backend API
export interface CanonicalFilters {
  industry?: string[];
  categories?: string[];
  regions?: string[];
  countries?: string[];
  headcountRange?: [number, number];
  foundedAfter?: string;
  foundedBefore?: string;
  fundingStages?: string[];
  hcGrowth6mPctMin?: number;
  limit?: number;
  page?: number;
}

export interface ParseResponse {
  canonical: CanonicalFilters;
  screenPayload: any;
  companySearchPayload: any;
  curls: {
    screen: string;
    search: string;
  };
}

export interface PersonLite {
  name: string;
  title: string;
  linkedin: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}

export interface RunResponse {
  canonical: CanonicalFilters;
  curls: {
    screen: string;
    search: string;
    enrich: string;
    people: string;
  };
  screenRes?: any;
  companiesEnriched: any[];
  peopleMatched: Record<string, PersonLite[]>;
}

export interface AppState {
  prompt: string;
  parsed?: ParseResponse;
  run?: RunResponse;
  loading: boolean;
  error?: string;
}
