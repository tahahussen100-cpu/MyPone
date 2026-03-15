"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Navigation');
  const d = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground mt-12 py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold font-tajawal text-primary mb-4">My Phone</h3>
          <p className="text-sm text-muted-foreground font-cairo">
            {t('home') === 'Home' 
              ? 'Your one-stop shop for mobile phones, accessories, and professional repair services in Egypt.' 
              : 'وجهتك الأولى للهواتف المحمولة والإكسسوارات وخدمات الصيانة الاحترافية في مصر.'}
          </p>
        </div>
        
        <div>
          <h4 className="font-bold font-tajawal mb-4">{t('home') === 'Home' ? 'Quick Links' : 'روابط سريعة'}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground font-cairo">
            <li><Link href="/products" className="hover:text-primary transition-colors">{t('products')}</Link></li>
            <li><Link href="/accessories" className="hover:text-primary transition-colors">{t('accessories')}</Link></li>
            <li><Link href="/repair" className="hover:text-primary transition-colors">{t('repair')}</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">{t('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold font-tajawal mb-4">{t('home') === 'Home' ? 'Contact Us' : 'تواصل معنا'}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground font-cairo">
            <li>📞 01223736692</li>
            <li>✉️ tahahussen100@gmail.com</li>
            <li>📍 {t('home') === 'Home' ? 'Egypt' : 'مصر'}</li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground font-cairo">
        &copy; {d} My Phone Store. {t('home') === 'Home' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
      </div>
    </footer>
  );
}
