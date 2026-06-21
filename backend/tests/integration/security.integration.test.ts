import '../setup';
import request from 'supertest';
import app from '../../src/app';

describe('Security & Cookie Auth Integration Tests', () => {
  const registerPayload = {
    name: 'Security Test User',
    email: 'security.test@example.com',
    password: 'securePassword123!',
    role: 'traveler',
  };

  describe('Cookie-Based Authentication', () => {
    it('sets accessToken cookie on register/login and logs out clearing the cookie', async () => {
      // 1. REGISTER
      const regRes = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(regRes.status).toBe(201);
      
      const regCookies = regRes.headers['set-cookie'];
      expect(regCookies).toBeDefined();
      expect(regCookies[0]).toContain('accessToken=');
      expect(regCookies[0]).toContain('HttpOnly');

      // 2. LOGIN
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      expect(loginRes.status).toBe(200);
      const loginCookies = loginRes.headers['set-cookie'];
      expect(loginCookies).toBeDefined();
      expect(loginCookies[0]).toContain('accessToken=');

      // Extract the cookie value
      const cookieHeader = loginCookies[0].split(';')[0]; // accessToken=ey...

      // 3. GET PROFILE via Cookie
      const getRes = await request(app)
        .get('/api/users/me')
        .set('Cookie', [cookieHeader]);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.user.email).toBe(registerPayload.email);

      // 4. LOGOUT
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [cookieHeader])
        .send();

      expect(logoutRes.status).toBe(200);
      const logoutCookies = logoutRes.headers['set-cookie'] as any;
      expect(logoutCookies).toBeDefined();
      
      const hasClearedAccessToken = logoutCookies.some((cookie: string) => 
        cookie.includes('accessToken=') && (cookie.includes('Max-Age=0') || cookie.includes('expires=') || cookie.includes('accessToken=;'))
      );
      expect(hasClearedAccessToken).toBe(true);
    });
  });
});
