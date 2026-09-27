export type ArticleStatus = "draft" | "published";

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string | null;
  status: ArticleStatus;
  author_name: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  category?: Category | null;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}
