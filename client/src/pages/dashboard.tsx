import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch creator profile if exists
  const { data: creator, isLoading: isCreatorLoading } = useQuery({
    queryKey: ["/api/creators/by-user", user?.id],
    queryFn: async () => {
      try {
        const creators = await fetch(`/api/creators?userId=${user?.id}`).then((res) => res.json());
        return creators.find((c: any) => c.userId === user?.id);
      } catch (error) {
        console.error("Error fetching creator profile:", error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Fetch followers
  const { data: followers = [], isLoading: isFollowersLoading } = useQuery({
    queryKey: ["/api/creators", creator?.id, "followers"],
    enabled: !!creator?.id,
  });

  // Fetch recent check-ins
  const { data: recentCheckins = [], isLoading: isCheckinsLoading } = useQuery({
    queryKey: ["/api/creators", creator?.id, "checkins", "recent"],
    enabled: !!creator?.id,
  });

  // Show notification if not a creator
  useEffect(() => {
    if (!isCreatorLoading && !creator) {
      toast({
        title: "您尚未設定創作者帳號",
        description: "請前往個人資料頁建立您的創作者帳號",
        variant: "default",
      });
    }
  }, [creator, isCreatorLoading, toast]);

  // Mock data for stats
  const mockStats = [
    { name: "Sun", checkins: 2 },
    { name: "Mon", checkins: 5 },
    { name: "Tue", checkins: 7 },
    { name: "Wed", checkins: 4 },
    { name: "Thu", checkins: 8 },
    { name: "Fri", checkins: 12 },
    { name: "Sat", checkins: 15 },
  ];

  if (!user) return null;
  
  if (!isCreatorLoading && !creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">您尚未設定創作者帳號</h2>
              <p className="text-gray-500">
                建立您的創作者帳號，開始連接您的粉絲社群。
              </p>
              <a href="/profile" className="inline-block mt-4">
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition">
                  前往設定
                </button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">創作者中心</h1>
        <p className="text-gray-500">管理你的社群互動，了解粉絲行為</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">總覽</TabsTrigger>
          <TabsTrigger value="followers">粉絲</TabsTrigger>
          <TabsTrigger value="checkins">簽到數據</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">總粉絲數</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{followers.length}</div>
                <p className="text-sm text-muted-foreground">
                  {followers.length > 0 ? "+3 自上週" : "開始經營您的社群"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">今日簽到數</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recentCheckins.filter((c: any) => {
                  const today = new Date();
                  const checkinDate = new Date(c.date);
                  return (
                    checkinDate.getDate() === today.getDate() &&
                    checkinDate.getMonth() === today.getMonth() &&
                    checkinDate.getFullYear() === today.getFullYear()
                  );
                }).length}</div>
                <p className="text-sm text-muted-foreground">
                  佔總粉絲數 {followers.length > 0 ? Math.round((recentCheckins.length / followers.length) * 100) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">平台連結數</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{user.providers?.length || 0}</div>
                <p className="text-sm text-muted-foreground">
                  綁定更多平台可提高曝光度
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>本週簽到趨勢</CardTitle>
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
                <CardTitle>最近簽到的粉絲</CardTitle>
              </CardHeader>
              <CardContent>
                {isCheckinsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin text-primary">
                      <i className="fas fa-circle-notch text-xl"></i>
                    </div>
                  </div>
                ) : recentCheckins.length > 0 ? (
                  <div className="space-y-4">
                    {recentCheckins.slice(0, 5).map((checkin: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={checkin.user.avatarUrl || undefined} />
                            <AvatarFallback>
                              {checkin.user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{checkin.user.username}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(checkin.date), { addSuffix: true, locale: zhTW })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">尚無簽到記錄</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>平台分佈</CardTitle>
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
                    <Badge className="bg-red-600">{(followers.length * 0.8).toFixed(0)}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#6441A4] flex items-center justify-center text-white">
                        <i className="fab fa-twitch text-xs"></i>
                      </div>
                      <span>Twitch</span>
                    </div>
                    <Badge className="bg-[#6441A4]">{(followers.length * 0.6).toFixed(0)}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <i className="fab fa-discord text-xs"></i>
                      </div>
                      <span>Discord</span>
                    </div>
                    <Badge className="bg-indigo-600">{(followers.length * 0.5).toFixed(0)}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white">
                        <i className="fab fa-twitter text-xs"></i>
                      </div>
                      <span>Twitter</span>
                    </div>
                    <Badge className="bg-blue-400">{(followers.length * 0.4).toFixed(0)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>粉絲列表</CardTitle>
            </CardHeader>
            <CardContent>
              {isFollowersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin text-primary">
                    <i className="fas fa-circle-notch text-xl"></i>
                  </div>
                </div>
              ) : followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((follower: any) => (
                    <div key={follower.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={follower.avatarUrl || undefined} />
                          <AvatarFallback>
                            {follower.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{follower.username}</p>
                          <p className="text-xs text-gray-500">{follower.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {follower.providers?.map((p: any) => (
                          <div
                            key={p.id}
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
                  <p>尚無粉絲</p>
                  <p className="text-sm mt-2">分享您的創作者頁面，開始建立您的粉絲社群</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins">
          <Card>
            <CardHeader>
              <CardTitle>簽到統計</CardTitle>
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
              <CardTitle>簽到歷史</CardTitle>
            </CardHeader>
            <CardContent>
              {isCheckinsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin text-primary">
                    <i className="fas fa-circle-notch text-xl"></i>
                  </div>
                </div>
              ) : recentCheckins.length > 0 ? (
                <div className="space-y-4">
                  {recentCheckins.map((checkin: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={checkin.user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {checkin.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{checkin.user.username}</p>
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
                <div className="text-center py-4 text-gray-500">尚無簽到記錄</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
