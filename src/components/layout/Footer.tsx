import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CrownIcon,
  WhatsappLogoIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  InstagramLogoIcon,
} from '@phosphor-icons/react';

const CATEGORY_LINKS = [
  { label: 'Início', href: '/' },
  { label: 'Frios', href: '/frios' },
  { label: 'Tábuas', href: '/tabuas' },
  { label: 'Doces', href: '/doces' },
  { label: 'Grãos & Castanhas', href: '/graos-castanhas' },
  { label: 'Bebidas', href: '/bebidas' },
];

const BEBIDAS_LINKS = [
  { label: 'Vinhos', href: '/bebidas/vinhos' },
  { label: 'Cervejas', href: '/bebidas/cerveja' },
  { label: 'Cachaças', href: '/bebidas/cachaca' },
  { label: 'Não Alcoólicos', href: '/bebidas/nao-alcoolicos' },
];

const INSTAGRAM_LINKS = [
  { href: 'https://www.instagram.com/bancadodinei.udi/', title: '@bancadodinei.udi' },
  { href: 'https://www.instagram.com/louvadauberlandia/', title: '@louvadauberlandia' },
];

export default function Footer() {
  const navigate = useNavigate();

  const handleLink = (href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      navigate(path);
      setTimeout(() => {
        document.querySelector(`#${hash}`)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      navigate(href);
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <footer id="contato" className="bg-graphite text-cream py-14 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-10 pb-10 border-b border-cream/[0.07]">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-gold-primary/25 flex items-center justify-center">
                <CrownIcon size={16} weight="fill" className="text-gold-primary/70" />
              </div>
              <div>
                <p className="type-overline text-cream/30 text-[10px]">Banca do</p>
                <p className="font-display font-bold text-cream/80 text-base leading-none tracking-tight">DINEI</p>
                <p className="font-subtitle italic text-gold-light/60 text-xs">Delicatessen</p>
              </div>
            </div>

            <p className="type-body text-cream/35 text-sm leading-relaxed max-w-[34ch]">
              Curadoria de frios, tábuas artesanais, doces e vinhos selecionados.
              Sofisticação e prazer à mesa.
            </p>

            <a
              href="https://wa.me/5534991633698?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Banca%20do%20Dinei%20e%20gostaria%20de%20fazer%20um%20pedido."
              target="_blank"
              rel="noopener noreferrer"
              className="self-start flex items-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold"
            >
              <WhatsappLogoIcon size={13} weight="fill" />
              Faça seu pedido!
            </a>

            <div className="flex items-center gap-2.5">
              <p className="type-overline text-cream/20 text-[10px]">Redes</p>
              {INSTAGRAM_LINKS.map(({ href, title }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className="group w-8 h-8 border border-cream/10 hover:border-gold-primary/40 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <InstagramLogoIcon
                    size={14}
                    weight="light"
                    className="text-cream/35 group-hover:text-gold-primary/80 transition-colors duration-300"
                  />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Categorias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-3"
          >
            <p className="type-overline text-gold-primary/55 text-[10px] mb-1">Categorias</p>
            {CATEGORY_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLink(link.href)}
                className="type-body text-cream/35 text-sm hover:text-cream/70 hover:translate-x-1 transition-all duration-300 text-left"
              >
                {link.label}
              </button>
            ))}
          </motion.div>

          {/* Bebidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            <p className="type-overline text-gold-primary/55 text-[10px] mb-1">Bebidas</p>
            {BEBIDAS_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLink(link.href)}
                className="type-body text-cream/35 text-sm hover:text-cream/70 hover:translate-x-1 transition-all duration-300 text-left"
              >
                {link.label}
              </button>
            ))}
          </motion.div>

          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <p className="type-overline text-gold-primary/55 text-[10px] mb-1">Contato</p>

            <div className="flex items-start gap-3">
              <MapPinIcon size={14} weight="light" className="text-gold-primary/50 flex-shrink-0 mt-0.5" />
              <div>
                <p className="type-body text-cream/55 text-sm">Rua Niterói, 924, Loja 1</p>
                <p className="type-body text-cream/35 text-xs mt-0.5">Bairro Aparecida · Uberlândia — MG</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PhoneIcon size={14} weight="light" className="text-gold-primary/50 flex-shrink-0" />
              <a
                href="tel:+553432122099"
                className="type-body text-cream/55 text-sm hover:text-cream/80 transition-colors duration-300"
              >
                (34) 3212-2099
              </a>
            </div>

            <div className="flex items-start gap-3">
              <ClockIcon size={14} weight="light" className="text-gold-primary/50 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2">
                <div>
                  <p className="type-overline text-gold-primary/40 text-[10px]">Aparecida</p>
                  <p className="type-body text-cream/55 text-sm">Seg – Sáb: 9h às 19h</p>
                  <p className="type-body text-cream/35 text-xs">Dom: fechado</p>
                </div>
                <div>
                  <p className="type-overline text-gold-primary/40 text-[10px]">Santa Mônica</p>
                  <p className="type-body text-cream/55 text-sm">Seg – Sáb: 9h às 22h</p>
                  <p className="type-body text-cream/35 text-xs">Dom: 9h às 13h</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="type-caption text-cream/25 not-italic text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Banca do Dinei Delicatessen · Todos os direitos reservados
          </p>
          <div className="flex flex-col items-center gap-1">
            <a
              href="https://www.instagram.com/guilhermeduarte.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="type-caption not-italic text-cream/20 text-[10px] hover:text-cream/45 transition-colors duration-300"
            >
              Desenvolvido por guilhermeduarte.dev
            </a>
            <div className="flex items-center gap-1.5">
              <CrownIcon size={9} weight="fill" className="text-gold-primary/25" />
              <p className="type-overline text-cream/15 text-[9px]">Premium · Artesanal · Curado</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
