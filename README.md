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
├── public/                     # Static assets
│   └── assets/
├── src/                        # Application source code
│   ├── CreatorHub.jsx         # Main single-file application
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index.html                 # HTML entry point
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration (brand colors)
├── vite.config.js             # Vite build configuration
└── postcss.config.js          # PostCSS configuration
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

### Current (V1)
- **Authentication Layer**: Role-based access (Admin/Creator)
- **Workflows Module**: Higgsfield Identity Synthesis wizard
- **Production Boards**: Kanban/List views with QA checkboxes
- **Inspiration Boards**: Masonry grid with visual references

### Planned (V2)
- **Workflows**: Multi-entry documentation database
- **Boards**: Production + Inspiration as sub-modules
- **Instagram Integration**: Curator/aggregator for multiple profiles

## 🔧 Tech Stack
- **React 18.3.1** - UI framework
- **Vite 6.0.5** - Build tool & dev server
- **Tailwind CSS 3.4.17** - Utility-first styling
- **Lucide React** - Icon system

## 📖 Documentation
- [Brand Guide](./docs/Brand%20Guide%20Creators%20Club.pdf) - Complete brand guidelines
- [SOP](./docs/SOP_Creator-Hub.pdf) - Standard Operating Procedures

## 🎭 Roles & Permissions
- **Admin**: Full access to all modules, can manage workflows and boards
- **Creator**: Can create/edit workflows, manipulate categories, view all content

## 📝 Development Status
**Current Phase**: Concept/UX Validation  
**Status**: V1 Complete ✅ | V2 Planning 🔄

## 📄 License
Internal use only - Creators Club / Keanu Visuals

---

**Learn. Share. Connect.** ✨
