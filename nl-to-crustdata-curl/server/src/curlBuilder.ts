import { ScreeningRequest, CompanySearchByFilters } from './types';

export function buildScreenCurl(payload: ScreeningRequest): string {
  const jsonPayload = JSON.stringify(payload, null, 2);
  const escapedJson = jsonPayload.replace(/"/g, '\\"');
  
  return `curl -sX POST "https://api.crustdata.com/screener/screen/" \\
  -H "Authorization: Bearer $CRUSTDATA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "${escapedJson}"`;
}

export function buildCompanySearchCurl(payload: CompanySearchByFilters): string {
  const jsonPayload = JSON.stringify(payload, null, 2);
  const escapedJson = jsonPayload.replace(/"/g, '\\"');
  
  return `curl -sX POST "https://api.crustdata.com/screener/company/search" \\
  -H "Authorization: Bearer $CRUSTDATA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "${escapedJson}"`;
}

export function buildEnrichCurl(domains: string[]): string {
  const domainsCsv = domains.slice(0, 25).join(','); // Limit to 25 domains
  const fields = [
    'company_name',
    'company_website_domain',
    'taxonomy.industries',
    'headcount.headcount',
    'headcount.headcount_total_growth_percent.six_months',
    'FundingAndInvestment.total_investment_usd',
    'FundingAndInvestment.days_since_last_fundraise'
  ].join(',');
  
  return `curl -sX GET "https://api.crustdata.com/screener/company?company_domain=${encodeURIComponent(domainsCsv)}&fields=${encodeURIComponent(fields)}" \\
  -H "Authorization: Bearer $CRUSTDATA_API_KEY"`;
}

export function buildPersonSearchCurl(payload: CompanySearchByFilters): string {
  const jsonPayload = JSON.stringify(payload, null, 2);
  const escapedJson = jsonPayload.replace(/"/g, '\\"');
  
  return `curl -sX POST "https://api.crustdata.com/screener/person/search" \\
  -H "Authorization: Bearer $CRUSTDATA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "${escapedJson}"`;
}
