const { OrderStatus } = require('./order.service.js');

class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
    this.createOrder = this.createOrder.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.getUserOrders = this.getUserOrders.bind(this);
    this.getAllOrders = this.getAllOrders.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
  }

  async createOrder(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be logged in to create orders',
        });
        return;
      }

      const input = {
        ...req.body,
        userId,
      };

      const order = await this.orderService.createOrder(input);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
      });
    } catch (error) {
      console.error('[OrderController] Create order error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to create order',
        message: error.message,
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const order = await this.orderService.getOrderById(id);

      if (userRole !== 'admin' && order.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own orders',
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('[OrderController] Get order error:', error);
      res.status(404).json({
        success: false,
        error: 'Order not found',
        message: error.message,
      });
    }
  }

  async getUserOrders(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const orders = await this.orderService.getUserOrders(userId);

      res.json({
        success: true,
        data: orders,
        total: orders.length,
      });
    } catch (error) {
      console.error('[OrderController] Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error.message,
      });
    }
  }

  async getAllOrders(req, res) {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        });
        return;
      }

      const orders = await this.orderService.getAllOrders();

      res.json({
        success: true,
        data: orders,
        total: orders.length,
      });
    } catch (error) {
      console.error('[OrderController] Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error.message,
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(OrderStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
        });
        return;
      }

      const order = await this.orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: order,
        message: 'Order status updated',
      });
    } catch (error) {
      console.error('[OrderController] Update status error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to update order status',
        message: error.message,
      });
    }
  }

  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const order = await this.orderService.cancelOrder(
        id,
        userRole === 'admin' ? undefined : userId
      );

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled',
      });
    } catch (error) {
      console.error('[OrderController] Cancel order error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to cancel order',
        message: error.message,
      });
    }
  }

  async deleteOrder(req, res) {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        });
        return;
      }

      const { id } = req.params;
      const result = await this.orderService.deleteOrder(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('[OrderController] Delete order error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to delete order',
        message: error.message,
      });
    }
  }
}

module.exports = { OrderController };
