import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import ConnectedPlatforms from "@/components/profile/ConnectedPlatforms";
import UserPlatformStatus from "@/components/profile/UserPlatformStatus";
import CheckInCalendar from "@/components/ui/check-in-calendar";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Share2, Heart } from "lucide-react";

const CreatorProfile = () => {
  const [match, params] = useRoute<{ id: string }>("/creator/:id");
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("about");
  
  // Redirect if not found
  if (!match) {
    return null;
  }
  
  const creatorId = parseInt(params.id);
  
  // Fetch creator data
  const { data: creator, isLoading, error } = useQuery({
    queryKey: ["/api/creators", creatorId, { userId: user?.id }],
    enabled: !!creatorId && !!user,
  });
  
  // Handle follow/unfollow
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      if (creator?.isFollowedByUser) {
        // Unfollow
        await apiRequest("DELETE", "/api/follows", {
          userId: user.id,
          creatorId: creator.id
        });
        return false;
      } else {
        // Follow
        await apiRequest("POST", "/api/follows", {
          userId: user.id,
          creatorId: creator.id
        });
        return true;
      }
    },
    onSuccess: (isFollowing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "following"] });
      
      toast({
        title: isFollowing ? "追蹤成功" : "已取消追蹤",
        description: isFollowing ? "您已成功追蹤此創作者" : "您已取消追蹤此創作者",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "操作失敗",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });
  
  const handleFollowToggle = () => {
    if (followMutation.isPending) return;
    followMutation.mutate();
  };
  
  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${creator?.name} on FanHub`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "連結已複製",
        description: "分享連結已複製到剪貼簿",
      });
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse text-primary">
          <i className="fas fa-circle-notch fa-spin text-4xl"></i>
        </div>
      </div>
    );
  }
  
  if (error || !creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h2 className="text-xl font-bold">發生錯誤</h2>
          <p>{(error as Error)?.message || "無法載入創作者資料"}</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            返回首頁
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Creator Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="w-full h-48 bg-gradient-to-r from-primary-dark to-primary-light relative overflow-hidden">
            {creator.coverImage && (
              <img 
                src={creator.coverImage} 
                alt={`${creator.name} cover`} 
                className="w-full h-full object-cover opacity-50" 
              />
            )}
          </div>
          
          {/* Profile Photo & Name */}
          <div className="absolute transform -translate-y-1/2 left-8 top-48 flex items-end">
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-full border-4 border-white shadow-md">
                <AvatarImage src={creator.user?.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {creator.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-600 rounded-full border-2 border-white flex items-center justify-center" title="線上中">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4 mb-2 text-white drop-shadow-lg">
              <h1 className="text-3xl font-bold">{creator.name}</h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-3">
            <Button 
              variant="outline" 
              className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full font-medium flex items-center shadow-sm"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
            
            <Button
              className={`${
                creator.isFollowedByUser 
                  ? "bg-accent hover:bg-accent-light" 
                  : "bg-accent hover:bg-accent-light"
              } text-white px-6 py-2 rounded-full font-medium flex items-center shadow-sm`}
              onClick={handleFollowToggle}
              disabled={followMutation.isPending}
            >
              <Heart className="mr-2 h-4 w-4" />
              {creator.isFollowedByUser ? "追蹤中" : "追蹤"}
            </Button>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="mt-16 px-8 pb-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="flex border-b border-gray-200 -mx-8 px-8 mb-6 bg-transparent">
              <TabsTrigger 
                value="about" 
                className={`px-4 py-3 font-medium ${
                  activeTab === "about" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                關於
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className={`px-4 py-3 font-medium ${
                  activeTab === "content" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                內容
              </TabsTrigger>
              <TabsTrigger 
                value="community" 
                className={`px-4 py-3 font-medium ${
                  activeTab === "community" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                社群
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Bio Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">介紹</h2>
                    <p className="text-gray-700">
                      {creator.bio || "這位創作者還沒有新增介紹。"}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-6 mt-4 text-gray-600">
                      <div className="flex items-center">
                        <i className="fas fa-users mr-2 text-primary"></i>
                        <span>{creator.followerCount || 0} 位粉絲</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-calendar-check mr-2 text-primary"></i>
                        <span>{new Date(creator.createdAt).getFullYear()} 年加入</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Check-in */}
                  <CheckInCalendar
                    creatorId={creator.id}
                    hasCheckedInToday={creator.hasCheckedInToday || false}
                    checkinStreak={creator.checkinStreak || 0}
                    onCheckInSuccess={(newStreak) => {
                      queryClient.setQueryData(
                        ["/api/creators", creatorId, { userId: user?.id }],
                        { ...creator, hasCheckedInToday: true, checkinStreak: newStreak }
                      );
                    }}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Connected Platforms */}
                  <ConnectedPlatforms userId={creator.userId} />
                  
                  {/* Your Connection Status */}
                  <UserPlatformStatus userId={user?.id || 0} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-0">
              <div className="p-8 text-center text-gray-500">
                <i className="fas fa-video text-4xl mb-4"></i>
                <h3 className="text-xl font-medium">暫無內容</h3>
                <p>此功能即將推出，敬請期待！</p>
              </div>
            </TabsContent>
            
            <TabsContent value="community" className="mt-0">
              <div className="p-8 text-center text-gray-500">
                <i className="fas fa-users text-4xl mb-4"></i>
                <h3 className="text-xl font-medium">暫無社群內容</h3>
                <p>此功能即將推出，敬請期待！</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
