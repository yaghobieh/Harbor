import { check, route } from '@forgedevstack/harbor';
import type { RouteCtx } from '@forgedevstack/harbor';
import { UserController } from '../controllers/user.controller';

export class Users {
  @route.get('/')
  list() {
    return UserController.list();
  }

  @route.post('/')
  @check({
    body: {
      name: { type: 'string', required: true, min: 2 },
      email: { type: 'email', required: true },
    },
  })
  create(ctx: RouteCtx) {
    return UserController.create(ctx);
  }

  @route.get('/:id')
  one(ctx: RouteCtx) {
    return UserController.one(ctx);
  }

  @route.del('/:id')
  remove(ctx: RouteCtx) {
    return UserController.remove(ctx);
  }
}
