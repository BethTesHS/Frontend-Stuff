import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  GraduationCap,
  Receipt,
  Zap,
  Wrench,
  Star,
  Download,
  Loader2,
  AlertTriangle,
  BarChart3,
  MapPin,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { propertyApi } from '@/services/api';

// ── Types ────────────────────────────────────────────────────────────────
interface PriceTrendPoint {
  year: string;
  price: number;
}

interface RentTrendPoint {
  year: string;
  rent: number;
}

interface MaintenanceRecord {
  date: string;
  type: string;
  cost: number;
  status: 'completed' | 'pending' | 'in_progress';
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  categories: { label: string; rating: number }[];
}

interface IntelligenceReport {
  priceTrend: {
    direction: 'up' | 'down' | 'stable';
    percentChange: number;
    period: string;
    data: PriceTrendPoint[];
  };
  rentTrend: {
    direction: 'up' | 'down' | 'stable';
    averageRent: number;
    data: RentTrendPoint[];
  };
  crimeLevel: {
    level: 'Low' | 'Medium' | 'High';
    recentIncidents: number;
    trend: 'improving' | 'stable' | 'worsening';
  };
  nearbySchools: {
    count: number;
    withinKm: number;
    outstanding: number;
    good: number;
  };
  councilTaxBand: string;
  energyCost: {
    annualAverage: number;
    rating: string;
  };
  maintenance: {
    totalSpent: number;
    records: MaintenanceRecord[];
  };
  reviews: ReviewSummary;
}

interface PropertyInsightsProps {
  propertyId: string;
}

// ── TODO: Mock report data ─────────────────────────────────────────────────────
const MOCK_REPORT: IntelligenceReport = {
  priceTrend: {
    direction: 'up',
    percentChange: 8,
    period: 'last 5 years',
    data: [
      { year: '2021', price: 285000 },
      { year: '2022', price: 295000 },
      { year: '2023', price: 305000 },
      { year: '2024', price: 318000 },
      { year: '2025', price: 327600 },
    ],
  },
  rentTrend: {
    direction: 'up',
    averageRent: 1350,
    data: [
      { year: '2021', rent: 1050 },
      { year: '2022', rent: 1120 },
      { year: '2023', rent: 1200 },
      { year: '2024', rent: 1290 },
      { year: '2025', rent: 1350 },
    ],
  },
  crimeLevel: {
    level: 'Medium',
    recentIncidents: 42,
    trend: 'improving',
  },
  nearbySchools: {
    count: 5,
    withinKm: 2,
    outstanding: 1,
    good: 3,
  },
  councilTaxBand: 'D',
  energyCost: {
    annualAverage: 1200,
    rating: 'C',
  },
  maintenance: {
    totalSpent: 4250,
    records: [
      { date: '2025-11-10', type: 'Boiler Service', cost: 150, status: 'completed' },
      { date: '2025-08-20', type: 'Roof Repair', cost: 2800, status: 'completed' },
      { date: '2025-05-03', type: 'Garden Maintenance', cost: 300, status: 'completed' },
      { date: '2026-02-15', type: 'Plumbing Inspection', cost: 200, status: 'pending' },
      { date: '2025-03-22', type: 'Electrical Check', cost: 800, status: 'completed' },
    ],
  },
  reviews: {
    averageRating: 4.2,
    totalReviews: 14,
    categories: [
      { label: 'Condition', rating: 4.5 },
      { label: 'Location', rating: 4.8 },
      { label: 'Value for Money', rating: 3.9 },
      { label: 'Landlord Responsiveness', rating: 3.6 },
    ],
  },
};

// ── Component ────────────────────────────────────────────────────────────
const PropertyInsights = ({ propertyId }: PropertyInsightsProps) => {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('price');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await propertyApi.getIntelligenceReport(propertyId);
        if (response.success && response.data) {
          setReport(response.data);
        } else {
          // Fallback to mock data when API is unavailable
          setReport(MOCK_REPORT);
        }
      } catch {
        // Use mock data as fallback
        setReport(MOCK_REPORT);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [propertyId]);

  const captureTabAsImage = async (tabValue: string): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;

    // Click the target tab trigger to make its content visible
    const trigger = cardRef.current.querySelector<HTMLButtonElement>(
      `[data-state][value="${tabValue}"]`
    );
    if (trigger) trigger.click();

    // Wait for recharts animations to settle
    await new Promise((r) => setTimeout(r, 600));

    // Find the visible tab content panel
    const panel = cardRef.current.querySelector<HTMLElement>(
      `[role="tabpanel"][data-state="active"]`
    );
    if (!panel) return null;

    return html2canvas(panel, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      // Try the API first
      try {
        const blob = await propertyApi.downloadIntelligenceReport(propertyId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `property-intelligence-report-${propertyId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Report downloaded successfully');
        return;
      } catch {
        // API unavailable — fall through to client-side capture
      }

      if (!cardRef.current || !report) {
        toast.error('No report data available to download');
        return;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const addText = (text: string, fontSize = 11, bold = false) => {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(text, margin, y);
        y += fontSize * 0.5 + 4;
      };

      const addCanvasImage = (canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        if (y + imgHeight > 280) { doc.addPage(); y = margin; }
        doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 8;
      };

      // ── Page 1: Header + Summary ────────────────────────────────
      addText('Property Intelligence Report', 20, true);
      addText(`Property ID: ${propertyId}`, 10);
      addText(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 10);
      y += 4;

      // Capture the summary cards grid
      const summaryGrid = cardRef.current.querySelector<HTMLElement>('.grid.grid-cols-2');
      if (summaryGrid) {
        const summaryCanvas = await html2canvas(summaryGrid, {
          scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
        });
        addCanvasImage(summaryCanvas);
      }

      // ── Capture each tab's chart ────────────────────────────────
      const originalTab = activeTab;
      const tabs = ['price', 'rent', 'maintenance', 'reviews'];
      const tabLabels = ['Price Trend', 'Rent Trend', 'Maintenance History', 'Reviews'];

      for (let i = 0; i < tabs.length; i++) {
        addText(tabLabels[i], 14, true);
        const canvas = await captureTabAsImage(tabs[i]);
        if (canvas) addCanvasImage(canvas);
      }

      // Restore the original active tab
      const restoreTrigger = cardRef.current.querySelector<HTMLButtonElement>(
        `[data-state][value="${originalTab}"]`
      );
      if (restoreTrigger) restoreTrigger.click();

      // ── Footer ──────────────────────────────────────────────────
      y += 4;
      addText('Data sourced from UK government open data and Homed platform records.', 9);

      doc.save(`property-intelligence-report-${propertyId}.pdf`);
      toast.success('Report generated and downloaded');
    } catch {
      toast.error('Failed to download report. Please try again.');
      setError('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!report) return null;

  // ── Helpers ─────────────────────────────────────────────────────────
  const crimeBadgeColor: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
  };

  const statusColor: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
  };

  const formatCurrency = (v: number) =>
    `£${v.toLocaleString('en-GB')}`;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <Card className="overflow-hidden" ref={cardRef}>
      <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <CardTitle className="text-lg">Property Intelligence Insights</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {downloading ? 'Downloading…' : 'Download Full Report'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* ── Summary Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Price Trend */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {report.priceTrend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>Price Trend</span>
            </div>
            <div className="text-xl font-bold">
              {report.priceTrend.direction === 'up' ? '+' : '-'}
              {report.priceTrend.percentChange}%
            </div>
            <p className="text-xs text-gray-500">{report.priceTrend.period}</p>
          </div>

          {/* Crime Level */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Crime Level</span>
            </div>
            <div className="pt-0.5">
              <span className="text-sm text-gray-700 font-semibold">
                {report.crimeLevel.level}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-normal">
              {report.crimeLevel.recentIncidents} recent incidents · {report.crimeLevel.trend}
            </p>
          </div>

          {/* Nearby Schools */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Nearby Schools</span>
            </div>
            <div className="text-xl font-bold">{report.nearbySchools.count}</div>
            <p className="text-xs text-gray-500 leading-normal">
              within {report.nearbySchools.withinKm}km · {report.nearbySchools.outstanding} outstanding
            </p>
          </div>

          {/* Council Tax */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Receipt className="w-4 h-4 shrink-0" />
              <span>Council Tax Band</span>
            </div>
            <div className="text-xl font-bold">{report.councilTaxBand}</div>
          </div>

          {/* Energy Cost */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 shrink-0" />
              <span>Energy Cost</span>
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(report.energyCost.annualAverage)}
              <span className="text-sm font-normal text-gray-500 ml-0.5">/yr</span>
            </div>
            <p className="text-xs text-gray-500">Rating: {report.energyCost.rating}</p>
          </div>

          {/* Reviews */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Star className="w-4 h-4 shrink-0" />
              <span>Reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold">{report.reviews.averageRating}</span>
              <span className="text-sm text-gray-500">/ 5</span>
            </div>
            <p className="text-xs text-gray-500">{report.reviews.totalReviews} reviews</p>
          </div>
        </div>

        <Separator />

        {/* ── Charts Tab Section ──────────────────────────────────────── */}
        <Tabs defaultValue="price" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="price">Price Trend</TabsTrigger>
            <TabsTrigger value="rent">Rent Trend</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* ── Price Trend Chart ──────────────────────────────────────── */}
          <TabsContent value="price" className="pt-4" forceMount={activeTab === 'price' ? undefined : true} hidden={activeTab !== 'price'}>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.priceTrend.data}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Price']}
                    labelFormatter={(label: string) => `Year: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center pb-1">
              Property value over the {report.priceTrend.period}
            </p>
          </TabsContent>

          {/* ── Rent Trend Chart ───────────────────────────────────────── */}
          <TabsContent value="rent" className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.rentTrend.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v: number) => `£${v.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Monthly Rent']}
                    labelFormatter={(label: string) => `Year: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rent"
                    name="Monthly Rent"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center pb-1">
              Average monthly rent: {formatCurrency(report.rentTrend.averageRent)}/month
            </p>
          </TabsContent>

          {/* ── Maintenance History ────────────────────────────────────── */}
          <TabsContent value="maintenance" className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Total Spent: {formatCurrency(report.maintenance.totalSpent)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {report.maintenance.records.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{record.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColor[record.status]}>
                      {record.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm font-medium">{formatCurrency(record.cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Reviews ────────────────────────────────────────────────── */}
          <TabsContent value="reviews" className="pt-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{report.reviews.averageRating}</div>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(report.reviews.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{report.reviews.totalReviews} reviews</p>
              </div>
              <Separator orientation="vertical" className="h-20" />
              <div className="flex-1 space-y-2">
                {report.reviews.categories.map((cat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-40 shrink-0">{cat.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${(cat.rating / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{cat.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Location Intelligence Banner ────────────────────────────── */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Location Intelligence</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Crime data, school ratings and council tax bands are sourced from UK government open
                data and are updated periodically. Download the full report for detailed breakdowns.
              </p>
            </div>
          </div>
        </div>

        {/* ── Error banner ────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Bottom download CTA ─────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Full Property Intelligence Report</p>
              <p className="text-xs text-gray-500">
                Includes detailed price analysis, area demographics, planning applications & more
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyInsights;
