import request from 'supertest';
import app from '../api/server.js';

describe('Auth API Tests', () => {
  const insurerData = { email: 'insurer@example.com', password: 'password123', companyName: 'InsureTech' };
  const doctorData = { email: 'doctor@example.com', password: 'password123', fullName: 'Dr. John Doe', specialty: 'Cardiology' };

  test('Insurer Signup', async () => {
    const response = await request(app).post('/api/insurer/signup').send(insurerData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Signup successful');
  });

  test('Insurer Login', async () => {
    const response = await request(app).post('/api/insurer/login').send({
      email: insurerData.email,
      password: insurerData.password,
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('Doctor Signup', async () => {
    const response = await request(app).post('/api/doctor/signup').send(doctorData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Signup successful');
  });

  test('Doctor Login', async () => {
    const response = await request(app).post('/api/doctor/login').send({
      email: doctorData.email,
      password: doctorData.password,
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});