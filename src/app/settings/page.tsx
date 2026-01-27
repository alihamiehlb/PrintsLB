'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Settings, User, Bell, Lock, Palette } from 'lucide-react'

export default function SettingsPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy'>('profile')

    if (!session) {
        router.push('/auth/signin')
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/20">
            <Header />

            <main className="pt-16">
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

                        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                            <div className="flex border-b border-gray-700">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex-1 px-6 py-4 text-left ${activeTab === 'profile'
                                            ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <User className="w-5 h-5 inline mr-2" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`flex-1 px-6 py-4 text-left ${activeTab === 'notifications'
                                            ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Bell className="w-5 h-5 inline mr-2" />
                                    Notifications
                                </button>
                                <button
                                    onClick={() => setActiveTab('privacy')}
                                    className={`flex-1 px-6 py-4 text-left ${activeTab === 'privacy'
                                            ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Lock className="w-5 h-5 inline mr-2" />
                                    Privacy
                                </button>
                            </div>

                            <div className="p-8">
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                            <input
                                                type="text"
                                                defaultValue={session.user?.name || ''}
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                            <input
                                                type="email"
                                                defaultValue={session.user?.email || ''}
                                                disabled
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                                            />
                                        </div>
                                        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                            Save Changes
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="text-white font-medium">Order Updates</p>
                                                <p className="text-gray-400 text-sm">Get notified about your order status</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-5 h-5" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="text-white font-medium">Email Notifications</p>
                                                <p className="text-gray-400 text-sm">Receive email updates</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-5 h-5" />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'privacy' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-white font-medium mb-4">Change Password</h3>
                                            <div className="space-y-4">
                                                <input
                                                    type="password"
                                                    placeholder="Current Password"
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                />
                                                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                                    Update Password
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
