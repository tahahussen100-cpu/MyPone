"use client";

import { useAppStore, currencySymbols } from '@/lib/store';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

const governorates = [
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'البحر الأحمر', en: 'Red Sea' },
  { ar: 'البحيرة', en: 'Beheira' },
  { ar: 'الفيوم', en: 'Fayoum' },
  { ar: 'الغربية', en: 'Gharbia' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'المنوفية', en: 'Menofia' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'القليوبية', en: 'Qalyubia' },
  { ar: 'الوادي الجديد', en: 'New Valley' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'اسوان', en: 'Aswan' },
  { ar: 'اسيوط', en: 'Assiut' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'الشرقية', en: 'Sharkia' },
  { ar: 'جنوب سيناء', en: 'South Sinai' },
  { ar: 'كفر الشيخ', en: 'Kafr Al sheikh' },
  { ar: 'مطروح', en: 'Matrouh' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'شمال سيناء', en: 'North Sinai' },
  { ar: 'سوهاج', en: 'Sohag' },
];

export default function CheckoutPage() {
  const { cart, clearCart, currency } = useAppStore();
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    governorate: '',
    city: '',
    address: '',
  });

  const getPrice = (priceInEgp: number) => {
    let p = priceInEgp;
    if (currency === 'USD') p = p * 0.021;
    if (currency === 'SAR') p = p * 0.078;
    if (currency === 'EUR') p = p * 0.019;
    return p;
  };

  const total = cart.reduce((acc, item) => acc + (getPrice(item.price) * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        alert(locale === 'ar' ? 'يجب تسجيل الدخول لإتمام الطلب' : 'You must be logged in to complete the order');
        router.push('/login');
        return;
      }

      const user = session.user;
      const addressDetails = `${formData.city}, ${formData.address}`;
      
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          governorate: formData.governorate,
          address_details: addressDetails,
          phone: formData.phone,
          status: 'Pending'
        })
        .select()
        .single();
        
      if (orderError) {
        console.error('Order Error:', orderError);
        throw new Error(orderError.message);
      }

      // 2. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Items Error:', itemsError);
        throw new Error(itemsError.message);
      }

      clearCart();
      alert(locale === 'ar' ? 'تم تأكيد طلبك بنجاح!' : 'Order confirmed successfully!');
      router.push('/my-orders'); // Updated to point to our new page
    } catch (error: any) {
      console.error('Checkout Error:', error);
      alert(locale === 'ar' ? `فشل تأكيد الطلب: ${error.message}` : `Failed to confirm order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold font-tajawal mb-8 text-primary">
        {locale === 'ar' ? 'إتمام الطلب' : 'Checkout'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold font-tajawal mb-6">
            {locale === 'ar' ? 'بيانات الشحن' : 'Shipping Details'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 font-cairo shadow-none">
            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
              </label>
              <Input 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <Input 
                required 
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'المحافظة' : 'Governorate'}
              </label>
              <select 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.governorate}
                onChange={e => setFormData({...formData, governorate: e.target.value})}
              >
                <option value="">{locale === 'ar' ? 'اختر المحافظة' : 'Select Governorate'}</option>
                {governorates.map(gov => (
                  <option key={gov.en} value={gov.en}>
                    {locale === 'ar' ? gov.ar : gov.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'المدينة / المنطقة' : 'City / Area'}
              </label>
              <Input 
                required 
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {locale === 'ar' ? 'العنوان بالتفصيل' : 'Detailed Address'}
              </label>
              <textarea 
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="pt-4 border-t border-border mt-6">
              <p className="font-bold text-accent mb-4">
                {locale === 'ar' ? 'طريقة الدفع: الدفع عند الاستلام فقط' : 'Payment Method: Cash on Delivery Only'}
              </p>
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading 
                  ? (locale === 'ar' ? 'جاري التنفيذ...' : 'Processing...') 
                  : (locale === 'ar' ? 'تأكيد الطلب' : 'Confirm Order')}
              </Button>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-secondary rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold font-tajawal mb-6">
              {locale === 'ar' ? 'ملخص الطلبية' : 'Order Summary'}
            </h2>
            <div className="space-y-4 mb-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                    <span className="truncate max-w-[150px]">{locale === 'ar' ? item.name_ar : item.name_en}</span>
                  </span>
                  <span className="font-bold">
                    {(getPrice(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="text-primary">{total.toFixed(2)} {currencySymbols[currency]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
