import { Router } from 'express';
import { userRoutes } from './user.routes';

export const routes = Router();

// Register all route modules
routes.use('/users', userRoutes);

// Add more routes here:
// routes.use('/products', productRoutes);
// routes.use('/orders', orderRoutes);

