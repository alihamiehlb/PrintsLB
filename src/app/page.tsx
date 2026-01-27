'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Upload, Calculator, Package, DollarSign, Target, Award, ArrowRight, CheckCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingParticles, GradientBackground, GlowingCard, TypingAnimation, WaveAnimation } from '@/components/animations'

export default function Home() {
  const features = [
    {
      icon: Upload,
      title: 'Direct Upload',
      description: 'Simply upload your STL files and our experts will review them for optimal printability',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'High-precision prints using industrial-grade materials and Creality ecosystem technology',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CheckCircle,
      title: 'Expert Support',
      description: 'Personalized assistance for every model to ensure the best possible 3D printing results',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Package,
      title: 'Reliable Delivery',
      description: 'Carefully packed and shipped directly to your doorstep across all of Lebanon',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const process = [
    { step: 1, title: 'Upload STL', description: 'Upload your 3D model file' },
    { step: 2, title: 'Expert Review', description: 'We review your model for printability' },
    { step: 3, title: 'Professional Print', description: 'Your model is printed with care' },
    { step: 4, title: 'Fast Delivery', description: 'Receive your print anywhere in Lebanon' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground />
      <FloatingParticles />
      <Header />

      <main className="relative z-10 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-20 md:px-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl"></div>
          <motion.div
            className="relative mx-auto max-w-7xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="mb-6 text-4xl font-bold md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TypingAnimation text="PrintsLB: Professional 3D Printing Service" className="text-gradient" />
              <br />
              <span className="text-white">Made Simple</span>
            </motion.h1>

            <motion.p
              className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Upload your STL files and receive premium 3D prints powered by Creality technology.
              Professional quality with dedicated hobbyist care and reliable delivery across Lebanon.
            </motion.p>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link
                href="/upload"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload STL File
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                href="/track"
                className="inline-flex items-center justify-center rounded-lg border border-gray-600 bg-gray-800/50 px-8 py-4 font-semibold text-white backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 hover:scale-105"
              >
                <Package className="mr-2 h-5 w-5" />
                Track Order
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-20 md:px-12">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
              Why Choose <span className="text-gradient">PrintsLB</span>
            </h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/70"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Process Section */}
        <section className="px-6 py-20 md:px-12">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
              How It <span className="text-gradient">Works</span>
            </h2>

            <div className="grid gap-8 md:grid-cols-4">
              {process.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-4 relative">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-2xl font-bold text-white">
                      {item.step}
                    </div>
                    {index < process.length - 1 && (
                      <div className="absolute top-8 left-full hidden h-0.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500 md:block"></div>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 md:px-12">
          <motion.div
            className="mx-auto max-w-4xl rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900/90 to-blue-900/90 p-12 text-center backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to Print Your <span className="text-gradient">3D Model</span>?
            </h2>
            <p className="mb-8 text-lg text-gray-300">
              Upload your STL file now for a professional printability review and custom quote
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Printing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
