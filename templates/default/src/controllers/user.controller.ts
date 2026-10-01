import type { RouteCtx } from '@forgedevstack/harbor';
import { UserService } from '../services/user.service';

export const UserController = {
  list() {
    return { users: UserService.list() };
  },

  create(ctx: RouteCtx) {
    const body = ctx.body as { name: string; email: string };
    return { user: UserService.create(body) };
  },

  one(ctx: RouteCtx) {
    const user = UserService.find(String(ctx.params.id));
    if (!user) {
      ctx.res.status(404).json({ success: false, error: { message: 'User not found' } });
      return;
    }
    return { user };
  },

  remove(ctx: RouteCtx) {
    const id = String(ctx.params.id);
    return { deleted: UserService.remove(id), id };
  },
};
