import sinon from 'sinon';
import { expect } from 'chai';
import userController from '../rest/controllers/userController.js';
import userService from '../src/services/userService.js';

describe('User Controller Tests', () => {
  it('should call registerUser with correct parameters', () => {
    const req = { body: { name: 'John Doe', email: 'john@example.com', password: '123456' } };
    const res = { status: sinon.stub().returns({ json: sinon.stub() }) };

    const registerUserStub = sinon.stub(userService, 'registerUser').returns({ name: 'John Doe', email: 'john@example.com' });

    userController.register(req, res);

    expect(registerUserStub.calledOnce).to.be.true;
    expect(registerUserStub.calledWith('John Doe', 'john@example.com', '123456')).to.be.true;

    registerUserStub.restore();
  });
});