import '../setup';
import request from 'supertest';
import app from '../../src/app';
import Destination from '../../src/models/Destination';
import GuideProfile from '../../src/models/GuideProfile';
import User from '../../src/models/User';
import Trip from '../../src/models/Trip';

describe('Guide Workspace & Booking Request Integration Tests', () => {
  it('runs the full guide workspace E2E flow', async () => {
    let travelerCookie: string;
    let guideCookie: string;
    let adminCookie: string;
    let destinationId: string;
    let tripId: string;
    let guideProfileId: string;
    let guideRequestId: string;

    // 1. Seed standard approved destination
    const dest = await Destination.create({
      name: 'Shimla',
      country: 'India',
      state: 'Himachal Pradesh',
      description: 'Lush green valleys and dynamic trekking spots.',
      bestTimeToVisit: 'March to June',
      budgetRange: '₹3,000 – ₹10,000 per day',
      activities: ['Trekking', 'Shopping'],
      featured: false,
      status: 'approved',
    });
    destinationId = dest._id.toString();

    // 2. Register Admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Workspace Admin',
        email: 'admin.work@example.com',
        password: 'securePassword123!',
        role: 'traveler',
      });
    adminCookie = adminRes.headers['set-cookie'][0].split(';')[0];
    
    // Upgrade admin user directly in database
    await User.findOneAndUpdate({ email: 'admin.work@example.com' }, { role: 'admin' });

    // 3. Register Traveler
    const travelerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Workspace Traveler',
        email: 'traveler.work@example.com',
        password: 'securePassword123!',
        role: 'traveler',
      });
    travelerCookie = travelerRes.headers['set-cookie'][0].split(';')[0];

    // 4. Create Traveler Trip
    const tripRes = await request(app)
      .post('/api/trips')
      .set('Cookie', [travelerCookie])
      .send({
        destinationId,
        title: 'My Shimla Adventure',
        tripType: 'solo',
        startDate: new Date('2026-07-10').toISOString(),
        endDate: new Date('2026-07-15').toISOString(),
        budget: 15000,
      });
    tripId = tripRes.body.trip._id;

    // 5. Register future guide (starts as traveler)
    const guideRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Future Guide',
        email: 'guide.work@example.com',
        password: 'securePassword123!',
        role: 'traveler',
      });
    guideCookie = guideRes.headers['set-cookie'][0].split(';')[0];

    // 6. POST /api/guides/become (upgrades traveler to guide)
    const upgradeRes = await request(app)
      .post('/api/guides/become')
      .set('Cookie', [guideCookie])
      .send({
        experience: 6,
        languages: ['English', 'Hindi', 'Punjabi'],
        expertise: ['Adventure', 'Trekking'],
        location: 'Shimla',
        bio: 'Experienced local guide focusing on mountain safety and hidden valley treks.',
      });

    expect(upgradeRes.status).toBe(201);
    expect(upgradeRes.body.success).toBe(true);
    expect(upgradeRes.body.user.role).toBe('guide');
    expect(upgradeRes.body.profile.experience).toBe(6);

    guideCookie = upgradeRes.headers['set-cookie'][0].split(';')[0];
    guideProfileId = upgradeRes.body.profile._id;

    // 7. PUT /api/guides/profile/me
    const updateRes = await request(app)
      .put('/api/guides/profile/me')
      .set('Cookie', [guideCookie])
      .send({
        name: 'Renamed Guide',
        experience: 7,
        location: 'Manali',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.user.name).toBe('Renamed Guide');
    expect(updateRes.body.data.profile.experience).toBe(7);
    expect(updateRes.body.data.profile.location).toBe('Manali');

    // 8. Hidden Places Endpoints
    const createRes = await request(app)
      .post('/api/hidden-places')
      .set('Cookie', [guideCookie])
      .send({
        destinationId,
        title: 'Secret Peak Vista',
        description: 'A gorgeous peak that is not crowded by tourists. Perfect for sunset trekking views.',
        category: 'Viewpoint',
        images: ['https://example.com/peak.jpg'],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.hiddenPlace.title).toBe('Secret Peak Vista');

    const listRes = await request(app)
      .get(`/api/destinations/${destinationId}/hidden-places`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.count).toBe(1);
    expect(listRes.body.hiddenPlaces[0].title).toBe('Secret Peak Vista');

    const myRes = await request(app)
      .get('/api/hidden-places/guide/me')
      .set('Cookie', [guideCookie]);

    expect(myRes.status).toBe(200);
    expect(myRes.body.success).toBe(true);
    expect(myRes.body.count).toBe(1);

    // 9. Experiences Endpoints
    const experienceRes = await request(app)
      .post('/api/experiences')
      .set('Cookie', [guideCookie])
      .send({
        name: 'Sunrise Peak Photography Walk',
        destinationId,
        duration: '4 hours',
        description: 'Guided early morning photography walk to catch the golden hour above the clouds.',
        highlights: ['Scenic sunrise', 'Photography coaching', 'Local tea break'],
      });

    expect(experienceRes.status).toBe(201);
    expect(experienceRes.body.success).toBe(true);
    expect(experienceRes.body.experience.name).toBe('Sunrise Peak Photography Walk');

    const publicRes = await request(app)
      .get(`/api/experiences/guide/${guideProfileId}`);

    expect(publicRes.status).toBe(200);
    expect(publicRes.body.success).toBe(true);
    expect(publicRes.body.count).toBe(1);

    const myExpRes = await request(app)
      .get('/api/experiences/guide/me')
      .set('Cookie', [guideCookie]);

    expect(myExpRes.status).toBe(200);
    expect(myExpRes.body.success).toBe(true);
    expect(myExpRes.body.count).toBe(1);

    // 10. Guide Requests Matching
    const requestRes = await request(app)
      .post('/api/guide-requests')
      .set('Cookie', [travelerCookie])
      .send({
        guideId: guideProfileId,
        tripId,
        message: 'Please guide us on the offbeat sunrise peak photography walk.',
      });

    expect(requestRes.status).toBe(201);
    expect(requestRes.body.success).toBe(true);
    expect(requestRes.body.request.message).toContain('sunrise peak');
    guideRequestId = requestRes.body.request._id;

    const myRequestsRes = await request(app)
      .get('/api/guide-requests/guide/me')
      .set('Cookie', [guideCookie]);

    expect(myRequestsRes.status).toBe(200);
    expect(myRequestsRes.body.success).toBe(true);
    expect(myRequestsRes.body.count).toBe(1);
    expect(myRequestsRes.body.requests[0].message).toContain('sunrise peak');

    const respondRes = await request(app)
      .patch(`/api/guide-requests/${guideRequestId}/respond`)
      .set('Cookie', [guideCookie])
      .send({ status: 'accepted' });

    expect(respondRes.status).toBe(200);
    expect(respondRes.body.success).toBe(true);
    expect(respondRes.body.request.status).toBe('accepted');

    const trip = await Trip.findById(tripId);
    expect(trip?.guideId?.toString()).toBe(guideProfileId);

    // 11. Destination Contributions Flow
    let contributedDestId: string;

    const contribRes = await request(app)
      .post('/api/destinations/guide')
      .set('Cookie', [guideCookie])
      .send({
        name: 'Gulmarg',
        country: 'India',
        state: 'Jammu & Kashmir',
        description: 'A beautiful valley known for skiing and natural cable cars.',
        activities: ['Skiing', 'Scenic Gondola'],
        budgetRange: '₹4,000 – ₹15,000 per day',
      });

    expect(contribRes.status).toBe(201);
    expect(contribRes.body.success).toBe(true);
    expect(contribRes.body.destination.status).toBe('pending');
    contributedDestId = contribRes.body.destination._id;

    const listDestRes = await request(app)
      .get('/api/destinations');

    expect(listDestRes.status).toBe(200);
    const isContributedVisibleBefore = listDestRes.body.destinations.some((d: any) => d.name === 'Gulmarg');
    expect(isContributedVisibleBefore).toBe(false);

    const myContribs = await request(app)
      .get('/api/destinations/guide/me')
      .set('Cookie', [guideCookie]);

    expect(myContribs.status).toBe(200);
    expect(myContribs.body.success).toBe(true);
    expect(myContribs.body.count).toBe(1);
    expect(myContribs.body.destinations[0].name).toBe('Gulmarg');

    const approveRes = await request(app)
      .patch(`/api/destinations/${contributedDestId}/status`)
      .set('Cookie', [adminCookie])
      .send({ status: 'approved' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.destination.status).toBe('approved');

    const listDestResAfter = await request(app)
      .get('/api/destinations');

    expect(listDestResAfter.status).toBe(200);
    const isContributedVisibleAfter = listDestResAfter.body.destinations.some((d: any) => d.name === 'Gulmarg');
    expect(isContributedVisibleAfter).toBe(true);
  });
});
