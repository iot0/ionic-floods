export class User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: UserRole;
  token?: string;
}

export enum UserRole {
  admin = 1,
  user
}
