-- ============================================================
-- 테크 전문 언론사 사이트 - Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 실행하세요.
-- ============================================================

-- 확장
create extension if not exists "pgcrypto";

-- ---------- 카테고리 ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- 태그 ----------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- ---------- 기사 ----------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_name text,
  view_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);
create index if not exists articles_category_id_idx
  on public.articles (category_id);

-- 기사 <-> 태그 다대다
create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- ---------- 댓글 ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_name text not null,
  content text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists comments_article_id_idx on public.comments (article_id);

-- ---------- 뉴스레터 구독자 ----------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- 조회수 원자적 증가 함수 (동시 조회 시 경쟁 상태 방지)
create or replace function public.increment_view_count(p_article_id uuid)
returns void as $$
begin
  update public.articles
  set view_count = view_count + 1
  where id = p_article_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.comments enable row level security;
alter table public.subscribers enable row level security;

-- 카테고리/태그: 누구나 읽기 가능, 로그인한 관리자만 쓰기 가능
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read" on public.tags
  for select using (true);
drop policy if exists "tags_admin_write" on public.tags;
create policy "tags_admin_write" on public.tags
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 기사: 발행된 글은 누구나, 초안은 관리자만. 쓰기는 관리자만.
drop policy if exists "articles_public_read_published" on public.articles;
create policy "articles_public_read_published" on public.articles
  for select using (status = 'published' or auth.role() = 'authenticated');
drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write" on public.articles
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "article_tags_public_read" on public.article_tags;
create policy "article_tags_public_read" on public.article_tags
  for select using (true);
drop policy if exists "article_tags_admin_write" on public.article_tags;
create policy "article_tags_admin_write" on public.article_tags
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 댓글: 승인된 것은 누구나 읽기, 누구나(익명 포함) 작성 가능, 수정/삭제는 관리자만
drop policy if exists "comments_public_read_approved" on public.comments;
create policy "comments_public_read_approved" on public.comments
  for select using (is_approved = true or auth.role() = 'authenticated');
drop policy if exists "comments_public_insert" on public.comments;
create policy "comments_public_insert" on public.comments
  for insert with check (true);
drop policy if exists "comments_admin_update_delete" on public.comments;
create policy "comments_admin_update_delete" on public.comments
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "comments_admin_delete" on public.comments;
create policy "comments_admin_delete" on public.comments
  for delete using (auth.role() = 'authenticated');

-- 구독자: 누구나 등록(insert) 가능, 목록 조회는 관리자만
drop policy if exists "subscribers_public_insert" on public.subscribers;
create policy "subscribers_public_insert" on public.subscribers
  for insert with check (true);
drop policy if exists "subscribers_admin_read" on public.subscribers;
create policy "subscribers_admin_read" on public.subscribers
  for select using (auth.role() = 'authenticated');
drop policy if exists "subscribers_admin_delete" on public.subscribers;
create policy "subscribers_admin_delete" on public.subscribers
  for delete using (auth.role() = 'authenticated');

-- ============================================================
-- Storage: 이미지(표지 사진, 본문 삽입 사진) 버킷
-- ============================================================
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

drop policy if exists "article_images_public_read" on storage.objects;
create policy "article_images_public_read" on storage.objects
  for select using (bucket_id = 'article-images');

drop policy if exists "article_images_admin_write" on storage.objects;
create policy "article_images_admin_write" on storage.objects
  for insert with check (bucket_id = 'article-images' and auth.role() = 'authenticated');

drop policy if exists "article_images_admin_update" on storage.objects;
create policy "article_images_admin_update" on storage.objects
  for update using (bucket_id = 'article-images' and auth.role() = 'authenticated');

drop policy if exists "article_images_admin_delete" on storage.objects;
create policy "article_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'article-images' and auth.role() = 'authenticated');

-- ============================================================
-- 기본 카테고리 (원하는 대로 수정/추가하세요)
-- ============================================================
insert into public.categories (name, slug) values
  ('AI', 'ai'),
  ('반도체', 'semiconductor'),
  ('스타트업', 'startup'),
  ('빅테크', 'bigtech'),
  ('모빌리티', 'mobility')
on conflict (slug) do nothing;
