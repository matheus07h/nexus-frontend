import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
  ],
  template: `
    <div
      style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5;"
    >
      <nz-card style="width: 400px;" nzTitle="Nexus Task Manager">
        <form nz-form [formGroup]="loginForm" (ngSubmit)="submitForm()">
          <nz-form-item>
            <nz-form-control nzErrorTip="Por favor insira seu usuário!">
              <input
                nz-input
                formControlName="username"
                placeholder="Usuário"
              />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control nzErrorTip="Por favor insira sua senha!">
              <input
                nz-input
                type="password"
                formControlName="password"
                placeholder="Senha"
              />
            </nz-form-control>
          </nz-form-item>
          <button
            nz-button
            nzType="primary"
            [nzBlock]="true"
            [nzLoading]="loading"
          >
            Entrar
          </button>
        </form>
      </nz-card>
    </div>
  `,
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  msg = inject(NzMessageService);
  loading = false;

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submitForm() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.auth.login(this.loginForm.value).subscribe({
        next: () => {
          this.msg.success('Login realizado!');
          this.router.navigate(['/tasks']);
        },
        error: () => {
          this.msg.error('Credenciais inválidas');
          this.loading = false;
        },
      });
    } else {
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
