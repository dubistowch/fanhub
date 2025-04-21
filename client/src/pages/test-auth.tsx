import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const TestAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [error, setError] = useState<string>("");

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
      
      // 嘗試進行一個簡單的 API 調用
      try {
        const { data, error } = await supabase.from('test').select('*').limit(1);
        
        if (error) {
          results.push(`API test failed: ${error.message}`);
        } else {
          results.push("API test successful (or table doesn't exist)");
        }
      } catch (e) {
        results.push(`API test exception: ${(e as Error).message}`);
      }
      
      // 嘗試建立會話
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          results.push(`Get session failed: ${error.message}`);
        } else {
          results.push(`Session available: ${!!data.session}`);
          if (data.session) {
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

  useEffect(() => {
    console.log("TestAuth: Component mounted");
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Authentication Test</h1>
      
      <Button 
        onClick={runTest}
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? "Testing..." : "Run Test"}
      </Button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-medium mb-2">Test Results:</h2>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAuth;