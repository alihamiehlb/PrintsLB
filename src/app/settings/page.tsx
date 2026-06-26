'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Settings, User, Bell, Lock, Palette } from 'lucide-react'

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy'>('profile')
    const [name, setName] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Initialize name when session becomes available
    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name)
        }
    }, [session])

    if (status === 'loading') {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
    }

    if (!session) {
        router.push('/auth/signin')
        return null
    }

    const handleUpdateProfile = async () => {
        setLoading(true)
        setMessage({ type: '', text: '' })
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
            } else {
                const data = await res.json() as { error?: string }
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
            }
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: 'An error occurred' })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (!newPassword) return
        setLoading(true)
        setMessage({ type: '', text: '' })
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            })
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully!' })
                setNewPassword('')
                setCurrentPassword('')
            } else {
                const data = await res.json() as { error?: string }
                setMessage({ type: 'error', text: data.error || 'Failed to update password' })
            }
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: 'An error occurred' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="pt-16">
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                            <div className="flex border-b border-gray-700">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex-1 px-6 py-4 text-left ${activeTab === 'profile'
                                        ? 'bg-white/10 text-white border-b-2 border-white'
                                        : 'text-gray-400 hover:text-white transition-all'
                                        }`}
                                >
                                    <User className="w-5 h-5 inline mr-2" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`flex-1 px-6 py-4 text-left ${activeTab === 'notifications'
                                        ? 'bg-white/10 text-white border-b-2 border-white'
                                        : 'text-gray-400 hover:text-white transition-all'
                                        }`}
                                >
                                    <Bell className="w-5 h-5 inline mr-2" />
                                    Notifications
                                </button>
                                <button
                                    onClick={() => setActiveTab('privacy')}
                                    className={`flex-1 px-6 py-4 text-left ${activeTab === 'privacy'
                                        ? 'bg-white/10 text-white border-b-2 border-white'
                                        : 'text-gray-400 hover:text-white transition-all'
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
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={session.user?.email || ''}
                                                disabled
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={loading}
                                            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-all font-semibold"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
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
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                />
                                                <button
                                                    onClick={handleUpdatePassword}
                                                    disabled={loading || !newPassword}
                                                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-all font-semibold"
                                                >
                                                    {loading ? 'Updating...' : 'Update Password'}
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
