import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, differenceInDays } from "date-fns";
import { CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import { DayContent } from "react-day-picker";

interface CheckinCalendarProps {
  creatorId: number;
  hasCheckedInToday: boolean;
  checkinStreak: number;
  onCheckInSuccess?: (newStreak: number) => void;
}

export const CheckinCalendar: React.FC<CheckinCalendarProps> = ({
  creatorId,
  hasCheckedInToday,
  checkinStreak,
  onCheckInSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loadingRecentDates, setLoadingRecentDates] = useState<boolean>(false);
  const [recentCheckins, setRecentCheckins] = useState<Date[]>([]);
  
  // 获取用户最近的签到日期
  React.useEffect(() => {
    if (!user?.id || !creatorId) return;
    
    const fetchRecentCheckins = async () => {
      setLoadingRecentDates(true);
      try {
        // 获取最近30天的签到记录
        const response = await fetch(`/api/users/${user.id}/creators/${creatorId}/recent-checkins`);
        if (response.ok) {
          const data = await response.json();
          // 转换日期字符串为Date对象
          const dates = data.map((d: string) => new Date(d));
          setRecentCheckins(dates);
        }
      } catch (error) {
        console.error("Failed to fetch recent check-ins:", error);
      } finally {
        setLoadingRecentDates(false);
      }
    };
    
    fetchRecentCheckins();
  }, [user?.id, creatorId]);

  // 签到操作
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const checkInData = {
        userId: user.id,
        creatorId
      };
      
      const response = await apiRequest("POST", "/api/checkins", checkInData);
      return response;
    },
    onSuccess: (data) => {
      // 更新查询缓存
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", user?.id, "creators", creatorId, "checkin-status"] 
      });
      
      // 显示成功消息
      toast({
        title: "签到成功！",
        description: `连续签到 ${data.streak} 天`,
        duration: 3000,
      });
      
      // 回调通知父组件
      if (onCheckInSuccess) {
        onCheckInSuccess(data.streak);
      }
      
      // 添加当天到最近签到记录
      const today = new Date();
      setRecentCheckins(prev => [...prev, today]);
    },
    onError: (error) => {
      toast({
        title: "签到失败",
        description: (error as Error).message,
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleCheckIn = () => {
    if (checkInMutation.isPending) return;
    if (hasCheckedInToday) {
      toast({
        title: "今日已签到",
        description: "明天再来吧！",
        duration: 3000,
      });
      return;
    }
    checkInMutation.mutate();
  };

  // 自定义修饰器，用于显示签到状态
  const modifiers = {
    checkedIn: recentCheckins,
    today: new Date(),
  };

  // 自定义修饰器样式
  const modifiersStyles = {
    checkedIn: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '100%',
    },
    today: {
      border: '2px dashed hsl(var(--primary))',
      borderRadius: '100%',
    },
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        disabled={{ after: new Date() }}
        className="border rounded-md p-3"
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
      />
      
      <Button
        className="w-full"
        onClick={handleCheckIn}
        disabled={checkInMutation.isPending || hasCheckedInToday}
      >
        {checkInMutation.isPending ? (
          "签到中..."
        ) : hasCheckedInToday ? (
          "已签到"
        ) : (
          <>
            <CalendarIcon className="mr-2 h-4 w-4" />
            今日签到
          </>
        )}
      </Button>
      
      {checkinStreak > 0 && (
        <div className="text-center text-sm">
          <span className="text-muted-foreground">连续签到</span>{" "}
          <span className="font-semibold text-primary">{checkinStreak}</span>{" "}
          <span className="text-muted-foreground">天</span>
        </div>
      )}
    </div>
  );
};