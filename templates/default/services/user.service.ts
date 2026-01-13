import { User } from '../models';
import { CreateUserDto, UpdateUserDto, PaginationOptions, PaginatedResult } from '../types';

export class UserService {
  /**
   * Find all users with pagination
   */
  static async findAll(options: PaginationOptions): Promise<PaginatedResult<typeof User>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    return User.findById(id);
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Create new user
   */
  static async create(data: CreateUserDto) {
    const user = await User.create({
      ...data,
      email: data.email.toLowerCase(),
    });

    return user;
  }

  /**
   * Update user
   */
  static async update(id: string, data: UpdateUserDto) {
    return User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  /**
   * Delete user
   */
  static async delete(id: string) {
    const result = await User.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}

