import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
    const contactMethods = [
        {
            icon: MessageCircle,
            title: 'WhatsApp',
            value: '+961 76 696 385',
            description: 'Fastest response for quotes and support',
            link: 'https://wa.me/96176696385',
            color: 'bg-green-500/10 text-green-400'
        },
        {
            icon: Mail,
            title: 'Email',
            value: 'ali.hamieh.lb@gmail.com',
            description: 'For business inquiries and large projects',
            link: 'mailto:ali.hamieh.lb@gmail.com',
            color: 'bg-blue-500/10 text-blue-400'
        },
        {
            icon: MapPin,
            title: 'Location',
            value: 'Lebanon',
            description: 'Shipping available across all regions',
            color: 'bg-purple-500/10 text-purple-400'
        },
        {
            icon: Clock,
            title: 'Hours',
            value: '9:00 AM - 9:00 PM',
            description: 'Monday to Saturday',
            color: 'bg-orange-500/10 text-orange-400'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
                            Get in <span className="text-gradient">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Have a specialized print request or need technical advice?
                            We're here to help you bring your ideas to life.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {contactMethods.map((method, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-[2rem] backdrop-blur-md hover:border-blue-500/50 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${method.color}`}>
                                    <method.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">{method.title}</h3>
                                <div className="text-blue-400 font-medium mb-2 break-words">
                                    {method.link ? (
                                        <a href={method.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {method.value}
                                        </a>
                                    ) : (
                                        method.value
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm">{method.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-20 flex flex-col items-center"
                    >
                        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-12 rounded-[3rem] border border-blue-500/20 text-center max-w-4xl w-full backdrop-blur-xl">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Send a Direct Message</h2>
                            <p className="text-gray-300 mb-10 text-lg">
                                The fastest way to get a quote or ask a question is via WhatsApp.
                                Our team usually responds within minutes during business hours.
                            </p>
                            <a
                                href="https://wa.me/96176696385"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-400 text-white font-bold py-5 px-10 rounded-2xl shadow-xl shadow-green-900/40 transition-all hover:scale-105"
                            >
                                <MessageCircle className="w-6 h-6" />
                                <span>Message us on WhatsApp</span>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
