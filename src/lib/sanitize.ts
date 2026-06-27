/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize HTML content by removing potentially dangerous tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')
  
  // Remove other dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button']
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
    sanitized = sanitized.replace(regex, '')
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '')
  })
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '')
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:/gi, '')
  
  return sanitized
}

/**
 * Sanitize user input for text fields (names, descriptions, etc.)
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(input: string): string {
  if (!input) return ''
  
  const sanitized = input.trim().toLowerCase()
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize URLs
 */
export function sanitizeUrl(input: string): string {
  if (!input) return ''
  
  const sanitized = input.trim()
  // Only allow http/https URLs
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    return ''
  }
  
  try {
    const url = new URL(sanitized)
    // Remove javascript: and data: protocols
    if (url.protocol === 'javascript:' || url.protocol === 'data:') {
      return ''
    }
    return sanitized
  } catch {
    return ''
  }
}

/**
 * Escape special characters for JSON output
 */
export function escapeJson(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}
