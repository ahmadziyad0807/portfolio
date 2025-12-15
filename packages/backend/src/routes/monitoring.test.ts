import request from 'supertest';
import app from '../server';

describe('Monitoring API', () => {
  describe('GET /api/monitoring/health', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/monitoring/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'healthy');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('sessions');
      expect(response.body.data).toHaveProperty('memory');
      expect(response.body.data).toHaveProperty('cpu');
    });
  });

  describe('GET /api/monitoring/metrics', () => {
    it('should return system metrics', async () => {
      const response = await request(app)
        .get('/api/monitoring/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('sessions');
      expect(response.body.data).toHaveProperty('system');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/monitoring/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/monitoring/ready')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'ready');
    });
  });

  describe('POST /api/monitoring/cleanup', () => {
    it('should cleanup expired sessions', async () => {
      const response = await request(app)
        .post('/api/monitoring/cleanup')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('cleanedCount');
    });
  });
});