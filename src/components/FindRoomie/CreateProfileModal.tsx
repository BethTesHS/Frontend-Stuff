import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, Eye, EyeOff, Smartphone, User, Settings, Mail } from "lucide-react";

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
  const [preferences, setPreferences] = useState({
    lookingWithOthers: false,
    tags: [] as string[],
    teamUps: false,
    description: "",
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [personalData, setPersonalData] = useState({ 
    age: "", 
    moveDate: "", 
    occupation: "",
    children: "No children" 
  });
  const [phone, setPhone] = useState("");

  const validateLogin = () => {
    if (!loginData.email.includes("@")) return "Please enter a valid email.";
    if (loginData.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const validatePersonal = () => {
    if (!personalData.age) return "Please select your age.";
    if (!personalData.moveDate) return "Please select a target move date.";
    if (!personalData.occupation) return "Occupation is required.";
    return null;
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateLogin();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success("Welcome back! Let's finish your profile.");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    const error = validatePersonal();
    if (error) return toast.error(error);
    setStep(2);
  };

  const handleFinish = () => {
    if (!phone || phone.length < 9) return toast.error("Please enter a valid phone number.");
    
    if (user) {
      localStorage.setItem(`roomie_profile_complete_${user.id}`, "true");
    }
    toast.success("Profile Verified!");
    onClose();
    window.location.reload();
  };

  const validatePreferences = () => {
    if (preferences.description.trim().length < 20) {
      return "Please provide a description of at least 20 characters.";
    }
    return null;
  };
  const handlePreferenceNext = () => {
    const error = validatePreferences();
    if (error) return toast.error(error);
    setStep(3);
  };
  const handleNextToPreferences = () => {
    const error = validatePersonal();
    if (error) return toast.error(error);
    setStep(2);
  };

  const handleNextToVerification = () => {
    const error = validatePreferences();
    if (error) return toast.error(error);
    setStep(3);
  };

  const toggleTag = (tag: string) => {
    setPreferences((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const header = !isAuthenticated 
    ? { title: "Sign In", icon: <User className="w-5 h-5" /> } 
    : step === 1 ? { title: "About You", icon: <User className="w-5 h-5" /> }
    : step === 2 ? { title: "Preferences", icon: <Settings className="w-5 h-5" /> }
    : { title: "Verification", icon: <Smartphone className="w-5 h-5" /> };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              step > 1 && isAuthenticated
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

        <div className="p-8 md:p-10">
          {/* STEP 1: AUTH OR PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {!isAuthenticated ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Login to your account
                    </h2>
                  </div>
                  <form onSubmit={handleInlineLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Email address
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="h-12 rounded-xl pl-4 pr-10 border-gray-200 focus:ring-blue-500"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              email: e.target.value,
                            })
                          }
                        />
                        <Mail className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-sm font-semibold text-gray-700">
                          Password
                        </label>
                        <button
                          type="button"
                          className="text-xs font-bold text-red-600 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-12 rounded-xl pl-4 pr-10 border-gray-200 focus:ring-blue-500"
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
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold text-lg transition-all active:scale-95"
                    >
                      {loading ? "Logging in..." : "Continue"}
                    </Button>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Don't have an account?{" "}
                        <span className="text-blue-600 font-bold cursor-pointer hover:underline">
                          Sign up
                        </span>
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="text-center mb-2">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Tell us about you
                    </h2>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Age
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter your age"
                      min="18"
                      max="100"
                      className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                      value={personalData.age}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          age: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Preferred move date
                    </label>
                    <Input
                      type="date"
                      className="h-12 rounded-xl bg-gray-50 border-gray-200"
                      value={personalData.moveDate}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          moveDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Occupation(s)
                    </label>
                    <Input
                      placeholder="e.g. Student"
                      className="h-12 rounded-xl bg-gray-50 border-gray-200"
                      value={personalData.occupation}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          occupation: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Children
                    </label>
                    <Select
                      onValueChange={(val) =>
                        setPersonalData({ ...personalData, children: val })
                      }
                      defaultValue="No children"
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                        <SelectValue placeholder="No children" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No children">No children</SelectItem>
                        <SelectItem value="Has children">
                          Has children
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleNextStep}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold transition-all mt-4"
                  >
                    Next: Preferences
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREFERENCES */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
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
                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-600">
                  {preferences.lookingWithOthers
                    ? "✓ I'm looking with other people"
                    : "I'm looking with other people"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "smoker", label: "Non-smoker"},
                  { id: "cat", label: "I have a cat"},
                  { id: "dog", label: "I have a dog"},
                  { id: "student", label: "I'm a student"},
                  { id: "lgbtq", label: "LGBTQ+ friendly"},
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    <Checkbox
                      checked={preferences.tags.includes(item.id)}
                      onCheckedChange={() => toggleTag(item.id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
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
                      className="text-xs font-bold text-gray-700 flex items-center gap-2"
                    >
                    I'm interested in team ups
                    </label>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Team ups are when you get together with others who are
                      looking for accommodation and start a new share house
                      together.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">
                  Description
                </label>
                <textarea
                  placeholder="Tell us a bit about why you (and your roomies) would be great to live with."
                  value={preferences.description}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      description: e.target.value,
                    })
                  }
                  className="w-full border-gray-200 bg-gray-50 rounded-xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <div className="flex justify-end">
                  <span
                    className={`text-[10px] ${preferences.description.length < 20 ? "text-red-400" : "text-gray-400"}`}
                  >
                    {preferences.description.length}/20 min characters
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePreferenceNext}
                className="w-full bg-black hover:bg-gray-900 text-white h-12 rounded-xl font-bold transition-transform active:scale-[0.98]"
              >
                Proceed to Verification
              </Button>
            </div>
          )}

          {/* STEP 3: PHONE (RED/BLUE COMBO) */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Verify phone number
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Required for the safety of our community.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Country
                  </label>
                  <Input
                    defaultValue="Kenya"
                    className="h-12 bg-gray-50 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="h-12 px-4 flex items-center bg-gray-100 border rounded-xl font-bold text-gray-600">
                      +254
                    </div>
                    <Input
                      placeholder="712 345 678"
                      className="h-12 flex-1 rounded-xl"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="phoneAccess"
                      id="allow"
                      className="accent-blue-600 w-4 h-4"
                    />
                    <label
                      htmlFor="allow"
                      className="text-xs font-bold text-gray-700"
                    >
                      Allow contact via phone
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="phoneAccess"
                      id="private"
                      defaultChecked
                      className="accent-blue-600 w-4 h-4"
                    />
                    <label
                      htmlFor="private"
                      className="text-xs font-bold text-gray-700"
                    >
                      Keep phone number private
                    </label>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleFinish}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-blue-100"
              >
                Finish & Get Started
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};