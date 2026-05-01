'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Gear, Globe, Bell, CreditCard, Robot, ShieldCheck, HardDrive, FloppyDisk, CheckCircle, Warning } from '@phosphor-icons/react'

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await adminApi.get('/admin/settings')
      setSettings(res.data)
    } catch (err) {
      console.error("Failed to fetch settings", err)
      setMessage({ text: 'Failed to load settings from server.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key)
    setMessage({ text: '', type: '' })
    try {
      await adminApi.put(`/admin/settings/${key}`, { value })
      setMessage({ text: `Setting '${key}' updated successfully!`, type: 'success' })
      // Update local state without full refetch
      const newSettings = { ...settings };
      for(let cat in newSettings) {
        if(newSettings[cat][key] !== undefined) {
            newSettings[cat][key] = value;
        }
      }
      setSettings(newSettings);
    } catch (err: any) {
      console.error("Update failed", err)
      setMessage({ text: `Failed to update '${key}'.`, type: 'error' })
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading System Configuration...</p>
    </div>
  )

  const categories = [
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'plans', label: 'Plans & Pricing', icon: CreditCard },
    { id: 'ai', label: 'AI Configuration', icon: Robot },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">System Settings</h1>
        <p className="text-gray-500">Modify global parameters that affect the entire SkillSense platform.</p>
      </header>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
            message.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <Warning size={20} />}
            {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
            {categories.map(cat => {
                const Icon = cat.icon
                const isActive = activeTab === cat.id
                return (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all text-left group ${
                            isActive 
                            ? 'bg-brand-primary border-brand-primary text-black font-bold shadow-lg shadow-brand-primary/20' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                    >
                        <Icon size={24} className={isActive ? 'text-black' : 'text-gray-500 group-hover:text-brand-primary transition-colors'} />
                        <span>{cat.label}</span>
                    </button>
                )
            })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
            {settings && settings[activeTab] ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">{activeTab} Configuration</span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Live Updates</span>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        {Object.entries(settings[activeTab]).map(([key, value]: [string, any]) => (
                            <div key={key} className="space-y-3 group">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {key.replace(/_/g, ' ')}
                                    </label>
                                    {savingKey === key && (
                                        <span className="text-[10px] text-brand-primary font-bold animate-pulse">SAVING...</span>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            defaultValue={value}
                                            id={`input-${key}`}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-brand-primary focus:bg-white/[0.08] transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const el = document.getElementById(`input-${key}`) as HTMLInputElement
                                            handleUpdate(key, el.value)
                                        }}
                                        disabled={savingKey !== null}
                                        className="bg-brand-primary text-black p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-lg shadow-brand-primary/10"
                                        title="Save Change"
                                    >
                                        <FloppyDisk size={24} weight="fill" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center flex flex-col items-center gap-4 text-gray-500">
                    <Gear size={48} className="opacity-10 animate-spin-slow" />
                    <p>Select a category to modify system variables.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
