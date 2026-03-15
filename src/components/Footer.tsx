"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Navigation');
  return (
    <footer className="w-full border-t border-border bg-card py-8 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
        <div>
          <h3 className="text-xl font-bold font-tajawal text-primary mb-4">My Phone</h3>
          <p className="text-sm text-muted-foreground">{t('home') === 'Home' ? 'Your shop in Egypt' : 'متجرك الأول في مصر'}</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t('home') === 'Home' ? 'Contact' : 'تواصل معنا'}</h4>
          <p className="text-sm">📞 01223736692</p>
        </div>
      </div>
    </footer>
  );
}
