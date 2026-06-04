import AdminDashboard from './AdminDashboard'

const DEMO_SESSION = { user: { email: 'admin@azayla.hotel', app_metadata: { role: 'admin' } } }

export default function AdminPage() {
  return <AdminDashboard session={DEMO_SESSION} />
}
