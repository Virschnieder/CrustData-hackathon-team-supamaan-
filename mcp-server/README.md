Check package.json for run commands (written in ts)

## Adding Custom Tools

You can easily extend the server with custom tools:

```typescript
import { MCPTool } from './types';

const customTool: MCPTool = {
  name: 'my_custom_tool',
  description: 'Description of what this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define your input parameters
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Implement your tool logic here
    return { result: 'success' };
  }
};

// Register the tool
mcpServer.registerTool(customTool);
```
