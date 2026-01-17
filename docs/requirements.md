# 제품 요구사항 문서(PRD): 정부 지원금 및 정책 자금 맞춤형 캘린더 'PolicyFlow KR' 구축 전략

## 1. 서론 및 프로젝트 개요

### 1.1 프로젝트 배경 및 필요성

대한민국 정부와 각 지방자치단체는 매년 수천 건의 청년 정책, 소상공인 지원금, 창업 지원 자금 등을 쏟아내고 있다. 그러나 이러한 정보는 '온라인 청년센터', '소상공인시장진흥공단', '기업마당', 각 시도 홈페이지 등에 파편화되어 존재한다. 정보의 비대칭성으로 인해 정작 지원이 절실한 대상자가 신청 기한을 놓치거나 자신에게 해당되는 정책인지조차 인지하지 못하는 경우가 빈번하게 발생하고 있다.

기존의 정보 제공 서비스들은 단순한 게시판 형태의 나열식 구조를 띠고 있어, 사용자가 능동적으로 정보를 해석하고 자신의 일정에 맞춰 관리해야 하는 인지적 부하(Cognitive Load)가 매우 높다. 특히, 지원금 신청은 '기간'이 가장 중요한 변수임에도 불구하고, 이를 시각적인 달력 형태로 개인화하여 보여주는 무료 서비스는 부재하거나, 유료 구독 모델로 제공되는 경우가 많다.

본 프로젝트는 이러한 문제를 해결하기 위해 '정부 지원금 및 정책 자금 맞춤형 캘린더(가칭 PolicyFlow KR)' 서비스를 기획한다. 핵심적인 기술적 제약 사항이자 전략적 목표는 **Cloudflare Developer Platform(Workers, Pages, D1)**을 활용하여 초기 구축 및 운영 비용을 '0원(Zero Cost)'으로 유지하는 것이다. 이는 단순한 비용 절감을 넘어, 트래픽 폭주 시에도 유연하게 대응할 수 있는 서버리스 아키텍처의 이점을 극대화하기 위함이다.

### 1.2 제품의 목적 및 가치 제안

본 서비스의 궁극적인 목적은 **"모든 국민이 자신에게 할당된 정책 자금을 단 1원도 놓치지 않도록 돕는 것"**이다.

#### 사용자 가치

- **정보의 시각화**: 텍스트 위주의 공고문을 캘린더(Gantt Chart 및 Monthly View) 형태로 변환하여 신청 기간을 직관적으로 인지시킨다.
- **초개인화 필터링**: 나이, 거주지, 취업 상태, 업종(소상공인) 등 복합적인 조건을 통해 90% 이상의 불필요한 정보를 제거(Noise Filtering)한다.
- **능동적 알림**: 사용자가 매번 사이트에 방문하지 않아도, 마감 3일 전/1일 전에 푸시 알림(Web Push)을 통해 신청을 독려한다.
- **커뮤니티 참여**: 정책별 게시판을 통해 신청 경험, 꿀팁, 질문을 공유하며 집단지성으로 정보의 가치를 높인다.

#### 기술적/운영적 가치

- **유지보수의 자동화**: '크론 트리거(Cron Triggers)'를 활용한 자동 데이터 동기화 시스템을 구축하여, 운영자의 수동 개입을 최소화한다.
- **무한한 확장성**: Cloudflare의 글로벌 엣지 네트워크를 활용하여 별도의 로드 밸런서나 오토 스케일링 설정 없이 트래픽 급증을 처리한다.

### 1.3 문서의 범위

본 PRD는 서비스의 MVP(Minimum Viable Product) 구축을 위한 구체적인 실행 계획을 담고 있다. 데이터 수집을 위한 오픈 API 분석, Cloudflare 무료 티어 한계 극복을 위한 아키텍처 설계, 데이터베이스 스키마, 그리고 프론트엔드 UX 설계를 포괄하며, 개발자가 즉시 코딩에 착수할 수 있는 수준의 '상세 기술 명세'를 제공하는 것을 목표로 한다.

---

## 2. 타겟 사용자 분석 및 페르소나

서비스의 성공은 명확한 타겟 설정에서 시작된다. 본 서비스는 크게 '취업 준비 및 주거 안정이 필요한 청년'과 '자금 융통 및 경영 지원이 필요한 소상공인' 두 그룹을 핵심 타겟으로 한다.

### 2.1 주요 페르소나 A: 취업 준비생 김민수 (26세, 서울 거주)

- **배경**: 대학 졸업 후 1년째 구직 활동 중이다. 월세 부담과 자격증 응시료 등으로 경제적 압박을 느끼고 있다.
- **행동 패턴**: '스펙업', '독취사' 등 카페에서 정보를 얻지만, 정보가 너무 많아 정리가 안 된다. 스마트폰 사용이 익숙하며 캘린더 앱을 끼고 산다.
- **Pain Point**:
  - "면접 수당을 준다는 건 알았는데, 신청 기간이 어제까지였어."
  - "내가 사는 '구'에서만 주는 지원금이 있다던데 찾기가 너무 힘들어."
- **Needs**: 내 나이(26세)와 거주지(서울 관악구)만 입력하면, 이번 달에 신청 가능한 월세 지원금과 구직 활동 지원금을 달력에 딱 박아줬으면 좋겠다.

### 2.2 주요 페르소나 B: 카페 사장 이영희 (45세, 부산 거주)

- **배경**: 5년 차 개인 카페를 운영 중이다. 최근 키오스크 도입을 고민 중이나 비용이 부담된다. 대출 금리가 올라 저금리 정책 자금을 찾고 있다.
- **행동 패턴**: 가게 운영으로 바빠 PC 앞에 앉을 시간이 없다. 정보 검색 능력이 20대보다 다소 떨어진다.
- **Pain Point**:
  - "소상공인 정책 자금이 떴다는데 들어가 보면 복잡한 공문서만 있고 도대체 자격이 되는지 모르겠다."
  - "신청하려고 보니 예산 소진으로 마감되었다고 한다."
- **Needs**: '소상공인', '부산', '시설 개선' 키워드만 설정해두면, 공고가 뜨자마자 알림을 받고 싶다.

---

## 3. 데이터 소스 상세 분석 (Development-Ready Intelligence)

본 서비스의 핵심 엔진은 공공 데이터 포털과 각 기관의 오픈 API를 통해 데이터를 자동으로 수집(Ingestion)하는 부분이다. Cloudflare Workers의 무료 티어 제한(CPU 시간 10ms/request)을 고려할 때, 효율적인 데이터 파싱과 API 선정은 프로젝트의 성패를 가른다. 조사 결과, 가장 신뢰도 높고 개발 즉시 투입 가능한 API는 다음과 같다.

### 3.1 핵심 데이터 소스 1: 온라인 청년센터 (청년정책 정보)

고용노동부 산하 한국고용정보원에서 운영하는 '온라인 청년센터'는 가장 정제된 청년 정책 데이터를 제공한다. 이는 본 서비스의 '청년' 카테고리 데이터를 채울 핵심 소스이다.

- **API 명**: 청년정책 정보 조회 (Youth Policy List)
- **제공 형태**: REST API (JSON/XML 지원)
- **엔드포인트**: `https://www.youthcenter.go.kr/opi/youthPlcyList.do`
- **인증 방식**: `openApiVlak` 파라미터에 발급받은 인증키 삽입. (youthcenter.go.kr 마이페이지에서 신청 후 즉시 발급 가능)

#### 3.1.1 요청 파라미터 상세 분석

데이터를 효율적으로 긁어오기(Scraping) 위해서는 페이지네이션 전략이 필수적이다.

| 파라미터명 | 타입 | 필수 | 설명 및 권장 설정값 |
|-----------|------|------|-------------------|
| `openApiVlak` | String | Y | 발급받은 20자리 인증키. |
| `display` | Number | Y | 페이지당 출력 건수. **전략**: 요청 횟수를 줄이기 위해 최대 허용치인 100으로 설정. |
| `pageIndex` | Number | Y | 조회할 페이지 번호. Workers Cron에서 상태를 관리하며 순차 증가시켜야 함. |
| `srchPolyBizSecd` | String | N | 지역 코드 (예: 003002001은 서울). **전략**: 전체 데이터를 수집하여 DB에서 필터링할 것이므로 공란(전체 조회)으로 둠. |
| `bizTycdSel` | String | N | 정책 유형 (예: 주거, 금융). 역시 공란으로 두고 전체 수집. |

#### 3.1.2 응답 데이터 구조 및 매핑 전략

API 응답 필드는 축약된 코드로 오기 때문에, 이를 내부 데이터베이스의 직관적인 컬럼으로 매핑하는 과정이 필요하다.

| JSON Key | 데이터 예시 | 내부 DB 컬럼 (Target) | 처리 로직 및 주의사항 |
|----------|------------|---------------------|---------------------|
| `bizId` | R2023011234 | `policy_id` (PK) | 고유 식별자. 중복 제거(Upsert)의 키로 사용. |
| `polyBizSjnm` | 청년 월세 지원 | `title` | 정책명. |
| `polyItcnCn` | 월 20만원 지원... | `summary` | 요약 내용. |
| `sporCn` | `<html>...` | `content_html` | **주의**: HTML 태그가 포함되어 옴. D1 용량 절약을 위해 striptags 라이브러리로 텍스트만 추출하거나, 압축 저장 필요. |
| `bizPrdCn` | 2024.1.1~12.31 | `period_text` | 사업 운영 기간 텍스트. |
| `rqutPrdCn` | 2024.02.01~ | `apply_period_text` | **핵심**: 신청 기간. 정규식 파싱을 통해 `start_date`, `end_date` (Unix Timestamp)로 변환 필수. |
| `ageInfo` | 만 19세~34세 | `age_criteria` | 정규식으로 `min_age`, `max_age` 정수 추출. |
| `rqutUrla` | https://... | `apply_url` | 신청 페이지 링크. |

### 3.2 핵심 데이터 소스 2: 공공데이터포털 (소상공인/중소기업 정책)

소상공인 데이터는 청년센터처럼 단일화된 고품질 API가 부족하다. '소상공인시장진흥공단'의 데이터를 활용하되, 데이터 구조가 파편화되어 있어 보완 전략이 필요하다.

- **API 명**: 소상공인시장진흥공단_상가(상권)정보 API (참고용) 및 중소벤처기업부_지원사업조회 API

#### 전략적 접근

- data.go.kr의 API들은 호출 트래픽 제한이 엄격하고 데이터 갱신 주기가 느린 경우가 많다.
- 따라서 '중소벤처기업부'에서 제공하는 **기업마당(Bizinfo)**의 오픈 API 또는 RSS 피드를 보조적으로 활용하는 것이 유리하다.
- 만약 API 품질이 낮다면, 주기적으로 업데이트되는 CSV 파일을 Workers가 파싱(Parsing)하는 방식을 고려해야 한다. CSV 파일은 D1에 넣기 전 전처리가 용이하다.

### 3.3 데이터 정규화 및 파싱 챌린지 (Technical Challenge)

가장 큰 기술적 난관은 **'날짜 파싱'**이다. `rqutPrdCn` 필드는 "2024.01.01 ~ 2024.01.15"처럼 명확할 수도 있지만, "예산 소진 시까지", "매월 1일", "공고일로부터 2주"와 같이 비정형 텍스트로 오는 경우가 약 30%에 달한다.

#### 해결 전략

1. **Strict Parsing**: `YYYY-MM-DD` 또는 `YYYY.MM.DD` 패턴이 명확한 경우 타임스탬프로 변환하여 캘린더에 매핑.
2. **Fuzzy Parsing**: "상시", "예산 소진" 등의 키워드가 감지되면 `is_always_open` 플래그를 `true`로 설정하고, 캘린더에는 해당 월 전체에 걸친 이벤트로 표시하되 색상을 연하게 처리.
3. **LLM 활용 (Optional)**: 무료 티어 한계 내에서 가능하다면, Workers AI (Llama 3 등)를 사용하여 비정형 날짜 텍스트를 JSON으로 구조화하는 실험적인 시도를 할 수 있다. (단, 속도 이슈 고려 필요)

---

## 4. 시스템 아키텍처 및 무비용 인프라 설계

### 4.1 아키텍처 개요 (Cloudflare-Native Stack)

본 서비스는 전통적인 3-Tier 아키텍처(Web Server - WAS - DB)를 벗어나, Cloudflare의 엣지 네트워크 위에서 동작하는 서버리스 구조를 채택한다. 이는 트래픽이 없을 때는 비용이 0이며, 트래픽이 폭주해도 서버가 다운되지 않는 탄력성을 제공한다.

| 계층 (Layer) | 기술 스택 | 선정 이유 및 무료 티어 제약 극복 전략 |
|-------------|----------|-------------------------------------|
| Frontend | Cloudflare Pages | Next.js의 정적 내보내기(Static Export) 기능을 활용. HTML/CSS/JS 파일을 엣지에 배포하므로 대역폭 무제한. |
| Backend | Cloudflare Workers | API 로직 처리. 일일 10만 건 요청 무료. 캐싱(Cache API)을 적극 활용하여 DB 조회 횟수를 줄임. |
| Database | Cloudflare D1 | SQLite 기반의 엣지 DB. 500MB 스토리지 무료. 텍스트 위주 데이터이므로 약 5~10만 건의 정책 저장 가능. |
| Scheduler | Cron Triggers | 주기적 데이터 수집. Workers 무료 티어에 포함됨. |
| Notification | Firebase (FCM) | 웹 푸시 발송. 구글의 인프라를 사용하여 발송 비용 무료. |

### 4.2 데이터베이스 스키마 설계 (Cloudflare D1)

D1은 관계형 데이터베이스이므로 정규화된 설계가 중요하다. 그러나 과도한 JOIN은 읽기 비용(Read Operation)을 증가시키므로, JSON 컬럼을 활용한 반정규화 전략을 혼합한다.

#### 4.2.1 policies 테이블 (핵심 데이터)

가장 조회가 빈번한 테이블이다. 인덱스 설계가 성능의 핵심이다.

```sql
CREATE TABLE policies (
    id TEXT PRIMARY KEY,            -- bizId (External ID)
    title TEXT NOT NULL,            -- 정책명
    summary TEXT,                   -- 요약
    category TEXT,                  -- 'JOB', 'HOUSING', 'LOAN' 등
    region TEXT,                    -- 'SEOUL', 'BUSAN', 'ALL'
    target_age_min INTEGER,         -- 검색용 인덱스
    target_age_max INTEGER,
    start_date INTEGER,             -- Unix Timestamp (신청 시작)
    end_date INTEGER,               -- Unix Timestamp (신청 마감)
    is_always_open BOOLEAN DEFAULT 0,
    detail_json TEXT,               -- HTML 본문 및 기타 메타데이터 (JSON 압축)
    created_at INTEGER,
    updated_at INTEGER
);

-- 검색 성능 최적화를 위한 인덱스
CREATE INDEX idx_policies_filter ON policies(region, category);
CREATE INDEX idx_policies_date ON policies(start_date, end_date);
```

#### 4.2.2 users 및 bookmarks 테이블

사용자 인증은 복잡한 세션 관리 대신, 기기 기반의 UUID 또는 소셜 로그인(구글/카카오)의 식별자를 사용한다.

```sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,       -- UUID or Social ID
    fcm_token TEXT,                 -- 푸시 알림용 토큰
    preferences TEXT,               -- JSON: { "regions":[], "categories": [] }
    created_at INTEGER
);

CREATE TABLE bookmarks (
    user_id TEXT,
    policy_id TEXT,
    notify_at INTEGER,              -- 알림 받을 날짜 (마감 3일 전 등)
    PRIMARY KEY (user_id, policy_id),
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);
```

#### 4.2.3 posts 및 comments 테이블 (커뮤니티 게시판)

사용자들이 정책별로 경험과 정보를 공유할 수 있는 간단한 게시판 시스템이다. 익명성을 보장하면서도 악성 글 방지를 위한 최소한의 식별 체계를 갖춘다.

```sql
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_id TEXT,                 -- 연관 정책 ID (NULL이면 자유게시판)
    user_id TEXT NOT NULL,          -- 작성자 (익명 표시용 해시 생성)
    nickname TEXT,                  -- 선택적 닉네임 (미입력 시 '익명')
    title TEXT NOT NULL,            -- 게시글 제목
    content TEXT NOT NULL,          -- 게시글 본문
    post_type TEXT DEFAULT 'general', -- 'tip', 'question', 'review', 'general'
    view_count INTEGER DEFAULT 0,   -- 조회수
    like_count INTEGER DEFAULT 0,   -- 좋아요 수
    is_deleted BOOLEAN DEFAULT 0,   -- 소프트 삭제
    created_at INTEGER NOT NULL,
    updated_at INTEGER,
    FOREIGN KEY (policy_id) REFERENCES policies(id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,       -- 부모 게시글
    parent_id INTEGER,              -- 대댓글인 경우 부모 댓글 ID
    user_id TEXT NOT NULL,
    nickname TEXT,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

CREATE TABLE post_likes (
    user_id TEXT,
    post_id INTEGER,
    created_at INTEGER,
    PRIMARY KEY (user_id, post_id)
);

-- 게시판 성능 최적화 인덱스
CREATE INDEX idx_posts_policy ON posts(policy_id, created_at DESC);
CREATE INDEX idx_posts_type ON posts(post_type, created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
```

### 4.3 백엔드 워커(Workers) 구현 전략

#### 4.3.1 상태 유지형 크론(Stateful Cron) 패턴

정부 API의 데이터 양이 많아(수천 건), 한 번의 실행(Cron)으로 모든 데이터를 가져오면 Workers의 CPU 시간 제한(10ms/30s wall time)에 걸릴 수 있다. 이를 해결하기 위해 '이어달리기' 방식을 구현한다.

1. D1에 `sync_status` 테이블 생성: `last_page_index`, `last_updated` 저장.
2. Cron 실행 (매시 정각):
   - `sync_status`에서 `last_page_index`를 읽어온다 (예: 5페이지).
   - API에 6페이지를 요청한다.
   - 데이터를 파싱하여 `policies` 테이블에 `INSERT OR REPLACE` (Upsert) 한다.
   - `sync_status`를 6페이지로 업데이트하고 종료한다.

**결과**: 하루 24번 실행 시 2400개의 데이터를 부하 없이 분산 처리할 수 있다.

#### 4.3.2 API 응답 최적화

프론트엔드 캘린더 렌더링을 위해 `GET /api/policies` 요청 시, 월 단위 데이터를 한 번에 내려준다. 이때 `detail_json` 같은 무거운 컬럼은 제외하고, `id`, `title`, `date` 등 캘린더 렌더링에 필수적인 필드만 SELECT하여 대역폭과 D1 읽기 비용을 절약한다.

---

## 5. 프론트엔드 개발 및 UX 상세 (Cloudflare Pages + Next.js)

### 5.1 기술 스택 선정: Next.js Static Export

Cloudflare Pages와의 호환성을 위해 Next.js의 App Router를 사용하되, `next.config.js`에서 `output: 'export'` 설정을 활성화한다. 이는 서버 사이드 렌더링(SSR)을 포기하는 대신, 완전한 정적 사이트(Static Site)로 빌드하여 비용을 0으로 만든다. 동적인 데이터(정책 리스트)는 클라이언트 사이드(Client-Side Rendering, CSR)에서 fetch로 Workers API를 호출하여 채운다.

### 5.2 캘린더 UI/UX 설계

기존 정부 사이트의 딱딱한 표 형식을 탈피하는 것이 핵심이다.

#### 메인 뷰 (Calendar View)

- **라이브러리**: FullCalendar 또는 경량화된 react-calendar 커스터마이징.
- **이벤트 바(Bar) 디자인**:
  - 시작일~종료일: 긴 막대 형태로 기간을 시각화.
  - 색상 코딩: '마감 임박(빨강)', '접수 중(초록)', '오픈 예정(노랑)'.
  - 필터링 연동: 상단 필터(지역/분야) 변경 시 실시간으로 캘린더 이벤트가 재렌더링 되어야 함.

#### 리스트 뷰 (Mobile First)

- 모바일 화면에서는 월간 달력이 가독성이 떨어지므로, Agenda View(날짜별 리스트)를 기본으로 제공한다.
- 무한 스크롤(Infinite Scroll)을 적용하여 사용자 경험을 향상시킨다.

### 5.3 커뮤니티 게시판 UI/UX 설계

사용자들이 정책에 대한 경험과 정보를 공유할 수 있는 간단한 게시판 시스템이다.

#### 게시판 구조

- **정책별 게시판**: 각 정책 상세 페이지 하단에 해당 정책 관련 게시글 목록 표시
- **자유 게시판**: 특정 정책에 종속되지 않는 일반 질문/정보 공유 공간
- **게시글 유형 태그**: `꿀팁`, `질문`, `후기`, `일반` 중 선택하여 분류

#### 게시글 목록 뷰

| 요소 | 설명 |
|------|------|
| 제목 | 최대 50자, 말줄임 처리 |
| 유형 태그 | 색상으로 구분 (꿀팁: 초록, 질문: 파랑, 후기: 주황) |
| 작성자 | 닉네임 또는 '익명' + 고유 해시 4자리 (예: 익명#A3F2) |
| 작성일 | 상대 시간 표시 (방금 전, 3시간 전, 어제 등) |
| 조회수/댓글수 | 아이콘과 함께 표시 |

#### 게시글 작성 폼

```
┌─────────────────────────────────────────┐
│ 유형 선택: [꿀팁] [질문] [후기] [일반]    │
├─────────────────────────────────────────┤
│ 닉네임 (선택): [____________] 익명 체크박스│
├─────────────────────────────────────────┤
│ 제목: [____________________________]     │
├─────────────────────────────────────────┤
│ 내용:                                    │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │     (최대 2000자)                   │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                        [취소] [등록]     │
└─────────────────────────────────────────┘
```

#### 댓글 시스템

- **1단계 대댓글**: 댓글에 대한 답글 1단계까지만 허용 (과도한 중첩 방지)
- **좋아요**: 게시글 및 댓글에 좋아요 기능 (중복 방지)
- **신고 기능**: 부적절한 콘텐츠 신고 버튼 (3회 이상 신고 시 자동 숨김 처리)

#### 스팸 방지 정책

- 동일 사용자 게시글 작성: 1분 간격 제한
- 동일 사용자 댓글 작성: 10초 간격 제한
- 비로그인 사용자: 조회만 가능, 작성 불가

### 5.4 알림 신청 UX (Web Push)

웹 푸시(Web Push)는 앱 설치 없이도 네이티브 앱과 유사한 알림을 제공하는 강력한 수단이다.

1. 사용자가 관심 정책의 '별표(Bookmark)'를 누른다.
2. 브라우저가 "알림 권한을 허용하시겠습니까?"를 묻는다.
3. 허용 시, Firebase SDK를 통해 FCM Token을 발급받아 `POST /api/user/push-token`으로 서버에 전송한다.
4. 사용자는 "마감 3일 전 알림 받기" 옵션을 토글할 수 있다.

---

## 6. 개발 로드맵 및 구현 단계 (Implementation Guide)

전문 개발자 1인이 2.5주(12일) 내에 MVP를 완성할 수 있는 일정이다.

### Phase 1: 인프라 및 데이터 파이프라인 (Day 1~4)

| Day | 작업 내용 |
|-----|----------|
| Day 1 | Cloudflare 계정 세팅, wrangler 설치, GitHub 레포지토리 연동. D1 데이터베이스 생성 (`wrangler d1 create policy-db`). |
| Day 2 | 스키마 설계 및 마이그레이션 적용. Youth Center API 키 발급 및 Postman 테스트. |
| Day 3 | Workers Cron Trigger 개발. 데이터 수집 로직(Ingestion) 및 날짜 파싱 정규식 구현. |
| Day 4 | 수집된 데이터가 D1에 정상적으로 적재되는지 확인. 로그 모니터링 시스템 구축. |

### Phase 2: 백엔드 API 및 프론트엔드 골격 (Day 5~7)

| Day | 작업 내용 |
|-----|----------|
| Day 5 | 프론트엔드용 REST API 개발 (`GET /policies`, `GET /policies/:id`). CORS 설정. |
| Day 6 | Next.js 프로젝트 생성. 캘린더 라이브러리 선정 및 기본 UI 구현. |
| Day 7 | API와 프론트엔드 연동. 필터링 로직(지역, 나이) 구현. |

### Phase 3: 개인화 및 알림 기능 (Day 8~9)

| Day | 작업 내용 |
|-----|----------|
| Day 8 | 사용자 설정 저장 기능(Local Storage + D1 Sync). 북마크 기능 구현. |
| Day 9 | Firebase 프로젝트 생성 및 FCM 연동. Workers에서 푸시 발송 로직 구현 (매일 아침 9시 배치). |

### Phase 4: 커뮤니티 게시판 기능 (Day 10~11)

| Day | 작업 내용 |
|-----|----------|
| Day 10 | 게시판 DB 스키마 마이그레이션. 게시판 CRUD API 개발 (`GET/POST /api/posts`, `GET/POST /api/posts/:id/comments`). |
| Day 11 | 게시판 프론트엔드 UI 구현 (목록, 상세, 작성 폼). 댓글 컴포넌트 개발. 스팸 방지 로직(Rate Limiting) 적용. |

### Phase 5: 배포 및 안정화 (Day 12)

| Day | 작업 내용 |
|-----|----------|
| Day 12 | Cloudflare Pages 배포. 실제 모바일 기기에서의 UI 테스트. SEO 메타 태그 최적화. 게시판 기능 통합 테스트. |

---

## 7. SEO 및 수익화 전략 (Monetization & Growth)

단순한 도구(Tool) 사이트는 구글 애드센스 승인이 어려운 경우가 많다. '가치 있는 인벤토리(Valuable Inventory)' 정책을 위반할 소지가 있기 때문이다. 이를 극복하고 수익화를 달성하기 위한 전략은 다음과 같다.

### 7.1 프로그래매틱 SEO (Programmatic SEO) 전략

단순히 로그인해야만 볼 수 있는 캘린더가 아니라, 검색 엔진이 긁어갈 수 있는 **'정적 랜딩 페이지'**를 대량으로 생성해야 한다.

#### 동적 라우팅 활용

Next.js의 `generateStaticParams`를 활용하여 다음과 같은 URL 구조의 정적 페이지를 빌드 타임에 생성한다.

- `/policy/seoul-youth-housing-2024` (서울 청년 주거 지원 총정리)
- `/policy/busan-startup-loan` (부산 소상공인 창업 대출 가이드)

#### 콘텐츠 강화

각 페이지에는 API에서 가져온 단순 정보 외에, "신청 꿀팁", "자주 묻는 질문", "비슷한 정책 비교" 등 부가 가치를 템플릿화하여 텍스트로 추가한다. 이는 구글 봇에게 "이 페이지는 단순 복사본이 아니라 큐레이션 된 콘텐츠"라는 신호를 준다.

### 7.2 광고 배치 전략

- **사이드바 및 하단**: 사용자의 흐름을 방해하지 않는 선에서 디스플레이 광고 배치.
- **네이티브 광고**: 정책 리스트 사이에 "추천 금융 상품"과 같은 형태로 위화감 없이 광고를 섞는 방식을 고려할 수 있으나, 초기 승인 단계에서는 피하는 것이 좋다.

### 7.3 하이브리드 구조 (SPA + SSG)

- **검색 유입용**: programmatic SEO로 생성된 수천 개의 개별 정책 상세 페이지 (SSG). 여기에 애드센스를 탑재.
- **유틸리티용**: "나만의 캘린더" 페이지는 클라이언트 사이드 렌더링(CSR)으로 동작하며, 광고보다는 기능성에 집중. 사용자가 상세 페이지로 들어와서 캘린더 기능을 이용하도록 유도하는 깔때기(Funnel) 구조 설계.

---

## 8. 유지보수 및 리스크 관리

### 8.1 데이터 정확성 및 API 변경 대응

공공 API는 예고 없이 필드명이 바뀌거나 서비스가 중단될 수 있다.

- **Health Check**: Workers를 하나 더 띄워 매일 주요 API 엔드포인트의 응답 상태를 체크하고, 실패 시 개발자에게 텔레그램/슬랙으로 알림을 보내도록 구성한다.
- **사용자 제보**: "정보가 달라요" 버튼을 두어 집단지성으로 데이터 오류를 보정한다.

### 8.2 개인정보 보호 (PIPA)

대한민국의 개인정보보호법은 매우 엄격하다.

- **익명성 유지**: 주민등록번호, 실명, 전화번호는 절대 수집하지 않는다. 오직 기기 토큰과 추상화된 인구통계 정보(나이대, 거주 지역)만 저장하여 리스크를 원천 차단한다.
- **약관 명시**: 서비스 이용 약관에 "본 서비스는 정부 공식 사이트가 아니며, 정보의 정확성을 보증하지 않는다"는 면책 조항을 명확히 포함해야 한다.

---

## 9. 결론

본 보고서를 통해 설계된 **'PolicyFlow KR'**은 Cloudflare의 강력한 엣지 인프라를 활용하여 서버 비용 '0원'이라는 경제적 효율성과, 자동화된 데이터 파이프라인이라는 기술적 우위를 동시에 달성한다.

기존의 파편화된 정책 데이터를 '캘린더'라는 사용자 친화적인 인터페이스로 재가공함으로써, 정보 소외 계층인 청년과 소상공인에게 실질적인 금전적 혜택을 연결해 줄 수 있다. 또한, Next.js와 D1을 결합한 아키텍처는 초기 MVP 단계를 넘어 수십만 사용자를 수용할 수 있는 확장성을 내재하고 있다.

지금이 바로 이 서비스를 개발하기 위한 최적의 시기이다. 공공 데이터 개방은 가속화되고 있으며, 경제적 불확실성 속에서 지원금 정보에 대한 수요는 그 어느 때보다 높기 때문이다. 제시된 상세 기술 명세에 따라 개발을 시작한다면, 단 2.5주 안에 시장에 임팩트를 줄 수 있는 제품을 런칭할 수 있을 것이다.
