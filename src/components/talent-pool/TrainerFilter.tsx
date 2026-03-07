"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, RefreshCcw } from "lucide-react";
import { JOB_CATEGORY_OPTIONS } from "@/constants/job-categories";
import { EXPERIENCE_LEVEL_OPTIONS } from "@/constants/experience-levels";
import type { TrainerFilter as TrainerFilterType } from "@/types";

interface TrainerFilterProps {
  currentFilter: TrainerFilterType;
}

export function TrainerFilter({ currentFilter }: TrainerFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentFilter.search || "");
  const [categories, setCategories] = useState<string[]>(currentFilter.categories || []);
  const [experienceLevel, setExperienceLevel] = useState(currentFilter.experienceLevel || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleApplyFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams);

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    } else {
      params.delete("categories");
    }

    if (experienceLevel) {
      params.set("experienceLevel", experienceLevel);
    } else {
      params.delete("experienceLevel");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [search, categories, experienceLevel, router, pathname, searchParams]);

  const handleResetFilter = useCallback(() => {
    setSearch("");
    setCategories([]);
    setExperienceLevel("");
    router.push(pathname);
  }, [router, pathname]);

  const hasActiveFilter = search || categories.length > 0 || experienceLevel;

  const filterContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">이름 검색</Label>
        <Input
          id="search"
          placeholder="트레이너 이름 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
        />
      </div>

      <div className="space-y-2">
        <Label>업종</Label>
        <div className="grid grid-cols-2 gap-2">
          {JOB_CATEGORY_OPTIONS.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={`trainer-category-${category.value}`}
                checked={categories.includes(category.value)}
                onCheckedChange={() => handleCategoryToggle(category.value)}
              />
              <Label
                htmlFor={`trainer-category-${category.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>경력</Label>
        <Select
          value={experienceLevel || undefined}
          onValueChange={(value) => setExperienceLevel(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        {hasActiveFilter && (
          <Button variant="outline" className="w-full" onClick={handleResetFilter}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            초기화
          </Button>
        )}
        <Button
          className="w-full"
          onClick={() => {
            handleApplyFilter();
            setMobileOpen(false);
          }}
        >
          <Search className="h-4 w-4 mr-2" />
          검색
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden mb-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full cursor-pointer">
              <Filter className="h-4 w-4 mr-2" />
              필터{" "}
              {hasActiveFilter &&
                `(${[search, ...categories, experienceLevel].filter(Boolean).length})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{filterContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="hidden lg:block sticky top-4">
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>{filterContent}</CardContent>
      </Card>
    </>
  );
}
