import { BarChart2, TrendingUp, Eye, MessageSquare, Home, Flame, TrendingDown, Rocket } from "lucide-react"

interface PropertyRow {
  id: string
  name: string
  location: string
  views: number
  enquiries: number
  impressions: number
  score: "hot" | "warn" | "rocket" | "neutral"
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

const rows: PropertyRow[] = []

export function OwnerPropertyPerformance() {
  const total = { impressions: 0, views: 0, enquiries: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Property Performance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          See which listings are driving results and which need attention.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <TrendingUp size={20} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Views</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {total.views.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <MessageSquare size={20} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Enquiries</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {total.enquiries.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2">
          <BarChart2 size={18} className="text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Top Performing Properties</h2>
        </div>

        {rows.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No performance data available yet. Once your listings receive views and enquiries, they will appear here.
          </div>
        )}

        {rows.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Property</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Impressions</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Views</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Enquiries</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((prop) => {
                    const cfg = scoreConfig[prop.score]
                    const ScoreIcon = cfg.icon
                    return (
                      <tr key={prop.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Home size={15} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{prop.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{prop.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                          {prop.impressions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                          {prop.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                          {prop.enquiries}
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
                const cfg = scoreConfig[prop.score]
                const ScoreIcon = cfg.icon
                return (
                  <div key={prop.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Home size={15} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{prop.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{prop.location}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        <ScoreIcon size={12} className={cfg.iconColor} />
                        <span>{cfg.label}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{prop.impressions.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{prop.views.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enquiries</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{prop.enquiries}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
