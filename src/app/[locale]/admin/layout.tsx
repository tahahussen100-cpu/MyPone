import { redirect } from '@/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { 
    LayoutDashboard, 
    Database, 
    Image as ImageIcon, 
    Package, 
    Settings,
    Users,
    Wrench
} from 'lucide-react';

export default async function AdminLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const t = await getTranslations('Admin');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
        redirect('/login');
        return null;
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

  if (!profile || profile.role !== 'admin') {
        redirect('/');
        return null;
  }

  return (
        <div className="flex min-h-screen bg-secondary/30">
          {/* Sidebar Navigation */}
              <aside className="w-64 bg-card border-l border-border flex flex-col">
                      <div className="p-6 border-b border-border">
                                <h2 className="text-2xl font-bold font-tajawal text-primary">{t('control')}</h2>h2>
                                <p className="text-xs text-muted-foreground mt-1">{t('access')}</p>p>
                      </div>div>
                      
                      <nav className="flex-1 p-4 space-y-2 font-cairo text-right">
                                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors">
                                            <LayoutDashboard size={20} /> {t('dashboard')}
                                </Link>Link>
                                <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors">
                                            <Package size={20} /> {t('products')}
                                </Link>Link>
                                <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors">
                                            <Package size={20} /> {t('orders')}
                                </Link>Link>
                                <Link href="/admin/repairs" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors">
                                            <Wrench size={20} /> {t('repairs')}
                                </Link>Link>
                                <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors">
                                            <Users size={20} /> {t('users')}
                                </Link>Link>
                                
                                <div className="pt-4 mt-4 border-t border-border">
                                            <p className="px-4 text-xs font-bold text-destructive uppercase tracking-wider mb-2">{t('advanced')}</p>p>
                                            <Link href="/admin/advanced/sql" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                                                          <Database size={20} /> {t('sql')}
                                            </Link>Link>
                                            <Link href="/admin/advanced/storage" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                                                          <ImageIcon size={20} /> {t('storage')}
                                            </Link>Link>
                                            <Link href="/admin/advanced/ai" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 text-accent transition-colors">
                                                          <Settings size={20} /> {t('ai')}
                                            </Link>Link>
                                </div>div>
                      </nav>nav>
              </aside>aside>
        
          {/* Main Content */}
              <main className="flex-1 p-8 overflow-y-auto">
                {children}
              </main>main>
        </div>div>
      );
}</div>
