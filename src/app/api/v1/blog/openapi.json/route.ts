import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const err = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});
const security = [{ bearerAuth: [] }];
const errors = { '401': err('invalid_api_key'), '403': err('insufficient_scope'), '429': err('rate_limited (see Retry-After)') };
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };
const language = { name: 'language', in: 'query', schema: { type: 'string' } };
const summary = { content: { 'application/json': { schema: { $ref: '#/components/schemas/PostResult' } } } };
const body = (ref: string) => ({ required: true, content: { 'application/json': { schema: { $ref: ref } } } });
const list = { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { type: 'object' } } } } } } };

const spec = {
  openapi: '3.0.3',
  info: { title: 'Blog API', version: '1.0.0', description: 'Create and manage blog posts from agents and automations.' },
  servers: [{ url: '/api/v1/blog' }],
  security,
  paths: {
    '/posts': {
      post: {
        summary: 'Create a post (idempotent by language + externalId)',
        requestBody: body('#/components/schemas/CreatePost'),
        responses: {
          '201': { description: 'Created', ...summary },
          '200': { description: 'Already exists (same externalId)', ...summary },
          '400': err('invalid_json'), '413': err('payload_too_large'), '422': err('validation_error'), ...errors,
        },
      },
      get: {
        summary: 'List posts created through the API',
        parameters: [
          language,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'scheduled', 'published', 'archived'] } },
          { name: 'externalId', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': list, ...errors },
      },
    },
    '/posts/{id}': {
      get: { summary: 'Get a post', parameters: [idParam], responses: { '200': { description: 'OK' }, '404': err('not_found'), ...errors } },
      patch: {
        summary: 'Update a post',
        parameters: [idParam],
        requestBody: body('#/components/schemas/UpdatePost'),
        responses: { '200': { description: 'Updated', ...summary }, '404': err('not_found'), '413': err('payload_too_large'), '422': err('validation_error'), ...errors },
      },
    },
    '/categories': { get: { summary: 'List categories', parameters: [language], responses: { '200': list, ...errors } } },
    '/tags': { get: { summary: 'List tags', parameters: [language], responses: { '200': list, ...errors } } },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'API key: bk_<prefix>_<secret>' } },
    schemas: {
      Error: { type: 'object', required: ['error'], properties: { error: { type: 'string' }, message: { type: 'string' } } },
      ContentBlock: {
        type: 'object',
        required: ['type'],
        description: 'heading {text, level 2-4} | paragraph {html} | html {html} | image {src, alt, caption?} | list {items[], ordered?} | quote {text, cite?}',
        properties: { type: { type: 'string', enum: ['heading', 'paragraph', 'html', 'image', 'list', 'quote'] } },
      },
      CreatePost: {
        type: 'object',
        required: ['language', 'title'],
        description: 'Provide exactly one of content, html or sections.',
        properties: {
          language: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          excerpt: { type: 'string' },
          externalId: { type: 'string', description: 'Idempotency key, unique per language' },
          translationOf: { type: 'string', description: 'Post id or externalId of the original article' },
          authorEmail: { type: 'string', format: 'email' },
          category: { type: 'string', description: 'Slug or name; created if missing' },
          tags: { type: 'array', items: { type: 'string' } },
          coverImageUrl: { type: 'string', format: 'uri', description: 'https image, downloaded and re-hosted' },
          coverImageAlt: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'scheduled', 'published', 'archived'] },
          publishedAt: { type: 'string', format: 'date-time' },
          scheduledAt: { type: 'string', format: 'date-time' },
          seo: { type: 'object', properties: { metaTitle: { type: 'string' }, metaDescription: { type: 'string' }, ogImage: { type: 'string' }, noindex: { type: 'boolean' } } },
          content: { type: 'array', items: { $ref: '#/components/schemas/ContentBlock' } },
          html: { type: 'string' },
          sections: { type: 'array', items: { type: 'object' } },
        },
      },
      UpdatePost: { type: 'object', description: 'Same fields as CreatePost, all optional (except language/translationOf/authorEmail, which are not updatable).' },
      PostResult: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          status: { type: 'string' },
          url: { type: 'string' },
          previewUrl: { type: 'string' },
          warnings: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec);
}
