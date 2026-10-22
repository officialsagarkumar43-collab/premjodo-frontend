# Prem Jode Frontend - Dating & Connection Platform ❤️

A modern, high-performance dating platform built with **Next.js 16 (App Router)**, **JavaScript**, **Tailwind CSS 4**, and **Google Fonts**.

## 🌟 Key Features

- **Multi-Language Support (6 Languages)**:
  - English, हिन्दी (Hindi), ਪੰਜਾਬੀ (Punjabi), भोजपुरी (Bhojpuri), मैथिली (Maithili), తెలుగు (Telugu)
- **Tinder-Style Authentication Flow (`AuthModal.jsx`)**:
  - 3-step authentication (Get Started -> What's your email -> 6-digit OTP code verification)
- **Interactive User Portal (`/user`)**:
  - Card discovery swipe deck (Like, Pass, Superlike), Recent Matches list, User Profile & Preferences
- **Executive Dating Admin Portal (`/admin`)**:
  - Live swipers & match conversion analytics, Selfie photo verification queue, Catfish moderation
- **Modern Typography Design**:
  - `Roboto Slab` for iconic hero branding (*"It starts with a swipe.™"*)
  - `Poppins` with utility classes (`poppins-bold`, `poppins-semibold`, `poppins-black`)
  - `Plus Jakarta Sans` for clean, readable body & chat UI

---

## 🛠️ Build & Development Commands

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Create Production Build
```bash
npm run build
```
*(Or double-click `build.bat` on Windows)*

### 3. Start Production Server
```bash
npm run start
```
Launches the optimized production server on [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── page.jsx                    # Root Dating Landing Page
│   ├── layout.jsx                  # Root Layout with Fonts & LanguageProvider
│   ├── globals.css                 # Global styles, typography & font classes
│   │
│   ├── user/                       # User Portal
│   │   ├── layout.jsx              # User Nav Layout
│   │   ├── page.jsx                # Swipe Deck & Feed (/user)
│   │   ├── matches/page.jsx        # Matches & Chat (/user/matches)
│   │   └── profile/page.jsx        # Dating Profile (/user/profile)
│   │
│   └── admin/                      # Admin Command Center
│       ├── layout.jsx              # Admin Sidebar Layout
│       ├── page.jsx                # Dating Dashboard Overview (/admin)
│       ├── users/page.jsx          # Daters & Profile Management (/admin/users)
│       └── analytics/page.jsx      # Swiping & Match Conversion Analytics (/admin/analytics)
│
├── components/
│   ├── common/                     # Shared UI (Navbar, Footer, Button, Logo, AuthModal, LanguageModal)
│   ├── user/                       # User UI (SwipeCard, MatchesList, UserNav)
│   └── admin/                      # Admin UI (AdminSidebar, AdminHeader, StatsOverview, UserManagementTable)
│
├── context/
│   └── LanguageContext.jsx         # Multi-language Provider & Hook
│
└── lib/
    ├── common/                     # Utility helpers & translations
    ├── user/                       # Dating profiles mock data
    └── admin/                      # Dating admin metrics mock data
```
