import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: OrderItem[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent {
  authService = inject(AuthService);

  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('user_orders');
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      // Convert date strings back to Date objects
      parsedOrders.forEach((order: any) => {
        order.date = new Date(order.date);
      });
      this.orders.set(parsedOrders);
    }
    this.loading.set(false);
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered'
    };
    return classes[status] || 'status-pending';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return texts[status] || 'Pending';
  }
}
