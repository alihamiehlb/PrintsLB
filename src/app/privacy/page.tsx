import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 p-8 md:p-12 rounded-3xl border border-gray-700 backdrop-blur-sm"
                >
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
                            <p>We collect information you provide directly to us when you upload STL files, create an account, or contact us via WhatsApp. This may include your name, email address, phone number, and any design files you submit.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                            <p>We use the information we collect to process your 3D printing orders, provide customer support, and improve our services. We do not sell or share your personal information with third parties for marketing purposes.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. File Security</h2>
                            <p>STL files uploaded to PrintsLB are used solely for the purpose of quoting and printing your request. We respect your intellectual property and do not publicize or reuse your designs without explicit permission.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
                            <p>We use essential cookies to maintain your session and provide a seamless checkout experience. You can choose to disable cookies in your browser settings, but some features of the site may not function correctly.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Contact Us</h2>
                            <p>If you have any questions about this Privacy Policy, please contact us via WhatsApp at +961 76 696 385.</p>
                        </section>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    )
}
