# Pattern: Prevent Unwanted Form Refresh in Builder

## Problem
دکمههای داخل فرمها (مثل toggle buttons) باعث refresh شدن صفحه میشدند.

## Root Cause
1. دکمههای داخل `<form>` بدون `type="button"` به صورت پیشفرض `type="submit"` هستند
2. کلیک روی submit button باعث submit شدن فرم و refresh صفحه میشه

## Solution Pattern

### ✅ همیشه برای دکمههای غیر-submit:

```tsx
<button
  type="button"  // ← CRITICAL: جلوگیری از submit
  onClick={(e) => {
    e.preventDefault();      // ← اضافی برای اطمینان
    e.stopPropagation();     // ← جلوگیری از bubble up
    // your logic here
  }}
>
  Button Text
</button>
```

### ❌ اشتباه (باعث refresh میشه):

```tsx
<button onClick={() => doSomething()}>
  Button Text
</button>
```

## Applied To

### 1. PropertyPanel.tsx - Toggle Buttons
```tsx
// Edit Mode Toggle (Visual/JSON)
<button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditMode('visual');
  }}
>
  🎨 Visual
</button>
```

### 2. MediaBrowser Pattern
- MediaBrowser حالا در سطح PageBuilder.tsx قرار داره (خارج از PropertyPanel)
- از custom event استفاده میکنه: `window.dispatchEvent(new CustomEvent('openMediaBrowser'))`
- این باعث میشه MediaBrowser مستقل از PropertyPanel باز بشه و فضای کافی داشته باشه

## Rules for All Future Code

### در PageBuilder و همه کامپوننتهای Admin:

1. **همه دکمهها داخل form باید `type="button"` داشته باشند** (مگر اینکه واقعاً submit button باشند)

2. **برای دکمههای toggle/switch همیشه:**
   ```tsx
   type="button"
   onClick={(e) => {
     e.preventDefault();
     e.stopPropagation();
     // logic
   }}
   ```

3. **برای دکمههای که modal/dialog باز میکنند:**
   ```tsx
   type="button"
   onClick={(e) => {
     e.preventDefault();
     const event = new CustomEvent('openSomething', { detail: {...} });
     window.dispatchEvent(event);
   }}
   ```

4. **فقط دکمههای Save/Submit میتونند `type="submit"` داشته باشند**

## Testing Checklist

قبل از commit، این موارد رو چک کن:

- [ ] همه toggle buttons دارای `type="button"` هستند
- [ ] کلیک روی هیچ دکمهای باعث refresh نمیشه
- [ ] Modal/Dialog ها به صورت مستقل باز میشن (نه داخل sidebar)
- [ ] هیچ console error مربوط به form submission نیست

## Related Files

- `src/components/admin/PageBuilder/PropertyPanel.tsx`
- `src/components/admin/PageBuilder/PageBuilder.tsx`
- `src/components/admin/PageBuilder/MediaBrowser.tsx`

## Date Applied
2025-01-XX

## Status
✅ Implemented and documented
