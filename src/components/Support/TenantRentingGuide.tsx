import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckSquare,
  FileText,
  Home,
  Key,
  PoundSterling,
  Shield,
  Wrench,
  RefreshCcw,
  ClipboardCheck,
  Dot,
} from "lucide-react";

// 1. Upgraded Section with Icons, Gray Backgrounds, and Hover Shadows
const Section = ({ 
  title, 
  description, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  description?: string; 
  icon?: React.ElementType; 
  children: React.ReactNode; 
}) => (
  <Card className="mb-6 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden group">
    <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:bg-gray-100 transition-colors">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
        )}
        <div>
          <CardTitle className="text-lg text-gray-800">{title}</CardTitle>
          {description && <p className="text-sm text-gray-500 pt-1">{description}</p>}
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-5 bg-white">
      {children}
    </CardContent>
  </Card>
);

// 2. Refined List with subtle gray text and aligned icons
const PointList = ({ items }: { items: (string | React.ReactNode)[] }) => (
  <ul className="space-y-3">
    {items.map((item, idx) => (
      <li key={idx} className="flex items-start gap-3 group">
        <CheckSquare className="w-4 h-4 mt-1 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
        <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
      </li>
    ))}
  </ul>
);

// 3. Upgraded Responsibilities Table with distinct styling
const ResponsibilitiesTable = ({ data }: { data: { tenant: string[], landlord: string[] } }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
    <Card className="border-gray-200 shadow-sm bg-gray-50/30">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-gray-500" />
          Tenant Responsibilities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {data.tenant.map((item, i) => 
            <li key={`tenant-${i}`} className="flex items-start gap-2">
              <Dot className="w-6 h-6 -mt-1 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">{item}</span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
    
    <Card className="border-gray-200 shadow-sm bg-gray-50/30">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base text-gray-800 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-gray-500" />
          Landlord Responsibilities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {data.landlord.map((item, i) => 
            <li key={`landlord-${i}`} className="flex items-start gap-2">
              <Dot className="w-6 h-6 -mt-1 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">{item}</span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  </div>
);

export default function TenantRentingGuide() {
  const currentResponsibilities = {
    tenant: [
      "Pay rent and bills on time",
      "Maintain the property and report repairs",
      "Follow tenancy rules",
    ],
    landlord: [
      "Maintain property structure and safety",
      "Conduct regular gas/electrical checks",
      "Protect tenant deposit",
      "Provide at least 24 hours’ notice before visits",
    ],
  };

  const newResponsibilities = {
    tenant: [
      "Pay rent & bills on time",
      "Maintain property & report issues",
      "Follow tenancy rules",
    ],
    landlord: [
      "Maintain property structure & safety",
      "Conduct gas/electrical checks",
      "Protect deposit and Give 24-hour notice before visits",
    ],
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 pt-6 px-4 sm:px-6">
      <div className="flex flex-col gap-3 text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Renting in England: A Tenant's Guide
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-base">
          Understand the full rental journey from searching for a property to moving out, including tenant and landlord responsibilities.
        </p>
      </div>

      <Tabs defaultValue="current-rules" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 h-auto p-1 bg-gray-100 rounded-xl mb-8">
          <TabsTrigger value="current-rules" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500">
            Current Rules (Assured Shorthold Tenancy)
          </TabsTrigger>
          <TabsTrigger value="new-rules" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500">
            New Tenancy Rules (From May 2026)
          </TabsTrigger>
        </TabsList>

        {/* Current Rules Tab */}
        <TabsContent value="current-rules" className="mt-2 focus-visible:outline-none">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <p className="mb-8 text-sm text-center text-gray-500 max-w-3xl mx-auto">
              Renting a home in England under an assured shorthold tenancy outlines the full rental journey from searching for a property to moving out.
            </p>
            
            <Section icon={FileText} title="1. Before Renting">
              <PointList items={[
                "Understand your budget, deposit limits, and tenancy duration. Most tenant fees are banned; only limited charges (like deposits and rent) are allowed.",
                "Landlords must check your right to rent and may require documents or a guarantor."
              ]} />
            </Section>

            <Section icon={Home} title="2. Finding a Property">
              <PointList items={[
                "Verify deposit protection, tenancy terms, and included bills.",
                "Ensure the property meets safety standards (smoke alarms, gas/electrical checks).",
                "Confirm landlord legitimacy and avoid scams.",
                "Check if the property requires licensing (e.g., shared housing)."
              ]} />
            </Section>

            <Section icon={Key} title="3. After Selecting a Property">
              <PointList items={[
                "Carefully review and sign a tenancy agreement.",
                "Ensure you receive key documents: Gas safety certificate, Energy performance certificate, Deposit protection details.",
                "Record inventory and meter readings before moving in."
              ]} />
            </Section>

            <Section icon={RefreshCcw} title="4. During Tenancy">
              <ResponsibilitiesTable data={currentResponsibilities} />
            </Section>

            <Section icon={CheckSquare} title="5. Ending the Tenancy">
              <PointList items={[
                "Tenancies typically last 6–12 months with options to renew or go periodic.",
                "Proper notice must be given by both tenant and landlord.",
                "At move-out: Clear dues and bills, Return keys, Leave property in good condition."
              ]} />
            </Section>

            <Section icon={AlertCircle} title="6. If Issues Arise">
              <PointList items={[
                "Try resolving issues directly with the landlord or agent.",
                "Tenants are protected from unfair eviction and illegal fees.",
                "Support is available through councils, legal services, and housing organizations."
              ]} />
            </Section>
          </div>
        </TabsContent>

        {/* New Rules Tab */}
        <TabsContent value="new-rules" className="mt-2 focus-visible:outline-none">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <p className="mb-8 text-sm text-center text-gray-500 max-w-3xl mx-auto">
              Covering the tenant journey, responsibilities, and new legal updates under the Renter’s Rights Act 2026.
            </p>

            <Section icon={FileText} title="1. Before Renting">
              <PointList items={[
                "Plan your budget, deposit (max 5–6 weeks), and tenancy duration",
                "Most tenant fees are banned (only rent, deposit, limited charges allowed)",
                "Landlords must verify your Right to Rent and may request documents/guarantor",
              ]} />
            </Section>

            <Section icon={Home} title="2. Finding a property">
              <PointList items={[
                "Check deposit protection and tenancy terms",
                "Ensure property safety (gas, electrical, smoke alarms)",
                "Verify landlord/agent authenticity to avoid scams",
                "Confirm licensing requirements (especially for shared housing)",
              ]} />
            </Section>

            <Section icon={Key} title="3. Moving In (Legal Requirements)">
              <PointList items={[
                "Sign a written tenancy agreement",
                "Receive mandatory documents: Gas Safety Certificate, Energy Performance Certificate, Deposit Protection Details",
                "Record inventory & meter readings",
              ]} />
            </Section>

            <Section icon={Wrench} title="4. During Tenancy">
              <ResponsibilitiesTable data={newResponsibilities} />
            </Section>

            <Section icon={RefreshCcw} title="5. Tenancy Changes (From May 2026)">
              <PointList items={[
                "Fixed-term tenancies removed all become rolling (periodic)",
                "Assured Shorthold Tenancy replaced with Periodic Tenancy",
                "Tenancy continues until tenant or landlord legally ends it",
              ]} />
            </Section>

            <Section icon={PoundSterling} title="6. Rent Rules">
              <PointList items={[
                "Rent can increase only once per year",
                "Minimum 2 months’ notice required",
                "Must reflect market rate (can be challenged legally)",
              ]} />
            </Section>

            <Section icon={Shield} title="7. Eviction Rules (Major Change)">
              <PointList items={[
                "No more “no-fault” evictions (Section 21 banned)",
                "Landlords must provide a valid legal reason (e.g., rent arrears, property misuse)",
                "Court approval required for eviction",
              ]} />
            </Section>

            <Section icon={ClipboardCheck} title="8. Tenant Rights (New)">
              <PointList items={[
                "Tenants can request to keep pets",
                "Landlords cannot unreasonably refuse",
              ]} />
            </Section>

            <Section icon={CheckSquare} title="9. Ending the Tenancy">
              <PointList items={[
                "Tenant can leave anytime with 2 months’ notice",
                "Must: Clear rent & bills, Return keys, Leave property in good condition",
              ]} />
            </Section>

            <Section icon={AlertCircle} title="10. If Issues Arise">
              <PointList items={[
                "Try resolving with landlord/agent first",
                "Legal protections against: Unfair eviction, Illegal fees",
                "Support available via councils & legal services",
              ]} />
            </Section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}