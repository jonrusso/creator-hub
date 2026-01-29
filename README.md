# Creator Hub

**Internal QC/QA Platform & Knowledge Base** for Keanu Visuals video production team.

## 🎯 Mission
Centralize video production workflows and ensure asset quality consistency while embodying the "Creators Club" brand ethos: **Learn. Share. Connect.**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure
```
Creator_hub/
├── docs/                       # Documentation & brand guidelines
│   ├── Brand Guide Creators Club.pdf
│   └── SOP_Creator-Hub.pdf
├── extension/                  # Browser extension for Instagram integration
│   ├── background.js
│   ├── content/
│   ├── popup/
│   └── manifest.json
├── public/                     # Static assets
├── src/
│   ├── components/            # Modular UI components
│   │   ├── auth/              # Authentication components
│   │   ├── boards/            # Production & Inspiration boards
│   │   ├── common/            # Shared UI components (GlassCard, Button, etc.)
│   │   ├── workflows/         # Workflow documentation module
│   │   └── TeamModule.jsx     # Team management
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── services/
│   │   ├── mock/              # Mock data for development
│   │   └── supabase/          # Supabase service layer
│   ├── styles/                # Additional stylesheets
│   ├── CreatorHub.jsx         # Main application shell
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles & design tokens
├── supabase/
│   ├── migrations/            # Database schema migrations
│   └── functions/             # Edge functions
├── .env.example               # Environment variables template
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🎨 Brand Identity

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Cyan Blue | `#000e1b` | Main background |
| Onyx | `#0f0f0f` | Cards, sidebar, panels |
| Reddish Orange | `#ff9b4c` | Primary CTAs, highlights |
| Violet | `#8854fc` | Secondary accents |
| White Smoke | `#f4f4f4` | Text, headings |

### Typography
- **Headings**: Questrial, Space Grotesk (fallback for ITC Avant Garde)
- **Body**: Inter, Roboto (fallback for Neue Haas Grotesk)

## 🏗️ Architecture

### Modules

| Module | Description | Features |
|--------|-------------|----------|
| **Workflows** | Documentation database for internal processes | Categories, search, create/edit, admin approval flow, step-by-step guides |
| **Production Board** | Kanban-style project management | Drag-and-drop, stage management, complexity scoring, checklists, activity feed |
| **Inspiration Board** | Visual reference library | Masonry grid, save/unsave, account tracking |
| **Team** | User management (Admin only) | Invite members, role assignment, deactivation |

### Backend
- **Supabase** - PostgreSQL database with Row Level Security
- **Services Layer** - Abstracted data access (works with mock or Supabase)
- **Migrations** - Version-controlled schema changes

### Planned Enhancements
- **Browser Extension** - Instagram content scraping (scaffolding complete)
- **Real-time Updates** - Supabase subscriptions for live collaboration

## 🔧 Tech Stack
- **React 18.3.1** - UI framework
- **Vite 6.0.5** - Build tool & dev server
- **Tailwind CSS 3.4.17** - Utility-first styling
- **Lucide React** - Icon system

## 📖 Documentation
- [Brand Guide](./docs/Brand%20Guide%20Creators%20Club.pdf) - Complete brand guidelines
- [SOP](./docs/SOP_Creator-Hub.pdf) - Standard Operating Procedures

## 🎭 Roles & Permissions
| Role | Workflows | Boards | Team |
|------|-----------|--------|------|
| **Admin** | Full access + Approval | Full access | Manage members |
| **Editor** | Create/Edit | Full access | View only |
| **Designer** | View | Full access | View only |

## ⚙️ Environment Setup

### Environment Variables
Copy `.env.example` to `.env.local` and configure:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup
1. Create a new Supabase project
2. Run migrations in order from `supabase/migrations/`
3. Configure environment variables

## 📝 Development Status

| Component | Status |
|-----------|--------|
| Frontend UI | ✅ Complete |
| Mock Data Layer | ✅ Complete |
| Supabase Schema | ✅ Complete |
| Services Layer | ✅ Complete |
| Browser Extension | 🔄 Scaffolding |

**Current Phase**: Ready for First Deployment 🚀

## 📄 License
Internal use only - Creators Club / Keanu Visuals

---

**Learn. Share. Connect.** ✨
