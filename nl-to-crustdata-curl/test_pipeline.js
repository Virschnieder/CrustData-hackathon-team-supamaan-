const axios = require('axios');

async function testPipeline() {
  const testPrompt = "AI startups in India with 50-200 employees, Series A funding";
  
  console.log('🚀 Testing complete pipeline...');
  console.log('📝 Prompt:', testPrompt);
  console.log('');

  try {
    // Test the /run endpoint which does the full pipeline
    console.log('🔄 Calling /api/run endpoint...');
    const response = await axios.post('http://localhost:4000/api/run', {
      prompt: testPrompt
    });

    console.log('✅ Pipeline completed successfully!');
    console.log('');
    console.log('📊 Results:');
    console.log('- Canonical filters:', JSON.stringify(response.data.canonical, null, 2));
    console.log('- Companies enriched:', response.data.companiesEnriched?.length || 0);
    console.log('- People matched:', Object.keys(response.data.peopleMatched || {}).length);
    console.log('');
    console.log('🌐 Generated cURLs:');
    console.log('- Screener:', response.data.curls.screen ? '✅' : '❌');
    console.log('- Search:', response.data.curls.search ? '✅' : '❌');
    console.log('- Enrich:', response.data.curls.enrich ? '✅' : '❌');
    console.log('- People:', response.data.curls.people ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Pipeline failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('');
      console.log('💡 This might be due to missing CRUSTDATA_API_KEY');
      console.log('   The Claude parsing should still work though!');
      
      // Test just the parsing endpoint
      try {
        console.log('');
        console.log('🔄 Testing /api/parse endpoint (Claude only)...');
        const parseResponse = await axios.post('http://localhost:4000/api/parse', {
          prompt: testPrompt
        });
        
        console.log('✅ Claude parsing works!');
        console.log('📊 Parsed filters:', JSON.stringify(parseResponse.data.canonical, null, 2));
        
      } catch (parseError) {
        console.error('❌ Claude parsing also failed:', parseError.response?.data || parseError.message);
      }
    }
  }
}

testPipeline();
