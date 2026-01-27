'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  Package, Users, DollarSign, Settings, Plus, Edit, X, TrendingUp,
  Clock, CheckCircle, AlertCircle, Download, Trash2, Truck, Upload, BarChart3, Image
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Material {
  id: string
  name: string
  description?: string
  color?: string
  pricePerGram: number
  available: boolean
  printerType: string
  createdAt: string
}

interface PrintJob {
  id: string
  orderId: string
  fileName: string
  materialName: string
  totalPrice: number
  baseCost: number
  profit: number
  status: string
  createdAt: string
  userName: string
  customerNotes?: string
  fileUrl?: string
  phoneNumber?: string
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category?: string
  inStock: boolean
  stockCount: number
}

interface User {
  id: string
  email: string
  name?: string
  role: string
  createdAt: string
  _count: {
    orders: number
    printJobs: number
  }
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'orders' | 'products' | 'users' | 'analytics'>('overview')

  // State
  const [materials, setMaterials] = useState<Material[]>([])
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProfit: 0
  })
  const [pricingSettings, setPricingSettings] = useState({
    taxRate: 0,
    serviceFee: 2.5,
    scaleMultiplier: 1.0
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Modals
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Forms
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    color: '',
    pricePerGram: 0.025,
    available: true,
    printerType: 'FDM'
  })

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    inStock: true,
    stockCount: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchStats()
      fetchMaterials()
      fetchPrintJobs()
      fetchProducts()
      fetchUsers()
      fetchPricingSettings()
    }
  }, [session])

  const fetchPricingSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setPricingSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch pricing settings:', error)
    }
  }

  const handleUpdateSettings = async () => {
    setIsSavingSettings(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingSettings)
      })
      if (response.ok) {
        alert('Settings updated successfully')
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('Failed to update settings')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/admin/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    }
  }

  const fetchPrintJobs = async () => {
    try {
      const response = await fetch('/api/admin/print-jobs')
      if (response.ok) {
        const data = await response.json()
        setPrintJobs(data)
      }
    } catch (error) {
      console.error('Failed to fetch print jobs:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleAddMaterial = async () => {
    try {
      const response = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      })

      if (response.ok) {
        await fetchMaterials()
        setShowAddMaterial(false)
        setNewMaterial({
          name: '',
          description: '',
          color: '',
          pricePerGram: 0.025,
          available: true,
          printerType: 'FDM'
        })
      }
    } catch (error) {
      console.error('Failed to add material:', error)
    }
  }

  const handleUpdateMaterial = async (material: Material) => {
    try {
      const response = await fetch(`/api/admin/materials/${material.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material)
      })

      if (response.ok) {
        await fetchMaterials()
        setEditingMaterial(null)
      }
    } catch (error) {
      console.error('Failed to update material:', error)
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      const response = await fetch(`/api/admin/materials/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMaterials()
      }
    } catch (error) {
      console.error('Failed to delete material:', error)
    }
  }

  const handleUpdateJobPrice = async (id: string, baseCost: number, totalPrice: number) => {
    try {
      const response = await fetch('/api/admin/print-jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, baseCost, totalPrice })
      })

      if (response.ok) {
        await Promise.all([fetchPrintJobs(), fetchStats()])
      }
    } catch (error) {
      console.error("Failed to update job price", error)
    }
  }

  const handleUpdateJobStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/print-jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        await Promise.all([fetchPrintJobs(), fetchStats()])
      }
    } catch (error) {
      console.error("Failed to update job status", error)
    }
  }

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      const res = await fetch(`/api/admin/print-jobs?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await Promise.all([fetchPrintJobs(), fetchStats()])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })

      if (response.ok) {
        await fetchProducts()
        setShowAddProduct(false)
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          imageUrl: '',
          category: '',
          inStock: true,
          stockCount: 0
        })
      }
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  const handleUpdateProduct = async (product: Product) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })

      if (response.ok) {
        await fetchProducts()
        setEditingProduct(null)
      }
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'VALIDATING':
        return <AlertCircle className="w-4 h-4 text-blue-400" />
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'PRINTING':
        return <Package className="w-4 h-4 text-purple-400" />
      case 'SHIPPED':
        return <Truck className="w-4 h-4 text-green-400" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'FAILED':
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  // Analytics data
  const orderStatusData = [
    { name: 'Pending', value: printJobs.filter(j => j.status === 'PENDING').length, color: '#FCD34D' },
    { name: 'Validating', value: printJobs.filter(j => j.status === 'VALIDATING').length, color: '#60A5FA' },
    { name: 'Printing', value: printJobs.filter(j => j.status === 'PRINTING').length, color: '#A78BFA' },
    { name: 'Shipped', value: printJobs.filter(j => j.status === 'SHIPPED').length, color: '#34D399' },
    { name: 'Delivered', value: printJobs.filter(j => j.status === 'DELIVERED').length, color: '#10B981' },
  ]

  const revenueData = printJobs.slice(0, 7).reverse().map((job, i) => ({
    name: `Day ${i + 1}`,
    revenue: job.totalPrice
  }))

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

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Profit',
      value: `$${(stats.totalProfit || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/20">
      <Header />

      <main className="pt-16">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push('/settings')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="General Settings"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                  <span className="text-gray-400">PrintsLB Management</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'materials', label: 'Materials', icon: Package },
                  { id: 'orders', label: 'Orders', icon: Truck },
                  { id: 'products', label: 'Products', icon: Image },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-md font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`}></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <stat.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                      <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
                      <div className="space-y-4">
                        {printJobs.slice(0, 5).map((job) => (
                          <div key={job.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{job.fileName}</p>
                              <p className="text-gray-400 text-sm">{job.userName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">${job.totalPrice.toFixed(2)}</p>
                              <div className="flex items-center justify-end space-x-2">
                                {getStatusIcon(job.status)}
                                <span className="text-gray-400 text-sm">{job.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                      <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                      <div className="space-y-4">
                        <button
                          onClick={() => setActiveTab('materials')}
                          className="w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-all duration-200 text-left group"
                        >
                          <div className="flex items-center space-x-4">
                            <Package className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-white font-medium">Manage Materials</p>
                              <p className="text-gray-400 text-sm">Add, edit, and remove materials</p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setActiveTab('orders')}
                          className="w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-all duration-200 text-left group"
                        >
                          <div className="flex items-center space-x-4">
                            <Truck className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-white font-medium">Manage Orders</p>
                              <p className="text-gray-400 text-sm">View and update order status</p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setActiveTab('products')}
                          className="w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-all duration-200 text-left group"
                        >
                          <div className="flex items-center space-x-4">
                            <Image className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-white font-medium">Manage Products</p>
                              <p className="text-gray-400 text-sm">Add pre-made products to collection</p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => router.push('/settings')}
                          className="w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-all duration-200 text-left group"
                        >
                          <div className="flex items-center space-x-4">
                            <Settings className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-white font-medium">Settings</p>
                              <p className="text-gray-400 text-sm">Configure your preferences</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Materials Tab - Keep existing implementation */}
              {activeTab === 'materials' && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Materials Management</h2>
                    <button
                      onClick={() => setShowAddMaterial(true)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Material
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400">Material</th>
                          <th className="text-left py-3 px-4 text-gray-400">Color</th>
                          <th className="text-left py-3 px-4 text-gray-400">Price/gram</th>
                          <th className="text-left py-3 px-4 text-gray-400">Available</th>
                          <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((material) => (
                          <tr key={material.id} className="border-b border-gray-800">
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-white font-medium">{material.name}</p>
                                {material.description && (
                                  <p className="text-gray-400 text-sm">{material.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{material.color || '-'}</td>
                            <td className="py-3 px-4 text-white">${material.pricePerGram.toFixed(3)}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${material.available
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                                }`}>
                                {material.available ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingMaterial(material)}
                                  className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMaterial(material.id)}
                                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders Tab - Keep existing with delete button */}
              {activeTab === 'orders' && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white mb-6">Orders Management</h2>
                  <div className="space-y-4">
                    {printJobs.map((job) => (
                      <div key={job.id} className="border border-gray-800 rounded-lg p-6 bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{job.fileName}</h3>
                            <p className="text-gray-400">Customer: {job.userName}</p>
                            <p className="text-gray-400">Material: {job.materialName}</p>
                            <p className="text-gray-400">Order ID: {job.orderId}</p>
                            <p className="text-blue-400 font-medium">WhatsApp: {job.phoneNumber}</p>
                            {job.customerNotes && (
                              <div className="mt-2 p-2 bg-gray-900 rounded text-sm">
                                <p className="text-gray-400 font-medium">Notes & Specs:</p>
                                <pre className="text-gray-400 whitespace-pre-wrap font-sans">{job.customerNotes}</pre>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col items-end gap-2 mb-4">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Cost ($)</label>
                                <input
                                  type="number"
                                  defaultValue={job.baseCost}
                                  onBlur={(e) => handleUpdateJobPrice(job.id, parseFloat(e.target.value), job.totalPrice)}
                                  className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                  placeholder="Cost"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Sell ($)</label>
                                <input
                                  type="number"
                                  defaultValue={job.totalPrice}
                                  onBlur={(e) => handleUpdateJobPrice(job.id, job.baseCost, parseFloat(e.target.value))}
                                  className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                  placeholder="Selling"
                                />
                              </div>
                              <p className="text-xs font-bold text-green-400">Profit: ${(job.totalPrice - job.baseCost).toFixed(2)}</p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 mt-2">
                              {getStatusIcon(job.status)}
                              <span className="text-gray-400">{job.status}</span>
                            </div>
                            <div className="flex flex-col items-end space-y-2 mt-3">
                              {job.fileUrl && (
                                <a
                                  href={job.fileUrl}
                                  download={job.fileName}
                                  className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download STL
                                </a>
                              )}

                              <div className="flex items-center gap-2">
                                <select
                                  value={job.status}
                                  onChange={(e) => handleUpdateJobStatus(job.id, e.target.value)}
                                  className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="VALIDATING">VALIDATING</option>
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PRINTING">PRINTING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="FAILED">FAILED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>

                                <button
                                  onClick={() => handleDeleteOrder(job.id)}
                                  className="p-1 text-red-400 hover:text-red-300 transition-colors bg-red-500/10 rounded hover:bg-red-500/20"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {printJobs.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No orders found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Products Tab - NEW */}
              {activeTab === 'products' && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Products Management</h2>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-800/50">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                        ) : (
                          <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                            <Image className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
                          {product.description && (
                            <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                          )}
                          {product.category && (
                            <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs mb-2">
                              {product.category}
                            </span>
                          )}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-white font-bold text-xl">${product.price.toFixed(2)}</span>
                            <span className={`text-sm ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                              {product.inStock ? `Stock: ${product.stockCount}` : 'Out of stock'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              <Edit className="w-4 h-4 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {products.length === 0 && (
                    <div className="text-center py-12">
                      <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No products found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab - NEW */}
              {activeTab === 'users' && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white mb-6">Users Management</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400">User</th>
                          <th className="text-left py-3 px-4 text-gray-400">Email</th>
                          <th className="text-left py-3 px-4 text-gray-400">Role</th>
                          <th className="text-left py-3 px-4 text-gray-400">Orders</th>
                          <th className="text-left py-3 px-4 text-gray-400">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-800">
                            <td className="py-3 px-4">
                              <p className="text-white font-medium">{user.name || 'No name'}</p>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white">{user._count.orders}</td>
                            <td className="py-3 px-4 text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {users.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No users found</p>
                    </div>
                  )}
                </div>
              )}


              {/* Analytics Tab - NEW */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                      <h3 className="text-xl font-bold text-white mb-6">Order Status Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                      <h3 className="text-xl font-bold text-white mb-6">Recent Revenue</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6">Key Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-400 text-sm mb-2">Average Order Value</p>
                        <p className="text-3xl font-bold text-white">
                          ${printJobs.length > 0 ? (printJobs.reduce((sum, j) => sum + j.totalPrice, 0) / printJobs.length).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="p-6 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-400 text-sm mb-2">Completion Rate</p>
                        <p className="text-3xl font-bold text-white">
                          {printJobs.length > 0 ? ((printJobs.filter(j => j.status === 'DELIVERED').length / printJobs.length) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                      <div className="p-6 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-400 text-sm mb-2">Active Orders</p>
                        <p className="text-3xl font-bold text-white">
                          {printJobs.filter(j => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(j.status)).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Add Material Modal */}
      <AnimatePresence>
        {showAddMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMaterial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Add New Material</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Material Name</label>
                  <input
                    type="text"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="e.g., PLA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                  <input
                    type="text"
                    value={newMaterial.color}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="e.g., White"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price per Gram ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newMaterial.pricePerGram}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, pricePerGram: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newMaterial.available}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, available: e.target.checked }))}
                    className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-400">Available</label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMaterial(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMaterial}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Material
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Material Modal */}
      <AnimatePresence>
        {editingMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingMaterial(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Edit Material</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Material Name</label>
                  <input
                    type="text"
                    value={editingMaterial.name}
                    onChange={(e) => setEditingMaterial(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                  <input
                    type="text"
                    value={editingMaterial.color || ''}
                    onChange={(e) => setEditingMaterial(prev => prev ? ({ ...prev, color: e.target.value }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price per Gram ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingMaterial.pricePerGram}
                    onChange={(e) => setEditingMaterial(prev => prev ? ({ ...prev, pricePerGram: parseFloat(e.target.value) }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={editingMaterial.description || ''}
                    onChange={(e) => setEditingMaterial(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingMaterial.available}
                    onChange={(e) => setEditingMaterial(prev => prev ? ({ ...prev, available: e.target.checked }) : null)}
                    className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-400">Available</label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingMaterial(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateMaterial(editingMaterial)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Update Material
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddProduct(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Add New Product</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="e.g., Phone Stand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    rows={3}
                    placeholder="Product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Paste image URL or upload to /public/uploads/products/</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="e.g., Accessories"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={newProduct.stockCount}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stockCount: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-400">In Stock</label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Edit Product</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, price: parseFloat(e.target.value) }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, imageUrl: e.target.value }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, stockCount: parseInt(e.target.value) }) : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct(prev => prev ? ({ ...prev, inStock: e.target.checked }) : null)}
                    className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-400">In Stock</label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateProduct(editingProduct)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Update Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
