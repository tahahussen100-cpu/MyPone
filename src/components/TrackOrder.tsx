"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, AlertTriangle } from 'lucide-react';

interface Order {
  id: string;
  phone: string;
  device: string;
  status: 'received' | 'inspecting' | 'repairing' | 'ready';
}

// 1. قاعدة بيانات وهمية لغرض تجربة الخدمة
const mockOrders: Order[] = [
  { id: "MP-2026-9021", phone: "0101234567", device: "iPhone 15 Pro Max", status: "received" },
  { id: "MP-2026-4832", phone: "0123456789", device: "Samsung Galaxy S24 Ultra", status: "inspecting" },
  { id: "MP-2026-7391", phone: "0159876543", device: "iPad Pro M4 (13-inch)", status: "repairing" },
  { id: "MP-2026-1054", phone: "0114444555", device: "MacBook Pro 16\" M3 Max", status: "ready" },
  { id: "MP-2026-2244", phone: "0509998888", device: "Google Pixel 8 Pro", status: "ready" }
];

export default function TrackOrder() {
  const t = useTranslations('Index');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // التحقق من الإدخال: قبول الأرقام فقط وتصفية أي مدخلات أخرى فورياً
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, '');
    setPhoneNumber(cleanValue);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = phoneNumber.trim();

    if (!query) {
      setSearchResult(null);
      setHasSearched(false);
      return;
    }

    // منطق البحث المرن: يطابق رقم الهاتف بالكامل أو آخر 4 أرقام إذا أدخل المستخدم 4 أرقام
    const matchedOrder = mockOrders.find(order => {
      if (order.phone === query) return true;
      if (query.length === 4 && order.phone.endsWith(query)) return true;
      return false;
    });

    setSearchResult(matchedOrder || null);
    setHasSearched(true);
  };

  // إعداد نصوص وألوان الحالات
  const getStatusConfig = (status: Order['status']) => {
    const statusMap = {
      received: {
        text: t('statusReceived'),
        colors: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900',
      },
      inspecting: {
        text: t('statusInspecting'),
        colors: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900',
      },
      repairing: {
        text: t('statusRepairing'),
        colors: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900',
      },
      ready: {
        text: t('statusReady'),
        colors: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-900',
      }
    };
    return statusMap[status] || { text: status, colors: 'text-gray-600 bg-gray-50' };
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm max-w-xl mx-auto my-12 transition-all duration-300 hover:shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold font-tajawal text-foreground mb-3 relative inline-block">
          {t('trackTitle')}
          <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"></span>
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-3 font-tajawal max-w-sm mx-auto leading-relaxed">
          {t('trackSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="trackPhoneNumber" className="text-sm font-bold font-tajawal text-foreground block">
            {t('phoneLabel')}
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
            <Input
              id="trackPhoneNumber"
              type="text"
              inputMode="numeric"
              value={phoneNumber}
              onChange={handleInputChange}
              placeholder={t('phonePlaceholder')}
              className="pr-11 pl-4 py-6 font-tajawal font-medium text-base rounded-xl bg-background border-2 border-border focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 rounded-xl font-bold font-tajawal text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {t('searchBtn')}
        </Button>
      </form>

      {/* عرض نتائج البحث */}
      {hasSearched && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {searchResult ? (
            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="bg-primary/5 border-b border-border px-5 py-4 flex justify-between items-center">
                <span className="text-xs font-bold text-primary font-tajawal">{t('successCardTitle')}</span>
                <span className="text-sm font-extrabold text-foreground font-tajawal">{searchResult.id}</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-dashed border-border pb-3">
                  <span className="text-sm text-muted-foreground font-tajawal font-medium">{t('deviceLabel')}</span>
                  <span className="text-sm font-bold text-foreground font-tajawal">{searchResult.device}</span>
                </div>
                <div className="flex justify-between items-center border-b border-dashed border-border pb-3">
                  <span className="text-sm text-muted-foreground font-tajawal font-medium">{t('phoneLabelShort')}</span>
                  <span className="text-sm font-bold text-foreground font-tajawal direction-ltr">{searchResult.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-tajawal font-medium">{t('statusLabel')}</span>
                  {(() => {
                    const config = getStatusConfig(searchResult.status);
                    return (
                      <Badge className={`px-4 py-1.5 rounded-full text-xs font-bold border ${config.colors}`}>
                        {config.text}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 rounded-xl p-4 flex gap-3 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-tajawal font-medium leading-relaxed">
                {t('notFoundError')}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
