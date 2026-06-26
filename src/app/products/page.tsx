'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ShoppingCart, Package, X, MessageCircle, ArrowRight, CheckCircle2, Search } from 'lucide-react'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { WhatsAppService } from '@/lib/whatsapp'

interface Product {
    id: string
    name: string
    description?: string
    price: number
    imageUrl?: string
    webpUrl?: string
    category?: string
    inStock: boolean
    stockCount: number
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    useEffect(() => {
        fetchProducts()
    }, [])

    // Modal UX: lock body scroll + close on Escape
    useEffect(() => {
        if (!selectedProduct) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedProduct(null)
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKey)
        }
    }, [selectedProduct])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/products')
            if (response.ok) {
                const data = await response.json() as Product[]
                setProducts(data.filter((p: Product) => p.inStock))
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    // Get all unique categories for the filter list (stable)
    const allCategories = ['All', ...Array.from(new Set(products.map(p => p.category || 'General')))]

    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase()
        const categoryMatch = selectedCategory === 'All' || (product.category || 'General') === selectedCategory
        const searchMatch = product.name.toLowerCase().includes(query) ||
            (product.category?.toLowerCase() || 'general').includes(query) ||
            (product.description?.toLowerCase() || '').includes(query)

        return categoryMatch && searchMatch
    })

    // Categories to display as groups (if 'All' is selected, show all; otherwise show just one)
    const displayCategories = selectedCategory === 'All'
        ? Array.from(new Set(filteredProducts.map(p => p.category || 'General')))
        : [selectedCategory].filter(cat => filteredProducts.some(p => (p.category || 'General') === cat))

    const handleWhatsAppInquiry = (product: Product) => {
        const message = `👋 Hello! I'm interested in the *${product.name}* from your collection.
        
💰 *Price:* $${product.price.toFixed(2)}
📂 *Category:* ${product.category || 'General'}
📝 *Ref:* ${product.id}

Could you please provide more information about this item?`

        WhatsAppService.sendWhatsAppMessage(message)
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />

            <main className="pt-24 pb-20">
                <section>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-5xl font-extrabold mb-4 text-gradient-bw">
                                    Our Collection
                                </h1>
                                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                    Explore high-quality, pre-made 3D printed models ready for your home or office.
                                </p>
                            </div>

                            {/* Search Bar */}
                            <div className="max-w-md mx-auto mb-16 relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search models, categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-900/40 border border-zinc-700 rounded-2xl focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition-all backdrop-blur-md text-white placeholder-zinc-500 shadow-xl"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Chips */}
                            {!loading && allCategories.length > 2 && (
                                <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto">
                                    {allCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${selectedCategory === cat
                                                ? 'bg-white border-white text-black shadow-lg shadow-white/20 scale-105'
                                                : 'bg-gray-900/40 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ProductCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                                    <Package className="w-20 h-20 text-gray-600 mx-auto mb-6 opacity-50" />
                                    <h2 className="text-2xl font-bold mb-2">No products found</h2>
                                    <p className="text-gray-400">Try adjusting your search criteria</p>
                                </div>
                            ) : (
                                <div className="space-y-20">
                                    {displayCategories.map((category) => (
                                        <div key={category} className="scroll-mt-32">
                                            <div className="flex items-center space-x-4 mb-8">
                                                <h2 className="text-3xl font-bold text-white whitespace-nowrap">
                                                    {category}
                                                </h2>
                                                <div className="h-px w-full bg-gradient-to-r from-white/40 to-transparent" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {filteredProducts
                                                    .filter(p => (p.category || 'General') === category)
                                                    .map((product) => (
                                                        <motion.div
                                                            key={product.id}
                                                            onClick={() => setSelectedProduct(product)}
                                                            initial={{ opacity: 0, y: 16 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true, margin: '-50px' }}
                                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                                            whileHover={{ y: -6 }}
                                                            className="group relative bg-zinc-900/40 rounded-3xl border border-zinc-800 overflow-hidden cursor-pointer hover:border-white/50 hover:bg-zinc-800/60 transition-colors duration-300 shadow-2xl backdrop-blur-md"
                                                        >
                                                            <div className="aspect-square relative overflow-hidden">
                                                                {product.imageUrl || product.webpUrl ? (
                                                                    <OptimizedImage
                                                                        src={product.imageUrl || product.webpUrl || ''}
                                                                        webpSrc={product.webpUrl}
                                                                        alt={product.name}
                                                                        fill
                                                                        className="transition-transform duration-700 group-hover:scale-110"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                                        <Package className="w-20 h-20 text-gray-700" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                                                            </div>

                                                            <div className="p-8">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <h3 className="text-2xl font-bold text-white group-hover:text-zinc-300 transition-colors">
                                                                        {product.name}
                                                                    </h3>
                                                                    <div className="text-2xl font-black text-white">
                                                                        ${product.price.toFixed(2)}
                                                                    </div>
                                                                </div>

                                                                <p className="text-gray-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
                                                                    {product.description || 'No description available for this item.'}
                                                                </p>

                                                                <div className="flex items-center text-sm font-medium text-white group-hover:translate-x-2 transition-transform duration-300">
                                                                    View Details <ArrowRight className="ml-2 w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                            </div>
                                        </div>
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
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={selectedProduct.name}
                    >
                        <div
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            className="relative w-full max-w-4xl bg-gray-900 rounded-3xl md:rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] overflow-y-auto"
                            initial={{ scale: 0.96, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.97, opacity: 0, y: 8 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                aria-label="Close"
                                className="absolute top-5 right-5 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Image Section */}
                            <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative shrink-0 bg-zinc-950">
                                {selectedProduct.imageUrl || selectedProduct.webpUrl ? (
                                    <OptimizedImage
                                        src={selectedProduct.imageUrl || selectedProduct.webpUrl || ''}
                                        webpSrc={selectedProduct.webpUrl}
                                        alt={selectedProduct.name}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[16rem] bg-gray-800 flex items-center justify-center">
                                        <Package className="w-20 md:w-32 h-20 md:h-32 text-gray-700" />
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <motion.div
                                className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-zinc-950 to-black"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                            >
                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <span className="px-4 py-1 bg-white/10 border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest">
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

                                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                                        {selectedProduct.name}
                                    </h2>

                                    <div className="text-3xl font-black text-white mb-8">
                                        ${selectedProduct.price.toFixed(2)}
                                    </div>

                                    <div className="max-w-none mb-10">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
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
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    )
}
