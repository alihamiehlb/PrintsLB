'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ShoppingCart, Package } from 'lucide-react'

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
                            <h1 className="text-4xl font-bold text-white mb-4">Pre-Made Products</h1>
                            <p className="text-gray-400 mb-12">Browse our collection of ready-to-ship 3D printed products</p>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="text-white">Loading products...</div>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No products available yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {products.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-300"
                                        >
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-64 object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                                                    <Package className="w-16 h-16 text-gray-500" />
                                                </div>
                                            )}

                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                                                )}
                                                {product.category && (
                                                    <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs mb-4">
                                                        {product.category}
                                                    </span>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-bold text-white">${product.price.toFixed(2)}</span>
                                                    <span className="text-gray-400 text-sm">
                                                        {product.stockCount > 0 ? `${product.stockCount} in stock` : 'In stock'}
                                                    </span>
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

            <Footer />
        </div>
    )
}
