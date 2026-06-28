'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Upload, Package, Award, CheckCircle, ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroVideo } from '@/components/hero-video'
import { CtaButton } from '@/components/ui/cta-button'
import { FloatingParticles } from '@/components/animations'

export default function Home() {
  const features = [
    {
      icon: Upload,
      title: 'Direct Upload',
      description: 'Upload your STL files and our experts review them for optimal printability.',
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'High-precision prints using industrial-grade materials and Creality technology.',
    },
    {
      icon: CheckCircle,
      title: 'Expert Support',
      description: 'Personalized assistance for every model to ensure the best 3D printing results.',
    },
    {
      icon: Package,
      title: 'Reliable Delivery',
      description: 'Carefully packed and shipped directly to your doorstep across Lebanon.',
    },
  ]

  const process = [
    { step: 1, title: 'Upload STL', description: 'Upload your 3D model file' },
    { step: 2, title: 'Expert Review', description: 'We review your model for printability' },
    { step: 3, title: 'Professional Print', description: 'Your model is printed with care' },
    { step: 4, title: 'Fast Delivery', description: 'Receive your print anywhere in Lebanon' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <FloatingParticles />
      <Header />

      <main className="relative z-10">
        {/* Full-screen immersive hero */}
        <HeroVideo>
          <CtaButton href="/upload" variant="primary" className="min-h-14 w-full sm:w-auto sm:min-w-48">
            <Upload className="h-5 w-5" />
            Upload STL File
            <ArrowRight className="h-5 w-5" />
          </CtaButton>
          <CtaButton href="/track" variant="secondary" className="min-h-14 w-full sm:w-auto sm:min-w-48">
            <Package className="h-5 w-5" />
            Track Order
          </CtaButton>
        </HeroVideo>

        {/* Features */}
        <section className="px-6 py-24 md:px-12 border-t border-zinc-900">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-16 text-center text-3xl font-bold text-white md:text-4xl">
              Why Choose <span className="text-gradient-bw">PrintsLB</span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 group-hover:border-white transition-colors">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Process */}
        <section className="px-6 py-24 md:px-12 bg-zinc-950/30">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-16 text-center text-3xl font-bold text-white md:text-4xl">
              How It <span className="text-gradient-bw">Works</span>
            </h2>

            <div className="grid gap-8 md:grid-cols-4">
              {process.map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-4 relative">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-black text-2xl font-bold text-white">
                      {item.step}
                    </div>
                    {index < process.length - 1 && (
                      <div className="absolute top-8 left-full hidden h-px w-full bg-zinc-700 md:block" />
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-zinc-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SEO Content Section */}
        <section className="px-6 py-24 md:px-12 bg-zinc-950/50">
          <motion.div
            className="mx-auto max-w-4xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
              Professional <span className="text-gradient-bw">3D Printing in Lebanon</span>
            </h2>
            <div className="space-y-6 text-zinc-300">
              <p className="text-lg leading-relaxed">
                PrintsLB is Lebanon&apos;s premier 3D printing service, providing high-quality STL printing across Beirut, Mount Lebanon, and all regions of Lebanon. Whether you&apos;re in Tripoli, Sidon, Tyre, Byblos, Zahle, or Baalbek, we deliver professional 3D prints directly to your doorstep.
              </p>
              <p className="text-lg leading-relaxed">
                Our 3D printing services in Lebanon include rapid prototyping, custom figurines, replacement parts, and artistic pieces. We use industrial-grade Creality 3D printers and premium materials including PLA, PETG, TPU, and ABS to ensure the highest quality results for every project.
              </p>
              <p className="text-lg leading-relaxed">
                As the leading 3D printing company in Lebanon, we offer instant online quotes, real-time order tracking, and expert support via WhatsApp. Upload your STL files today and experience the best 3D printing service Lebanon has to offer.
              </p>
              <div className="grid gap-4 md:grid-cols-2 mt-8">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-white">3D Printing Beirut</h3>
                  <p className="text-zinc-400">Fast delivery across Beirut and surrounding areas with same-day pickup available.</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-white">3D Printing Mount Lebanon</h3>
                  <p className="text-zinc-400">Serving all Mount Lebanon regions with professional quality and competitive pricing.</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-white">Nationwide Delivery</h3>
                  <p className="text-zinc-400">Delivery to Tripoli, Sidon, Tyre, Byblos, Zahle, Baalbek, and all Lebanon regions.</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-white">Expert Support</h3>
                  <p className="text-zinc-400">WhatsApp support for file optimization, material selection, and technical guidance.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 md:px-12">
          <motion.div
            className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to Print Your <span className="text-gradient-bw">3D Model</span>?
            </h2>
            <p className="mb-8 text-lg text-zinc-400">
              Upload your STL file now for professional 3D printing in Lebanon with instant quotes and fast delivery.
            </p>
            <CtaButton href="/upload" variant="primary">
              <Upload className="h-5 w-5" />
              Start Printing
              <ArrowRight className="h-5 w-5" />
            </CtaButton>
          </motion.div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
