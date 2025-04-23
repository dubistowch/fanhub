import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame } from "lucide-react";
import { UserCreatorStreak } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface UserStreaksProps {
  userId: number;
}

export function UserStreaks({ userId }: UserStreaksProps) {
  const { t } = useTranslation();
  
  // 获取用户的所有签到连续记录
  const { data: userStreaks = [], isLoading: loadingStreaks } = useQuery<UserCreatorStreak[]>({
    queryKey: ["/api/users", userId, "streaks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!userId
  });
  
  // 按连续签到天数排序，从高到低
  const sortedStreaks = React.useMemo(() => {
    return [...userStreaks].sort((a: UserCreatorStreak, b: UserCreatorStreak) => b.streak - a.streak);
  }, [userStreaks]);
  
  // 显示连续签到记录为空的情况
  if (loadingStreaks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.userStreaks.title')}</CardTitle>
          <CardDescription>{t('dashboard.userStreaks.description')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">{t('dashboard.checkinStats.loading')}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!userStreaks || userStreaks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.userStreaks.title')}</CardTitle>
          <CardDescription>{t('dashboard.userStreaks.description')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">{t('dashboard.userStreaks.noStreaks')}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.userStreaks.title')}</CardTitle>
        <CardDescription>{t('dashboard.userStreaks.detailedDescription')}</CardDescription>
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
                  <p className="text-xs text-muted-foreground">{t('dashboard.userStreaks.creatorLabel')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-amber-500">
                <Flame className="h-4 w-4" />
                <span className="font-bold">{streak.streak} {t('dashboard.userStreaks.days')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}