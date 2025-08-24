# Natural Language to Crustdata API

A full-stack application that converts natural language investment/search criteria into Crustdata API calls and displays results in an interactive dashboard.

## Features

- **Natural Language Processing**: Convert plain English queries into structured API calls
- **Multiple API Endpoints**: Supports Crustdata's screener, company search, enrichment, and people search APIs
- **Interactive Dashboard**: View results in a clean, responsive interface
- **cURL Generation**: Get copyable cURL commands for all API calls
- **People Matching**: Find key decision makers at discovered companies
- **Local Storage**: Persist queries and results between sessions

## Tech Stack

### Backend
- Node.js 20+ with TypeScript
- Express.js with CORS
- Axios for HTTP requests
- Zod for validation
- dotenv for environment management

### Frontend
- React 18 with TypeScript
- Vite for development and building
- TailwindCSS for styling
- Axios for API calls

## Quick Start

### Prerequisites
- Node.js 20+
- Crustdata API key

### Setup

1. **Clone and navigate to the project:**
```bash
cd vc-proj/nl-to-crustdata-curl
```

2. **Install backend dependencies:**
```bash
cd server
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your CRUSTDATA_API_KEY
```

4. **Install frontend dependencies:**
```bash
cd ../web
npm install
```

### Running the Application

1. **Start the backend server:**
```bash
cd server
npm run dev
```
Server runs on http://localhost:4000

2. **Start the frontend (in a new terminal):**
```bash
cd web
npm run dev
```
Frontend runs on http://localhost:5173

3. **Open your browser and navigate to http://localhost:5173**

## Usage

### Example Queries

Try these natural language queries:

- **"AI infra startups in India, 11–200 employees, founded after 2019, seed to Series A, headcount growth last 6 months > 10%. Limit 25."**
- **"European fintechs 1000–5000 HC, founded before 2016, show fast headcount growth; top 50."**
- **"US cybersecurity companies 200+ employees, Series B–D."**

### Supported Filters

- **Industries**: AI, fintech, cybersecurity, healthtech, devtools, infrastructure, SaaS, ecommerce, edtech
- **Countries**: USA, India, UK, Germany, Singapore, Canada, France, Australia
- **Headcount**: Ranges like "11-200", "1k-5k", "100+"
- **Funding Stages**: Seed, Series A-E
- **Founded Dates**: "founded after 2019", "before 2016"
- **Growth**: "headcount growth > 10%", "hiring spree"
- **Limits**: "top 25", "limit 50"

### API Endpoints

- **POST /api/parse**: Parse natural language and generate cURL commands
- **POST /api/run**: Execute full search pipeline with enrichment and people matching

## Project Structure

```
nl-to-crustdata-curl/
├── server/                 # Backend API
│   ├── src/
│   │   ├── index.ts       # Express server setup
│   │   ├── routes.ts      # API endpoints
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── parser.ts      # Natural language parser
│   │   ├── payloadBuilder.ts  # API payload builders
│   │   ├── curlBuilder.ts     # cURL string generators
│   │   └── crustdataClient.ts # Crustdata API client
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── web/                   # Frontend React app
    ├── src/
    │   ├── components/
    │   │   ├── PromptForm.tsx    # Input form
    │   │   ├── CurlBlock.tsx     # cURL display
    │   │   └── ResultsTable.tsx  # Results display
    │   ├── App.tsx
    │   ├── api.ts         # API client
    │   ├── types.ts       # TypeScript interfaces
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## Development

### Backend Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Run production build

### Frontend Scripts
- `npm run dev`: Start Vite development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## API Integration

The application integrates with these Crustdata endpoints:

1. **POST /screener/screen/**: Deep company screening with many filter options
2. **POST /screener/company/search**: Limited real-time company search
3. **GET /screener/company**: Company enrichment with specific fields
4. **POST /screener/person/search**: People search with employer filtering

## Error Handling

- Graceful API failures with user-friendly error messages
- Best-effort approach: continues pipeline even if some steps fail
- Validation of user inputs and API responses

## Security

- API key stored in environment variables
- CORS configured for localhost development
- Input validation with Zod schemas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
