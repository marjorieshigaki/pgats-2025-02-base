import users from '../src/models/user.js';
import userService from '../src/services/userService.js';
import checkoutService from '../src/services/checkoutService.js';

const resolvers = {
  Query: {
    users: () => {
      try {
        const result = users.map(({ name, email }) => ({ name, email }));
        return result;
      } catch (error) {
        throw new Error('Erro ao buscar usuários');
      }
    }
  },
  Mutation: {
    register: (_, { name, email, password }) => {
      const user = userService.registerUser(name, email, password);
      if (!user) throw new Error('Email já cadastrado');
      return user;
    },
    login: (_, { email, password }) => {
      const result = userService.authenticate(email, password);
      if (!result) throw new Error('Credenciais inválidas');
      return result;
    },
    checkout: (_, { items, freight, paymentMethod, cardData }, context) => {
      const { userData } = context;
      if (!userData) throw new Error('Token inválido');
      const result = checkoutService.checkout(userData.id, items, freight, paymentMethod, cardData);
      return { ...result, valorFinal: result.total };
    }
  }
};

export default resolvers;
