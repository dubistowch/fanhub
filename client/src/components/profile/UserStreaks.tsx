import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame } from "lucide-react";
import { UserCreatorStreak } from "@shared/schema";

interface UserStreaksProps {
  userId: number;
}

export function UserStreaks({ userId }: UserStreaksProps) {
  // 获取用户的所有签到连续记录
  const { data: userStreaks, isLoading: loadingStreaks } = useQuery({
    queryKey: ["/api/users", userId, "streaks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!userId
  });
  
  // 按连续签到天数排序，从高到低
  const sortedStreaks = React.useMemo(() => {
    if (!userStreaks) return [];
    return [...userStreaks].sort((a: UserCreatorStreak, b: UserCreatorStreak) => b.streak - a.streak);
  }, [userStreaks]);
  
  // 显示连续签到记录为空的情况
  if (loadingStreaks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>签到连续记录</CardTitle>
          <CardDescription>您的签到连续记录</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!userStreaks || userStreaks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>签到连续记录</CardTitle>
          <CardDescription>您的签到连续记录</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">暂无签到记录，开始签到获取连续记录吧！</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>签到连续记录</CardTitle>
        <CardDescription>您在各个创作者的签到连续记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedStreaks.map((streak: UserCreatorStreak) => (
            <div 
              key={streak.creatorId} 
              className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${streak.creatorName}`} alt={streak.creatorName} />
                  <AvatarFallback>{streak.creatorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{streak.creatorName}</p>
                  <p className="text-xs text-muted-foreground">创作者</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-amber-500">
                <Flame className="h-4 w-4" />
                <span className="font-bold">{streak.streak} 天</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}