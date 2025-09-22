const { ApolloServer } = require('apollo-server-express');
const { expect } = require('chai');
const request = require('supertest');
const schema = require('../graphql/schema');
const resolvers = require('../graphql/resolvers');

const app = require('express')();

let server;

before(async () => {
  server = new ApolloServer({ typeDefs: schema, resolvers });
  await server.start();
  server.applyMiddleware({ app });
});

describe('GraphQL API Tests', () => {
  it('should fetch users', async () => {
    const query = '{ users { name email } }';
    const res = await request(app)
      .post('/graphql')
      .send({ query });

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('users');
    expect(res.body.data.users).to.be.an('array');
  });
});