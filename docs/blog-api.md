# Blog external API

Create and manage blog posts from AI agents and automations (n8n, scripts, Claude routines).
Machine-readable spec: `GET /api/v1/blog/openapi.json` (no auth).

## Authentication

Create a key in **Admin > Blog > API keys**. The full key (`bk_<prefix>_<secret>`) is shown once; only its hash is stored. Send it on every request:

```
Authorization: Bearer bk_xxxxxxxx_...
```

Keys can be revoked at any time. Every endpoint below needs the `blog:write` scope.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/blog/posts` | Create a post. 201 when created, 200 when `externalId` already exists |
| GET | `/api/v1/blog/posts` | List posts created through the API. Filters: `language`, `status`, `externalId`, `limit` (1-100, default 20), `cursor` |
| GET | `/api/v1/blog/posts/{id}` | Get one post (includes `sections`) |
| PATCH | `/api/v1/blog/posts/{id}` | Update a post (any subset of the create fields) |
| GET | `/api/v1/blog/categories?language=` | List categories |
| GET | `/api/v1/blog/tags?language=` | List tags |
| GET | `/api/v1/blog/openapi.json` | OpenAPI 3 description |

The list endpoint returns `{ "items": [...], "nextCursor": "..." | null }`.

## Create a post

Required: `language`, `title`, and exactly one of `content`, `html` or `sections`.

| Field | Notes |
| --- | --- |
| `externalId` | Idempotency key, unique per language |
| `translationOf` | Post id or `externalId` of the original; links the new post as its translation |
| `slug`, `excerpt`, `category`, `tags[]` | `category` is a slug or name and is created if missing; tags are created if missing |
| `coverImageUrl`, `coverImageAlt` | https image (max 8 MB), downloaded and re-hosted |
| `authorEmail` | Must match an existing user; defaults to the owner of the API key |
| `status` | `draft` (default), `scheduled`, `published`, `archived`. `scheduled` needs `scheduledAt` |
| `publishedAt`, `scheduledAt` | ISO 8601 with offset |
| `seo` | `{ metaTitle, metaDescription, ogImage, noindex }` |
| `content[]` | Blocks: `heading {text, level 2-4}`, `paragraph {html}`, `html {html}`, `image {src, alt, caption?}`, `list {items[], ordered?}`, `quote {text, cite?}` |

HTML is sanitized on save (scripts, event handlers and unsafe URLs are removed). Request bodies are limited to 1 MB.

Response:

```json
{
  "id": "clx...",
  "slug": "5-tips-for-importing-from-turkey",
  "status": "draft",
  "url": "https://your-site.example/en/blog/5-tips-for-importing-from-turkey",
  "previewUrl": "https://your-site.example/admin/blog/posts/clx...",
  "warnings": ["status downgraded to draft: API publishing is disabled"]
}
```

`warnings` is non-fatal: a failed cover download, an unknown `authorEmail` or a status downgrade still save the post.

### Publishing setting

By default the API cannot publish: `published` and `scheduled` are saved as `draft` with the warning above, so a human reviews them. An admin can enable **Allow API to publish directly** on the API keys page (stored as `blog.apiCanPublish`).

## Errors

Body format: `{ "error": "<code>", "message": "..." }`.

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `invalid_json` | Body is not valid JSON |
| 401 | `invalid_api_key` | Missing, unknown or revoked key |
| 403 | `insufficient_scope` | Key lacks `blog:write` |
| 404 | `not_found` | Post (or `translationOf` post) not found |
| 409 | `conflict` | Slug taken, or the article already has a version in that language |
| 413 | `payload_too_large` | Body over 1 MB |
| 422 | `validation_error` | `issues: [{ path, message }]` |
| 429 | `rate_limited` | Over the limit; see `Retry-After` (seconds) |

## Rate limit

60 requests per minute per key. The counter is kept in memory per server instance, so on serverless hosting the effective limit can be looser.

## Idempotency

Send a stable `externalId` (for example `2026-10-31-trade-tips`). Repeating the request returns the existing post with status 200 and creates nothing, so retries are safe. Use `PATCH` to change a post afterwards.

## Translations

Create the original first, then post the other language with `translationOf` set to its `id` or `externalId`:

```json
{ "language": "en", "translationOf": "2026-10-31-trade-tips", "externalId": "2026-10-31-trade-tips-en", "title": "5 tips for importing from Turkey", "html": "<p>...</p>" }
```

Each article can have one post per language (409 otherwise).

## curl

```bash
curl -X POST https://your-site.example/api/v1/blog/posts \
  -H "Authorization: Bearer bk_xxxxxxxx_..." \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "externalId": "2026-10-31-trade-tips",
    "title": "5 tips for importing from Turkey",
    "excerpt": "Short summary.",
    "category": "import",
    "tags": ["turkey", "import"],
    "content": [
      { "type": "heading", "text": "Introduction", "level": 2 },
      { "type": "paragraph", "html": "<p>First paragraph.</p>" }
    ],
    "status": "draft"
  }'
```

## n8n (HTTP Request node)

- Method `POST`, URL `https://your-site.example/api/v1/blog/posts`
- Authentication: Generic Credential Type > Header Auth, name `Authorization`, value `Bearer bk_xxxxxxxx_...`
- Send Body: JSON, with the payload below

## Claude routine / script payload

```json
{
  "language": "fa",
  "externalId": "2026-10-31-trade-tips",
  "title": "۵ نکته برای واردات از ترکیه",
  "excerpt": "…",
  "category": "import",
  "tags": ["ترکیه", "واردات"],
  "coverImageUrl": "https://example.com/cover.jpg",
  "content": [
    { "type": "heading", "text": "مقدمه", "level": 2 },
    { "type": "paragraph", "html": "<p>…</p>" },
    { "type": "image", "src": "https://…", "alt": "…" }
  ],
  "seo": { "metaDescription": "…" },
  "status": "published"
}
```

With publishing disabled this is saved as a draft and the response carries the downgrade warning.
