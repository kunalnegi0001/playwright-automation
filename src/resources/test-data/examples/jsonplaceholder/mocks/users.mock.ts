import { http, HttpResponse } from 'msw';

/**
 * Mock handlers for user-related API endpoints
 * Used for MSW (Mock Service Worker) integration
 */

const baseUrl = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

export const userHandlers = [
  // GET /api/users - Get all users
  http.get(`${baseUrl}/users`, ({ request: _request }) => {
    const users = [
      {
        id: 'user-001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
      },
      {
        id: 'user-002',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        status: 'active',
      },
    ];
    return HttpResponse.json({
      users,
      total: 2,
    });
  }),

  // GET /api/users/:id - Get user by ID
  http.get(`${baseUrl}/users/:id`, ({ params }) => {
    const { id } = params;
    const users = [
      {
        id: 'user-001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
      },
    ];

    const user = users.find(u => u.id === id);
    if (user) {
      return HttpResponse.json(user);
    }

    return HttpResponse.json({ error: 'User not found' }, { status: 404 });
  }),

  // POST /api/users - Create new user
  http.post(`${baseUrl}/users`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      {
        id: 'user-new',
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /api/users/:id - Update user
  http.put(`${baseUrl}/users/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE /api/users/:id - Delete user
  http.delete(`${baseUrl}/users/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({ message: 'User deleted successfully', id }, { status: 200 });
  }),
];
