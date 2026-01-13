import { Request, Response } from 'express';
import { UserService } from '../services';
import { CreateUserDto, UpdateUserDto } from '../types';

export class UserController {
  /**
   * Get all users
   */
  static async getAll(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await UserService.findAll({
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  }

  /**
   * Get user by ID
   */
  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    
    const user = await UserService.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  }

  /**
   * Create new user
   */
  static async create(req: Request, res: Response) {
    const data: CreateUserDto = req.body;
    
    const user = await UserService.create(data);

    return res.status(201).json(user);
  }

  /**
   * Update user
   */
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateUserDto = req.body;
    
    const user = await UserService.update(id, data);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  }

  /**
   * Delete user
   */
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    const deleted = await UserService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(204).send();
  }
}

