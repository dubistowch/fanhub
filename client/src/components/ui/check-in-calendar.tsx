import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface CheckInCalendarProps {
  creatorId: number;
  hasCheckedInToday: boolean;
  checkinStreak: number;
  onCheckInSuccess?: (newStreak: number) => void;
}

const CheckInCalendar = ({
  creatorId,
  hasCheckedInToday,
  checkinStreak,
  onCheckInSuccess
}: CheckInCalendarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Generate array of last 7 days
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
    
    last7Days.push({
      date,
      dayName: dayNames[date.getDay()],
      isToday: i === 0,
      // We'll assume days in streak are checked
      isCheckedIn: hasCheckedInToday ? i === 0 : i > 0 && i <= checkinStreak
    });
  }
  
  // Handle check-in
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const response = await apiRequest("POST", "/api/checkins", {
        userId: user.id,
        creatorId
      });
      
      const data = await response.json();
      return data.streak;
    },
    onSuccess: (newStreak) => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
      
      toast({
        title: "簽到成功",
        description: "您已完成今日簽到！",
        variant: "default"
      });
      
      onCheckInSuccess?.(newStreak);
    },
    onError: (error) => {
      toast({
        title: "簽到失敗",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });

  const handleCheckIn = () => {
    if (checkInMutation.isPending) return;
    checkInMutation.mutate();
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">每日簽到</h3>
        <span className="text-sm text-gray-500">
          累積簽到：
          <span className="font-medium text-primary">{checkinStreak}</span> 天
        </span>
      </div>
      
      {/* Check-in Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 mb-1">
            {hasCheckedInToday 
              ? "您已完成今日簽到！" 
              : "今天還沒簽到，點擊簽到支持創作者！"}
          </p>
          <p className="text-sm text-gray-500">每日 00:00 重置簽到資格</p>
        </div>
        <Button
          className={`checkin-button flex items-center ${
            hasCheckedInToday 
              ? "bg-green-600 hover:bg-green-600 cursor-default" 
              : "bg-primary hover:bg-primary-light"
          }`}
          onClick={handleCheckIn}
          disabled={hasCheckedInToday || checkInMutation.isPending}
        >
          <i className={`fas fa-${hasCheckedInToday ? "check" : "calendar-check"} mr-2`}></i>
          {hasCheckedInToday ? "今日已簽到" : "立即簽到"}
        </Button>
      </div>
      
      {/* Calendar View */}
      <div className="mt-6">
        <div className="grid grid-cols-7 gap-2 text-center">
          {last7Days.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-xs text-gray-500">{day.dayName}</span>
              {day.isToday && !hasCheckedInToday ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 border-2 border-dashed border-accent text-accent">
                  <i className="fas fa-plus"></i>
                </div>
              ) : (
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                    day.isCheckedIn 
                      ? "bg-accent text-white" 
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <i className="fas fa-check"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckInCalendar;
