import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { UserCreatorStreak } from "@shared/schema";

interface UserStreaksProps {
  userId: number;
}

export function UserStreaks({ userId }: UserStreaksProps) {
  // 获取用户的所有创作者连续签到记录
  const { data: streaks, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "streaks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>连续签到</CardTitle>
          <CardDescription>你正在保持的连续签到</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  if (!streaks || streaks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>连续签到</CardTitle>
          <CardDescription>你的连续签到记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            你还没有连续签到记录。每天签到可以累积连续天数！
          </div>
        </CardContent>
      </Card>
    );
  }

  // 对签到记录进行排序，连续天数最多的排在前面
  const sortedStreaks = [...streaks].sort((a, b) => b.streak - a.streak);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          连续签到
        </CardTitle>
        <CardDescription>你正在保持的连续签到记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedStreaks.map((streak: UserCreatorStreak) => (
            <Link key={streak.creatorId} href={`/creators/${streak.creatorId}`}>
              <a className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{streak.creatorName}</div>
                    <div className="text-sm text-muted-foreground">连续签到 <span className="font-semibold text-primary">{streak.streak}天</span></div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}