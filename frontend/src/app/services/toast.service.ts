import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  private addToast(type: Toast['type'], message: string, duration = 4000): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, message, duration };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.addToast('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.addToast('error', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.addToast('warning', message, duration);
  }

  info(message: string, duration?: number): void {
    this.addToast('info', message, duration);
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
