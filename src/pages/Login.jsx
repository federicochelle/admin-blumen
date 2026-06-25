import { useState } from 'react'
import { supabase } from '../lib/supabase'
import blumenImage from '../../blumen.jpeg'

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })

      if (signInError) {
        throw signInError
      }
    } catch (loginError) {
      setError(loginError.message ?? 'No se pudo iniciar sesion.')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="flex min-h-screen items-center justify-center bg-black px-4 py-6">
    <section className="grid min-h-[82vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] shadow-[0_24px_80px_rgba(0,0,0,0.55)] lg:grid-cols-[1.35fr_0.9fr]">
      <div className="relative hidden lg:block">
        <img src={blumenImage} alt="Blumen" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-turquoise">
              Blumen
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Bienvenido
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Iniciá sesión para continuar al panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/75">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-brand-turquoise focus:bg-white/[0.08]"
                placeholder="tu@email.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/75">Contraseña</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-brand-turquoise focus:bg-white/[0.08]"
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={`h-11 w-full rounded-xl px-4 text-sm font-semibold text-white transition ${
                loading
                  ? 'cursor-wait bg-white/20'
                  : 'bg-brand-turquoise hover:bg-brand-deep-purple'
              }`}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
)
}

export default Login
