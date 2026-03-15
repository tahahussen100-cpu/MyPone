"use client";

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Package, Wrench } from 'lucide-react';

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
        setUser({ ...user, profile });
      }
      setLoading(false);
    };
    getUser();
  }, [router, supabase.auth, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <User size={40} />
            </div>
            <h2 className="text-center font-bold truncate">{user.email}</h2>
            {user.profile?.role === 'admin' && (
              <div className="mt-2 text-center">
                <span className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded font-bold">Administrator</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 font-cairo">
            <Button variant="outline" className="justify-start gap-2 h-12" onClick={() => router.push('/profile/edit')}>
              <Settings size={18} /> {locale === 'ar' ? 'تعديل البيانات' : 'Edit Info'}
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-12" onClick={() => router.push('/profile/orders')}>
              <Package size={18} /> {locale === 'ar' ? 'طلباتي' : 'My Orders'}
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-12" onClick={() => router.push('/profile/repairs')}>
              <Wrench size={18} /> {locale === 'ar' ? 'طلبات الصيانة' : 'Repair Requests'}
            </Button>
            {user.profile?.role === 'admin' && (
              <Button variant="default" className="justify-start gap-2 h-12 mt-4" onClick={() => router.push('/admin')}>
                <Settings size={18} /> {locale === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
              </Button>
            )}
            <Button variant="destructive" className="justify-start gap-2 h-12 mt-4" onClick={handleLogout}>
              <LogOut size={18} /> {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow bg-card border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold font-tajawal mb-6 pb-2 border-b border-border">
            {locale === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back'}
          </h2>
          <p className="text-muted-foreground font-cairo">
            {locale === 'ar' 
              ? 'اختر من القائمة الجانبية لتصفح طلباتك السابقة أو متابعة الصيانة أو تعديل بياناتك الشخصية.' 
              : 'Select from the side menu to browse your previous orders, track repairs, or edit your personal information.'}
          </p>
        </div>

      </div>
    </div>
  );
}
