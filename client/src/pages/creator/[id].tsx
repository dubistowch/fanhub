import React, { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckinStats } from "@/components/creator/CheckinStats";
import { Users, UserPlus, UserMinus, Globe, SocialIcon } from "lucide-react";
import ConnectedPlatforms from "@/components/profile/ConnectedPlatforms";
import { useTranslation } from "react-i18next";

export default function CreatorProfile() {
  const [_, params] = useRoute("/creator/:id");
  const creatorId = params ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("about");
  const { t } = useTranslation();

  // 获取创作者信息
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ["/api/creators", creatorId, user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!creatorId
  });

  // 关注/取消关注创作者
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const followData = {
        userId: user.id,
        creatorId
      };
      
      return apiRequest("POST", "/api/follows", followData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
      
      toast({
        title: "已关注",
        description: `你现在已经关注了 ${creator?.name}`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "关注失败",
        description: (error as Error).message,
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      return apiRequest("DELETE", "/api/follows", {
        userId: user.id,
        creatorId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
      
      toast({
        title: "已取消关注",
        description: `你已经取消关注 ${creator?.name}`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "取消关注失败",
        description: (error as Error).message,
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // 处理关注/取消关注
  const handleFollowToggle = () => {
    if (!user) {
      toast({
        title: "需要登录",
        description: "请先登录才能关注创作者",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (creator?.isFollowedByUser) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  // 签到成功后的回调
  const handleCheckInSuccess = (newStreak: number) => {
    toast({
      title: t('creator.checkin.success'),
      description: t('creator.checkin.successDesc', { streak: newStreak }),
      duration: 3000,
    });
    
    // 刷新创作者信息
    queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
  };

  if (creatorLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('creator.profile.loading')}</div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('creator.profile.notFound')}</h1>
          <p className="text-muted-foreground">{t('creator.profile.notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 创作者信息头部 */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          {creator.user && (
            <UserAvatar 
              user={creator.user} 
              className="h-24 w-24 md:h-32 md:w-32"
            />
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{creator.name}</h1>
              <p className="text-muted-foreground">@{creator.user?.username}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm">
                <Users className="w-4 h-4" />
                <span>{creator.followerCount || 0} 位粉丝</span>
              </div>
              
              {user && user.id !== creator.userId && (
                <Button
                  onClick={handleFollowToggle}
                  variant={creator.isFollowedByUser ? "outline" : "default"}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {followMutation.isPending ? (
                    "关注中..."
                  ) : unfollowMutation.isPending ? (
                    "取消关注中..."
                  ) : creator.isFollowedByUser ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      已关注
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      关注
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-lg mb-6">{creator.bio}</p>
        </div>
      </div>
      
      {/* 选项卡内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="about">
            <Globe className="mr-2 h-4 w-4" />
            关于
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Users className="mr-2 h-4 w-4" />
            签到统计
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>创作者简介</CardTitle>
              <CardDescription>了解更多关于创作者的信息</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{creator.bio || "这个创作者很懒，还没有填写简介..."}</p>
            </CardContent>
          </Card>
          
          <ConnectedPlatforms 
            userId={creator.userId} 
            isOwnProfile={user?.id === creator.userId}
          />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <CheckinStats 
            creatorId={creatorId}
            userId={user?.id}
            hasCheckedInToday={creator.hasCheckedInToday || false}
            checkinStreak={creator.checkinStreak || 0}
            onCheckInSuccess={handleCheckInSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}