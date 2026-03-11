import React from "react";
import { Plus, X, Users, Phone, Mail, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AgentManagementForm = ({
  agents,
  addAgent,
  removeAgent,
  handleAgentChange,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Team Members</h3>
          <p className="text-sm text-gray-500">
            Add agents who will be associated with this agency profile.
          </p>
        </div>
        <Button
          onClick={addAgent}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Agent
        </Button>
      </div>

      <div className="grid gap-6">
        {agents.map((agent, index) => (
          <div
            key={agent.id}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all shadow-sm"
          >
            {/* Agent Header / Delete Action */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Agent Identity
                </span>
              </div>

              {agents.length > 1 && (
                <Button
                  onClick={() => removeAgent(agent.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Form Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                  <Users className="w-3 h-3" /> Full Name *
                </Label>
                <Input
                  value={agent.name}
                  onChange={(e) =>
                    handleAgentChange(agent.id, "name", e.target.value)
                  }
                  placeholder="e.g. John Smith"
                  required
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Professional Email *
                </Label>
                <Input
                  type="email"
                  value={agent.email}
                  onChange={(e) =>
                    handleAgentChange(agent.id, "email", e.target.value)
                  }
                  placeholder="john@agency.com"
                  required
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              {/* Role Select */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Role *
                </Label>
                <Select
                  value={agent.role}
                  onValueChange={(value) =>
                    handleAgentChange(agent.id, "role", value)
                  }
                >
                  <SelectTrigger className="h-11 border-gray-300">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="senior-agent">Senior Agent</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="junior-agent">Junior Agent</SelectItem>
                    <SelectItem value="trainee">Trainee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Direct Phone
                </Label>
                <Input
                  value={agent.phone}
                  onChange={(e) =>
                    handleAgentChange(agent.id, "phone", e.target.value)
                  }
                  placeholder="+44 20 1234 5678"
                  className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State / Bottom Add Button */}
      <div className="pt-4 flex justify-center">
        <p className="text-xs text-gray-400 italic">
          All agents added will receive an invite to set up their individual
          logins.
        </p>
      </div>
    </div>
  );
};

export default AgentManagementForm;
