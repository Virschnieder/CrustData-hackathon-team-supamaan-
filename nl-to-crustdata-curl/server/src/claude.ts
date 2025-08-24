import Anthropic from '@anthropic-ai/sdk';

const CRUSTDATA_API_DOCS = `
CRUSTDATA API DOCUMENTATION:

VALID FILTER TYPES FOR COMPANY/PEOPLE SEARCH:
- COMPANY_HEADCOUNT: Employee count ranges
- CURRENT_TITLE: Job titles for people search
- COMPANY_HEADQUARTERS: Location filters
- INDUSTRY: Industry categories
- REGION: Geographic regions

VALID COMPANY_HEADCOUNT VALUES:
- "1-10"
- "11-50" 
- "51-200"
- "201-500"
- "501-1,000"
- "1,001-5,000"
- "5,001-10,000"
- "10,001+"

VALID INDUSTRY VALUES (MUST USE THESE EXACT VALUES):
- "Software Development" (use for AI, Tech, SaaS, Software, Cybersecurity, Artificial Intelligence)
- "Financial Services" (use for Fintech, Banking, Finance, Financial Technology)
- "Retail" (use for E-commerce, Consumer goods, Online retail)
- "Real Estate" (use for PropTech, Real Estate, Property Technology)
- "Telecommunications" (use for Telecom, Communications)

CRITICAL: Always map user industry terms to these exact valid values. Never use the original terms like "AI" or "Fintech".

VALID REGION/COUNTRY VALUES:
- "United States", "India", "Europe", "North America", "Asia"
- Use full country names, not abbreviations

SCREENER API COLUMNS (for advanced filtering):
- "taxonomy.industries" - Industry classification
- "largest_headcount_country" - Primary country
- "headcount" - Employee count (numeric)
- "year_founded" - Founded year
- "FundingAndInvestment.last_funding_round_type" - Funding stage
- "headcount_total_growth_percent.six_months" - Growth percentage

FUNDING ROUND TYPES:
- "Seed", "Series A", "Series B", "Series C", "Series D", "Series E"
- "Pre-Seed", "Angel", "Bridge", "Growth"
`;

const SYSTEM_PROMPT = `You are an expert at converting natural language queries into structured filters for the Crustdata API.

${CRUSTDATA_API_DOCS}

Your task is to parse natural language investment and company search queries and convert them into a canonical filter format.

IMPORTANT GUIDELINES:
1. Only extract information that is explicitly mentioned in the query
2. Use ONLY the valid values from the Crustdata API documentation above
3. ALWAYS map common terms to valid Crustdata values:
   - AI/Tech/Software/Cybersecurity/Artificial Intelligence → "Software Development"
   - Fintech/Finance/Financial Technology → "Financial Services" 
   - E-commerce/Online retail → "Retail"
   - PropTech/Property Technology → "Real Estate"
   - Telecom/Communications → "Telecommunications"
4. For headcount ranges, map to valid ranges (1-10, 11-50, 51-200, etc.)
5. Use full country names (United States, not US)
6. NEVER use original user terms like "AI" or "Fintech" - always use the mapped valid values

CANONICAL FILTER FORMAT:
{
  "industry": ["Software Development"], // Use valid industry values only
  "categories": ["SaaS"], // Array of category names  
  "countries": ["United States", "India"], // Full country names
  "regions": ["North America", "Europe"], // Array of region names
  "headcountRange": [50, 200], // [min, max] for screener API
  "fundingStages": ["Series A"], // Valid funding stages
  "foundedAfter": "2020", // Year as string
  "foundedBefore": "2023", // Year as string
  "hcGrowth6mPctMin": 20, // Minimum 6-month growth percentage
  "limit": 50, // Number of results
  "page": 1 // Page number
}

EXAMPLES:

Query: "AI startups in India with 50-200 employees, Series A funding"
Response: {
  "industry": ["Software Development"],
  "countries": ["India"], 
  "headcountRange": [50, 200],
  "fundingStages": ["Series A"]
}

Query: "European fintech companies, 1000+ employees, fast growth"
Response: {
  "industry": ["Financial Services"],
  "regions": ["Europe"],
  "headcountRange": [1000, 100000],
  "hcGrowth6mPctMin": 20
}

Query: "US cybersecurity companies, Series B to D, founded after 2018"
Response: {
  "industry": ["Software Development"],
  "countries": ["United States"],
  "fundingStages": ["Series B", "Series C", "Series D"],
  "foundedAfter": "2018"
}

Query: "1000+ employee companies, fast growth"
Response: {
  "headcountRange": [1000, 100000],
  "hcGrowth6mPctMin": 20
}

Parse the following query and return ONLY the JSON canonical filter format:`;

export class ClaudeService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  async enhanceNaturalLanguageParsing(prompt: string): Promise<any> {
    try {
      const message = await this.client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch (parseError) {
          console.error('Failed to parse Claude response as JSON:', content.text);
          // Fallback to basic parsing
          return this.fallbackParsing(prompt);
        }
      }
      
      return this.fallbackParsing(prompt);
    } catch (error) {
      console.error('Claude API error:', error);
      return this.fallbackParsing(prompt);
    }
  }

  private fallbackParsing(prompt: string): any {
    // Basic keyword-based parsing as fallback
    const filters: any = {};
    const lowerPrompt = prompt.toLowerCase();

    // Industries
    if (lowerPrompt.includes('ai') || lowerPrompt.includes('artificial intelligence')) {
      filters.industries = ['AI'];
    }
    if (lowerPrompt.includes('fintech') || lowerPrompt.includes('financial')) {
      filters.industries = [...(filters.industries || []), 'Fintech'];
    }
    if (lowerPrompt.includes('healthcare') || lowerPrompt.includes('health')) {
      filters.industries = [...(filters.industries || []), 'Healthcare'];
    }

    // Locations
    if (lowerPrompt.includes('india')) {
      filters.locations = ['India'];
    }
    if (lowerPrompt.includes('us') || lowerPrompt.includes('united states') || lowerPrompt.includes('america')) {
      filters.locations = [...(filters.locations || []), 'United States'];
    }
    if (lowerPrompt.includes('europe')) {
      filters.locations = [...(filters.locations || []), 'Europe'];
    }

    // Employee count patterns
    const employeeMatch = lowerPrompt.match(/(\d+)[-–](\d+)\s*employees?/);
    if (employeeMatch) {
      filters.employeeCount = {
        min: parseInt(employeeMatch[1]),
        max: parseInt(employeeMatch[2])
      };
    }

    // Funding stages
    if (lowerPrompt.includes('series a')) {
      filters.fundingStage = ['Series A'];
    }
    if (lowerPrompt.includes('series b')) {
      filters.fundingStage = [...(filters.fundingStage || []), 'Series B'];
    }
    if (lowerPrompt.includes('seed')) {
      filters.fundingStage = [...(filters.fundingStage || []), 'Seed'];
    }

    return filters;
  }
}
