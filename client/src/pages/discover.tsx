import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CreatorCard from "@/components/ui/creator-card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const Discover = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  // Fetch all creators
  const { data: creators = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/creators", { userId: user?.id }],
    enabled: !!user,
  });

  // Filter creators based on search term
  const filteredCreators = creators.filter((creator: any) => {
    if (!searchTerm) return true;
    return (
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("discover.title")}</h1>
        <p className="text-gray-500 mb-6 text-center">
          {t("discover.description")}
        </p>
        
        {/* Search bar */}
        <div className="w-full max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={t("discover.searchPlaceholder")}
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Creator Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin text-primary">
            <i className="fas fa-circle-notch fa-spin text-4xl"></i>
          </div>
        </div>
      ) : filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreators.map((creator: any) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-8 rounded-lg inline-block">
            <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? t("discover.noMatchingCreators") : t("discover.noCreatorsYet")}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? t("discover.tryDifferentSearch")
                : t("discover.becomeFirstCreator")}
            </p>
          </div>
        </div>
      )}

      {/* Categories Section (example) */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">{t("discover.categories")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            t("discover.categoryList.gaming"),
            t("discover.categoryList.music"),
            t("discover.categoryList.tech"),
            t("discover.categoryList.food")
          ].map((category, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-primary-dark to-primary-light h-32 rounded-xl flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-white">{category}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;
