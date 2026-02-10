import type { HarborRequest } from '@forgestack/harbor';
import { User } from '../models';
import { UserService } from '../services';

export const UserController = {
  async getAll() {
    const users = await User.find();
    return { users };
  },

  async getById(req: HarborRequest) {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error('User not found');
    }
    return { user };
  },

  async create(req: HarborRequest) {
    const { email, name, password } = req.body;
    
    // Hash password and create user
    const user = await UserService.createUser({ email, name, password });
    
    return { 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  },

  async update(req: HarborRequest) {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return { user };
  },

  async delete(req: HarborRequest) {
    const result = await User.findByIdAndDelete(req.params.id);
    
    if (!result) {
      throw new Error('User not found');
    }
    
    return { deleted: true };
  },
};
