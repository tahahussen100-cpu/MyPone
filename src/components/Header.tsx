"use client";

import Link from 'next/link';
import { usePathname, useRouter } from '@/navigation';
import { useAppStore, currencySymbols } from '@/lib/store';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { ShoppingCart, LogIn, Search, Globe, Moon, Sun, User, LogOut, Settings, Wrench, Package } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const { cart, currency, setCurrency } = useAppStore();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary font-tajawal">My Phone</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-cairo">
          <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors">{t('home')}</Link>
          <Link href="/products" className="text-foreground/80 hover:text-foreground transition-colors">{t('products')}</Link>
          <Link href="/accessories" className="text-foreground/80 hover:text-foreground transition-colors">{t('accessories')}</Link>
          <Link href="/repair" className="text-foreground/80 hover:text-foreground transition-colors">{t('repair')}</Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-1">
              <Settings className="h-4 w-4" />
              {t('admin')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              className="pl-8 h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as any)}
            className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm font-cairo cursor-pointer"
          >
            <option value="EGP">EGP ({currencySymbols.EGP})</option>
            <option value="USD">USD ({currencySymbols.USD})</option>
            <option value="SAR">SAR ({currencySymbols.SAR})</option>
            <option value="EUR">EUR ({currencySymbols.EUR})</option>
          </select>

          <Button variant="ghost" size="icon" onClick={toggleLanguage} title="Switch Language">
            <Globe className="h-5 w-5" />
            <span className="sr-only">Toggle language</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user && (
            <div className="flex items-center gap-2">
              <Link href="/my-repairs">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden lg:flex items-center gap-2 font-cairo bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white border-none shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 px-4"
                  title={locale === 'ar' ? 'تتبع الصيانة' : 'Track Repair'}
                >
                  <Wrench className="h-4 w-4" />
                  <span className="whitespace-nowrap">{locale === 'ar' ? 'تتبع الصيانة' : 'Track Repair'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="lg:hidden bg-gradient-to-r from-amber-400 to-amber-600 text-white border-none"
                >
                  <Wrench className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/my-orders">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden lg:flex items-center gap-2 font-cairo bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 px-4"
                  title={locale === 'ar' ? 'تتبع الطلبات' : 'Track Orders'}
                >
                  <Package className="h-4 w-4" />
                  <span className="whitespace-nowrap">{locale === 'ar' ? 'تتبع الطلبات' : 'Track Orders'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="lg:hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-bold font-tajawal text-foreground truncate max-w-[120px]">
                  {user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {profile?.role || 'User'}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title={t('logout')}>
                <LogOut className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm" className="hidden sm:flex items-center gap-2 font-cairo">
                <LogIn className="h-4 w-4" />
                {t('login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
