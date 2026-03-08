# Studio Insight - Next.js 15 Setup

Een schone Next.js 15 setup met App Router, Tailwind CSS en donker thema.

## 🚀 Features

- **Next.js 15** met App Router
- **TypeScript** voor type safety
- **Tailwind CSS** voor styling
- **Donker thema** met Slate kleuren
- **Inter font** via Google Fonts
- **ESLint** voor code kwaliteit

## 📁 Projectstructuur

```
src/
├── app/
│   ├── globals.css      # Global styles met Tailwind
│   ├── layout.tsx       # Root layout met donker thema
│   └── page.tsx         # Homepage
├── components/
│   └── Header.tsx       # Header component
└── lib/
    └── utils.ts         # Utility functions
```

## 🎨 Design System

### Kleuren
- **Achtergrond**: `#0f172a` (slate-900)
- **Tekst**: `#e2e8f0` (slate-100)
- **Primair**: `#059669` (emerald-600)
- **Accent**: `#22d3ee` (cyan-400)

### Component Classes
- `.btn-primary` - Primaire groene knop
- `.btn-secondary` - Secundaire grijze knop
- `.input-field` - Input veld styling
- `.card` - Card container

## 🛠 Development

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Build voor productie
npm run build

# Start productie server
npm run start

# Lint code
npm run lint
```

## 📱 Responsive Design

De setup is volledig responsive en werkt op:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Customization

### Kleuren aanpassen
Bewerk `tailwind.config.ts` om de kleuren te wijzigen:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Jouw kleuren hier
      }
    }
  }
}
```

### Nieuwe componenten
Maak nieuwe componenten in `src/components/`:

```typescript
// src/components/MyComponent.tsx
export default function MyComponent() {
  return (
    <div className="card">
      <h2>Mijn Component</h2>
    </div>
  );
}
```

### Utility functions
Voeg utility functions toe in `src/lib/utils.ts`:

```typescript
export function myUtilityFunction() {
  // Jouw code hier
}
```

## 🚀 Deployment

Deze setup is klaar voor deployment op:
- **Vercel** (aanbevolen)
- **Netlify**
- **Railway**
- **Docker**

## 📄 License

MIT License - vrij te gebruiken voor persoonlijke en commerciële projecten.