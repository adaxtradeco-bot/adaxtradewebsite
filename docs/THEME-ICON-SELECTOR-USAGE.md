# استفاده از ThemeSelector و IconSelector در PropertyPanel

## مثال 1: استفاده از ThemeSelector

```typescript
import { ThemeSelector } from '@/components/ui/ThemeSelector';

// در PropertyPanel
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Color Theme
  </label>
  <ThemeSelector
    value={section.data.themeId}
    onChange={(themeId) => {
      onUpdate({
        data: {
          ...section.data,
          themeId,
          customBackground: '', // پاک کردن custom
          customTitleGradientFrom: '',
          customTitleGradientTo: ''
        }
      });
    }}
    onCustom={() => {
      // نمایش فیلدهای custom gradient
      setShowCustomGradient(true);
    }}
  />
</div>
```

## مثال 2: استفاده از IconSelector

```typescript
import { IconSelector } from '@/components/ui/IconSelector';

// برای یک آیکون ساده
<IconSelector
  value={section.data.placeholderIconConfig}
  emojiValue={section.data.placeholderIcon}
  onChange={(iconConfig, emoji) => {
    onUpdate({
      data: {
        ...section.data,
        placeholderIconConfig: iconConfig,
        placeholderIcon: emoji || ''
      }
    });
  }}
  label="Placeholder Icon"
  allowEmoji={true}
/>
```

## مثال 3: استفاده برای آرایه (Cards)

```typescript
// برای cards[0].icon
<IconSelector
  value={section.data.cards[0]?.iconConfig}
  emojiValue={section.data.cards[0]?.icon}
  onChange={(iconConfig, emoji) => {
    const newCards = [...section.data.cards];
    newCards[0] = {
      ...newCards[0],
      iconConfig,
      icon: emoji || ''
    };
    onUpdate({
      data: {
        ...section.data,
        cards: newCards
      }
    });
  }}
  label={`Card ${0 + 1} Icon`}
/>
```

## مثال کامل: ProductHero PropertyPanel

```typescript
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { IconSelector } from '@/components/ui/IconSelector';

function ProductHeroPropertyPanel({ section, onUpdate }) {
  const [showCustomGradient, setShowCustomGradient] = useState(false);

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">🎨 Color Theme</h3>
        <ThemeSelector
          value={section.data.themeId}
          onChange={(themeId) => {
            onUpdate({
              data: {
                ...section.data,
                themeId,
                customBackground: '',
                customTitleGradientFrom: '',
                customTitleGradientTo: ''
              }
            });
            setShowCustomGradient(false);
          }}
          onCustom={() => setShowCustomGradient(true)}
        />

        {showCustomGradient && (
          <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="text"
              placeholder="Custom Background (Tailwind classes)"
              value={section.data.customBackground || ''}
              onChange={(e) => onUpdate({
                data: { ...section.data, customBackground: e.target.value, themeId: '' }
              })}
              className="w-full px-2 py-1 text-xs border rounded"
            />
            <input
              type="text"
              placeholder="Title Gradient From (e.g., from-rose-500)"
              value={section.data.customTitleGradientFrom || ''}
              onChange={(e) => onUpdate({
                data: { ...section.data, customTitleGradientFrom: e.target.value }
              })}
              className="w-full px-2 py-1 text-xs border rounded"
            />
            <input
              type="text"
              placeholder="Title Gradient To (e.g., to-fuchsia-500)"
              value={section.data.customTitleGradientTo || ''}
              onChange={(e) => onUpdate({
                data: { ...section.data, customTitleGradientTo: e.target.value }
              })}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
        )}
      </div>

      {/* Placeholder Icon */}
      {section.data.rightContentType === 'placeholder' && (
        <IconSelector
          value={section.data.placeholderIconConfig}
          emojiValue={section.data.placeholderIcon}
          onChange={(iconConfig, emoji) => {
            onUpdate({
              data: {
                ...section.data,
                placeholderIconConfig: iconConfig,
                placeholderIcon: emoji || ''
              }
            });
          }}
          label="Placeholder Icon"
        />
      )}

      {/* Cards Icons */}
      {section.data.rightContentType === 'cards' && section.data.cards?.map((card, index) => (
        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Card {index + 1}</h4>
          <IconSelector
            value={card.iconConfig}
            emojiValue={card.icon}
            onChange={(iconConfig, emoji) => {
              const newCards = [...section.data.cards];
              newCards[index] = {
                ...newCards[index],
                iconConfig,
                icon: emoji || ''
              };
              onUpdate({
                data: { ...section.data, cards: newCards }
              });
            }}
            label="Icon"
          />
        </div>
      ))}
    </div>
  );
}
```

## نکات مهم

### ThemeSelector
- خودکار تمام تمها رو نمایش میده
- پیشنمایش رنگها
- دکمه Custom برای gradient سفارشی
- نمایش تم انتخاب شده

### IconSelector
- دو حالت: Emoji یا Font Awesome
- پیشنمایش زنده
- تنظیمات کامل Font Awesome (type, size, color)
- UI ساده و کاربرپسند

### بهروزرسانی JSON
هر دو کامپوننت با `onChange` کار میکنن که JSON رو بهروزرسانی میکنه:

```typescript
onChange={(value) => {
  onUpdate({
    data: {
      ...section.data,
      fieldName: value
    }
  });
}}
```
