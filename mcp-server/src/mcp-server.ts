import { MCPTool, MCPRequest, MCPResponse, PublicApiResponse } from './types';

export class MCPServer {
  private tools: Map<string, MCPTool> = new Map();

  constructor() {
    this.initializeDefaultTools();
  }

  private initializeDefaultTools(): void {
    // Tool for getting weather data from a public API
    this.registerTool({
      name: 'get_weather',
      description: 'Get current weather information for a city',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name to get weather for' },
          country: { type: 'string', description: 'Country code (optional)' },
        },
        required: ['city'],
      },
      handler: async (params: any) => {
        try {
          const response = await this.getWeatherData(
            params.city,
            params.country
          );
          return { weather: response, success: true };
        } catch (error) {
          return { error: (error as Error).message, success: false };
        }
      },
    });

    // Tool for getting random user data from a public API
    this.registerTool({
      name: 'get_random_user',
      description: 'Get random user information from a public API',
      inputSchema: {
        type: 'object',
        properties: {
          count: {
            type: 'number',
            description: 'Number of users to fetch (1-10)',
          },
        },
        required: [],
      },
      handler: async (params: any) => {
        try {
          const count = Math.min(Math.max(params.count || 1, 1), 10);
          const response = await this.getRandomUserData(count);
          return { users: response, success: true };
        } catch (error) {
          return { error: (error as Error).message, success: false };
        }
      },
    });

    // Tool for getting current time in different timezones
    this.registerTool({
      name: 'get_time',
      description: 'Get current time in specified timezone or UTC',
      inputSchema: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'Timezone (e.g., UTC, America/New_York)',
          },
        },
        required: [],
      },
      handler: async (params: any) => {
        try {
          const timezone = params.timezone || 'UTC';
          const response = await this.getTimeData(timezone);
          return { time: response, success: true };
        } catch (error) {
          return { error: (error as Error).message, success: false };
        }
      },
    });

    // Tool for listing available tools
    this.registerTool({
      name: 'list_tools',
      description: 'List all available MCP tools',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => {
        const toolList = Array.from(this.tools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        }));
        return { tools: toolList, count: toolList.length };
      },
    });

    // Tool for getting server status
    this.registerTool({
      name: 'server_status',
      description: 'Get MCP server status and health',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => {
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          toolsCount: this.tools.size,
          claudeStatus: 'connected',
        };
      },
    });
  }

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const tool = this.tools.get(request.method);

      if (!tool) {
        return {
          id: request.id,
          error: {
            code: 404,
            message: `Tool '${request.method}' not found`,
          },
        };
      }

      const result = await tool.handler(request.params);

      return {
        id: request.id,
        result,
      };
    } catch (error) {
      return {
        id: request.id,
        error: {
          code: 500,
          message: (error as Error).message || 'Internal server error',
        },
      };
    }
  }

  getAvailableTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }
    return await tool.handler(params);
  }

  // Public API methods that the MCP tools can use
  private async getWeatherData(
    city: string,
    country?: string
  ): Promise<PublicApiResponse> {
    try {
      // Using OpenWeatherMap API (free tier)
      const apiKey = 'demo'; // This is a demo key for testing
      const countryCode = country || '';
      const cityName = encodeURIComponent(city);

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}${
        countryCode ? ',' + countryCode : ''
      }&appid=${apiKey}&units=metric`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = (await response.json()) as any;

      return {
        data: {
          city: data.name,
          country: data.sys.country,
          temperature: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        },
        timestamp: new Date().toISOString(),
        source: 'OpenWeatherMap API',
      };
    } catch (error) {
      // Fallback to mock data if API fails
      return {
        data: {
          city: city,
          country: country || 'Unknown',
          temperature: Math.floor(Math.random() * 30) + 10,
          description: 'Partly cloudy',
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 20) + 5,
        },
        timestamp: new Date().toISOString(),
        source: 'Mock Data (API unavailable)',
      };
    }
  }

  private async getRandomUserData(count: number): Promise<PublicApiResponse> {
    try {
      // Using RandomUser.me API (free, no key required)
      const url = `https://randomuser.me/api/?results=${count}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Random User API error: ${response.status}`);
      }

      const data = (await response.json()) as any;

      return {
        data: data.results.map((user: any) => ({
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          location: `${user.location.city}, ${user.location.country}`,
          picture: user.picture.medium,
        })),
        timestamp: new Date().toISOString(),
        source: 'RandomUser.me API',
      };
    } catch (error) {
      // Fallback to mock data if API fails
      const mockUsers = [];
      for (let i = 0; i < count; i++) {
        mockUsers.push({
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          location: 'Unknown',
          picture: null,
        });
      }

      return {
        data: mockUsers,
        timestamp: new Date().toISOString(),
        source: 'Mock Data (API unavailable)',
      };
    }
  }

  private async getTimeData(timezone: string): Promise<PublicApiResponse> {
    try {
      // Using WorldTimeAPI (free, no key required)
      const url = `https://worldtimeapi.org/api/timezone/${timezone}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Time API error: ${response.status}`);
      }

      const data = (await response.json()) as any;

      return {
        data: {
          timezone: data.timezone,
          datetime: data.datetime,
          date: data.date,
          time: data.time,
          dayOfWeek: data.day_of_week,
          utcOffset: data.utc_offset,
        },
        timestamp: new Date().toISOString(),
        source: 'WorldTimeAPI',
      };
    } catch (error) {
      // Fallback to current time if API fails
      const now = new Date();
      return {
        data: {
          timezone: timezone,
          datetime: now.toISOString(),
          date: now.toDateString(),
          time: now.toTimeString(),
          dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
          utcOffset: now.getTimezoneOffset(),
        },
        timestamp: new Date().toISOString(),
        source: 'Local System Time (API unavailable)',
      };
    }
  }
}
