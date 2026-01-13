import { Router } from 'express';
import { GET, POST, PUT, DELETE } from 'harbor';
import { UserController } from '../controllers';

export const userRoutes = Router();

// GET /api/users - Get all users
userRoutes.get('/', GET(UserController.getAll));

// GET /api/users/:id - Get user by ID
userRoutes.get('/:id', GET(UserController.getById));

// POST /api/users - Create new user
userRoutes.post('/', POST(UserController.create));

// PUT /api/users/:id - Update user
userRoutes.put('/:id', PUT(UserController.update));

// DELETE /api/users/:id - Delete user
userRoutes.delete('/:id', DELETE(UserController.delete));

