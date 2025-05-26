"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ExternalLink, Copy } from "lucide-react";
import { CONSTANTS } from "@/lib/constants";
import Link from "next/link";

interface DashboardClientPageProps {
  profile: any;
  userId: string;
}

export default function DashboardClientPage({
  profile,
  userId,
}: DashboardClientPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Analytics Stats */}
          <DashboardStats userId={userId} />

          {/* Quick Actions */}
          <QuickActions profile={profile} />
        </div>
      </main>
    </div>
  );
}
