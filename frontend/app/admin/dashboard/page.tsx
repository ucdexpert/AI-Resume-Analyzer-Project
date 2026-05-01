'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  AreaChart, Area
} from 'recharts'
import { Users, FileText, CreditCard, ChatText, TrendUp, Pulse, ChartLine, CurrencyDollar } from '@phosphor-icons/react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [charts, setCharts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [statsRes, chartsRes] = await Promise.all([
                adminApi.get('/admin/dashboard/stats'),
                adminApi.get('/admin/dashboard/charts')
            ])
            setStats(statsRes.data)
            setCharts(chartsRes.data)
        } catch (err) {
            console.error("Dashboard data fetch failed", err)
        } finally {
            setLoading(false)
        }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading Overview...</p>
    </div>
  )

  const statCards = [
    { label: 'Total Users', value: stats.total_users, change: `+${stats.new_users_today} today`, color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Users },
    { label: 'Analyses Done', value: stats.total_analyses, change: `${stats.analyses_today} today`, color: 'text-purple-400', bg: 'bg-purple-400/10', icon: FileText },
    { label: 'Total Revenue', value: `PKR ${stats.total_revenue?.toLocaleString()}`, change: `PKR ${stats.revenue_this_month?.toLocaleString()} this month`, color: 'text-green-400', bg: 'bg-green-400/10', icon: CurrencyDollar },
    { label: 'Open Tickets', value: stats.open_tickets, change: 'Requires attention', color: 'text-red-400', bg: 'bg-red-400/10', icon: ChatText },
  ]

  const secondaryStats = [
    { label: 'Paid Users', value: stats.paid_users, icon: TrendUp },
    { label: 'Active Today', value: stats.active_users_today, icon: Pulse },
    { label: 'API Usage', value: `${(stats.api_tokens_used_today / 1000).toFixed(1)}k tokens`, icon: ChartLine },
    { label: 'Free Users', value: stats.free_users, icon: Users },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">Admin Overview</h1>
        <p className="text-gray-500">Real-time statistics and platform health.</p>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group">
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} weight="duotone" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-gray-400 text-sm font-medium">{card.label}</div>
              <div className={`text-xs mt-3 font-bold uppercase tracking-wider ${card.color}`}>{card.change}</div>
            </div>
          )
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {secondaryStats.map(stat => {
            const Icon = stat.icon
            return (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="text-gray-500"><Icon size={20} /></div>
                    <div>
                        <div className="text-white font-bold">{stat.value}</div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{stat.label}</div>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signups Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold font-heading">User Growth</h3>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md font-bold uppercase tracking-widest">30 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.signups}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold font-heading">Revenue Stream</h3>
            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-md font-bold uppercase tracking-widest">Daily Revenue</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={10}
                    tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#22c55e' }}
                />
                <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
