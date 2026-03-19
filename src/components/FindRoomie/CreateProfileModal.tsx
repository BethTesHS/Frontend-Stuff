import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added for privacy toggle
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Smartphone,
  User,
  Settings,
  Mail,
  MapPin,
  ChevronDown,
} from "lucide-react";

export const CreateProfileModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isAuthenticated, login, user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [personalData, setPersonalData] = useState({
    age: "",
    moveDate: "",
    occupation: "",
    location: "",
    children: "No children",
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [preferences, setPreferences] = useState({
    lookingWithOthers: false,
    tags: [] as string[],
    teamUps: false,
    description: "",
  });

  const [verification, setVerification] = useState({
    country: "Kenya",
    phone: "",
    privacy: "private", 
  });

  const validatePersonal = () => {
    if (!personalData.age) return "Please enter your age.";
    if (!personalData.occupation) return "Occupation is required.";
    if (!personalData.location) return "Location is required.";
    if (!personalData.moveDate) return "Please select a target move date.";
    return null;
  };

  const handleNextToPreferences = async () => {
    const error = validatePersonal();
    if (error) return toast.error(error);

    if (!isAuthenticated) {
      if (!loginData.email || !loginData.password) {
        return toast.error("Please log in or register to continue.");
      }

      setLoading(true);
      try {
        await login(loginData.email, loginData.password);
        toast.success("Logged in successfully!");
        setStep(2);
      } catch (err: any) {
        toast.error(err.message || "Login failed. Check your credentials.");
        return;
      } finally {
        setLoading(false);
      }
    } else {
      setStep(2);
    }
  };

  const handleFinish = async () => {
    if (!verification.phone || verification.phone.length < 9)
      return toast.error("Please enter a valid phone number.");

    setLoading(true);
    try {
      const finalPayload = {
        ...personalData,
        ...preferences,
        ...verification,
        userId: user?.id,
      };

      console.log("Submitting to Backend:", finalPayload);

      if (user) {
        localStorage.setItem(`roomie_profile_complete_${user.id}`, "true");
      }

      toast.success("Profile Verified & Created!");
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setPreferences((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const header =
    step === 1
      ? { title: "About You", icon: <User className="w-5 h-5" /> }
      : step === 2
        ? { title: "Preferences", icon: <Settings className="w-5 h-5" /> }
        : { title: "Verification", icon: <Smartphone className="w-5 h-5" /> };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-gray-950">
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              step > 1
                ? "text-gray-600 hover:text-blue-600"
                : "text-transparent pointer-events-none"
            }`}
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              {header.icon}
            </span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight text-xs">
              {header.title}
            </h3>
          </div>
          <div className="w-12" />
        </div>

        <div className="p-8 md:p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* STEP 1: ABOUT YOU */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  Tell us about you
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Age
                  </label>
                  <Input
                    type="number"
                    placeholder="25"
                    className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200"
                    value={personalData.age}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, age: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Occupation
                  </label>
                  <Input
                    placeholder="e.g. Student"
                    className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200"
                    value={personalData.occupation}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        occupation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                  Location
                </label>
                <div className="relative">
                  <Input
                    placeholder="Preferred area, e.g. London"
                    className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 pl-10"
                    value={personalData.location}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        location: e.target.value,
                      })
                    }
                  />
                  <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Children
                  </label>
                  <Select
                    onValueChange={(val) =>
                      setPersonalData({ ...personalData, children: val })
                    }
                    defaultValue={personalData.children}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200">
                      <SelectValue placeholder="No children" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No children">No children</SelectItem>
                      <SelectItem value="Has children">Has children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Move Date
                  </label>
                  <Input
                    type="date"
                    className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200"
                    value={personalData.moveDate}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        moveDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {!isAuthenticated && (
                <div className="pt-4 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-800"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 font-bold">
                        Secure your profile
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Email address"
                        className="h-12 rounded-xl pl-10 border-gray-200"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                      />
                      <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="h-12 rounded-xl pl-10 pr-10 border-gray-200"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleNextToPreferences}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold transition-all"
              >
                {loading ? "Authenticating..." : "Next: Preferences"}
              </Button>
            </div>
          )}

          {/* STEP 2: PREFERENCES*/}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your roomies
                </h2>
              </div>

              <div
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    lookingWithOthers: !preferences.lookingWithOthers,
                  })
                }
                className={`w-full p-4 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors ${preferences.lookingWithOthers ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 dark:border-gray-800"}`}
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {preferences.lookingWithOthers
                    ? "✓ I'm looking with other people"
                    : "I'm looking with other people"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "smoker", label: "Non-smoker" },
                  { id: "cat", label: "I have a cat" },
                  { id: "dog", label: "I have a dog" },
                  { id: "student", label: "I'm a student" },
                  { id: "lgbtq", label: "LGBTQ+ friendly" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all"
                  >
                    <Checkbox
                      checked={preferences.tags.includes(item.id)}
                      onCheckedChange={() => toggleTag(item.id)}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="teamups"
                    checked={preferences.teamUps}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, teamUps: !!checked })
                    }
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="teamups"
                      className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                    >
                      I'm interested in team ups
                    </label>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Team ups are when you get together with others who are
                      looking for accommodation and start a new share house
                      together.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Description
                </label>
                <p className="text-xs text-gray-400">
                  Tell us a bit about why you (and your roomies) would be great
                  to live with.
                </p>
                <textarea
                  placeholder="Share your lifestyle, hobbies, and what you're looking for..."
                  value={preferences.description}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      description: e.target.value,
                    })
                  }
                  className="w-full border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <Button
                onClick={() => setStep(3)}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold transition-all"
              >
                Proceed to Verification
              </Button>
            </div>
          )}

          {/* STEP 3: VERIFICATION (Updated with Image 1 fields) */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verify phone number
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Phone verification is required by all users for the safety of
                  the community.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Country
                </label>
                <Select
                  value={verification.country}
                  onValueChange={(val) =>
                    setVerification({ ...verification, country: val })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United Kingdom">
                      United Kingdom
                    </SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Phone number
                </label>
                <div className="flex gap-2">
                  <div className="h-12 px-4 flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 rounded-xl font-bold text-gray-600">
                    {verification.country === "Kenya"
                      ? "+254"
                      : verification.country === "India"
                        ? "+91"
                        : "+1"}
                  </div>
                  <Input
                    placeholder="712 345 678"
                    className="h-12 flex-1 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200"
                    value={verification.phone}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Phone number access
                </label>
                <RadioGroup
                  value={verification.privacy}
                  onValueChange={(val) =>
                    setVerification({ ...verification, privacy: val })
                  }
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="public"
                      id="public"
                      className="mt-1"
                    />
                    <div className="grid gap-1">
                      <label
                        htmlFor="public"
                        className="text-sm font-bold leading-none text-gray-800 dark:text-gray-200"
                      >
                        Allow contact via phone
                      </label>
                      <p className="text-xs text-gray-500">
                        Phone number will be available to verified Roomies
                        users.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="private"
                      id="private"
                      className="mt-1"
                    />
                    <div className="grid gap-1">
                      <label
                        htmlFor="private"
                        className="text-sm font-bold leading-none text-gray-800 dark:text-gray-200"
                      >
                        Keep phone number private
                      </label>
                      <p className="text-xs text-gray-500">
                        You can communicate through the Roomies messaging
                        system.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                    ▼ I entered the wrong phone number
                  </summary>
                  <p className="mt-2 text-xs text-gray-500 pl-4">
                    You can{" "}
                    <span className="text-blue-600 underline">
                      re-enter your correct phone number
                    </span>{" "}
                    and start verification again.
                  </p>
                </details>
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                    ▼ I haven't received a code yet
                  </summary>
                  <p className="mt-2 text-xs text-gray-500 pl-4">
                    Please be patient as it can take up to a minute to receive
                    your verification code.
                  </p>
                </details>
              </div>
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold transition-all-none"
              >
                {loading ? "Verifying..." : "Send verification code"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};