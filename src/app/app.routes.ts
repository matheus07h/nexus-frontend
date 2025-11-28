import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TaskListComponent } from './pages/task-list/task-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'tasks',
    component: TaskListComponent,
    canActivate: [authGuard],
  },
];
