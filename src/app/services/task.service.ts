import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TaskCreateDto } from '../models/types';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/tasks';

  getAll() {
    return this.http.get<Task[]>(this.apiUrl);
  }

  create(task: TaskCreateDto) {
    return this.http.post<Task>(this.apiUrl, task);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  update(id: number, task: TaskCreateDto) {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }
}
