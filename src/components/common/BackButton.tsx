"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  className?: string;
}

export function BackButton({ variant = "outline", className }: BackButtonProps) {
  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <Button variant={variant} onClick={handleBack} className={className}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      이전 페이지
    </Button>
  );
}
