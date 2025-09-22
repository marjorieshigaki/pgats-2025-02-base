import request from 'supertest';
import { expect } from 'chai';
import app from '../rest/app.js';
import jwt from 'jsonwebtoken';

const SECRET = 'supersecret';
const validToken = jwt.sign({ id: 1, email: 'test@example.com' }, SECRET, { expiresIn: '1h' });

describe('Checkout API Tests', () => {
  it('should return status 200 for valid checkout', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ items: [{ productId: 1, quantity: 2 }], freight: 10, paymentMethod: 'credit_card', cardData: { number: '1234-5678-9012-3456', expiry: '12/25', cvv: '123' } });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('valorFinal');
    expect(res.body).to.have.property('userId', 1);
  });

  it('should return status 400 for invalid checkout', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });
});