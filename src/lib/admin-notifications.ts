// Admin Notification System
export interface AdminNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export class AdminNotificationService {
  private static notifications: AdminNotification[] = []

  static addNotification(notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: AdminNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    this.notifications.unshift(newNotification)
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Show browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      })
    }
  }

  static getNotifications(): AdminNotification[] {
    return this.notifications
  }

  static markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  static markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
  }

  static getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // Specific notification helpers
  static notifyNewOrder(orderId: string, customerEmail: string, fileName: string): void {
    this.addNotification({
      type: 'info',
      title: 'New Order Received',
      message: `Order ${orderId} from ${customerEmail} - File: ${fileName}`,
      actionUrl: `/admin/orders/${orderId}`
    })
  }

  static notifyLargeFile(fileName: string, fileSize: string, customerEmail: string): void {
    this.addNotification({
      type: 'warning',
      title: 'Large File Upload',
      message: `${customerEmail} uploaded large file: ${fileName} (${fileSize})`,
      actionUrl: '/admin/orders'
    })
  }

  static notifySystemError(error: string, context?: string): void {
    this.addNotification({
      type: 'error',
      title: 'System Error',
      message: `${error}${context ? ` - ${context}` : ''}`
    })
  }

  static notifyLowMaterial(materialName: string, color: string): void {
    this.addNotification({
      type: 'warning',
      title: 'Low Material Stock',
      message: `${materialName} (${color}) is running low - please restock`,
      actionUrl: '/admin/materials'
    })
  }

  static notifyDatabaseConnection(status: 'connected' | 'disconnected'): void {
    this.addNotification({
      type: status === 'connected' ? 'success' : 'error',
      title: `Database ${status === 'connected' ? 'Connected' : 'Disconnected'}`,
      message: `Database is now ${status}`
    })
  }

  static requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }
}

// System Health Monitor
export class SystemHealthMonitor {
  private static isMonitoring = false
  private static healthCheckInterval: NodeJS.Timeout | null = null

  static startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    AdminNotificationService.requestNotificationPermission()

    // Check database connection every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkDatabaseHealth()
      this.checkDiskSpace()
    }, 30000)

    console.log('System health monitoring started')
  }

  static stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    this.isMonitoring = false
    console.log('System health monitoring stopped')
  }

  private static async checkDatabaseHealth(): Promise<void> {
    try {
      // In a real app, this would ping the database
      const response = await fetch('/api/admin/health')
      if (response.ok) {
        AdminNotificationService.notifyDatabaseConnection('connected')
      }
    } catch (error) {
      AdminNotificationService.notifyDatabaseConnection('disconnected')
    }
  }

  private static checkDiskSpace(): void {
    // Mock disk space check
    const mockUsage = Math.random() * 100
    if (mockUsage > 80) {
      AdminNotificationService.addNotification({
        type: 'warning',
        title: 'Low Disk Space',
        message: `Disk usage is at ${mockUsage.toFixed(1)}%`
      })
    }
  }
}
