import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckinCalendar } from "@/components/ui/check-in-calendar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO, differenceInDays } from "date-fns";
import { Calendar, Users, BarChart3 } from "lucide-react";
import type { CheckinWithUser, CheckinDateStats } from "@shared/schema";

interface CheckinStatsProps {
  creatorId: number;
  userId?: number;
  hasCheckedInToday?: boolean;
  checkinStreak?: number;
  onCheckInSuccess?: (newStreak: number) => void;
}

export function CheckinStats({
  creatorId,
  userId,
  hasCheckedInToday = false,
  checkinStreak = 0,
  onCheckInSuccess
}: CheckinStatsProps) {
  const [activeTab, setActiveTab] = useState("calendar");
  
  // 获取最近签到记录
  const { data: recentCheckins, isLoading: loadingRecentCheckins } = useQuery({
    queryKey: ["/api/creators", creatorId, "recent-checkins"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!creatorId
  });
  
  // 获取历史签到统计
  const { data: checkinStats, isLoading: loadingCheckinStats } = useQuery({
    queryKey: ["/api/creators", creatorId, "checkin-stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!creatorId
  });
  
  // 格式化日期显示
  const formatDate = (dateInput: Date | string) => {
    try {
      // 確保我們有一個有效的日期物件
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // 驗證日期是否有效
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateInput);
        return "無效日期";
      }
      
      const today = new Date();
      const diffDays = differenceInDays(today, date);
      
      if (diffDays === 0) return "今天";
      if (diffDays === 1) return "昨天";
      if (diffDays === 2) return "前天";
      if (diffDays < 7) return `${diffDays}天前`;
      
      // 使用 try/catch 包裝 format 調用
      try {
        return format(date, "MM月dd日");
      } catch (err) {
        console.error("Error formatting date:", err);
        return date.toLocaleDateString();
      }
    } catch (err) {
      console.error("Error in formatDate:", err);
      return "日期錯誤";
    }
  };

  // 对历史统计数据进行处理以便于图表显示
  const chartData = React.useMemo(() => {
    if (!checkinStats) return [];
    
    // 返回最近30天的数据用于图表
    return checkinStats.map((stat: CheckinDateStats) => {
      try {
        const date = new Date(stat.date);
        
        // 檢查日期是否有效
        if (isNaN(date.getTime())) {
          console.error("Invalid date in chartData:", stat.date);
          return {
            date: "無效日期",
            count: stat.count
          };
        }
        
        // 使用更安全的方式格式化日期
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return {
          date: `${month}/${day}`,
          count: stat.count
        };
      } catch (err) {
        console.error("Error processing chart data:", err);
        return {
          date: "錯誤",
          count: 0
        };
      }
    });
  }, [checkinStats]);

  // 对签到详情记录进行排序，最新的排在前面
  const detailedCheckins = React.useMemo(() => {
    if (!recentCheckins) return [];
    return [...recentCheckins].sort((a: CheckinWithUser, b: CheckinWithUser) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [recentCheckins]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>签到统计</CardTitle>
          <CardDescription>查看粉丝签到数据和历史记录</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="calendar">
                <Calendar className="mr-2 h-4 w-4" />
                签到日历
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="mr-2 h-4 w-4" />
                签到趋势
              </TabsTrigger>
              <TabsTrigger value="details">
                <Users className="mr-2 h-4 w-4" />
                详细记录
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="space-y-4">
              {userId && (
                <CheckinCalendar
                  creatorId={creatorId}
                  hasCheckedInToday={hasCheckedInToday}
                  checkinStreak={checkinStreak}
                  onCheckInSuccess={onCheckInSuccess}
                />
              )}
              
              {!userId && (
                <div className="text-center py-8 text-muted-foreground">
                  请登录后进行签到
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stats">
              {loadingCheckinStats ? (
                <div className="text-center py-8">加载中...</div>
              ) : checkinStats && checkinStats.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="签到人数" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无签到统计数据
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details">
              {loadingRecentCheckins ? (
                <div className="text-center py-8">加载中...</div>
              ) : recentCheckins && recentCheckins.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium">最近签到用户</h3>
                  <div className="space-y-3">
                    {detailedCheckins.map((checkin: CheckinWithUser) => (
                      <div key={`${checkin.userId}-${checkin.date}`} className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <UserAvatar user={checkin.user} className="h-8 w-8" />
                          <div>
                            <p className="font-medium">{checkin.user.username}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(new Date(checkin.date))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无签到记录
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 统计卡片 */}
      {!loadingCheckinStats && checkinStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 今日签到数 */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今日签到</CardDescription>
              <CardTitle className="text-2xl">
                {checkinStats.length > 0 ? checkinStats[0].count : 0}
              </CardTitle>
            </CardHeader>
          </Card>
          
          {/* 昨日签到数 */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>昨日签到</CardDescription>
              <CardTitle className="text-2xl">
                {checkinStats.length > 1 ? checkinStats[1].count : 0}
              </CardTitle>
            </CardHeader>
          </Card>
          
          {/* 最高签到记录 */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>历史最高</CardDescription>
              <CardTitle className="text-2xl">
                {checkinStats.length > 0 
                  ? Math.max(...checkinStats.map((stat: CheckinDateStats) => stat.count))
                  : 0
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}