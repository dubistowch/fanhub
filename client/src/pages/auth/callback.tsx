import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getCurrentUser, syncUserAfterOAuth, linkProvider } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    async function processOAuthRedirect() {
      try {
        // 获取当前的Supabase用户
        const supabaseUser = await getCurrentUser();
        
        if (!supabaseUser) {
          setError("Authentication failed. Please try again.");
          setProcessing(false);
          return;
        }
        
        // 获取提供商信息
        const provider = supabaseUser.app_metadata?.provider;
        if (!provider) {
          setError("Failed to get provider information");
          setProcessing(false);
          return;
        }
        
        // 将Supabase用户同步到我们的数据库
        const dbUser = await syncUserAfterOAuth(supabaseUser);
        
        // 链接提供商账号
        const providerData = {
          provider,
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.preferred_username,
          avatar: supabaseUser.user_metadata?.avatar_url,
          access_token: supabaseUser.user_metadata?.access_token || "",
          refresh_token: supabaseUser.user_metadata?.refresh_token || "",
        };
        
        try {
          await linkProvider(dbUser.id, providerData);
        } catch (error) {
          console.warn("Provider may already be linked:", error);
          // 已链接的提供商不影响登录流程
        }
        
        // 刷新用户信息
        await refreshUser();
        
        // 显示成功消息
        toast({
          title: "登录成功",
          description: `欢迎回来，${dbUser.username}！`,
        });
        
        // 重定向到主页
        setLocation("/");
      } catch (err) {
        console.error("Error in OAuth callback:", err);
        setError((err as Error).message || "An unknown error occurred");
        setProcessing(false);
        
        toast({
          title: "登录失败",
          description: (err as Error).message || "认证过程中发生错误，请重试",
          variant: "destructive",
        });
      }
    }
    
    processOAuthRedirect();
  }, []);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 p-4 rounded-lg mb-4">
          <h1 className="text-xl font-bold text-destructive mb-2">认证错误</h1>
          <p className="text-sm text-destructive-foreground">{error}</p>
        </div>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => setLocation("/login")}
        >
          返回登录
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-lg">正在完成认证...</p>
    </div>
  );
}