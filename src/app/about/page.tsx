'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Printer, Users, Target, Award, ArrowRight, CheckCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function AboutPage() {
  const features = [
    {
      icon: Printer,
      title: 'Professional 3D Printing',
      description: 'High-quality prints with precision accuracy and reliable performance using advanced FDM technology'
    },
    {
      icon: Target,
      title: 'Precision Printing',
      description: 'High-quality prints with layer resolution as fine as 0.1mm'
    },
    {
      icon: Users,
      title: 'Expert Service',
      description: 'Personalized attention to every project with quality assurance'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Satisfaction guaranteed with our quality assurance process'
    }
  ]

  const materials = [
    'PLA - Eco-friendly and easy to print',
    'PETG - Durable and chemical resistant',
    'TPU - Flexible and impact resistant'
  ]

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 md:px-12">
        <div className="absolute inset-0 bg-white/5 blur-3xl"></div>
        <motion.div 
          className="relative mx-auto max-w-4xl text-center"
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
            About <span className="text-gradient">PrintsLB</span>
          </motion.h1>
          
          <motion.p 
            className="mb-8 text-lg text-gray-300 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your trusted partner for professional 3D printing services. 
            We bring your digital designs to life with precision, quality, and transparent pricing.
          </motion.p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="px-6 py-20 md:px-12">
        <motion.div 
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">
            Our <span className="text-gradient">Story</span>
          </h2>
          
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
            <p className="mb-4 text-lg text-gray-300 leading-relaxed">
              Founded by Ali Hamieh, PrintsLB was born from a passion for 3D printing and a desire to make 
              professional printing services accessible to everyone. What started as a hobby with professional 
              3D printing equipment has grown into a dedicated service focused on quality and customer satisfaction.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              We believe in transparent pricing - you pay for the material cost plus a modest $2.50 service fee. 
              No hidden charges, no complicated pricing tiers. Just honest, high-quality 3D printing when you need it.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 md:px-12">
        <motion.div 
          className="mx-auto max-w-6xl"
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
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Materials */}
      <section className="px-6 py-20 md:px-12">
        <motion.div 
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Available <span className="text-gradient">Materials</span>
          </h2>
          
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
            <div className="grid gap-4 md:grid-cols-3">
              {materials.map((material, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{material}</span>
                </motion.div>
              ))}
            </div>
            <p className="mt-6 text-center text-gray-400">
              All materials are compatible with our professional 3D printing equipment and available in various colors.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 md:px-12">
        <motion.div 
          className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Start <span className="text-gradient">Printing</span>?
          </h2>
          <p className="mb-8 text-lg text-gray-300">
            Upload your STL file now and get instant pricing with transparent costs
          </p>
          <Link 
            href="/upload"
            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 font-semibold text-black shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-105"
          >
            Upload Your STL File
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
