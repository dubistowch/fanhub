import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CreatorWithDetails } from "@shared/schema";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreatorCardProps {
  creator: CreatorWithDetails;
  onFollowToggle?: (creatorId: number, isFollowing: boolean) => void;
}

const CreatorCard = ({ creator, onFollowToggle }: CreatorCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const providerTypes = creator.user?.providers?.map(p => p.provider as OAuthProvider) || [];
  
  // Handle follow/unfollow
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      if (creator.isFollowedByUser) {
        // Unfollow
        await apiRequest("DELETE", "/api/follows", {
          userId: user.id,
          creatorId: creator.id
        });
        return false;
      } else {
        // Follow
        await apiRequest("POST", "/api/follows", {
          userId: user.id,
          creatorId: creator.id
        });
        return true;
      }
    },
    onSuccess: (isFollowing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "following"] });
      
      onFollowToggle?.(creator.id, isFollowing);
      
      toast({
        title: isFollowing ? "追蹤成功" : "已取消追蹤",
        description: isFollowing ? "您已成功追蹤此創作者" : "您已取消追蹤此創作者",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "操作失敗",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });
  
  const handleFollowToggle = () => {
    if (followMutation.isPending) return;
    followMutation.mutate();
  };
  
  return (
    <div className="creator-card bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary-dark to-primary-light relative">
        {creator.coverImage && (
          <img 
            src={creator.coverImage} 
            alt={`${creator.name} cover`} 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center -mt-10 mb-4">
          <Avatar className="w-16 h-16 rounded-full border-4 border-white">
            <AvatarImage src={creator.user?.avatarUrl || undefined} />
            <AvatarFallback className="text-lg">
              {creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <Link href={`/creator/${creator.id}`}>
              <h3 className="font-bold hover:text-primary cursor-pointer">{creator.name}</h3>
            </Link>
            <div className="text-sm text-gray-500">{creator.bio?.substring(0, 24) || "創作者"}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {providerTypes.map((provider) => (
              <div 
                key={provider}
                className={`w-7 h-7 rounded-full ${OAUTH_PROVIDERS[provider].color} flex items-center justify-center text-white`}
              >
                <i className={`${OAUTH_PROVIDERS[provider].icon} text-xs`}></i>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant={creator.isFollowedByUser ? "default" : "outline"}
            className={`rounded-full text-sm ${creator.isFollowedByUser ? "bg-primary hover:bg-primary-dark" : ""}`}
            onClick={handleFollowToggle}
            disabled={followMutation.isPending}
          >
            <i className={`fas fa-${creator.isFollowedByUser ? "check" : "plus"} mr-1 text-xs`}></i>
            {creator.isFollowedByUser ? "已追蹤" : "追蹤"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
