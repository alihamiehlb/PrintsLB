'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Upload, File, ShoppingBag, CheckCircle, CheckCircle2, AlertCircle, Settings, Info, X, Package, ArrowRight, MessageCircle, Clock } from 'lucide-react'
import { WhatsAppService } from '@/lib/whatsapp'
import { TurnstileWidget, TURNSTILE_ENABLED } from '@/components/turnstile-widget'

interface Material {
  id: string
  name: string
  color?: string
  pricePerGram: number
  available: boolean
}

export default function UploadPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Base state
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [isLargeFile, setIsLargeFile] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const [materials] = useState<Material[]>([
    { id: '1', name: 'PLA', color: 'White', pricePerGram: 0.025, available: true },
    { id: '2', name: 'PLA', color: 'Black', pricePerGram: 0.025, available: true },
    { id: '3', name: 'PETG', color: 'Transparent', pricePerGram: 0.030, available: true },
    { id: '4', name: 'TPU', color: 'Black', pricePerGram: 0.045, available: true },
  ])

  // Auto-scroll to success
  useEffect(() => {
    if (orderPlaced) {
      const element = document.getElementById('success-message')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [orderPlaced])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const uploadedFile = files[0]

    if (!uploadedFile.name.toLowerCase().endsWith('.stl')) {
      setError('Please upload an STL file')
      return
    }

    // Vercel Limit: 4.5MB
    const MAX_SIZE = 4.5 * 1024 * 1024
    if (uploadedFile.size > MAX_SIZE) {
      setError(`File is too large (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB). Max limit is 4.5 MB due to platform constraints.`)
      return
    }

    const isLarge = WhatsAppService.isLargeFile(uploadedFile)
    setIsLargeFile(isLarge)
    setError(null)
    setFile(uploadedFile)
    setWhatsappSent(false)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleOrder = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/upload')
      return
    }

    if (!file || !selectedMaterial || !phoneNumber) {
      setError('Please complete all fields (File, Material, and Phone)')
      return
    }

    setIsPlacingOrder(true)
    setError(null)

    try {
      // 1. Upload file (sends to Telegram)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userEmail', session.user.email || 'N/A')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) throw new Error('Upload failed')
      const { url: fileUrl } = await uploadResponse.json() as { url: string }

      // 2. Create DB Order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          materialName: selectedMaterial.name,
          totalPrice: 0, // Manual pricing later
          customerNotes,
          phoneNumber,
          fileUrl,
          turnstileToken,
        })
      })

      if (response.ok) {
        const { order } = await response.json() as { order: { id: string } }
        setOrderId(order.id)
        setOrderPlaced(true)

        // 3. Open WhatsApp (Initiate)
        WhatsAppService.sendOrderViaWhatsApp({
          orderId: order.id,
          fileName: file.name,
          material: selectedMaterial.name,
          totalPrice: 0,
          customerEmail: session.user.email || 'N/A',
          customerPhone: phoneNumber,
          notes: customerNotes,
          fileUrl: `${window.location.origin}${fileUrl}`
        })
        setWhatsappSent(true)

        // Longer delay to allow the popup to occur and user to see success
        setTimeout(() => router.push('/track'), 8000)
      } else {
        throw new Error('Order creation failed')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="px-4 py-8 md:px-12 md:py-12">
        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-8 text-center text-3xl font-bold text-white md:text-5xl">
            Place Your <span className="text-gradient">3D Print Order</span>
          </h1>

          {/* Step 1: File Upload */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
              <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Upload STL File
            </h2>
            <div
              className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragActive ? 'border-white bg-white/10' : 'border-zinc-700 bg-zinc-900/50'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`mx-auto mb-4 h-12 w-12 ${dragActive ? 'text-white' : 'text-gray-400'}`} />
              <p className="mb-2 font-medium text-white">{file ? file.name : 'Click or drag file here'}</p>
              <p className="mb-4 text-xs text-gray-400">STL files up to 4.5MB (Platform Limit)</p>

              <div className="flex flex-wrap justify-center gap-3">
                <label className="cursor-pointer rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors">
                  <input type="file" accept=".stl" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  {file ? 'Change File' : 'Select File'}
                </label>
                {file && (
                  <button onClick={() => setFile(null)} className="rounded-lg border border-red-500/50 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Step 2: Material */}
          {file && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mr-3 text-sm font-bold">2</span>
                Choose Material
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {materials.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedMaterial?.id === m.id ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-800/40 hover:border-zinc-600'
                      }`}
                  >
                    <p className="font-bold text-white">{m.name} <span className="text-xs font-normal text-gray-400">({m.color})</span></p>
                    <p className="text-xs text-zinc-400">Standard Pricing</p>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Step 3: Details */}
          {file && selectedMaterial && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mr-3 text-sm font-bold">3</span>
                Your Details
              </h2>
              <div className="space-y-4 rounded-2xl bg-gray-900/50 p-6 border border-gray-800">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:ring-2 focus:ring-white/40 focus:outline-none"
                    placeholder="e.g. +961 70 123 456"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Notes (Optional)</label>
                  <textarea
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white h-24"
                    placeholder="Infill, resolution, or special requests..."
                  />
                </div>
              </div>
            </motion.section>
          )}

          {/* Action */}
          {error && <p className="mb-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {error}</p>}

          {file && selectedMaterial && (
            <div className="space-y-4">
              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken('')}
              />
              <button
              onClick={handleOrder}
              disabled={isPlacingOrder || !phoneNumber || (TURNSTILE_ENABLED && !turnstileToken)}
              className="w-full rounded-xl bg-white py-4 font-bold text-black shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isPlacingOrder ? 'Processing...' : 'Place Order & Send via WhatsApp'}
            </button>
            </div>
          )}

          {/* Success UI */}
          <AnimatePresence>
            {orderPlaced && (
              <motion.div
                id="success-message"
                className="mt-8 rounded-3xl bg-gray-900/90 border-2 border-green-500/50 p-8 text-center backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="relative mx-auto mb-6 h-20 w-20">
                  <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20"></div>
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-green-500">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h2 className="mb-2 text-3xl font-bold text-white">Order Received!</h2>
                <p className="mb-6 text-gray-400">Order ID: <span className="font-mono text-white">{orderId}</span></p>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center text-green-400">
                    <Clock className="w-5 h-5 mr-2 animate-pulse" />
                    <span>{whatsappSent ? 'Opening WhatsApp for confirmation...' : 'Preparing confirmation...'}</span>
                  </div>

                  {!whatsappSent && (
                    <button
                      onClick={() => file && WhatsAppService.sendOrderViaWhatsApp({
                        orderId,
                        fileName: file.name,
                        material: selectedMaterial?.name || '',
                        totalPrice: 0,
                        customerEmail: session?.user?.email || 'N/A',
                        customerPhone: phoneNumber,
                        notes: customerNotes,
                        fileUrl: `/api/upload?filename=${orderId}` // Adjusted fallback
                      })}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/20"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Send via WhatsApp Now
                    </button>
                  )}

                  <button
                    onClick={() => router.push('/track')}
                    className="text-gray-400 hover:text-white text-sm underline underline-offset-4"
                  >
                    Skip to Tracking
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
