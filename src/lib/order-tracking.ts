// Enhanced Order Tracking Service
export interface OrderTrackingUpdate {
  orderId: string
  status: string
  message?: string
  estimatedCompletion?: Date
  notifyWhatsApp?: boolean
}

export class OrderTrackingService {
  static async updateOrderStatus(update: OrderTrackingUpdate): Promise<void> {
    // In a real app, this would update the database
    console.log('Order status updated:', update)
    
    // Send WhatsApp notification if requested
    if (update.notifyWhatsApp) {
      this.sendStatusUpdateWhatsApp(update)
    }
  }

  static sendStatusUpdateWhatsApp(update: OrderTrackingUpdate): void {
    const message = `📦 *Order Status Update*

🔢 *Order ID:* ${update.orderId}
📊 *Status:* ${update.status}
${update.message ? `💬 *Message:* ${update.message}` : ''}
${update.estimatedCompletion ? `⏰ *Est. Completion:* ${update.estimatedCompletion.toLocaleString()}` : ''}
🕐 *Updated:* ${new Date().toLocaleString()}

Thank you for choosing PrintsLB! 🎉`

    // This would use the WhatsApp service
    const whatsappUrl = `https://wa.me/96176696385?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  static calculateEstimatedTime(
    fileSize: number,
    materialType: string,
    quality: string
  ): number {
    // Base time in minutes
    let baseTime = fileSize / (1024 * 1024) * 10 // 10 min per MB
    
    // Material multipliers
    const materialMultipliers = {
      'PLA': 1.0,
      'PETG': 1.2,
      'TPU': 1.5
    }
    
    // Quality multipliers
    const qualityMultipliers = {
      'draft': 0.7,
      'standard': 1.0,
      'high': 1.5
    }
    
    const materialMultiplier = materialMultipliers[materialType as keyof typeof materialMultipliers] || 1.0
    const qualityMultiplier = qualityMultipliers[quality as keyof typeof qualityMultipliers] || 1.0
    
    return Math.round(baseTime * materialMultiplier * qualityMultiplier)
  }

  static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PLB-${timestamp}-${random}`
  }

  static validateSTLFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.stl')) {
      errors.push('File must be an STL file')
    }
    
    // Check file size
    const maxSize = 100 * 1024 * 1024 // 100MB hard limit
    if (file.size > maxSize) {
      errors.push('File size exceeds 100MB limit')
    }
    
    // Check file name
    if (file.name.length > 100) {
      errors.push('File name is too long (max 100 characters)')
    }
    
    // Check for special characters in filename
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(file.name)) {
      errors.push('File name contains invalid characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  static formatPrintTime(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = Math.round(minutes % 60)
      return `${hours}h ${remainingMinutes}m`
    }
  }

  static calculateShippingCost(weight: number, location: string): number {
    // Base shipping cost
    let baseCost = 5.00
    
    // Weight-based cost
    if (weight > 500) { // over 500g
      baseCost += (weight - 500) * 0.01
    }
    
    // Location-based cost (simplified)
    const locationMultipliers = {
      'local': 1.0,
      'national': 1.5,
      'international': 3.0
    }
    
    const multiplier = locationMultipliers[location as keyof typeof locationMultipliers] || 1.5
    
    return Math.round((baseCost * multiplier) * 100) / 100
  }
}
