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
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  
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
    <div className="flex flex-col md:flex-row min-h-screen bg-secondary/30 relative">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card md:border-l border-b md:border-b-0 border-border flex flex-col md:min-h-screen z-10">
        <div className="p-4 md:p-6 border-b border-border">
          <h2 className="text-2xl font-bold font-tajawal text-primary">{t('control')}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t('access')}</p>
        </div>
        
        <nav className="flex-1 p-4 flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-2 overflow-x-auto hide-scrollbar font-cairo text-right">
          <Link href="/admin" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap shrink-0">
            <LayoutDashboard size={20} className="shrink-0" /> <span className="hidden md:inline">{t('dashboard')}</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap shrink-0">
            <Package size={20} className="shrink-0" /> <span className="hidden md:inline">{t('products')}</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap shrink-0">
            <Package size={20} className="shrink-0" /> <span className="hidden md:inline">{t('orders')}</span>
          </Link>
          <Link href="/admin/repairs" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap shrink-0">
            <Wrench size={20} className="shrink-0" /> <span className="hidden md:inline">{t('repairs')}</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap shrink-0">
            <Users size={20} className="shrink-0" /> <span className="hidden md:inline">{t('users')}</span>
          </Link>
          
          <div className="md:pt-4 md:mt-4 md:border-t md:border-border flex md:flex-col gap-2 md:gap-0 md:space-y-2">
            <p className="hidden md:block px-4 text-xs font-bold text-destructive uppercase tracking-wider mb-2">{t('advanced')}</p>
            <Link href="/admin/advanced/sql" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors whitespace-nowrap shrink-0">
              <Database size={20} className="shrink-0" /> <span className="hidden md:inline">{t('sql')}</span>
            </Link>
            <Link href="/admin/advanced/storage" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors whitespace-nowrap shrink-0">
              <ImageIcon size={20} className="shrink-0" /> <span className="hidden md:inline">{t('storage')}</span>
            </Link>
            <Link href="/admin/advanced/ai" className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-accent/10 text-accent transition-colors whitespace-nowrap shrink-0">
              <Settings size={20} className="shrink-0" /> <span className="hidden md:inline">{t('ai')}</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
