'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { User, ShoppingBag, Settings } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchOrderCount()
    }
  }, [session])

  const fetchOrderCount = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const orders = await res.json()
        setOrderCount(orders.length)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="pt-16">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to PrintsLB</h1>
              <p className="text-xl text-gray-300 mb-8">Your 3D Printing Dashboard</p>

              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">Get Started</h2>
                <p className="text-gray-300 mb-4">
                  Ready to bring your 3D designs to life? Upload your STL files and get instant pricing!
                </p>
                <button
                  onClick={() => router.push('/upload')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Upload Your First File
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <User className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bold text-white">Welcome</span>
                  </div>
                  <p className="text-gray-300">Hello, {session.user?.name || session.user?.email}</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-white">{orderCount}</span>
                  </div>
                  <p className="text-gray-300">Total Orders</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Settings className="w-8 h-8 text-purple-400" />
                    <span className="text-sm text-gray-400">Account</span>
                  </div>
                  <p className="text-gray-300">Manage your settings</p>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => router.push('/track')}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <ShoppingBag className="w-6 h-6 text-blue-400 mb-2 mx-auto" />
                    <span className="text-white text-sm">Track Orders</span>
                  </button>
                  <button
                    onClick={() => router.push('/upload')}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <User className="w-6 h-6 text-green-400 mb-2 mx-auto" />
                    <span className="text-white text-sm">New Order</span>
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <Settings className="w-6 h-6 text-purple-400 mb-2 mx-auto" />
                    <span className="text-white text-sm">Profile Settings</span>
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <User className="w-6 h-6 text-orange-400 mb-2 mx-auto" />
                    <span className="text-white text-sm">Home</span>
                  </button>
                </div>
              </div>

              {session.user?.role === 'ADMIN' && (
                <div className="mt-8 bg-blue-900/20 border border-blue-500/50 rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Admin Panel</h2>
                  <p className="text-gray-300 mb-6">Access administrative functions</p>
                  <button
                    onClick={() => router.push('/admin')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Go to Admin Panel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
