# MoneyLog Architecture & Style Guide

## Codebase Structure
The project uses Expo Router and Nativewind (Tailwind CSS) for routing and styling.

```
src/
├── app/                  # Expo Router App Directory
│   ├── (app)/            # Authenticated layout stack (Tabs)
│   │   ├── _layout.tsx   # Configures Bottom Tabs and hides sub-screens
│   │   ├── index.tsx     # Home Dashboard
│   │   ├── accounts.tsx  # Multi-Account Tab
│   │   ├── add.tsx       # Add Transaction Tab
│   │   ├── budget.tsx    # Budget Tab
│   │   ├── more.tsx      # Settings/Profile Tab
│   │   └── ...           # Dynamic routes (transaction/[id].tsx, etc.)
│   ├── _layout.tsx       # Root layout, auth state provider
│   └── index.tsx         # Login/Splash Screen
├── components/           # Reusable UI Components
│   ├── common/           # Generic components (Header, TabIcon)
│   ├── cards/            # Reusable shared card components (TransactionCard, etc.)
│   ├── homepage/         # Dashboard specific modules
│   └── accounts/         # Accounts specific modules
├── data/                 # Data sources
│   └── mockData.ts       # Centralized mock database for MVP
└── store/                # Global State Management
    └── authStore.ts      # Zustand store for authentication
```

## Consistency Guidelines (DRY Principle)
- **Shared Data**: Never hardcode array data directly into UI components. Data should flow from `src/data/mockData.ts` (or the backend/Zustand store in the future).
- **Shared UI Cards**: If a list item (like a Transaction or Bill) appears in multiple places (e.g., Home Dashboard and "See All" lists), its UI MUST be extracted into a shared component inside `src/components/cards/`.
- **Navigation Bounds**: Shared Cards must inherently wrap themselves in a `TouchableOpacity` linking to their respective details page (`/[id].tsx`). This ensures they remain interactive regardless of where they are rendered.
- **Limit Previews**: To show a preview on a dashboard, import the shared data, use `.slice(0, N)`, and map over it using the shared card component.

## Styling (Nativewind)
- Use standard Tailwind utility classes.
- Access custom theme colors defined in `tailwind.config.js` (e.g., `text-primary`, `bg-background`, `text-textMuted`).
- Avoid inline styles (`style={{}}`) unless dealing with dynamic layout calculations (like `paddingTop: insets.top`).
