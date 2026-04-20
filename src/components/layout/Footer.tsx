import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CrownIcon, WhatsappLogoIcon, MapPinIcon, PhoneIcon } from '@phosphor-icons/react';

const FOOTER_LINKS = [
  { label: 'Início',  href: '/' },
  { label: 'Tábuas',  href: '/tabuas' },
  { label: 'Vinhos',  href: '/bebidas/vinhos' },
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
    <footer id="contato" className="bg-graphite text-cream py-16 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12 pb-12 border-b border-cream/10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold-primary/40 flex items-center justify-center">
                <CrownIcon size={18} weight="fill" className="text-gold-primary" />
              </div>
              <div>
                <p className="type-overline text-cream/50 text-[10px]">Banca do</p>
                <p className="font-display font-bold text-cream text-lg leading-none tracking-tight">DINEI</p>
                <p className="font-subtitle italic text-gold-light text-xs">Delicatessen</p>
              </div>
            </div>

            <p className="type-body text-cream/50 text-sm leading-relaxed max-w-[36ch]">
              Curadoria de frios, tábuas artesanais, doces e vinhos selecionados.
              Sofisticação e prazer à mesa.
            </p>

            <a
              href="https://wa.me/5534991633698?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Banca%20do%20Dinei%20e%20gostaria%20de%20fazer%20um%20pedido."
              target="_blank"
              rel="noopener noreferrer"
              className="self-start flex items-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold"
            >
              <WhatsappLogoIcon size={14} weight="fill" />
              Faça seu pedido!
            </a>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <p className="type-overline text-gold-primary text-[10px] mb-2">Navegação</p>
            {FOOTER_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLink(link.href)}
                className="type-body text-cream/50 text-sm hover:text-cream/90 hover:translate-x-1 transition-all duration-300 text-left"
              >
                {link.label}
              </button>
            ))}
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            <p className="type-overline text-gold-primary text-[10px] mb-2">Contato</p>

            <div className="flex items-start gap-3">
              <MapPinIcon size={16} weight="light" className="text-gold-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="type-body text-cream/70 text-sm">Rua Niterói, 924, Loja 1</p>
                <p className="type-body text-cream/50 text-xs mt-0.5">Bairro Aparecida · Uberlândia — MG</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PhoneIcon size={16} weight="light" className="text-gold-primary flex-shrink-0" />
              <a
                href="tel:+553432122099"
                className="type-body text-cream/70 text-sm hover:text-cream transition-colors duration-300"
              >
                (34) 3212-2099
              </a>
            </div>

            <div className="flex items-center gap-3">
              <WhatsappLogoIcon size={16} weight="light" className="text-gold-primary flex-shrink-0" />
              <a
                href="https://wa.me/5534991633698"
                target="_blank"
                rel="noopener noreferrer"
                className="type-body text-cream/70 text-sm hover:text-gold-light transition-colors duration-300"
              >
                WhatsApp (pedidos)
              </a>
            </div>
          </motion.div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="type-caption text-cream/30 not-italic text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Banca do Dinei Delicatessen · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-2">
            <CrownIcon size={10} weight="fill" className="text-gold-primary/40" />
            <p className="type-overline text-cream/20 text-[9px]">Premium · Artesanal · Curado</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
