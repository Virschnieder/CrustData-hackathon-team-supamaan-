# Responses Server

A server that monitors the `./data` directory for new subdirectories, processes them with Claude AI for company ranking, and serves the results via HTTP endpoints.

## Features

- **Directory Monitoring**: Automatically detects new subdirectories in `./data`
- **Claude Integration**: Uses Claude AI to rank companies based on investment criteria
- **Automatic Processing**: Processes new data directories as they appear
- **HTTP API**: Serves ranked results via REST endpoints
- **Local Storage**: Stores processed results in local JSON files
- **Real-time Updates**: Watches for changes and processes them automatically

## Setup

### 1. Install Dependencies

```bash
cd responses-server
npm install
```

### 2. Set Environment Variables

Set the Claude API key as an environment variable:

```bash
export CLAUDE_API_KEY=your_claude_api_key_here
```

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## How It Works

1. **Directory Monitoring**: The server watches the `../data` directory for new subdirectories
2. **Data Processing**: When a new directory (e.g., `hash1`) is created with a `data.json` file:
   - Reads the `data.json` file
   - Combines it with the context from `../prompts/context.json`
   - Sends the data to Claude AI for ranking
   - Stores the result in `./responses/hash1.json`
3. **API Serving**: Results are served via HTTP endpoints

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### List All Outputs
```
GET /outputs
```
Returns a list of all processed hash directories.

### Get Specific Output
```
GET /outputs/{hash}
```
Returns the processed data for a specific hash (e.g., `/outputs/hash1`).

### Get Processing Status
```
GET /status/{hash}
```
Returns the current processing status of a specific hash.

### Force Reprocess
```
POST /reprocess/{hash}
```
Forces reprocessing of a specific hash directory.

## Directory Structure

```
responses-server/
├── index.js              # Main server file
├── responses/            # Processed results storage
├── package.json
└── README.md
```

## Data Flow

1. **Input**: New directory created in `../data/` (e.g., `../data/hash1/`)
2. **Processing**: `data.json` is read and sent to Claude with context
3. **Output**: Ranked results stored in `./responses/hash1.json`
4. **Serving**: Results available via `/outputs/hash1` endpoint

## Example Usage

### Start the Server
```bash
cd responses-server
npm install
npm start
```

### Create Test Data
```bash
# Create a new hash directory
mkdir -p ../data/test-hash
# Add data.json file
echo '{"company_data": {}, "employees_data": [], "external_links": []}' > ../data/test-hash/data.json
```

### Access Results
```bash
# Check if processed
curl http://localhost:3001/outputs

# Get specific result
curl http://localhost:3001/outputs/test-hash

# Check processing status
curl http://localhost:3001/status/test-hash
```

## Configuration

### Environment Variables
- `CLAUDE_API_KEY`: Your Claude API key (required)

### Data Directory
The server watches `../data` by default.

### Output Directory
Processed results are stored in `./responses` by default.

## Error Handling

- **API Errors**: Returns appropriate HTTP status codes and error messages
- **Processing Errors**: Failed processing is logged and stored with error status
- **File System Errors**: Handles missing files and directories gracefully
- **Claude API Errors**: Provides detailed error information

## Monitoring

The server provides several monitoring endpoints:
- `/health` - Basic health check
- `/outputs` - List of all processed items
- `/status/{hash}` - Processing status of specific hash

## Troubleshooting

### Common Issues

1. **Claude API Key Missing**
   - Ensure `CLAUDE_API_KEY` is set in environment variables

2. **Data Directory Not Found**
   - Check that `../data` directory exists relative to the server

3. **Context File Missing**
   - Ensure `../prompts/context.json` exists

4. **Permission Issues**
   - Check file permissions for data and responses directories

### Logs
The server provides detailed console logging for debugging:
- Directory detection events
- Processing status updates
- Error details
- API request logs

## Development

### Development Mode
```bash
npm run dev
```
Runs with nodemon for auto-reload on file changes.

## License

MIT
