import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/types';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzTagModule,
    NzPopconfirmModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent implements OnInit {
  taskService = inject(TaskService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  msg = inject(NzMessageService);

  tasks: Task[] = [];
  loading = false;
  isAdmin = false;

  // Modal controls
  isVisible = false;
  isConfirmLoading = false;
  isEditMode = false;
  currentTaskId: number | null = null;

  taskForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    dueDate: [null],
    status: ['TODO'],
    ownerId: [null],
  });

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getAll().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: () => {
        this.msg.error('Falha ao carregar tarefas');
        this.loading = false;
      },
    });
  }

  openModal() {
    this.isEditMode = false;
    this.taskForm.reset({ status: 'TODO' });
    this.isVisible = true;
  }

  openEdit(task: Task) {
    this.isEditMode = true;
    this.currentTaskId = task.id;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate as any,
      status: task.status,
    });
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
  }

  handleOk() {
    if (this.taskForm.invalid) return;

    this.isConfirmLoading = true;
    const formValue = this.taskForm.value;
    const payload: any = { ...formValue };

    if (this.isEditMode && this.currentTaskId) {
      this.isVisible = false;
      this.isConfirmLoading = false;
    } else {
      this.taskService.create(payload as any).subscribe({
        next: () => {
          this.msg.success('Tarefa criada!');
          this.isVisible = false;
          this.isConfirmLoading = false;
          this.loadTasks();
        },
        error: () => {
          this.msg.error('Erro ao criar tarefa');
          this.isConfirmLoading = false;
        },
      });
    }
  }

  deleteTask(id: number) {
    this.taskService.delete(id).subscribe(() => {
      this.msg.success('Tarefa excluída');
      this.loadTasks();
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DONE':
        return 'success';
      case 'IN_PROGRESS':
        return 'processing';
      default:
        return 'default';
    }
  }
}
