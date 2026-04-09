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

## 🚀 Live Demo & Documentation

- **Live Application**: [stock-planner-wheat.vercel.app](https://stock-planner-wheat.vercel.app/)
- **Showcase & Roadmap**: [stock-planner-wheat.vercel.app/submission.html](https://stock-planner-wheat.vercel.app/submission.html)

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Deployment**: [Vercel](https://vercel.com/)
- **Architecture**: AI-Ready Supply Chain Automation

## 🤖 Future Roadmap: AI & Automation

Die nächste Ausbaustufe sieht eine tiefgreifende Integration von KI-Workflows (z.B. via n8n) vor:
- **Smart Alerts**: Automatisierte Benachrichtigungen (Email/Anruf) bei Status "Überfällig".
- **Human-in-the-Loop**: Ein-Klick-Bestätigung zur Freigabe von automatisierten Bestellungen.
- **AI-Ordering**: Intelligente Nachbestellung direkt beim Lieferanten nach Freigabe.

## 👨‍💻 Architektur

Die Anwendung folgt einer modernen Serverless-Architektur. Die Geschäftslogik für die Bestandsberechnungen ist in einem zentralen Modul (`lib/stockMetrics.ts`) gekapselt, um Konsistenz zwischen API und Frontend zu gewährleisten. Die Datenpersistenz erfolgt über Supabase mit sicherem Server-Side Access.

---
**Chirayu Subedi** | [Portfolio](https://chirayusubedi.netlify.app/)
Entwickelt im Rahmen des Edubini Hiring Challenge 2026.
