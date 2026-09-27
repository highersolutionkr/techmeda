# 테크미디어 — 1인 테크 전문 언론사 웹사이트

Next.js + Supabase로 만든 테크 뉴스 사이트입니다. 독자가 보는 홈페이지/기사 페이지와,
기자(관리자)가 글을 쓰고 수정하는 어드민 페이지가 함께 들어 있습니다.

## 무엇이 들어있나요

- **공개 사이트**: 홈, 카테고리별 목록, 기사 상세(마크다운 렌더링), 검색, 댓글, 뉴스레터 구독
- **어드민 페이지** (`/admin`): 이메일 로그인, 기사 작성/수정/삭제, 표지·본문 이미지 업로드,
  카테고리 관리, 댓글 관리(삭제), 뉴스레터 구독자 목록(CSV 다운로드)
- **데이터/이미지 저장**: Supabase (Postgres DB + 로그인 인증 + 이미지 스토리지)를 사용합니다.
  글, 카테고리, 태그, 댓글, 구독자 이메일은 DB 테이블에, 표지 사진과 본문 삽입 사진은
  Supabase Storage의 `article-images` 버킷(공개 읽기)에 저장됩니다.

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 에서 무료 계정을 만들고 새 프로젝트를 생성합니다.
2. 프로젝트가 만들어지면 왼쪽 메뉴 **SQL Editor** 로 들어가서, 이 저장소의
   `supabase/schema.sql` 파일 내용을 전체 복사해 붙여넣고 실행(Run)합니다.
   - 테이블(기사, 카테고리, 태그, 댓글, 구독자), 보안 정책(RLS), 이미지 저장용
     스토리지 버킷, 기본 카테고리 5개가 한 번에 만들어집니다.
3. 왼쪽 메뉴 **Project Settings → API** 에서 다음 두 값을 복사해둡니다.
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 왼쪽 메뉴 **Authentication → Users** 에서 **Add user** 로 본인 이메일과 비밀번호를 등록합니다.
   이 계정이 어드민 페이지(`/admin`) 로그인 계정입니다. (이메일 확인이 필요하면
   Authentication → Settings 에서 "Confirm email"을 꺼도 됩니다.)

나중에 기자를 더 추가하고 싶으면 같은 화면에서 계정을 하나 더 만들면 됩니다.

## 2. 로컬에서 실행해보기

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 위에서 복사한 값을 채워넣습니다.

```bash
npm install
npm run dev
```

- `http://localhost:3000` — 공개 사이트
- `http://localhost:3000/admin` — 어드민 (로그인 필요)

## 3. Vercel에 배포하기

1. 이 프로젝트를 GitHub 저장소로 올립니다.
2. [vercel.com](https://vercel.com) 에서 New Project → 방금 만든 저장소를 선택합니다.
3. **Environment Variables** 에 `.env.local`과 동일하게
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL`(배포 후 실제 도메인으로)을 등록합니다.
4. Deploy를 누르면 끝입니다. 이후 `git push`할 때마다 자동으로 재배포됩니다.
5. 커스텀 도메인을 연결하려면 Vercel 프로젝트의 **Settings → Domains** 에서 등록합니다.

## 데이터/이미지는 이렇게 관리됩니다

- **글 데이터(제목, 본문, 카테고리, 태그, 상태 등)**: Supabase의 Postgres 테이블에 저장됩니다.
  용량 걱정 없이 무료 플랜으로도 충분히 시작할 수 있고, 나중에 트래픽이 늘면 유료 플랜으로
  올리기만 하면 됩니다.
- **사진(표지 이미지, 본문에 삽입한 이미지)**: 어드민 페이지에서 업로드하면 Supabase
  Storage의 `article-images` 버킷에 저장되고, 공개 URL이 자동으로 글에 연결됩니다.
  버킷은 "공개 읽기"로 설정되어 있어 독자는 로그인 없이 이미지를 볼 수 있고,
  업로드/삭제는 로그인한 관리자만 가능합니다(RLS 정책으로 강제됨).
- **댓글**: 누구나 작성 가능하고, 스팸/부적절한 댓글은 어드민 → 댓글 관리에서 삭제할 수 있습니다.
- **뉴스레터 구독자**: 이메일만 저장되며, 어드민 → 구독자 메뉴에서 CSV로 내려받아
  실제 이메일 발송 서비스(예: Stibee, Mailchimp 등)에 연동해 보내면 됩니다.
  (이 프로젝트 자체는 이메일 발송 기능은 포함하지 않습니다.)

## 나중에 더 해보면 좋은 것들

- 발행 시 뉴스레터 구독자에게 자동 이메일 발송 (Resend, Stibee API 연동)
- 어드민에 이미지 갤러리(업로드한 사진 모아보기) 추가
- 기사 목록 페이지네이션 (현재는 최신 글부터 일정 개수만 표시)
- RSS 피드, sitemap.xml, Google Search Console 등록으로 검색 유입 확보

## 폴더 구조 요약

```
src/
  app/
    (site)/          공개 페이지 (홈/카테고리/기사/검색)
    admin/            어드민 (로그인 + 대시보드)
  components/         공용/어드민 UI 컴포넌트
  lib/
    supabase/         Supabase 클라이언트 (브라우저/서버/세션)
    db/               데이터 조회 함수, 타입
    admin/            어드민 전용 서버 액션(글 CRUD 등), 이미지 업로드
    actions.ts        공개 사용자용 서버 액션(댓글, 뉴스레터)
supabase/
  schema.sql          Supabase에 실행할 DB 스키마 + RLS 정책 전체
```
