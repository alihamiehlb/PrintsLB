'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ShoppingCart, Package, X, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { WhatsAppService } from '@/lib/whatsapp'

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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/products')
            if (response.ok) {
                const data = await response.json()
                setProducts(data.filter((p: Product) => p.inStock))
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleWhatsAppInquiry = (product: Product) => {
        const message = `👋 Hello! I'm interested in the *${product.name}* from your collection.
        
💰 *Price:* $${product.price.toFixed(2)}
📂 *Category:* ${product.category || 'General'}
📝 *Ref:* ${product.id}

Could you please provide more information about this item?`

        WhatsAppService.sendWhatsAppMessage(message)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/20 text-white">
            <Header />

            <main className="pt-24 pb-20">
                <section>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="text-center mb-16">
                                <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                                    Our Collection
                                </h1>
                                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                    Explore high-quality, pre-made 3D printed models ready for your home or office.
                                </p>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-400 animate-pulse">Loading amazing products...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                                    <Package className="w-20 h-20 text-gray-600 mx-auto mb-6 opacity-50" />
                                    <h2 className="text-2xl font-bold mb-2">Collection is sparse</h2>
                                    <p className="text-gray-400">Check back soon for new arrivals!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {products.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            layoutId={`product-${product.id}`}
                                            onClick={() => setSelectedProduct(product)}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            className="group relative bg-gray-900/40 rounded-3xl border border-gray-800 overflow-hidden cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/60 transition-all duration-500 shadow-2xl backdrop-blur-md"
                                        >
                                            <div className="aspect-square relative overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                        <Package className="w-20 h-20 text-gray-700" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

                                                {product.category && (
                                                    <div className="absolute top-4 left-4">
                                                        <span className="px-4 py-1.5 bg-blue-600/90 backdrop-blur-md text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <div className="text-2xl font-black text-blue-400">
                                                        ${product.price.toFixed(2)}
                                                    </div>
                                                </div>

                                                <p className="text-gray-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
                                                    {product.description || 'No description available for this item.'}
                                                </p>

                                                <div className="flex items-center text-sm font-medium text-blue-400 group-hover:translate-x-2 transition-transform duration-300">
                                                    View Details <ArrowRight className="ml-2 w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Product Details Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            layoutId={`product-${selectedProduct.id}`}
                            className="relative w-full max-w-4xl bg-gray-900 rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col md:flex-row"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-6 right-6 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Image Section */}
                            <div className="w-full md:w-1/2 h-80 md:h-auto relative">
                                {selectedProduct.imageUrl ? (
                                    <img
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <Package className="w-32 h-32 text-gray-700" />
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-gradient-to-br from-gray-900 to-gray-800">
                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <span className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest">
                                            {selectedProduct.category || 'Collection'}
                                        </span>
                                        {selectedProduct.stockCount > 0 ? (
                                            <span className="flex items-center text-xs text-green-400 font-medium">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> In Stock
                                            </span>
                                        ) : (
                                            <span className="text-xs text-orange-400 font-medium">Made to order</span>
                                        )}
                                    </div>

                                    <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                                        {selectedProduct.name}
                                    </h2>

                                    <div className="text-3xl font-black text-blue-400 mb-8 flex items-end">
                                        ${selectedProduct.price.toFixed(2)}
                                        <span className="text-sm font-normal text-gray-500 ml-2 mb-1.5">Free Lebanon Shipping</span>
                                    </div>

                                    <div className="prose prose-invert max-w-none mb-10">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                                        <p className="text-gray-300 leading-relaxed">
                                            {selectedProduct.description || 'This premium 3D printed model is crafted with precision and high-quality materials. Perfect for collectors, décor, or functional use.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleWhatsAppInquiry(selectedProduct)}
                                        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-5 px-8 rounded-2xl shadow-xl shadow-green-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <MessageCircle className="w-6 h-6" />
                                        <span>Order via WhatsApp</span>
                                    </button>

                                    <p className="text-center text-xs text-gray-500">
                                        Secure payment upon delivery or OMT. Ships within 2-3 business days.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    )
}
