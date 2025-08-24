# MCP Server Help Documentation

This document describes how to use the MCP (Model Context Protocol) Server endpoints to interact with various tools and services.

## Available Endpoints

### 1. Web Search (`web_search`)

**Description**: Search the web and return top results with links, titles, and snippets.

**Endpoint**: `web_search`

**Parameters**:
- `query` (required): The search query to look up
- `maxResults` (optional): Maximum number of results to return (default: 10, max: 10)

**Example Request**:
```json
{
  "id": "search-123",
  "method": "web_search",
  "params": {
    "query": "artificial intelligence trends 2024",
    "maxResults": 5
  }
}
```

**Example Response**:
```json
{
  "id": "search-123",
  "result": {
    "searchResults": {
      "query": "artificial intelligence trends 2024",
      "totalResults": 5,
      "results": [
        {
          "link": "https://example1.com/search-result-1",
          "title": "Search Result 1 for \"artificial intelligence trends 2024\"",
          "source": "Example Site 1",
          "snippet": "This is a mock search result snippet...",
          "timestamp": "2024-01-15T10:30:00.000Z"
        }
      ],
      "timestamp": "2024-01-15T10:30:00.000Z",
      "source": "Mock Search Results (Demo Mode)"
    },
    "success": true
  }
}
```

### 2. HTTP GET (`http_get`)

**Description**: Fetch HTML content from a URL and return webpage data including title, meta tags, and content structure.

**Endpoint**: `http_get`

**Parameters**:
- `url` (required): The URL to fetch HTML content from
- `timeout` (optional): Request timeout in milliseconds (default: 10000)

**Example Request**:
```json
{
  "id": "http-123",
  "method": "http_get",
  "params": {
    "url": "https://example.com",
    "timeout": 5000
  }
}
```

**Example Response**:
```json
{
  "id": "http-123",
  "result": {
    "httpResponse": {
      "url": "https://example.com",
      "html": "<html><head><title>Mock Page...</title></head><body>...</body></html>",
      "title": "Mock Page for https://example.com",
      "metaDescription": "A mock webpage for demonstration purposes",
      "metaKeywords": "mock, demo, example",
      "h1": "Mock Content",
      "h2": "Sample Section",
      "h3": "Subsection",
      "paragraphs": "This is a mock response for demonstration purposes...",
      "statusCode": 200,
      "headers": {
        "content-type": "text/html",
        "server": "Mock Server"
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "success": true
  }
}
```

### 3. Weather Information (`get_weather`)

**Description**: Get current weather information for a specified city.

**Endpoint**: `get_weather`

**Parameters**:
- `city` (required): City name to get weather for
- `country` (optional): Country code (e.g., "US", "GB")

**Example Request**:
```json
{
  "id": "weather-123",
  "method": "get_weather",
  "params": {
    "city": "New York",
    "country": "US"
  }
}
```

### 4. Random User Data (`get_random_user`)

**Description**: Get random user information from a public API.

**Endpoint**: `get_random_user`

**Parameters**:
- `count` (optional): Number of users to fetch (1-10, default: 1)

**Example Request**:
```json
{
  "id": "user-123",
  "method": "get_random_user",
  "params": {
    "count": 3
  }
}
```

### 5. Time Information (`get_time`)

**Description**: Get current time in specified timezone or UTC.

**Endpoint**: `get_time`

**Parameters**:
- `timezone` (optional): Timezone (e.g., "UTC", "America/New_York", default: "UTC")

**Example Request**:
```json
{
  "id": "time-123",
  "method": "get_time",
  "params": {
    "timezone": "America/New_York"
  }
}
```

### 6. List Tools (`list_tools`)

**Description**: List all available MCP tools with their descriptions and schemas.

**Endpoint**: `list_tools`

**Parameters**: None

**Example Request**:
```json
{
  "id": "tools-123",
  "method": "list_tools",
  "params": {}
}
```

### 7. Server Status (`server_status`)

**Description**: Get MCP server status and health information.

**Endpoint**: `server_status`

**Parameters**: None

**Example Request**:
```json
{
  "id": "status-123",
  "method": "server_status",
  "params": {}
}
```

## How to Use

### 1. Start the MCP Server
```bash
cd mcp-server
npm install
npm run build
npm start
```

### 2. Send Requests
All requests should be sent to the MCP server with the following structure:
```json
{
  "id": "unique-request-id",
  "method": "endpoint-name",
  "params": {
    "parameter1": "value1",
    "parameter2": "value2"
  }
}
```

### 3. Handle Responses
Responses will have this structure:
```json
{
  "id": "unique-request-id",
  "result": {
    "data": "actual response data",
    "success": true
  }
}
```

Or in case of errors:
```json
{
  "id": "unique-request-id",
  "error": {
    "code": 400,
    "message": "Error description"
  }
}
```

## Notes

- **Demo Mode**: The `web_search` and `http_get` endpoints currently return mock data for demonstration purposes. In production, you would need to configure actual API keys and handle CORS issues.
- **Rate Limiting**: Be mindful of API rate limits when using external services.
- **Error Handling**: Always check the `success` field in responses and handle errors appropriately.
- **Request IDs**: Use unique IDs for each request to properly match responses.

## Production Setup

To use real web search and HTTP GET functionality:

1. **Web Search**: Configure a Bing Search API key or use alternative search APIs
2. **HTTP GET**: Implement proper CORS handling and user-agent headers
3. **Security**: Add authentication and rate limiting as needed
4. **Monitoring**: Add logging and error tracking for production use
