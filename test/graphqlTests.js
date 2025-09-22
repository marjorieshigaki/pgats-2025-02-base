import { expect } from 'chai';
import { ApolloServer } from 'apollo-server';
import typeDefs from '../graphql/schema.js';
import resolvers from '../graphql/resolvers.js';

describe('GraphQL API Tests', () => {
  let server;

  before(() => {
    server = new ApolloServer({ typeDefs, resolvers });
  });

  it('should fetch all users', async () => {
    const query = `{
      users {
        name
        email
      }
    }`;

    const res = await server.executeOperation({ query }, {
      context: { req: { headers: { authorization: '' } } }
    });
    expect(res.errors).to.be.undefined;
    expect(res.data.users).to.be.an('array');
  });

  it('should return error for invalid query', async () => {
    const query = `{
      invalidField
    }`;

    const res = await server.executeOperation({ query });
    expect(res.errors).to.not.be.undefined;
  });
});