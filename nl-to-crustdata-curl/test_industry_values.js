const axios = require('axios');

// Test different industry values to find what works
const testIndustries = [
  'Software',
  'Technology',
  'Computer Software',
  'Information Technology',
  'Internet',
  'Software Development',
  'Tech',
  'IT Services',
  'Computer & Network Security',
  'Financial Services',
  'Health Care'
];

async function testIndustryValues() {
  console.log('🔍 TESTING INDUSTRY VALUES WITH CRUSTDATA API');
  console.log('='.repeat(50));
  
  for (const industry of testIndustries) {
    console.log(`\n📝 Testing industry: "${industry}"`);
    
    try {
      const payload = {
        filters: [
          {
            filter_type: 'INDUSTRY',
            type: 'in',
            value: [industry]
          },
          {
            filter_type: 'REGION',
            type: 'in',
            value: ['United States']
          }
        ],
        page: 1
      };
      
      const response = await axios.post('https://api.crustdata.com/screener/company/search', payload, {
        headers: {
          'Authorization': 'Bearer 19eea58464a54ceab9c4dab5fe24a13f8f19c2a8',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ SUCCESS: "${industry}" - Status ${response.status}, Companies: ${response.data.companies?.length || 0}`);
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`❌ INVALID: "${industry}" - ${error.response.data.non_field_errors?.[0] || 'Bad request'}`);
      } else {
        console.log(`❌ ERROR: "${industry}" - ${error.response?.status} ${error.response?.statusText}`);
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

testIndustryValues();
