'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Shield, Flame, Droplets, Zap, Info, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const materials = [
    {
        name: 'PLA (Polylactic Acid)',
        tagline: 'The Beginner Friendly Standard',
        description: 'The most popular 3D printing material. Known for its ease of use, detail, and wide variety of colors. Made from renewable resources like corn starch.',
        properties: [
            { name: 'Durability', value: 3 },
            { name: 'Heat Resistance', value: 2 },
            { name: 'Flexibility', value: 1 },
            { name: 'Detail Accuracy', value: 5 }
        ],
        bestFor: ['Decorative models', 'Prototypes', 'Low-stress parts', 'Figures'],
        color: 'from-zinc-300 to-white',
        icon: Shield
    },
    {
        name: 'PETG (Polyethylene Terephthalate Glycol)',
        tagline: 'The Tough All-Rounder',
        description: 'A balance between PLA and ABS. Durable, weather-resistant, and relatively easy to print. Great for mechanical parts that need to last.',
        properties: [
            { name: 'Durability', value: 4 },
            { name: 'Heat Resistance', value: 4 },
            { name: 'Flexibility', value: 2 },
            { name: 'Detail Accuracy', value: 4 }
        ],
        bestFor: ['Mechanical parts', 'Outdoor use', 'Water-tight containers', 'Hooks/brackets'],
        color: 'from-zinc-500 to-zinc-300',
        icon: Zap
    },
    {
        name: 'TPU (Thermoplastic Polyurethane)',
        tagline: 'The Flexible Wonder',
        description: 'A rubber-like material that can be twisted and compressed. Extremely durable and impact resistant. Perfect for phone cases and shock absorbers.',
        properties: [
            { name: 'Durability', value: 5 },
            { name: 'Heat Resistance', value: 3 },
            { name: 'Flexibility', value: 5 },
            { name: 'Detail Accuracy', value: 3 }
        ],
        bestFor: ['Phone cases', 'Tires/wheels', 'Grommets', 'Shock absorbers'],
        color: 'from-zinc-400 to-zinc-200',
        icon: Droplets
    }
]

export default function MaterialGuide() {
    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="pt-24 pb-20">
                <section className="px-6 md:px-12 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Material <span className="text-gradient-bw">Guide</span></h1>
                        <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
                            Not sure which plastic to choose? We use high-quality filaments for every job.
                            Compare the properties and choose the right one for your model.
                        </p>
                    </motion.div>

                    {/* Material Cards */}
                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 mb-20">
                        {materials.map((mat, idx) => (
                            <motion.div
                                key={mat.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mat.color} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`}></div>

                                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${mat.color}`}>
                                    <mat.icon className="h-8 w-8 text-black" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{mat.name}</h3>
                                <p className={`text-sm font-semibold mb-4 bg-gradient-to-r ${mat.color} bg-clip-text text-transparent`}>{mat.tagline}</p>
                                <p className="text-zinc-400 mb-8 leading-relaxed">
                                    {mat.description}
                                </p>

                                {/* Rating bars */}
                                <div className="space-y-4 mb-8">
                                    {mat.properties.map(prop => (
                                        <div key={prop.name}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 uppercase tracking-wider">{prop.name}</span>
                                                <span className="text-gray-300">{prop.value}/5</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(prop.value / 5) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                                                    className={`h-full bg-gradient-to-r ${mat.color}`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Best Uses</p>
                                    <div className="flex flex-wrap gap-2">
                                        {mat.bestFor.map(use => (
                                            <span key={use} className="px-3 py-1 bg-gray-800/80 rounded-full text-xs text-gray-300 border border-gray-700">
                                                {use}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Comparison Table */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm"
                    >
                        <h2 className="text-2xl font-bold text-white mb-8">Quick Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="py-4 px-4 text-gray-400 font-medium">Factor</th>
                                        <th className="py-4 px-4 text-white font-bold">PLA</th>
                                        <th className="py-4 px-4 text-white font-bold">PETG</th>
                                        <th className="py-4 px-4 text-white font-bold">TPU</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    <tr>
                                        <td className="py-4 px-4 text-gray-400">Max Temp</td>
                                        <td className="py-4 px-4 text-gray-300">~60°C</td>
                                        <td className="py-4 px-4 text-gray-300">~80°C</td>
                                        <td className="py-4 px-4 text-gray-300">~80°C</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 text-gray-400">UV Resistance</td>
                                        <td className="py-4 px-4 text-gray-300">Low</td>
                                        <td className="py-4 px-4 text-gray-300">High</td>
                                        <td className="py-4 px-4 text-gray-300">Moderate</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 text-gray-400">Food Safety</td>
                                        <td className="py-4 px-4 text-gray-300">Medium (Bio)</td>
                                        <td className="py-4 px-4 text-gray-300">High</td>
                                        <td className="py-4 px-4 text-gray-300">Medium</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 text-gray-400">Surface Finish</td>
                                        <td className="py-4 px-4 text-gray-300">Matte/Glossy</td>
                                        <td className="py-4 px-4 text-gray-300">Glossy</td>
                                        <td className="py-4 px-4 text-gray-300">Rubber-like</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-20 text-center"
                    >
                        <div className="bg-zinc-900/40 border border-zinc-700 rounded-3xl p-12 inline-block max-w-4xl">
                            <h2 className="text-3xl font-bold text-white mb-4">Ready to choose your material?</h2>
                            <p className="text-gray-300 mb-8">Upload your STL and select your preferred material in the next step.</p>
                            <Link
                                href="/upload"
                                className="inline-flex items-center justify-center rounded-xl bg-white px-10 py-4 font-bold text-black shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-105"
                            >
                                Start Printing Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
