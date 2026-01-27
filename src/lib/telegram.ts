export class TelegramService {
    private static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    private static readonly CHAT_ID = process.env.TELEGRAM_CHAT_ID

    static async sendDocument(file: Buffer, fileName: string, caption: string): Promise<boolean> {
        if (!this.BOT_TOKEN || !this.CHAT_ID) {
            console.error('Telegram credentials missing')
            return false
        }

        try {
            const formData = new FormData()
            // Use the internal ArrayBuffer and handle potential typing issues
            const blob = new Blob([file] as any, { type: 'application/octet-stream' })
            formData.append('chat_id', this.CHAT_ID)
            formData.append('document', blob, fileName)
            formData.append('caption', caption)
            formData.append('parse_mode', 'Markdown')

            const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendDocument`, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()
            if (!result.ok) {
                console.error('Telegram API error:', result)
                return false
            }

            return true
        } catch (error) {
            console.error('Failed to send to Telegram:', error)
            return false
        }
    }

    static async sendMessage(text: string): Promise<boolean> {
        if (!this.BOT_TOKEN || !this.CHAT_ID) return false

        try {
            const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.CHAT_ID,
                    text: text,
                    parse_mode: 'Markdown'
                })
            })

            const result = await response.json()
            return result.ok
        } catch (error) {
            console.error('Failed to send Telegram message:', error)
            return false
        }
    }
}
