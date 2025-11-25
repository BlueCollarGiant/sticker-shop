import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Form fields
  email = signal('');
  password = signal('');

  // UI state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Handle standard login form submission
   */
  onLogin(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    const emailValue = this.email();
    const passwordValue = this.password();

    if (!emailValue || !passwordValue) {
      this.errorMessage.set('Please enter email and password');
      this.isLoading.set(false);
      return;
    }

    this.authService.login(emailValue, passwordValue).subscribe({
      next: () => {
        // Check for return URL, otherwise go to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigate([returnUrl]);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
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
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.demoLogin(role).subscribe({
      next: () => {
        // Check for return URL, otherwise go to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigate([returnUrl]);
        } else {
          this.router.navigate(['/dashboard']);
        }
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
}
