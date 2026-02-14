'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function WhatsAppFloat() {
    const [isVisible, setIsVisible] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        // Show after 2 seconds
        const timer = setTimeout(() => {
            setIsVisible(true)
            setShowTooltip(true)
        }, 2000)

        // Hide tooltip after 8 seconds
        const tooltipTimer = setTimeout(() => {
            setShowTooltip(false)
        }, 8000)

        return () => {
            clearTimeout(timer)
            clearTimeout(tooltipTimer)
        }
    }, [])

    const phoneNumber = '96176696385' // From lib/whatsapp.ts
    const message = encodeURIComponent("Hello PrintsLB! I have a question about my 3D printing order.")
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="mb-4 mr-2 px-4 py-2 bg-white text-gray-900 rounded-2xl shadow-2xl text-sm font-medium whitespace-nowrap relative"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Quick Help? Chat with us!
                                    <button onClick={() => setShowTooltip(false)} className="ml-2 text-gray-400 hover:text-gray-600">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                {/* Arrow */}
                                <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white rotate-45"></div>
                            </motion.div>
                        )}

                        <motion.a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors duration-300"
                        >
                            <MessageCircle className="h-8 w-8" />
                        </motion.a>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
