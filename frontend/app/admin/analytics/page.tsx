'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { ChartBar, Target, Trophy, FileText, Cpu } from '@phosphor-icons/react'

const COLORS = ['#00E5FF', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null)
  const [apiUsage, setApiUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [overviewRes, apiRes] = await Promise.all([
                adminApi.get('/admin/analytics/overview'),
                adminApi.get('/admin/analytics/api-usage')
            ])
            setData(overviewRes.data)
            setApiUsage(apiRes.data)
        } catch (err) {
            console.error("Analytics data fetch failed", err)
        } finally {
            setLoading(false)
        }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Generating Reports...</p>
    </div>
  )

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">Advanced Analytics</h1>
        <p className="text-gray-500">Deep dive into platform performance and user behavior.</p>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                    <Trophy size={24} weight="duotone" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{data.avg_score}</div>
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-widest">Avg Overall Score</div>
                </div>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full transition-all duration-1000" style={{ width: `${data.avg_score}%` }}></div>
            </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center">
                    <Target size={24} weight="duotone" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{data.avg_ats_score}</div>
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-widest">Avg ATS Match</div>
                </div>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${data.avg_ats_score}%` }}></div>
            </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                    <FileText size={24} weight="duotone" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{data.total_resumes}</div>
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-widest">Total Resumes Parsed</div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold font-heading mb-6">Score Distribution</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.score_distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="range"
                        >
                            {data.score_distribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold font-heading mb-6">Subscription Plans</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.plan_distribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" stroke="#475569" fontSize={10} />
                        <YAxis dataKey="plan" type="category" stroke="#475569" fontSize={10} width={80} />
                        <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* AI Usage */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
            <Cpu size={24} className="text-brand-primary" />
            <h3 className="text-white font-bold font-heading">AI Token Usage (Groq Llama 3.3)</h3>
        </div>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apiUsage?.daily_tokens}>
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
                        itemStyle={{ color: '#00E5FF' }}
                    />
                    <Bar dataKey="tokens" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
