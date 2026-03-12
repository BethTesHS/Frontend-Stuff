import { useState, useEffect } from "react";
import { 
  Building, 
  User, 
  MapPin, 
  Plus, 
  Search, 
  MoreVertical, 
  UserMinus, 
  UserPlus, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SelectAgent from "@/pages/SelectAgent";
import { toast } from "sonner";

export const PropertyManagers = () => {
  const [view, setView] = useState<"list" | "select-agent">("list");
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingAgent, setRemovingAgent] = useState<{property: any, agent: any} | null>(null);

  // MOCK DATA - We need this api,, for now we don't have it,,propertyApi.getLandlordProperties()
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setProperties([
        {
          id: 1,
          title: "2 Bedroom Apartment",
          location: "Kilimani, Nairobi",
          manager: { id: 101, name: "Prime Realty", rating: 4.8 },
          status: "managed"
        },
        {
          id: 2,
          title: "Studio Apartment",
          location: "Westlands, Nairobi",
          manager: null,
          status: "unassigned"
        },
        {
          id: 3,
          title: "Luxury Villa",
          location: "Karen, Nairobi",
          manager: { id: 102, name: "Elite Housing", rating: 4.5 },
          status: "pending",
          requestDate: "2024-03-10"
        }
      ]);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const handleSelectAgent = (property: any) => {
    setSelectedProperty(property);
    setView("select-agent");
  };

  const handleRemoveAgent = (property: any) => {
    setRemovingAgent({ property, agent: property.manager });
  };

  const confirmRemoval = async () => {
    toast.success(`Removed ${removingAgent?.agent.name} from ${removingAgent?.property.title}`);
    setProperties(prev => prev.map(p => 
      p.id === removingAgent?.property.id ? { ...p, manager: null, status: 'unassigned' } : p
    ));
    setRemovingAgent(null);
  };

  const cancelRequest = (propertyId: number) => {
    toast.info("Management request cancelled");
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, manager: null, status: 'unassigned' } : p
    ));
  };

  if (view === "select-agent") {
    return <SelectAgent propertyData={selectedProperty} onBack={() => setView("list")} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Property Managers</h1>
          <p className="text-sm text-muted-foreground">Oversee and assign agents for your real estate portfolio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden border-slate-200 dark:border-slate-800">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Property Info Info */}
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{property.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 mr-1" /> {property.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manager Status Area */}
                <div className="p-6 flex-1 flex flex-col justify-center">
                  {property.status === "managed" ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="text-blue-600 w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Current Manager</p>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{property.manager.name}</p>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Active Management
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm" className="h-8 text-xs">View Agent</Button>
                         <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleSelectAgent(property)}>Change</Button>
                         <Button variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveAgent(property)}>Remove</Button>
                      </div>
                    </div>
                  ) : property.status === "pending" ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
                          <Clock className="text-amber-600 w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Request Pending</p>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{property.manager.name}</p>
                          <p className="text-[11px] text-amber-600">Sent on {property.requestDate}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 border-amber-200 text-amber-700" onClick={() => cancelRequest(property.id)}>Cancel Request</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <AlertCircle className="text-slate-400 w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Manager</p>
                          <p className="font-bold text-slate-500 italic">None Assigned</p>
                        </div>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9" onClick={() => handleSelectAgent(property)}>
                        <UserPlus className="w-4 h-4 mr-2" /> Find Agent
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Removal Confirmation */}
      <AlertDialog open={!!removingAgent} onOpenChange={() => setRemovingAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Management Agency?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-bold text-slate-900 dark:text-white">{removingAgent?.agent?.name}</span> as the manager for {removingAgent?.property?.title}. They will no longer have access to manage tenants or applications for this property.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmRemoval}>
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};