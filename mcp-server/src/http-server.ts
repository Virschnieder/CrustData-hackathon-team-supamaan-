import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { MCPServer } from './mcp-server';
import { MCPRequest, MCPResponse } from './types';

export class HTTPServer {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer;
  private mcpServer: MCPServer;
  private port: number;
  private host: string;

  constructor(
    mcpServer: MCPServer,
    port: number = 3000,
    host: string = 'localhost'
  ) {
    this.mcpServer = mcpServer;
    this.port = port;
    this.host = host;

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();

    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // List available tools
    this.app.get('/tools', (req, res) => {
      const tools = this.mcpServer.getAvailableTools();
      res.json({ tools, count: tools.length });
    });

    // Requests for MCP tools
    this.app.post('/mcp/request', async (req, res) => {
      try {
        const request: MCPRequest = req.body;
        const response: MCPResponse =
          await this.mcpServer.handleRequest(request);
        res.json(response);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: (error as Error).message,
        });
      }
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', ws => {
      console.log('New WebSocket connection established');

      ws.on('message', async data => {
        try {
          const request: MCPRequest = JSON.parse(data.toString());
          const response: MCPResponse =
            await this.mcpServer.handleRequest(request);
          ws.send(JSON.stringify(response));
        } catch (error) {
          const errorResponse: MCPResponse = {
            id: 'error',
            error: {
              code: 500,
              message: (error as Error).message,
            },
          };
          ws.send(JSON.stringify(errorResponse));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
  }

  start(): void {
    this.server.listen(this.port, this.host, () => {
      console.log(`🚀 MCP Server running at http://${this.host}:${this.port}`);
      console.log(
        `📡 WebSocket server running at ws://${this.host}:${this.port}`
      );
      console.log(`🔧 Available endpoints:`);
      console.log(`   - Health: http://${this.host}:${this.port}/health`);
      console.log(`   - Tools: http://${this.host}:${this.port}/tools`);
      console.log(
        `   - Weather API: http://${this.host}:${this.port}/api/weather`
      );
      console.log(
        `   - MCP Request: http://${this.host}:${this.port}/mcp/request`
      );
    });
  }

  stop(): void {
    this.wss.close();
    this.server.close();
  }
}
