import React from "react";
import {
  Building2,
  Users,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Globe,
} from "lucide-react";

const SpecializationsAndReview = ({
  formData,
  agents,
  specializationOptions,
  handleSpecializationToggle,
}) => {
  const activeAgents = agents.filter((a) => a.name);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* --- Section 1: Specializations --- */}
      <section>
        <div className="mb-8 border-l-4 border-red-600 pl-4">
          <h3 className="text-2xl font-bold text-slate-900">
            Agency Specializations
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            Select the core services your agency provides
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {specializationOptions.map((spec) => {
            const isSelected = formData.specializations.includes(spec);
            return (
              <div
                key={spec}
                onClick={() => handleSpecializationToggle(spec)}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col items-center text-center gap-3 ${
                  isSelected
                    ? "border-red-600 bg-red-50/30"
                    : "border-gray-200 bg-white hover:border-slate-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-tight ${
                    isSelected ? "text-red-700" : "text-slate-600"
                  }`}
                >
                  {spec}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --- Section 2: Review Grid --- */}
      <section className="pt-8 border-t border-gray-100">
        <div className="mb-8 border-l-4 border-slate-900 pl-4">
          <h3 className="text-2xl font-bold text-slate-900">Final Review</h3>
          <p className="text-sm text-gray-500 font-medium">
            Verify your agency profile details
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Agency Details Card */}
          <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-red-500" />
                <h4 className="font-bold text-lg uppercase tracking-widest">
                  Core Identity
                </h4>
              </div>

              <div className="space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Official Name
                  </p>
                  <p className="font-bold text-lg">
                    {formData.agencyName || "Not set"}
                  </p>
                </div>

                <div className="pb-3 border-b border-white/10">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Public URL
                  </p>
                  <p className="font-mono text-sm text-red-400">
                    {formData.slug}.homed.com
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm font-semibold truncate">
                      {formData.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-sm font-semibold">{formData.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-300">
                    {formData.address}, {formData.city} {formData.postcode}
                  </p>
                </div>
              </div>
            </div>
            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 opacity-10">
            </div>
          </div>

          <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-red-600" />
              <h4 className="font-bold text-lg text-slate-900 uppercase tracking-widest">
                Team & Expertise
              </h4>
            </div>

            <div className="space-y-6">
              {/* Active Agents List */}
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest">
                  Team Size: {activeAgents.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeAgents.length > 0 ? (
                    activeAgents.map((agent, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200"
                      >
                        {agent.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      No agents added
                    </span>
                  )}
                </div>
              </div>

              {/* Specializations Tags */}
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest">
                  Service Coverage
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                  {formData.specializations.length === 0 && (
                    <span className="text-sm text-gray-400 italic">
                      No specializations selected
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2 text-xs text-slate-500 italic">
                <Globe className="w-3 h-3" />
                This data will be used to generate your agency landing page.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SpecializationsAndReview;
