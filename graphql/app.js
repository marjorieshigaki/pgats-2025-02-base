import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';

import userService from '../src/services/userService.js';

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const auth = req.headers.authorization || '';
    let userData = null;
    if (auth.startsWith('Bearer ')) {
      const token = auth.replace('Bearer ', '');
      userData = userService.verifyToken(token);
    }
    return { userData };
  }
});

async function startApollo() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

startApollo();

export default app;
