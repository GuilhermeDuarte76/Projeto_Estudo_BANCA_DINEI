import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListIcon, XIcon, WhatsappLogoIcon } from '@phosphor-icons/react';
import logo from '../assets/logo.png';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const NAV_LINKS = [
  { label: 'Início', href: '#hero' },
  { label: 'Tábuas', href: '#tabuas' },
  { label: 'Vinhos', href: '#vinhos' },
  { label: 'Harmonizações', href: '#harmonizacoes' },
  { label: 'Louvada Cervejaria', href: '#cervejaria-louvada' },
  { label: 'Contato', href: '#contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bloqueia scroll do body quando menu está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLink = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Pill Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 px-4 py-2.5 md:px-6 md:py-3 rounded-full flex items-center gap-3 md:gap-4 transition-all duration-500 ${
          scrolled
            ? 'bg-dark-warm/90 backdrop-blur-xl border border-gold-primary/30 shadow-gold'
            : 'bg-dark-warm/70 backdrop-blur-md border border-gold-primary/20'
        }`}
        style={{ maxWidth: '960px' }}
      >
        {/* Logo mark */}
        <button
          onClick={() => handleLink('#hero')}
          className="flex items-center flex-shrink-0 group"
          aria-label="Voltar ao início"
        >
          <img
            src={logo}
            alt="Banca do Dinei"
            className="h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLink(link.href)}
              className="type-overline text-cream/70 hover:text-gold-light transition-colors duration-300 hover:-translate-y-px"
            >
              {link.label}
            </button>
          ))}

          {/* CTA WhatsApp — desktop */}
          <a
            href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold flex-shrink-0"
          >
            <WhatsappLogoIcon size={14} weight="fill" />
            Pedido
          </a>
        </div>

        {/* Tagline — mobile center */}
        <div className="md:hidden flex-1 flex justify-center">
          <span className="type-overline text-gold-light/60 text-[9px] tracking-widest">
            Delicatessen Premium
          </span>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-full border border-gold-primary/30 text-cream/80 hover:border-gold-primary/70 hover:text-gold-light transition-all duration-300"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <AnimatePresence mode="wait">
            {menuOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <XIcon size={15} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <ListIcon size={15} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop — fecha ao clicar fora */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-40 bg-dark-warm/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            {/* Painel lateral */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.48, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 z-[45] w-[82vw] max-w-[320px] bg-dark-warm flex flex-col border-l border-gold-primary/20"
            >
              {/* Cabeçalho do painel */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gold-primary/15">
                <img src={logo} alt="Banca do Dinei" className="h-8 w-auto opacity-90" />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-300"
                >
                  <XIcon size={15} />
                </button>
              </div>

              {/* Links de navegação */}
              <nav className="flex-1 px-6 pt-6 pb-2 flex flex-col overflow-y-auto">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 28 }}
                    transition={{ delay: 0.08 + i * 0.07, duration: 0.38, ease: EASE }}
                    className="border-b border-gold-primary/10 last:border-0"
                  >
                    <button
                      onClick={() => handleLink(link.href)}
                      className="group w-full flex items-center gap-4 py-5 text-left"
                    >
                      {/* Número */}
                      <span className="type-overline text-[10px] text-gold-primary/35 group-hover:text-gold-primary/80 transition-colors duration-300 w-5 shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* Label */}
                      <span className="font-display font-bold text-[1.3rem] leading-none text-cream/75 group-hover:text-gold-light transition-colors duration-300 tracking-wide">
                        {link.label}
                      </span>
                      {/* Seta */}
                      <span className="ml-auto text-base text-gold-primary/0 group-hover:text-gold-primary/60 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                        →
                      </span>
                    </button>
                  </motion.div>
                ))}
              </nav>

              {/* Rodapé do painel */}
              <div className="px-6 py-6 border-t border-gold-primary/15 space-y-3">
                <motion.a
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ delay: 0.46, duration: 0.38 }}
                  href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300 hover:shadow-gold"
                >
                  <WhatsappLogoIcon size={15} weight="fill" />
                  Fazer Pedido
                </motion.a>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.54, duration: 0.38 }}
                  className="text-center type-overline text-[9px] text-cream/20 tracking-widest"
                >
                  Banca do Dinei · Uberlândia
                </motion.p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
