# 구인공고 지도 페이지 설계 문서

**작성일:** 2026-02-22
**기능:** `/map` - 구인공고 위치 기반 지도 페이지

---

## 개요

피트니스 트레이너가 공고의 센터 위치를 지도로 시각적으로 확인할 수 있는 페이지.
기존 `/jobs` 목록 페이지와 별도 페이지로 구성되며, 필터 상태를 URL params로 공유한다.

---

## 기술 결정

| 항목 | 결정 | 이유 |
|---|---|---|
| 지도 서비스 | 네이버 지도 | 프로젝트에 이미 통합됨 (`NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 설정 완료) |
| 데이터 fetching | Server Component + URL params | 필터 공유 가능, SEO 친화적 |
| 뷰포트 필터링 | 클라이언트 상태 | 지도 드래그 시 URL 오염 방지 |
| GPS fallback | 서울 시청 (37.5665, 126.9780) | 권한 거부 시 기본 위치 |
| 클러스터링 | naver.maps.MarkerClustering | 동일 위치 공고 그룹핑 |

---

## 기존 인프라 (이미 구현됨)

- `CenterLocationInput` 컴포넌트: 주소 → 네이버 지오코딩 → lat/lng 저장
- `JobPostingForm`: 공고 등록 시 `address`, `latitude`, `longitude` 자동 저장
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`, `NEXT_PUBLIC_NAVER_MAP_CLIENT_SECRET` 환경변수 설정됨
- `JobFilter` 컴포넌트: `usePathname()` 기반이라 `/map`에서도 수정 없이 재사용 가능

> **주의:** 기존 테스트 데이터(5개 공고)는 lat/lng가 null. 새로 등록하는 공고부터 좌표 저장됨.

---

## URL 구조

```
/jobs                           기존 목록 페이지
/map                            새 지도 페이지
/map?categories=pt&employmentType=full_time   필터 적용
```

페이지 전환 시 URL params 유지:
- `/jobs` → 지도로 보기 버튼 → `/map?[현재 params]`
- `/map` → 목록으로 보기 버튼 → `/jobs?[현재 params]`

---

## 데이터 흐름

```
URL searchParams (필터)
  → /map/page.tsx (Server Component)
  → Supabase: job_postings_with_details
      WHERE is_active = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        + 기존 필터 조건 (categories, employmentType 등)
  → jobs[] props → JobMapView (Client Component)
  → 마커 렌더링 (클러스터링 포함)
```

---

## 페이지 레이아웃 (네이버 지도 UX 기반)

### 데스크톱 (≥ 1024px)

```
┌────────────────────────────────────────────────────┐
│ ┌──────────────────────┐                           │
│ │ [목록으로 보기 ←]    │                           │
│ │ ──────────────────── │                           │
│ │  [상태에 따라 교체]  │    지도 (나머지 전체)      │
│ │                      │                           │
│ │  기본: JobFilter 폼  │                           │
│ │                      │                           │
│ │  마커 클릭 시:        │                           │
│ │  ← 뒤로              │                           │
│ │  센터명 / 주소        │                           │
│ │  공고 목록 (스크롤)   │                           │
│ └──────────────────────┘                           │
│   w-[380px] fixed left    지도 우하단: [📍 현위치]  │
└────────────────────────────────────────────────────┘
```

### 모바일

```
┌─────────────────────────┐
│  [🔍 필터] [← 목록]     │  ← 상단 플로팅 바
│                         │
│      지도 전체화면       │
│                         │
│                [📍]     │  ← GPS 버튼
├─────────────────────────┤  ← 바텀시트 (peek)
│  총 N개 공고 ───────    │
│  마커 클릭 시 확장 →    │
│  센터명 + 공고 목록      │
└─────────────────────────┘
```

### 왼쪽 패널 상태 전환

```
기본 상태          마커 클릭            뒤로가기
┌──────────┐  →  ┌──────────┐  →  ┌──────────┐
│ 필터 폼  │     │ ← 뒤로   │     │ 필터 폼  │
│ 직종     │     │ 센터명   │     │ 직종     │
│ 고용형태 │     │ 주소     │     │ 고용형태 │
│ 경력     │     │ 공고 1   │     │ 경력     │
│ [검색]   │     │ 공고 2   │     │ [검색]   │
└──────────┘     └──────────┘     └──────────┘
```

---

## 신규 파일

| 파일 | 역할 |
|---|---|
| `src/app/(app-public)/map/page.tsx` | Server Component, 데이터 조회 |
| `src/components/jobs/JobMapView.tsx` | Client Component, 지도 렌더링 |
| `src/components/jobs/JobMapPanel.tsx` | 마커 클릭 시 공고 패널 |

## 수정 파일

| 파일 | 변경 내용 |
|---|---|
| `src/app/(app-public)/jobs/page.tsx` | "지도로 보기" 버튼 추가 |

---

## 에러 처리

| 상황 | 처리 |
|---|---|
| GPS 권한 거부 | 서울 시청(37.5665, 126.9780)으로 fallback |
| 좌표 없는 공고 | 서버 쿼리에서 제외, 안내 메시지 표시 |
| 필터 결과 0개 | 마커 없는 지도 표시 + 필터 초기화 버튼 |
| 지도 스크립트 로딩 실패 | Skeleton → 오류 안내 + 목록으로 이동 링크 |

---

## 마커 클러스터링

```
동일 위치(lat/lng 소수점 4자리 기준) 그룹핑
→ 1개:    파란 핀 마커
→ 2~9개:  원형 클러스터 + 숫자
→ 10개+:  진한 색 원형 클러스터 + 숫자
라이브러리: naver.maps.MarkerClustering
```
