import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CreatorCard from "@/components/ui/creator-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const Following = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch followed creators
  const { data: followedCreators = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "following"],
    enabled: !!user,
  });

  // Filter creators based on search term
  const filteredCreators = followedCreators.filter((creator: any) => {
    if (!searchTerm) return true;
    return (
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter based on tab
  const getFilteredCreatorsByPlatform = (platform: string) => {
    if (platform === "all") return filteredCreators;
    
    return filteredCreators.filter((creator: any) => {
      const userProviders = creator.user?.providers || [];
      return userProviders.some((p: any) => p.provider === platform);
    });
  };

  const displayedCreators = getFilteredCreatorsByPlatform(activeTab);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("following.title")}</h1>
        <p className="text-gray-500 mb-6 text-center">
          {t("following.subtitle")}
        </p>
        
        {/* Search and filter bar */}
        <div className="w-full max-w-md relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={t("following.searchPlaceholder")}
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Platform tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full max-w-3xl"
        >
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
            <TabsTrigger value="google">YouTube</TabsTrigger>
            <TabsTrigger value="twitch">Twitch</TabsTrigger>
            <TabsTrigger value="discord">Discord</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin text-primary">
                  <i className="fas fa-circle-notch fa-spin text-4xl"></i>
                </div>
              </div>
            ) : displayedCreators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedCreators.map((creator: any) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-8 rounded-lg inline-block">
                  <i className="fas fa-heart text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm 
                      ? t("following.noMatchingCreators") 
                      : activeTab === "all" 
                        ? t("following.noFollowedCreators") 
                        : t("following.noCreatorsWithPlatform", {
                            platform: activeTab === "google" ? "YouTube" : 
                                      activeTab === "twitch" ? "Twitch" : 
                                      activeTab === "discord" ? "Discord" : "Twitter"
                          })
                    }
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? t("following.tryDifferentSearch") 
                      : t("following.goToDiscover")
                    }
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent check-ins section */}
      {followedCreators.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">{t("following.recentCheckins")}</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedCreators
                .filter((creator: any) => creator.hasCheckedInToday)
                .slice(0, 3)
                .map((creator: any) => (
                  <div key={creator.id} className="flex items-center space-x-4">
                    <div className="bg-green-100 text-green-800 h-12 w-12 rounded-full flex items-center justify-center">
                      <i className="fas fa-check"></i>
                    </div>
                    <div>
                      <p className="font-medium">{creator.name}</p>
                      <p className="text-sm text-gray-500">{t("creator.checkinStreakText", { days: creator.checkinStreak })}</p>
                    </div>
                  </div>
                ))}
              {followedCreators.filter((creator: any) => creator.hasCheckedInToday).length === 0 && (
                <div className="col-span-3 text-center py-6 text-gray-500">
                  {t("following.noCheckinsToday")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Following;
