import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XIcon, MapPinIcon, PlusIcon, CheckIcon,
  ArrowClockwiseIcon, WarningCircleIcon, ArrowLeftIcon,
} from '@phosphor-icons/react';
import {
  type UserEndereco, type UserEnderecoInput,
  getEnderecos, createEndereco,
} from '../../services/usuarios';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

const inputCls =
  'w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color,background-color] duration-300 focus:bg-white/8';
const selectCls =
  'w-full bg-dark-warm border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream text-sm outline-none transition-[border-color] duration-300';

interface DeliveryModalProps {
  open: boolean;
  userId: number;
  onConfirm: (address: UserEndereco) => void;
  onClose: () => void;
}

export default function DeliveryModal({ open, userId, onConfirm, onClose }: DeliveryModalProps) {
  const [addresses, setAddresses] = useState<UserEndereco[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [view, setView] = useState<'list' | 'add'>('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  const emptyForm: UserEnderecoInput = {
    logradouro: '', numero: '', complemento: '', bairro: '',
    cidade: '', estado: 'MG', cep: '', isPrincipal: false,
  };
  const [form, setForm] = useState<UserEnderecoInput>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setView('list');
    setError('');
    setForm(emptyForm);
    setLoadingAddresses(true);
    getEnderecos(userId).then(res => {
      if (res.success && res.data) {
        setAddresses(res.data);
        const principal = res.data.find(a => a.isPrincipal) ?? res.data[0];
        setSelectedId(principal?.id ?? null);
        if (res.data.length === 0) setView('add');
      }
      setLoadingAddresses(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const fetchCep = async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({
          ...f,
          logradouro: data.logradouro || f.logradouro,
          bairro: data.bairro || f.bairro,
          cidade: data.localidade || f.cidade,
          estado: data.uf || f.estado,
        }));
      }
    } finally {
      setCepLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!form.logradouro || !form.numero || !form.bairro || !form.cidade || !form.cep) {
      setError('Preencha todos os campos obrigatórios (*).');
      return;
    }
    setSaving(true);
    setError('');
    const res = await createEndereco(userId, { ...form, cep: form.cep.replace(/\D/g, '') });
    setSaving(false);
    if (res.success && res.data) {
      const updated = [...addresses, res.data];
      setAddresses(updated);
      setSelectedId(res.data.id);
      setView('list');
    } else {
      setError(res.message || 'Erro ao salvar endereço. Tente novamente.');
    }
  };

  const handleConfirm = () => {
    const address = addresses.find(a => a.id === selectedId);
    if (address) onConfirm(address);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-[75] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-dark-warm border border-gold-primary/20 rounded-2xl w-full max-w-md shadow-gold pointer-events-auto max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gold-primary/10 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  {view === 'add' && addresses.length > 0 && (
                    <button
                      onClick={() => { setView('list'); setError(''); }}
                      className="w-7 h-7 flex items-center justify-center text-cream/50 hover:text-gold-light transition-colors"
                      aria-label="Voltar"
                    >
                      <ArrowLeftIcon size={14} />
                    </button>
                  )}
                  <p className="font-display font-bold text-cream text-lg">
                    {view === 'list' ? 'Endereço de Entrega' : 'Novo Endereço'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/40 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200"
                  aria-label="Fechar"
                >
                  <XIcon size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-12 text-gold-primary/50">
                    <ArrowClockwiseIcon size={24} className="animate-spin" />
                  </div>
                ) : view === 'list' ? (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedId(addr.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                          selectedId === addr.id
                            ? 'bg-gold-primary/10 border-gold-primary'
                            : 'bg-white/[0.03] border-gold-primary/15 hover:border-gold-primary/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPinIcon
                            size={15}
                            className={`mt-0.5 flex-shrink-0 ${selectedId === addr.id ? 'text-gold-light' : 'text-cream/30'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-body font-medium leading-snug ${selectedId === addr.id ? 'text-cream' : 'text-cream/60'}`}>
                              {addr.logradouro}, {addr.numero}
                              {addr.complemento ? ` — ${addr.complemento}` : ''}
                            </p>
                            <p className="text-xs text-cream/40 mt-0.5">
                              {addr.bairro} · {addr.cidade} — {addr.estado}
                            </p>
                            <p className="text-xs text-cream/25 mt-0.5">CEP: {addr.cep}</p>
                            {addr.isPrincipal && (
                              <span className="inline-block mt-1.5 type-overline text-[8px] bg-gold-primary/15 text-gold-primary/80 px-2 py-0.5 rounded-full tracking-widest">
                                Principal
                              </span>
                            )}
                          </div>
                          {selectedId === addr.id && (
                            <CheckIcon size={15} className="text-gold-light mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => { setForm(emptyForm); setError(''); setView('add'); }}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gold-primary/20 rounded-xl text-cream/40 hover:text-cream/70 hover:border-gold-primary/40 transition-all duration-200 text-sm"
                    >
                      <PlusIcon size={14} />
                      Adicionar novo endereço
                    </button>
                  </div>
                ) : (
                  /* Add address form */
                  <div className="space-y-4">
                    <div>
                      <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">CEP *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.cep}
                          onChange={e => {
                            const v = formatCep(e.target.value);
                            setForm(f => ({ ...f, cep: v }));
                            if (v.replace(/\D/g, '').length === 8) fetchCep(v);
                          }}
                          placeholder="00000-000"
                          className={inputCls}
                        />
                        {cepLoading && (
                          <ArrowClockwiseIcon
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-primary/50 animate-spin"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">Logradouro *</label>
                      <input
                        type="text"
                        value={form.logradouro}
                        onChange={e => setForm(f => ({ ...f, logradouro: e.target.value }))}
                        placeholder="Rua, Avenida, Travessa..."
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">Número *</label>
                        <input
                          type="text"
                          value={form.numero}
                          onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
                          placeholder="123"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">Complemento</label>
                        <input
                          type="text"
                          value={form.complemento}
                          onChange={e => setForm(f => ({ ...f, complemento: e.target.value }))}
                          placeholder="Apto, Bloco..."
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">Bairro *</label>
                      <input
                        type="text"
                        value={form.bairro}
                        onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))}
                        placeholder="Bairro"
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">Cidade *</label>
                        <input
                          type="text"
                          value={form.cidade}
                          onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
                          placeholder="Cidade"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">Estado *</label>
                        <select
                          value={form.estado}
                          onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                          className={selectCls}
                        >
                          {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-400 text-xs">
                        <WarningCircleIcon size={14} />
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loadingAddresses && (
                <div className="px-6 pb-5 pt-4 border-t border-gold-primary/10 flex-shrink-0">
                  {view === 'list' ? (
                    <button
                      onClick={handleConfirm}
                      disabled={selectedId === null}
                      className="w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300 hover:shadow-gold hover:-translate-y-px active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      Confirmar endereço
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      {addresses.length > 0 && (
                        <button
                          onClick={() => { setView('list'); setError(''); }}
                          className="flex-1 border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80 rounded-xl py-2.5 text-sm transition-all duration-200"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={handleSaveAddress}
                        disabled={saving}
                        className="flex-1 bg-gradient-gold text-dark-warm font-bold rounded-xl py-2.5 text-sm hover:shadow-gold transition-all duration-200 disabled:opacity-50"
                      >
                        {saving ? 'Salvando...' : 'Salvar endereço'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
