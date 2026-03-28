import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, UserIcon, EnvelopeIcon, LockSimpleIcon, EyeIcon, EyeClosedIcon, WarningCircleIcon, CheckCircleIcon } from '@phosphor-icons/react'
import { useAuth, useAuthModal } from '../../context/AuthContext'

type Tab = 'login' | 'cadastro'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]
const CLOSE_DELAY = 300

// Stable icon elements — created once, never recreated on re-render
const ICON_ENVELOPE = <EnvelopeIcon size={14} />
const ICON_USER = <UserIcon size={14} />
const ICON_LOCK = <LockSimpleIcon size={14} />

type LoginForm = { email: string; password: string }
type CadForm = { nome: string; email: string; password: string; confirm: string }

const INITIAL_LOGIN: LoginForm = { email: '', password: '' }
const INITIAL_CAD: CadForm = { nome: '', email: '', password: '', confirm: '' }

export default function AuthModal() {
  const { signIn, signUp } = useAuth()
  const { authModalOpen, closeAuthModal } = useAuthModal()

  const [tab, setTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loginForm, setLoginForm] = useState<LoginForm>(INITIAL_LOGIN)
  const [cadForm, setCadForm] = useState<CadForm>(INITIAL_CAD)

  const resetState = useCallback(() => {
    setTab('login')
    setError('')
    setSuccess('')
    setLoading(false)
    setLoginForm(INITIAL_LOGIN)
    setCadForm(INITIAL_CAD)
    setShowPassword(false)
    setShowConfirm(false)
  }, [])

  useEffect(() => {
    if (!authModalOpen) {
      const id = setTimeout(resetState, CLOSE_DELAY)
      return () => clearTimeout(id)
    }
  }, [authModalOpen, resetState])

  useEffect(() => {
    setError('')
    setSuccess('')
  }, [tab])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeAuthModal])

  // Stable setters for individual fields
  const setLoginEmail = useCallback((v: string) => setLoginForm(f => ({ ...f, email: v })), [])
  const setLoginPassword = useCallback((v: string) => setLoginForm(f => ({ ...f, password: v })), [])
  const setCadNome = useCallback((v: string) => setCadForm(f => ({ ...f, nome: v })), [])
  const setCadEmail = useCallback((v: string) => setCadForm(f => ({ ...f, email: v })), [])
  const setCadPassword = useCallback((v: string) => setCadForm(f => ({ ...f, password: v })), [])
  const setCadConfirm = useCallback((v: string) => setCadForm(f => ({ ...f, confirm: v })), [])

  const toggleShowPassword = useCallback(() => setShowPassword(v => !v), [])
  const toggleShowConfirm = useCallback(() => setShowConfirm(v => !v), [])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      if (!loginForm.email || !loginForm.password) {
        setError('Preencha todos os campos.')
        return
      }
      setLoading(true)
      const res = await signIn(loginForm.email, loginForm.password)
      setLoading(false)
      if (res.success) {
        setSuccess('Login realizado com sucesso!')
        setTimeout(() => closeAuthModal(), 1200)
      } else {
        setError(res.message || 'Credenciais inválidas.')
      }
    },
    [loginForm, signIn, closeAuthModal],
  )

  const handleCadastro = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      if (!cadForm.nome || !cadForm.email || !cadForm.password || !cadForm.confirm) {
        setError('Preencha todos os campos.')
        return
      }
      if (cadForm.password.length < 8) {
        setError('A senha deve ter no mínimo 8 caracteres.')
        return
      }
      if (cadForm.password !== cadForm.confirm) {
        setError('As senhas não coincidem.')
        return
      }
      setLoading(true)
      const res = await signUp(cadForm.nome, cadForm.email, cadForm.password)
      setLoading(false)
      if (res.success) {
        setSuccess('Conta criada com sucesso!')
        setTimeout(() => closeAuthModal(), 1200)
      } else {
        setError(res.message || 'Erro ao criar conta.')
      }
    },
    [cadForm, signUp, closeAuthModal],
  )

  // Memoized toggle buttons — only recreate when showPassword/showConfirm changes
  const passwordToggle = useMemo(
    () => (
      <button
        type="button"
        onClick={toggleShowPassword}
        className="text-cream/30 hover:text-cream/70 transition-colors duration-200"
      >
        {showPassword ? <EyeClosedIcon size={14} /> : <EyeIcon size={14} />}
      </button>
    ),
    [showPassword, toggleShowPassword],
  )

  const confirmToggle = useMemo(
    () => (
      <button
        type="button"
        onClick={toggleShowConfirm}
        className="text-cream/30 hover:text-cream/70 transition-colors duration-200"
      >
        {showConfirm ? <EyeClosedIcon size={14} /> : <EyeIcon size={14} />}
      </button>
    ),
    [showConfirm, toggleShowConfirm],
  )

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/75"
            onClick={closeAuthModal}
          />

          {/* Modal */}
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-0 z-[61] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300 z-10"
                aria-label="Fechar"
              >
                <XIcon size={14} />
              </button>

              {/* Header */}
              <div className="px-7 pt-7 pb-5">
                <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">
                  Banca do Dinei
                </p>
                <h2 className="font-display font-bold text-2xl text-cream leading-tight">
                  {tab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex px-7 gap-1 mb-6">
                {(['login', 'cadastro'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2 rounded-xl type-overline text-[10px] tracking-widest transition-all duration-300 ${
                      tab === t
                        ? 'bg-gradient-gold text-dark-warm font-bold'
                        : 'text-cream/40 hover:text-cream/70 border border-gold-primary/15 hover:border-gold-primary/35'
                    }`}
                  >
                    {t === 'login' ? 'Entrar' : 'Cadastrar'}
                  </button>
                ))}
              </div>

              {/* Forms */}
              <div className="px-7 pb-7">
                <AnimatePresence mode="wait">
                  {/* ── Login ── */}
                  {tab === 'login' && (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      onSubmit={handleLogin}
                      noValidate
                    >
                      <div className="space-y-3">
                        <Field
                          label="E-mail"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginForm.email}
                          onChange={setLoginEmail}
                          icon={ICON_ENVELOPE}
                          autoComplete="email"
                        />
                        <Field
                          label="Senha"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={setLoginPassword}
                          icon={ICON_LOCK}
                          autoComplete="current-password"
                          rightElement={passwordToggle}
                        />
                      </div>

                      <Feedback error={error} success={success} />

                      <SubmitButton loading={loading} label="Entrar" />

                      <p className="text-center mt-4 type-overline text-[9px] text-cream/30 tracking-widest">
                        Não tem conta?{' '}
                        <button
                          type="button"
                          onClick={() => setTab('cadastro')}
                          className="text-gold-primary/70 hover:text-gold-light transition-colors duration-200 underline underline-offset-2"
                        >
                          Cadastre-se
                        </button>
                      </p>
                    </motion.form>
                  )}

                  {/* ── Cadastro ── */}
                  {tab === 'cadastro' && (
                    <motion.form
                      key="cadastro-form"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      onSubmit={handleCadastro}
                      noValidate
                    >
                      <div className="space-y-3">
                        <Field
                          label="Nome completo"
                          type="text"
                          placeholder="Seu nome"
                          value={cadForm.nome}
                          onChange={setCadNome}
                          icon={ICON_USER}
                          autoComplete="name"
                        />
                        <Field
                          label="E-mail"
                          type="email"
                          placeholder="seu@email.com"
                          value={cadForm.email}
                          onChange={setCadEmail}
                          icon={ICON_ENVELOPE}
                          autoComplete="email"
                        />
                        <Field
                          label="Senha"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres"
                          value={cadForm.password}
                          onChange={setCadPassword}
                          icon={ICON_LOCK}
                          autoComplete="new-password"
                          rightElement={passwordToggle}
                        />
                        <Field
                          label="Confirmar senha"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repita a senha"
                          value={cadForm.confirm}
                          onChange={setCadConfirm}
                          icon={ICON_LOCK}
                          autoComplete="new-password"
                          rightElement={confirmToggle}
                        />
                      </div>

                      <Feedback error={error} success={success} />

                      <SubmitButton loading={loading} label="Criar conta" />

                      <p className="text-center mt-4 type-overline text-[9px] text-cream/30 tracking-widest">
                        Já tem conta?{' '}
                        <button
                          type="button"
                          onClick={() => setTab('login')}
                          className="text-gold-primary/70 hover:text-gold-light transition-colors duration-200 underline underline-offset-2"
                        >
                          Entrar
                        </button>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Sub-components (memoizados) ── */

const Field = memo(function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  autoComplete,
  rightElement,
}: {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  autoComplete?: string
  rightElement?: React.ReactNode
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
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl pl-9 pr-9 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color,background-color] duration-300 focus:bg-white/8"
        />
        {rightElement && (
          <span className="absolute right-3.5 flex items-center">{rightElement}</span>
        )}
      </div>
    </div>
  )
})

const Feedback = memo(function Feedback({ error, success }: { error: string; success: string }) {
  return (
    <AnimatePresence>
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 overflow-hidden"
        >
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-body ${
              error
                ? 'bg-red-500/10 border border-red-500/25 text-red-300'
                : 'bg-green-500/10 border border-green-500/25 text-green-300'
            }`}
          >
            {error ? (
              <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
            ) : (
              <CheckCircleIcon size={14} weight="fill" className="shrink-0" />
            )}
            <span>{error || success}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

const SubmitButton = memo(function SubmitButton({
  loading,
  label,
}: {
  loading: boolean
  label: string
}) {
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
