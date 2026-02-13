# Allox Frontend

Modern Next.js application for browsing and trading private company shares.

## 🚀 Tech Stack

- **Next.js 16.1.6** - React framework with App Router and Turbopack
- **React 18.3.1** - UI library with hooks and server components
- **TypeScript 5.8.3** - Static type checking
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **TanStack Query** - Server state management with automatic caching
- **Radix UI** - Accessible, unstyled component primitives
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Homepage
│   ├── markets/             # Markets listing page
│   └── deal/[slug]/         # Dynamic company detail pages
├── components/
│   ├── ui/                  # Base Radix components
│   ├── Navbar.tsx           # Navigation header
│   ├── CompanyTable.tsx     # Company data table
│   └── ...
├── lib/
│   ├── api.ts               # API client
│   ├── types.ts             # TypeScript definitions
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

For production, update to your deployed backend URL.

## 🎨 Key Features

- **Markets Dashboard** - Browse all available companies with filtering
- **Company Profiles** - Detailed company information and metrics
- **Funding History** - View complete funding rounds
- **Real-time Search** - Filter companies by category
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Theme switching support
- **Loading States** - Smooth UX with proper feedback

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔧 Development

### Adding New Components

Components follow atomic design principles:
- **atoms** - Basic UI elements (in `components/ui/`)
- **molecules** - Composed components (in `components/`)
- **organisms** - Complex components (page-specific)

### API Integration

All API calls go through `lib/api.ts`:

```typescript
import { api } from '@/lib/api';

const { data } = useQuery({
  queryKey: ['companies', page],
  queryFn: () => api.getCompanies(page)
});
```

### Adding Routes

Create new pages in the `app/` directory:

```
app/
└── new-page/
    └── page.tsx
```

Routes are automatically generated based on folder structure.

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy automatically on push to `main`

### Manual Build

```bash
npm run build
npm start
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

## 🔒 License

Private - All rights reserved
