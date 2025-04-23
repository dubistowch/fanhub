import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { signInWithOAuth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleSignIn = async () => {
    try {
      console.log("Login: Starting sign in with Google");
      const result = await signInWithOAuth("google");
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
          <CardTitle className="text-3xl font-bold">
            {t("login.welcome")}
          </CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              onClick={handleSignIn}
            >
              <i className="fab fa-google"></i>
              {t("login.googleLogin")}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {t("login.termsAgreement")}
            </p>
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
