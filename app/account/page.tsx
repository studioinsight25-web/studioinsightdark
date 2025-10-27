import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Settings, 
  LogOut,
  Edit,
  Shield,
  CreditCard,
  Bell
} from 'lucide-react'

export default async function AccountPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/inloggen')
  }

  const accountStats = [
    { label: 'Cursussen voltooid', value: '2', icon: Award },
    { label: 'Studietijd', value: '12u', icon: Calendar },
    { label: 'Certificaten', value: '1', icon: Shield },
    { label: 'Lid sinds', value: 'Jan 2024', icon: User }
  ]

  const recentActivity = [
    { action: 'Cursus voltooid', course: 'Bouw een persoonlijke website', time: '2 dagen geleden' },
    { action: 'Cursus gestart', course: 'Videobewerking fundamentals', time: '5 dagen geleden' },
    { action: 'E-book gedownload', course: 'SEO voor starters', time: '1 week geleden' },
    { action: 'Account aangemaakt', course: '', time: '1 maand geleden' }
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-dark-section to-dark-card py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {user.name}
                </h1>
                <p className="text-text-secondary">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300"
              >
                Naar Dashboard
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="bg-transparent border border-dark-border text-white px-6 py-3 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Uitloggen
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {accountStats.map((stat, index) => (
              <div key={index} className="bg-dark-card rounded-xl p-6 border border-dark-border text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Sections */}
      <section className="py-12 bg-dark-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Persoonlijke Informatie</h2>
                  <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Bewerken
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-text-secondary">Naam</p>
                      <p className="text-white">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-text-secondary">E-mailadres</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-text-secondary">Account Type</p>
                      <p className="text-white capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h2 className="text-xl font-semibold mb-6">Recente Activiteit</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-dark-border last:border-b-0">
                      <div>
                        <p className="text-white font-medium">{activity.action}</p>
                        {activity.course && (
                          <p className="text-text-secondary text-sm">{activity.course}</p>
                        )}
                      </div>
                      <p className="text-text-secondary text-sm">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h2 className="text-xl font-semibold mb-6">Snelle Acties</h2>
                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors"
                  >
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-white">Mijn Cursussen</span>
                  </Link>
                  <Link
                    href="/cursussen"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-white">Nieuwe Cursus</span>
                  </Link>
                  <Link
                    href="/ebooks"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors"
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-white">E-books</span>
                  </Link>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h2 className="text-xl font-semibold mb-6">Account Instellingen</h2>
                <div className="space-y-3">
                  <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors w-full text-left">
                    <Settings className="w-5 h-5 text-primary" />
                    <span className="text-white">Algemene Instellingen</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors w-full text-left">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="text-white">Notificaties</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors w-full text-left">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="text-white">Betalingsgegevens</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors w-full text-left">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-white">Privacy & Beveiliging</span>
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h2 className="text-xl font-semibold mb-6">Hulp & Ondersteuning</h2>
                <div className="space-y-3">
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-white">Contact Opnemen</span>
                  </Link>
                  <Link
                    href="/over-ons"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-section transition-colors"
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-white">Over Studio Insight</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

