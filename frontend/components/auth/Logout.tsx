'use client'
import { LogOut } from 'lucide-react'
import { useLogout } from '@/hooks/auth/useLogout'

const Logout = ({ alwaysShowLabel = false }: { alwaysShowLabel?: boolean } = {}) => {
  const { mutate: handleLogout, isPending } = useLogout()

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        handleLogout()
      }}
      disabled={isPending}
      className={`group flex w-full items-center gap-3 py-3 px-3 text-[19px] font-normal rounded-full hover:bg-accent transition-colors min-w-[48px] text-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 ${alwaysShowLabel ? 'justify-start w-full' : 'w-fit xl:w-full justify-center xl:justify-start'}`}
    >
      {isPending ? (
        <div className="h-[26px] w-[26px] shrink-0 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
      ) : (
        <LogOut size={26} strokeWidth={1.5} className="shrink-0 group-hover:text-destructive" />
      )}
      <span className={alwaysShowLabel ? '' : 'hidden xl:inline'}>
        {isPending ? 'Logging out...' : 'Logout'}
      </span>
    </button>
  )
}
export default Logout
