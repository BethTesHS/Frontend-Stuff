import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import Layout from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, Star, Zap, Briefcase } from "lucide-react";
import { findAgentApi } from "@/services/api";

// Agent type definition
type Agent = {
  id: number;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  type: "estate" | "letting";
  phone?: string;
  email?: string;
  company?: string;
  agency?: string;
  experience?: string;
  years_experience?: number;
  office_address?: string;
  service_areas?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
};

interface SearchConfiguration {
  location: string;
  agentName: string;
  radius: string;
  agentType: string;
}

const FindAgent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const [searchConfig, setSearchConfig] = useState<SearchConfiguration>(() => ({
    location: searchParams.get("location") || "",
    agentName: searchParams.get("agentName") || "",
    radius: searchParams.get("radius") || "",
    agentType:
      searchParams.get("agentType") || searchParams.get("type") || "both",
  }));

  const [inputs, setInputs] = useState<SearchConfiguration>(searchConfig);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchConfig.location) params.set("location", searchConfig.location);
    if (searchConfig.agentName) params.set("agentName", searchConfig.agentName);
    if (searchConfig.radius) params.set("radius", searchConfig.radius);
    if (searchConfig.agentType && searchConfig.agentType !== "both")
      params.set("agentType", searchConfig.agentType);
    setSearchParams(params, { replace: true });
  }, [searchConfig, setSearchParams]);

  useEffect(() => {
    performSearch(searchConfig);
  }, [searchConfig]);

  const performSearch = async (config: SearchConfiguration) => {
    setIsSearching(true);
    setLoading(true);
    setError("");

    try {
      const apiParams = {
        location: config.location || undefined,
        name: config.agentName || undefined,
        radius: config.radius || undefined,
        type: config.agentType === "both" ? undefined : config.agentType,
      };

      const response = await findAgentApi.getFeaturedAgents(12);

      const agentData = response.data || response;

      setAgents(Array.isArray(agentData) ? agentData : []);

      if (Array.isArray(agentData) && agentData.length === 0) {
        setError("No agents found matching your criteria.");
      }
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(
        err.response?.data?.message ||
          "Could not connect to the agent service.",
      );
      setAgents([]);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleSearchClick = () => setSearchConfig(inputs);
  const handleClearSearch = () => {
    const emptyConfig = {
      location: "",
      agentName: "",
      radius: "",
      agentType: "both",
    };
    setInputs(emptyConfig);
    setSearchParams({});
    setSearchConfig(emptyConfig);
    setError("");
  };

  const updateInput = (key: keyof SearchConfiguration, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };
  const handleStartSearch = () => navigate("/agents");
  const handleViewProfile = (agent: Agent) => navigate(`/agent?id=${agent.id}`);
  const handleContactAgent = (agent: Agent) =>
    navigate(
      `/contact-agent?agentName=${encodeURIComponent(agent.name)}&agentId=${agent.id}&propertyTitle=General+Inquiry`,
    );

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto pt-6 px-4">
          <div className="relative h-[320px] rounded-[40px] overflow-hidden border-4 border-white shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=2073"
              className="w-full h-full object-cover"
              alt="Modern Interior"
            />
            <div className="absolute inset-0 bg-blue-900/40 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
                Find Your Property Expert
              </h1>
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 text-white">
                <Users className="h-6 w-6 text-red-600" />
                <span className="font-bold">
                  Verified Estate & Letting Agents
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH SECTION */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
          <Card className="rounded-[35px] shadow-lg border-none bg-white">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-800" />
                    <Input
                      className="pl-10 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-700"
                      placeholder="Postcode or area"
                      value={inputs.location}
                      onChange={(e) => updateInput("location", e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSearchClick()
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Agent Name
                  </label>
                  <Input
                    className="h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-700"
                    placeholder="Optional"
                    value={inputs.agentName}
                    onChange={(e) => updateInput("agentName", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Radius
                  </label>
                  <Select
                    value={inputs.radius}
                    onValueChange={(v) => updateInput("radius", v)}
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-semibold text-slate-900">
                      <SelectValue placeholder="Distance" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="this-area">This area only</SelectItem>
                      <SelectItem value="1-mile">+1 mile</SelectItem>
                      <SelectItem value="5-miles">+5 miles</SelectItem>
                      <SelectItem value="10-miles">+10 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Specialty
                  </label>
                  <Select
                    value={inputs.agentType}
                    onValueChange={(v) => updateInput("agentType", v)}
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-semibold text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="both">All Specialists</SelectItem>
                      <SelectItem value="estate">Sales Experts</SelectItem>
                      <SelectItem value="letting">Lettings Experts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  className="flex-1 h-14 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-lg shadow-md transition-transform active:scale-95"
                  onClick={handleSearchClick}
                  disabled={isSearching}
                >
                  <Search className="w-5 h-5 mr-2" />
                  {isSearching ? "Finding Experts..." : "Search Agents"}
                </Button>
                {(inputs.location || inputs.agentName) && (
                  <Button
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-2 border-blue-900 text-blue-900 font-black hover:bg-blue-900 hover:text-white"
                    onClick={handleClearSearch}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* PILL STATS BAR */}
        <section className="max-w-7xl mx-auto px-6 mt-12 mb-16">
          <div className="flex flex-wrap items-center justify-around gap-4 py-6 px-8 bg-white border border-slate-100 rounded-[30px] shadow-sm">
            {[
              {
                label: "TOP RATED",
                val: "4.9/5",
                icon: <Star className="text-red-700 fill-red-700" />,
                bg: "bg-red-50",
              },
              {
                label: "EXPERTS NEAR YOU",
                val: agents.length,
                icon: <Users className="text-blue-900" />,
                bg: "bg-blue-50",
              },
              {
                label: "RESPONSE TIME",
                val: "< 2hrs",
                icon: <Zap className="text-red-700" />,
                bg: "bg-red-50",
              },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center`}
                >
                  {s.icon}
                </div>
                <div>
                  <div className="text-xl font-black text-blue-900">
                    {s.val}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AGENTS LISTING */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-blue-900 tracking-tight">
              {searchConfig.location
                ? `Experts in ${searchConfig.location}`
                : "Find Agents"}
            </h2>
            <Badge className="bg-red-800 text-white rounded-lg px-4 py-1.5 font-bold border-none">
              Verified Agents
            </Badge>
          </div>

          {error && (
            <div className="text-center py-10 text-red-700 font-bold">
              {error}
            </div>
          )}

          {!error && agents.length === 0 && !isSearching && (
            <div className="text-center py-10 text-slate-400 font-bold">
              No agents currently available.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="rounded-[28px] overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white group"
              >
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-blue-900 group-hover:text-blue-700 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-red-800 text-xs font-black uppercase tracking-widest mt-1">
                        {agent.specialization}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-red-700 font-black text-sm">
                        <Star className="h-4 w-4 fill-red-700" />{" "}
                        {agent.rating || "New"}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {agent.reviews} Reviews
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <MapPin className="h-3 w-3 text-red-700" />{" "}
                      {agent.location}
                    </div>
                    {agent.experience && (
                      <div className="bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
                        <Briefcase className="h-3 w-3" /> {agent.experience}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl mb-6 border-l-4 border-red-800">
                    <p className="text-xs text-slate-700 italic leading-relaxed line-clamp-2">
                      "
                      {agent.description ||
                        "Dedicated property expert helping clients achieve their real estate dreams."}
                      "
                    </p>
                  </div>

                  <div className="w-full border-t border-dashed border-slate-100 pt-4 mb-6">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>AGENCY</span>
                      <span className="text-blue-800">
                        {agent.company || agent.agency || "Premier Realty"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl border-blue-900 text-blue-900 font-black hover:bg-blue-900 hover:text-white h-11 transition-all"
                      onClick={() => handleViewProfile(agent)}
                    >
                      Details
                    </Button>
                    <Button
                      className="rounded-xl bg-blue-900 text-white font-black h-11 shadow-md hover:bg-blue-800 transition-all"
                      onClick={() => handleContactAgent(agent)}
                    >
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FOOTER CTA
        <section className="max-w-7xl mx-auto px-6 mt-24">
          <div className="bg-blue-900 rounded-[50px] p-12 text-center relative overflow-hidden">
            <h2 className="text-3xl font-black text-white mb-4">
              Start your property journey today.
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto font-medium">
              Whether you're selling, buying, or renting, our network of
              professional agents is ready to guide you.
            </p>
            <Button
              size="lg"
              className="bg-red-700 text-white hover:bg-red-800 rounded-2xl px-12 font-black text-lg h-16 shadow-xl"
              onClick={handleStartSearch}
            >
              Get Started
            </Button>
          </div>
        </section> */}
      </div>
    </Layout>
  );
};

export default FindAgent;