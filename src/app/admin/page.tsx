'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  Package, Users, DollarSign, Settings, Plus, Edit, X, TrendingUp,
  Clock, CheckCircle, AlertCircle, Download, Trash2, Truck
} from 'lucide-react'

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
  status: string
  createdAt: string
  userName: string
  customerNotes?: string
  fileUrl?: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'orders' | 'users'>('overview')
  const [materials, setMaterials] = useState<Material[]>([])
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProfit: 0
  })
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    color: '',
    pricePerGram: 0.025,
    available: true,
    printerType: 'FDM'
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
    }
  }, [session])

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

  const handleUpdateJobStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/print-jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        await fetchPrintJobs()
      }
    } catch (error) {
      console.error("Failed to update job status", error)
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
                  <Settings className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-400">PrintsLB Management</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'materials', label: 'Materials' },
                  { id: 'orders', label: 'Print Jobs' },
                  { id: 'users', label: 'Users' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {tab.label}
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
                      <h2 className="text-2xl font-bold text-white mb-6">Recent Print Jobs</h2>
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
                            <Package className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-white font-medium">Manage Print Jobs</p>
                              <p className="text-gray-400 text-sm">View and update print job status</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Materials Tab */}
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

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white mb-6">Print Jobs Management</h2>
                  <div className="space-y-4">
                    {printJobs.map((job) => (
                      <div key={job.id} className="border border-gray-800 rounded-lg p-6 bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{job.fileName}</h3>
                            <p className="text-gray-400">Customer: {job.userName}</p>
                            <p className="text-gray-400">Material: {job.materialName}</p>
                            <p className="text-gray-400">Order ID: {job.orderId}</p>
                            {job.customerNotes && (
                              <div className="mt-2 p-2 bg-gray-900 rounded text-sm">
                                <p className="text-gray-400 font-medium">Notes & Specs:</p>
                                <pre className="text-gray-400 whitespace-pre-wrap font-sans">{job.customerNotes}</pre>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">${job.totalPrice ? job.totalPrice.toFixed(2) : '0.00'}</p>
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
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                      try {
                                        const res = await fetch(`/api/admin/print-jobs?id=${job.id}`, {
                                          method: 'DELETE'
                                        })
                                        if (res.ok) {
                                          fetchPrintJobs()
                                        } else {
                                          alert('Failed to delete order')
                                        }
                                      } catch (err) {
                                        console.error(err)
                                        alert('Error deleting order')
                                      }
                                    }
                                  }}
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
                        <p className="text-gray-400">No print jobs found</p>
                      </div>
                    )}
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

      <Footer />
    </div>
  )
}
