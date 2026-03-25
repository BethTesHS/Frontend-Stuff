import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin,
  DollarSign,
  MessageSquare,
  User,
  Search,
  Filter,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Heart,
  Ban,
  Home
} from "lucide-react";

interface Roommate {
  id: number;
  name: string;
  age: number;
  gender: string;
  location: string;
  price: string;
  bio: string;
  img: string;
  preferences?: string[];
  likes?: string[];
  dislikes?: string[];
  roomDescription?: string;
  preferredLocations?: string[];
}

interface FindRoommatesProps {
  onMessageClick?: (roommate: Roommate) => void;
}

export function FindRoommatesContent({ onMessageClick }: FindRoommatesProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
  const [budgetRange, setBudgetRange] = useState("1000");

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 600);
  };

  const handleViewProfile = (roommate: Roommate) => {
    setSelectedRoommate(roommate);
    
    // Find the main scrollable container and scroll it to the absolute top
    setTimeout(() => {
      const el = document.getElementById('roommate-view-top');
      if (el) {
        const scrollContainer = el.closest('.overflow-y-auto') || el.closest('.overflow-auto');
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 50);
  };

  const handleMessageClick = (roommate: Roommate) => {
    if (!isAuthenticated) {
      toast.error("Please log in to message roommates");
      localStorage.setItem('login_redirect_path', '/find-roomie');
      navigate("/login");
      return;
    }
    onMessageClick?.(roommate);
  };

  const roomies: Roommate[] = [
    {
      id: 1,
      name: "Alex Rivera",
      age: 24,
      gender: "Male",
      location: "Downtown East",
      price: "$900 – $1,200",
      bio: "Architect grad student, love hiking & jazz. Looking for a tidy, friendly roommate. I cook a lot (vegan options usually). Quiet during the week.",
      img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400",
      preferences: ["Non-smoker", "Early bird", "Clean common areas"],
      likes: ["Hiking", "Jazz", "Cooking", "Board games"],
      dislikes: ["Loud parties on weekdays", "Messy kitchen"],
      roomDescription: "Looking for a private room in a 2bed/2bath apartment. Preferably with big windows and natural light. Don't mind sharing a bathroom if the budget is lower.",
      preferredLocations: ["Downtown East", "Westside", "University District"],
    },
    {
      id: 2,
      name: "Jamie Chen",
      age: 29,
      gender: "Non-Binary",
      location: "Northside Arts District",
      price: "$1,100 – $1,400",
      bio: "UX designer working hybrid. Cat dad to one very polite orange tabby. I have a spare room with a private bath. LGBTQ+ friendly space.",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=400",
      preferences: ["Pet-friendly (I have a cat)", "LGBTQ+ friendly", "Hybrid/Remote workers welcome"],
      likes: ["Design", "Coffee shops", "Indie movies", "Cats"],
      dislikes: ["Cigarette smoke", "Dog-only apartments"],
      roomDescription: "I already have an apartment! The open room is 12x14, gets great afternoon sun, and has its own detached bathroom. The living area is fully furnished.",
      preferredLocations: ["Northside Arts District (Current Location)"],
    },
    {
      id: 3,
      name: "Taylor Okafor",
      age: 22,
      gender: "Female",
      location: "University Loop",
      price: "$700 – $950",
      bio: "Pre‑med student, quiet during the week, enjoy board games & running on weekends. Looking for a shared apartment that has a dedicated parking spot.",
      img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400",
      preferences: ["Quiet hours after 10PM", "Students or young professionals", "Must have parking"],
      likes: ["Running", "Studying", "Board games", "Local gigs"],
      dislikes: ["Clutter", "Constant guests"],
      roomDescription: "Need a bedroom large enough for a desk and full-size bed. A dedicated parking spot is absolutely essential as I commute to the hospital.",
      preferredLocations: ["University Loop", "Medical Center", "South End"],
    },
    {
      id: 4,
      name: "Morgan Smith",
      age: 31,
      gender: "Male",
      location: "Riverside Complex",
      price: "$1,300 – $1,600",
      bio: "Music teacher, non-smoker, early bird. I already have a fully furnished living room. Looking to find someone to sign a new 12-month lease with.",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400",
      preferences: ["Musician friendly (I teach piano online sometimes)", "Clean", "Long-term lease"],
      likes: ["Classical music", "Vintage furniture", "Morning runs"],
      dislikes: ["Late night noise", "Poor communication"],
      roomDescription: "Looking to lease a new 2-bedroom place together. I have all living room and kitchen furniture (including a nice espresso machine!). We just need an unfurnished apartment.",
      preferredLocations: ["Riverside Complex", "Downtown East", "Historic District"],
    },
    {
      id: 5,
      name: "Riley Park",
      age: 27,
      gender: "Female",
      location: "Westown Suburbs",
      price: "$800 – $1,100",
      bio: "Remote graphic novelist. I come with 2 small, hypoallergenic dogs. Looking for a place with yard access. Friendly, chill vibe and very clean.",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400",
      preferences: ["Very pet friendly (I have 2 dogs)", "Yard access", "Ok with me working from home"],
      likes: ["Art", "Dogs", "Gardening", "Tea"],
      dislikes: ["Anti-pet landlords", "Carpet in main areas"],
      roomDescription: "Ideally looking for a house rental or ground-floor apartment with direct access to grass/yard for my dogs. Room needs to fit a queen bed and a drafting table.",
      preferredLocations: ["Westown Suburbs", "Pine Hills", "Anywards with a yard"],
    },
    {
      id: 6,
      name: "Jordan Grey",
      age: 26,
      gender: "Male",
      location: "Midtown Lofts",
      price: "$950 – $1,250",
      bio: "Barista & painter, massive plant collection. Looking for a shared creative space. Chill, respectful of boundaries, and always pay rent early.",
      img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400&h=400",
      preferences: ["Creative types welcome", "Good natural light", "Relaxed atmosphere"],
      likes: ["Houseplants", "Painting", "Coffee", "Thrifting"],
      dislikes: ["Micromanagers", "Dark apartments without windows"],
      roomDescription: "The room doesn't have to be huge, but I desperately need good window light for my plants. Would love a place with a small patio or balcony.",
      preferredLocations: ["Midtown Lofts", "Arts District", "Uptown"],
    },
  ];

  if (selectedRoommate) {
    return (
      <div id="roommate-view-top" className="space-y-6 animate-fade-in relative">
        {/* Back Button - Floating/Sticky */}
        <div className="sticky top-4 z-[50] w-fit -mt-2 mb-4">
          <Button 
            variant="outline"
            onClick={() => setSelectedRoommate(null)} 
            className="group bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-700 hover:text-slate-900 border-gray-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 dark:border-slate-700 shadow-md hover:shadow-lg rounded-full px-5 transition-all"
            title="Back to Roommates"
          >
             <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
             Back
          </Button>
        </div>

        <Card className="overflow-hidden border-none shadow-sm dark:bg-slate-900">
          <div className="relative">
            {/* Profile Header */}
            <div className="p-8 pt-8 flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-gray-100 dark:border-gray-800">
              
              {/* Profile Picture Wrapper */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 sm:w-48 sm:h-48">
                  <img
                    src={selectedRoommate.img}
                    alt={selectedRoommate.name}
                    className="w-full h-full object-cover rounded-3xl shadow-lg border-4 border-white dark:border-slate-800"
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left pt-2">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">{selectedRoommate.name}</h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          {selectedRoommate.age} y/o • {selectedRoommate.gender}
                        </span>
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/50 shadow-sm flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          {selectedRoommate.location}
                        </span>
                      </div>

                      {/* Budget */}
                      <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3 inline-flex">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{selectedRoommate.price} <span className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider ml-1">/ month</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Send Message Button (Moved Here) */}
                    <div className="mt-4 md:mt-0 flex justify-center md:justify-end w-full md:w-auto">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-6 rounded-xl flex items-center justify-center gap-2 text-base font-semibold shadow-lg shadow-blue-600/20"
                        onClick={() => handleMessageClick(selectedRoommate)}
                      >
                        <MessageSquare className="w-5 h-5" /> 
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8">
              {/* About Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  About {selectedRoommate.name.split(' ')[0]}
                </h3>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedRoommate.bio}
                  </p>
                </div>
              </div>

              {/* Room & Location Preferences (if any) */}
              {(selectedRoommate.roomDescription || selectedRoommate.preferredLocations) && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-indigo-500" />
                    Looking For
                  </h3>
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                    {selectedRoommate.roomDescription && (
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Ideal Room/Apartment</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedRoommate.roomDescription}
                        </p>
                      </div>
                    )}
                    
                    {selectedRoommate.preferredLocations && selectedRoommate.preferredLocations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2 mt-4">Preferred Locations</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoommate.preferredLocations.map((loc, idx) => (
                            <span key={idx} className="bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md text-sm border border-indigo-200 dark:border-indigo-700 shadow-sm">
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grid for Preferences, Likes, Dislikes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Preferences */}
                {selectedRoommate.preferences && selectedRoommate.preferences.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Preferences
                    </h3>
                    <ul className="space-y-2">
                      {selectedRoommate.preferences.map((pref, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <span>{pref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Likes */}
                {selectedRoommate.likes && selectedRoommate.likes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                      <Heart className="w-5 h-5 text-pink-500" />
                      Likes
                    </h3>
                    <ul className="space-y-2">
                      {selectedRoommate.likes.map((like, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <Heart className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                          <span>{like}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dislikes */}
                {selectedRoommate.dislikes && selectedRoommate.dislikes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                      <Ban className="w-5 h-5 text-red-500" />
                      Dislikes
                    </h3>
                    <ul className="space-y-2">
                      {selectedRoommate.dislikes.map((dislike, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{dislike}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl sm:rounded-full p-2 pl-5 w-full border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
        <Search className="w-5 h-5 text-gray-500 hidden sm:block flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by city, neighborhood, or budget..."
          className="bg-transparent border-none outline-none w-full text-sm md:text-base py-2.5 placeholder:text-gray-400 text-gray-800 dark:text-gray-100"
        />
        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-2.5 px-8 rounded-xl sm:rounded-full transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap sm:ml-2 flex-shrink-0">
          <Search className="w-4 h-4" /> Quick Find
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <Filter className="w-4 h-4" /> Advanced Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Location
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
              <option>Any neighborhood</option>
              <option>Downtown East</option>
              <option>Northside</option>
              <option>University Loop</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Budget
            </label>
            <div className="space-y-2">
              <input 
                type="range" 
                min="300" 
                max="2500" 
                step="50" 
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full accent-blue-500"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ${budgetRange}/month
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Gender
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
              <option>No Preference</option>
              <option>Female Only</option>
              <option>Male Only</option>
              <option>LGBTQ+ Friendly</option>
            </select>
          </div>
          <Button
            onClick={handleSearch}
            className="bg-slate-800 hover:bg-slate-900 w-full text-white font-semibold h-10 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" /> Update
          </Button>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Roommate Profiles
        </h2>
        <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-1.5 px-4 rounded-full text-sm font-semibold">
          {roomies.length} Profiles Found
        </span>
      </div>

      {/* Roommate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomies.map((roomie) => (
          <Card
            key={roomie.id}
            className="overflow-hidden hover:shadow-lg hover:border-blue-500/40 transition-all duration-300 group dark:border-gray-700 flex flex-col"
          >
            {/* Card Header (Photo + Name/Age Banner) */}
            <div className="h-48 relative overflow-hidden bg-gray-100">
              <img
                src={roomie.img}
                alt={`Profile of ${roomie.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-4">
                <div className="text-white w-full">
                  <h3 className="text-xl font-bold">{roomie.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-slate-100">
                    <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 shadow-sm">
                      {roomie.age} y/o
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 shadow-sm">
                      {roomie.gender}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex flex-col flex-1">
              {/* Location & Price */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {roomie.location}
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm">
                  <DollarSign className="w-3.5 h-3.5" />
                  {roomie.price}
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">
                "{roomie.bio}"
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleViewProfile(roomie)}
                  className="flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <User className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleMessageClick(roomie)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-6">
        <Button
          variant="outline"
          className="px-8 py-2.5 h-auto"
        >
          Load More Profiles
        </Button>
      </div>
    </div>
  );
}
