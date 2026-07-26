# Extractable components

## LanguageSwitcher

- Source: `components/i18n/LanguageSwitcher.tsx`
- Category: layout
- Description: Fixed two-button FR/EN switcher rendered on every route.
- Extractable props: `activeLanguage` (`"fr" | "en"`, default `"fr"`).
- Hardcoded: FR and EN labels, placement, current slate styling.

## Button

- Source: `components/ui/button.tsx`
- Category: basic
- Description: Standard shadcn/Radix button with variants and sizes.
- Extractable props: `variant`, `size`, `disabled`.
- Hardcoded: Tailwind styling and focus behavior.

## Card

- Source: `components/ui/card.tsx`
- Category: basic
- Description: Standard shadcn card composition shared by the gallery and simulation panels.
- Extractable props: none beyond standard HTML class and content slots.
- Hardcoded: semantic surface, border, radius, and spacing classes.
