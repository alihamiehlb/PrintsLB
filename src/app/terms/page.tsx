import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function TermsPage() {
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
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold">Terms of Service</h1>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Service Description</h2>
                            <p>PrintsLB provides custom 3D printing services based on customer-supplied STL files. We use professional FDM (Fused Deposition Modeling) technology to bring your designs to life.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Pricing & Payment</h2>
                            <p>Our pricing is transparent: Material Cost + $2.50 Service Fee. Final quotes are provided after a manual file review and must be confirmed via WhatsApp. Payment is currently accepted via Cash on Delivery (COD) or OMT.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Print Quality & Limitations</h2>
                            <p>3D printing is an additive manufacturing process. While we strive for the highest quality, minor surface imperfections or layer lines are inherent to the process. We are not responsible for structural failures in models designed poorly for 3D printing.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Delivery</h2>
                            <p>We deliver to all regions in Lebanon. Delivery times are estimated and may vary based on location and order complexity. We are not liable for delays caused by third-party delivery services.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
                            <p>Customers warrant that they have the rights to print the files they upload. PrintsLB does not take ownership of customer designs. We reserve the right to refuse printing requests that violate local laws or ethical standards.</p>
                        </section>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    )
}
