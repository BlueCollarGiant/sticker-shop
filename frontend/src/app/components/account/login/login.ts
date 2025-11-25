import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    rememberMe: new FormControl(false)
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: () => {
        // All users go to dashboard after login
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Invalid credentials. Please try again.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Handle demo login as user
   */
  onDemoLoginUser(): void {
    this.performDemoLogin('user');
  }

  /**
   * Handle demo login as admin
   */
  onDemoLoginAdmin(): void {
    this.performDemoLogin('admin');
  }

  /**
   * Perform demo login with specified role
   */
  private performDemoLogin(role: 'user' | 'admin'): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.demoLogin(role).subscribe({
      next: () => {
        // All users go to dashboard after login
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Demo login failed');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
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
