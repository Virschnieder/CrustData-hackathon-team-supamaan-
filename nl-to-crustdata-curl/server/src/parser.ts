import { CanonicalFilters } from './types';
import { ClaudeService } from './claude';

let claudeService: ClaudeService | null = null;

// Initialize Claude service if API key is available
if (process.env.CLAUDE_API_KEY) {
  claudeService = new ClaudeService(process.env.CLAUDE_API_KEY);
}

export async function parseNaturalLanguage(prompt: string): Promise<CanonicalFilters> {
  // Try Claude first if available
  if (claudeService) {
    try {
      const claudeResult = await claudeService.enhanceNaturalLanguageParsing(prompt);
      // Merge Claude result with fallback parsing for completeness
      const fallbackResult = fallbackParsing(prompt);
      return { ...fallbackResult, ...claudeResult };
    } catch (error) {
      console.error('Claude parsing failed, using fallback:', error);
    }
  }

  // Fallback to basic parsing
  return fallbackParsing(prompt);
}

function fallbackParsing(prompt: string): CanonicalFilters {
  const filters: CanonicalFilters = {};
  const lowerPrompt = prompt.toLowerCase();

  // Extract industries
  if (lowerPrompt.includes('ai') || lowerPrompt.includes('artificial intelligence')) {
    filters.industry = ['AI'];
  }
  if (lowerPrompt.includes('fintech') || lowerPrompt.includes('financial')) {
    filters.industry = [...(filters.industry || []), 'Fintech'];
  }
  if (lowerPrompt.includes('healthcare') || lowerPrompt.includes('health')) {
    filters.industry = [...(filters.industry || []), 'Healthcare'];
  }
  if (lowerPrompt.includes('saas') || lowerPrompt.includes('software')) {
    filters.industry = [...(filters.industry || []), 'SaaS'];
  }
  if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('e-commerce')) {
    filters.industry = [...(filters.industry || []), 'E-commerce'];
  }

  // Extract countries
  if (lowerPrompt.includes('india')) {
    filters.countries = ['India'];
  }
  if (lowerPrompt.includes('us') || lowerPrompt.includes('united states') || lowerPrompt.includes('america')) {
    filters.countries = [...(filters.countries || []), 'United States'];
  }
  if (lowerPrompt.includes('europe')) {
    filters.regions = ['Europe'];
  }
  if (lowerPrompt.includes('singapore')) {
    filters.countries = [...(filters.countries || []), 'Singapore'];
  }

  // Extract employee count
  const employeeMatch = lowerPrompt.match(/(\d+)[-–](\d+)\s*employees?/);
  if (employeeMatch) {
    filters.headcountRange = [parseInt(employeeMatch[1]), parseInt(employeeMatch[2])];
  }

  // Extract funding stage
  if (lowerPrompt.includes('series a')) {
    filters.fundingStages = ['Series A'];
  }
  if (lowerPrompt.includes('series b')) {
    filters.fundingStages = [...(filters.fundingStages || []), 'Series B'];
  }
  if (lowerPrompt.includes('series c')) {
    filters.fundingStages = [...(filters.fundingStages || []), 'Series C'];
  }
  if (lowerPrompt.includes('seed')) {
    filters.fundingStages = [...(filters.fundingStages || []), 'Seed'];
  }

  // Extract founded year
  const foundedMatch = lowerPrompt.match(/founded after (\d{4})/);
  if (foundedMatch) {
    filters.foundedAfter = foundedMatch[1];
  }

  return filters;
}
