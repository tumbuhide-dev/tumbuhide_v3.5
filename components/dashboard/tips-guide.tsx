import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export function TipsGuide() {
  const tips = [
    {
      title: "Optimalkan Profil",
      description: "Lengkapi semua informasi profil untuk meningkatkan visibilitas",
      link: "/help#profile-optimization",
    },
    {
      title: "Kelola Media Sosial",
      description: "Hubungkan semua akun media sosial untuk analisis terpadu",
      link: "/help#social-management",
    },
    {
      title: "Desain Link",
      description: "Buat tautan menarik dengan ikon dan deskripsi yang jelas",
      link: "/help#link-design",
    },
  ];

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-500/5 to-yellow-500/5">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Tips & Panduan
        </CardTitle>
        <CardDescription>Maksimalkan penggunaan platform Anda</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors group"
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {tip.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {tip.description}
              </p>
              <Button variant="link" asChild className="p-0 h-auto text-purple-600 dark:text-purple-400">
                <Link href={tip.link} className="flex items-center gap-1 text-sm">
                  Pelajari lebih lanjut
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            asChild
            className="w-full mt-4 bg-gradient-to-r hover:from-purple-50 hover:to-yellow-50 dark:hover:from-purple-900/20 dark:hover:to-yellow-900/20"
          >
            <Link href="/help" className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              Lihat Semua Panduan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 