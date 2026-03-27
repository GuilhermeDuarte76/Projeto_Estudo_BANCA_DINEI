import { motion } from 'framer-motion';
import { WhatsappLogoIcon, CrownIcon, UsersIcon, TrayIcon, ListChecksIcon } from '@phosphor-icons/react';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const STEPS = [
  {
    icon: UsersIcon,
    title: 'Quantidade de pessoas',
    desc: 'Informe quantas pessoas serão servidas para dimensionarmos a tábua ideal.',
  },
  {
    icon: TrayIcon,
    title: 'Tipo de bandeja',
    desc: 'Isopor tradicional incluso. Grazing tables disponíveis por valor adicional.',
  },
  {
    icon: ListChecksIcon,
    title: 'Produtos do catálogo',
    desc: 'Escolha queijos, embutidos, frutas, pastas e acompanhamentos do nosso catálogo.',
  },
];

export default function MonteSuaTabua() {
  return (
    <section
      id="monte-tabua"
      className="relative py-24 px-6 lg:px-16 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A0A00 0%, #3A1A00 60%, #8B1A1A 100%)' }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px',
        }}
      />

      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.06) 0%, transparent 70%)', transform: 'translate(40%, -50%)' }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-col gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <CrownIcon size={20} weight="fill" className="text-gold-primary" />
                <p className="type-overline text-gold-light/70 text-[11px]">Personalizado para você</p>
              </div>
              <h2 className="type-h1 text-cream leading-tight">
                Monte sua<br />
                <span className="font-subtitle italic font-normal text-gold-light">Tábua Perfeita</span>
              </h2>
            </div>

            <p className="type-body text-cream/60 leading-relaxed max-w-[42ch]">
              Escolha cada detalhe — dos queijos aos embutidos, das frutas às geleias.
              Tábuas artesanais montadas com atenção visual para qualquer ocasião.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Vi%20as%20t%C3%A1buas%20no%20site%20da%20Banca%20do%20Dinei%20e%20gostaria%20de%20montar%20uma%20t%C3%A1bua%20personalizada."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-gold active:scale-[0.98] text-sm"
              >
                <WhatsappLogoIcon size={18} weight="fill" />
                Solicitar orçamento
                <span className="w-7 h-7 rounded-full bg-dark-warm/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <WhatsappLogoIcon size={12} weight="fill" />
                </span>
              </a>

              <a
                href="tel:+553432122099"
                className="flex items-center justify-center gap-2 border border-cream/20 text-cream/70 font-body font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-full transition-all duration-300 hover:border-cream/50 hover:text-cream"
              >
                (34) 3212-2099
              </a>
            </div>

            <div className="pt-4 border-t border-cream/10">
              <p className="type-caption text-cream/40 not-italic text-xs leading-relaxed">
                Rua Niterói, 924, Loja 1 — Bairro Aparecida<br />
                Uberlândia — MG
              </p>
            </div>
          </motion.div>

          {/* Right: Steps */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="flex flex-col gap-4"
          >
            <p className="type-overline text-gold-primary/70 text-[10px] mb-4">Como funciona</p>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: EASE }}
                  className="group"
                >
                  <div className="p-1 border border-gold-primary/20 rounded-2xl hover:border-gold-primary/40 transition-all duration-400">
                    <div
                      className="flex items-start gap-5 p-6 rounded-[calc(0.75rem-0.25rem)] bg-cream/5 hover:bg-cream/8 transition-colors duration-400"
                      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl border border-gold-primary/30 flex items-center justify-center bg-gold-primary/10">
                          <Icon size={18} weight="light" className="text-gold-light" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="type-overline text-gold-primary/50 text-[9px]">
                            0{i + 1}
                          </span>
                          <h4 className="font-body font-bold text-cream text-sm">{step.title}</h4>
                        </div>
                        <p className="type-body text-cream/50 text-xs leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
