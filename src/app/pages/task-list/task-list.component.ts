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
  template: `
    <div style="padding: 24px;">
      <div
        style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;"
      >
        <h2>Minhas Tarefas</h2>
        <button nz-button nzType="primary" (click)="openModal()">
          <span nz-icon nzType="plus"></span> Nova Tarefa
        </button>
      </div>

      <nz-table #basicTable [nzData]="tasks" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Título</th>
            <th>Status</th>
            <th>Vencimento</th>
            <th *ngIf="isAdmin">Dono</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>
              <strong>{{ data.title }}</strong>
              <div style="color: #888; font-size: 12px;">
                {{ data.description }}
              </div>
            </td>
            <td>
              <nz-tag [nzColor]="getStatusColor(data.status)">{{
                data.status
              }}</nz-tag>
            </td>
            <td>{{ data.dueDate | date : 'dd/MM/yyyy' }}</td>
            <td *ngIf="isAdmin">{{ data.ownerUsername }}</td>
            <td>
              <a (click)="openEdit(data)" style="margin-right: 10px;">Editar</a>
              <a
                nz-popconfirm
                nzPopconfirmTitle="Tem certeza?"
                (nzOnConfirm)="deleteTask(data.id)"
                nzDanger
                >Excluir</a
              >
            </td>
          </tr>
        </tbody>
      </nz-table>

      <nz-modal
        [(nzVisible)]="isVisible"
        [nzTitle]="isEditMode ? 'Editar Tarefa' : 'Nova Tarefa'"
        (nzOnCancel)="handleCancel()"
        (nzOnOk)="handleOk()"
        [nzOkLoading]="isConfirmLoading"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="taskForm" nzLayout="vertical">
            <nz-form-item>
              <nz-form-label>Título</nz-form-label>
              <nz-form-control nzErrorTip="Título é obrigatório">
                <input
                  nz-input
                  formControlName="title"
                  placeholder="Ex: Relatório mensal"
                />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>Descrição</nz-form-label>
              <nz-form-control>
                <textarea
                  nz-input
                  formControlName="description"
                  rows="3"
                ></textarea>
              </nz-form-control>
            </nz-form-item>

            <div style="display: flex; gap: 16px;">
              <nz-form-item style="flex: 1">
                <nz-form-label>Vencimento</nz-form-label>
                <nz-form-control>
                  <nz-date-picker
                    formControlName="dueDate"
                    style="width: 100%"
                  ></nz-date-picker>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item style="flex: 1">
                <nz-form-label>Status</nz-form-label>
                <nz-form-control>
                  <nz-select formControlName="status">
                    <nz-option nzValue="TODO" nzLabel="A Fazer"></nz-option>
                    <nz-option
                      nzValue="IN_PROGRESS"
                      nzLabel="Em Progresso"
                    ></nz-option>
                    <nz-option nzValue="DONE" nzLabel="Feito"></nz-option>
                    <nz-option
                      nzValue="BLOCKED"
                      nzLabel="Bloqueado"
                    ></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>

            <nz-form-item *ngIf="isAdmin && !isEditMode">
              <nz-form-label>ID do Usuário (Opcional - Admin)</nz-form-label>
              <nz-form-control nzExtra="Deixe vazio para atribuir a si mesmo">
                <input
                  nz-input
                  type="number"
                  formControlName="ownerId"
                  placeholder="ID do usuário"
                />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
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
