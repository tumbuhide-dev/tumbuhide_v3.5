"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  ExternalLink,
  Crown,
  Play,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface PublicProfileProProps {
  profile: {
    id: string;
    username: string;
    full_name: string;
    tagline?: string;
    bio?: string;
    location?: string;
    birth_year?: number;
    show_age?: boolean;
    pronouns?: string;
    niche?: string;
    avatar_url: string;
    cover_url: string;
    social_links: any[];
    custom_links: any[];
    showcase_videos: any[];
  };
}

const socialIcons: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
};

const nicheLabels: Record<string, string> = {
  kuliner: "Kuliner",
  lifestyle: "Lifestyle",
  tech: "Technology",
  fashion: "Fashion",
  travel: "Travel",
  fitness: "Fitness",
  beauty: "Beauty",
  gaming: "Gaming",
  music: "Music",
  education: "Education",
  business: "Business",
  art: "Art & Design",
};

export function PublicProfilePro({ profile }: PublicProfileProProps) {
  const supabase = createClientComponentClient();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAgeDisplay = () => {
    if (!profile.birth_year || !profile.show_age) return null;
    const currentYear = new Date().getFullYear();
    const age = currentYear - profile.birth_year;
    return `${age} tahun`;
  };

  const getPronounsDisplay = () => {
    if (!profile.pronouns) return null;
    return `Panggil saya ${profile.pronouns}`;
  };

  // Parse niches from JSON string or single string
  const getNiches = () => {
    if (!profile.niche) return [];
    try {
      const parsed = JSON.parse(profile.niche);
      return Array.isArray(parsed) ? parsed : [profile.niche];
    } catch {
      return profile.niche === "default" ? [] : [profile.niche];
    }
  };

  const trackLinkClick = async (
    linkId: string,
    linkType: string,
    url: string
  ) => {
    try {
      await supabase.from("analytics").insert({
        user_id: profile.id,
        event_type: "link_click",
        metadata: {
          link_id: linkId,
          link_type: linkType,
          url: url,
          username: profile.username,
        },
      });
    } catch (error) {
      console.error("Error tracking link click:", error);
    }
  };

  const handleLinkClick = (linkId: string, linkType: string, url: string) => {
    trackLinkClick(linkId, linkType, url);
    window.open(url, "_blank");
  };

  const niches = getNiches();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-400 to-purple-500">
        <Image
          src={profile.cover_url || "/placeholder.svg"}
          alt={`${profile.full_name} cover`}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `/placeholder.svg?height=256&width=800&text=${encodeURIComponent(
              profile.full_name
            )}`;
          }}
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Creator Pro
          </Badge>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6">
        {/* Profile Header - Mobile Layout */}
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.full_name}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.full_name}
              </h1>

              {/* Niche Badges */}
              {niches.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {niches.map((niche) => (
                    <Badge key={niche} variant="secondary" className="text-sm">
                      {nicheLabels[niche] || niche}
                    </Badge>
                  ))}
                </div>
              )}

              {profile.tagline && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {profile.tagline}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {getAgeDisplay() && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{getAgeDisplay()}</span>
                  </div>
                )}
              </div>

              {getPronounsDisplay() && (
                <Badge variant="outline" className="text-xs">
                  {getPronounsDisplay()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 pb-12">
          {/* Social Links */}
          {profile.social_links.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Media Sosial
                </h2>
                <div className="space-y-3">
                  {profile.social_links.slice(0, 6).map((link) => {
                    const Icon = socialIcons[link.platform] || Globe;
                    return (
                      <Button
                        key={link.id}
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        onClick={() =>
                          handleLinkClick(link.id, "social", link.url)
                        }
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="text-left flex-1">
                          <div className="font-medium capitalize">
                            {link.platform}
                          </div>
                          {link.follower_count && (
                            <div className="text-xs text-gray-500">
                              {link.follower_count.toLocaleString()} followers
                            </div>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Links */}
          {profile.custom_links.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Link Penting
                </h2>
                <div className="space-y-3">
                  {profile.custom_links.slice(0, 10).map((link) => (
                    <Button
                      key={link.id}
                      variant="outline"
                      className="w-full justify-between h-auto p-4"
                      onClick={() =>
                        handleLinkClick(link.id, "custom", link.url)
                      }
                    >
                      <div className="text-left">
                        <div className="font-medium">{link.title}</div>
                        {link.description && (
                          <div className="text-sm text-gray-500">
                            {link.description}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Showcase - Pro Feature */}
          {profile.showcase_videos && profile.showcase_videos.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">Video Showcase</h2>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {profile.showcase_videos.slice(0, 4).map((video) => (
                    <div
                      key={video.id}
                      className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() =>
                        handleLinkClick(video.id, "showcase", video.url)
                      }
                    >
                      <Image
                        src={video.thumbnail_url || "/placeholder.svg"}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-sm font-medium">
                          {video.title}
                        </p>
                        <p className="text-white/80 text-xs">
                          {video.platform}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Branding */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">T</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Dibuat dengan Tumbuhide.id
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Platform link-in-bio untuk content creator Indonesia
              </p>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/" target="_blank">
                  Buat Profil Gratis
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
