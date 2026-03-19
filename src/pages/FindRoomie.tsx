import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout/Layout";
import { FindRoommatesContent } from "@/components/FindRoomie/FindRoommatesContent";
import { Button } from "@/components/ui/button";

const FindRoomie = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/buyer-dashboard?activeTab=find-roomie", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleListAd = () => {
    localStorage.setItem('login_redirect_path', '/buyer-dashboard?activeTab=find-roomie');
    navigate('/login');
  };

  // Guest view — public browse without auth
  return (
    <Layout>
      <div className="animate-fade-in py-8">
        <div className="px-6 max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Find Your Potential Roomie
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse profiles of people looking for their ideal living situation
              </p>
            </div>
            <Button
              onClick={handleListAd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 h-12 rounded-lg shrink-0"
            >
              List an Ad
            </Button>
          </div>
          <FindRoommatesContent
            onMessageClick={() => {
              toast({
                title: "Login Required",
                description: "Please log in to message roommates",
              });
              navigate("/login");
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default FindRoomie;
