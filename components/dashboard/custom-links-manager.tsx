"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  Plus,
  ExternalLink,
  GripVertical,
  Crown,
  Star,
  ArrowLeft,
  Link,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SECURITY } from "@/lib/constants";
import { validateURL, sanitizeInput } from "@/lib/security";

interface CustomLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon_url?: string;
  is_featured: boolean;
  status: string;
  click_count: number;
  display_order: number;
}

interface CustomLinksManagerProps {
  userId: string;
  userPlan: string;
}

export function CustomLinksManager({
  userId,
  userPlan,
}: CustomLinksManagerProps) {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState({
    title: "",
    description: "",
    url: "",
    is_featured: false,
  });

  const supabase = createClientComponentClient();
  const maxLinks =
    userPlan === "pro" ? -1 : SECURITY.CONTENT_LIMITS.MAX_CUSTOM_LINKS_BASIC;

  useEffect(() => {
    fetchCustomLinks();
  }, []);

  const fetchCustomLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_links")
        .select("*")
        .eq("user_id", userId)
        .order("display_order");

      if (error) throw error;
      setCustomLinks(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addCustomLink = async () => {
    if (!newLink.title || !newLink.url) {
      setError("Judul dan URL wajib diisi");
      return;
    }

    if (!validateURL(newLink.url)) {
      setError("URL tidak valid");
      return;
    }

    if (maxLinks !== -1 && customLinks.length >= maxLinks) {
      setError(`Maksimal ${maxLinks} custom links untuk paket Basic`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("custom_links")
        .insert({
          user_id: userId,
          title: sanitizeInput(newLink.title),
          description: sanitizeInput(newLink.description),
          url: sanitizeInput(newLink.url),
          is_featured: newLink.is_featured,
          display_order: customLinks.length,
        })
        .select()
        .single();

      if (error) throw error;

      setCustomLinks([...customLinks, data]);
      setNewLink({ title: "", description: "", url: "", is_featured: false });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomLink = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("custom_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCustomLinks(customLinks.filter((link) => link.id !== id));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (id: string, is_featured: boolean) => {
    try {
      const { error } = await supabase
        .from("custom_links")
        .update({ is_featured })
        .eq("id", id);

      if (error) throw error;

      setCustomLinks(
        customLinks.map((link) =>
          link.id === id ? { ...link, is_featured } : link
        )
      );
    } catch (error: any) {
      setError(error.message);
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
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plan Limit Info */}
      {userPlan === "basic" && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Paket Basic: {customLinks.length}/{maxLinks} custom links
              </span>
              <Button size="sm" variant="outline">
                Upgrade ke Pro
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Add New Link */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Custom Link Baru</CardTitle>
          <CardDescription>
            Tambahkan link website, produk, atau konten penting Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Link *</Label>
              <Input
                id="title"
                placeholder="Contoh: Website Portfolio"
                value={newLink.title}
                onChange={(e) =>
                  setNewLink({ ...newLink, title: e.target.value })
                }
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://website.com"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang link ini"
              value={newLink.description}
              onChange={(e) =>
                setNewLink({ ...newLink, description: e.target.value })
              }
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={newLink.is_featured}
              onCheckedChange={(checked) =>
                setNewLink({ ...newLink, is_featured: checked })
              }
            />
            <Label htmlFor="featured" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Tandai sebagai featured
            </Label>
          </div>

          <Button
            onClick={addCustomLink}
            disabled={
              saving ||
              !newLink.title ||
              !newLink.url ||
              (maxLinks !== -1 && customLinks.length >= maxLinks)
            }
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Custom Link
          </Button>
        </CardContent>
      </Card>

      {/* Existing Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Custom Links Anda ({customLinks.length})
        </h3>

        {customLinks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">
                Belum ada custom links. Tambahkan yang pertama!
              </p>
            </CardContent>
          </Card>
        ) : (
          customLinks.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {link.title}
                        </h4>
                        {link.is_featured && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      {link.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {link.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500">
                        {link.click_count} clicks • {new URL(link.url).hostname}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.is_featured}
                      onCheckedChange={(checked) =>
                        toggleFeatured(link.id, checked)
                      }
                      size="sm"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCustomLink(link.id)}
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
