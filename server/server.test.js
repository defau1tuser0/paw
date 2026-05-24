import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './server.js';

describe('Cases API', () => {
  it('GET /api/cases should return status 200 and seeded cases list', async () => {
    const res = await request(app).get('/api/cases');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('title');
  });

  it('POST /api/cases should create a new case and return 201', async () => {
    const newCase = {
      title: "Stray kitten with injured tail",
      description: "Found a small kitten with a bloodied tail near the supermarket dumpster.",
      photoUrl: "https://example.com/kitten.jpg",
      latitude: 37.7749,
      longitude: -122.4194,
      locationName: "Supermarket Dumpster Area",
      reporterId: "user-1"
    };

    const res = await request(app)
      .post('/api/cases')
      .send(newCase);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(newCase.title);
    expect(res.body.status).toBe('open');
    expect(res.body.assignedTo).toBeNull();
  });

  it('GET /api/cases/:id should return 200 for a valid ID', async () => {
    const res = await request(app).get('/api/cases/case-1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('case-1');
  });

  it('GET /api/cases/:id should return 404 for an invalid ID', async () => {
    const res = await request(app).get('/api/cases/nonexistent');
    expect(res.status).toBe(404);
  });

  it('PUT /api/cases/:id should update status and assignee', async () => {
    const updateData = { status: 'in_progress', assignedTo: 'user-2' };
    const res = await request(app)
      .put('/api/cases/case-1')
      .send(updateData);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
    expect(res.body.assignedTo).toBe('user-2');
  });

  it('GET /api/cases/:id/comments should return comments list', async () => {
    const res = await request(app).get('/api/cases/case-2/comments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/cases/:id/comments should add a comment', async () => {
    const newComment = { userId: 'user-1', text: 'I am nearby, will help too.' };
    const res = await request(app)
      .post('/api/cases/case-2/comments')
      .send(newComment);
    expect(res.status).toBe(201);
    expect(res.body.text).toBe(newComment.text);
    expect(res.body.caseId).toBe('case-2');
  });

  it('GET /api/messages should return chat messages between two users', async () => {
    const res = await request(app).get('/api/messages?user1Id=user-1&user2Id=user-4');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/messages should send a direct message', async () => {
    const newMsg = { senderId: 'user-1', receiverId: 'user-4', text: 'Hey John, check the map.' };
    const res = await request(app)
      .post('/api/messages')
      .send(newMsg);
    expect(res.status).toBe(201);
    expect(res.body.text).toBe(newMsg.text);
  });
});
