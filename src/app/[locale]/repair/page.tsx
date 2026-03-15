"use client";

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Clock, Wrench, ShieldCheck, Mail, Hash, Truck } from 'lucide-react';

export default function RepairPage() {
  const locale = useLocale();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    device: '',
    problem: '',
  });
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);

  useEffect(() => {
    async function getEmail() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) setUserEmail(session.user.email);
    }
    getEmail();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      const { data, error } = await supabase
        .from('repair_orders')
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          phone: formData.phone,
          device: formData.device,
          problem: formData.problem,
          status: 'Pending'
        })
        .select('auto_order_id')
        .single();

      if (error) throw error;

      setLastOrderId(data.auto_order_id);
      setSuccess(true);
      setFormData({ name: '', phone: '', device: '', problem: '' });
      
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(locale === 'ar' 
        ? `عذراً، حدث خطأ أثناء الإرسال: ${err.message}` 
        : `Sorry, an error occurred: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTrackResult(null);
    try {
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .or(`id.eq.${trackId},auto_order_id.eq.${parseInt(trackId) || 0}`)
        .single();
        
      if (error || !data) {
        alert(locale === 'ar' ? 'رقم التتبع غير صحيح' : 'Invalid tracking ID');
      } else {
        setTrackResult(data);
      }
    } catch {
      alert(locale === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center font-cairo" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-card border border-primary/20 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle2 size={48} />
            </div>
          </div>

          <h2 className="text-3xl font-bold font-tajawal mb-4 text-primary">
            {locale === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Request Submitted Successfully!'}
          </h2>
          
          <p className="text-muted-foreground mb-8 text-lg">
            {locale === 'ar' 
              ? 'شكراً لثقتك بنا. طلبك الآن قيد المراجعة وسنقوم بالتواصل معك قريباً.' 
              : 'Thank you for your trust. Your request is under review and we will contact you soon.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-secondary/50 p-4 rounded-2xl border border-border flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Hash size={20} /></div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'رقم التتبع' : 'Tracking ID'}</div>
                <div className="font-bold text-lg">#{lastOrderId}</div>
              </div>
            </div>
            <div className="bg-secondary/50 p-4 rounded-2xl border border-border flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Mail size={20} /></div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                <div className="font-bold text-sm truncate max-w-[150px]">{userEmail || 'Guest'}</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4 text-right mb-10">
            <Truck className="text-blue-500 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-blue-500">
                {locale === 'ar' ? 'تنبيه هـام' : 'Important Note'}
              </p>
              <p className="text-sm text-blue-700/80 leading-relaxed">
                {locale === 'ar'
                  ? 'بمجرد قبول الطلب من قبل الإدارة، سيقوم مندوبنا بالتواصل معك لاستلام الجهاز من منزلك وبدء عملية الصيانة.'
                  : 'Once the request is approved, our representative will contact you to pick up the device from your home for repair.'}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setSuccess(false)} variant="outline" className="flex-1 rounded-xl py-6">
              {locale === 'ar' ? 'إرسال طلب آخر' : 'Submit Another'}
            </Button>
            <Button onClick={() => window.location.href = '/'} className="flex-1 rounded-xl py-6">
              {locale === 'ar' ? 'العودة للرئيسية' : 'Go Home'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-tajawal text-primary mb-4">
          {locale === 'ar' ? 'مركز الصيانة المعتمد' : 'Authorized Repair Center'}
        </h1>
        <p className="text-muted-foreground font-cairo max-w-2xl mx-auto text-lg leading-relaxed">
          {locale === 'ar' 
            ? 'نقدم خدمات صيانة احترافية بقطع غيار أصلية مع ضمان على الإصلاح. قدم طلبك الآن أو تتبع حالة جهازك.' 
            : 'We offer professional repair services with genuine parts and warranty. Submit a request or track your device.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Reservation Form */}
        <div className="bg-card border border-border rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mt-12"></div>
          
          <h2 className="text-3xl font-bold font-tajawal mb-8 pb-4 border-b border-border flex items-center gap-3">
            <Wrench className="text-primary" />
            {locale === 'ar' ? 'طلب صيانة جديد' : 'New Repair Request'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 font-cairo shadow-none text-right">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 pr-1">{locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
              <Input required className="rounded-xl h-12 bg-secondary/30" placeholder={locale === 'ar' ? 'ادخل اسمك' : 'Enter your name'} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 pr-1">{locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
              <Input required type="tel" className="rounded-xl h-12 bg-secondary/30" placeholder="012XXXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 pr-1">{locale === 'ar' ? 'نوع الجهاز وموديله' : 'Device Model'}</label>
              <Input required className="rounded-xl h-12 bg-secondary/30" placeholder="مثال: iPhone 13 Pro Max" value={formData.device} onChange={e => setFormData({...formData, device: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 pr-1">{locale === 'ar' ? 'وصف العطل' : 'Problem Description'}</label>
              <textarea 
                required
                className="flex min-h-[120px] w-full rounded-2xl border border-input bg-secondary/30 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all outline-none"
                placeholder={locale === 'ar' ? 'برجاء شرح المشكلة بالتفصيل...' : 'Please describe the issue...'}
                value={formData.problem} 
                onChange={e => setFormData({...formData, problem: e.target.value})} 
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold font-tajawal shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform" disabled={loading}>
              {loading ? (locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (locale === 'ar' ? 'تأكيد إرسال الطلب' : 'Confirm Submission')}
            </Button>
          </form>
        </div>

        {/* Tracking Section */}
        <div className="space-y-8">
          <div className="bg-secondary/40 border border-border rounded-3xl p-10 shadow-lg h-fit">
            <h2 className="text-2xl font-bold font-tajawal mb-8 pb-4 border-b border-border flex items-center gap-3 text-right" dir="rtl">
              <Clock className="text-primary" />
              {locale === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
            </h2>
            
            <form onSubmit={handleTrack} className="space-y-4 font-cairo mb-8 shadow-none text-right" dir="rtl">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground mr-1">{locale === 'ar' ? 'رقم التتبع (Order ID)' : 'Tracking ID'}</label>
                <div className="flex gap-2">
                  <Input required className="rounded-xl h-12 bg-background shadow-inner" value={trackId} onChange={e => setTrackId(e.target.value)} placeholder="مثال: 55" />
                  <Button type="submit" className="h-12 px-8 rounded-xl" disabled={loading}>
                    {loading ? '...' : (locale === 'ar' ? 'بحث' : 'Search')}
                  </Button>
                </div>
              </div>
            </form>

            {trackResult && (
              <div className="bg-background rounded-2xl p-6 border border-primary/20 font-cairo shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <ShieldCheck />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">حالة الطلب الحالية</div>
                    <div className="text-xl font-black text-primary font-tajawal">{trackResult.status}</div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border text-right">
                     <span className="font-bold">{trackResult.device}</span>
                     <span className="text-muted-foreground">الجهاز</span>
                  </div>
                  <div className="py-2 text-right">
                    <div className="text-muted-foreground mb-1">المشكلة المذكورة</div>
                    <p className="bg-secondary/50 p-3 rounded-lg text-xs leading-relaxed">{trackResult.problem}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm"><ShieldCheck className="text-primary" /></div>
            <div className="text-right" dir="rtl">
              <h4 className="font-bold text-foreground">ضمان حقيقي</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">جميع عمليات الصيانة لدينا تأتي مع ضمان معتمد على قطع الغيار والعمل الفني لمدة تصل إلى ٩٠ يوماً.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
