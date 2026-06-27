'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import { useState } from 'react'

const faqs = [
    {
        question: "How do I get a price for my 3D print?",
        answer: "Simply go to our Upload page, upload your STL file, and select your material. Once you submit the order, we will review the file and set a final price based on the material usage and print time. You will be notified via WhatsApp with the final quote."
    },
    {
        question: "What is the maximum size you can print?",
        answer: "We use the Creality Ender V3 SE, which has a build volume of 220 x 220 x 250 mm. If your model is larger, we can help you split it into multiple parts and join them after printing."
    },
    {
        question: "Do you offer shipping in Lebanon?",
        answer: "Yes! We offer delivery to all regions in Lebanon. Shipping costs vary depending on your location and will be added to your final order total."
    },
    {
        question: "What file formats do you accept?",
        answer: "We currently accept .STL files, which is the standard format for 3D printing. If you have a different format (like .OBJ or .STEP), please contact us via WhatsApp, and we'll help you convert it."
    },
    {
        question: "How long does it take to finish an order?",
        answer: "Most small to medium prints are completed within 24-48 hours. Larger projects or bulk orders may take longer. We'll give you an estimated completion time when we confirm your price."
    },
    {
        question: "Can you help me design a 3D model?",
        answer: "While we primarily offer printing services, we can help with minor modifications or refer you to professional 3D designers for complex projects. Contact us on WhatsApp to discuss your needs."
    }
]

function FAQItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
    return (
        <div className="border-b border-gray-800">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-xl font-semibold transition-colors ${isOpen ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                    {question}
                </span>
                <ChevronDown className={`w-6 h-6 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-gray-400 leading-relaxed text-lg">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="pt-24 pb-20">
                <section className="px-6 md:px-12 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-6">
                            <HelpCircle className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Frequently Asked <span className="text-gradient">Questions</span></h1>
                        <p className="text-xl text-gray-400">
                            Find quick answers to common questions about our services, pricing, and delivery.
                        </p>
                    </motion.div>

                    <div className="bg-gray-900/50 rounded-3xl border border-gray-800 p-8 md:p-12 mb-20 backdrop-blur-sm">
                        {faqs.map((faq, idx) => (
                            <FAQItem
                                key={idx}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === idx}
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            />
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-950 backdrop-blur-sm">
                            <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
                            <p className="text-gray-300 mb-8">Can&apos;t find the answer you&apos;re looking for? Reach out to our human support team directly.</p>
                            <a
                                href="https://wa.me/96176696385"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-xl bg-white px-10 py-4 font-bold text-gray-900 shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                <MessageCircle className="mr-2 w-5 h-5" />
                                Contact us on WhatsApp
                            </a>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
