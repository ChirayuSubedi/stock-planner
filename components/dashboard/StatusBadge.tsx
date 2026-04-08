import type { NachbestellStatus } from '@/types/product'

const stile: Record<NachbestellStatus, { badge: string; punkt: string; icon: string }> = {
  Überfällig: {
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    punkt: 'bg-red-500',
    icon:  'text-red-500',
  },
  Dringend: {
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    punkt: 'bg-amber-500',
    icon:  'text-amber-500',
  },
  Sicher: {
    badge: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    punkt: 'bg-green-500',
    icon:  'text-green-500',
  },
}

export default function StatusBadge({ status }: { status: NachbestellStatus }) {
  const s = stile[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${s.badge}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.punkt}`} />
      {status}
    </span>
  )
}
