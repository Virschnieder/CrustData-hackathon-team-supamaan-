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

  // Country filters
  if (canonical.countries && canonical.countries.length > 0) {
    conditions.push({
      column: 'largest_headcount_country',
      type: 'in',
      value: canonical.countries.join(',')
    });
  }

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

  // Industry filter (map to valid Crustdata values)
  if (canonical.industry && canonical.industry.length > 0) {
    const industryMapping: { [key: string]: string } = {
      'AI': 'Software Development',
      'Fintech': 'Financial Services',
      'Cybersecurity': 'Software Development',
      'Healthcare': 'Software Development',
      'SaaS': 'Software Development',
      'E-commerce': 'Retail',
      'EdTech': 'Software Development',
      'PropTech': 'Real Estate',
      'CleanTech': 'Software Development',
      'Software': 'Software Development',
      'Technology': 'Software Development',
      'Tech': 'Software Development'
    };
    
    const mappedIndustries = canonical.industry.map(ind => industryMapping[ind] || ind);
    filters.push({
      filter_type: 'INDUSTRY',
      type: 'in',
      value: mappedIndustries
    });
  }

  // Region/Country filter
  if (canonical.countries && canonical.countries.length > 0) {
    filters.push({
      filter_type: 'REGION',
      type: 'in',
      value: canonical.countries
    });
  }

  // Headcount filter
  if (canonical.headcountRange) {
    const [min, max] = canonical.headcountRange;
    let headcountValue: string;
    
    if (min <= 10) headcountValue = '1-10';
    else if (min <= 50) headcountValue = '11-50';
    else if (min <= 200) headcountValue = '51-200';
    else if (min <= 500) headcountValue = '201-500';
    else if (min <= 1000) headcountValue = '501-1,000';
    else if (min <= 5000) headcountValue = '1,001-5,000';
    else if (min <= 10000) headcountValue = '5,001-10,000';
    else headcountValue = '10,001+';

    filters.push({
      filter_type: 'COMPANY_HEADCOUNT',
      type: 'in',
      value: [headcountValue]
    });
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

  // Region filter
  if (canonical.countries && canonical.countries.length > 0) {
    filters.push({
      filter_type: 'REGION',
      type: 'in',
      value: canonical.countries
    });
  }

  // Industry filter (map to valid Crustdata values)
  if (canonical.industry && canonical.industry.length > 0) {
    const industryMapping: { [key: string]: string } = {
      'AI': 'Software Development',
      'Fintech': 'Financial Services',
      'Cybersecurity': 'Software Development',
      'Healthcare': 'Software Development',
      'SaaS': 'Software Development',
      'E-commerce': 'Retail',
      'EdTech': 'Software Development',
      'PropTech': 'Real Estate',
      'CleanTech': 'Software Development',
      'Software': 'Software Development',
      'Technology': 'Software Development',
      'Tech': 'Software Development'
    };
    
    const mappedIndustries = canonical.industry.map(ind => industryMapping[ind] || ind);
    filters.push({
      filter_type: 'INDUSTRY',
      type: 'in',
      value: mappedIndustries
    });
  }

  return {
    filters,
    page: 1
  };
}
