import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/auth/user.service';
import { AuthService } from '../../../services/auth/auth.service';
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
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  user = signal<User | null>(null);
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
    try {
      const user = await this.userService.getCurrentUser();
      this.user.set(user);
      this.initializeForms(user);
    } catch (err: any) {
      this.toastService.error('Failed to load user data');
      this.router.navigate(['/dashboard']);
    } finally {
      this.loading.set(false);
    }
  }

  private initializeForms(user: User): void {
    // Profile Form
    this.profileForm = new FormGroup({
      firstName: new FormControl(user.firstName, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      lastName: new FormControl(user.lastName, [
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
      orderUpdates: new FormControl({ value: user.preferences.orderUpdates, disabled: true }),
      shippingNotifications: new FormControl({ value: user.preferences.shippingNotifications, disabled: true }),
      newProducts: new FormControl(user.preferences.newProducts),
      marketing: new FormControl(user.preferences.marketing),
      memberOffers: new FormControl(user.preferences.memberOffers)
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
      const formValue = this.profileForm.value;
      const updated = await this.userService.updateProfile(formValue);
      this.user.set(updated);
      this.profileForm.markAsPristine();
      this.toastService.success('Profile updated successfully!');
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
      const formValue = this.passwordForm.value as PasswordChangeData;
      await this.userService.changePassword(formValue);
      this.passwordForm.reset();
      this.toastService.success('Password updated successfully!');
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
      const formValue = this.notificationsForm.value;
      const preferences: NotificationPreferences = {
        orderUpdates: true,
        shippingNotifications: true,
        newProducts: formValue.newProducts,
        marketing: formValue.marketing,
        memberOffers: formValue.memberOffers
      };

      const updated = await this.userService.updatePreferences(preferences);
      this.user.set(updated);
      this.notificationsForm.markAsPristine();
      this.toastService.success('Notification preferences saved!');
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
      await this.userService.deleteAccount({
        password: '', // In real implementation, require password
        confirmationText: this.deleteConfirmationText()
      });

      this.toastService.success('Your account has been deleted');

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
}
