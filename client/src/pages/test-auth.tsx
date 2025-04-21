import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase, OAUTH_PROVIDERS } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const TestAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setError("");
    setTestResult("");
    
    try {
      console.log("TestAuth: Testing Supabase configuration");
      
      // 檢查環境變量
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let results = [
        `Supabase URL exists: ${!!supabaseUrl}`,
        `Supabase Anon Key exists: ${!!supabaseAnonKey}`
      ];
      
      // 測試 Supabase 連接
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          results.push(`Get session failed: ${error.message}`);
        } else {
          results.push(`Session test successful`);
          results.push(`Current session: ${data.session ? 'Active' : 'None'}`);
          if (data.session) {
            setSessionInfo(data.session);
            results.push(`User ID: ${data.session.user.id}`);
            results.push(`User email: ${data.session.user.email}`);
          }
        }
      } catch (e) {
        results.push(`Session test exception: ${(e as Error).message}`);
      }
      
      setTestResult(results.join("\n"));
    } catch (err) {
      setError(`Test failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (provider: 'google' | 'discord' | 'twitch' | 'twitter') => {
    try {
      setAuthLoading(true);
      console.log(`Attempting to sign in with ${provider}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      console.log("OAuth sign in data:", data);
      
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      setError(`${provider} sign in failed: ${(error as Error).message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSessionInfo(null);
      setTestResult("");
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      setError(`Sign out failed: ${(error as Error).message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    console.log("TestAuth: Component mounted");
    // Check for session on mount
    runTest();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Authentication Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>連接測試</CardTitle>
            <CardDescription>檢查 Supabase 環境配置是否正確</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">錯誤</p>
                <p>{error}</p>
              </div>
            )}
            
            {testResult && (
              <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-lg font-medium mb-2">測試結果:</h2>
                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={runTest}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  測試中...
                </>
              ) : "重新測試"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>身份認證測試</CardTitle>
            <CardDescription>測試 OAuth 登錄功能</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionInfo ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">已登入</p>
                <p>用戶 ID: {sessionInfo.user.id}</p>
                <p>郵箱: {sessionInfo.user.email}</p>
                <p>提供商: {sessionInfo.user.app_metadata?.provider || '未知'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">選擇一個登錄方式:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    disabled={authLoading} 
                    onClick={() => handleSignIn('google')}
                    className="w-full"
                  >
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={authLoading} 
                    onClick={() => handleSignIn('discord')}
                    className="w-full"
                  >
                    Discord
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={authLoading} 
                    onClick={() => handleSignIn('twitch')}
                    className="w-full"
                  >
                    Twitch
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={authLoading} 
                    onClick={() => handleSignIn('twitter')}
                    className="w-full"
                  >
                    Twitter
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {sessionInfo ? (
              <Button 
                variant="destructive" 
                disabled={authLoading} 
                onClick={handleSignOut}
                className="w-full"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : "登出"}
              </Button>
            ) : (
              <p className="text-xs text-gray-500 text-center">登入後將重定向到 /auth/callback 路徑</p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TestAuth;