import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConnectedPlatforms from "@/components/profile/ConnectedPlatforms";
import { UserStreaks } from "@/components/profile/UserStreaks";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertUser, InsertCreator } from "@shared/schema";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [creatorName, setCreatorName] = useState("");
  const [creatorBio, setCreatorBio] = useState("");

  // Fetch creator profile if exists
  const { data: creator } = useQuery({
    queryKey: ["/api/creators", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        console.log("Fetching creator profile for user ID:", user.id);
        const creators = await fetch(`/api/creators?userId=${user.id}`).then((res) => {
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        });
        console.log("Creators response:", creators);
        const userCreator = creators.find((c: any) => c.userId === user.id);
        console.log("Found creator:", userCreator);
        return userCreator || null;
      } catch (error) {
        console.error("Error fetching creator profile:", error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const updatedUser: Partial<InsertUser> = {
        username,
        bio,
      };
      
      await apiRequest("PATCH", `/api/users/${user.id}`, updatedUser);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      await refreshUser();
      
      toast({
        title: "個人資料已更新",
        description: "您的個人資料已成功更新",
      });
    },
    onError: (error) => {
      toast({
        title: "更新失敗",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Create creator profile
  const createCreatorMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const newCreator: InsertCreator = {
        userId: user.id,
        name: creatorName || username,
        bio: creatorBio || bio,
      };
      
      await apiRequest("POST", "/api/creators", newCreator);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", user?.id] });
      
      toast({
        title: "創作者帳號已建立",
        description: "您的創作者帳號已成功建立",
      });
      
      // Reset form
      setCreatorName("");
      setCreatorBio("");
    },
    onError: (error) => {
      toast({
        title: "建立失敗",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (updateProfileMutation.isPending) return;
    updateProfileMutation.mutate();
  };

  // Handle creator profile creation
  const handleCreateCreator = async () => {
    if (createCreatorMutation.isPending) return;
    if (!creatorName.trim()) {
      toast({
        title: "請填寫創作者名稱",
        description: "創作者名稱不能為空",
        variant: "destructive",
      });
      return;
    }
    createCreatorMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3 space-y-8">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>個人資料</CardTitle>
              <CardDescription>更新您的個人資訊與平台設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-lg">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">使用者名稱</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">個人介紹</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="簡短介紹一下你自己..."
                  />
                </div>

                <Button 
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "更新中..." : "更新個人資料"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Creator Profile Card (if not already a creator) */}
          {!creator && (
            <Card>
              <CardHeader>
                <CardTitle>成為創作者</CardTitle>
                <CardDescription>建立您的創作者專頁，讓粉絲能夠關注您</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creatorName">創作者名稱</Label>
                  <Input
                    id="creatorName"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder={username}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creatorBio">創作者介紹</Label>
                  <Textarea
                    id="creatorBio"
                    rows={4}
                    value={creatorBio}
                    onChange={(e) => setCreatorBio(e.target.value)}
                    placeholder={bio || "介紹一下您的創作內容..."}
                  />
                </div>

                <Button 
                  onClick={handleCreateCreator}
                  disabled={createCreatorMutation.isPending}
                >
                  {createCreatorMutation.isPending ? "建立中..." : "建立創作者帳號"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="w-full md:w-1/3 space-y-8">
          {/* Connected Platforms */}
          <ConnectedPlatforms userId={user.id} isOwnProfile={true} />
          
          {/* Creator Profile Link (if user is a creator) */}
          {creator && (
            <Card>
              <CardHeader>
                <CardTitle>您的創作者專頁</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{creator.name}</p>
                    <p className="text-sm text-gray-500">{creator.followerCount || 0} 位粉絲</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = `/creator/${creator.id}`}
                  >
                    查看專頁
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* User's Check-in Streaks */}
          <UserStreaks userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
