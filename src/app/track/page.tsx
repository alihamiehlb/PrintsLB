'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface OrderTracking {
  status: string
  description: string
  timestamp: string
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  notes?: string
  printJob?: {
    id: string
    fileName: string
    materialName: string
    totalPrice: number
  }
  tracking: OrderTracking[]
  fileUrl?: string
}

export default function TrackOrder() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/track')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'VALIDATING':
        return <CheckCircle className="w-5 h-5 text-blue-400" />
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-blue-400" />
      case 'PRINTING':
        return <Package className="w-5 h-5 text-purple-400" />
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-green-400" />
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50'
      case 'VALIDATING':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/50'
      case 'CONFIRMED':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/50'
      case 'PRINTING':
        return 'text-purple-400 bg-purple-400/20 border-purple-400/50'
      case 'SHIPPED':
        return 'text-green-400 bg-green-400/20 border-green-400/50'
      case 'DELIVERED':
        return 'text-green-500 bg-green-500/20 border-green-500/50'
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-400 bg-red-400/20 border-red-400/50'
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/50'
    }
  }

  if (status === 'loading' || loading) {
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

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="pt-16">
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Orders</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Track and manage your 3D printing orders.
              </p>
            </motion.div>

            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center text-gray-400 py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                  No orders found. Start a new print job today!
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                      onClick={() => toggleOrder(order.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${getStatusColor(order.status).split(' ')[1]}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="text-white font-semibold">Order #{order.id.slice(-8)}</p>
                          <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-white font-bold">${order.totalAmount.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        {expandedOrderId === order.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedOrderId === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-700 bg-gray-900/30"
                        >
                          <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Order Details</h4>
                                <div className="space-y-2">
                                  <p className="text-gray-300"><span className="text-gray-500">Full ID:</span> {order.id}</p>
                                  {order.fileUrl && (
                                    <div className="pt-2">
                                      <a
                                        href={order.fileUrl}
                                        className="inline-flex items-center text-blue-400 hover:text-blue-300"
                                        download
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download File
                                      </a>
                                    </div>
                                  )}
                                  {order.notes && (
                                    <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                                      <p className="text-gray-500 text-xs mb-1">Notes:</p>
                                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Tracking History</h4>
                                <div className="space-y-4 border-l-2 border-gray-700 pl-4">
                                  {order.tracking.map((track, idx) => (
                                    <div key={idx} className="relative">
                                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500"></div>
                                      <p className="text-white text-sm font-medium">{track.status}</p>
                                      <p className="text-gray-500 text-xs">{new Date(track.timestamp).toLocaleString()}</p>
                                      <p className="text-gray-400 text-sm mt-1">{track.description}</p>
                                    </div>
                                  ))}
                                  {order.tracking.length === 0 && (
                                    <p className="text-gray-500 italic">No tracking updates yet.</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {order.printJob && (
                              <div>
                                <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Print Job</h4>
                                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                  <div>
                                    <p className="text-white font-medium">{order.printJob.fileName}</p>
                                    <p className="text-gray-400 text-sm">Material: {order.printJob.materialName}</p>
                                  </div>
                                  <p className="text-white font-medium">${order.printJob.totalPrice.toFixed(2)}</p>
                                </div>
                              </div>
                            )}

                            {order.status === 'PENDING' && (
                              <div className="flex justify-end pt-4 border-t border-gray-700">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm('Are you sure you want to cancel this order?')) return;
                                    try {
                                      const res = await fetch(`/api/orders/${order.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'CANCELLED' })
                                      });
                                      if (res.ok) {
                                        fetchOrders();
                                      } else {
                                        const err = await res.json();
                                        alert(err.error || 'Failed to cancel');
                                      }
                                    } catch (err) {
                                      console.error(err);
                                      alert('Error cancelling order');
                                    }
                                  }}
                                  className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
                                >
                                  Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
