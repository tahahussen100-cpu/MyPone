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
  }, [supabase]);

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary font-tajawal">My Phone</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-cairo">
          <Link href="/">{t('home')}</Link>
          <Link href="/products">{t('products')}</Link>
          <Link href="/accessories">{t('accessories')}</Link>
          <Link href="/repair">{t('repair')}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleLanguage}><Globe className="h-5 w-5" /></Button>
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{cartItemCount}</span>}
          </Link>
          {!user && <Link href="/login"><Button size="sm">{t('login')}</Button></Link>}
        </div>
      </div>
    </header>
  );
}
