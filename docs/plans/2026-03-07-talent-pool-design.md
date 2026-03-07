# 센터 신규 기능: 인재풀

## 개요

센터가 트레이너를 조회하고, 영입 제안/평점 남기기 등의 액션을 수행할 수 있는 인재풀 기능.

---

## 1. 데이터베이스 설계

### recruitment_offers (영입 제안)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) | |
| center_id | uuid (FK -> centers) | 제안하는 센터 |
| trainer_id | uuid (FK -> profiles) | 제안받는 트레이너 |
| job_posting_id | uuid (FK -> job_postings) | 연결된 공고 |
| message | text | 추가 메시지 |
| status | text | pending / accepted / rejected |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### trainer_reviews (평점/리뷰)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) | |
| center_id | uuid (FK -> centers) | 리뷰 작성 센터 |
| trainer_id | uuid (FK -> profiles) | 대상 트레이너 |
| rating | numeric(2,1) | 1.0~5.0, CHECK 제약조건 |
| content | text | 리뷰 내용 |
| created_at | timestamptz | |

### trainer_likes (트레이너 좋아요 - TODO)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) | |
| center_id | uuid (FK -> centers) | |
| trainer_id | uuid (FK -> profiles) | |
| created_at | timestamptz | |

---

## 2. 페이지 구조 및 라우팅

### 센터 측

| 경로 | 설명 |
|---|---|
| /center/talent-pool | 인재풀 목록 (필터 + 검색 + 테이블) |

### 트레이너 측

| 경로 | 설명 |
|---|---|
| /offers | 받은 영입 제안 목록 페이지 |

### 네비게이션

- 센터 관리 하위 메뉴에 "인재풀" 항목 추가
- 트레이너 사이드바/네비에 "받은 제안" 항목 추가

### 인재풀 목록 페이지 UI 흐름

1. 트레이너 테이블 (이름, 지역, 카테고리, 경력, 평균 평점)
2. 행 클릭 -> Select Box 팝업
   - 영입 제안 -> 공고 선택 + 메시지 입력 다이얼로그
   - 좋아요 (TODO)
   - 평점 남기기 -> 평점/리뷰 입력 다이얼로그 (제한 없음)

---

## 3. Server Actions 및 데이터 흐름

### src/actions/talent-pool.ts

- getTrainers(filter) - 트레이너 목록 조회 (프로필 + 이력서 + 평균 평점)
- getTrainerDetail(trainerId) - 트레이너 상세 (이력서 정보 + 리뷰 목록)

### src/actions/recruitment-offer.ts

- createOffer({ trainerId, jobPostingId, message }) - 영입 제안 생성
- getReceivedOffers() - 트레이너: 받은 제안 목록
- updateOfferStatus(offerId, status) - 트레이너: 제안 수락/거절
- getSentOffers() - 센터: 보낸 제안 목록 (필요시)

### src/actions/trainer-review.ts

- createReview({ trainerId, rating, content }) - 리뷰 작성 (제한 없음)
- getTrainerReviews(trainerId) - 특정 트레이너 리뷰 목록

### 데이터 흐름

- 인재풀 목록: Server Component에서 getTrainers() 호출 -> 테이블 렌더링
- Select Box 액션들: Client Component에서 Server Action 호출
- 평점 남기기: 제한 없음, 인재풀에서 아무 트레이너에게나 가능

---

## 4. 컴포넌트 구조

### src/components/talent-pool/

| 컴포넌트 | 타입 | 설명 |
|---|---|---|
| TrainerTable.tsx | Client | 트레이너 목록 테이블 + 행 클릭 Select Box |
| TrainerFilter.tsx | Client | 필터 + 검색 (기존 JobFilter 패턴 재활용) |
| TrainerActionSelect.tsx | Client | Select Box (영입 제안 / 좋아요 / 평점) |
| RecruitmentOfferDialog.tsx | Client | 공고 선택 + 메시지 입력 다이얼로그 |
| TrainerReviewDialog.tsx | Client | 평점 + 리뷰 입력 다이얼로그 |

### src/components/offers/

| 컴포넌트 | 타입 | 설명 |
|---|---|---|
| ReceivedOfferList.tsx | Client | 받은 제안 목록 + 수락/거절 |
| OfferCard.tsx | Server | 개별 제안 카드 (공고 정보 + 센터 정보 + 메시지) |

### 기존 컴포넌트 수정

- 네비게이션: 센터 관리 하위에 "인재풀", 트레이너에 "받은 제안" 메뉴 추가

---

## 결정 사항 요약

- 인재풀 목록: 이력서 + 프로필 혼합 (이력서 우선, 없으면 프로필 기본 정보)
- 영입 제안: 공고 선택 + 메시지 전달 방식
- 받은 제안: 별도 /offers 페이지
- 평점: numeric(2,1), 1.0~5.0, 제한 없음 (아무 트레이너에게나 가능)
- 필터: 기존 JobFilter 재활용 + 텍스트 검색
- 평점 표시: 목록에 평균 평점 + 상세에서 리뷰 목록
