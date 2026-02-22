# Jobs 페이지 Sidebar 조건부 표시 & 좋아요 Optimistic Update 설계

**날짜**: 2026-02-20
**브랜치**: feat/jobs-sidebar-optimistic-like

---

## 변경 범위

```
[라우팅 구조 재설계] → [TanStack Query 설정] → [LikeButton Optimistic Update]
```

| # | 작업 | 커밋 단위 |
|---|------|-----------|
| 1 | `(app-public)` route group 생성 및 `/jobs` 이동 | feat: jobs 페이지 (app-public) 그룹으로 이동 및 조건부 Sidebar 적용 |
| 2 | TanStack Query 설치 및 QueryProvider 설정 | feat: TanStack Query 설치 및 QueryProvider 루트 레이아웃 적용 |
| 3 | LikeButton Optimistic Update 적용 | feat: LikeButton TanStack Query 기반 Optimistic Update 적용 |

---

## 섹션 1: 라우팅 구조 재설계

### 변경 전/후 구조

**변경 전**
```
src/app/
  (public)/
    layout.tsx        ← PublicHeader만 표시
    jobs/
      page.tsx        ← 공고 목록 (비인증 접근 가능)
      loading.tsx
    page.tsx
  (app)/
    layout.tsx        ← Sidebar + Header, 미인증 시 /login 리다이렉트
    jobs/
      [id]/page.tsx   ← 공고 상세
    dashboard/, resumes/, ...
```

**변경 후**
```
src/app/
  (public)/
    layout.tsx        ← 그대로 유지
    page.tsx          ← 홈 페이지만 남음
  (app-public)/       ← 신규
    layout.tsx        ← 선택적 인증: 로그인 시 Sidebar+Header, 비로그인 시 PublicHeader
    jobs/
      page.tsx        ← (public)/jobs/page.tsx 이동 (내용 무변경)
      loading.tsx     ← (public)/jobs/loading.tsx 이동 (내용 무변경)
  (app)/
    layout.tsx        ← 그대로 유지 (auth 강제)
    jobs/
      [id]/page.tsx   ← 그대로 유지
    dashboard/, resumes/, ...
```

### `(app-public)/layout.tsx` 구현

```tsx
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default async function AppPublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 비로그인: PublicHeader 레이아웃
  if (!user) {
    const supabaseAnon = await createClient();
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

### 영향 범위
- `(app)/layout.tsx` — **무변경**
- `(public)/layout.tsx` — **무변경**
- `(public)/jobs/` 폴더 — 삭제 (파일 이동)

---

## 섹션 2: TanStack Query 설정

### 설치

```bash
npm install @tanstack/react-query
```

### `src/components/providers/QueryProvider.tsx` (신규)

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
            staleTime: 30_000,        // 30초: 좋아요 상태는 자주 바뀌지 않음
            gcTime: 5 * 60 * 1000,   // 5분: 페이지 이동 후 재진입 시 캐시 재사용
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### `src/app/layout.tsx` 변경

```tsx
// QueryProvider로 children 감싸기
import { QueryProvider } from "@/components/providers/QueryProvider";

// <body> 내부:
<QueryProvider>
  {children}
</QueryProvider>
```

### 영향 범위
- `src/app/layout.tsx` — QueryProvider 1줄 추가
- `src/components/providers/QueryProvider.tsx` — 신규 생성

---

## 섹션 3: LikeButton Optimistic Update

### 현재 흐름 (문제)

```
클릭 → useTransition → 서버 응답 대기 (~300ms) → UI 업데이트
마운트 → useEffect → checkLiked 서버 액션 (job 카드 N개 × N번 병렬 호출)
```

### 개선 흐름

```
마운트 → useQuery(['like', jobId]) → 캐시 있으면 즉시 사용
클릭  → onMutate → UI 즉시 반전 → 서버 요청 → 실패 시 onError 롤백
```

### `LikeButton.tsx` 리팩터링

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

  // 좋아요 상태 조회
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
      await queryClient.cancelQueries({ queryKey });
      const previousLiked = queryClient.getQueryData<boolean>(queryKey);
      queryClient.setQueryData(queryKey, !previousLiked);
      return { previousLiked };
    },
    onError: (_err, _vars, context) => {
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

### 변경 없는 것
- `src/actions/like.ts` — `toggleLike`, `checkLiked`, `revalidatePath` 모두 그대로
- `JobCard.tsx` — props 변경 없음 (`initialLiked={false}` 유지)

---

## 구현 순서 요약

```
1. npm install @tanstack/react-query
2. QueryProvider 생성 → layout.tsx 적용
3. (app-public) route group 생성 → jobs 이동
4. LikeButton 리팩터링
```
