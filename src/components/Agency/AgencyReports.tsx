import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Search,
  Eye,
  Share2,
  Trash2,
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Report {
  id: string;
  name: string;
  type: 'sales' | 'performance' | 'financial' | 'market' | 'custom';
  description: string;
  createdDate: Date;
  lastGenerated?: Date;
  status: 'ready' | 'generating' | 'scheduled' | 'error';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  size: string;
  downloadCount: number;
  isScheduled: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: Report['type'];
  description: string;
  icon: any;
  color: string;
  metrics: string[];
}

export function AgencyReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales-performance',
      name: 'Sales Performance Report',
      type: 'sales',
      description: 'Comprehensive analysis of sales metrics, revenue, and property transactions',
      icon: TrendingUp,
      color: 'text-green-500',
      metrics: ['Total Revenue', 'Properties Sold', 'Average Sale Price', 'Commission Earned', 'Monthly Trends']
    },
    {
      id: 'agent-performance',
      name: 'Agent Performance Report',
      type: 'performance',
      description: 'Individual agent metrics, rankings, and performance comparisons',
      icon: Users,
      color: 'text-blue-500',
      metrics: ['Individual Sales', 'Revenue per Agent', 'Client Satisfaction', 'Viewings Conducted', 'Conversion Rates']
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      type: 'financial',
      description: 'Financial overview including revenue, expenses, and profit analysis',
      icon: BarChart3,
      color: 'text-purple-500',
      metrics: ['Gross Revenue', 'Net Profit', 'Operating Expenses', 'Commission Structure', 'Tax Summary']
    },
    {
      id: 'market-analysis',
      name: 'Market Analysis Report',
      type: 'market',
      description: 'Local market trends, pricing analysis, and competitive insights',
      icon: Building2,
      color: 'text-orange-500',
      metrics: ['Market Trends', 'Price Analysis', 'Inventory Levels', 'Competition Analysis', 'Forecast Data']
    }
  ];

  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Q2 Sales Performance Report',
      type: 'sales',
      description: 'Quarterly sales analysis for Q2 2024',
      createdDate: new Date(Date.now() - 86400000 * 3),
      lastGenerated: new Date(Date.now() - 86400000 * 1),
      status: 'ready',
      frequency: 'quarterly',
      size: '2.4 MB',
      downloadCount: 12,
      isScheduled: true
    },
    {
      id: '2',
      name: 'Monthly Agent Performance - June',
      type: 'performance',
      description: 'Individual agent metrics and rankings for June 2024',
      createdDate: new Date(Date.now() - 86400000 * 7),
      lastGenerated: new Date(Date.now() - 3600000 * 2),
      status: 'ready',
      frequency: 'monthly',
      size: '1.8 MB',
      downloadCount: 8,
      isScheduled: true
    },
    {
      id: '3',
      name: 'Market Analysis - Kensington Area',
      type: 'market',
      description: 'Local market trends and pricing analysis',
      createdDate: new Date(Date.now() - 86400000 * 14),
      status: 'generating',
      frequency: 'once',
      size: 'Generating...',
      downloadCount: 0,
      isScheduled: false
    },
    {
      id: '4',
      name: 'Financial Summary H1 2024',
      type: 'financial',
      description: 'Half-year financial performance overview',
      createdDate: new Date(Date.now() - 86400000 * 30),
      lastGenerated: new Date(Date.now() - 86400000 * 2),
      status: 'ready',
      frequency: 'once',
      size: '3.2 MB',
      downloadCount: 25,
      isScheduled: false
    }
  ]);

  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    frequency: 'once' as Report['frequency'],
    includeCharts: true,
    includeRawData: false,
    emailDelivery: false
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateReport = () => {
    if (!newReport.name || !selectedTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const template = reportTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const report: Report = {
      id: Date.now().toString(),
      name: newReport.name,
      type: template.type,
      description: newReport.description || template.description,
      createdDate: new Date(),
      status: 'generating',
      frequency: newReport.frequency,
      size: 'Generating...',
      downloadCount: 0,
      isScheduled: newReport.frequency !== 'once'
    };

    setReports([report, ...reports]);
    setNewReport({
      name: '',
      description: '',
      frequency: 'once',
      includeCharts: true,
      includeRawData: false,
      emailDelivery: false
    });
    setSelectedTemplate('');
    setIsCreateDialogOpen(false);
    
    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === report.id 
          ? { ...r, status: 'ready' as const, size: `${(Math.random() * 3 + 1).toFixed(1)} MB`, lastGenerated: new Date() }
          : r
      ));
      toast.success('Report generated successfully');
    }, 3000);

    toast.success('Report generation started');
  };

  const handleDownloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report || report.status !== 'ready') return;

    // Mock download
    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, downloadCount: r.downloadCount + 1 }
        : r
    ));
    
    toast.success(`Downloading ${report.name}...`);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter(r => r.id !== reportId));
    toast.success('Report deleted');
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'generating': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'generating': return <Clock className="w-4 h-4 animate-spin" />;
      case 'scheduled': return <CalendarIcon className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'sales': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'performance': return <Users className="w-4 h-4 text-blue-500" />;
      case 'financial': return <BarChart3 className="w-4 h-4 text-purple-500" />;
      case 'market': return <Building2 className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const stats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    scheduled: reports.filter(r => r.isScheduled).length,
    generating: reports.filter(r => r.status === 'generating').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and manage comprehensive business reports</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label>Report Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <template.icon className={`w-5 h-5 mt-0.5 ${template.color}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.metrics.slice(0, 3).map((metric) => (
                              <Badge key={metric} variant="outline" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                            {template.metrics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.metrics.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <>
                  {/* Report Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input
                        id="reportName"
                        value={newReport.name}
                        onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                        placeholder="Enter report name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={newReport.frequency} onValueChange={(value: Report['frequency']) => setNewReport({...newReport, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">One-time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                      placeholder="Additional description for this report"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <Label>Report Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeCharts"
                          checked={newReport.includeCharts}
                          onCheckedChange={(checked) => setNewReport({...newReport, includeCharts: !!checked})}
                        />
                        <Label htmlFor="includeCharts" className="text-sm">Include charts and visualizations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeRawData"
                          checked={newReport.includeRawData}
                          onCheckedChange={(checked) => setNewReport({...newReport, includeRawData: !!checked})}
                        />
                        <Label htmlFor="includeRawData" className="text-sm">Include raw data tables</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="emailDelivery"
                          checked={newReport.emailDelivery}
                          onCheckedChange={(checked) => setNewReport({...newReport, emailDelivery: !!checked})}
                        />
                        <Label htmlFor="emailDelivery" className="text-sm">Email report when ready</Label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport} disabled={!selectedTemplate || !newReport.name}>
                  Create Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-xl font-semibold">{stats.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-xl font-semibold">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Generating</p>
                <p className="text-xl font-semibold">{stats.generating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="market">Market</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="generating">Generating</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(report.type)}
                    <div>
                      <h3 className="font-semibold text-lg">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)} variant="secondary">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(report.status)}
                          <span className="capitalize">{report.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Created {format(report.createdDate, 'MMM d, yyyy')}</span>
                    </div>
                    
                    {report.lastGenerated && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Last generated {format(report.lastGenerated, 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{report.size}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{report.downloadCount} downloads</span>
                    </div>

                    {report.isScheduled && (
                      <Badge variant="outline" className="text-xs">
                        {report.frequency}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {report.status === 'ready' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your filters.' 
                : 'Get started by creating your first report.'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}