import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListIcon, XIcon, ShoppingCartIcon, CaretDownIcon, HouseSimpleIcon,
  UserCircleIcon, SignOutIcon, IdentificationCardIcon, ClipboardTextIcon,
  GearIcon, CheeseIcon, KnifeIcon, CakeIcon, LeafIcon, WineIcon,
} from '@phosphor-icons/react';
import logo from '../../assets/logo.png';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { EASE } from '../../lib/motion';

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

const MOBILE_NAV_ICONS = [
  { href: '/frios',           Icon: CheeseIcon, label: 'Frios'    },
  { href: '/tabuas',          Icon: KnifeIcon,  label: 'Tábuas'   },
  { href: '/doces',           Icon: CakeIcon,   label: 'Doces'    },
  { href: '/graos-castanhas', Icon: LeafIcon,   label: 'Grãos'    },
  { href: '/bebidas',         Icon: WineIcon,   label: 'Bebidas'  },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [bebidasOpen, setBebidasOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();
  const location    = useLocation();
  const { totalItems, openCart, setMobileMenuOpen } = useCart();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    setBebidasOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLink = (href: string) => {
    closeMenu();
    setDropdownOpen(false);
    navigate(href);
  };

  const handleLogoClick = () => {
    closeMenu();
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
                      <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-dark-warm border-l border-t border-gold-primary/25" />
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

        {/* Desktop user menu */}
        <div ref={userMenuRef} className="hidden md:block relative flex-shrink-0">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                title={user?.name}
                className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-gold-primary/30 text-cream/70 hover:border-gold-primary/60 hover:text-gold-light transition-all duration-300"
              >
                <UserCircleIcon size={16} weight="fill" className="text-gold-primary/70" />
                <span className="type-overline text-[9px] tracking-widest max-w-[80px] truncate">
                  {user?.name.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="absolute top-full right-0 mt-3 bg-dark-warm/95 backdrop-blur-xl border border-gold-primary/25 rounded-2xl py-2 min-w-[200px] shadow-gold overflow-hidden"
                  >
                    <div className="absolute -top-[6px] right-4 w-3 h-3 rotate-45 bg-dark-warm border-l border-t border-gold-primary/25" />
                    <div className="px-4 py-2 border-b border-gold-primary/10 mb-1">
                      <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest">CONTA</p>
                      <p className="text-cream/80 text-xs font-body truncate mt-0.5">{user?.email}</p>
                    </div>
                    <motion.button
                      onClick={() => { setUserMenuOpen(false); navigate('/perfil'); }}
                      className="w-full text-left px-4 py-2.5 type-overline text-[10px] tracking-widest flex items-center gap-2.5 text-cream/60 hover:text-gold-light hover:bg-gold-primary/8 transition-all duration-200"
                    >
                      <IdentificationCardIcon size={13} />
                      Meu Perfil
                    </motion.button>
                    <motion.button
                      onClick={() => { setUserMenuOpen(false); navigate('/pedidos'); }}
                      className="w-full text-left px-4 py-2.5 type-overline text-[10px] tracking-widest flex items-center gap-2.5 text-cream/60 hover:text-gold-light hover:bg-gold-primary/8 transition-all duration-200"
                    >
                      <ClipboardTextIcon size={13} />
                      Meus Pedidos
                    </motion.button>
                    {user?.role === 'Admin' && (
                      <motion.button
                        onClick={() => { setUserMenuOpen(false); navigate('/admin'); }}
                        className="w-full text-left px-4 py-2.5 type-overline text-[10px] tracking-widest flex items-center gap-2.5 text-gold-light/70 hover:text-gold-light hover:bg-gold-primary/8 transition-all duration-200"
                      >
                        <GearIcon size={13} />
                        Configurações
                      </motion.button>
                    )}
                    <div className="mx-4 my-1 h-px bg-gold-primary/10" />
                    <motion.button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 type-overline text-[10px] tracking-widest flex items-center gap-2.5 text-cream/50 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200"
                    >
                      <SignOutIcon size={13} />
                      Sair
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <button
              onClick={openAuthModal}
              title="Entrar / Cadastrar"
              className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-gold-primary/30 text-cream/70 hover:border-gold-primary/60 hover:text-gold-light transition-all duration-300"
            >
              <UserCircleIcon size={16} weight="fill" className="text-gold-primary/50" />
              <span className="type-overline text-[9px] tracking-widest">Entrar</span>
            </button>
          )}
        </div>

        {/* Desktop cart */}
        <button
          onClick={openCart}
          title="Meu Carrinho"
          className="hidden md:flex relative items-center justify-center w-9 h-9 rounded-full bg-gradient-gold text-dark-warm transition-all duration-300 hover:-translate-y-px hover:shadow-gold flex-shrink-0"
        >
          <ShoppingCartIcon size={16} weight="fill" />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                key="navbar-badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-bordeaux text-cream text-[9px] font-bold rounded-full flex items-center justify-center border border-dark-warm tabular-nums"
              >
                {totalItems > 9 ? '9+' : totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Mobile Quick-Nav icons */}
        <div className="md:hidden flex-1 flex items-center justify-center gap-0.5">
          {MOBILE_NAV_ICONS.map(({ href, Icon, label }) => {
            const active = isActive(href);
            return (
              <motion.button
                key={href}
                onClick={() => handleLink(href)}
                aria-label={label}
                title={label}
                whileTap={{ scale: 0.82 }}
                className={`p-1.5 -mx-0.5 rounded-full transition-colors duration-300 ${
                  active ? 'text-gold-light' : 'text-cream/35 hover:text-cream/60'
                }`}
              >
                <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all duration-300 ${
                  active ? 'bg-gold-primary/20 ring-1 ring-gold-primary/30' : ''
                }`}>
                  <Icon size={14} weight={active ? 'fill' : 'regular'} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => { const next = !menuOpen; setMenuOpen(next); setMobileMenuOpen(next); }}
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
              onClick={closeMenu}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.48, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 z-[45] w-[82vw] max-w-[320px] bg-dark-warm flex flex-col border-l border-gold-primary/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gold-primary/15">
                <img src={logo} alt="Banca do Dinei" className="h-8 w-auto opacity-90" />
                <button
                  onClick={closeMenu}
                  aria-label="Fechar menu"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-300"
                >
                  <XIcon size={15} />
                </button>
              </div>

              {/* Nav — grid de tiles */}
              <div className="flex-1 px-5 pt-5 pb-3 overflow-y-auto">
                <p className="type-overline text-[8px] text-gold-primary/30 tracking-[0.2em] mb-4">NAVEGAR</p>

                {/* Grid 2×2 — Frios, Tábuas, Doces, Grãos */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {MOBILE_NAV_ICONS.slice(0, 4).map(({ href, Icon, label }, i) => {
                    const active = isActive(href);
                    return (
                      <motion.button
                        key={href}
                        onClick={() => handleLink(href)}
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 10 }}
                        transition={{ delay: 0.08 + i * 0.06, duration: 0.30, ease: EASE }}
                        className={`flex flex-col items-center gap-2 py-[18px] px-3 rounded-xl border transition-all duration-300 ${
                          active
                            ? 'border-gold-light/45 bg-gold-primary/10 text-gold-light'
                            : 'border-gold-primary/[0.12] bg-cream/[0.03] text-cream/40 hover:border-gold-primary/35 hover:bg-gold-primary/[0.06] hover:text-cream/65 hover:-translate-y-0.5'
                        }`}
                      >
                        <Icon
                          size={26}
                          weight={active ? 'fill' : 'regular'}
                          className={active ? 'text-gold-light' : 'text-gold-primary/45'}
                        />
                        <span className="type-overline text-[9px] tracking-widest">{label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Bebidas — full-width + accordion pills */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.32, duration: 0.30, ease: EASE }}
                >
                  <button
                    onClick={() => setBebidasOpen((v) => !v)}
                    className={`w-full flex items-center gap-3 px-[18px] py-[14px] rounded-xl border transition-all duration-300 ${
                      isActive('/bebidas')
                        ? 'border-gold-light/45 bg-gold-primary/10 text-gold-light'
                        : 'border-gold-primary/[0.12] bg-cream/[0.03] text-cream/45 hover:border-gold-primary/35 hover:bg-gold-primary/[0.06] hover:text-cream/65'
                    }`}
                  >
                    <WineIcon
                      size={20}
                      weight={isActive('/bebidas') ? 'fill' : 'regular'}
                      className={isActive('/bebidas') ? 'text-gold-light' : 'text-gold-primary/50'}
                    />
                    <span className="type-overline text-[10px] tracking-widest">Bebidas</span>
                    <motion.span
                      animate={{ rotate: bebidasOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="ml-auto inline-flex"
                    >
                      <CaretDownIcon
                        size={12}
                        weight="bold"
                        className={isActive('/bebidas') ? 'text-gold-light/70' : 'text-gold-primary/35'}
                      />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {bebidasOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {BEBIDAS_SUBITENS.map((sub, si) => (
                            <motion.button
                              key={sub.href}
                              initial={{ opacity: 0, scale: 0.95, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ delay: si * 0.05, duration: 0.22, ease: EASE }}
                              onClick={() => handleLink(sub.href)}
                              className={`py-3 px-2 rounded-lg border type-overline text-[9px] tracking-widest text-center transition-all duration-200 ${
                                isActive(sub.href)
                                  ? 'border-gold-light/50 bg-gold-primary/10 text-gold-light'
                                  : 'border-gold-primary/[0.15] bg-cream/[0.02] text-cream/45 hover:border-gold-primary/40 hover:bg-gold-primary/[0.05] hover:text-gold-light/80'
                              }`}
                            >
                              {sub.label}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="px-5 py-5 border-t border-gold-primary/15 space-y-2.5">
                {isAuthenticated ? (
                  <>
                    {/* Faixa nome + sair */}
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 14 }}
                      transition={{ delay: 0.28, duration: 0.38 }}
                      className="flex items-center justify-between border border-gold-primary/20 rounded-full px-5 py-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <UserCircleIcon size={15} weight="fill" className="text-gold-primary/60 shrink-0" />
                        <span className="type-overline text-[9px] text-cream/50 tracking-widest truncate">
                          {user?.name}
                        </span>
                      </div>
                      <button
                        onClick={() => { closeMenu(); handleSignOut(); }}
                        className="flex items-center gap-1.5 type-overline text-[9px] text-red-400/70 hover:text-red-400 tracking-widest transition-colors duration-200 shrink-0 ml-3"
                      >
                        <SignOutIcon size={12} />
                        Sair
                      </button>
                    </motion.div>

                    {/* Grid 2 colunas: Perfil + Pedidos */}
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 14 }}
                      transition={{ delay: 0.32, duration: 0.38 }}
                      className="grid grid-cols-2 gap-2"
                    >
                      <button
                        onClick={() => handleLink('/perfil')}
                        className="flex items-center justify-center gap-2 border border-gold-primary/[0.18] text-cream/55 hover:border-gold-primary/45 hover:text-gold-light font-body font-bold uppercase tracking-widest text-[9px] px-4 py-3 rounded-[10px] transition-all duration-300"
                      >
                        <IdentificationCardIcon size={13} />
                        Perfil
                      </button>
                      <button
                        onClick={() => handleLink('/pedidos')}
                        className="flex items-center justify-center gap-2 border border-gold-primary/[0.18] text-cream/55 hover:border-gold-primary/45 hover:text-gold-light font-body font-bold uppercase tracking-widest text-[9px] px-4 py-3 rounded-[10px] transition-all duration-300"
                      >
                        <ClipboardTextIcon size={13} />
                        Pedidos
                      </button>
                    </motion.div>

                    {user?.role === 'Admin' && (
                      <motion.button
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 14 }}
                        transition={{ delay: 0.36, duration: 0.38 }}
                        onClick={() => handleLink('/admin')}
                        className="flex items-center justify-center gap-2 w-full border border-gold-primary/25 text-gold-light/65 hover:border-gold-primary/50 hover:text-gold-light font-body font-bold uppercase tracking-widest text-[9px] px-6 py-3 rounded-[10px] transition-all duration-300"
                      >
                        <GearIcon size={13} />
                        Configurações
                      </motion.button>
                    )}
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ delay: 0.28, duration: 0.38 }}
                    onClick={() => { closeMenu(); openAuthModal(); }}
                    className="flex items-center justify-center gap-2 w-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-gold-light font-body font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300"
                  >
                    <UserCircleIcon size={13} weight="fill" />
                    Entrar / Cadastrar
                  </motion.button>
                )}

                {location.pathname !== '/' && (
                  <motion.button
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ delay: 0.36, duration: 0.38 }}
                    onClick={() => handleLink('/')}
                    className="flex items-center justify-center gap-2 w-full border border-gold-primary/20 text-cream/45 hover:border-gold-primary/45 hover:text-gold-light font-body font-bold uppercase tracking-widest text-[9px] px-6 py-3 rounded-full transition-all duration-300"
                  >
                    <HouseSimpleIcon size={12} weight="fill" />
                    Início
                  </motion.button>
                )}

                {/* Carrinho com contagem inline */}
                <motion.button
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ delay: 0.40, duration: 0.38 }}
                  onClick={() => { closeMenu(); openCart(); }}
                  className="flex items-center justify-center gap-2.5 w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300 hover:shadow-gold"
                >
                  <ShoppingCartIcon size={15} weight="fill" />
                  Meu Carrinho
                  {totalItems > 0 && (
                    <span className="opacity-70">· {totalItems > 9 ? '9+' : totalItems}</span>
                  )}
                </motion.button>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.48, duration: 0.38 }}
                  className="text-center type-overline text-[8px] text-cream/15 tracking-[0.2em] pt-0.5"
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
