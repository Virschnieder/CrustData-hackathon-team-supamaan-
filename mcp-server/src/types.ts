export interface PublicApiResponse {
  data: any;
  timestamp: string;
  source: string;
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
