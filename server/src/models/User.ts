export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface UserWithoutPassword {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

