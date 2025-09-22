import request from 'supertest';
import { expect } from 'chai';
import app from '../rest/app.js';

describe('External API Tests', () => {
  it('should return status 200 for GET /api/users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('should return status 404 for invalid route', async () => {
    const res = await request(app).get('/invalidRoute');
    expect(res.status).to.equal(404);
  });
});