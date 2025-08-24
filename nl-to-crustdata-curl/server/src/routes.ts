import { Router, Request, Response } from 'express';
import { ParseRequestSchema, RunRequestSchema, ParseResponse, RunResponse } from './types';
import { parseNaturalLanguage } from './parser';
import { buildScreeningPayload, buildCompanySearchPayload, buildPersonSearchPayload } from './payloadBuilder';
import { buildScreenCurl, buildCompanySearchCurl, buildEnrichCurl, buildPersonSearchCurl } from './curlBuilder';
import { CrustdataClient } from './crustdataClient';

const router = Router();

// Enhanced logging utility
const log = {
  info: (step: string, data: any) => {
    console.log(`\n🔍 [${new Date().toISOString()}] ${step}`);
    console.log('📊 Data:', JSON.stringify(data, null, 2));
  },
  success: (step: string, data: any) => {
    console.log(`\n✅ [${new Date().toISOString()}] ${step}`);
    console.log('📊 Data:', JSON.stringify(data, null, 2));
  },
  error: (step: string, error: any) => {
    console.log(`\n❌ [${new Date().toISOString()}] ${step}`);
    console.error('💥 Error:', error);
  },
  curl: (name: string, curl: string) => {
    console.log(`\n🌐 [${new Date().toISOString()}] Generated ${name} cURL:`);
    console.log('📋 cURL Command:');
    console.log(curl);
  }
};

router.post('/parse', async (req: Request, res: Response) => {
  try {
    const { prompt } = ParseRequestSchema.parse(req.body);
    log.info('PARSE REQUEST RECEIVED', { prompt });
    
    // Parse natural language to canonical filters
    const canonical = await parseNaturalLanguage(prompt);
    log.success('NATURAL LANGUAGE PARSED', { canonical });
    
    // Build payloads
    const screenPayload = buildScreeningPayload(canonical);
    log.success('SCREENING PAYLOAD BUILT', { screenPayload });
    
    const companySearchPayload = buildCompanySearchPayload(canonical);
    log.success('COMPANY SEARCH PAYLOAD BUILT', { companySearchPayload });
    
    // Generate cURLs
    const screenCurl = buildScreenCurl(screenPayload);
    const searchCurl = buildCompanySearchCurl(companySearchPayload);
    
    log.curl('SCREENER API', screenCurl);
    log.curl('COMPANY SEARCH API', searchCurl);
    
    const curls = {
      screen: screenCurl,
      search: searchCurl
    };
    
    const response: ParseResponse = {
      canonical,
      screenPayload,
      companySearchPayload,
      curls
    };
    
    log.success('PARSE REQUEST COMPLETED', { responseKeys: Object.keys(response) });
    res.json(response);
  } catch (error) {
    log.error('PARSE REQUEST FAILED', error);
    res.status(400).json({ error: 'Failed to parse prompt' });
  }
});

router.post('/run', async (req: Request, res: Response) => {
  try {
    const { prompt } = RunRequestSchema.parse(req.body);
    log.info('RUN REQUEST RECEIVED', { prompt });
    
    const apiKey = process.env.CRUSTDATA_API_KEY;
    if (!apiKey) {
      log.error('API KEY MISSING', { message: 'CRUSTDATA_API_KEY not configured' });
      return res.status(500).json({ error: 'CRUSTDATA_API_KEY not configured' });
    }
    
    const client = new CrustdataClient(apiKey);
    
    // Parse and build payloads
    const canonical = await parseNaturalLanguage(prompt);
    log.success('NATURAL LANGUAGE PARSED', { canonical });
    
    const screenPayload = buildScreeningPayload(canonical);
    log.success('SCREENING PAYLOAD BUILT', { screenPayload });
    
    const companySearchPayload = buildCompanySearchPayload(canonical);
    log.success('COMPANY SEARCH PAYLOAD BUILT', { companySearchPayload });
    
    const personSearchPayload = buildPersonSearchPayload(canonical);
    log.success('PERSON SEARCH PAYLOAD BUILT', { personSearchPayload });
    
    let screenRes: any = null;
    let companySearchRes: any = null;
    let domains: string[] = [];
    let companyNames: string[] = [];
    let companiesEnriched: any[] = [];
    let peopleSearchRes: any = null;
    let peopleMatched: Record<string, any[]> = {};
    
    // Step 1: Try screener first
    log.info('STEP 1: CALLING SCREENER API', { payload: screenPayload });
    try {
      screenRes = await client.screenCompanies(screenPayload);
      log.success('SCREENER API SUCCESS', { 
        fieldsCount: screenRes?.fields?.length || 0,
        rowsCount: screenRes?.rows?.length || 0,
        responseKeys: Object.keys(screenRes || {}),
        sampleData: screenRes?.rows?.slice(0, 2) || []
      });
      
      domains = client.extractDomainsFromScreenResponse(screenRes);
      companyNames = client.extractCompanyNamesFromScreenResponse(screenRes);
      log.success('DOMAINS EXTRACTED FROM SCREENER', { 
        domainsCount: domains.length,
        domains: domains.slice(0, 5), // Show first 5
        companyNamesCount: companyNames.length,
        companyNames: companyNames.slice(0, 5) // Show first 5
      });
    } catch (error: any) {
      log.error('SCREENER API FAILED', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    }
    
    // Step 2: If no domains from screener, try company search
    if (domains.length === 0) {
      log.info('STEP 2: CALLING COMPANY SEARCH API (fallback)', { payload: companySearchPayload });
      try {
        companySearchRes = await client.searchCompanies(companySearchPayload);
        log.success('COMPANY SEARCH API SUCCESS', { 
          companiesCount: companySearchRes?.companies?.length || 0,
          totalCount: companySearchRes?.total_display_count || 0
        });
        
        domains = client.extractDomainsFromSearchResponse(companySearchRes);
        log.success('DOMAINS EXTRACTED FROM SEARCH', { 
          domainsCount: domains.length,
          domains: domains.slice(0, 5)
        });
      } catch (error: any) {
        log.error('COMPANY SEARCH API FAILED', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorData: error.response?.data,
          message: error.message,
          url: error.config?.url,
          payload: companySearchPayload
        });
      }
    } else {
      log.info('STEP 2: SKIPPED (domains found from screener)', { reason: 'domains already found' });
    }
    
    // Step 3: Enrich companies if we have domains
    if (domains.length > 0) {
      log.info('STEP 3: CALLING COMPANY ENRICHMENT API', { 
        domainsToEnrich: domains.length,
        domains: domains
      });
      try {
        companiesEnriched = await client.enrichCompanies(domains);
        log.success('COMPANY ENRICHMENT API SUCCESS', { 
          enrichedCount: companiesEnriched.length,
          sampleCompany: companiesEnriched[0]?.company_name || 'N/A'
        });
      } catch (error: any) {
        log.error('COMPANY ENRICHMENT API FAILED', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorData: error.response?.data,
          message: error.message,
          domainsAttempted: domains
        });
      }
    } else {
      log.info('STEP 3: SKIPPED (no domains to enrich)', { reason: 'no domains available' });
    }
    
    // Step 4: Search for people
    log.info('STEP 4: CALLING PEOPLE SEARCH API', { payload: personSearchPayload });
    try {
      peopleSearchRes = await client.searchPeople(personSearchPayload);
      log.success('PEOPLE SEARCH API SUCCESS', { 
        profilesCount: peopleSearchRes?.profiles?.length || 0,
        totalCount: peopleSearchRes?.total_display_count || 0
      });
      
      peopleMatched = client.joinPeopleToCompanies(peopleSearchRes, companiesEnriched);
      log.success('PEOPLE MATCHED TO COMPANIES', { 
        companiesWithPeople: Object.keys(peopleMatched).length,
        totalPeopleMatched: Object.values(peopleMatched).flat().length,
        peopleByCompany: Object.fromEntries(
          Object.entries(peopleMatched).map(([company, people]) => [company, people.length])
        )
      });
    } catch (error: any) {
      log.error('PEOPLE SEARCH API FAILED', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        message: error.message,
        url: error.config?.url,
        payload: personSearchPayload
      });
    }
    
    // Generate all cURLs
    const curls = {
      screen: buildScreenCurl(screenPayload),
      search: buildCompanySearchCurl(companySearchPayload),
      enrich: domains.length > 0 ? buildEnrichCurl(domains) : 'No domains available for enrichment',
      people: buildPersonSearchCurl(personSearchPayload)
    };
    
    log.curl('SCREENER API', curls.screen);
    log.curl('COMPANY SEARCH API', curls.search);
    log.curl('COMPANY ENRICHMENT API', curls.enrich);
    log.curl('PEOPLE SEARCH API', curls.people);
    
    const response: RunResponse = {
      canonical,
      curls,
      screenRes,
      companiesEnriched,
      peopleMatched
    };
    
    log.success('RUN REQUEST COMPLETED', {
      canonicalFilters: Object.keys(canonical).length,
      curlsGenerated: Object.keys(curls).length,
      companiesEnriched: companiesEnriched.length,
      peopleMatched: Object.keys(peopleMatched).length
    });
    
    res.json(response);
  } catch (error) {
    log.error('RUN REQUEST FAILED', error);
    res.status(500).json({ error: 'Failed to execute search pipeline' });
  }
});

export default router;
