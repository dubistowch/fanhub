import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckinCalendar } from "@/components/ui/check-in-calendar";
import { CheckCircle, UserCheck, Calendar, TrendingUp, Users } from "lucide-react";
import { format, subDays } from "date-fns";
import type { CheckinDateStats, CheckinWithUser } from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState<string>("recent");

  // 获取近期签到用户数据
  const { data: recentCheckins, isLoading: recentLoading } = useQuery({
    queryKey: ["/api/creators", creatorId, "checkins", "recent"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!creatorId
  });

  // 获取30天内的详细签到数据
  const { data: detailedCheckins, isLoading: detailedLoading } = useQuery({
    queryKey: ["/api/creators", creatorId, "checkins", "detailed"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!creatorId && activeTab === "detailed"
  });

  // 获取历史签到统计数据
  const { data: checkinStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/creators", creatorId, "checkins", "stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!creatorId && activeTab === "historical"
  });

  // 处理日期格式化
  const formatDate = (date: Date) => {
    return format(new Date(date), "yyyy-MM-dd HH:mm");
  };

  return (
    <div className="space-y-6">
      {userId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>你的签到</CardTitle>
            <CardDescription>每天签到保持连续</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className={hasCheckedInToday ? "text-green-500" : "text-gray-300"} size={20} />
                <span>{hasCheckedInToday ? "今日已签到" : "今日未签到"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp size={20} className="text-primary" />
                <span>连续签到: <strong>{checkinStreak}天</strong></span>
              </div>
            </div>
            <div className="mt-4">
              <CheckinCalendar 
                creatorId={creatorId}
                hasCheckedInToday={hasCheckedInToday}
                checkinStreak={checkinStreak}
                onCheckInSuccess={onCheckInSuccess}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>粉丝签到统计</CardTitle>
          <CardDescription>查看签到数据和趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="recent">
                <Users className="mr-2 h-4 w-4" />
                最近签到
              </TabsTrigger>
              <TabsTrigger value="detailed">
                <Calendar className="mr-2 h-4 w-4" />
                近30天详情
              </TabsTrigger>
              <TabsTrigger value="historical">
                <TrendingUp className="mr-2 h-4 w-4" />
                历史统计
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              {recentLoading ? (
                <div className="text-center py-6">加载中...</div>
              ) : recentCheckins?.length ? (
                <div className="space-y-2">
                  {recentCheckins.map((checkin: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={checkin.user} />
                        <div>
                          <div className="font-medium">{checkin.user.username}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(checkin.date)}</div>
                        </div>
                      </div>
                      <UserCheck className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  还没有签到记录
                </div>
              )}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {detailedLoading ? (
                <div className="text-center py-6">加载中...</div>
              ) : detailedCheckins?.length ? (
                <div>
                  <div className="text-sm text-muted-foreground mb-4">
                    过去30天内的签到详情
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {detailedCheckins.map((checkin: CheckinWithUser) => (
                      <div key={checkin.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <UserAvatar user={checkin.user} />
                          <div>
                            <div className="font-medium">{checkin.user.username}</div>
                            <div className="text-sm text-muted-foreground">{formatDate(checkin.date)}</div>
                          </div>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">
                          {format(new Date(checkin.date), "MM-dd")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  过去30天没有签到记录
                </div>
              )}
            </TabsContent>

            <TabsContent value="historical" className="space-y-4">
              {statsLoading ? (
                <div className="text-center py-6">加载中...</div>
              ) : checkinStats?.length ? (
                <div>
                  <div className="text-sm text-muted-foreground mb-4">
                    30天以前的历史签到统计（每日总数）
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {checkinStats.map((stat: CheckinDateStats, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="font-medium">
                          {format(new Date(stat.date), "yyyy-MM-dd")}
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{stat.count}</span>
                          <span className="text-sm text-muted-foreground">人签到</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  没有可用的历史签到数据
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}