"use client";

import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Filter } from "lucide-react";
import { REGION_OPTIONS } from "@/constants/regions";
import { JOB_CATEGORY_OPTIONS } from "@/constants/job-categories";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/constants/employment-types";
import { EXPERIENCE_LEVEL_OPTIONS } from "@/constants/experience-levels";
import type { JobFilter as JobFilterType } from "@/types";

interface JobFilterProps {
  currentFilter: JobFilterType;
}

export function JobFilter({ currentFilter }: JobFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentFilter.search || "");
  const [region, setRegion] = useState(currentFilter.region || "");
  const [categories, setCategories] = useState<string[]>(currentFilter.categories || []);
  const [gender, setGender] = useState(currentFilter.gender || "");
  const [employmentType, setEmploymentType] = useState(currentFilter.employmentType || "");
  const [experienceLevel, setExperienceLevel] = useState(currentFilter.experienceLevel || "");

  const handleCategoryToggle = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams);

    // 검색어
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    // 지역
    if (region) {
      params.set("region", region);
    } else {
      params.delete("region");
    }

    // 업종
    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    } else {
      params.delete("categories");
    }

    // 성별
    if (gender) {
      params.set("gender", gender);
    } else {
      params.delete("gender");
    }

    // 고용형태
    if (employmentType) {
      params.set("employmentType", employmentType);
    } else {
      params.delete("employmentType");
    }

    // 경력
    if (experienceLevel) {
      params.set("experienceLevel", experienceLevel);
    } else {
      params.delete("experienceLevel");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilter = () => {
    setSearch("");
    setRegion("");
    setCategories([]);
    setGender("");
    setEmploymentType("");
    setExperienceLevel("");
    router.push(pathname);
  };

  const hasActiveFilter =
    search || region || categories.length > 0 || gender || employmentType || experienceLevel;

  const [mobileOpen, setMobileOpen] = useState(false);

  // 필터 폼 컨텐츠 (재사용)
  const FilterContent = () => (
    <div className="space-y-4">
        {/* 검색어 */}
        <div className="space-y-2">
          <Label htmlFor="search">검색어</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="제목 또는 내용 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
            />
          </div>
        </div>

        {/* 지역 */}
        <div className="space-y-2">
          <Label>지역</Label>
          <Select value={region || undefined} onValueChange={(value) => setRegion(value)}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              {REGION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 업종 (복수 선택) */}
        <div className="space-y-2">
          <Label>업종</Label>
          <div className="grid grid-cols-2 gap-2">
            {JOB_CATEGORY_OPTIONS.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={categories.includes(category.value)}
                  onCheckedChange={() => handleCategoryToggle(category.value)}
                />
                <Label
                  htmlFor={`category-${category.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* 성별 */}
        <div className="space-y-2">
          <Label>성별</Label>
          <Select value={gender || undefined} onValueChange={(value) => setGender(value)}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">남성</SelectItem>
              <SelectItem value="female">여성</SelectItem>
              <SelectItem value="any">무관</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 고용형태 */}
        <div className="space-y-2">
          <Label>고용형태</Label>
          <Select value={employmentType || undefined} onValueChange={(value) => setEmploymentType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 경력 */}
        <div className="space-y-2">
          <Label>경력</Label>
          <Select value={experienceLevel || undefined} onValueChange={(value) => setExperienceLevel(value)}>
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

      {/* 적용 버튼 */}
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
  );

  return (
    <>
      {/* 모바일 필터 버튼 */}
      <div className="lg:hidden mb-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              필터 {hasActiveFilter && `(${[search, region, ...categories, gender, employmentType, experienceLevel].filter(Boolean).length})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>필터</SheetTitle>
                {hasActiveFilter && (
                  <Button variant="ghost" size="sm" onClick={handleResetFilter}>
                    <X className="h-4 w-4 mr-2" />
                    초기화
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 데스크톱 필터 */}
      <Card className="hidden lg:block">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>필터</CardTitle>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={handleResetFilter}>
                <X className="h-4 w-4 mr-2" />
                초기화
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <FilterContent />
        </CardContent>
      </Card>
    </>
  );
}
