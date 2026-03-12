import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  TrendingUp,
  Wrench,
  ShieldCheck,
  Lock,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Home,
  Zap,
  ChevronRight,
  BarChart3,
  Building2,
} from 'lucide-react';
import { Property } from '@/types';

interface IntelligenceReportModalProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: 'property' | 'room'; // Defaults to property
}

// Maintenance history entries modelled after the MaintenanceSchedule data structure
const MOCK_MAINTENANCE_HISTORY = [
  {
    id: 1,
    issue_type: 'Boiler Service & Safety Check',
    description: 'Annual boiler inspection and gas safety certificate renewal. All safety checks passed.',
    urgency: 'low',
    status: 'completed',
    scheduled_date: '2024-11-14',
    scheduled_time: '09:00',
    contractor: 'British Gas',
    cost_estimate: '£180',
  },
  {
    id: 2,
    issue_type: 'Roof Tile Replacement',
    description: 'Three cracked roof tiles identified during survey. Replaced and resealed to prevent water ingress.',
    urgency: 'medium',
    status: 'completed',
    scheduled_date: '2024-08-22',
    scheduled_time: '10:30',
    contractor: 'Premier Roofing Ltd',
    cost_estimate: '£420',
  },
  {
    id: 3,
    issue_type: 'Electrical Rewiring – Ground Floor',
    description: 'Partial rewiring of ground floor circuits to bring wiring up to current BS 7671 standards.',
    urgency: 'high',
    status: 'completed',
    scheduled_date: '2024-05-09',
    scheduled_time: '08:00',
    contractor: 'Swift Electrical',
    cost_estimate: '£1,200',
  },
];

const urgencyConfig: Record<string, { label: string; color: string; dot: string }> = {
  low: {
    label: 'Low',
    color: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-500',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
};

const IntelligenceReportModal = ({
  property,
  open,
  onOpenChange,
  entityType = 'property',
}: IntelligenceReportModalProps) => {
  const [downloaded, setDownloaded] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Dynamic naming based on the entityType
  const isRoom = entityType === 'room';
  const entityNameCapitalized = isRoom ? 'Room' : 'Property';
  const entityNameLower = isRoom ? 'room' : 'property';

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 0;

      const reportDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      // helpers
      const checkPage = (needed: number) => {
        if (y + needed > pageH - 16) { doc.addPage(); y = margin; }
      };

      const sectionTitle = (text: string) => {
        checkPage(14);
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentW, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(text.toUpperCase(), margin + 4, y + 5.5);
        y += 12;
      };

      const tableRow = (label: string, value: string, shade: boolean) => {
        checkPage(9);
        if (shade) { doc.setFillColor(248, 250, 252); doc.rect(margin, y, contentW, 8, 'F'); }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin + 3, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(value, pageW - margin - 3, y + 5.5, { align: 'right' });
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 8, margin + contentW, y + 8);
        y += 9;
      };

      const statGrid = (items: { label: string; value: string }[]) => {
        const cols = 3;
        const cellW = contentW / cols;
        const cellH = 16;
        items.forEach((item, i) => {
          const col = i % cols;
          const x = margin + col * cellW;
          if (col === 0) checkPage(cellH + 2);
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(x + 1, y, cellW - 2, cellH, 2, 2, 'FD');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(item.label.toUpperCase(), x + 5, y + 5.5);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(item.value, x + 5, y + 12);
          if (col === cols - 1 || i === items.length - 1) y += cellH + 3;
        });
        y += 2;
      };

      // HEADER
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 46, 'F');
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 4, 46, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(147, 197, 253);
      doc.text(`${entityNameCapitalized.toUpperCase()} INTELLIGENCE REPORT`, margin, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(255, 255, 255);
      doc.text(property.title, margin, 24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`${property.address.street}, ${property.address.city}, ${property.address.postcode}`, margin, 32);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${reportDate}   ·   For ${property.listingType}   ·   Status: ${property.status}   ·   Homed Pro`, margin, 41);
      y = 56;

      // 1. PROPERTY OVERVIEW
      sectionTitle(`1. ${entityNameCapitalized} Overview`);
      statGrid([
        { label: 'Asking Price', value: `£${property.price.toLocaleString()}${property.listingType === 'rent' ? '/mo' : ''}` },
        { label: `${entityNameCapitalized} Type`, value: property.type.charAt(0).toUpperCase() + property.type.slice(1) },
        { label: 'Tenure', value: property.tenure.charAt(0).toUpperCase() + property.tenure.slice(1) },
        { label: 'Bedrooms', value: String(property.bedrooms) },
        { label: 'Bathrooms', value: String(property.bathrooms) },
        { label: 'Receptions', value: String(property.receptions) },
        ...(property.propertySize ? [{ label: 'Floor Area', value: `${property.propertySize} sqft` }] : []),
        ...(property.energyRating ? [{ label: 'EPC Rating', value: property.energyRating }] : []),
        ...(property.councilTaxBand ? [{ label: 'Council Tax', value: `Band ${property.councilTaxBand}` }] : []),
        ...(property.yearBuilt ? [{ label: 'Year Built', value: String(property.yearBuilt) }] : []),
      ]);

      // 2. MARKET ANALYSIS
      sectionTitle('2. Market Analysis');
      [
        [`Estimated market value range`, `£${(property.price * 0.95).toLocaleString()} – £${(property.price * 1.08).toLocaleString()}`],
        [`Average days to sell in ${property.address.city}`, '42 days'],
        ['Comparable sales (last 6 months)', '14 nearby transactions'],
        ['Estimated rental yield', property.listingType === 'rent' ? 'N/A (rental listing)' : '4.2% gross'],
        ['Capital growth (5-year area average)', '+18.3%'],
        [`Demand index for ${property.address.postcode}`, 'High (82 / 100)'],
      ].forEach(([l, v], i) => tableRow(l, v, i % 2 === 0));
      y += 10;

      // 📈 DRAW THE LINE GRAPH IN PDF
      checkPage(65);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`5-Year ${isRoom ? 'Rent' : 'Value'} Trend Estimate`, margin, y);
      y += 8;

      // Generate mock trend data based on current price
      const trendData = [
        { label: '2020', value: property.price * 0.78 },
        { label: '2021', value: property.price * 0.84 },
        { label: '2022', value: property.price * 0.91 },
        { label: '2023', value: property.price * 0.96 },
        { label: '2024', value: property.price }
      ];

      const chartH = 35; // Height of chart
      const maxVal = Math.max(...trendData.map(d => d.value));
      const minVal = Math.min(...trendData.map(d => d.value));
      
      // Dynamic baseline to make the line chart scale nicely (not just hug the top)
      const yMin = minVal * 0.85; 
      const yRange = maxVal - yMin;

      // Calculate spacing so points span evenly, keeping some padding off the absolute edges
      const pointCount = trendData.length;
      const chartInnerWidth = contentW - 16; // 8 unit padding on left and right
      const startX = margin + 8;
      const gap = chartInnerWidth / (pointCount - 1);

      // Draw faint background grid lines for context
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + contentW, y); // Top reference line
      doc.line(margin, y + (chartH/2), margin + contentW, y + (chartH/2)); // Mid reference line

      // Draw Main X axis
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.line(margin, y + chartH, margin + contentW, y + chartH);

      const points: {x: number, y: number}[] = [];

      // Calculate coordinates and draw text labels
      trendData.forEach((d, i) => {
        // Calculate dynamic height based on value
        const h = ((d.value - yMin) / yRange) * (chartH - 8); // -8 leaves some padding at top
        const px = startX + i * gap;
        const py = y + chartH - h;
        points.push({x: px, y: py});

        // Draw X-axis label (Year) below the axis
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139); // slate-500
        const lw = doc.getTextWidth(d.label);
        doc.text(d.label, px - (lw/2), y + chartH + 5);

        // Draw Value Label above the point
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42); // slate-900
        // Clean formatting for high values (e.g. £350k vs £950)
        const formatVal = d.value >= 10000 
          ? `£${(d.value / 1000).toFixed(0)}k` 
          : `£${Math.round(d.value)}`;
        const vwLen = doc.getTextWidth(formatVal);
        doc.text(formatVal, px - (vwLen/2), py - 3);
      });

      // Draw Connecting Lines
      doc.setDrawColor(59, 130, 246); // blue-500
      doc.setLineWidth(1.2);
      for (let i = 0; i < points.length - 1; i++) {
        doc.line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
      }

      // Draw Points (Circles) over the lines
      doc.setFillColor(255, 255, 255); // white center
      doc.setDrawColor(59, 130, 246); // blue-500 border
      doc.setLineWidth(0.8);
      points.forEach(p => {
        doc.circle(p.x, p.y, 1.8, 'FD'); // Fill and Stroke
      });

      y += chartH + 12; // Push cursor past the graph

      // 3. MAINTENANCE HISTORY
      sectionTitle('3. Maintenance History');
      checkPage(9);
      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, contentW, 8, 'F');
      const mCols: [string, number][] = [['Issue / Work', 68], ['Priority', 20], ['Date', 28], ['Contractor', 38], ['Est. Cost', 20]];
      let cx = margin + 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      mCols.forEach(([h, w]) => { doc.text(h, cx, y + 5.5); cx += w; });
      y += 9;

      MOCK_MAINTENANCE_HISTORY.forEach((item, i) => {
        checkPage(10);
        if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(margin, y, contentW, 9, 'F'); }
        const cells: [string, number][] = [
          [item.issue_type, 68],
          [item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1), 20],
          [new Date(item.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }), 28],
          [item.contractor, 38],
          [item.cost_estimate, 20],
        ];
        let cx2 = margin + 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        cells.forEach(([val, w]) => { doc.text(val, cx2, y + 6); cx2 += w; });
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 9, margin + contentW, y + 9);
        y += 10;
      });
      y += 6;

      // 4. RISK ASSESSMENT
      sectionTitle('4. Risk Assessment');
      [
        ['Structural integrity', 'Low risk'],
        ['Legal / title issues', 'None detected'],
        ['Flood risk zone', 'Zone 1 – Very low'],
        ['Environmental hazards', 'No known concerns'],
        ['Ground stability', 'Stable – no subsidence indicators'],
        ['Radon exposure', 'Below action level'],
      ].forEach(([l, v], i) => tableRow(l, v, i % 2 === 0));
      y += 6;

      // 5. INVESTMENT SCORE
      sectionTitle('5. Investment Score');
      checkPage(38);
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentW, 32, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(96, 165, 250);
      doc.text('7.4', margin + 10, y + 21);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('out of 10  ·  Strong Buy', margin + 30, y + 13);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        doc.splitTextToSize(`This ${entityNameLower} scores highly on location demand, maintenance history, and price alignment with the local market.`, contentW - 42),
        margin + 30, y + 21
      );
      y += 38;
      statGrid([
        { label: 'Location Score', value: '8.1 / 10' },
        { label: 'Condition Score', value: '7.0 / 10' },
        { label: 'Value for Money', value: '7.2 / 10' },
      ]);

      // FOOTER on every page
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const fy = pageH - 8;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, fy - 3, pageW - margin, fy - 3);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Homed Pro Intelligence Report · Confidential – for recipient use only', margin, fy);
        doc.text(`Page ${p} of ${totalPages}   ·   homed.co.uk`, pageW - margin, fy, { align: 'right' });
      }

      doc.save(`Homed-${entityNameCapitalized}-Intelligence-Report-${property.address.postcode.replace(/\s/g, '')}.pdf`);
      setDownloaded(true);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [property, entityNameCapitalized, entityNameLower, isRoom]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-900 to-slate-700 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-blue-300" />
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                  {entityNameCapitalized} Intelligence Report
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-white leading-tight">
                {property.title}
              </DialogTitle>
              <p className="text-sm text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {property.address.street}, {property.address.city},{' '}
                {property.address.postcode}
              </p>
            </div>
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs shrink-0 ml-4">
              Preview
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">

          {/* ── Section 1: Property Overview ── */}
          <section>
            <SectionHeading icon={<Home className="w-4 h-4" />} title={`${entityNameCapitalized} Overview`} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              <StatTile label="Price" value={`£${property.price.toLocaleString()}`} />
              <StatTile label="Type" value={property.type} capitalize />
              <StatTile label="Tenure" value={property.tenure} capitalize />
              <StatTile label="Bedrooms" value={String(property.bedrooms)} />
              <StatTile label="Bathrooms" value={String(property.bathrooms)} />
              {property.propertySize && (
                <StatTile label="Size" value={`${property.propertySize} sqft`} />
              )}
              {property.energyRating && (
                <StatTile label="EPC Rating" value={property.energyRating} />
              )}
              {property.councilTaxBand && (
                <StatTile label="Council Tax" value={`Band ${property.councilTaxBand}`} />
              )}
              {property.yearBuilt && (
                <StatTile label="Year Built" value={String(property.yearBuilt)} />
              )}
            </div>
          </section>

          <Separator />

          {/* ── Section 2: Market Analysis (partial) ── */}
          <section>
            <SectionHeading
              icon={<BarChart3 className="w-4 h-4" />}
              title="Market Analysis"
              badge="Partial Preview"
            />
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Estimated market value range</span>
                </div>
                <span className="font-semibold text-slate-900">
                  £{(property.price * 0.95).toLocaleString()} –{' '}
                  £{(property.price * 1.08).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Average days to sell in {property.address.city}</span>
                </div>
                <span className="font-semibold text-slate-900">42 days</span>
              </div>
              {/* Blurred rows */}
              <div className="relative">
                <div className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
                  {['Comparable sales (last 6 months)', 'Rental yield estimate', 'Capital growth (5-yr avg)'].map(
                    (label, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg border"
                      >
                        <span className="text-slate-600">{label}</span>
                        <span className="font-semibold text-slate-900">••••••</span>
                      </div>
                    )
                  )}
                </div>
                <LockedOverlay />
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Section 3: Maintenance History ── */}
          <section>
            <SectionHeading
              icon={<Wrench className="w-4 h-4" />}
              title="Maintenance History"
              badge="Partial Preview"
            />
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Structured log of recorded maintenance events, inspections, and repairs.
            </p>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-200" />

              <div className="space-y-4">
                {MOCK_MAINTENANCE_HISTORY.slice(0, 2).map((item) => {
                  const cfg = urgencyConfig[item.urgency] || urgencyConfig.low;
                  return (
                    <div key={item.id} className="relative flex gap-4 pl-10">
                      {/* Dot */}
                      <div
                        className={`absolute left-[12px] top-1 w-3 h-3 rounded-full border-2 border-white shadow ${cfg.dot}`}
                      />

                      <div className="flex-1 bg-white border rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                            {item.issue_type}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge className={`text-xs ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                            <Badge className="text-xs bg-slate-100 text-slate-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {item.status}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.scheduled_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Building2 className="w-3 h-3" />
                            {item.contractor}
                          </div>
                          <div className="flex items-center gap-1 font-medium text-slate-700">
                            <span>Est. cost:</span>
                            <span>{item.cost_estimate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Locked 3rd entry */}
                <div className="relative">
                  <div className="blur-sm select-none pointer-events-none" aria-hidden>
                    <div className="relative flex gap-4 pl-10">
                      <div className="absolute left-[12px] top-1 w-3 h-3 rounded-full border-2 border-white shadow bg-orange-500" />
                      <div className="flex-1 bg-white border rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">Electrical Rewiring</h4>
                          <Badge className="text-xs bg-orange-100 text-orange-800">High</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Partial rewiring of ground floor circuits...</p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                          <span>9 May 2024</span>
                          <span>Swift Electrical</span>
                          <span>Est. £1,200</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <LockedOverlay />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Section 4: Risk Assessment (fully locked) ── */}
          <section>
            <SectionHeading
              icon={<ShieldCheck className="w-4 h-4" />}
              title="Risk Assessment"
              locked
            />
            <div className="relative mt-3">
              <div className="blur-sm select-none pointer-events-none space-y-2" aria-hidden>
                {[
                  { label: 'Structural integrity', value: 'Low risk', icon: AlertTriangle },
                  { label: 'Legal / title issues', value: 'None detected', icon: ShieldCheck },
                  { label: 'Flood risk', value: 'Zone 1 – Very low', icon: Zap },
                  { label: 'Environmental hazards', value: 'No known concerns', icon: CheckCircle2 },
                ].map(({ label, value, icon: Icon }, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2 text-slate-600">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    <span className="font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
              <LockedOverlay />
            </div>
          </section>

          {/* ── Download Full Report CTA ── */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-300" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Download the Full Intelligence Report
            </h3>
            <p className="text-sm text-slate-300 mb-4 max-w-sm mx-auto">
              A full PDF report with complete maintenance history, risk assessment,
              comparable sales, rental yield projections, and investment score.
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-4">
              {['Complete maintenance log', 'Risk breakdown', 'Investment score'].map((f) => (
                <div key={f} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  {f}
                </div>
              ))}
            </div>

            {downloaded ? (
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Report downloaded successfully!
              </div>
            ) : (
              <Button
                onClick={handleDownload}
                disabled={generating}
                className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-2.5 rounded-xl gap-2 disabled:opacity-70"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generating PDF…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Full Report
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}

            <p className="text-xs text-slate-500 mt-3">
              Part of Homed Pro — premium insights for buyers and investors.
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── Small helper sub-components ── */

function SectionHeading({
  icon,
  title,
  badge,
  locked,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-600">{icon}</span>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
      {badge && (
        <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 ml-1">
          {badge}
        </Badge>
      )}
      {locked && (
        <Badge className="text-[10px] bg-slate-100 text-slate-500 border-slate-300 ml-1 gap-1">
          <Lock className="w-2.5 h-2.5" />
          Full Report Only
        </Badge>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-slate-50 border rounded-lg px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-semibold text-slate-900 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function LockedOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg">
      <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-medium text-slate-600">
        <Lock className="w-3 h-3" />
        Full report only
      </div>
    </div>
  );
}

export default IntelligenceReportModal;