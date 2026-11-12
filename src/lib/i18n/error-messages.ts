/**
 * Localized strings for the not-found and error pages.
 * Keys follow the language codes in ./config.ts (Record<SupportedLanguage, ...>
 * makes TypeScript fail if a language is added there without translations).
 */

import { defaultLanguage, supportedLanguages, languages, type SupportedLanguage } from './config';

export interface ErrorMessages {
  notFoundTitle: string;
  notFoundBody: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  home: string;
}

export const errorMessages: Record<SupportedLanguage, ErrorMessages> = {
  en: {
    notFoundTitle: 'Page not found',
    notFoundBody: "Sorry, the page you are looking for doesn't exist or has been moved.",
    errorTitle: 'Something went wrong',
    errorBody: 'An error occurred while loading this page. Please try again or return to the home page.',
    retry: 'Try again',
    home: 'Back to home',
  },
  ar: {
    notFoundTitle: 'الصفحة غير موجودة',
    notFoundBody: 'عذرًا، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.',
    errorTitle: 'حدث خطأ ما',
    errorBody: 'حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.',
    retry: 'حاول مرة أخرى',
    home: 'العودة إلى الصفحة الرئيسية',
  },
  tr: {
    notFoundTitle: 'Sayfa bulunamadı',
    notFoundBody: 'Üzgünüz, aradığınız sayfa mevcut değil veya taşınmış olabilir.',
    errorTitle: 'Bir sorun oluştu',
    errorBody: 'Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.',
    retry: 'Tekrar dene',
    home: 'Ana sayfaya dön',
  },
  fr: {
    notFoundTitle: 'Page introuvable',
    notFoundBody: "La page que vous recherchez n'existe pas ou a été déplacée.",
    errorTitle: 'Une erreur est survenue',
    errorBody: "Une erreur s'est produite lors du chargement de cette page. Veuillez réessayer ou revenir à l'accueil.",
    retry: 'Réessayer',
    home: "Retour à l'accueil",
  },
  de: {
    notFoundTitle: 'Seite nicht gefunden',
    notFoundBody: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
    errorTitle: 'Ein Fehler ist aufgetreten',
    errorBody: 'Beim Laden dieser Seite ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.',
    retry: 'Erneut versuchen',
    home: 'Zur Startseite',
  },
  es: {
    notFoundTitle: 'Página no encontrada',
    notFoundBody: 'Lo sentimos, la página que buscas no existe o se ha movido.',
    errorTitle: 'Algo salió mal',
    errorBody: 'Se produjo un error al cargar esta página. Inténtalo de nuevo o vuelve a la página de inicio.',
    retry: 'Intentar de nuevo',
    home: 'Volver al inicio',
  },
  fa: {
    notFoundTitle: 'صفحه پیدا نشد',
    notFoundBody: 'متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابه‌جا شده است.',
    errorTitle: 'مشکلی پیش آمد',
    errorBody: 'هنگام بارگذاری این صفحه خطایی رخ داد. لطفاً دوباره تلاش کنید یا به صفحه اصلی بازگردید.',
    retry: 'تلاش مجدد',
    home: 'بازگشت به صفحه اصلی',
  },
};

/** Returns a supported language code, or the default language for anything else. */
export function resolveLang(value: string | string[] | null | undefined): SupportedLanguage {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && supportedLanguages.includes(candidate)
    ? (candidate as SupportedLanguage)
    : (defaultLanguage as SupportedLanguage);
}

/** Messages for a language, falling back to English for unknown codes. */
export function getErrorMessages(lang: string | null | undefined): ErrorMessages {
  return errorMessages[resolveLang(lang)] ?? errorMessages.en;
}

/** Text direction for a language, from the project's language config. */
export function getLangDir(lang: string | null | undefined): 'ltr' | 'rtl' {
  return languages[resolveLang(lang)]?.dir ?? 'ltr';
}
