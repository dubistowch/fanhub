import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { user, signOut, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const [userState, setUserState] = useState<any>(null);
  const { t } = useTranslation();
  
  useEffect(() => {
    console.log("Header component:", { user, isLoading });
    setUserState(user);
  }, [user, isLoading]);
  
  // 显示加载状态
  if (isLoading) {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-primary font-bold text-2xl">FanHub</span>
          <span>{t("auth.loading")}</span>
        </div>
      </header>
    );
  }
  
  // Only show the full header if user is logged in
  if (!user) {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-primary font-bold text-2xl">FanHub</span>
        </div>
      </header>
    );
  }

  const navItems = [
    { name: t('common.discover'), path: "/discover" },
    { name: t('common.following'), path: "/following" },
    { name: t('common.dashboard'), path: "/dashboard" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-primary font-bold text-2xl">FanHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`font-medium ${
                location === item.path
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 focus:outline-none p-1"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm hidden md:inline">
                  {user.username}
                </span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer w-full">
                  {t('common.profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer w-full">
                  {t('settings.title')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => {
                  console.log("Header: User clicked logout button");
                  // 使用AuthContext中的signOut方法，而不是直接调用auth.ts中的函数
                  user && signOut();
                }}
              >
                {t('common.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="md:hidden p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white pb-4 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block py-2 font-medium ${
                location === item.path
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
