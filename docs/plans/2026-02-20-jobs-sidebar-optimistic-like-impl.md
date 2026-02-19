# Jobs Sidebar & Optimistic Like Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `/jobs` 페이지에서 로그인 사용자에게 Sidebar를 표시하고, 좋아요 버튼에 TanStack Query 기반 Optimistic Update를 적용한다.

**Architecture:** `(app-public)` route group을 신규 생성해 선택적 인증 레이아웃을 분리하고, `/jobs` 리스트 페이지를 이동한다. TanStack Query를 루트에 설치하고, `LikeButton`을 `useMutation`의 `onMutate` 패턴으로 리팩터링한다.

**Tech Stack:** Next.js 15 App Router, @tanstack/react-query 5, Supabase Server Actions, shadcn/ui

---

## Task 1: TanStack Query 설치 및 QueryProvider 생성

**Files:**
- Create: `src/components/providers/QueryProvider.tsx`
- Modify: `src/app/layout.tsx`

### Step 1: 패키지 설치

```bash
npm install @tanstack/react-query
```

예상 출력: `added N packages`

### Step 2: QueryProvider 파일 생성

`src/components/providers/QueryProvider.tsx` 생성:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Step 3: 루트 레이아웃에 QueryProvider 적용

`src/app/layout.tsx`의 `<body>` 내부에서 `{children}` 을 `QueryProvider`로 감싸기:

```tsx
import { QueryProvider } from "@/components/providers/QueryProvider";

// <body> 내부 변경:
<QueryProvider>
  {children}
</QueryProvider>
```

최종 body 구조:
```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <Script ... />
  <QueryProvider>
    {children}
  </QueryProvider>
  <Toaster />
  <SpeedInsights />
</body>
```

### Step 4: 타입 체크

```bash
npm run type:check
```

예상 출력: 에러 없음

### Step 5: 커밋

```bash
git add src/components/providers/QueryProvider.tsx src/app/layout.tsx
git commit -m "feat: TanStack Query 설치 및 QueryProvider 루트 레이아웃 적용"
```

---

## Task 2: (app-public) route group 생성 및 /jobs 이동

**Files:**
- Create: `src/app/(app-public)/layout.tsx`
- Create: `src/app/(app-public)/jobs/page.tsx` ← (public)/jobs/page.tsx 내용 이동
- Create: `src/app/(app-public)/jobs/loading.tsx` ← (public)/jobs/loading.tsx 내용 이동
- Delete: `src/app/(public)/jobs/page.tsx`
- Delete: `src/app/(public)/jobs/loading.tsx`

### Step 1: (app-public) 디렉토리 생성

```bash
mkdir -p src/app/\(app-public\)/jobs
```

### Step 2: (app-public)/layout.tsx 생성

```tsx
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default async function AppPublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인: PublicHeader 레이아웃
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader user={null} profile={null} />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // 로그인: Sidebar + Header 레이아웃
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .single();

  const { data: center } = await supabase
    .from("centers")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  const hasCenter = !!center;

  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar profile={profile!} hasCenter={hasCenter} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} profile={profile!} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 pt-16 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Step 3: (public)/jobs/page.tsx 내용을 (app-public)/jobs/page.tsx로 이동

`src/app/(app-public)/jobs/page.tsx`를 아래 내용으로 생성 (기존 파일과 동일):

```tsx
import { createClient } from "@/lib/supabase/server";
import { JobFilter } from "@/components/jobs/JobFilter";
import { JobCard } from "@/components/jobs/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import type {
  JobFilter as JobFilterType,
  JobCategoryCode,
  Gender,
  EmploymentTypeCode,
  ExperienceLevelCode,
} from "@/types";

interface PageProps {
  searchParams: Promise<{
    location?: string;
    categories?: string;
    gender?: string;
    employmentType?: string;
    experienceLevel?: string;
    search?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 인증 상태 확인 (선택적)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 필터 적용하여 구인공고 조회
  let query = supabase
    .from("job_postings_with_details")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params.location) {
    query = query.ilike("address", `%${params.location}%`);
  }
  if (params.categories) {
    const categoryArray = params.categories.split(",");
    query = query.contains("categories", categoryArray);
  }
  if (params.gender && params.gender !== "any") {
    query = query.in("gender", [params.gender, "any"]);
  }
  if (params.employmentType) {
    query = query.eq("employment_type", params.employmentType);
  }
  if (params.experienceLevel) {
    query = query.eq("experience_level", params.experienceLevel);
  }
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  const { data: jobs, error } = await query;

  if (error) {
    console.error("구인공고 조회 오류:", error);
  }

  const currentFilter: JobFilterType = {
    location: params.location,
    categories: params.categories?.split(",") as JobCategoryCode[] | undefined,
    gender: params.gender as Gender | undefined,
    employmentType: params.employmentType as EmploymentTypeCode | undefined,
    experienceLevel: params.experienceLevel as ExperienceLevelCode | undefined,
    search: params.search,
  };

  return (
    <div className="container px-4 mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">구인공고</h1>
        <p className="text-sm text-muted-foreground mt-1">원하는 조건의 구인공고를 찾아보세요</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 shrink-0">
          <JobFilter currentFilter={currentFilter} />
        </div>
        <div className="flex-1">
          {!jobs || jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-sm text-muted-foreground">다른 조건으로 검색해보세요</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">총 {jobs.length}개의 공고</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isAuthenticated={!!user}
                    userId={user?.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: (app-public)/jobs/loading.tsx 생성

`src/app/(public)/jobs/loading.tsx` 내용 그대로 이동:

```bash
cat src/app/\(public\)/jobs/loading.tsx
```

확인 후 동일 내용으로 `src/app/(app-public)/jobs/loading.tsx` 생성.

### Step 5: 기존 (public)/jobs/ 파일 삭제

```bash
rm src/app/\(public\)/jobs/page.tsx
rm src/app/\(public\)/jobs/loading.tsx
rmdir src/app/\(public\)/jobs
```

### Step 6: 타입 체크 및 빌드

```bash
npm run type:check
npm run lint
```

예상 출력: 에러 없음

### Step 7: 커밋

```bash
git add src/app/\(app-public\)/ src/app/\(public\)/
git commit -m "feat: jobs 페이지 (app-public) 그룹으로 이동 및 조건부 Sidebar 적용"
```

---

## Task 3: LikeButton Optimistic Update 적용

**Files:**
- Modify: `src/components/common/LikeButton.tsx`

### Step 1: 현재 LikeButton 확인

`src/components/common/LikeButton.tsx` 읽기 (이미 숙지됨):
- `useEffect` + `checkLiked` → 마운트 시 서버 액션 호출
- `useTransition` + `toggleLike` → 응답 대기 후 UI 업데이트

### Step 2: LikeButton 전체 교체

`src/components/common/LikeButton.tsx` 내용 전체 교체:

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, checkLiked } from "@/actions/like";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  jobId: string;
  userId?: string;
  initialLiked?: boolean;
}

export function LikeButton({ jobId, initialLiked = false }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const queryKey = ["like", jobId];

  // 좋아요 상태 조회 (마운트 시 서버에서 실제 값 fetch, 초기값은 initialLiked)
  const { data: liked = initialLiked } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await checkLiked(jobId);
      return result.liked;
    },
    placeholderData: initialLiked,
  });

  // 좋아요 토글 (Optimistic Update)
  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleLike(jobId),
    onMutate: async () => {
      // 진행 중인 refetch 취소 (race condition 방지)
      await queryClient.cancelQueries({ queryKey });
      // 현재 캐시 스냅샷 저장
      const previousLiked = queryClient.getQueryData<boolean>(queryKey);
      // 즉시 UI 반전
      queryClient.setQueryData(queryKey, !previousLiked);
      return { previousLiked };
    },
    onError: (_err, _vars, context) => {
      // 실패 시 롤백
      queryClient.setQueryData(queryKey, context?.previousLiked);
      toast.error("좋아요 처리에 실패했습니다.");
    },
    onSuccess: (result) => {
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.liked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.");
      }
    },
    onSettled: () => {
      // 서버 실제값으로 최종 동기화
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mutate();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={cn("hover:bg-background/80", liked && "text-red-500 hover:text-red-600")}
    >
      <Heart className={cn("h-5 w-5", liked && "fill-current")} />
    </Button>
  );
}
```

### Step 3: 타입 체크

```bash
npm run type:check
```

예상 출력: 에러 없음

### Step 4: 동작 검증 (개발 서버)

```bash
npm run dev
```

검증 항목:
- [ ] 비로그인 상태로 `/jobs` 접근 → `PublicHeader` 표시, Sidebar 없음
- [ ] 로그인 상태로 `/jobs` 접근 → `Sidebar` + `Header` 표시
- [ ] 좋아요 버튼 클릭 → 서버 응답 전에 하트 즉시 반전
- [ ] 좋아요 버튼 재클릭 → 즉시 원상복귀

### Step 5: 빌드 확인

```bash
npm run build
```

예상 출력: 에러 없음

### Step 6: 커밋

```bash
git add src/components/common/LikeButton.tsx
git commit -m "feat: LikeButton TanStack Query 기반 Optimistic Update 적용"
```

---

## 검증 체크리스트

- [ ] `npm run type:check` 통과
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] 비로그인 `/jobs` → PublicHeader 레이아웃
- [ ] 로그인 `/jobs` → Sidebar 레이아웃
- [ ] 좋아요 클릭 → 즉시 UI 반전 (네트워크 탭에서 요청 완료 전에 하트 변경 확인)
- [ ] 좋아요 실패 시 → 롤백 + toast 에러
