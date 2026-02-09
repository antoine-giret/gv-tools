import { HttpService } from './http';

export class UserService {
  static async fetchUser<T extends object>({ userId }: { userId: number }) {
    return HttpService.get<T>({ apiVersion: 1, endpoint: `/users/${userId}` });
  }
}
