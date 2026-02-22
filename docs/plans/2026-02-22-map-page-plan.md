# 구인공고 지도 페이지 구현 플랜

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `/map` 페이지에서 구인공고를 네이버 지도 위 마커로 표시하고, 마커 클릭 시 해당 공고 목록을 패널로 확인할 수 있다.

**Architecture:** Server Component(`/map/page.tsx`)에서 필터 적용된 공고를 Supabase로 조회해 Client Component(`JobMapView`)에 전달. 지도 뷰포트 상태는 URL을 오염시키지 않도록 클라이언트 상태로만 관리. 기존 `JobFilter` 컴포넌트를 수정 없이 재사용.

**Tech Stack:** Next.js 15 Server Component, Naver Maps JS API v3 (전역 스크립트 이미 로드됨), shadcn/ui Sheet, Tailwind CSS 4

---

## 사전 확인 사항

- 네이버 지도 스크립트: `src/app/layout.tsx`에서 `strategy="beforeInteractive"`로 전역 로드됨 (`submodules=geocoder` 포함)
- 환경변수: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` `.env.local`에 설정됨
- 기존 데이터: 현재 5개 공고 모두 `latitude=null` → **테스트용 공고를 지도 등록 폼으로 새로 생성해야 함**
- 기존 `JobFilter`는 `usePathname()` 사용 → `/map`에서 수정 없이 재사용 가능

---

## Task 1: `/map/page.tsx` — Server Component 생성

**Files:**

- Create: `src/app/(app-public)/map/page.tsx`

**Step 1: 파일 생성**

```tsx
// src/app/(app-public)/map/page.tsx
import { createClient } from "@/lib/supabase/server";
import { JobFilter } from "@/components/jobs/JobFilter";
import { JobMapView } from "@/components/jobs/JobMapView";
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

export default async function MapPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("job_postings_with_details")
    .select("*")
    .eq("is_active", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("created_at", { ascending: false });

  if (params.location) query = query.ilike("address", `%${params.location}%`);
  if (params.categories) query = query.contains("categories", params.categories.split(","));
  if (params.gender && params.gender !== "any") query = query.in("gender", [params.gender, "any"]);
  if (params.employmentType) query = query.eq("employment_type", params.employmentType);
  if (params.experienceLevel) query = query.eq("experience_level", params.experienceLevel);
  if (params.search)
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);

  const { data: jobs } = await query;

  const currentFilter: JobFilterType = {
    location: params.location,
    categories: params.categories?.split(",") as JobCategoryCode[] | undefined,
    gender: params.gender as Gender | undefined,
    employmentType: params.employmentType as EmploymentTypeCode | undefined,
    experienceLevel: params.experienceLevel as ExperienceLevelCode | undefined,
    search: params.search,
  };

  return (
    <div className="-m-4 -mt-4 md:-m-6 h-[calc(100svh-3.5rem)] flex overflow-hidden">
      {/* 왼쪽 패널 (데스크톱) */}
      <div className="hidden lg:flex lg:w-[380px] lg:shrink-0 lg:flex-col lg:border-r lg:bg-background lg:overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">구인공고 지도</h1>
        </div>
        <div className="p-4 flex-1">
          <JobFilter currentFilter={currentFilter} />
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <JobMapView
          jobs={jobs ?? []}
          isAuthenticated={!!user}
          userId={user?.id}
          currentSearchParams={new URLSearchParams(
            Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
          ).toString()}
        />
      </div>
    </div>
  );
}
```

> **레이아웃 주의:** `(app-public)/layout.tsx`의 `main`이 `p-4 pt-16 md:p-6` 패딩을 가짐.
> `-m-4 -mt-4 md:-m-6`으로 상쇄. `pt-16` 값이 실제 렌더링에서 다르면 조정 필요.
> (Header 높이에 따라 `3.5rem` 값 조정)

**Step 2: 빌드로 타입 확인**

```bash
npm run build
```

`JobMapView` 아직 없으므로 오류 예상 → Task 2 진행

---

## Task 2: `JobMapView.tsx` — 지도 Client Component

**Files:**

- Create: `src/components/jobs/JobMapView.tsx`

**Step 1: 기본 구조 생성 (지도 초기화 + GPS)**

```tsx
// src/components/jobs/JobMapView.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, List, Locate } from "lucide-react";
import Link from "next/link";
import { JobFilter } from "@/components/jobs/JobFilter";
import { JobMapPanel } from "@/components/jobs/JobMapPanel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { JobFilter as JobFilterType } from "@/types";

// Naver Maps 전역 타입 (이미 로드됨)
declare const naver: typeof import("@types/navermaps");

const GANGNAM_STATION = { lat: 37.4979, lng: 127.0276 }; // 강남역

interface JobPostingForMap {
  id: string;
  title: string | null;
  center_name: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  employment_type: string | null;
  experience_level: string | null;
  salary_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  categories: string[] | null;
  is_active: boolean | null;
  center_id: string | null;
}

interface JobMapViewProps {
  jobs: JobPostingForMap[];
  isAuthenticated: boolean;
  userId?: string;
  currentSearchParams: string;
  currentFilter?: JobFilterType;
}

export function JobMapView({
  jobs,
  isAuthenticated,
  userId,
  currentSearchParams,
  currentFilter,
}: JobMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);

  const [selectedJobs, setSelectedJobs] = useState<JobPostingForMap[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current || !window.naver?.maps) return;

    const initMap = (lat: number, lng: number) => {
      if (mapRef.current) return;
      mapRef.current = new naver.maps.Map(mapContainerRef.current!, {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 12,
        logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
        mapDataControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
        scaleControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
      });
    };

    // GPS 시도 → 실패 시 강남역 fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => initMap(pos.coords.latitude, pos.coords.longitude),
        () => initMap(GANGNAM_STATION.lat, GANGNAM_STATION.lng),
        { timeout: 5000 }
      );
    } else {
      initMap(GANGNAM_STATION.lat, GANGNAM_STATION.lng);
    }
  }, []);

  // 마커 렌더링
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 좌표 기준 그룹핑 (소수점 4자리)
    const groups = new Map<string, JobPostingForMap[]>();
    jobs.forEach((job) => {
      const key = `${job.latitude.toFixed(4)},${job.longitude.toFixed(4)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(job);
    });

    groups.forEach((groupJobs, key) => {
      const [lat, lng] = key.split(",").map(Number);
      const count = groupJobs.length;

      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: mapRef.current!,
        icon: {
          content: `<div style="
            background: ${count > 1 ? "#2563eb" : "#3b82f6"};
            color: white;
            border-radius: 50%;
            width: ${count > 1 ? "36px" : "28px"};
            height: ${count > 1 ? "36px" : "28px"};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 600;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
          ">${count > 1 ? count : "●"}</div>`,
          anchor: new naver.maps.Point(count > 1 ? 18 : 14, count > 1 ? 18 : 14),
        },
      });

      naver.maps.Event.addListener(marker, "click", () => {
        setSelectedJobs(groupJobs);
        setIsPanelOpen(true);
      });

      markersRef.current.push(marker);
    });
  }, [jobs, mapRef.current]);

  // 현재 위치로 이동
  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current!.setCenter(new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        mapRef.current!.setZoom(14);
      },
      () => {}
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* 지도 캔버스 */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 모바일 상단 플로팅 바 */}
      <div className="absolute top-3 left-3 right-3 flex gap-2 lg:hidden z-10">
        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm" className="shadow-md">
              <Filter className="h-4 w-4 mr-1" />
              필터
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {currentFilter && <JobFilter currentFilter={currentFilter} />}
            </div>
          </SheetContent>
        </Sheet>

        <Button variant="secondary" size="sm" className="shadow-md" asChild>
          <Link href={`/jobs${currentSearchParams ? `?${currentSearchParams}` : ""}`}>
            <List className="h-4 w-4 mr-1" />
            목록
          </Link>
        </Button>

        <div className="flex-1 flex items-center justify-end">
          <span className="bg-background/90 text-xs px-2 py-1 rounded-full shadow-md">
            {jobs.length}개 공고
          </span>
        </div>
      </div>

      {/* 현재 위치 버튼 (우하단) */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-6 right-4 shadow-md z-10"
        onClick={handleLocate}
      >
        <Locate className="h-4 w-4" />
      </Button>

      {/* 데스크톱: 목록으로 버튼 */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-3 right-3 shadow-md z-10 hidden lg:flex"
        asChild
      >
        <Link href={`/jobs${currentSearchParams ? `?${currentSearchParams}` : ""}`}>
          <List className="h-4 w-4 mr-1" />
          목록으로 보기
        </Link>
      </Button>

      {/* 공고 패널 */}
      <JobMapPanel
        jobs={selectedJobs}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        isAuthenticated={isAuthenticated}
        userId={userId}
      />
    </div>
  );
}
```

**Step 2: 빌드 확인**

```bash
npm run build
```

`JobMapPanel` 없으므로 오류 예상 → Task 3 진행

---

## Task 3: `JobMapPanel.tsx` — 마커 클릭 패널

**Files:**

- Create: `src/components/jobs/JobMapPanel.tsx`

**Step 1: 파일 생성**

```tsx
// src/components/jobs/JobMapPanel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { JobCard } from "@/components/jobs/JobCard";
import { MapPin, X } from "lucide-react";

interface JobForPanel {
  id: string;
  title: string | null;
  center_name: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  employment_type: string | null;
  experience_level: string | null;
  salary_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  categories: string[] | null;
  is_active: boolean | null;
  center_id: string | null;
}

interface JobMapPanelProps {
  jobs: JobForPanel[];
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userId?: string;
}

function PanelContent({
  jobs,
  onClose,
  isAuthenticated,
  userId,
}: Omit<JobMapPanelProps, "isOpen">) {
  if (jobs.length === 0) return null;

  const centerName = jobs[0].center_name ?? "센터";
  const address = jobs[0].address ?? "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold text-base">{centerName}</h2>
          {address && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{address}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">공고 {jobs.length}건</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isAuthenticated={isAuthenticated} userId={userId} />
        ))}
      </div>
    </div>
  );
}

export function JobMapPanel({ jobs, isOpen, onClose, isAuthenticated, userId }: JobMapPanelProps) {
  return (
    <>
      {/* 모바일: 바텀시트 */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent side="bottom" className="h-[70vh] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>공고 목록</SheetTitle>
            </SheetHeader>
            <PanelContent
              jobs={jobs}
              onClose={onClose}
              isAuthenticated={isAuthenticated}
              userId={userId}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* 데스크톱: 사이드 패널 (지도 위 absolute) */}
      {isOpen && (
        <div className="hidden lg:flex absolute top-0 left-0 w-[380px] h-full flex-col bg-background border-r shadow-lg z-20">
          <PanelContent
            jobs={jobs}
            onClose={onClose}
            isAuthenticated={isAuthenticated}
            userId={userId}
          />
        </div>
      )}
    </>
  );
}
```

**Step 2: 빌드 + 타입 확인**

```bash
npm run build
```

`JobCard`의 `job` prop 타입과 일치하는지 확인. 타입 오류 시 `JobForPanel`을 `job_postings_with_details` Row 타입으로 교체.

---

## Task 4: `@types/navermaps` 타입 확인

**Step 1: 네이버 지도 타입 패키지 확인**

```bash
cat package.json | grep naver
```

없으면 설치:

```bash
npm install -D @types/navermaps
```

**Step 2: `tsconfig.json`에 타입 추가 확인**

```json
{
  "compilerOptions": {
    "types": ["navermaps"]
  }
}
```

없으면 추가. 이미 있으면 스킵.

**Step 3: 빌드 재확인**

```bash
npm run build
```

---

## Task 5: `/jobs/page.tsx` — "지도로 보기" 버튼 추가

**Files:**

- Modify: `src/app/(app-public)/jobs/page.tsx`

**Step 1: import 추가 + 버튼 삽입**

기존 `h1` 블록을 아래로 교체:

```tsx
// 상단에 추가
import Link from "next/link";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

// JSX에서 교체
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">구인공고</h1>
    <p className="text-sm text-muted-foreground mt-1">원하는 조건의 구인공고를 찾아보세요</p>
  </div>
  <Button variant="outline" size="sm" asChild>
    <Link
      href={`/map${
        Object.keys(params).length > 0
          ? `?${new URLSearchParams(
              Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
            ).toString()}`
          : ""
      }`}
    >
      <Map className="h-4 w-4 mr-2" />
      지도로 보기
    </Link>
  </Button>
</div>;
```

**Step 2: 빌드 + 린트**

```bash
npm run build && npm run lint
```

---

## Task 6: 테스트 데이터 생성

현재 DB의 공고 5개는 모두 `latitude=null`. 지도 테스트를 위해 실제 공고를 새로 등록해야 함.

**Step 1: 개발 서버 실행**

```bash
npm run dev
```

**Step 2: 센터 계정으로 로그인 후 공고 등록**

`http://localhost:3000/center/jobs/new` 접속 →
주소 입력 → 조회 버튼 클릭 → 좌표 확인 → 등록

최소 2~3개 공고를 **다른 주소**로 등록.

**Step 3: `/map` 페이지 접속 후 확인**

```
http://localhost:3000/map
```

체크리스트:

- [ ] 지도 정상 렌더링
- [ ] 마커 표시 (공고 수만큼)
- [ ] 마커 클릭 → 패널 열림
- [ ] 패널에 센터명, 주소, 공고 카드 표시
- [ ] 모바일 뷰: 바텀시트 동작
- [ ] "목록으로 보기" 버튼 → `/jobs` 이동 (params 유지)
- [ ] `/jobs`의 "지도로 보기" 버튼 → `/map` 이동 (params 유지)
- [ ] GPS 허용 시 현재 위치로 지도 중심 이동
- [ ] GPS 거부 시 서울 중심으로 fallback
- [ ] 필터 적용 시 마커 갱신

---

## Task 7: 최종 빌드 & 린트 검증

```bash
npm run build
npm run lint
```

모든 오류 해결 후 커밋.

```bash
git add src/app/(app-public)/map/page.tsx \
        src/components/jobs/JobMapView.tsx \
        src/components/jobs/JobMapPanel.tsx \
        src/app/(app-public)/jobs/page.tsx
git commit -m "feat: 구인공고 지도 페이지(/map) 추가"
```

---

## 알려진 제약 사항

| 항목               | 내용                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| 클러스터링         | naver.maps.MarkerClustering 미사용 → 동일 좌표 그룹은 숫자 마커로 대체 |
| 좌표 없는 공고     | 서버 쿼리에서 제외 (지도에 미표시)                                     |
| `pt-16` 레이아웃   | 실제 Header 높이에 따라 `h-[calc(100svh-3.5rem)]` 값 조정 필요         |
| `@types/navermaps` | 미설치 시 타입 오류 발생 → Task 4에서 처리                             |
