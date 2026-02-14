# Jobs 페이지 개선 설계

**날짜**: 2026-02-15
**브랜치**: feat/jobs-improvement

---

## 변경 범위

```
[DB 마이그레이션] → [타입/상수 수정] → [공고 등록 폼] → [필터/목록] → [사이드바/스켈레톤]
```

| # | 작업 | 커밋 단위 |
|---|------|-----------|
| 1 | DB 마이그레이션 | chore: job_postings 위치 컬럼 추가 및 region 제거 |
| 2 | 타입/상수 수정 | chore: EmploymentTypeCode freelance 추가 및 위치 타입 변경 |
| 3 | 사이드바 '공고 등록' 제거 | fix: 사이드바에서 공고 등록 메뉴 제거 |
| 4 | 스켈레톤 padding 수정 | fix: jobs 스켈레톤 padding 불일치 수정 |
| 5 | 공고 등록 폼 위치 시스템 교체 | feat: 공고 등록 폼 Naver Map 위치 시스템 적용 |
| 6 | 필터 & 목록 위치 시스템 교체 | feat: jobs 필터 및 목록 주소 기반 위치 시스템 적용 |

---

## 섹션 1: DB 마이그레이션

### job_postings 테이블
```sql
-- region 컬럼 제거
ALTER TABLE job_postings DROP COLUMN region;

-- 위치 컬럼 추가
ALTER TABLE job_postings ADD COLUMN address TEXT;
ALTER TABLE job_postings ADD COLUMN latitude FLOAT8;
ALTER TABLE job_postings ADD COLUMN longitude FLOAT8;

-- employment_type enum에 freelance 추가
ALTER TYPE employment_type ADD VALUE 'freelance';
```

---

## 섹션 2: 타입/상수 수정

- `types/index.ts`: `EmploymentTypeCode`에 `'freelance'` 추가
- `types/index.ts`: `JobFilter`에서 `region` → `location` 변경
- `constants/employment-types.ts`: `freelance: "프리랜서"` 항목 추가

---

## 섹션 3: 사이드바 / 스켈레톤

### 사이드바 '공고 등록' 제거
`Sidebar.tsx:74` — centerSection items에서 제거:
```diff
- { href: "/center/jobs/new", label: "공고 등록", icon: PlusCircle },
```

### 스켈레톤 padding 수정
`(public)/jobs/loading.tsx` 최상위 div:
```diff
- <div className="space-y-6">
+ <div className="container px-4 mx-auto py-8 space-y-6">
```

---

## 섹션 4: 위치 시스템 교체

### 공고 등록 폼 (`JobPostingForm.tsx`)
- region Select 제거
- `CenterLocationInput` 컴포넌트 (기존 센터 프로필과 동일) 재사용
- hidden input으로 address / latitude / longitude 전달

### 필터 (`JobFilter.tsx`)
- 지역 Select → 주소 텍스트 Input (address ilike 검색)
- URL 파라미터: `region` → `location`

### 목록 페이지 (`jobs/page.tsx`)
- region 필터 쿼리 → `address.ilike.%location%` 쿼리

### Server Action (`actions/job-posting.ts`)
- region 필드 제거
- address / latitude / longitude 처리 추가
