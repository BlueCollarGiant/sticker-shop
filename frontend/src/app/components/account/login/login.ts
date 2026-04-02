import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../features/auth/auth.store';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  auth = inject(AuthStore);
  router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false)
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor() {
    // Mirror store error and loading state into local signals for the template
    effect(() => {
      this.isLoading.set(this.auth.loading());
      if (this.auth.error()) {
        this.errorMessage.set(this.auth.error()!);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    // AuthStore handles loading state, errors, and navigation internally
    // Error and loading state are mirrored to local signals via effect() in the constructor
    this.auth.login(email!, password!);
  }

  /**
   * Handle demo login as user
   */
  onDemoLoginUser(): void {
    this.auth.login('demo@nightreader.com', 'demo123');
  }

  /**
   * Handle demo login as admin
   */
  onDemoLoginAdmin(): void {
    this.auth.login('admin@nightreader.com', 'admin123');
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get emailControl() {
    return this.loginForm.get('email')!;
  }

  get passwordControl() {
    return this.loginForm.get('password')!;
  }
}
