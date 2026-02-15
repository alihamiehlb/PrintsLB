import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                        className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl shadow-2xl shadow-blue-500/20"
                    >
                        <FileQuestion className="w-12 h-12 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl md:text-9xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
                    >
                        404
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl md:text-3xl font-bold mb-6 text-white"
                    >
                        Page was not found
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-400 mb-10 text-lg leading-relaxed"
                    >
                        It seems like you've ventured into unprinted territory.
                        The page you are looking for doesn't exist or has been moved.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/"
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-gray-900 font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-xl"
                        >
                            <Home className="w-5 h-5" />
                            <span>Return Home</span>
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 text-white font-bold py-4 px-8 rounded-2xl border border-gray-700 hover:bg-gray-700 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Go Back</span>
                        </button>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
