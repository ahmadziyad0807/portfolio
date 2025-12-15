import request from 'supertest';
import app from './server';

describe('Server', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Chat API', () => {
    it('should create a session and send a message', async () => {
      // First create a session
      const sessionResponse = await request(app)
        .post('/api/chat/sessions')
        .send({})
        .expect(201);

      expect(sessionResponse.body).toHaveProperty('success', true);
      expect(sessionResponse.body.data).toHaveProperty('sessionId');
      
      const sessionId = sessionResponse.body.data.sessionId;

      // Then send a message
      const messageResponse = await request(app)
        .post('/api/chat/message')
        .send({ 
          sessionId: sessionId,
          message: 'Hello' 
        })
        .expect(200);

      expect(messageResponse.body).toHaveProperty('success', true);
      expect(messageResponse.body.data).toHaveProperty('message');
      expect(messageResponse.body.data.message).toHaveProperty('content');
      expect(messageResponse.body.data.message.type).toBe('assistant');
    });

    it('should reject empty messages', async () => {
      // First create a session
      const sessionResponse = await request(app)
        .post('/api/chat/sessions')
        .send({})
        .expect(201);
      
      const sessionId = sessionResponse.body.data.sessionId;

      // Try to send empty message
      const messageResponse = await request(app)
        .post('/api/chat/message')
        .send({ 
          sessionId: sessionId,
          message: '' 
        })
        .expect(400);

      expect(messageResponse.body).toHaveProperty('success', false);
      expect(messageResponse.body).toHaveProperty('error');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});