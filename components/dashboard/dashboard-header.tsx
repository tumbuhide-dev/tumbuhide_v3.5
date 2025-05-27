"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Settings,
  LogOut,
  User,
  Crown,
  BarChart3,
  Link as LinkIcon,
  ChevronDown,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";
import { generateAvatarFromUsername } from "@/lib/avatar-generator";
import { useToast } from "@/components/ui/use-toast";

interface DashboardHeaderProps {
  profile: {
    username: string;
    full_name: string;
    avatar_url?: string;
    plan: string;
  };
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl =
    profile.avatar_url || generateAvatarFromUsername(profile.username);

  const isAtDashboard = pathname === "/dashboard";

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Tumbuhide.id
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {!isAtDashboard && (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}

            {/* Analytics Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytics
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analytics">Profile Analytics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/social/analytics" className="flex items-center justify-between">
                    Social Analytics
                    {profile.plan !== "pro" && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Links Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Links
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/social-links">Social Links</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/custom-links">Custom Links</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Plan Badge */}
            <Badge
              variant={profile.plan === "pro" ? "default" : "secondary"}
              className="hidden sm:flex"
            >
              {profile.plan === "pro" && <Crown className="w-3 h-3 mr-1" />}
              {profile.plan === "pro" ? "Creator Pro" : "Basic"}
            </Badge>

            {/* View Profile */}
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Lihat Profil</span>
              </Link>
            </Button>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={avatarUrl || "/placeholder.svg"}
                      alt={profile.full_name}
                    />
                    <AvatarFallback>
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile.full_name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      @{profile.username}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
