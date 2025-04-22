import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { signInWithOAuth } from "@/lib/auth";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleSignIn = async (provider: OAuthProvider) => {
    console.log(`Login: Starting sign in with ${provider}`);
    try {
      console.log("Login: Calling signInWithOAuth");
      const result = await signInWithOAuth(provider);
      console.log("Login: OAuth sign in result:", result);
    } catch (error) {
      console.error("Login: Sign in error:", error);
      toast({
        title: t("auth.loginFailed"),
        description: t("auth.pleaseLogin"),
        variant: "destructive",
      });
    }
  };

  if (isLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-pulse text-primary">
          <i className="fas fa-circle-notch fa-spin text-4xl"></i>
          <p className="mt-2">{t("auth.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">{t("login.welcome")}</CardTitle>
          <CardDescription>
            {t("login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              onClick={() => handleSignIn("google")}
            >
              <i className="fab fa-google"></i>
              {t("login.googleLogin")}
            </Button>
            
            <Button
              className="w-full bg-[#6441A4] hover:bg-[#7550BA] flex items-center justify-center gap-2"
              onClick={() => handleSignIn("twitch")}
            >
              <i className="fab fa-twitch"></i>
              {t("login.twitchLogin")}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {t("login.termsAgreement")}
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">{t("login.or")}</span>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500">
            {t("login.intro")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
