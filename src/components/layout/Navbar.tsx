import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ListIcon, XIcon, ShoppingCartIcon, WhatsappLogoIcon, CaretDownIcon, HouseSimpleIcon } from '@phosphor-icons/react';
import logo from '../../assets/logo.png';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

type SubLink = { label: string; href: string };
type NavLink = { label: string; href: string; children?: SubLink[] };

const BEBIDAS_SUBITENS: SubLink[] = [
  { label: 'Não Alcoólicos', href: '/bebidas/nao-alcoolicos' },
  { label: 'Cachaças',       href: '/bebidas/cachaca' },
  { label: 'Vinhos',         href: '/bebidas/vinhos' },
  { label: 'Cervejas',       href: '/bebidas/cerveja' },
];

const NAV_LINKS: NavLink[] = [
  { label: 'Frios',             href: '/frios' },
  { label: 'Tábuas',            href: '/tabuas' },
  { label: 'Doces',             href: '/doces' },
  { label: 'Grãos e Castanhas', href: '/graos-castanhas' },
  { label: 'Bebidas',           href: '/bebidas', children: BEBIDAS_SUBITENS },
];

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [bebidasOpen, setBebidasOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setBebidasOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLink = (href: string) => {
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate(href);
  };

  const handleLogoClick = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={`fixed top-4 left-4 right-4 md:left-0 md:right-0 md:mx-auto z-50 px-4 py-2.5 md:px-6 md:py-3 rounded-full flex items-center gap-3 md:gap-4 transition-all duration-500 ${
          scrolled
            ? 'bg-dark-warm/90 backdrop-blur-xl border border-gold-primary/30 shadow-gold'
            : 'bg-dark-warm/70 backdrop-blur-md border border-gold-primary/20'
        }`}
        style={{ maxWidth: '960px' }}
      >
        {/* Logo */}
        <button
          onClick={handleLogoClick}
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
        <div className="hidden md:flex items-center gap-4 mx-auto">
          <AnimatePresence>
            {location.pathname !== '/' && (
              <motion.div
                key="home-btn"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex items-center gap-4 overflow-hidden"
              >
                <motion.button
                  whileHover={{ y: -1 }}
                  onClick={() => navigate('/')}
                  title="Voltar para o início"
                  className="text-cream/50 hover:text-gold-light transition-colors duration-300 flex items-center"
                >
                  <HouseSimpleIcon size={14} weight="fill" />
                </motion.button>
                <span className="w-px h-3 bg-gold-primary/25 flex-shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
          {NAV_LINKS.map((link) =>
            link.children ? (
              /* ── Bebidas com dropdown ── */
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  onClick={() => handleLink(link.href)}
                  className={`type-overline flex items-center gap-1 transition-colors duration-300 hover:-translate-y-px ${
                    isActive(link.href) ? 'text-gold-light' : 'text-cream/70 hover:text-gold-light'
                  }`}
                >
                  {link.label}
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="inline-flex"
                  >
                    <CaretDownIcon size={11} weight="bold" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{    opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-dark-warm/95 backdrop-blur-xl border border-gold-primary/25 rounded-2xl py-2 min-w-[180px] shadow-gold overflow-hidden"
                    >
                      {/* seta decorativa */}
                      <div
                        className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-dark-warm border-l border-t border-gold-primary/25"
                      />

                      {link.children.map((sub, si) => (
                        <motion.button
                          key={sub.href}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: si * 0.04, duration: 0.2 }}
                          onClick={() => handleLink(sub.href)}
                          className={`w-full text-left px-5 py-2.5 type-overline text-[10px] tracking-widest transition-all duration-200 hover:bg-gold-primary/10 ${
                            isActive(sub.href) ? 'text-gold-light' : 'text-cream/65 hover:text-gold-light'
                          }`}
                        >
                          {sub.label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Links normais ── */
              <button
                key={link.href}
                onClick={() => handleLink(link.href)}
                className={`type-overline transition-colors duration-300 hover:-translate-y-px ${
                  isActive(link.href) ? 'text-gold-light' : 'text-cream/70 hover:text-gold-light'
                }`}
              >
                {link.label}
              </button>
            )
          )}
        </div>

        {/* Desktop cart */}
        <a
          href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido."
          target="_blank"
          rel="noopener noreferrer"
          title="Fazer Pedido"
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-gradient-gold text-dark-warm transition-all duration-300 hover:-translate-y-px hover:shadow-gold flex-shrink-0"
        >
          <ShoppingCartIcon size={16} weight="fill" />
        </a>

        {/* Mobile tagline / back home */}
        <div className="md:hidden flex-1 flex justify-center">
          <AnimatePresence mode="wait">
            {location.pathname !== '/' ? (
              <motion.button
                key="mobile-home"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE }}
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 type-overline text-[9px] text-cream/50 hover:text-gold-light tracking-widest transition-colors duration-300"
              >
                <HouseSimpleIcon size={11} weight="fill" />
                Início
              </motion.button>
            ) : (
              <motion.span
                key="mobile-tagline"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="type-overline text-gold-light/60 text-[9px] tracking-widest"
              >
                Delicatessen Premium
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile hamburger */}
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
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{    rotate: 90,  opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <XIcon size={15} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90,  opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{    rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <ListIcon size={15} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.nav>

      {/* ──────────── Mobile drawer ──────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-40 bg-dark-warm/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.48, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 z-[45] w-[82vw] max-w-[320px] bg-dark-warm flex flex-col border-l border-gold-primary/20"
            >
              {/* Header drawer */}
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

              {/* Nav links */}
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
                    {link.children ? (
                      /* ── Bebidas accordion ── */
                      <div>
                        <button
                          onClick={() => setBebidasOpen((v) => !v)}
                          className="group w-full flex items-center gap-4 py-5 text-left"
                        >
                          <span className="type-overline text-[10px] text-gold-primary/35 group-hover:text-gold-primary/80 transition-colors duration-300 w-5 shrink-0 tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className={`font-display font-bold text-[1.3rem] leading-none tracking-wide transition-colors duration-300 ${
                            isActive(link.href) ? 'text-gold-light' : 'text-cream/75 group-hover:text-gold-light'
                          }`}>
                            {link.label}
                          </span>
                          <motion.span
                            animate={{ rotate: bebidasOpen ? 180 : 0 }}
                            transition={{ duration: 0.28, ease: EASE }}
                            className="ml-auto text-gold-primary/50 group-hover:text-gold-primary/80 inline-flex transition-colors duration-300"
                          >
                            <CaretDownIcon size={14} weight="bold" />
                          </motion.span>
                        </button>

                        {/* Sub-itens workspace */}
                        <AnimatePresence initial={false}>
                          {bebidasOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.32, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <div className="relative ml-9 mb-4 flex flex-col gap-0.5">
                                {/* linha vertical workspace */}
                                <div className="absolute left-0 top-1 bottom-1 w-px bg-gold-primary/20" />

                                {link.children.map((sub, si) => (
                                  <motion.button
                                    key={sub.href}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: si * 0.05, duration: 0.25, ease: EASE }}
                                    onClick={() => handleLink(sub.href)}
                                    className={`group/sub relative flex items-center gap-3 pl-5 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-gold-primary/8 ${
                                      isActive(sub.href) ? 'bg-gold-primary/10' : ''
                                    }`}
                                  >
                                    {/* pontinho conector */}
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-px bg-gold-primary/30 group-hover/sub:bg-gold-primary/60 transition-colors duration-200" />

                                    <span className={`type-overline text-[11px] tracking-wider transition-colors duration-200 ${
                                      isActive(sub.href)
                                        ? 'text-gold-light'
                                        : 'text-cream/55 group-hover/sub:text-gold-light'
                                    }`}>
                                      {sub.label}
                                    </span>
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* ── Link normal ── */
                      <button
                        onClick={() => handleLink(link.href)}
                        className="group w-full flex items-center gap-4 py-5 text-left"
                      >
                        <span className="type-overline text-[10px] text-gold-primary/35 group-hover:text-gold-primary/80 transition-colors duration-300 w-5 shrink-0 tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={`font-display font-bold text-[1.3rem] leading-none tracking-wide transition-colors duration-300 ${
                          isActive(link.href) ? 'text-gold-light' : 'text-cream/75 group-hover:text-gold-light'
                        }`}>
                          {link.label}
                        </span>
                        <span className="ml-auto text-base text-gold-primary/0 group-hover:text-gold-primary/60 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                          →
                        </span>
                      </button>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Footer drawer */}
              <div className="px-6 py-6 border-t border-gold-primary/15 space-y-3">
                {location.pathname !== '/' && (
                  <motion.button
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ delay: 0.38, duration: 0.38 }}
                    onClick={() => handleLink('/')}
                    className="flex items-center justify-center gap-2 w-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-gold-light font-body font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300"
                  >
                    <HouseSimpleIcon size={13} weight="fill" />
                    Início
                  </motion.button>
                )}
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
