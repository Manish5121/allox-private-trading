import { cn } from '@/lib/utils';
import { Category } from '@/lib/types';

interface CategoryPillProps {
  category: Category | 'All';
  active: boolean;
  onClick: () => void;
}

const categoryStyles: Record<string, string> = {
  All: 'bg-accent text-accent-foreground',
  AI: 'bg-tag-ai-bg text-tag-ai',
  Fintech: 'bg-tag-fintech-bg text-tag-fintech',
  Enterprise: 'bg-tag-enterprise-bg text-tag-enterprise',
  Space: 'bg-tag-space-bg text-tag-space',
  Consumer: 'bg-tag-consumer-bg text-tag-consumer',
  Crypto: 'bg-tag-crypto-bg text-tag-crypto',
  Health: 'bg-tag-health-bg text-tag-health',
};

export function CategoryPill({ category, active, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
        active
          ? categoryStyles[category] || 'bg-primary text-primary-foreground'
          : 'bg-secondary text-muted-foreground hover:bg-accent'
      )}
    >
      {category === 'All' ? 'All Markets' : category}
    </button>
  );
}

export function SectorTag({ sector }: { sector: Category }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', categoryStyles[sector])}>
      {sector}
    </span>
  );
}
