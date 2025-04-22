import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/home";
import Login from "@/pages/login";
import CreatorProfile from "@/pages/creator/[id]";
import Profile from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import Discover from "@/pages/discover";
import Following from "@/pages/following";
import Settings from "@/pages/settings";
import AuthCallback from "@/pages/auth/callback";
import TestAuth from "@/pages/test-auth";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useEffect, Suspense } from "react";
// i18n
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    console.log("ProtectedRoutes:", { user, isLoading, location });
    
    // 排除不需要认证的路由
    const publicRoutes = ["/login", "/auth/callback", "/test-auth"];
    
    // 如果已经在登录页面，不需要重定向
    if (location === "/login") {
      return;
    }
    
    const isPublicRoute = publicRoutes.some(route => location.startsWith(route));
    
    if (!isLoading && !user && !isPublicRoute) {
      console.log("Redirecting to login page");
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/creator/:id" component={CreatorProfile} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/discover" component={Discover} />
      <Route path="/following" component={Following} />
      <Route path="/settings" component={Settings} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/test-auth" component={TestAuth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50">
          <ProtectedRoutes />
        </main>
        <Footer />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </Suspense>
  );
}

export default App;
