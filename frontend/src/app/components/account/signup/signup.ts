import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../features/auth/auth.store';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  auth = inject(AuthStore);
  router = inject(Router);

  signupForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      this.passwordValidator
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
    phone: new FormControl(''),
    subscribe: new FormControl(true)
  }, { validators: this.passwordMatchValidator });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showSuccess = signal<boolean>(false);

  passwordStrength = computed<'weak' | 'medium' | 'strong'>(() => {
    const password = this.signupForm.get('password')?.value || '';
    return this.calculatePasswordStrength(password);
  });

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const valid = hasUpperCase && hasNumber;
    return valid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched(this.signupForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formData = this.signupForm.value;

    // Combine first and last name for the name field
    const fullName = `${formData.firstName} ${formData.lastName}`;

    // AuthStore handles loading state, errors, and navigation internally
    this.auth.register(formData.email!, formData.password!, fullName);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
