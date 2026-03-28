import { UsersIcon } from '@phosphor-icons/react'

export default function UsersTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center">
        <UsersIcon size={28} weight="fill" className="text-gold-primary/50" />
      </div>
      <div>
        <p className="type-overline text-gold-primary/40 text-[10px] tracking-widest mb-1">Em breve</p>
        <h3 className="font-display font-bold text-xl text-cream mb-2">Usuários</h3>
        <p className="type-body text-cream/40 text-sm max-w-xs">
          O endpoint de usuários ainda não está disponível na API. Será implementado em breve.
        </p>
      </div>
    </div>
  )
}
