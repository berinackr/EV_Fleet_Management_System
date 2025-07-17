/**
 * ALNS Algorithm Test Script
 * 
 * This script tests the ALNS API by sending a request with sample XML files
 * and checking the response.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration - updated to run from tests directory
const ALNS_API_URL = 'http://localhost:8005';
const SAMPLE_FILES_DIR = path.join(__dirname, 'test_data');
const OUTPUT_DIR = path.join(__dirname, 'test_results');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Ensure test data directory exists
if (!fs.existsSync(SAMPLE_FILES_DIR)) {
  fs.mkdirSync(SAMPLE_FILES_DIR, { recursive: true });
}

// Test sample files
const testFiles = [
  { name: 'Input.xml', path: path.join(SAMPLE_FILES_DIR, 'Input.xml') },
  { name: 'Info4Task.xml', path: path.join(SAMPLE_FILES_DIR, 'Info4Task.xml') },
  { name: 'Info4Vehicle.xml', path: path.join(SAMPLE_FILES_DIR, 'Info4Vehicle.xml') },
  { name: 'Info4Environment.xml', path: path.join(SAMPLE_FILES_DIR, 'Info4Environment.xml') }
];

/**
 * Check if the ALNS API server is running
 * @returns {Promise<boolean>} True if server is running
 */
async function checkServerStatus() {
  try {
    console.log('Checking ALNS API server status...');
    console.log(`Trying to reach ${ALNS_API_URL}/health`);
    
    const response = await axios.get(`${ALNS_API_URL}/health`, {
      timeout: 5000 // 5 seconds timeout
    });
    
    console.log('Server status:', response.data.status);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Server health check failed:', error.message);
    
    // Try the root endpoint as fallback
    try {
      console.log('Trying root endpoint instead...');
      const rootResponse = await axios.get(ALNS_API_URL, {
        timeout: 5000
      });
      console.log('Root endpoint response:', rootResponse.data);
      return true; // If we get any response, consider server running
    } catch (rootError) {
      console.error('Root endpoint also failed:', rootError.message);
      return false;
    }
  }
}

/**
 * Test the hello endpoint
 * @returns {Promise<boolean>} True if test passes
 */
async function testHelloEndpoint() {
  try {
    console.log('Testing hello endpoint...');
    const response = await axios.get(`${ALNS_API_URL}/hello`);
    console.log('Hello response:', response.data);
    return response.data.message === 'Hello, World!';
  } catch (error) {
    console.error('Hello endpoint test failed:', error.message);
    return false;
  }
}

/**
 * Run the ALNS algorithm with test files
 * @returns {Promise<void>}
 */
async function runAlnsTest() {
  try {
    console.log('Starting ALNS algorithm test...');
    
    // Check if test files exist
    const missingFiles = [];
    for (const file of testFiles) {
      if (!fs.existsSync(file.path)) {
        missingFiles.push(file.name);
      }
    }
    
    if (missingFiles.length > 0) {
      console.error(`Missing test files: ${missingFiles.join(', ')}`);
      console.log('Creating sample test files...');
      await createSampleTestFiles();
    }
    
    // Create form data with test files
    const formData = new FormData();
    for (const file of testFiles) {
      if (fs.existsSync(file.path)) {
        formData.append('input_files', fs.createReadStream(file.path), file.name);
        console.log(`Added file to request: ${file.name}`);
      }
    }
    
    console.log('Sending request to ALNS API...');
    console.time('ALNS Processing Time');
    
    // Make API request
    const response = await axios.post(`${ALNS_API_URL}/start_alns`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'arraybuffer',
      timeout: 120000 // 2 minute timeout for ALNS processing
    });
    
    console.timeEnd('ALNS Processing Time');
    
    // Save response to file
    const outputFilePath = path.join(OUTPUT_DIR, 'alns_results.zip');
    fs.writeFileSync(outputFilePath, response.data);
    
    console.log(`ALNS results saved to ${outputFilePath}`);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('ALNS test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      if (error.response.data) {
        try {
          // Try to parse the error data if it's text
          if (typeof error.response.data === 'string' || error.response.data instanceof Buffer) {
            console.error('Response data:', error.response.data.toString());
          } else {
            console.error('Response data:', error.response.data);
          }
        } catch (e) {
          console.error('Error parsing response data:', e.message);
        }
      }
    }
  }
}

/**
 * Create sample test files if they don't exist
 * @returns {Promise<void>}
 */
async function createSampleTestFiles() {
  // Create Input.xml
  const inputXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Input xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="Input.xsd">
  <Parameters>
    <MaxIterations>100</MaxIterations>
    <CoolingRate>0.99</CoolingRate>
    <InitialTemperature>100</InitialTemperature>
    <Omega>0.5</Omega>
    <OperatorPercentage>0.1</OperatorPercentage>
    <Z>3</Z>
    <K>5</K>
    <N>20</N>
  </Parameters>
  <ObjectiveFunction>TOTAL_DISTANCE</ObjectiveFunction>
</Input>`;
  
  // Create Info4Task.xml
  const info4TaskXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Info4Task xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="Info4Task.xsd">
  <TaskList>
    <Task id="task1" name="Task 1">
      <Location id="loc1" lat="39.751" lon="30.481"/>
      <TimeWindow earliestTime="100" latestTime="200"/>
      <Duration>10</Duration>
      <Demand>5</Demand>
    </Task>
    <Task id="task2" name="Task 2">
      <Location id="loc2" lat="39.752" lon="30.482"/>
      <TimeWindow earliestTime="150" latestTime="250"/>
      <Duration>20</Duration>
      <Demand>10</Demand>
    </Task>
    <Task id="task3" name="Task 3">
      <Location id="loc3" lat="39.753" lon="30.483"/>
      <TimeWindow earliestTime="200" latestTime="300"/>
      <Duration>30</Duration>
      <Demand>15</Demand>
    </Task>
  </TaskList>
</Info4Task>`;
  
  // Create Info4Vehicle.xml
  const info4VehicleXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Info4Vehicle xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="Info4Vehicle.xsd">
  <VehicleList>
    <Vehicle id="vehicle1" name="Vehicle 1">
      <Capacity>100</Capacity>
      <BatteryCapacity>200</BatteryCapacity>
      <EnergyConsumption>0.1</EnergyConsumption>
      <Speed>30</Speed>
    </Vehicle>
  </VehicleList>
</Info4Vehicle>`;
  
  // Create Info4Environment.xml
  const info4EnvironmentXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Info4Environment xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="Info4Environment.xsd">
  <Depot id="depot1" lat="39.750" lon="30.480"/>
  <ChargingStations>
    <ChargingStation id="cs1" lat="39.753" lon="30.486" chargingRate="50"/>
    <ChargingStation id="cs2" lat="39.754" lon="30.487" chargingRate="60"/>
  </ChargingStations>
</Info4Environment>`;
  
  // Save files
  fs.writeFileSync(path.join(SAMPLE_FILES_DIR, 'Input.xml'), inputXml);
  fs.writeFileSync(path.join(SAMPLE_FILES_DIR, 'Info4Task.xml'), info4TaskXml);
  fs.writeFileSync(path.join(SAMPLE_FILES_DIR, 'Info4Vehicle.xml'), info4VehicleXml);
  fs.writeFileSync(path.join(SAMPLE_FILES_DIR, 'Info4Environment.xml'), info4EnvironmentXml);
  
  console.log('Sample test files created successfully');
}

/**
 * Main test function
 */
async function runTests() {
  console.log('-------------------------------------');
  console.log('ALNS API Test Script');
  console.log('-------------------------------------');
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`Test data directory: ${SAMPLE_FILES_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  
  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.error('Server is not running. Make sure Docker is running and container is started.');
    console.error('Use "docker-compose up -d" to start the server from the AlnsCloud_v5.2 directory.');
    console.error('Or run "uvicorn server:app --host 0.0.0.0 --port 8004" directly.');
    return;
  }
  
  // Test hello endpoint
  const helloTestPassed = await testHelloEndpoint();
  if (!helloTestPassed) {
    console.error('Hello endpoint test failed. Aborting further tests.');
    return;
  }
  
  // Create test files if they don't exist
  await createSampleTestFiles();
  
  // Run ALNS test
  await runAlnsTest();
  
  console.log('-------------------------------------');
  console.log('All tests completed');
  console.log('-------------------------------------');
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error);
});
