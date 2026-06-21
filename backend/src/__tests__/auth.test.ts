import request from 'supertest';
import app from '../app';
import { User } from '../models/User';

// Mock the User model to prevent database calls during unit tests
jest.mock('../models/User');

describe('Express API & Auth Router Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return status 200 and state UP', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'UP');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 Bad Request if email or password parameters are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@ecowise.ai' }); // missing password

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password are required fields.');
    });

    it('should return 401 Unauthorized if user email does not exist in database', async () => {
      // Mock User.findOne to resolve to null (user not found)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@ecowise.ai', password: 'somepassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password credentials.');
    });

    it('should return 401 Unauthorized if password does not match database record', async () => {
      // Mock a mock user instance with comparePassword returning false
      const mockUser = {
        email: 'user@ecowise.ai',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@ecowise.ai', password: 'incorrectpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password credentials.');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('incorrectpassword');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 Bad Request if required registration params are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Eco Warrior' }); // missing email/password

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name, email, and password are required fields.');
    });

    it('should return 400 Bad Request if the account email already exists', async () => {
      // Mock User.findOne to return an existing user record
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@ecowise.ai' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Eco Warrior', email: 'existing@ecowise.ai', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('An account with this email address already exists.');
    });
  });
});
