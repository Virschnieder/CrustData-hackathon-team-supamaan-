import dotenv from 'dotenv';
import { MCPServer } from './mcp-server';
import { HTTPServer } from './http-server';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Get configuration from environment variables
    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || 'localhost';

    console.log('🚀 Starting MCP Server...');
    console.log(`📡 Port: ${port}`);
    console.log(`🌐 Host: ${host}`);

    // Initialize MCP Server
    const mcpServer = new MCPServer();
    console.log('✅ MCP Server initialized');

    // Initialize HTTP Server
    const httpServer = new HTTPServer(mcpServer, port, host);
    console.log('✅ HTTP Server initialized');

    // Start the server
    httpServer.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down MCP Server...');
      httpServer.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down MCP Server...');
      httpServer.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start MCP Server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main();
