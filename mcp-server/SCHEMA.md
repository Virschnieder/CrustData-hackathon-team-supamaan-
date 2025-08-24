# MCP Server Schema Documentation

This document provides detailed schema information for all MCP Server endpoints, including request and response structures, data types, and field descriptions.

## General Request/Response Structure

### Base Request Schema
```json
{
  "id": "string (required)",
  "method": "string (required)",
  "params": "object (required)"
}
```

### Base Response Schema
```json
{
  "id": "string (required)",
  "result": "object (optional)",
  "error": "object (optional)"
}
```

### Error Response Schema
```json
{
  "code": "number (required)",
  "message": "string (required)"
}
```

## Endpoint Schemas

### 1. Web Search (`web_search`)

#### Request Schema
```json
{
  "id": "string",
  "method": "web_search",
  "params": {
    "query": "string (required)",
    "maxResults": "number (optional, default: 10, max: 10)"
  }
}
```

#### Response Schema
```json
{
  "id": "string",
  "result": {
    "searchResults": {
      "query": "string",
      "totalResults": "number",
      "results": [
        {
          "link": "string (URL)",
          "title": "string",
          "source": "string",
          "snippet": "string",
          "timestamp": "string (ISO 8601)"
        }
      ],
      "timestamp": "string (ISO 8601)",
      "source": "string"
    },
    "success": "boolean"
  }
}
```

#### Field Descriptions
- **query**: The search query string that was used
- **totalResults**: Total number of results found
- **results**: Array of search result objects
  - **link**: Full URL to the result page
  - **title**: Title of the webpage
  - **source**: Source/domain of the result
  - **snippet**: Brief description or excerpt from the page
  - **timestamp**: When the result was generated
- **timestamp**: When the search was performed
- **source**: Source of the search results (e.g., "Mock Search Results (Demo Mode)")

### 2. HTTP GET (`http_get`)

#### Request Schema
```json
{
  "id": "string",
  "method": "http_get",
  "params": {
    "url": "string (required, URL)",
    "timeout": "number (optional, default: 10000, milliseconds)"
  }
}
```

#### Response Schema
```json
{
  "id": "string",
  "result": {
    "httpResponse": {
      "url": "string (URL)",
      "html": "string (HTML content)",
      "title": "string",
      "metaDescription": "string",
      "metaKeywords": "string",
      "h1": "string",
      "h2": "string",
      "h3": "string",
      "paragraphs": "string",
      "statusCode": "number",
      "headers": "object",
      "timestamp": "string (ISO 8601)"
    },
    "success": "boolean"
  }
}
```

#### Field Descriptions
- **url**: The URL that was requested
- **html**: Full HTML content of the webpage
- **title**: Page title from `<title>` tag
- **metaDescription**: Content from `meta[name="description"]` tag
- **metaKeywords**: Content from `meta[name="keywords"]` tag
- **h1**: Text content from first `<h1>` tag
- **h2**: Text content from first `<h2>` tag
- **h3**: Text content from first `<h3>` tag
- **paragraphs**: Concatenated text from all `<p>` tags
- **statusCode**: HTTP status code of the response
- **headers**: HTTP response headers as key-value pairs
- **timestamp**: When the request was processed

### 3. Weather Information (`get_weather`)

#### Request Schema
```json
{
  "id": "string",
  "method": "get_weather",
  "params": {
    "city": "string (required)",
    "country": "string (optional, country code)"
  }
}
```

#### Response Schema
```json
{
  "id": "string",
  "result": {
    "weather": {
      "data": {
        "city": "string",
        "country": "string",
        "temperature": "number (Celsius)",
        "description": "string",
        "humidity": "number (percentage)",
        "windSpeed": "number (m/s)"
      },
      "timestamp": "string (ISO 8601)",
      "source": "string"
    },
    "success": "boolean"
  }
}
```

### 4. Random User Data (`get_random_user`)

#### Request Schema
```json
{
  "id": "string",
  "method": "get_random_user",
  "params": {
    "count": "number (optional, 1-10, default: 1)"
  }
}
```

#### Response Schema
```json
{
  "id": "string",
  "result": {
    "users": {
      "data": [
        {
          "name": "string",
          "email": "string",
          "location": "string",
          "picture": "string (URL) or null"
        }
      ],
      "timestamp": "string (ISO 8601)",
      "source": "string"
    },
    "success": "boolean"
  }
}
```

### 5. Time Information (`get_time`)

#### Request Schema
```json
{
  "id": "string",
  "method": "get_time",
  "params": {
    "timezone": "string (optional, default: 'UTC')"
  }
}
```

#### Response Schema
```json
{
  "id": "string",
  "result": {
    "time": {
      "data": {
        "timezone": "string",
        "datetime": "string (ISO 8601)",
        "date": "string",
        "time": "string",
        "dayOfWeek": "string",
        "utcOffset": "number (minutes)"
      },
      "timestamp": "string (ISO 8601)",
      "source": "string"
    },
    "success": "boolean"
  }
}
```

### 6. List Tools (`list_tools`)

#### Request Schema
```json
{
  "id": "string",
  "method": "list_tools",
  "params": {}
}
```

#### Response Schema
```json
{
  "id": "string",
  "result": {
    "tools": [
      {
        "name": "string",
        "description": "string",
        "inputSchema": "object"
      }
    ],
    "count": "number"
  }
}
```

### 7. Server Status (`server_status`)

#### Request Schema
```json
{
  "id": "string",
  "method": "server_status",
  "params": {}
}
```

#### Response Schema
```json
{
  "id": "string",
  "result": {
    "status": "string",
    "timestamp": "string (ISO 8601)",
    "toolsCount": "number",
    "claudeStatus": "string"
  }
}
```

## Data Types

### Primitive Types
- **string**: UTF-8 encoded text
- **number**: JavaScript number (integer or float)
- **boolean**: true or false
- **object**: JSON object
- **array**: JSON array

### Special Types
- **URL**: Valid HTTP/HTTPS URL string
- **ISO 8601**: ISO 8601 formatted datetime string (e.g., "2024-01-15T10:30:00.000Z")
- **percentage**: Number between 0-100
- **milliseconds**: Number representing milliseconds

## Validation Rules

### Required Fields
- All request objects must include `id`, `method`, and `params`
- All response objects must include `id`
- Either `result` or `error` must be present in responses

### Field Constraints
- **maxResults**: Must be between 1 and 10
- **count**: Must be between 1 and 10
- **timeout**: Must be positive number
- **url**: Must be valid HTTP/HTTPS URL
- **city**: Must be non-empty string
- **country**: Must be valid country code (2-3 characters)

### Error Codes
- **400**: Bad Request (invalid parameters)
- **404**: Tool Not Found
- **500**: Internal Server Error

## Example Usage

### Complete Web Search Request
```json
{
  "id": "search-2024-01-15-001",
  "method": "web_search",
  "params": {
    "query": "machine learning algorithms",
    "maxResults": 5
  }
}
```

### Complete HTTP GET Request
```json
{
  "id": "http-2024-01-15-001",
  "method": "http_get",
  "params": {
    "url": "https://example.com",
    "timeout": 8000
  }
}
```

## Notes

- All timestamps are in UTC and follow ISO 8601 format
- HTML content in HTTP GET responses is returned as-is
- Mock data is used for web_search and http_get in demo mode
- Success responses always include a `success: true` field
- Error responses include error code and descriptive message
- Request IDs should be unique within a session
