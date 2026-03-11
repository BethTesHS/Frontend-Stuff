import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, MessageSquare, TrendingUp } from "lucide-react";

interface RoommateOverviewProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export function RoommateOverview({ user, setActiveTab }: RoommateOverviewProps) {
  const stats = [
    {
      label: "Profile Views",
      value: "24",
      icon: Users,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Saved Roommates",
      value: "8",
      icon: Heart,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
    {
      label: "New Messages",
      value: "3",
      icon: MessageSquare,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Matches",
      value: "5",
      icon: TrendingUp,
      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
  ];

  const recentActivity = [
    {
      title: "Alex Rivera liked your profile",
      time: "2 hours ago",
      type: "like",
    },
    {
      title: "New message from Jamie Chen",
      time: "4 hours ago",
      type: "message",
    },
    {
      title: "Taylor Okafor viewed your room details",
      time: "1 day ago",
      type: "view",
    },
    {
      title: "Morgan Smith saved your profile",
      time: "2 days ago",
      type: "save",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-blue-100">
          Discover your perfect living situation or connect with potential roommates
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="p-6 hover:shadow-lg transition-shadow dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="p-6 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => setActiveTab("find")}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
              >
                <Users className="w-4 h-4 mr-2" /> Find Roommates
              </Button>
              <Button
                onClick={() => setActiveTab("my-room")}
                variant="outline"
                className="h-12 text-base"
              >
                <Heart className="w-4 h-4 mr-2" /> View My Listing
              </Button>
              <Button
                onClick={() => setActiveTab("messages")}
                variant="outline"
                className="h-12 text-base"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Messages
              </Button>
              <Button
                onClick={() => setActiveTab("profile")}
                variant="outline"
                className="h-12 text-base"
              >
                View Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Tips for Finding the Perfect Roommate
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>✓ Complete your profile with a clear photo and bio</li>
          <li>✓ Be honest about your preferences and expectations</li>
          <li>✓ Ask questions before making a decision</li>
          <li>✓ Arrange video calls before committing</li>
          <li>✓ Meet in person in a public place if possible</li>
        </ul>
      </Card>
    </div>
  );
}
