import { useState, useEffect } from "react";
import {
  Info,
  Zap,
  Flame,
  Shield,
  FileText,
  Home,
  CheckSquare,
  PoundSterling,
  Bell,
  ClipboardCheck,
  Key,
  AlertCircle,
  CheckCircle2,
  Wrench,
  RefreshCcw,
  ReceiptText,
  Circle
} from "lucide-react";

// Define a unique key for local storage
const STORAGE_KEY = "tenant_checklist_progress";

export default function ExternalTenantChecklists() {
  const [activeTab, setActiveTab] = useState("pre-tenancy");
  
  // 1. Initialize state from localStorage (Lazy Initialization)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing checklist data from local storage", e);
        }
      }
    }
    return {}; // Default to empty object if nothing is saved
  });

  // 2. Save to localStorage whenever checkedItems changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const Section = ({ title, description, children }: any) => (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const Item = ({ title, icon: Icon, items, isCritical = false }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-full h-fit flex-shrink-0 ${isCritical ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
           <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
           {isCritical && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Critical</span>}
        </div>
        <ul className="space-y-2 mt-3">
          {items.map((item: any, idx: number) => {
            const itemId = `${title}-${idx}`;
            const isChecked = checkedItems[itemId] || false;

            return (
              <li 
                key={itemId} 
                onClick={() => toggleCheck(itemId)}
                className="flex items-start gap-2.5 text-sm cursor-pointer group"
              >
                <button className="mt-0.5 flex-shrink-0 focus:outline-none transition-colors">
                  {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 group-hover:text-blue-400 dark:text-gray-500" />
                  )}
                </button>
                <span 
                  className={`transition-all duration-200 ${isChecked ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {/* Handle both raw HTML strings (from previous versions) and React Nodes (from the new link setup) */}
                  {typeof item === 'string' ? (
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  ) : (
                    item
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenancy Checklists</h2>
          {/* Optional: Add a subtle clear button to reset progress */}
          {Object.keys(checkedItems).length > 0 && (
             <button 
               onClick={() => {
                 if (window.confirm("Are you sure you want to clear your checklist progress?")) {
                   setCheckedItems({});
                   localStorage.removeItem(STORAGE_KEY);
                 }
               }}
               className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
             >
               Clear Progress
             </button>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400">Keep track of important compliance documents and procedures throughout your tenancy.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("pre-tenancy")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "pre-tenancy" ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
        >
          Pre-Tenancy & Move-In
        </button>
        <button
          onClick={() => setActiveTab("post-tenancy")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "post-tenancy" ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
        >
          During & Post-Tenancy
        </button>
      </div>

      <div className="mt-6">
        {/* Pre-Tenancy Tab Content */}
        {activeTab === "pre-tenancy" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section title="Essential Documents" description="Documents your landlord must provide before or at the start of your tenancy.">
              <Item 
                title="How to Rent Guide" 
                icon={Info} 
                isCritical={true}
                items={[
                "The landlord or letting agent should give the current version of this guide when a new assured shorthold tenancy starts.",
                "Must be provided again if the tenancy is renewed and the document has been updated.",
                "Landlords cannot serve a valid section 21 notice until they have given to their tenants copy of the Government guide.",
                "View the guide on <a href='https://www.gov.uk/government/publications/how-to-rent/how-to-rent-the-checklist-for-renting-in-england' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:underline font-medium'>GOV.UK</a>",
                ]}
              />
              <Item 
                title="Energy Performance Certificate (EPC)" 
                icon={Zap} 
                items={[
                  "Must have an energy performance rating of E or above (unless a valid exemption applies).",
                  "Must be provided free of charge at the onset of your tenancy."
                ]} 
              />
              <Item 
                title="Gas Safety Certificate (CP12)" 
                icon={Flame} 
                isCritical={true}
                items={[
                  "Landlord must ensure annual gas safety checks are completed.",
                  "A copy of the gas safety certificate must be provided to you before you move in."
                ]} 
              />
              <Item 
                title="Electrical Safety Certificate (EICR)" 
                icon={Zap} 
                isCritical={true}
                items={[
                  "Must show electrical installations are safe.",
                  "Report is valid for 5 years and must be provided before the tenancy starts."
                ]} 
              />
              <Item 
                title="Deposit Protection Certificate" 
                icon={Shield} 
                isCritical={true}
                items={[
                  "Must be protected in a government-backed scheme within 30 days.",
                  "Tenant must receive the 'prescribed information' and scheme details.",
                  "<strong>Missing &rarr;</strong> Landlord may face fines and lose the right to use a Section 21 eviction."
                ]} 
              />
              <Item 
                title="Tenancy Agreement (AST)" 
                icon={FileText} 
                isCritical={true}
                items={[
                  "Usually offered for a fixed period of six or 12 months.",
                  "Make sure you have a written agreement to define all legal terms and responsibilities."
                ]} 
              />
            </Section>

            <Section title="Conditional / Situation-Based" description="Requirements depending on property type or managing agents.">
              <Item 
                title="Property Licence" 
                icon={Home} 
                items={[
                  "Check if the property needs an HMO or selective licence from your local council."
                ]} 
              />
              <Item 
                title="Right to Rent Check" 
                icon={CheckSquare} 
                items={[
                  "Landlords in England must check that all people aged 18 or over have the right to rent.",
                  "Checks must be done before the start date of the tenancy agreement."
                ]} 
              />
              <Item 
                title="Client Money Protection" 
                icon={Shield} 
                items={[
                  "If using a letting agent, ensure they are a member of an approved client money protection scheme."
                ]} 
              />
            </Section>

            <Section title="Financial Transparency" description="Clear breakdown of costs and compliance with laws.">
              <Item 
                title="Rent & Deposits" 
                icon={PoundSterling} 
                items={[
                  "Holding deposit to reserve a property is permitted but capped at one week's rent.",
                  "Tenancy deposit is capped at 5 weeks' rent (if annual rent is under £50,000) or 6 weeks' rent (if £50,000+).",
                  "Viewing fees and tenancy set-up fees are strictly not allowed under the Tenant Fees Act."
                ]} 
              />
            </Section>

            <Section title="Safety Compliance" description="Safety measures that must be implemented.">
              <Item 
                title="Property Alarms" 
                icon={Bell} 
                isCritical={true}
                items={[
                  "Ensure at least one smoke alarm is installed on every storey.",
                  "Carbon monoxide alarm is required in any room containing a solid fuel burning appliance.",
                  "Landlord must ensure alarms are working on the first day of the tenancy."
                ]} 
              />
            </Section>

            <Section title="At Move-In (Check-In Stage)" description="Crucial steps during the actual handover.">
              <Item 
                title="Inventory & Check-In Report" 
                icon={ClipboardCheck} 
                isCritical={true}
                items={[
                  "Agree on an inventory or check-in report before you move in.",
                  "Take your own photos as an extra safeguard for resolving deposit disputes."
                ]} 
              />
              <Item 
                title="Landlord Contact & Keys" 
                icon={Key} 
                items={[
                  "Make sure you have the name of your landlord and an address in England or Wales.",
                  "Rent is not 'lawfully due' until this information is provided."
                ]} 
              />
            </Section>
          </div>
        )}

        {/* Post-Tenancy / During Tenancy Tab Content */}
        {activeTab === "post-tenancy" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            <Section title="During Tenancy" description="Ongoing responsibilities and documents while living in the property.">
              <Item 
                title="Maintenance & Repairs" 
                icon={Wrench} 
                items={[
                  "Report repairs to your landlord promptly.",
                  "Landlord must seek permission to access your home and give at least 24 hours' notice for repair visits."
                ]} 
              />
              <Item 
                title="Ongoing Compliance Updates" 
                icon={RefreshCcw} 
                isCritical={true}
                items={[
                  "<strong>Gas Safety &rarr;</strong> Landlord must renew and provide certificate every 12 months.",
                  "<strong>EICR &rarr;</strong> Must be renewed every 5 years.",
                  "<strong>Smart Meters &rarr;</strong> Can be installed if you pay the energy bills, subject to tenancy agreement checks."
                ]} 
              />
              <Item 
                title="Rent & Default Fees" 
                icon={ReceiptText} 
                items={[
                  "Pay the rent on time to avoid a default fee (if more than 14 days late).",
                  "Late fees are capped at 3% above Bank of England base rates by the Tenant Fees Act."
                ]} 
              />
            </Section>

            <Section title="End of Tenancy / Move-Out" description="Steps to ensure a smooth departure and fair deposit return.">
              <Item 
                title="Check-Out Report" 
                icon={ClipboardCheck} 
                isCritical={true}
                items={[
                  "Be present for the check-out inventory.",
                  "Condition will be compared against the original check-in report to agree on any fair deductions."
                ]} 
              />
              <Item 
                title="Deposit Return Summary" 
                icon={PoundSterling} 
                isCritical={true}
                items={[
                  "The deposit must be returned within 10 days of you and the landlord agreeing the final amount.",
                  "You cannot be charged for reasonable wear and tear."
                ]} 
              />
               <Item 
                title="Utility & Key Handover" 
                icon={Key} 
                items={[
                  "Take final meter readings when moving out.",
                  "Return all keys to the landlord or letting agent."
                ]} 
              />
            </Section>
            
          </div>
        )}
      </div>
    </div>
  );
}