import { UserCheck, MessageSquare, Phone, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TenantAgent = ({ user, dashboardData, setActiveTab }: any) => {
  const agent = dashboardData?.agent;
  const isVerified = user?.tenantVerified || false;

  const handleSendMessage = () => {
    if (!isVerified) {
      setActiveTab('verification');
      return;
    }

    if (agent) {
      sessionStorage.setItem('messageToAgent', JSON.stringify({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        type: 'agent'
      }));
    }
    setActiveTab("messages");
  };

  return (
    <div className="space-y-6">
      {!isVerified && (
        <Alert className="border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Please verify your tenancy to contact your agent.
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100 ml-1"
              onClick={() => setActiveTab('verification')}
            >
              Verify now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-foreground tracking-light text-3xl font-bold leading-tight">
            Your Agent
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Information about the agent managing your property
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <UserCheck className="h-5 w-5" />
            Agent Information
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Details about your assigned property agent
          </p>
        </div>
        <div>
          {agent ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {agent.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{agent.name}</h3>
                  {agent.company && (
                    <p className="text-muted-foreground">{agent.company}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary">Property Agent</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{agent.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{agent.phone}</span>
                    </div>
                    {agent.office_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{agent.office_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">About</h4>
                  {agent.description ? (
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No description available.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={handleSendMessage}
                  disabled={!isVerified}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  disabled={!isVerified}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Agent Assigned
              </h3>
              <p className="text-muted-foreground mb-4">
                You don't have an agent assigned to your property yet. This information will appear once you have a property assignment.
              </p>
              <Button onClick={() => window.location.href = '/find-agent'}>
                Find an Agent
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};