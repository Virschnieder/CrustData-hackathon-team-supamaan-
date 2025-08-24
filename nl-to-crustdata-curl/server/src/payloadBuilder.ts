import { CanonicalFilters, ScreeningRequest, CompanySearchByFilters, Condition, FilterGroup } from './types';

export function buildScreeningPayload(canonical: CanonicalFilters): ScreeningRequest {
  const conditions: (Condition | FilterGroup)[] = [];

  // Industry filters
  if (canonical.industry && canonical.industry.length > 0) {
    conditions.push({
      column: 'taxonomy.industries',
      type: '(.)',
      value: canonical.industry.join(',')
    });
  }

  // Category filters
  if (canonical.categories && canonical.categories.length > 0) {
    conditions.push({
      column: 'taxonomy.categories',
      type: '(.)',
      value: canonical.categories.join(',')
    });
  }

  // Country filters removed - focusing on industry and other metrics only

  // Headcount range
  if (canonical.headcountRange) {
    const [min, max] = canonical.headcountRange;
    conditions.push({
      column: 'headcount',
      type: '=>',
      value: min
    });
    if (max < 100000) { // Don't add upper bound for "+" ranges
      conditions.push({
        column: 'headcount',
        type: '=<',
        value: max
      });
    }
  }

  // Founded date filters
  if (canonical.foundedAfter) {
    conditions.push({
      column: 'year_founded',
      type: '=>',
      value: canonical.foundedAfter
    });
  }

  if (canonical.foundedBefore) {
    conditions.push({
      column: 'year_founded',
      type: '=<',
      value: canonical.foundedBefore
    });
  }

  // Funding stage filters
  if (canonical.fundingStages && canonical.fundingStages.length > 0) {
    conditions.push({
      column: 'FundingAndInvestment.last_funding_round_type',
      type: 'in',
      value: canonical.fundingStages.join(',')
    });
  }

  // Headcount growth filter
  if (canonical.hcGrowth6mPctMin !== undefined) {
    conditions.push({
      column: 'headcount_total_growth_percent.six_months',
      type: '=>',
      value: canonical.hcGrowth6mPctMin
    });
  }

  const filters: FilterGroup = {
    op: 'and',
    conditions
  };

  return {
    filters,
    offset: 0,
    count: Math.min(canonical.limit || 50, 100),
    sorts: []
  };
}

export function buildCompanySearchPayload(canonical: CanonicalFilters): CompanySearchByFilters {
  const filters: any[] = [];

  // Industry filter - only Software Development supported
  if (canonical.industry && canonical.industry.length > 0) {
    filters.push({
      filter_type: 'INDUSTRY',
      type: 'in',
      value: ['Software Development']
    });
  }

  // Headcount filter - use exact Company Search API values
  if (canonical.headcountRange && Array.isArray(canonical.headcountRange) && typeof canonical.headcountRange[0] === 'string') {
    // New format: headcountRange is array of strings like ["51-200", "201-500"]
    filters.push({
      filter_type: 'COMPANY_HEADCOUNT',
      type: 'in',
      value: canonical.headcountRange
    });
  } else if (canonical.headcountRange && Array.isArray(canonical.headcountRange) && typeof canonical.headcountRange[0] === 'number') {
    // Legacy format: convert [min, max] to Company Search API format
    const [min, max] = canonical.headcountRange;
    let headcountValues: string[] = [];
    
    if (min <= 10) headcountValues.push('1-10');
    if (min <= 50 && max >= 11) headcountValues.push('11-50');
    if (min <= 200 && max >= 51) headcountValues.push('51-200');
    if (min <= 500 && max >= 201) headcountValues.push('201-500');
    if (min <= 1000 && max >= 501) headcountValues.push('501-1,000');
    if (min <= 5000 && max >= 1001) headcountValues.push('1,001-5,000');
    if (min <= 10000 && max >= 5001) headcountValues.push('5,001-10,000');
    if (max >= 10001) headcountValues.push('10,001+');

    if (headcountValues.length > 0) {
      filters.push({
        filter_type: 'COMPANY_HEADCOUNT',
        type: 'in',
        value: headcountValues
      });
    }
  }

  return {
    filters,
    page: canonical.page || 1
  };
}

export function buildPersonSearchPayload(canonical: CanonicalFilters): CompanySearchByFilters {
  const filters: any[] = [];

  // Default titles for decision makers
  filters.push({
    filter_type: 'CURRENT_TITLE',
    type: 'in',
    value: ['Founder', 'Co-Founder', 'CEO', 'CTO', 'VP Engineering', 'Head of Product']
  });

  // Industry filter - only Software Development supported
  if (canonical.industry && canonical.industry.length > 0) {
    filters.push({
      filter_type: 'INDUSTRY',
      type: 'in',
      value: ['Software Development']
    });
  }

  return {
    filters,
    page: 1
  };
}
