# IntelGenAI

A modern, intelligent generation AI system built with open source LLMs, featuring text and voice interactions for seamless website integration.

## 🚀 Features

- **Text & Voice Interactions**: Support for both text input and voice commands using Web Speech API
- **Open Source LLMs**: Uses Ollama with Mistral 7B model for cost-effective inference
- **Easy Integration**: Embeddable React widget for any website
- **Cost-Effective Deployment**: Designed for free-tier and low-cost hosting options
- **Comprehensive Testing**: Unit tests and property-based testing with fast-check
- **Production Ready**: Docker containerization with development and production configurations

## 🏗️ Architecture

This is a monorepo containing three main packages:

- **`packages/frontend`**: React-based chat widget with voice interface
- **`packages/backend`**: Node.js/Express API server with LLM integration
- **`packages/shared`**: Shared TypeScript types and utilities

### Tech Stack

- **Frontend**: React 18, TypeScript, Styled Components, Web Speech API
- **Backend**: Node.js, Express, TypeScript, Winston logging
- **LLM**: Ollama with Mistral 7B model
- **Database**: Redis for session storage and caching
- **Testing**: Jest, React Testing Library, fast-check (property-based testing)
- **Containerization**: Docker & Docker Compose
- **Linting**: ESLint with TypeScript support

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intelligenai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   npm run setup
   ```
   This will:
   - Start Docker services (Redis, Ollama)
   - Download the Mistral 7B model
   - Start frontend and backend in development mode

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health
   - Ollama API: http://localhost:11434

### Manual Development Setup

If you prefer to start services individually:

```bash
# Start Docker services
npm run docker:up

# Setup Ollama model (Windows)
scripts\setup-ollama.bat

# Setup Ollama model (Linux/Mac)
bash scripts/setup-ollama.sh

# Start development servers
npm run dev
```

## 📝 Available Scripts

### Root Level Scripts

- `npm run build` - Build all packages
- `npm run dev` - Start frontend and backend in development mode
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:pbt` - Run property-based tests only
- `npm run lint` - Lint all packages
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run setup` - Complete development setup

### Package-Specific Scripts

Each package has its own scripts accessible via workspaces:

```bash
# Backend
npm run dev --workspace=packages/backend
npm run test --workspace=packages/backend

# Frontend  
npm run dev --workspace=packages/frontend
npm run test --workspace=packages/frontend

# Shared
npm run build --workspace=packages/shared
npm run test --workspace=packages/shared
```

## 🧪 Testing

The project uses a comprehensive testing strategy:

### Unit Testing
- **Backend**: Jest with Supertest for API testing
- **Frontend**: React Testing Library for component testing
- **Shared**: Jest for utility function testing

### Property-Based Testing
- Uses `fast-check` library for property-based testing
- Minimum 100 iterations per property test
- Tests universal properties across all valid inputs

### Running Tests

```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# Property-based tests only
npm run test:pbt

# Watch mode (for individual packages)
npm run test --workspace=packages/frontend -- --watch
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Services

- **Redis**: Session storage and caching (port 6379)
- **Ollama**: LLM inference service (port 11434)
- **Backend**: API server (port 3001)
- **Frontend**: React application (port 3000/80)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:7b
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
LOG_LEVEL=info
```

#### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_WEBSOCKET_URL=ws://localhost:3001
REACT_APP_ENVIRONMENT=development
```

## 🚀 Deployment Options

### Option 1: Free Tier
- **Frontend**: Vercel/Netlify static hosting
- **Backend**: Railway/Render free tier
- **LLM**: Ollama on free tier VPS
- **Database**: Redis Cloud free tier

### Option 2: Low-Cost ($6/month)
- **All-in-one**: DigitalOcean Droplet
- **Container orchestration**: Docker Compose
- **Load balancing**: Nginx reverse proxy

### Option 3: Scalable Cloud
- **Frontend**: CDN distribution (Cloudflare)
- **Backend**: Container service (Google Cloud Run)
- **LLM**: Dedicated compute instance with GPU
- **Database**: Managed Redis/PostgreSQL

## 📚 Project Structure

```
intelligenai/
├── packages/
│   ├── backend/          # Express.js API server
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   └── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── frontend/         # React chat widget
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   └── components/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── shared/           # Shared types and utilities
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       └── package.json
├── scripts/              # Setup and deployment scripts
├── docker-compose.yml    # Development environment
├── docker-compose.prod.yml # Production environment
└── package.json          # Monorepo configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Docker services not starting**
   ```bash
   docker-compose down
   docker system prune -f
   docker-compose up -d
   ```

2. **Ollama model not downloading**
   - Check internet connection
   - Ensure Docker has sufficient disk space
   - Try pulling manually: `docker exec intelligen-ollama ollama pull mistral:7b`

3. **Port conflicts**
   - Check if ports 3000, 3001, 6379, or 11434 are in use
   - Modify port mappings in docker-compose.yml if needed

4. **Tests failing**
   - Ensure all dependencies are installed: `npm install`
   - Clear Jest cache: `npm run test -- --clearCache`

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](https://your-docs-url.com)
- Join our [Discord Community](https://discord.gg/your-invite)