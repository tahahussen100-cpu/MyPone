"use client";

import { useAppStore, currencySymbols } from '@/lib/store';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from '@/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, currency } = useAppStore();
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const cartIds = cart.map((item: any) => item.productId);
      const { data } = await supabase
        .from('products')
        .select('*')
        .not('id', 'in', `(${cartIds.length > 0 ? cartIds.join(',') : '\"\"'})`)
        .limit(4);
      if (data) setSuggestions(data);
    };
    fetchSuggestions();
  }, [cart, supabase]);

  const getPrice = (priceInEgp: number) => {
    let p = priceInEgp;
    if (currency === 'USD') p = p * 0.021;
    if (currency === 'SAR') p = p * 0.078;
    if (currency === 'EUR') p = p * 0.019;
    return p;
  };

  const total = cart.reduce((acc, item) => acc + (getPrice(item.price) * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingCartIcon className="w-24 h-24 text-muted-foreground mb-6 opacity-20" />
        <h1 className="text-3xl font-bold font-tajawal mb-4">
          {locale === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {locale === 'ar' ? 'تصفح منتجاتنا وأضف ما يعجبك هنا!' : 'Browse our products and add what you like here!'}
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8">
            {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          </Button>
        </Link>
        
        {suggestions.length > 0 && (
          <div className="mt-20 w-full max-w-6xl">
            <h2 className="text-2xl font-bold font-tajawal mb-8 text-right">
              {locale === 'ar' ? 'مقترحات لك' : 'Suggested for You'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold font-tajawal mb-8 pb-2 border-b border-border">
        {locale === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border border-border rounded-xl bg-card">
              <div className="relative w-24 h-24 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name_en} fill className="object-cover" />
              </div>
              
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-tajawal font-bold text-lg">
                    {locale === 'ar' ? item.name_ar : item.name_en}
                  </h3>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <p className="font-cairo font-bold text-primary">
                    {getPrice(item.price).toFixed(2)} {currencySymbols[currency]}
                  </p>
                  
                  <div className="flex items-center gap-3 bg-secondary rounded-full p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h3 className="text-xl font-bold font-tajawal mb-6">
              {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h3>
            
            <div className="space-y-4 mb-6 font-cairo">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-bold">{total.toFixed(2)} {currencySymbols[currency]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === 'ar' ? 'الشحن' : 'Shipping'}</span>
                <span className="text-accent font-bold">{locale === 'ar' ? 'يتم حسابه لاحقاً' : 'Calculated next'}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold font-tajawal text-lg">{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="font-bold font-cairo text-2xl text-primary">
                  {total.toFixed(2)} {currencySymbols[currency]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === 'ar' ? 'شامل ضريبة القيمة المضافة' : 'Includes VAT'}
              </p>
            </div>

            <Button 
              className="w-full h-12 text-lg rounded-full flex items-center justify-center gap-2"
              onClick={() => router.push('/checkout')}
            >
              {locale === 'ar' ? 'متابعة الدفع' : 'Proceed to Checkout'}
              {locale === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-12 border-t border-border pt-12">
          <h2 className="text-2xl font-bold font-tajawal mb-8">
            {locale === 'ar' ? 'قد يعجبك أيضاً' : 'You Might Also Like'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
