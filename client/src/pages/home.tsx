import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CreatorCard from "@/components/ui/creator-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Fetch popular creators
  const { data: popularCreators = [] } = useQuery<any[]>({
    queryKey: ["/api/creators", { limit: 4, userId: user?.id }],
    enabled: !!user,
  });

  // Fetch followed creators
  const { data: followedCreators = [] } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "following"],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-6">{t("home.welcome", { username: user.username })}</h1>
        
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/90 to-primary mb-8">
          <CardContent className="p-8">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">📣 {t("home.welcomeCard.title")}</h2>
              <p className="mb-4">{t("home.welcomeCard.description")}</p>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setLocation("/discover")}>
                  {t("home.welcomeCard.exploreButton")}
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white/20 hover:text-white" onClick={() => setLocation("/profile")}>
                  {t("home.welcomeCard.linkAccountButton")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Following Section (if following any) */}
      {followedCreators.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t("home.following.title")}</h2>
            <Button variant="link" className="text-primary" onClick={() => setLocation("/following")}>
              {t("home.viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {followedCreators.slice(0, 4).map((creator: any) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Creators */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t("home.popular.title")}</h2>
          <Button variant="link" className="text-primary" onClick={() => setLocation("/discover")}>
            {t("home.viewAll")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCreators.map((creator: any) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
