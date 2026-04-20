import { useState, useCallback, useMemo, memo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CrownIcon,
  EnvelopeIcon,
  LockSimpleIcon,
  EyeIcon,
  EyeClosedIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  ArrowLeftIcon,
} from '@phosphor-icons/react'
import { forgotPassword, resetPassword } from '../services/auth'
import { useAuth } from '../context/AuthContext'
import { EASE } from '../lib/motion'

type Step = 'request' | 'sent' | 'reset' | 'done'


export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [step, setStep] = useState<Step>(token ? 'reset' : 'request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleForgot = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      const trimmed = email.trim()
      if (!trimmed) { setError('Informe seu e-mail.'); return }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Informe um e-mail válido.'); return }
      setLoading(true)
      await forgotPassword(trimmed.toLowerCase())
      setLoading(false)
      setStep('sent')
    },
    [email],
  )

  const handleReset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      if (!password) { setError('Informe a nova senha.'); return }
      if (password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return }
      if (password !== confirm) { setError('As senhas não coincidem.'); return }
      if (!token) { setError('Token inválido.'); return }
      setLoading(true)
      const res = await resetPassword(token, password)
      setLoading(false)
      if (res.success) {
        setStep('done')
      } else {
        setError(res.message || 'Link inválido ou expirado.')
      }
    },
    [password, confirm, token],
  )

  const togglePwd = useCallback(() => setShowPwd(v => !v), [])
  const toggleCfm = useCallback(() => setShowCfm(v => !v), [])

  const pwdToggle = useMemo(
    () => (
      <button type="button" onClick={togglePwd} className="text-cream/30 hover:text-cream/70 transition-colors duration-200">
        {showPwd ? <EyeClosedIcon size={14} /> : <EyeIcon size={14} />}
      </button>
    ),
    [showPwd, togglePwd],
  )

  const cfmToggle = useMemo(
    () => (
      <button type="button" onClick={toggleCfm} className="text-cream/30 hover:text-cream/70 transition-colors duration-200">
        {showCfm ? <EyeClosedIcon size={14} /> : <EyeIcon size={14} />}
      </button>
    ),
    [showCfm, toggleCfm],
  )

  const titles: Record<Step, string> = {
    request: 'Recuperar acesso',
    sent: 'Verifique seu e-mail',
    reset: 'Nova senha',
    done: 'Tudo certo!',
  }

  const subtitles: Record<Step, string> = {
    request: 'Informe seu e-mail e enviaremos um link de redefinição.',
    sent: 'O link expira em 30 minutos. Verifique também o spam.',
    reset: 'Crie uma nova senha segura para sua conta.',
    done: 'Senha alterada. Todas as sessões anteriores foram encerradas.',
  }

  return (
    <div className="relative min-h-screen bg-dark-warm flex items-center justify-center px-4 py-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-gold-primary/[0.035] blur-[90px]" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 rounded-full bg-bordeaux/[0.05] blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-dark-warm border border-gold-primary/20 rounded-3xl shadow-gold overflow-hidden">
          <div className="px-7 pt-8 pb-5 text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
              className="flex justify-center mb-4"
            >
              <div className="w-11 h-11 rounded-full border border-gold-primary/25 bg-gold-primary/[0.07] flex items-center justify-center">
                <CrownIcon size={18} weight="fill" className="text-gold-primary" />
              </div>
            </motion.div>

            <p className="type-overline text-[10px] text-gold-primary/45 tracking-[0.18em] uppercase mb-2">
              Banca do Dinei
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={step + '-hd'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <h1 className="font-display font-bold text-[1.55rem] text-cream leading-tight">
                  {titles[step]}
                </h1>
                <p className="font-body text-xs text-cream/35 mt-1.5 leading-relaxed px-1">
                  {subtitles[step]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-7 pb-7">
            <AnimatePresence mode="wait">

              {step === 'request' && (
                <motion.form
                  key="form-request"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  onSubmit={handleForgot}
                  noValidate
                >
                  <PwField
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={setEmail}
                    icon={<EnvelopeIcon size={14} />}
                    autoComplete="email"
                    autoFocus
                  />
                  <ErrorMsg msg={error} />
                  <SubmitBtn loading={loading} label="Enviar link de recuperação" />
                  <BackToLogin />
                </motion.form>
              )}

              {step === 'sent' && (
                <motion.div
                  key="form-sent"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 20 }}
                    className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
                  >
                    <CheckCircleIcon size={24} weight="fill" className="text-green-400" />
                  </motion.div>
                  <p className="font-body text-xs text-cream/40 leading-relaxed px-2">
                    Se o e-mail estiver cadastrado, você receberá as instruções em breve. O link é válido por{' '}
                    <span className="text-gold-primary/75">30 minutos</span>.
                  </p>
                  <BackToLogin />
                </motion.div>
              )}

              {step === 'reset' && (
                <motion.form
                  key="form-reset"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  onSubmit={handleReset}
                  noValidate
                >
                  <div className="space-y-3">
                    <PwField
                      label="Nova senha"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={setPassword}
                      icon={<LockSimpleIcon size={14} />}
                      autoComplete="new-password"
                      autoFocus
                      rightElement={pwdToggle}
                    />
                    <PwField
                      label="Confirmar nova senha"
                      type={showCfm ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={confirm}
                      onChange={setConfirm}
                      icon={<LockSimpleIcon size={14} />}
                      autoComplete="new-password"
                      rightElement={cfmToggle}
                    />
                  </div>
                  <ErrorMsg msg={error} />
                  <SubmitBtn loading={loading} label="Redefinir senha" />
                  <BackToLogin />
                </motion.form>
              )}

              {step === 'done' && (
                <motion.div
                  key="form-done"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 20 }}
                    className="w-12 h-12 rounded-full bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center"
                  >
                    <CheckCircleIcon size={24} weight="fill" className="text-gold-primary" />
                  </motion.div>
                  <BackToLogin label="Ir para o login" />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const PwField = memo(function PwField({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  autoComplete,
  rightElement,
  autoFocus,
}: {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  autoComplete?: string
  rightElement?: React.ReactNode
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-gold-primary/40 pointer-events-none flex items-center">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl pl-9 pr-9 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color,background-color] duration-300 focus:bg-white/8"
        />
        {rightElement && (
          <span className="absolute right-3.5 flex items-center">{rightElement}</span>
        )}
      </div>
    </div>
  )
})

const ErrorMsg = memo(function ErrorMsg({ msg }: { msg: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-4 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-body bg-red-500/10 border border-red-500/25 text-red-300">
            <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
            <span>{msg}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

const SubmitBtn = memo(function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { y: -1 } : {}}
      whileTap={!loading ? { scale: 0.98 } : {}}
      className="mt-5 w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300 hover:shadow-gold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-dark-warm/30 border-t-dark-warm rounded-full animate-spin" />
          Aguarde...
        </>
      ) : (
        label
      )}
    </motion.button>
  )
})

function BackToLogin({ label = 'Voltar ao login' }: { label?: string }) {
  const navigate = useNavigate()
  const { openAuthModal } = useAuth()

  const handleClick = useCallback(() => {
    navigate('/')
    openAuthModal()
  }, [navigate, openAuthModal])

  return (
    <p className="text-center mt-4 type-overline text-[9px] text-cream/30 tracking-widest">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-gold-primary/60 hover:text-gold-light transition-colors duration-200 underline underline-offset-2"
      >
        <ArrowLeftIcon size={10} />
        {label}
      </button>
    </p>
  )
}
