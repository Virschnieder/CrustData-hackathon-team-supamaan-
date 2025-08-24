export interface PublicApiResponse {
  data: any;
  timestamp: string;
  source: string;
}

export interface WebSearchResult {
  link: string;
  title: string;
  source: string;
  snippet: string;
  timestamp: string;
}

export interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  totalResults: number;
  timestamp: string;
  source: string;
}

export interface HttpGetResponse {
  url: string;
  html: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  h1: string;
  h2: string;
  h3: string;
  paragraphs: string;
  statusCode: number;
  headers: Record<string, string>;
  timestamp: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (params: any) => Promise<any>;
}

export interface MCPRequest {
  id: string;
  method: string;
  params: any;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface ServerConfig {
  port: number;
  host: string;
  jwtSecret: string;
  corsOrigin: string;
  logLevel: string;
}
// Test comment
