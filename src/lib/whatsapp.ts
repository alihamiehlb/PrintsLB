// WhatsApp Service for Large Files
export interface WhatsAppMessage {
  phoneNumber: string
  message: string
  file?: {
    name: string
    size: number
    type: string
  }
}

export class WhatsAppService {
  private static readonly ADMIN_PHONE = '+96176696385'
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  static sendLargeFileNotification(file: File, userEmail?: string, customerNotes?: string): void {
    const fileSizeMB = file.size / (1024 * 1024)

    const message = `🖨️ *Large 3D Print File Request*

📁 *File Details:*
• Name: ${file.name}
• Size: ${fileSizeMB.toFixed(2)} MB
• Type: ${file.type || 'Unknown'}
• Uploaded: ${new Date().toLocaleString()}

👤 *Customer:*
• Email: ${userEmail || 'Not provided'}

📝 *Customer Notes:*
${customerNotes || 'No special notes provided'}

🚀 *Message:* Hey I want to print this file

⚠️ *File exceeds 50MB limit - requires manual processing*`

    this.sendWhatsAppMessage(message)
  }

  static sendWhatsAppMessage(message: string): void {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${this.ADMIN_PHONE.replace(/[^\d]/g, '')}?text=${encodedMessage}`

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')
  }

  static sendOrderViaWhatsApp(orderDetails: {
    orderId: string
    fileName: string
    material: string
    totalPrice: number
    customerEmail: string
    customerPhone: string
    notes?: string
    fileUrl: string
  }): void {
    const message = `🛠️ *New Custom 3D Print Order*

✅ *Order ID:* ${orderDetails.orderId}
📁 *File Name:* ${orderDetails.fileName}
🧵 *Material:* ${orderDetails.material}
💰 *Estimated Price:* $${orderDetails.totalPrice.toFixed(2)}

👤 *Customer Details:*
• Email: ${orderDetails.customerEmail}
• Phone: ${orderDetails.customerPhone}

📝 *Notes:*
${orderDetails.notes || 'None'}

🔗 *Direct File Link:*
${orderDetails.fileUrl}

🚀 *Action Required:* Please review the file and confirm the final price with the customer.`

    this.sendWhatsAppMessage(message)
  }

  static sendOrderConfirmation(orderDetails: {
    fileName: string
    material: string
    totalPrice: number
    customerEmail: string
    estimatedTime: number
  }): void {
    const message = `✅ *New 3D Print Order Confirmed*

📦 *Order Details:*
• File: ${orderDetails.fileName}
• Material: ${orderDetails.material}
• Price: $${orderDetails.totalPrice.toFixed(2)}
• Est. Time: ${Math.round(orderDetails.estimatedTime)} minutes
• Customer: ${orderDetails.customerEmail}
• Date: ${new Date().toLocaleString()}

🎉 *Order ready for processing!*`

    this.sendWhatsAppMessage(message)
  }

  static sendErrorNotification(error: {
    fileName: string
    errorType: string
    customerEmail?: string
  }): void {
    const message = `❌ *3D Print Error*

🚨 *Error Details:*
• File: ${error.fileName}
• Error: ${error.errorType}
• Customer: ${error.customerEmail || 'Unknown'}
• Time: ${new Date().toLocaleString()}

🔧 *Please check the system for details*`

    this.sendWhatsAppMessage(message)
  }

  static isLargeFile(file: File): boolean {
    return file.size > this.MAX_FILE_SIZE
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
