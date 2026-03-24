import { CrownIcon } from '@phosphor-icons/react';

interface SectionDividerProps {
  dark?: boolean;
  className?: string;
}

export default function SectionDivider({ dark = false, className = '' }: SectionDividerProps) {
  return (
    <div className={`section-divider ${className}`}>
      <div
        className="flex-1 h-px"
        style={{ background: dark ? 'rgba(200,160,74,0.4)' : 'rgba(184,134,11,0.5)' }}
      />
      <CrownIcon
        size={16}
        weight="fill"
        className={dark ? 'text-gold-light' : 'text-gold-primary'}
      />
      <div
        className="flex-1 h-px"
        style={{ background: dark ? 'rgba(200,160,74,0.4)' : 'rgba(184,134,11,0.5)' }}
      />
    </div>
  );
}
