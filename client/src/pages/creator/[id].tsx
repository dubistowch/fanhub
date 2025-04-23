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
        title: t('creator.follow.followSuccess'),
        description: t('creator.follow.followSuccessDesc', { name: creator?.name }),
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: t('creator.follow.followFailed'),
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
        title: t('creator.follow.unfollowSuccess'),
        description: t('creator.follow.unfollowSuccessDesc', { name: creator?.name }),
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: t('creator.follow.unfollowFailed'),
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
        title: t('creator.follow.loginRequired'),
        description: t('creator.follow.loginRequiredDesc'),
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
                <span>{t('creator.profile.followersCount', { count: creator.followerCount || 0 })}</span>
              </div>
              
              {user && user.id !== creator.userId && (
                <Button
                  onClick={handleFollowToggle}
                  variant={creator.isFollowedByUser ? "outline" : "default"}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {followMutation.isPending ? (
                    t('creator.follow.followingInProgress')
                  ) : unfollowMutation.isPending ? (
                    t('creator.follow.unfollowingInProgress')
                  ) : creator.isFollowedByUser ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      {t('creator.follow.following')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t('creator.follow.follow')}
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
            {t('creator.tabs.about')}
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Users className="mr-2 h-4 w-4" />
            {t('creator.tabs.stats')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('creator.profile.bio')}</CardTitle>
              <CardDescription>{t('creator.profile.bioDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{creator.bio || t('creator.profile.emptyBio')}</p>
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