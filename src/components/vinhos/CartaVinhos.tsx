import { useState, useMemo, useTransition } from 'react';
import { motion } from 'framer-motion';
import { WineIcon, StarIcon, WhatsappLogoIcon, CrownIcon, ForkKnifeIcon } from '@phosphor-icons/react';
import { WINES, COUNTRIES } from '../../data/wines';
import SectionDivider from '../layout/SectionDivider';
import WineCard, { FlagImg } from './WineCard';
import HarmonizacoesModal from './HarmonizacoesModal';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

type WineTypeKey = 'all' | 'tinto' | 'branco' | 'rose' | 'espumante' | 'porto';

const WINE_TYPES: { key: WineTypeKey; label: string; keyword: string; dot: string }[] = [
  { key: 'all',       label: 'Todos',      keyword: '',          dot: 'bg-cream/30' },
  { key: 'tinto',     label: 'Tinto',      keyword: 'Tinto',     dot: 'bg-bordeaux' },
  { key: 'branco',    label: 'Branco',     keyword: 'Branco',    dot: 'bg-cream/70' },
  { key: 'rose',      label: 'Rosé',       keyword: 'Rosé',      dot: 'bg-rose-300' },
  { key: 'espumante', label: 'Espumante',  keyword: 'Espumante', dot: 'bg-gold-light' },
  { key: 'porto',     label: 'Porto',      keyword: 'Porto',     dot: 'bg-purple-700' },
];

export default function CartaVinhos() {
  const [activeCountry, setActiveCountry] = useState<string>('ALL');
  const [activeTier, setActiveTier] = useState<'all' | 'dia' | 'especial'>('all');
  const [activeType, setActiveType] = useState<WineTypeKey>('all');
  const [isPending, startTransition] = useTransition();
  const [showHarmonizacoes, setShowHarmonizacoes] = useState(false);

  const filtered = useMemo(() => {
    return WINES.filter((w) => {
      const countryMatch = activeCountry === 'ALL' || w.countryCode === activeCountry;
      const tierMatch = activeTier === 'all' || w.tier === activeTier;
      const typeEntry = WINE_TYPES.find((t) => t.key === activeType);
      const typeMatch = activeType === 'all' || (typeEntry ? w.type.includes(typeEntry.keyword) : true);
      return countryMatch && tierMatch && typeMatch;
    });
  }, [activeCountry, activeTier, activeType]);

  const countriesInUse = useMemo(() => {
    const codes = new Set(WINES.map((w) => w.countryCode));
    return COUNTRIES.filter((c) => codes.has(c.code));
  }, []);

  return (
    <section
      id="vinhos"
      className="py-24 px-6 lg:px-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E0808 0%, #0F0404 100%)' }}
    >
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <WineIcon size={18} weight="light" className="text-gold-light" />
              <p className="type-overline text-gold-light/70 text-[11px]">Curadoria de terroir</p>
            </div>
            <h2 className="type-h1 text-cream">
              Carta de<br />
              <span className="font-subtitle italic font-normal text-gold-light">Vinhos</span>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-5">
            <p className="type-body text-cream/50 text-sm leading-relaxed">
              Mais de 70 rótulos selecionados de Portugal, Argentina, Chile, Itália, França e mais.
              Do cotidiano ao reserva especial.
            </p>
            <button
              onClick={() => setShowHarmonizacoes(true)}
              className="flex items-center gap-2 border border-gold-light/40 text-gold-light hover:bg-gold-light/10 hover:border-gold-light/70 transition-all duration-300 type-overline text-[11px] px-5 py-2.5 rounded-full"
            >
              <ForkKnifeIcon size={13} weight="light" />
              Harmonização
            </button>
          </div>
        </motion.div>

        <SectionDivider dark className="mb-10" />

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-3 mb-10"
        >
          {/* Tier filter */}
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'dia', 'especial'] as const).map((tier) => {
              const labels = { all: 'Todos', dia: 'Dia a dia', especial: 'Especiais' };
              return (
                <button
                  key={tier}
                  onClick={() => startTransition(() => setActiveTier(tier))}
                  className={`type-overline text-[10px] px-4 py-2 rounded-full border transition-all duration-300 ${
                    activeTier === tier
                      ? 'bg-gradient-gold text-dark-warm border-transparent'
                      : 'border-gold-light/30 text-cream/60 hover:border-gold-light/60 hover:text-cream/90'
                  }`}
                >
                  {tier === 'especial' && <StarIcon size={8} weight="fill" className="inline mr-1 mb-0.5" />}
                  {labels[tier]}
                </button>
              );
            })}
          </div>

          {/* Wine type filter */}
          <div className="flex flex-wrap items-center gap-2">
            {WINE_TYPES.map(({ key, label, dot }) => (
              <button
                key={key}
                onClick={() => startTransition(() => setActiveType(key))}
                className={`flex items-center gap-1.5 type-overline text-[10px] px-4 py-2 rounded-full border transition-all duration-300 ${
                  activeType === key
                    ? 'bg-white/10 border-white/30 text-cream'
                    : 'border-white/10 text-cream/50 hover:border-white/20 hover:text-cream/75'
                }`}
              >
                {key !== 'all' && (
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                )}
                {label}
              </button>
            ))}
          </div>

          {/* Country filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => startTransition(() => setActiveCountry('ALL'))}
              className={`flex-shrink-0 type-overline text-[10px] px-4 py-2 rounded-full border transition-all duration-300 ${
                activeCountry === 'ALL'
                  ? 'bg-cream/15 border-cream/40 text-cream'
                  : 'border-cream/20 text-cream/50 hover:border-cream/40 hover:text-cream/70'
              }`}
            >
              Todos os países
            </button>
            {countriesInUse.map((country) => (
              <button
                key={country.code}
                onClick={() => startTransition(() => setActiveCountry(country.code))}
                className={`flex-shrink-0 flex items-center gap-2 type-overline text-[10px] px-4 py-2 rounded-full border transition-all duration-300 ${
                  activeCountry === country.code
                    ? 'bg-cream/15 border-cream/40 text-cream'
                    : 'border-cream/20 text-cream/50 hover:border-cream/40 hover:text-cream/70'
                }`}
              >
                <FlagImg code={country.code} country={country.name} />
                {country.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <motion.p
          key={`${activeCountry}-${activeTier}-${activeType}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="type-caption text-cream/40 not-italic mb-6 text-sm"
        >
          {filtered.length} {filtered.length === 1 ? 'rótulo' : 'rótulos'} encontrados
        </motion.p>

        {/* Wine grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-150"
          style={{ opacity: isPending ? 0.5 : 1 }}
        >
          {filtered.map((wine, i) => (
            <WineCard key={`${wine.name}-${wine.countryCode}`} wine={wine} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-1.5 border border-gold-light/30 rounded-[2rem] bg-bordeaux-deep/50">
            <div className="px-6 py-6 sm:px-10 sm:py-8 rounded-[calc(2rem-0.375rem)] flex flex-col items-center gap-5">
              <CrownIcon size={24} weight="fill" className="text-gold-primary" />
              <div className="text-center">
                <p className="type-overline text-gold-light text-[11px] mb-2">Não encontrou seu rótulo?</p>
                <h3 className="type-h3 text-cream">Consulte nossa carta completa</h3>
              </div>
              <a
                href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20a%20carta%20completa%20de%20vinhos."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold"
              >
                <WhatsappLogoIcon size={14} weight="fill" />
                Solicitar via WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <HarmonizacoesModal isOpen={showHarmonizacoes} onClose={() => setShowHarmonizacoes(false)} />
  );
}
