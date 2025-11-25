import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { User, NotificationPreferences, PasswordChangeData, DeleteAccountData } from '../../../models/user.model';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class AccountSettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Use auth service's user signal directly
  user = this.authService.user;
  loading = signal(true);

  // Profile Form
  profileForm!: FormGroup;
  profileSubmitting = signal(false);

  // Password Form
  passwordForm!: FormGroup;
  passwordSubmitting = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // Notifications Form
  notificationsForm!: FormGroup;
  notificationsSubmitting = signal(false);

  // Delete Account
  deleteModalOpen = signal(false);
  deleteConfirmationText = signal('');
  deleteSubmitting = signal(false);
  deleteUnderstand = signal(false);

  // Computed
  profileDirty = computed(() => this.profileForm?.dirty || false);
  notificationsDirty = computed(() => this.notificationsForm?.dirty || false);
  deleteConfirmationValid = computed(() => this.deleteConfirmationText() === 'DELETE');
  deleteButtonEnabled = computed(() =>
    this.deleteConfirmationValid() && this.deleteUnderstand() && !this.deleteSubmitting()
  );

  passwordStrength = computed<'weak' | 'medium' | 'strong'>(() => {
    const password = this.passwordForm?.get('newPassword')?.value || '';
    return this.calculatePasswordStrength(password);
  });

  passwordCriteria = computed(() => {
    const password = this.passwordForm?.get('newPassword')?.value || '';
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    };
  });

  passwordsMatch = computed(() => {
    const newPass = this.passwordForm?.get('newPassword')?.value;
    const confirm = this.passwordForm?.get('confirmPassword')?.value;
    return !!newPass && !!confirm && newPass === confirm;
  });

  async ngOnInit(): Promise<void> {
    const currentUser = this.user();

    if (!currentUser) {
      this.toastService.error('User not authenticated');
      this.router.navigate(['/account/login']);
      return;
    }

    this.initializeForms(currentUser);
    this.loading.set(false);
  }

  private initializeForms(user: User): void {
    const preferences = user.preferences ?? this.getDefaultPreferences();

    // Profile Form
    this.profileForm = new FormGroup({
      firstName: new FormControl(user.firstName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      lastName: new FormControl(user.lastName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      email: new FormControl(user.email, [
        Validators.required,
        Validators.email
      ]),
      phone: new FormControl(user.phone || '', [
        Validators.pattern(/^\+?1?\s?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/)
      ])
    });

    // Password Form
    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator.bind(this)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator.bind(this) });

    // Notifications Form
    this.notificationsForm = new FormGroup({
      orderUpdates: new FormControl({ value: preferences.orderUpdates, disabled: true }),
      shippingNotifications: new FormControl({ value: preferences.shippingNotifications, disabled: true }),
      newProducts: new FormControl(preferences.newProducts),
      marketing: new FormControl(preferences.marketing),
      memberOffers: new FormControl(preferences.memberOffers)
    });
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const valid = hasUppercase && hasLowercase && hasNumber;
    return valid ? null : { weakPassword: true };
  }

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPass = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;

    if (!newPass || !confirm) return null;

    return newPass === confirm ? null : { mismatch: true };
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  async onProfileSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.profileDirty()) return;

    this.profileSubmitting.set(true);

    try {
      // TODO: Implement real API call when backend endpoint is ready
      // const formValue = this.profileForm.value;
      // await this.userService.updateProfile(formValue);

      // Demo mode: simulate success
      await this.delay(500);
      this.profileForm.markAsPristine();
      this.toastService.success('Profile updated successfully! (Demo Mode)');
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to update profile');
    } finally {
      this.profileSubmitting.set(false);
    }
  }

  async onPasswordSubmit(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSubmitting.set(true);

    try {
      // TODO: Implement real API call when backend endpoint is ready
      // const formValue = this.passwordForm.value as PasswordChangeData;
      // await this.userService.changePassword(formValue);

      // Demo mode: simulate success
      await this.delay(500);
      this.passwordForm.reset();
      this.toastService.success('Password updated successfully! (Demo Mode)');
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to update password');
    } finally {
      this.passwordSubmitting.set(false);
    }
  }

  async onNotificationsSubmit(): Promise<void> {
    if (!this.notificationsDirty()) return;

    this.notificationsSubmitting.set(true);

    try {
      // TODO: Implement real API call when backend endpoint is ready
      // const formValue = this.notificationsForm.value;
      // const preferences: NotificationPreferences = { ... };
      // await this.userService.updatePreferences(preferences);

      // Demo mode: simulate success
      await this.delay(500);
      this.notificationsForm.markAsPristine();
      this.toastService.success('Notification preferences saved! (Demo Mode)');
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to save preferences');
    } finally {
      this.notificationsSubmitting.set(false);
    }
  }

  openDeleteModal(): void {
    this.deleteModalOpen.set(true);
    this.deleteConfirmationText.set('');
    this.deleteUnderstand.set(false);
  }

  closeDeleteModal(): void {
    if (!this.deleteSubmitting()) {
      this.deleteModalOpen.set(false);
    }
  }

  async confirmDelete(): Promise<void> {
    if (!this.deleteButtonEnabled()) return;

    this.deleteSubmitting.set(true);

    try {
      // TODO: Implement real API call when backend endpoint is ready
      // await this.userService.deleteAccount({ password: '', confirmationText: this.deleteConfirmationText() });

      // Demo mode: simulate success
      await this.delay(1000);
      this.toastService.success('Your account has been deleted (Demo Mode)');

      setTimeout(() => {
        this.authService.logout();
      }, 2000);
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to delete account');
      this.deleteSubmitting.set(false);
    }
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword.update(v => !v);
    } else if (field === 'new') {
      this.showNewPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      orderUpdates: true,
      shippingNotifications: true,
      newProducts: true,
      marketing: false,
      memberOffers: false
    };
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters`;
    if (field.errors['pattern']) return 'Please enter a valid format';
    if (field.errors['weakPassword']) return 'Password must include uppercase, lowercase, and number';

    return 'Invalid input';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

