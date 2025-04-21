import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { CalendarClock, CheckCheck, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface CheckinCalendarProps {
  creatorId: number;
  checkinStreak: number;
  hasCheckedInToday: boolean;
  onCheckInSuccess?: (newStreak: number) => void;
}

export function CheckinCalendar({
  creatorId,
  checkinStreak,
  hasCheckedInToday,
  onCheckInSuccess,
}: CheckinCalendarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [userHasCheckedIn, setUserHasCheckedIn] = useState(hasCheckedInToday);
  const [streak, setStreak] = useState(checkinStreak);
  
  // 处理签到操作
  const handleCheckIn = async () => {
    if (!user || !user.id) {
      toast({
        title: "请先登录",
        description: "您需要登录才能进行签到",
        variant: "destructive",
      });
      return;
    }
    
    if (userHasCheckedIn) {
      toast({
        title: "今日已签到",
        description: "您今天已经签到过了，明天再来吧！",
      });
      return;
    }
    
    try {
      setIsCheckingIn(true);
      
      const response = await apiRequest("POST", `/api/creators/${creatorId}/checkin`, {
        userId: user.id,
      });
      
      if (!response.ok) {
        throw new Error("签到失败");
      }
      
      const data = await response.json();
      const newStreak = data.streak || streak + 1;
      
      setUserHasCheckedIn(true);
      setStreak(newStreak);
      
      // 调用回调函数更新父组件状态
      if (onCheckInSuccess) {
        onCheckInSuccess(newStreak);
      }
      
      toast({
        title: "签到成功!",
        description: `恭喜您完成今日签到，当前连续签到 ${newStreak} 天`,
      });
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "签到失败",
        description: "签到过程中发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle>签到日历</CardTitle>
              {userHasCheckedIn && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  <CheckCheck className="mr-1 h-3 w-3" />
                  今日已签到
                </Badge>
              )}
            </div>
            <CardDescription>选择日期查看签到状态</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={date => date > new Date()}
            />
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>签到信息</CardTitle>
            <CardDescription>您的签到统计和记录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">今日日期</p>
                <p className="text-xl">{format(new Date(), "yyyy年MM月dd日")}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">连续签到</p>
                <p className="text-xl">{streak} 天</p>
              </div>
            </div>
            
            {!userHasCheckedIn && (
              <Button 
                className="w-full" 
                onClick={handleCheckIn}
                disabled={isCheckingIn || !user?.id}
              >
                {isCheckingIn ? "签到中..." : "立即签到"}
              </Button>
            )}
            
            {userHasCheckedIn && (
              <Button className="w-full" variant="outline" disabled>
                <CheckCheck className="mr-2 h-4 w-4" />
                今日已签到
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}