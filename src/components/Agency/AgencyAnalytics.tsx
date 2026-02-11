import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2, 
  DollarSign,
  Target,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

export function AgencyAnalytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45000, properties: 12, viewings: 89 },
    { month: 'Feb', revenue: 52000, properties: 15, viewings: 103 },
    { month: 'Mar', revenue: 38000, properties: 9, viewings: 67 },
    { month: 'Apr', revenue: 61000, properties: 18, viewings: 128 },
    { month: 'May', revenue: 55000, properties: 16, viewings: 115 },
    { month: 'Jun', revenue: 67000, properties: 21, viewings: 142 },
  ];

  const propertyTypeData = [
    { name: 'Houses', value: 45, color: '#8B5CF6' },
    { name: 'Flats', value: 30, color: '#06B6D4' },
    { name: 'Commercial', value: 15, color: '#10B981' },
    { name: 'Others', value: 10, color: '#F59E0B' },
  ];

  const agentPerformanceData = [
    { name: 'Sarah Wilson', sales: 12, revenue: 240000 },
    { name: 'John Smith', sales: 8, revenue: 180000 },
    { name: 'Emma Davis', sales: 15, revenue: 320000 },
    { name: 'Mike Johnson', sales: 6, revenue: 125000 },
    { name: 'Lisa Brown', sales: 9, revenue: 195000 },
  ];

  const conversionData = [
    { stage: 'Inquiries', count: 450, color: '#8B5CF6' },
    { stage: 'Viewings', count: 280, color: '#06B6D4' },
    { stage: 'Offers', count: 120, color: '#10B981' },
    { stage: 'Sales', count: 45, color: '#F59E0B' },
  ];

  const marketTrendsData = [
    { month: 'Jan', avgPrice: 850000, listings: 45, sold: 32 },
    { month: 'Feb', avgPrice: 875000, listings: 52, sold: 38 },
    { month: 'Mar', avgPrice: 820000, listings: 38, sold: 28 },
    { month: 'Apr', avgPrice: 900000, listings: 61, sold: 45 },
    { month: 'May', avgPrice: 885000, listings: 55, sold: 41 },
    { month: 'Jun', avgPrice: 920000, listings: 67, sold: 48 },
  ];

  // KPI calculations
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProperties = revenueData.reduce((sum, item) => sum + item.properties, 0);
  const totalViewings = revenueData.reduce((sum, item) => sum + item.viewings, 0);
  const conversionRate = ((conversionData[3].count / conversionData[0].count) * 100).toFixed(1);

  const previousRevenue = 280000; // Mock previous period revenue
  const revenueGrowth = (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1);

  const exportData = () => {
    // Mock export functionality
    const csvContent = revenueData.map(row => 
      `${row.month},${row.revenue},${row.properties},${row.viewings}`
    ).join('\n');
    
    const blob = new Blob([`Month,Revenue,Properties,Viewings\n${csvContent}`], {
      type: 'text/csv;charset=utf-8;'
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'agency-analytics.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your agency's performance and insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">£{(totalRevenue / 1000).toFixed(0)}k</p>
                <div className="flex items-center mt-2">
                  {parseFloat(revenueGrowth) > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${parseFloat(revenueGrowth) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {revenueGrowth}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Properties Sold</p>
                <p className="text-2xl font-bold">{totalProperties}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Avg: {(totalProperties / revenueData.length).toFixed(1)}/month
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Viewings</p>
                <p className="text-2xl font-bold">{totalViewings}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Avg: {(totalViewings / revenueData.length).toFixed(0)}/month
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {conversionData[3].count} sales from {conversionData[0].count} inquiries
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`£${value.toLocaleString()}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Property Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Property Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value, name) => [
                  name === 'sales' ? `${value} sales` : `£${value.toLocaleString()}`,
                  name === 'sales' ? 'Sales' : 'Revenue'
                ]} />
                <Bar dataKey="sales" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Sales Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionData.map((stage, index) => {
                const percentage = index === 0 ? 100 : ((stage.count / conversionData[0].count) * 100).toFixed(1);
                const width = `${percentage}%`;
                
                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                        <Badge variant="outline">{stage.count}</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: width,
                          backgroundColor: stage.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={marketTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="listings" fill="#8B5CF6" name="New Listings" />
              <Bar yAxisId="left" dataKey="sold" fill="#10B981" name="Properties Sold" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avgPrice" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Average Price (£)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentPerformanceData
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((agent, index) => (
                <div key={agent.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">£{(agent.revenue / 1000).toFixed(0)}k</p>
                    <p className="text-sm text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
                <h4 className="font-medium text-green-800 dark:text-green-200">Revenue Growth</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Revenue increased by {revenueGrowth}% compared to last period, driven by luxury property sales.
                </p>
              </div>
              
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Market Opportunity</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Commercial properties show 25% higher profit margins than residential sales.
                </p>
              </div>
              
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Conversion Rate</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Current conversion rate of {conversionRate}% is above industry average of 8.5%.
                </p>
              </div>
              
              <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950">
                <h4 className="font-medium text-purple-800 dark:text-purple-200">Top Agent</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Emma Davis leads with £320k revenue and maintains the highest client satisfaction rate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}