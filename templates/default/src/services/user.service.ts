export interface User {
  id: string;
  name: string;
  email: string;
}

const users = new Map<string, User>([
  ['1', { id: '1', name: 'Ada', email: 'ada@harbor.dev' }],
]);

export const UserService = {
  list(): User[] {
    return [...users.values()];
  },

  create(input: { name: string; email: string }): User {
    const id = String(users.size + 1);
    const user = { id, name: input.name, email: input.email };
    users.set(id, user);
    return user;
  },

  find(id: string): User | undefined {
    return users.get(id);
  },

  remove(id: string): boolean {
    return users.delete(id);
  },
};
