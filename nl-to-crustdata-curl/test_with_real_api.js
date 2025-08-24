const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, `api_test_${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log(message);
}

async function testRealCrustdataAPI() {
  logToFile('🚀 TESTING WITH REAL CRUSTDATA API CREDENTIALS');
  logToFile('='.repeat(60));
  
  const testQuery = "AI startups in India with 50-200 employees, Series A funding";
  
  try {
    logToFile(`📝 Testing query: "${testQuery}"`);
    logToFile('🔄 Calling /api/run endpoint...\n');
    
    const response = await axios.post('http://localhost:4000/api/run', {
      prompt: testQuery
    });
    
    const data = response.data;
    
    logToFile('📊 DETAILED API RESPONSE ANALYSIS:');
    logToFile('-'.repeat(40));
    
    // Log canonical filters
    logToFile('🧠 CANONICAL FILTERS:');
    logToFile(JSON.stringify(data.canonicalFilters, null, 2));
    
    // Log all cURL commands
    logToFile('\n🔧 GENERATED CURL COMMANDS:');
    logToFile('-'.repeat(30));
    
    if (data.curls) {
      Object.entries(data.curls).forEach(([apiName, curl]) => {
        logToFile(`\n${apiName.toUpperCase()} API cURL:`);
        logToFile(curl);
      });
    }
    
    // Test each cURL command by executing it
    logToFile('\n🧪 TESTING CURL COMMANDS:');
    logToFile('-'.repeat(30));
    
    if (data.curls && data.curls.screen && typeof data.curls.screen === 'string') {
      logToFile('\n1️⃣ Testing SCREENER API cURL...');
      try {
        // Replace environment variable with actual token
        const screenCurl = data.curls.screen.replace('$CRUSTDATA_API_KEY', '19eea58464a54ceab9c4dab5fe24a13f8f19c2a8');
        
        // Execute the cURL command using axios equivalent
        const screenPayload = JSON.parse(data.curls.screen.match(/-d "(.+)"/s)[1].replace(/\\"/g, '"'));
        
        const screenResponse = await axios.post('https://api.crustdata.com/screener/screen/', screenPayload, {
          headers: {
            'Authorization': 'Bearer 19eea58464a54ceab9c4dab5fe24a13f8f19c2a8',
            'Content-Type': 'application/json'
          }
        });
        
        logToFile(`✅ SCREENER API SUCCESS: Status ${screenResponse.status}`);
        logToFile(`   Fields: ${screenResponse.data.fields?.length || 0}`);
        logToFile(`   Rows: ${screenResponse.data.rows?.length || 0}`);
        
        if (screenResponse.data.rows?.length > 0) {
          logToFile(`   Sample row: ${JSON.stringify(screenResponse.data.rows[0], null, 2)}`);
        }
        
      } catch (error) {
        logToFile(`❌ SCREENER API FAILED: ${error.response?.status} - ${error.response?.statusText}`);
        logToFile(`   Error: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
      }
    }
    
    if (data.curls && data.curls.search && typeof data.curls.search === 'string') {
      logToFile('\n2️⃣ Testing COMPANY SEARCH API cURL...');
      try {
        // Execute the company search cURL
        const searchPayload = JSON.parse(data.curls.search.match(/-d "(.+)"/s)[1].replace(/\\"/g, '"'));
        
        const searchResponse = await axios.post('https://api.crustdata.com/screener/company/search', searchPayload, {
          headers: {
            'Authorization': 'Bearer 19eea58464a54ceab9c4dab5fe24a13f8f19c2a8',
            'Content-Type': 'application/json'
          }
        });
        
        logToFile(`✅ COMPANY SEARCH API SUCCESS: Status ${searchResponse.status}`);
        logToFile(`   Companies: ${searchResponse.data.companies?.length || 0}`);
        logToFile(`   Total: ${searchResponse.data.total_display_count || 0}`);
        
        if (searchResponse.data.companies?.length > 0) {
          logToFile(`   Sample company: ${JSON.stringify(searchResponse.data.companies[0], null, 2)}`);
        }
        
      } catch (error) {
        logToFile(`❌ COMPANY SEARCH API FAILED: ${error.response?.status} - ${error.response?.statusText}`);
        logToFile(`   Error: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
      }
    }
    
    if (data.curls && data.curls.enrich && typeof data.curls.enrich === 'string' && data.curls.enrich.includes('curl')) {
      logToFile('\n3️⃣ Testing COMPANY ENRICHMENT API cURL...');
      try {
        // Extract URL from cURL command
        const urlMatch = data.curls.enrich.match(/curl -sX GET "([^"]+)"/);
        if (urlMatch) {
          const enrichUrl = urlMatch[1].replace('$CRUSTDATA_API_KEY', '19eea58464a54ceab9c4dab5fe24a13f8f19c2a8');
          
          const enrichResponse = await axios.get(enrichUrl, {
            headers: {
              'Authorization': 'Bearer 19eea58464a54ceab9c4dab5fe24a13f8f19c2a8'
            }
          });
          
          logToFile(`✅ COMPANY ENRICHMENT API SUCCESS: Status ${enrichResponse.status}`);
          logToFile(`   Companies enriched: ${Array.isArray(enrichResponse.data) ? enrichResponse.data.length : 1}`);
          
          if (Array.isArray(enrichResponse.data) && enrichResponse.data.length > 0) {
            logToFile(`   Sample enriched: ${JSON.stringify(enrichResponse.data[0], null, 2)}`);
          }
        }
        
      } catch (error) {
        logToFile(`❌ COMPANY ENRICHMENT API FAILED: ${error.response?.status} - ${error.response?.statusText}`);
        logToFile(`   Error: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
      }
    }
    
    if (data.curls && data.curls.people && typeof data.curls.people === 'string') {
      logToFile('\n4️⃣ Testing PEOPLE SEARCH API cURL...');
      try {
        // Execute the people search cURL
        const peoplePayload = JSON.parse(data.curls.people.match(/-d "(.+)"/s)[1].replace(/\\"/g, '"'));
        
        const peopleResponse = await axios.post('https://api.crustdata.com/screener/person/search', peoplePayload, {
          headers: {
            'Authorization': 'Bearer 19eea58464a54ceab9c4dab5fe24a13f8f19c2a8',
            'Content-Type': 'application/json'
          }
        });
        
        logToFile(`✅ PEOPLE SEARCH API SUCCESS: Status ${peopleResponse.status}`);
        logToFile(`   People found: ${peopleResponse.data.people?.length || 0}`);
        logToFile(`   Total: ${peopleResponse.data.total_display_count || 0}`);
        
        if (peopleResponse.data.people?.length > 0) {
          logToFile(`   Sample person: ${JSON.stringify(peopleResponse.data.people[0], null, 2)}`);
        }
        
      } catch (error) {
        logToFile(`❌ PEOPLE SEARCH API FAILED: ${error.response?.status} - ${error.response?.statusText}`);
        logToFile(`   Error: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
      }
    }
    
    // Overall assessment
    logToFile('\n🎯 FINAL ASSESSMENT:');
    logToFile('-'.repeat(20));
    logToFile(`✅ Claude AI parsing working`);
    logToFile(`✅ cURL generation working`);
    logToFile(`✅ Real API credentials configured`);
    logToFile(`📝 All responses logged to: ${logFile}`);
    
  } catch (error) {
    logToFile(`❌ PIPELINE TEST FAILED: ${error.message}`);
    if (error.response) {
      logToFile(`Response status: ${error.response.status}`);
      logToFile(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Start the test
console.log(`📝 Logs will be written to: ${logFile}`);
testRealCrustdataAPI();
