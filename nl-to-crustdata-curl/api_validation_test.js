const axios = require('axios');

// Test script to validate API responses with real keys
async function validateAPIWithRealKeys() {
  console.log('🔍 API VALIDATION TEST');
  console.log('='.repeat(50));
  
  const testQuery = "AI startups in India with 50-200 employees, Series A funding";
  
  try {
    console.log(`📝 Testing query: "${testQuery}"`);
    console.log('🔄 Calling /api/run endpoint...\n');
    
    const response = await axios.post('http://localhost:4000/api/run', {
      prompt: testQuery
    });
    
    const data = response.data;
    
    console.log('📊 DETAILED API RESPONSE ANALYSIS:');
    console.log('-'.repeat(40));
    
    // Check canonical filters
    console.log('🧠 CANONICAL FILTERS:');
    console.log(JSON.stringify(data.canonical, null, 2));
    console.log(`   Fields: ${Object.keys(data.canonical || {}).length}`);
    
    // Check screen response
    console.log('\n1️⃣ SCREENER API:');
    if (data.screenRes) {
      console.log(`   ✅ Success - Fields: ${data.screenRes.fields?.length || 0}, Rows: ${data.screenRes.rows?.length || 0}`);
      if (data.screenRes.rows?.length > 0) {
        console.log(`   📊 Sample data: ${JSON.stringify(data.screenRes.rows[0], null, 2)}`);
      }
    } else {
      console.log('   ❌ Failed or empty response');
    }
    
    // Check company search
    console.log('\n2️⃣ COMPANY SEARCH:');
    if (data.companySearchRes) {
      console.log(`   ✅ Success - Companies: ${data.companySearchRes.companies?.length || 0}`);
    } else {
      console.log('   ❌ Failed or empty response');
    }
    
    // Check enrichment
    console.log('\n3️⃣ COMPANY ENRICHMENT:');
    console.log(`   Companies enriched: ${data.companiesEnriched?.length || 0}`);
    if (data.companiesEnriched?.length > 0) {
      console.log(`   📊 Sample enriched company: ${data.companiesEnriched[0]?.company_name || 'N/A'}`);
    }
    
    // Check people search
    console.log('\n4️⃣ PEOPLE SEARCH:');
    const peopleCount = Object.values(data.peopleMatched || {}).flat().length;
    console.log(`   People matched: ${peopleCount}`);
    console.log(`   Companies with people: ${Object.keys(data.peopleMatched || {}).length}`);
    
    // Check cURL commands
    console.log('\n🔧 CURL COMMANDS GENERATED:');
    const curlKeys = Object.keys(data.curls || {});
    curlKeys.forEach(key => {
      const status = data.curls[key] ? '✅' : '❌';
      console.log(`   ${key}: ${status}`);
    });
    
    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    const hasScreenData = data.screenResponse?.rows?.length > 0;
    const hasSearchData = data.companySearchResponse?.companies?.length > 0;
    const hasEnrichData = data.companiesEnriched?.length > 0;
    const hasPeopleData = peopleCount > 0;
    const hasAllCurls = curlKeys.length === 4 && curlKeys.every(k => data.curls[k]);
    
    console.log(`   Claude parsing: ✅`);
    console.log(`   Screen API: ${hasScreenData ? '✅' : '❌'}`);
    console.log(`   Search API: ${hasSearchData ? '✅' : '❌'}`);
    console.log(`   Enrich API: ${hasEnrichData ? '✅' : '❌'}`);
    console.log(`   People API: ${hasPeopleData ? '✅' : '❌'}`);
    console.log(`   cURL generation: ${hasAllCurls ? '✅' : '❌'}`);
    
    if (hasScreenData || hasSearchData) {
      console.log('\n🎉 SUCCESS: Pipeline working with real data!');
    } else {
      console.log('\n⚠️  API calls failed - check API keys and authentication');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the validation
validateAPIWithRealKeys();
