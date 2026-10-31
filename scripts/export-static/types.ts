export type Lang = 'fa' | 'en' | 'ar';

export interface RouteEntry {
  lang: Lang;
  path: string;
  source: 'db' | 'fs' | 'link';
  pageId?: string;
}
