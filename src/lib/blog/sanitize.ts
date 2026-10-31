import sanitize from 'sanitize-html';

const IFRAME_HOSTS = [
  'youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
  'player.vimeo.com', 'aparat.com', 'www.aparat.com',
];

const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'span', 'div', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'figure', 'figcaption', 'img', 'a', 'iframe',
  ],
  allowedAttributes: {
    '*': ['class', 'dir', 'id'],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'title', 'allowfullscreen', 'frameborder'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'], iframe: ['https'] },
  allowedIframeHostnames: IFRAME_HOSTS,
  allowProtocolRelative: false,
  // an iframe whose src was rejected (host not allow-listed) is dropped entirely
  exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer';
      return { tagName, attribs };
    },
  },
};

/** Shared allow-list used on save (server) and on render. Idempotent. */
export function sanitizeHtml(html: string): string {
  return sanitize(html ?? '', OPTIONS);
}

const HTML_SECTION_TYPES = new Set(['blog-rich-text', 'blog-html']);

/** Sanitizes the `html` field of every blog HTML-carrying section. */
export function sanitizeSections<T extends { type: string; data?: Record<string, any> }>(sections: T[]): T[] {
  return sections.map((section) =>
    HTML_SECTION_TYPES.has(section.type) && typeof section.data?.html === 'string'
      ? { ...section, data: { ...section.data, html: sanitizeHtml(section.data.html) } }
      : section
  );
}
