export class TelegramService {
    static async sendDocument(file: Buffer, fileName: string, caption: string): Promise<boolean> {
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID

        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Telegram credentials missing in environment')
            return false
        }

        try {
            const formData = new FormData()
            // In Node.js/Vercel, we can pass the Buffer directly to Blob or use a standard File-like approach
            const blob = new Blob([file] as any, { type: 'application/octet-stream' })
            formData.append('chat_id', CHAT_ID)
            formData.append('document', blob, fileName)
            formData.append('caption', caption)
            formData.append('parse_mode', 'Markdown')

            console.log(`Attempting to send ${fileName} to Telegram...`)

            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()
            if (!result.ok) {
                console.error('Telegram API error response:', JSON.stringify(result, null, 2))
                return false
            }

            console.log('Successfully sent document to Telegram')
            return true
        } catch (error: any) {
            console.error('Failed to send to Telegram (exception):', error.message || error)
            return false
        }
    }

    static async sendMessage(text: string): Promise<boolean> {
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID

        if (!BOT_TOKEN || !CHAT_ID) return false

        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
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
