import { Sidebar } from '@/components/layout/Sidebar'
import { getCurrentUser, getUserProfile, getUnreadCount } from '@/lib/supabase/queries'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const profile = user ? await getUserProfile(user.id) : null
  const unreadCount = await getUnreadCount().catch(() => 0)

  const userInfo = {
    farmName: profile?.farm_name ?? user?.email ?? 'ユーザー',
    email: user?.email ?? '',
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar userInfo={userInfo} unreadCount={unreadCount} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
