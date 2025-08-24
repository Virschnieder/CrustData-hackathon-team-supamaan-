import axios, { AxiosResponse } from 'axios';
import { ScreeningRequest, CompanySearchByFilters, PersonLite } from './types';

const CRUSTDATA_BASE_URL = 'https://api.crustdata.com';

export class CrustdataClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async screenCompanies(payload: ScreeningRequest): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${CRUSTDATA_BASE_URL}/screener/screen/`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error screening companies:', error);
      throw error;
    }
  }

  async searchCompanies(payload: CompanySearchByFilters): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${CRUSTDATA_BASE_URL}/screener/company/search`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  }

  async enrichCompanies(domains: string[]): Promise<any[]> {
    try {
      const domainsCsv = domains.slice(0, 25).join(',');
      const fields = [
        'company_name',
        'company_website_domain',
        'taxonomy.industries',
        'headcount.headcount',
        'headcount.headcount_total_growth_percent.six_months',
        'FundingAndInvestment.total_investment_usd',
        'FundingAndInvestment.days_since_last_fundraise'
      ].join(',');

      const response: AxiosResponse = await axios.get(
        `${CRUSTDATA_BASE_URL}/screener/company`,
        {
          params: {
            company_domain: domainsCsv,
            fields: fields
          },
          headers: this.getHeaders()
        }
      );
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('Error enriching companies:', error);
      return [];
    }
  }

  async searchPeople(payload: CompanySearchByFilters): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${CRUSTDATA_BASE_URL}/screener/person/search`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching people:', error);
      throw error;
    }
  }

  extractDomainsFromScreenResponse(screenResponse: any): string[] {
    const domains: string[] = [];
    
    if (!screenResponse?.fields || !screenResponse?.rows) {
      return domains;
    }

    // Find domain/website field indices
    const domainFieldIndices: number[] = [];
    screenResponse.fields.forEach((field: any, index: number) => {
      if (field.api_name && (
        field.api_name.includes('domain') || 
        field.api_name.includes('website') ||
        field.api_name === 'company_website_domain'
      )) {
        domainFieldIndices.push(index);
      }
    });

    // Extract domains from rows
    screenResponse.rows.forEach((row: any[]) => {
      domainFieldIndices.forEach(index => {
        const value = row[index];
        if (value && typeof value === 'string') {
          // Clean domain (remove http/https)
          const cleanDomain = value.replace(/^https?:\/\//, '').replace(/\/$/, '');
          if (cleanDomain && !domains.includes(cleanDomain)) {
            domains.push(cleanDomain);
          }
        }
      });
    });

    return domains.slice(0, 25); // Limit to 25 domains
  }

  extractCompanyNamesFromScreenResponse(screenResponse: any): string[] {
    const names: string[] = [];
    
    if (!screenResponse?.fields || !screenResponse?.rows) {
      return names;
    }

    // Find company name field index
    const nameFieldIndex = screenResponse.fields.findIndex((field: any) => 
      field.api_name === 'company_name'
    );

    if (nameFieldIndex === -1) {
      return names;
    }

    // Extract company names from rows
    screenResponse.rows.forEach((row: any[]) => {
      const name = row[nameFieldIndex];
      if (name && typeof name === 'string' && !names.includes(name)) {
        names.push(name);
      }
    });

    return names;
  }

  extractDomainsFromSearchResponse(searchResponse: any): string[] {
    const domains: string[] = [];
    
    if (!searchResponse?.companies) {
      return domains;
    }

    searchResponse.companies.forEach((company: any) => {
      if (company.website) {
        const cleanDomain = company.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
        if (cleanDomain && !domains.includes(cleanDomain)) {
          domains.push(cleanDomain);
        }
      }
    });

    return domains.slice(0, 25);
  }

  joinPeopleToCompanies(peopleResponse: any, companiesEnriched: any[]): Record<string, PersonLite[]> {
    const peopleMatched: Record<string, PersonLite[]> = {};
    
    if (!peopleResponse?.profiles) {
      return peopleMatched;
    }

    // Create a map of company names (lowercase) to enriched companies
    const companyNameMap = new Map<string, any>();
    companiesEnriched.forEach(company => {
      if (company.company_name) {
        companyNameMap.set(company.company_name.toLowerCase(), company);
      }
    });

    peopleResponse.profiles.forEach((person: any) => {
      if (!person.employer || !Array.isArray(person.employer)) {
        return;
      }

      person.employer.forEach((employment: any) => {
        if (!employment.company_name) {
          return;
        }

        const companyNameLower = employment.company_name.toLowerCase();
        if (companyNameMap.has(companyNameLower)) {
          if (!peopleMatched[companyNameLower]) {
            peopleMatched[companyNameLower] = [];
          }

          const personLite: PersonLite = {
            name: person.name || 'Unknown',
            title: employment.title || person.current_title || 'Unknown',
            linkedin: person.linkedin_profile_url || '',
            start_date: employment.start_date,
            end_date: employment.end_date,
            location: employment.location || person.location
          };

          peopleMatched[companyNameLower].push(personLite);
        }
      });
    });

    return peopleMatched;
  }
}
