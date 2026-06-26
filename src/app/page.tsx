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
              Upload your STL file now for a professional printability review and custom quote.
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
