import { router, GET, POST, PUT, DELETE } from '@forgedevstack/harbor';
import { UserController } from '../controllers';

// Create user routes - no express import needed!
export const userRoutes = router('/api/users', [
  // GET /api/users - List all users
  GET('/', UserController.getAll),
  
  // GET /api/users/:id - Get user by ID
  GET('/:id', UserController.getById),
  
  // POST /api/users - Create new user
  POST('/', UserController.create, {
    validation: {
      body: {
        email: { type: 'email', required: true },
        name: { type: 'string', required: true, min: 2, max: 100 },
        password: { type: 'string', required: true, min: 8 },
      },
    },
  }),
  
  // PUT /api/users/:id - Update user
  PUT('/:id', UserController.update),
  
  // DELETE /api/users/:id - Delete user
  DELETE('/:id', UserController.delete),
]);
