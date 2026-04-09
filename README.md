# Edubini Stock Planner 2026

Ein modernes, webbasiertes Inventar-Management-System, das speziell für den Edubini Hiring Challenge entwickelt wurde. Diese Applikation ersetzt manuelle Google Sheets durch ein automatisiertes, echtzeitfähiges Dashboard zur Planung von Lagerreichweiten und Nachbestellfristen.

## 🚀 Kernfunktionen

- **Echtzeit-Dashboard**: Übersicht über alle Produkte mit SKU, aktuellem Lagerbestand (Shop + Amazon) und Zulauf.
- **Automatisierte Berechnungen**:
  - **Lagerreichweite (Days of Stock)**: Basierend auf dem 30-Tage-Verbrauchs-Durchschnitt.
  - **Bestellfrist (Order Deadline)**: Automatische Berechnung unter Berücksichtigung der Lead-Times.
  - **Voraussichtlicher Ausverkauf**: Datumsprognose für jedes Produkt.
- **Intelligente Priorisierung**: Farblich markierte Status-Badges (Überfällig, Dringend, Sicher).
- **CRUD-Management**: Einfaches Anlegen, Bearbeiten und Löschen von Produkten und Planungsparametern.
- **Responsive Design**: Optimiert für verschiedene Monitorgrößen (24"-34") und mobile Endgeräte (Sticky Columns).

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Datenbank**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Deployment**: [Vercel](https://vercel.com/)
- **Authentifizierung**: Passwortgeschützter Zugang (Middleware-basiert)

## 📦 Installation & Setup

1. **Repository klonen**:
   ```bash
   git clone <repository-url>
   cd stock-planner
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**:
   Erstellen Sie eine `.env.local` Datei mit folgenden Werten:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   APP_PASSWORD=...
   ```

4. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

5. **Datenbank-Seeding** (Optional):
   ```bash
   npm run seed
   ```

## 👨‍💻 Architektur

Die Anwendung folgt einer modernen Serverless-Architektur. Die Geschäftslogik für die Bestandsberechnungen ist in einem zentralen Modul (`lib/stockMetrics.ts`) gekapselt, um Konsistenz zwischen API und Frontend zu gewährleisten. Die Datenpersistenz erfolgt über Supabase mit sicherem Server-Side Access.

---
Entwickelt im Rahmen des Edubini Hiring Challenge 2026.
