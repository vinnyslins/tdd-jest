const request = require('supertest');

const app = require('../../src/app');
const truncate = require('../utils/truncate');
const factory = require('../factories');

describe('Authentication', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should authenticate with valid credentials', async () => {
    const user = await factory.create('User', {
      password: '123'
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123'
      });

    expect(response.status).toBe(200);
  });

  it('should not authenticate with invalid credentials', async () => {
    const user = await factory.create('User', {
      password: '123'
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '321'
      });

    expect(response.status).toBe(401);
  });

  it('should return JWT when authenticated', async () => {
    const user = await factory.create('User', {
      password: '123'
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123'
      });

    expect(response.body).toHaveProperty('token');
  });

  it('should be able to access private routes when authenticated', async () => {
    const user = await factory.create('User', {
      password: '123'
    });

    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Baerer ${user.generateToken()}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to access private routes whitout JWT token', async () => {
    const response = await request(app)
      .get('/dashboard')

    expect(response.status).toBe(401);
  });

  it('should not be able to access private routes with invalid JWT token', async () => {
    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', 'Bearer 123');

    expect(response.status).toBe(401);
  });
});
