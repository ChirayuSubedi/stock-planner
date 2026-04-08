# 📦 Stockplaner — Edubini Hiring Challenge

> Interaktive Web-App zur Lagerreichweiten-Berechnung, Nachbestellplanung und Out-of-Stock-Risikoerkennung.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

---

## 🎯 Projektübersicht

Diese Anwendung ersetzt das bisherige Google Sheet **„Stockplaner 2026"** durch eine vollständige, gehostete Web-Applikation. Sie bildet die Kernlogik des Re-Order-Planners ab:

- **Produkte verwalten** — Anlegen, Bearbeiten, Löschen mit allen relevanten Datenpunkten
- **Automatische Berechnungen** — Tage Reichweite, Ausverkaufsdatum, Bestellfrist, Nachbestell-Status
- **Visuelles Dashboard** — Sofortiger Überblick über kritische Produkte mit Farbcodierung
- **Passwort-geschützter Zugang** — Einfacher Schutz sensibler Bestandsdaten

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Login   │  │  Dashboard   │  │  Add/Edit     │  │
│  │  Seite   │  │  + Tabelle   │  │  Modal/Drawer │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘  │
└───────┼────────────────┼─────────────────┼──────────┘
        │                │                 │
        ▼                ▼                 ▼
┌─────────────────────────────────────────────────────┐
│              Next.js API Routes (Server)             │
│  POST /api/auth/login     GET  /api/products         │
│  POST /api/auth/logout    POST /api/products         │
│                           PATCH /api/products/[id]   │
│                           DELETE /api/products/[id]  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                    │
│  Tabelle: products                                   │
│  Row Level Security aktiv                            │
└─────────────────────────────────────────────────────┘
```

### Datenfluss

1. Der **Browser** lädt die Dashboard-Seite. Next.js rendert sie serverseitig und holt die Produkte direkt aus Supabase.
2. Die **Berechnungslogik** (`lib/stockMetrics.ts`) läuft clientseitig in React — jede Änderung an den Daten aktualisiert sofort alle berechneten Werte (Reichweite, Termine, Status).
3. Bei CRUD-Operationen sendet der Client Anfragen an die **API Routes**, die über den Service-Role-Key mit Supabase kommunizieren.
4. Die **Middleware** (`middleware.ts`) prüft bei jedem Request, ob ein gültiges Session-Cookie vorhanden ist, und leitet unautorisierte Nutzer zur Login-Seite weiter.

---

## 📊 Berechnungslogik (Anforderung B)

Die zentrale Logik befindet sich in [`lib/stockMetrics.ts`](lib/stockMetrics.ts):

| Kennzahl | Formel |
|---|---|
| **Lagerbestand gesamt** | Shop + Amazon + Unterwegs + In Produktion |
| **Lead Time gesamt** | Produktion + QI + Verladung + Import + Verzollung + Restocking |
| **Tagesverbrauch gesamt** | Daily Usage Shop + Daily Usage Amazon |
| **Tage Reichweite** (Days of Stock) | ⌊ Lagerbestand gesamt ÷ Tagesverbrauch gesamt ⌋ |
| **Ausverkaufsdatum** (Est. Stockout) | Heute + Tage Reichweite |
| **Bestellfrist** (Order Date) | Ausverkaufsdatum − Lead Time gesamt |

### Nachbestell-Status

| Status | Bedingung | Farbe |
|---|---|---|
| 🔴 **Überfällig** | Bestellfrist liegt in der Vergangenheit | Rot |
| 🟡 **Dringend** | Bestellfrist < 10 Tage in der Zukunft | Amber |
| 🟢 **Sicher** | Bestellfrist > 10 Tage in der Zukunft | Grün |

---

## 🛠️ Tech Stack & Entscheidungen

### Frontend (Framework/Library)

**Next.js 14 (App Router) + React 18 + Tailwind CSS**

Next.js wurde gewählt, weil es Server-Side Rendering, API-Routes und Frontend in einem Framework vereint — kein separater Backend-Server nötig. Tailwind CSS ermöglicht schnelle, konsistente Gestaltung direkt im Markup, ohne eine eigene CSS-Architektur aufbauen zu müssen.

### Backend / API

**Next.js API Routes (Serverless Functions)**

Die API-Endpunkte laufen als serverlose Funktionen innerhalb von Next.js. Das eliminiert die Notwendigkeit eines separaten Express/Fastify-Servers und reduziert die Infrastruktur-Komplexität auf ein Minimum. Eingabevalidierung erfolgt serverseitig in den Route-Handlern.

### Datenbank / Persistenz

**Supabase (gehostetes PostgreSQL)**

Supabase bietet eine vollwertige PostgreSQL-Datenbank mit integrierter REST-API, Row Level Security und einem JavaScript-SDK. Damit entfällt das manuelle Aufsetzen einer Datenbank-Infrastruktur. Alle Daten werden serverseitig persistiert und überleben jeden App-Neustart.

### Hosting-Plattform

**Vercel**

Vercel ist die native Hosting-Plattform für Next.js mit Zero-Config-Deployment, automatischen Preview-Deployments für Pull Requests und globalem CDN. Ein einfaches `vercel deploy` genügt.

### Eingesetzte KI-Tools

**Claude (Anthropic) + GitHub Copilot**

Claude wurde für Architektur-Entscheidungen, Code-Reviews und die Implementierung komplexerer Komponenten eingesetzt. GitHub Copilot unterstützte bei der Code-Vervollständigung und beim Schreiben repetitiver Patterns. Jede generierte Zeile wurde verstanden, geprüft und bei Bedarf angepasst.

---

## 📁 Projektstruktur

```
stock-planner/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST — Anmeldung (Passwort → Cookie)
│   │   │   └── logout/route.ts       # POST — Abmeldung (Cookie löschen)
│   │   └── products/
│   │       ├── route.ts              # GET (alle) + POST (anlegen)
│   │       └── [id]/route.ts         # PATCH (bearbeiten) + DELETE (löschen)
│   ├── dashboard/
│   │   ├── page.tsx                  # Server Component — lädt Produkte
│   │   └── loading.tsx               # Ladeindikator
│   ├── login/page.tsx                # Login-Seite
│   ├── layout.tsx                    # Root Layout (Inter-Font, Metadaten)
│   ├── page.tsx                      # Redirect → /dashboard
│   └── globals.css                   # Tailwind + Custom Utilities
├── components/
│   └── dashboard/
│       ├── DashboardClient.tsx       # Haupt-Dashboard mit Statistik-Karten
│       ├── ProductTable.tsx          # Sortierbare, durchsuchbare Tabelle
│       ├── AddProductModal.tsx       # Modal zum Anlegen neuer Produkte
│       ├── EditProductDrawer.tsx     # Slide-Over zum Bearbeiten
│       └── StatusBadge.tsx           # Farbcodierter Status-Badge
├── lib/
│   ├── stockMetrics.ts              # ⭐ Kernlogik: Berechnungen
│   ├── supabase-server.ts           # Supabase Server-Client
│   └── supabase.ts                  # Supabase Browser-Client
├── types/
│   └── product.ts                   # TypeScript-Typen & Interfaces
├── supabase/
│   ├── schema.sql                   # Datenbankschema (DDL)
│   └── seed.sql                     # Schema + Beispieldaten (alles-in-einem)
├── scripts/
│   └── seed.ts                      # Seed-Skript (npm run seed)
├── middleware.ts                     # Auth-Middleware (Cookie-Prüfung)
└── package.json
```

---

## 🚀 Lokale Einrichtung

### Voraussetzungen

- **Node.js** ≥ 18
- **npm** ≥ 9
- Ein **Supabase-Projekt** (kostenlos unter [supabase.com](https://supabase.com))

### 1. Repository klonen

```bash
git clone https://github.com/<dein-username>/stock-planner.git
cd stock-planner
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Kopiere die Beispieldatei und trage deine Supabase-Zugangsdaten ein:

```bash
cp .env.local.example .env.local
```

Öffne `.env.local` und fülle die Werte aus:

```env
# Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key

# Passwort für den App-Zugang
APP_PASSWORD=deinSicheresPasswort
```

### 4. Datenbank einrichten

Öffne den **SQL Editor** in deinem Supabase-Dashboard und führe den Inhalt von [`supabase/seed.sql`](supabase/seed.sql) aus. Diese Datei erstellt die Tabelle, Indizes, Trigger, RLS-Policies und fügt 7 Beispielprodukte ein.

### 5. App starten

```bash
npm run dev
```

Die App läuft unter **http://localhost:3000**. Melde dich mit dem in `APP_PASSWORD` gesetzten Passwort an.

---

## 🌐 Deployment (Vercel)

```bash
# Vercel CLI installieren (falls nicht vorhanden)
npm i -g vercel

# Deployment starten
vercel
```

Setze in den Vercel-Projekteinstellungen unter **Settings → Environment Variables** folgende Variablen:

| Variable | Wert |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Deine Supabase-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dein Anon-Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Dein Service-Role-Key |
| `APP_PASSWORD` | Gewähltes Zugangspasswort |

---

## 📋 Anforderungsabdeckung

| Anforderung | Status | Umsetzung |
|---|---|---|
| **A: Datenerfassung** | ✅ | Vollständiges CRUD über Modal (Anlegen), Drawer (Bearbeiten), Dialog (Löschen) |
| **B: Berechnungslogik** | ✅ | Tage Reichweite, Ausverkaufsdatum, Bestellfrist, Nachbestell-Status mit Farbcodierung |
| **C: Datenpersistenz** | ✅ | Supabase PostgreSQL mit Row Level Security |
| **D: Hosting & Zugang** | ✅ | Vercel-Deployment + Cookie-basierter Passwortschutz |
| **E: Benutzeroberfläche** | ✅ | Aufgeräumtes Dashboard, sortierbare Tabelle, Suchfunktion, responsive Layout |

---

## 🏛️ Architektur-Erläuterung

Die App basiert auf Next.js 14 mit dem App Router und nutzt eine klare Trennung zwischen Server- und Client-Komponenten. Die Dashboard-Seite wird serverseitig gerendert — Produkte werden direkt aus Supabase geladen und als Props an die Client-Komponente übergeben. Die Berechnungslogik (Reichweite, Termine, Status) läuft dann reaktiv im Browser: Jeder Datensatz wird mit den Formeln aus `stockMetrics.ts` angereichert, sodass Änderungen sofort sichtbar sind, ohne einen Server-Roundtrip.

Für CRUD-Operationen kommuniziert der Client über `fetch`-Aufrufe mit den Next.js API Routes, die als schlanke Validierungs- und Weiterleitungsschicht zwischen Frontend und Supabase fungieren. Supabase wurde bewusst mit dem Service-Role-Key angebunden, da die App keine individuellen Benutzerkonten benötigt — der Zugang wird stattdessen über ein einzelnes Passwort gesteuert, das als httpOnly-Cookie gespeichert wird.

Ein bewusster Trade-off war der Verzicht auf eine zusätzliche ORM-Schicht (wie Prisma): Da Supabase bereits ein typsicheres JavaScript-SDK mitbringt und die Datenbankstruktur überschaubar ist, wäre ein ORM unnötiger Overhead gewesen. Ebenso wurde auf clientseitige State-Management-Libraries (Redux, Zustand) verzichtet — React-State mit `useState` und `useMemo` reicht für diese Anwendungsgröße vollkommen aus.

---

## 📄 Lizenz

Dieses Projekt wurde im Rahmen der Edubini Hiring Challenge erstellt.
