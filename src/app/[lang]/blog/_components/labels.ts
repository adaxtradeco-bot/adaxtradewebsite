// Small UI strings for the blog pages; unknown languages fall back to English.
const LABELS = {
  en: { blog: 'Blog', minRead: 'min read', related: 'Related posts', tags: 'Tags', prev: 'Previous', next: 'Next', empty: 'No posts yet.', by: 'By' },
  ar: { blog: 'المدونة', minRead: 'دقيقة قراءة', related: 'مقالات ذات صلة', tags: 'الوسوم', prev: 'السابق', next: 'التالي', empty: 'لا توجد مقالات بعد.', by: 'بقلم' },
  fa: { blog: 'وبلاگ', minRead: 'دقیقه مطالعه', related: 'مطالب مرتبط', tags: 'برچسب‌ها', prev: 'قبلی', next: 'بعدی', empty: 'هنوز مطلبی منتشر نشده است.', by: 'نویسنده' },
} as const;

export type BlogLabels = { [K in keyof (typeof LABELS)['en']]: string };
export const getLabels = (lang: string): BlogLabels => (LABELS as Record<string, BlogLabels>)[lang] ?? LABELS.en;
