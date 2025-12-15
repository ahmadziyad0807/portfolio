# Backend API Documentation

## Overview

The LLM Chatbot backend provides RESTful API endpoints for managing chat sessions, processing messages, and monitoring system health.

## Base URL

- Development: `http://localhost:3001`
- Production: TBD

## Authentication

Currently, no authentication is required. Session management is handled via session IDs.

## API Endpoints

### Chat Operations

#### Create Session
```
POST /api/chat/sessions
```

**Request Body:**
```json
{
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-v4",
    "configuration": {
      "maxMessages": 50,
      "responseTimeout": 5000,
      "voiceEnabled": false,
      "language": "en"
    }
  },
  "timestamp": "2025-12-12T21:57:09.825Z"
}
```

#### Send Message
```
POST /api/chat/message
```

**Request Body:**
```json
{
  "sessionId": "uuid-v4",
  "message": "Hello, how can you help me?",
  "context": {
    "currentIntent": "greeting"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid-v4",
      "sessionId": "uuid-v4",
      "content": "Hello! I'm here to help...",
      "type": "assistant",
      "timestamp": "2025-12-12T21:57:09.825Z",
      "metadata": {
        "processingTime": 150,
        "confidence": 0.95,
        "intent": "greeting"
      }
    },
    "suggestions": ["Tell me more", "How can I help?"],
    "metadata": {
      "processingTime": 150,
      "modelUsed": "placeholder",
      "confidence": 0.95,
      "intent": "greeting"
    }
  },
  "timestamp": "2025-12-12T21:57:09.825Z"
}
```

#### Get Session Info
```
GET /api/chat/sessions/{sessionId}
```

#### Get Conversation History
```
GET /api/chat/sessions/{sessionId}/history?limit=10
```

#### Clear Conversation
```
POST /api/chat/sessions/{sessionId}/clear
```

#### Delete Session
```
DELETE /api/chat/sessions/{sessionId}
```

### Monitoring

#### Health Check
```
GET /health
```

Basic health check endpoint.

#### Detailed Health Check
```
GET /api/monitoring/health
```

Returns detailed system health information including memory usage, CPU stats, and session statistics.

#### System Metrics
```
GET /api/monitoring/metrics
```

Returns comprehensive system metrics and performs cleanup of expired sessions.

#### Readiness Check
```
GET /api/monitoring/ready
```

Kubernetes-style readiness probe.

#### Manual Cleanup
```
POST /api/monitoring/cleanup
```

Manually trigger cleanup of expired sessions.

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2025-12-12T21:57:09.825Z"
}
```

## Rate Limiting

- 100 requests per 15-minute window per IP address
- Rate limit headers included in responses

## Security Features

- CORS enabled for frontend origins
- Helmet.js security headers
- Request size limits (10MB)
- Input validation and sanitization

## Session Management

- Sessions expire after 24 hours of inactivity
- Automatic cleanup of expired sessions
- In-memory storage (will be replaced with Redis in production)
- Maximum 50 messages per session (configurable)