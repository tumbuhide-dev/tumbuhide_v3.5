"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Play,
  ExternalLink,
  GripVertical,
  Crown,
  ArrowLeft,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SECURITY } from "@/lib/constants";
import { validateURL, sanitizeInput } from "@/lib/security";
import Image from "next/image";
import Link from "next/link";

interface ShowcaseItem {
  id: string;
  platform: string;
  video_url: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  view_count?: number;
  display_order: number;
}

interface ShowcaseManagerProps {
  userId: string;
  userPlan: string;
}

const PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/p/...",
  },
  {
    value: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@user/video/...",
  },
  {
    value: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/watch?v=...",
  },
];

export function ShowcaseManager({ userId, userPlan }: ShowcaseManagerProps) {
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({
    platform: "",
    video_url: "",
    title: "",
    description: "",
  });

  const supabase = createClientComponentClient();
  const maxItems =
    userPlan === "pro" ? SECURITY.CONTENT_LIMITS.MAX_SHOWCASE_ITEMS_PRO : 0;

  useEffect(() => {
    fetchShowcaseItems();
  }, []);

  const fetchShowcaseItems = async () => {
    try {
      const { data, error } = await supabase
        .from("showcase_items")
        .select("*")
        .eq("user_id", userId)
        .order("display_order");

      if (error) throw error;
      setShowcaseItems(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoInfo = (url: string, platform: string) => {
    // Basic video info extraction
    let videoId = "";
    let thumbnailUrl = "";

    if (platform === "youtube") {
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      );
      if (match) {
        videoId = match[1];
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } else if (platform === "instagram") {
      thumbnailUrl =
        "/placeholder.svg?height=300&width=300&text=Instagram+Video";
    } else if (platform === "tiktok") {
      thumbnailUrl = "/placeholder.svg?height=300&width=300&text=TikTok+Video";
    }

    return { videoId, thumbnailUrl };
  };

  const addShowcaseItem = async () => {
    if (!newItem.platform || !newItem.video_url || !newItem.title) {
      setError("Platform, URL, dan judul wajib diisi");
      return;
    }

    if (!validateURL(newItem.video_url)) {
      setError("URL tidak valid");
      return;
    }

    if (maxItems > 0 && showcaseItems.length >= maxItems) {
      setError(`Maksimal ${maxItems} showcase items untuk paket Pro`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { thumbnailUrl } = extractVideoInfo(
        newItem.video_url,
        newItem.platform
      );

      const { data, error } = await supabase
        .from("showcase_items")
        .insert({
          user_id: userId,
          platform: newItem.platform,
          video_url: sanitizeInput(newItem.video_url),
          title: sanitizeInput(newItem.title),
          description: sanitizeInput(newItem.description) || null,
          thumbnail_url: thumbnailUrl,
          display_order: showcaseItems.length,
        })
        .select()
        .single();

      if (error) throw error;

      setShowcaseItems([...showcaseItems, data]);
      setNewItem({ platform: "", video_url: "", title: "", description: "" });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteShowcaseItem = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("showcase_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setShowcaseItems(showcaseItems.filter((item) => item.id !== id));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tombol Kembali */}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plan Info */}
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              Creator Pro: {showcaseItems.length}/
              {maxItems === 0 ? "∞" : maxItems} showcase items
            </span>
          </div>
        </AlertDescription>
      </Alert>

      {/* Add New Showcase Item */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Video Showcase</CardTitle>
          <CardDescription>
            Tambahkan video terbaik Anda untuk ditampilkan di profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={newItem.platform}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul Video *</Label>
              <Input
                id="title"
                placeholder="Judul video yang menarik"
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">URL Video *</Label>
            <Input
              id="video_url"
              type="url"
              placeholder={
                PLATFORMS.find((p) => p.value === newItem.platform)
                  ?.placeholder || "https://..."
              }
              value={newItem.video_url}
              onChange={(e) =>
                setNewItem({ ...newItem, video_url: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Input
              id="description"
              placeholder="Deskripsi singkat tentang video"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              maxLength={200}
            />
          </div>

          <Button
            onClick={addShowcaseItem}
            disabled={
              saving ||
              !newItem.platform ||
              !newItem.video_url ||
              !newItem.title
            }
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Video Showcase
          </Button>
        </CardContent>
      </Card>

      {/* Existing Showcase Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Video Showcase Anda ({showcaseItems.length})
        </h3>

        {showcaseItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">
                Belum ada video showcase. Tambahkan yang pertama!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcaseItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" asChild>
                      <a
                        href={item.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Lihat Video
                      </a>
                    </Button>
                  </div>
                  <Badge className="absolute top-2 left-2 capitalize">
                    {item.platform}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.view_count && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.view_count.toLocaleString()} views
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button variant="ghost" size="sm">
                        <GripVertical className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteShowcaseItem(item.id)}
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
