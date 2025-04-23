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
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t("profile.update.success"),
        description: t("profile.update.successDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("profile.update.failed"),
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
        title: t("profile.creator.created"),
        description: t("profile.creator.createdDescription"),
      });
      
      // Reset form
      setCreatorName("");
      setCreatorBio("");
    },
    onError: (error) => {
      toast({
        title: t("profile.creator.failed"),
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
        title: t("profile.creator.nameRequired"),
        description: t("profile.creator.nameCannotBeEmpty"),
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
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
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
                  <Label htmlFor="username">{t("profile.username")}</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("profile.bio")}</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("profile.bioPlaceholder")}
                  />
                </div>

                <Button 
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? t("profile.updating") : t("profile.updateProfile")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Creator Profile Card (if not already a creator) */}
          {!creator && (
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.creator.become")}</CardTitle>
                <CardDescription>{t("profile.creator.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creatorName">{t("profile.creator.name")}</Label>
                  <Input
                    id="creatorName"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder={username}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creatorBio">{t("profile.creator.bio")}</Label>
                  <Textarea
                    id="creatorBio"
                    rows={4}
                    value={creatorBio}
                    onChange={(e) => setCreatorBio(e.target.value)}
                    placeholder={bio || t("profile.creator.bioPlaceholder")}
                  />
                </div>

                <Button 
                  onClick={handleCreateCreator}
                  disabled={createCreatorMutation.isPending}
                >
                  {createCreatorMutation.isPending 
                    ? t("profile.creator.creating") 
                    : t("profile.creator.create")}
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
                <CardTitle>{t("profile.creatorPage.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{creator.name}</p>
                    <p className="text-sm text-gray-500">
                      {t("creator.profile.followersCount", { count: creator.followerCount || 0 })}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = `/creator/${creator.id}`}
                  >
                    {t("profile.creatorPage.view")}
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
