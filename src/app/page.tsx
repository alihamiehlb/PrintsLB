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
      title: 'Upload STL Files',
      description: 'Simply upload your STL file and get instant cost calculation',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Calculator,
      title: 'Smart Pricing',
      description: 'Automatic cost calculation based on material usage and print time',
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          icon: Package,
          title: 'Professional 3D Printing',
          description: 'High-quality prints with precision accuracy and reliable performance using advanced FDM technology',
          color: 'from-green-500 to-emerald-500'
        }
      ]
    },
    {
      icon: Package,
      title: 'Quality Printing',
      description: 'Professional 3D printing with advanced FDM technology',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'Material cost + $2.50 profit = final price',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const process = [
    { step: 1, title: 'Upload STL', description: 'Upload your 3D model file' },
    { step: 2, title: 'Calculate Cost', description: 'Get instant price calculation' },
    { step: 3, title: 'Select Material', description: 'Choose from available materials' },
    { step: 4, title: 'Place Order', description: 'Confirm and pay for your print' }
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
            Upload your STL files, get instant pricing, and receive high-quality 3D prints 
            powered by Creality Ender V3 SE. Transparent pricing with just $2.50 profit on every order.
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
            Upload your STL file now and get instant pricing with transparent costs
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
