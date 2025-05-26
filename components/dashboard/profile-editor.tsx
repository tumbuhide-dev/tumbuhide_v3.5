"use client";
import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Upload,
  Crown,
  ExternalLink,
  ArrowLeft,
  X,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generateAvatarFromUsername } from "@/lib/avatar-generator";
import { generateRandomCover, hasSavedCover } from "@/lib/cover-generator";
import Link from "next/link";

const NICHE_OPTIONS = [
  { value: "kuliner", label: "Kuliner" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "tech", label: "Technology" },
  { value: "fashion", label: "Fashion" },
  { value: "travel", label: "Travel" },
  { value: "fitness", label: "Fitness" },
  { value: "beauty", label: "Beauty" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "education", label: "Education" },
  { value: "business", label: "Business" },
  { value: "art", label: "Art & Design" },
];

interface ProfileEditorProps {
  profile: {
    id: string;
    username: string;
    full_name: string;
    email: string;
    tagline?: string | null;
    bio?: string | null;
    location?: string | null;
    birth_year?: number | null;
    pronouns?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    show_age?: boolean;
    plan: string;
    is_verified: boolean;
    niche?: string | null;
  };
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  // Parse existing niches (convert from string to array)
  const parseNiches = (nicheString: string | null): string[] => {
    if (!nicheString || nicheString === "default") return ["lifestyle"];
    try {
      const parsed = JSON.parse(nicheString);
      return Array.isArray(parsed) ? parsed : [nicheString];
    } catch {
      return [nicheString];
    }
  };

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    tagline: profile.tagline || "",
    bio: profile.bio || "",
    location: profile.location || "",
    pronouns: profile.pronouns || "",
    birth_year: profile.birth_year || new Date().getFullYear() - 20,
    show_age: profile.show_age ?? true,
    niches: parseNiches(profile.niche),
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [hasGeneratedNewCover, setHasGeneratedNewCover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleNicheChange = (nicheValue: string, checked: boolean) => {
    setFormData((prev) => {
      let newNiches = [...prev.niches];

      if (checked) {
        // Add niche if not already present and under limit
        if (!newNiches.includes(nicheValue) && newNiches.length < 5) {
          newNiches.push(nicheValue);
        }
      } else {
        // Remove niche but ensure at least 1 remains
        if (newNiches.length > 1) {
          newNiches = newNiches.filter((n) => n !== nicheValue);
        }
      }

      return { ...prev, niches: newNiches };
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB");
      return;
    }

    setCoverFile(file);
    setHasGeneratedNewCover(false); // Reset generated flag when uploading

    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  };

  const generateRandomCoverImage = () => {
    const newCoverUrl = generateRandomCover();
    setCoverPreview(newCoverUrl);
    setCoverFile(null);
    setHasGeneratedNewCover(true); // Mark as generated
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.cover_url;

      // Upload avatar if new file
      if (avatarFile) {
        setUploadingAvatar(true);
        avatarUrl = await uploadFile(avatarFile, "avatars", "avatars");
        setUploadingAvatar(false);
      }

      // Upload cover if new file
      if (coverFile) {
        setUploadingCover(true);
        coverUrl = await uploadFile(coverFile, "covers", "covers");
        setUploadingCover(false);
      }

      // Save generated cover if user clicked random and it's different
      if (
        hasGeneratedNewCover &&
        coverPreview &&
        coverPreview !== profile.cover_url
      ) {
        coverUrl = coverPreview;
      }

      // Generate initial cover only if user has no cover at all
      if (!coverUrl && !hasSavedCover(profile.cover_url ?? null)) {
        coverUrl = generateRandomCover();
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          tagline: formData.tagline || null,
          bio: formData.bio || null,
          location: formData.location || null,
          pronouns: formData.pronouns || null,
          birth_year: formData.birth_year,
          show_age: formData.show_age,
          niche: JSON.stringify(formData.niches), // Store as JSON array
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setSuccess("Profil berhasil diperbarui!");
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
      setHasGeneratedNewCover(false);

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Profile update error:", error);
      setError(error.message || "Terjadi kesalahan saat menyimpan profil");
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentAvatarUrl =
    avatarPreview ||
    profile.avatar_url ||
    generateAvatarFromUsername(profile.username);

  // Show current cover, or preview if changed, or generate if no saved cover
  const currentCoverUrl =
    coverPreview ||
    (hasSavedCover(profile.cover_url)
      ? profile.cover_url
      : generateRandomCover());

  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear - 13;

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-8">
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

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Cover Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Sampul</CardTitle>
          <CardDescription>
            Gambar latar belakang untuk profil Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-32 sm:h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={currentCoverUrl || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {uploadingCover && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              id="cover-upload"
            />
            <Button variant="outline" size="sm" asChild>
              <label
                htmlFor="cover-upload"
                className="cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Sampul
              </label>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateRandomCoverImage}
            >
              🎲 Random Cover
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Profil</CardTitle>
              <CardDescription>
                Informasi yang ditampilkan di profil publik Anda
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat Profil
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={currentAvatarUrl || "/placeholder.svg"}
                  alt={profile.full_name}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{profile.full_name}</h3>
                {profile.is_verified && (
                  <Badge variant="secondary">Verified</Badge>
                )}
                <Badge
                  variant={profile.plan === "pro" ? "default" : "secondary"}
                >
                  {profile.plan === "pro" && <Crown className="w-3 h-3 mr-1" />}
                  {profile.plan === "pro" ? "Creator Pro" : "Basic"}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                @{profile.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {profile.email}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Ubah Foto
                </label>
              </Button>
              {avatarFile && (
                <p className="text-xs text-gray-500">File siap diupload</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                maxLength={100}
                required
              />
            </div>

            {/* Niches - Multi Select */}
            <div className="space-y-2">
              <Label>Niche (Pilih 1-5) *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {NICHE_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`niche-${option.value}`}
                      checked={formData.niches.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleNicheChange(option.value, checked as boolean)
                      }
                      disabled={
                        !formData.niches.includes(option.value) &&
                        formData.niches.length >= 5
                      }
                    />
                    <Label
                      htmlFor={`niche-${option.value}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.niches.map((niche) => {
                  const nicheOption = NICHE_OPTIONS.find(
                    (opt) => opt.value === niche
                  );
                  return (
                    <Badge key={niche} variant="secondary" className="text-xs">
                      {nicheOption?.label || niche}
                      {formData.niches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleNicheChange(niche, false)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">
                Dipilih: {formData.niches.length}/5 (minimal 1, maksimal 5)
              </p>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="Ceritakan tentang diri Anda dalam satu kalimat"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                }
                maxLength={150}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Ceritakan lebih detail tentang diri Anda, pengalaman, dan passion"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                {formData.bio.length}/500 karakter
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                placeholder="Kota, Indonesia"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                maxLength={100}
              />
            </div>

            {/* Birth Year & Show Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_year">Tahun Lahir</Label>
                <Input
                  id="birth_year"
                  type="number"
                  min={minYear}
                  max={maxYear}
                  value={formData.birth_year}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      birth_year: Number.parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-gray-500">
                  Umur: {currentYear - formData.birth_year} tahun
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="show_age">Tampilkan Umur</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_age"
                    checked={formData.show_age}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, show_age: checked }))
                    }
                  />
                  <Label htmlFor="show_age" className="text-sm text-gray-600">
                    {formData.show_age
                      ? "Umur akan ditampilkan di profil"
                      : "Umur disembunyikan"}
                  </Label>
                </div>
              </div>
            </div>

            {/* Pronouns */}
            <div className="space-y-2">
              <Label htmlFor="pronouns">Kata Panggilan</Label>
              <Input
                id="pronouns"
                placeholder="dia, ia, mereka, dll"
                value={formData.pronouns}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pronouns: e.target.value }))
                }
                maxLength={50}
              />
              <p className="text-xs text-gray-500">
                Bagaimana Anda ingin dipanggil atau disebut
              </p>
            </div>

            <Button
              type="submit"
              disabled={
                loading ||
                uploadingAvatar ||
                uploadingCover ||
                formData.niches.length === 0
              }
              className="w-full"
            >
              {(loading || uploadingAvatar || uploadingCover) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {uploadingAvatar
                ? "Mengupload Avatar..."
                : uploadingCover
                ? "Mengupload Cover..."
                : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
