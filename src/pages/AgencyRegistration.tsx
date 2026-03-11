import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { generateSlug, validateSlug, buildAgencyUrl } from "@/utils/subdomain";
import Layout from "@/components/Layout/Layout";
import { agencyApi } from "@/services/agencyApi";
import AgencyDetailsForm from "@/components/Agency/Agency Form Components/AgencyInformation";
import AgentManagementForm from "@/components/Agency/Agency Form Components/AgentManagementForm";
import SpecializationsAndReview from "@/components/Agency/Agency Form Components/SpecializationReviewForm";

const AgencyRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    agencyName: "",
    slug: "",
    description: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    website: "",
    establishedYear: "",
    licenseNumber: "",
    specializations: [] as string[],
    logo: null as File | null,
  });

  const [agents, setAgents] = useState([
    { id: 1, name: "", email: "", role: "", phone: "" },
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Agency Information",
      description: "Brand and contact details",
      icon: Building2,
    },
    {
      id: 2,
      title: "Team Management",
      description: "Add and invite your agents",
      icon: Users,
    },
    {
      id: 3,
      title: "Expertise & Review",
      description: "Finalize your profile",
      icon: ShieldCheck,
    },
  ];

  const specializationOptions = [
    "Residential Sales",
    "Commercial Sales",
    "Lettings",
    "Property Management",
    "New Homes",
    "Luxury Properties",
    "Investment Properties",
    "Land & Development",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "agencyName") updated.slug = generateSlug(value);
      return updated;
    });
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...prev.specializations, specialization],
    }));
  };

  const handleAgentChange = (id: number, field: string, value: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, [field]: value } : agent,
      ),
    );
  };

  const addAgent = () => {
    setAgents((prev) => [
      ...prev,
      { id: Date.now(), name: "", email: "", role: "", phone: "" },
    ]);
  };

  const removeAgent = (id: number) => {
    if (agents.length > 1)
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, logo: file }));
  };

  const validateStep = (step: number) => {
    if (step === 1)
      return (
        formData.agencyName &&
        formData.email &&
        formData.phone && 
        formData.address &&
        formData.password &&
        formData.password === formData.confirmPassword
      );
    if (step === 2) return agents.every((agent) => agent.name && agent.email && agent.role);
    if (step === 3) return formData.specializations.length > 0;
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep))
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    else toast.error("Please complete the required fields");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const registrationData = {
        name: formData.agencyName,
        slug: formData.slug,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: `${formData.address}${formData.city ? `, ${formData.city}` : ""}${formData.postcode ? `, ${formData.postcode}` : ""}`,
        website: formData.website,
        description: formData.description,
        agents: agents.filter((agent) => agent.name && agent.email && agent.role),
        specializations: formData.specializations,
      };
      const response = await agencyApi.register(registrationData);
      toast.success(`Agency profile created successfully! Redirecting...`);
      setTimeout(() => {
        window.location.href = `/dashboard?agency=${response.agency.slug}`;
      }, 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Registration failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8F9FB]">
        <div className="max-w-[1200px] mx-auto pt-10 pb-20 px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg">
                <Settings2 className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Agency Setup
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Step {currentStep} of 3 • {steps[currentStep - 1].title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/agency-profile")}
              className="text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Exit Setup
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="sticky top-10 space-y-6">
                {/* Navigation Menu */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  {/* Hero Wording */}
                  <div className="px-2 pb-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                      Create Your <br />
                      <span className="text-red-600">Agency Profile</span>
                    </h1>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Join our platform and unlock powerful tools designed
                      specifically for estate agencies.
                    </p>
                  </div>
                  <nav className="space-y-4 relative">
                    {/* Progress Line */}
                    <div className="absolute left-[27px] top-2 bottom-2 w-[2px] bg-slate-300 z-0" />

                    {steps.map((step, index) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;

                      return (
                        <div key={step.id} className="relative z-10">
                          <button
                            disabled={!isCompleted && !isActive}
                            onClick={() => setCurrentStep(step.id)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${
                              isActive
                                ? "bg-blue-900 text-white shadow-md shadow-blue-200"
                                : "text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed"
                            }`}
                          >
                            {/* Icon Container */}
                            <div
                              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? "bg-red-600 shadow-lg shadow-red-500/30 scale-110"
                                  : isCompleted
                                    ? "bg-blue-300 text-white"
                                    : "bg-white border-2 border-slate-100 text-slate-400"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <step.icon
                                  className={`w-4 h-4 ${isActive ? "text-white" : ""}`}
                                />
                              )}
                            </div>

                            {/* Text */}
                            <div className="text-left overflow-hidden">
                              <p
                                className={`text-[13px] font-bold truncate ${isActive ? "text-white" : "text-slate-900"}`}
                              >
                                {step.title}
                              </p>
                              <p
                                className={`text-[10px] font-medium truncate ${isActive ? "text-blue-200" : "text-slate-400"}`}
                              >
                                {step.description}
                              </p>
                            </div>

                            {isActive && (
                              <ChevronRight className="ml-auto w-4 h-4 text-red-400 animate-pulse" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </nav>

                  {/* Help Box */}
                  <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
                    <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1">
                      Need Help?
                    </p>
                    <p className="text-[11px] text-blue-700/70 leading-relaxed font-medium">
                      Our support team is available 24/7 to help you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
              <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-8">
                  {currentStep === 1 && (
                    <AgencyDetailsForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleLogoUpload={handleLogoUpload}
                    />
                  )}
                  {currentStep === 2 && (
                    <AgentManagementForm
                      agents={agents}
                      addAgent={addAgent}
                      removeAgent={removeAgent}
                      handleAgentChange={handleAgentChange}
                    />
                  )}
                  {currentStep === 3 && (
                    <SpecializationsAndReview
                      formData={formData}
                      agents={agents}
                      specializationOptions={specializationOptions}
                      handleSpecializationToggle={handleSpecializationToggle}
                    />
                  )}
                </CardContent>

                {/* Fixed Footer within Card */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentStep === 1}
                    className="font-bold text-slate-600 hover:bg-blue-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 " /> Previous
                  </Button>

                  <div className="flex items-center gap-3">
                    {currentStep < 3 ? (
                      <Button
                        onClick={nextStep}
                        className="bg-blue-800 hover:bg-blue-900 text-white px-8 font-bold h-11"
                      >
                        Continue to Step {currentStep + 1}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-10 font-bold h-11 shadow-lg"
                      >
                        {isSubmitting
                          ? "Finalizing..."
                          : "Create Agency Profile"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgencyRegistration;
