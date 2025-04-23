import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for stats - can be replaced with real data later
  const mockStats = [
    { name: "Sun", checkins: 2 },
    { name: "Mon", checkins: 5 },
    { name: "Tue", checkins: 7 },
    { name: "Wed", checkins: 4 },
    { name: "Thu", checkins: 8 },
    { name: "Fri", checkins: 12 },
    { name: "Sat", checkins: 15 },
  ];

  // Fetch creator profile if exists
  const { data: creator, isLoading: isCreatorLoading } = useQuery({
    queryKey: ["/api/creators", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        console.log("Dashboard: Fetching creator profile for user ID:", user.id);
        const res = await fetch(`/api/creators?userId=${user.id}`);
        
        if (!res.ok) {
          console.warn(`API error: ${res.status}`);
          return null;
        }
        
        const creators = await res.json();
        console.log("Dashboard: Creators response:", creators);
        
        if (!Array.isArray(creators)) {
          console.warn("API returned non-array response:", creators);
          return null;
        }
        
        const userCreator = creators.find((c: any) => c.userId === user.id);
        console.log("Dashboard: Found creator:", userCreator);
        return userCreator || null;
      } catch (error) {
        console.error("Error fetching creator profile:", error);
        return null;
      }
    },
    enabled: !!user?.id,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch followers
  const { data: followers = [], isLoading: isFollowersLoading } = useQuery({
    queryKey: ["/api/creators", creator?.id, "followers"],
    queryFn: async () => {
      try {
        if (!creator?.id) return [];
        const res = await fetch(`/api/creators/${creator.id}/followers`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching followers:", error);
        return [];
      }
    },
    enabled: !!creator?.id,
  });

  // Fetch recent check-ins
  const { data: recentCheckins = [], isLoading: isCheckinsLoading } = useQuery({
    queryKey: ["/api/creators", creator?.id, "checkins", "recent"],
    queryFn: async () => {
      try {
        if (!creator?.id) return [];
        const res = await fetch(`/api/creators/${creator.id}/checkins/recent`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching recent checkins:", error);
        return [];
      }
    },
    enabled: !!creator?.id,
  });

  // Show notification if not a creator
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">{t("auth.pleaseLogin")}</h2>
              <p className="text-gray-500">{t("creator.loginToAccess")}</p>
              <Link href="/login" className="inline-block mt-4">
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition">
                  {t("auth.goToLogin")}
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If loading creator data
  if (isCreatorLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">{t("common.loading")}</h2>
              <p className="text-gray-500">{t("creator.loadingData")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If user is not a creator
  if (!creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">{t("creator.notSetup")}</h2>
              <p className="text-gray-500">
                {t("creator.setupDescription")}
              </p>
              <Link href="/profile" className="inline-block mt-4">
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition">
                  {t("creator.goToSetup")}
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Log data for debugging
  console.log("Dashboard rendering with data:", {
    creator,
    user,
    followersCount: Array.isArray(followers) ? followers.length : 0,
    checkinsCount: Array.isArray(recentCheckins) ? recentCheckins.length : 0
  });

  // Function to safely get today's checkins
  const getTodayCheckins = () => {
    if (!Array.isArray(recentCheckins)) return 0;
    
    return recentCheckins.filter((c: any) => {
      try {
        if (!c || !c.date) return false;
        const today = new Date();
        const checkinDate = new Date(c.date);
        return (
          checkinDate.getDate() === today.getDate() &&
          checkinDate.getMonth() === today.getMonth() &&
          checkinDate.getFullYear() === today.getFullYear()
        );
      } catch (err) {
        console.error("Date parsing error:", err);
        return false;
      }
    }).length;
  };

  // Function to safely calculate percentage
  const getPercentage = () => {
    if (!Array.isArray(followers) || followers.length === 0 || !Array.isArray(recentCheckins)) {
      return 0;
    }
    return Math.round((recentCheckins.length / followers.length) * 100);
  };

  // Function to safely get platform distribution
  const getPlatformCount = (percentage: number) => {
    if (!Array.isArray(followers)) return 0;
    return Math.round(followers.length * percentage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("creator.center")}</h1>
        <p className="text-gray-500">{t("creator.centerSubtitle")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">{t("creator.overview")}</TabsTrigger>
          <TabsTrigger value="followers">{t("creator.followers")}</TabsTrigger>
          <TabsTrigger value="checkins">{t("creator.checkinData")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{t("creator.totalFollowers")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Array.isArray(followers) ? followers.length : 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(followers) && followers.length > 0 ? t("creator.weeklyGrowth", { count: 3 }) : t("creator.startBuildingCommunity")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{t("creator.todayCheckins")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {getTodayCheckins()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("creator.percentOfFollowers", { percent: getPercentage() })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{t("creator.platformCount")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{user.providers?.length || 0}</div>
                <p className="text-sm text-muted-foreground">
                  {t("creator.connectMorePlatforms")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t("creator.weeklyCheckinTrend")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockStats}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="checkins" fill="#6441A4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("creator.recentCheckins")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isCheckinsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin text-primary">
                      <i className="fas fa-circle-notch text-xl"></i>
                    </div>
                  </div>
                ) : Array.isArray(recentCheckins) && recentCheckins.length > 0 ? (
                  <div className="space-y-4">
                    {recentCheckins.slice(0, 5).map((checkin: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={checkin.user?.avatarUrl || undefined} />
                            <AvatarFallback>
                              {checkin.user?.username.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{checkin.user?.username || t("common.unknownUser")}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(checkin.date), { addSuffix: true, locale: zhTW })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">{t("creator.noCheckinRecords")}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("creator.platformDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white">
                        <i className="fab fa-youtube text-xs"></i>
                      </div>
                      <span>YouTube</span>
                    </div>
                    <Badge className="bg-red-600">
                      {getPlatformCount(0.8)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#6441A4] flex items-center justify-center text-white">
                        <i className="fab fa-twitch text-xs"></i>
                      </div>
                      <span>Twitch</span>
                    </div>
                    <Badge className="bg-[#6441A4]">
                      {getPlatformCount(0.6)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <i className="fab fa-discord text-xs"></i>
                      </div>
                      <span>Discord</span>
                    </div>
                    <Badge className="bg-indigo-600">
                      {getPlatformCount(0.5)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white">
                        <i className="fab fa-twitter text-xs"></i>
                      </div>
                      <span>Twitter</span>
                    </div>
                    <Badge className="bg-blue-400">
                      {getPlatformCount(0.4)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>{t("creator.followersList")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isFollowersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin text-primary">
                    <i className="fas fa-circle-notch text-xl"></i>
                  </div>
                </div>
              ) : Array.isArray(followers) && followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((follower: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={follower.avatarUrl || undefined} />
                          <AvatarFallback>
                            {follower.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{follower.username || t("common.unknownUser")}</p>
                          <p className="text-xs text-gray-500">{follower.email || ''}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {Array.isArray(follower.providers) && follower.providers.map((p: any, i: number) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                              p.provider === "google" ? "bg-red-600" :
                              p.provider === "twitch" ? "bg-[#6441A4]" :
                              p.provider === "discord" ? "bg-indigo-600" :
                              p.provider === "twitter" ? "bg-blue-400" : "bg-gray-600"
                            }`}
                          >
                            <i className={`fab fa-${p.provider} text-xs`}></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>{t("creator.noFollowers")}</p>
                  <p className="text-sm mt-2">{t("creator.shareCreatorPage")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins">
          <Card>
            <CardHeader>
              <CardTitle>{t("creator.checkinStatistics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockStats}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="checkins" fill="#6441A4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("creator.checkinHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isCheckinsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin text-primary">
                    <i className="fas fa-circle-notch text-xl"></i>
                  </div>
                </div>
              ) : Array.isArray(recentCheckins) && recentCheckins.length > 0 ? (
                <div className="space-y-4">
                  {recentCheckins.map((checkin: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={checkin.user?.avatarUrl || undefined} />
                          <AvatarFallback>
                            {checkin.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{checkin.user?.username || t("common.unknownUser")}</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          {new Date(checkin.date).toLocaleDateString()} {new Date(checkin.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">{t("creator.noCheckinRecords")}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;