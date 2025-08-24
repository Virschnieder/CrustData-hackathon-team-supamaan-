const axios = require('axios');

// Test more industry values based on common categories
const testIndustries = [
  'Software Development',
  'Financial Services', 
  'Healthcare',
  'E-commerce',
  'Retail',
  'Manufacturing',
  'Education',
  'Media',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Advertising',
  'Gaming',
  'Entertainment',
  'Telecommunications',
  'Energy',
  'Automotive',
  'Biotechnology',
  'Pharmaceuticals',
  'Food & Beverage',
  'Travel',
  'Hospitality',
  'Construction',
  'Agriculture',
  'Logistics',
  'Transportation'
];

async function testMoreIndustries() {
  console.log('🔍 TESTING MORE INDUSTRY VALUES');
  console.log('='.repeat(40));
  
  const validIndustries = [];
  
  for (const industry of testIndustries) {
    try {
      const payload = {
        filters: [
          {
            filter_type: 'INDUSTRY',
            type: 'in',
            value: [industry]
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
      
      console.log(`✅ "${industry}" - Companies: ${response.data.companies?.length || 0}`);
      validIndustries.push(industry);
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`❌ "${industry}" - Invalid`);
      } else {
        console.log(`❌ "${industry}" - Error: ${error.response?.status}`);
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  console.log('\n🎯 VALID INDUSTRIES FOUND:');
  console.log('='.repeat(30));
  validIndustries.forEach(industry => console.log(`- ${industry}`));
  
  console.log('\n📝 INDUSTRY MAPPING FOR CODE:');
  console.log('const industryMapping = {');
  console.log('  "AI": "Software Development",');
  console.log('  "Fintech": "Financial Services",');
  validIndustries.forEach(industry => {
    const key = industry.replace(/[^a-zA-Z]/g, '');
    if (key !== industry) {
      console.log(`  "${key}": "${industry}",`);
    }
  });
  console.log('};');
}

testMoreIndustries();
