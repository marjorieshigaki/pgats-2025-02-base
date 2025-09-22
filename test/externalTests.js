const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../rest/app'); 

// Teste 1: Verificar se a API retorna status 200
describe('External API Tests', () => {
  it('should return status 200 for GET /users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  // Teste 2: Verificar se a API retorna erro para rota inexistente
  it('should return status 404 for invalid route', async () => {
    const res = await request(app).get('/invalidRoute');
    expect(res.status).to.equal(404);
  });
});