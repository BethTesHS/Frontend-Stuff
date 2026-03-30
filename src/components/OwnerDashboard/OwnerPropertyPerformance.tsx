import { useEffect, useState } from "react"
import { BarChart2, TrendingUp, Eye, Home, Flame, TrendingDown, Rocket, RepeatIcon, Lock } from "lucide-react"
import { impressionApi } from "@/services/api"

interface PropertyRow {
  property_id: string
  title: string
  price: number
  total_impressions: number
  repeated_viewers: number
}

function calcScore(row: PropertyRow): "hot" | "warn" | "rocket" | "neutral" {
  if (row.total_impressions >= 50) return "rocket"
  if (row.total_impressions >= 20) return "hot"
  if (row.total_impressions > 0) return "neutral"
  return "warn"
}

const scoreConfig = {
  hot: {
    icon: Flame,
    label: "Hot",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
    iconColor: "text-orange-500",
  },
  warn: {
    icon: TrendingDown,
    label: "Needs attention",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-600 dark:text-yellow-400",
    iconColor: "text-yellow-500",
  },
  rocket: {
    icon: Rocket,
    label: "Top performer",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    iconColor: "text-green-500",
  },
  neutral: {
    icon: TrendingUp,
    label: "Average",
    bg: "bg-gray-50 dark:bg-gray-800/50",
    text: "text-gray-500 dark:text-gray-400",
    iconColor: "text-gray-400",
  },
}

export function OwnerPropertyPerformance() {
  const [rows, setRows] = useState<PropertyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    impressionApi.getPerformance().then((res: any) => {
      if (res?.success && Array.isArray(res.data)) {
        setRows(res.data)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const total = rows.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.total_impressions,
      repeated: acc.repeated + r.repeated_viewers,
    }),
    { impressions: 0, repeated: 0 }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Property Performance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          See which listings are driving results and which need attention.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Eye size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Impressions</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {total.impressions.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <RepeatIcon size={20} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Repeated Viewers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {total.repeated.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2">
          <BarChart2 size={18} className="text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Impressions by Listing</h2>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Loading performance data…</div>
        )}

        {!loading && rows.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No impressions recorded yet. Once visitors view your listings, they will appear here.
          </div>
        )}

        {!loading && rows.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Property</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Price</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Impressions</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      <span className="flex items-center justify-end gap-1">
                        Repeated Viewers
                        <Lock size={11} className="text-gray-400" />
                      </span>
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((prop) => {
                    const score = calcScore(prop)
                    const cfg = scoreConfig[score]
                    const ScoreIcon = cfg.icon
                    return (
                      <tr key={prop.property_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Home size={15} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{prop.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                          £{prop.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                          {prop.total_impressions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs italic">
                            <Lock size={11} />
                            Switch to Pro
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <ScoreIcon size={12} className={cfg.iconColor} />
                            <span>{cfg.label}</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((prop) => {
                const score = calcScore(prop)
                const cfg = scoreConfig[score]
                const ScoreIcon = cfg.icon
                return (
                  <div key={prop.property_id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Home size={15} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{prop.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">£{prop.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        <ScoreIcon size={12} className={cfg.iconColor} />
                        <span>{cfg.label}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{prop.total_impressions.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                          <Lock size={10} /> Repeated Viewers
                        </p>
                        <p className="text-xs italic text-gray-400 dark:text-gray-500 mt-0.5">Switch to Pro</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pro upsell banner */}
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-5 flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex items-center gap-3">
          <Lock size={18} className="text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Unlock viewer details with Pro</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">See who viewed your listings, how often, and their contact details.</p>
          </div>
        </div>
        <button className="flex-shrink-0 text-xs font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          Switch to Pro
        </button>
      </div>
    </div>
  )
}
