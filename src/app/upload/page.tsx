'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Upload, File, DollarSign, Clock, Weight, CheckCircle, AlertCircle, Settings, Info, X, Calculator, Package, ArrowRight, MessageCircle } from 'lucide-react'
import { STLAnalyzer } from '@/lib/stl-analyzer'
import { WhatsAppService } from '@/lib/whatsapp'

interface Material {
  id: string
  name: string
  color?: string
  pricePerGram: number
  available: boolean
}

interface CostCalculation {
  materialUsed: number
  printTime: number
  baseCost: number
  profit: number
  totalPrice: number
  volume: number
  infillPercentage: number
  layerHeight: number
  materialDensity: number
  boundingBox: {
    width: number
    height: number
    depth: number
  }
  triangleCount: number
}

interface PrintSettings {
  infillPercentage: number
  layerHeight: number
  printSpeed: number
  supportEnabled: boolean
  quality: 'draft' | 'standard' | 'high'
}

export default function UploadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculation, setCalculation] = useState<CostCalculation | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    infillPercentage: 20,
    layerHeight: 0.2,
    printSpeed: 50,
    supportEnabled: false,
    quality: 'standard'
  })
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [isLargeFile, setIsLargeFile] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)
  const [customerNotes, setCustomerNotes] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([
    { id: '1', name: 'PLA', color: 'White', pricePerGram: 0.025, available: true },
    { id: '2', name: 'PLA', color: 'Black', pricePerGram: 0.025, available: true },
    { id: '3', name: 'PETG', color: 'Transparent', pricePerGram: 0.030, available: true },
    { id: '4', name: 'TPU', color: 'Black', pricePerGram: 0.045, available: true },
  ])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const uploadedFile = files[0]

    // Check if file is STL
    if (!uploadedFile.name.toLowerCase().endsWith('.stl')) {
      setError('Please upload an STL file')
      return
    }

    // Check file size
    const isLarge = WhatsAppService.isLargeFile(uploadedFile)
    setIsLargeFile(isLarge)

    if (isLarge) {
      setError(`File is too large (${WhatsAppService.formatFileSize(uploadedFile.size)}). Maximum size is 50MB. You'll be redirected to WhatsApp for large file handling.`)
    } else {
      setError(null)
    }

    setFile(uploadedFile)
    setCalculation(null)
    setWhatsappSent(false)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const calculateCost = async () => {
    if (!file || !selectedMaterial) return

    setIsCalculating(true)
    setError(null)

    try {
      // Fetch pricing config from admin settings
      let pricingConfig = {
        sizeMultiplier: 1.0,
        taxPercentage: 0.0,
        baseFee: 0.0
      }

      try {
        const configResponse = await fetch('/api/pricing-config')
        if (configResponse.ok) {
          const config = await configResponse.json()
          if (config) {
            pricingConfig = config
          }
        }
      } catch (err) {
        console.log('Using default pricing config')
      }

      // Use accurate STL analysis
      const analysis = await STLAnalyzer.analyzeFile(file)

      // Material densities (g/cm³)
      const materialDensities = {
        'PLA': 1.24,
        'PETG': 1.27,
        'TPU': 1.20
      }

      const materialDensity = materialDensities[selectedMaterial.name as keyof typeof materialDensities] || 1.24

      // Calculate material usage with advanced settings
      const usage = STLAnalyzer.calculateMaterialUsage(
        analysis,
        printSettings.infillPercentage,
        printSettings.layerHeight,
        materialDensity
      )

      // Calculate bounding box dimensions
      const boundingBox = {
        width: Math.abs(analysis.boundingBox.max.x - analysis.boundingBox.min.x),
        height: Math.abs(analysis.boundingBox.max.y - analysis.boundingBox.min.y),
        depth: Math.abs(analysis.boundingBox.max.z - analysis.boundingBox.min.z)
      }

      // Calculate size factor (volume-based multiplier)
      const volume = boundingBox.width * boundingBox.height * boundingBox.depth
      const sizeFactor = Math.max(1.0, Math.min(2.0, 1.0 + (volume / 100000) * pricingConfig.sizeMultiplier))

      // Quality multiplier for pricing
      const qualityMultipliers = {
        'draft': 0.8,
        'standard': 1.0,
        'high': 1.3
      }

      const qualityMultiplier = qualityMultipliers[printSettings.quality]

      // Support material estimation (10% extra if enabled)
      const supportMultiplier = printSettings.supportEnabled ? 1.1 : 1.0

      // Final calculations with size factor
      const adjustedWeight = usage.weight * supportMultiplier * qualityMultiplier
      const baseCost = adjustedWeight * selectedMaterial.pricePerGram * sizeFactor
      const profit = 2.50
      const subtotal = baseCost + profit + pricingConfig.baseFee
      const tax = subtotal * (pricingConfig.taxPercentage / 100)
      const totalPrice = subtotal + tax

      // Advanced print time calculation
      const adjustedPrintTime = usage.printTime * qualityMultiplier * (printSettings.supportEnabled ? 1.2 : 1.0)

      setCalculation({
        materialUsed: adjustedWeight,
        printTime: adjustedPrintTime,
        baseCost: Math.round(baseCost * 100) / 100,
        profit: profit,
        totalPrice: Math.round(totalPrice * 100) / 100,
        volume: usage.volume,
        infillPercentage: printSettings.infillPercentage,
        layerHeight: printSettings.layerHeight,
        materialDensity: materialDensity,
        boundingBox,
        triangleCount: analysis.triangleCount
      })
    } catch (error) {
      console.error('STL Analysis Error:', error)
      setError('Failed to analyze STL file. Please ensure it\'s a valid STL file.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleOrder = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/upload')
      return
    }

    if (isLargeFile && file) {
      // Send WhatsApp notification for large file
      WhatsAppService.sendLargeFileNotification(file, session.user.email || undefined, customerNotes)
      setWhatsappSent(true)
      return
    }

    if (!file || !selectedMaterial || !calculation || !phoneNumber) {
      setError('Please complete all required fields, including phone number.')
      return
    }

    setIsPlacingOrder(true)
    setError(null)

    try {
      // 1. Upload file first
      const formData = new FormData()
      formData.append('file', file)
      // We don't have an orderId yet, but the API handles it (optional or temp)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('File upload failed')
      }

      const uploadResult = await uploadResponse.json()
      const fileUrl = uploadResult.url

      // 2. Create Order with fileUrl
      const orderData = {
        fileName: file.name,
        fileSize: file.size,
        materialName: selectedMaterial.name,
        materialPrice: selectedMaterial.pricePerGram,
        totalPrice: calculation.totalPrice,
        customerNotes,
        phoneNumber,
        printSettings,
        materialUsed: calculation.materialUsed,
        fileUrl: fileUrl
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        setOrderId(result.order.id)
        setOrderPlaced(true)
        setIsPlacingOrder(false)

        // Redirect after delay
        setTimeout(() => {
          router.push('/track')
        }, 2000)

        // Reset form
        setFile(null)
        setCalculation(null)
        setSelectedMaterial(null)
        setCustomerNotes('')
        setPhoneNumber('')
      } else {
        const errData = await response.json()
        setError(errData.error || 'Failed to place order. Please try again.')
      }
    } catch (error: any) {
      console.error('Order placement error:', error)
      setError('An error occurred while placing your order: ' + error.message)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const sendToWhatsApp = () => {
    if (!file) return

    WhatsAppService.sendLargeFileNotification(file, session?.user?.email || undefined)
    setWhatsappSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/20">
      <Header />

      <div className="px-6 py-12 md:px-12">
        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-8 text-center text-4xl font-bold text-white md:text-5xl">
            Upload Your <span className="text-gradient">STL File</span>
          </h1>

          {/* File Upload Area */}
          <motion.div
            className={`mb-8 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 bg-gray-900/50'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
          >
            <Upload className={`mx-auto mb-4 h-16 w-16 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className="mb-2 text-lg font-semibold text-white">
              {file ? file.name : 'Drop your STL file here or click to browse'}
            </p>
            <p className="mb-4 text-gray-400">
              Maximum file size: 50MB
            </p>
            <input
              type="file"
              accept=".stl"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Upload className="mr-2 h-5 w-5" />
              Choose File
            </label>

            {file && (
              <button
                onClick={() => {
                  setFile(null)
                  setCalculation(null)
                }}
                className="ml-4 inline-flex items-center justify-center rounded-lg border border-red-500 bg-red-500/20 px-6 py-3 font-semibold text-red-400 hover:bg-red-500/30 transition-all duration-300"
              >
                <X className="mr-2 h-5 w-5" />
                Remove
              </button>
            )}
          </motion.div>

          {error && (
            <motion.div
              className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Large File WhatsApp Section */}
          {file && isLargeFile && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-2xl border border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6">
                <div className="flex items-center mb-4">
                  <MessageCircle className="w-6 h-6 text-orange-400 mr-3" />
                  <h2 className="text-2xl font-semibold text-white">Large File Detected</h2>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 mb-2">
                    Your file ({WhatsAppService.formatFileSize(file.size)}) exceeds the 50MB limit for automatic processing.
                  </p>
                  <p className="text-gray-300">
                    Click the button below to send your file details directly to our WhatsApp for manual processing and custom pricing.
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-white mb-2">File Information:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <p className="text-white font-medium">{file.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Size:</span>
                      <p className="text-white font-medium">{WhatsAppService.formatFileSize(file.size)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <p className="text-white font-medium">{file.type || 'STL File'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className="text-orange-400 font-medium">Requires Manual Processing</p>
                    </div>
                  </div>
                </div>

                {!whatsappSent ? (
                  <button
                    onClick={sendToWhatsApp}
                    className="w-full flex items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Send to WhatsApp
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                ) : (
                  <div className="w-full rounded-lg border border-green-500 bg-green-500/10 p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold">WhatsApp Opened!</p>
                    <p className="text-green-300 text-sm mt-1">
                      Your file details have been sent. We'll contact you soon with custom pricing.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Material Selection - Only for small files */}
          {file && !isLargeFile && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-4 text-2xl font-semibold text-white">Select Material</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {materials.map((material) => (
                  <motion.div
                    key={material.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-all duration-300 ${selectedMaterial?.id === material.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                      }`}
                    onClick={() => material.available && setSelectedMaterial(material)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {material.name} {material.color && `(${material.color})`}
                        </h3>
                        <p className="text-sm text-gray-400">
                          ${material.pricePerGram.toFixed(3)}/gram
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${material.available
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                        }`}>
                        {material.available ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Advanced Print Settings */}
          {file && selectedMaterial && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-white">Print Settings</h2>
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>{showAdvancedSettings ? 'Simple' : 'Advanced'}</span>
                </button>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Quality Preset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Print Quality
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['draft', 'standard', 'high'] as const).map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setPrintSettings(prev => ({ ...prev, quality }))}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${printSettings.quality === quality
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                          {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Infill Percentage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Infill: {printSettings.infillPercentage}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={printSettings.infillPercentage}
                      onChange={(e) => setPrintSettings(prev => ({
                        ...prev,
                        infillPercentage: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {showAdvancedSettings && (
                    <>
                      {/* Layer Height */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Layer Height: {printSettings.layerHeight}mm
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="0.3"
                          step="0.05"
                          value={printSettings.layerHeight}
                          onChange={(e) => setPrintSettings(prev => ({
                            ...prev,
                            layerHeight: parseFloat(e.target.value)
                          }))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0.1mm (Fine)</span>
                          <span>0.3mm (Fast)</span>
                        </div>
                      </div>

                      {/* Print Speed */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Print Speed: {printSettings.printSpeed}mm/s
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="10"
                          value={printSettings.printSpeed}
                          onChange={(e) => setPrintSettings(prev => ({
                            ...prev,
                            printSpeed: parseInt(e.target.value)
                          }))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>20mm/s</span>
                          <span>100mm/s</span>
                        </div>
                      </div>

                      {/* Support */}
                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={printSettings.supportEnabled}
                            onChange={(e) => setPrintSettings(prev => ({
                              ...prev,
                              supportEnabled: e.target.checked
                            }))}
                            className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-400">
                            Enable Support Material (+10% material cost)
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                {/* Settings Info */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-300">
                      <p className="font-medium mb-1">How these settings affect pricing:</p>
                      <ul className="text-xs space-y-1 text-blue-200">
                        <li>• Higher quality = 30% more material and time</li>
                        <li>• More infill = more material usage</li>
                        <li>• Thinner layers = longer print time</li>
                        <li>• Support material adds 10% to material cost</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customer Notes & Phone Section */}
          {file && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="mb-4 text-2xl font-semibold text-white">Order Details</h2>
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="+961 70 123 456"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    We'll contact you here for order confirmation.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Customer Notes (Optional)
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={4}
                    placeholder="Add any special instructions, requirements, or notes about your print job..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Calculate Button */}
          {file && selectedMaterial && (
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={calculateCost}
                disabled={isCalculating}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-5 w-5" />
                    Calculate Cost
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Cost Calculation Results */}
          {calculation && (
            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="mb-6 text-2xl font-semibold text-white">📊 Detailed Cost Analysis</h2>

              {/* STL File Analysis */}
              <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-blue-400" />
                  STL File Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Volume:</span>
                    <p className="text-white font-medium">{calculation.volume.toFixed(1)} cm³</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Triangles:</span>
                    <p className="text-white font-medium">{calculation.triangleCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Dimensions:</span>
                    <p className="text-white font-medium">
                      {calculation.boundingBox.width.toFixed(0)}×{calculation.boundingBox.height.toFixed(0)}×{calculation.boundingBox.depth.toFixed(0)}mm
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Material Density:</span>
                    <p className="text-white font-medium">{calculation.materialDensity} g/cm³</p>
                  </div>
                </div>
              </div>

              {/* Print Settings Applied */}
              <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Print Settings Applied
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Quality:</span>
                    <p className="text-white font-medium capitalize">{printSettings.quality}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Infill:</span>
                    <p className="text-white font-medium">{calculation.infillPercentage}%</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Layer Height:</span>
                    <p className="text-white font-medium">{calculation.layerHeight}mm</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Support:</span>
                    <p className="text-white font-medium">{printSettings.supportEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Weight className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-gray-400">Material Used</span>
                    </div>
                    <span className="font-semibold text-white">{calculation.materialUsed.toFixed(1)}g</span>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-green-400" />
                      <span className="text-gray-400">Print Time</span>
                    </div>
                    <span className="font-semibold text-white">{Math.round(calculation.printTime)} min</span>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-yellow-400" />
                      <span className="text-gray-400">Material Cost</span>
                    </div>
                    <span className="font-semibold text-white">${calculation.baseCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-gray-400">Service Fee</span>
                    </div>
                    <span className="font-semibold text-white">${calculation.profit.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6 rounded-lg border-2 border-blue-500 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-semibold text-white">Total Price</span>
                    <p className="text-sm text-gray-400 mt-1">Includes material cost + $2.50 service fee</p>
                  </div>
                  <span className="text-3xl font-bold text-gradient">${calculation.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Cost Per Hour */}
              <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Effective Cost per Hour:</span>
                  <span className="font-medium text-white">
                    ${((calculation.totalPrice / calculation.printTime) * 60).toFixed(2)}/hour
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleOrder}
                  disabled={isPlacingOrder}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : orderPlaced ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Success! Redirecting...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-5 w-5" />
                      Place Order
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>

                {!session && (
                  <p className="mt-2 text-sm text-gray-400">
                    You'll need to sign in to place your order
                  </p>
                )}
              </div>

              {/* Order Success Message */}
              {orderPlaced && orderId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6"
                >
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Order Placed Successfully!</h3>
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-400 mb-1">Your Order ID:</p>
                      <p className="text-xl font-mono font-bold text-green-400">{orderId}</p>
                    </div>
                    <p className="text-gray-300 mb-6">
                      Save this order ID to track your order status. You can also find it in your dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push(`/track?order=${orderId}`)}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        Track Order
                      </button>
                      <button
                        onClick={() => {
                          setOrderPlaced(false)
                          setOrderId('')
                        }}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        Place Another Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
