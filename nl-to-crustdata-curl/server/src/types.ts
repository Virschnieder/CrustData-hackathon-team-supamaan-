import { z } from 'zod';

// Canonical filter types
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

// Crustdata API types
export interface Condition {
  column: string;
  type: '=>' | '=<' | '=' | '<' | '>' | '!=' | 'in' | '(.)' | '[.]';
  value: string | number;
  allow_null?: boolean;
}

export interface FilterGroup {
  op: 'and' | 'or';
  conditions: (Condition | FilterGroup)[];
}

export interface ScreeningRequest {
  filters: FilterGroup;
  offset?: number;
  count?: number;
  sorts?: any[];
}

export interface CompanySearchFilter {
  filter_type: 'COMPANY_HEADCOUNT' | 'CURRENT_TITLE' | 'COMPANY_HEADQUARTERS' | 'INDUSTRY' | 'REGION';
  type: 'in' | 'not in' | 'between';
  value: string[];
}

export interface CompanySearchByFilters {
  filters: CompanySearchFilter[];
  page?: number;
}

// API response types
export interface ParseResponse {
  canonical: CanonicalFilters;
  screenPayload: ScreeningRequest;
  companySearchPayload: CompanySearchByFilters;
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

// Zod schemas for validation
export const ParseRequestSchema = z.object({
  prompt: z.string().min(1)
});

export const RunRequestSchema = z.object({
  prompt: z.string().min(1)
});

export type ParseRequest = z.infer<typeof ParseRequestSchema>;
export type RunRequest = z.infer<typeof RunRequestSchema>;
