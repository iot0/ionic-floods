export class User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: UserRole;
  deviceIp?: string;
}

export enum UserRole {
  admin = 1,
  user
}
