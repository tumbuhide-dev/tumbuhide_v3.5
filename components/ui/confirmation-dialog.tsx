"use client";

import type * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  children?: React.ReactNode;
  variant?: "destructive" | "default";
}

export function ConfirmationDialog({
  title,
  description,
  onConfirm,
  children,
  variant = "destructive",
}: ConfirmationDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""
            }
          >
            {variant === "destructive" ? "Hapus" : "Konfirmasi"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
