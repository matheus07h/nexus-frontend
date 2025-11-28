export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface User {
  username: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  username: string;
  roles: string[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  ownerUsername: string;
}

export interface TaskCreateDto {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  ownerId?: number;
}
