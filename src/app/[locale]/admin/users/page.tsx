"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Phone, Mail } from 'lucide-react';

export default function AdminUsers() {
  const t = useTranslations('Admin');
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="font-cairo text-right" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-tajawal text-primary">{t('users')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center p-12">جاري تحميل المستخدمين...</div>
        ) : users.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted-foreground">لم يتم العثور على مستخدمين.</div>
        ) : (
          users.map(user => (
            <div key={user.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {user.role === 'admin' ? <Shield size={24} /> : <User size={24} />}
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="font-tajawal">
                  {user.role === 'admin' ? 'مسؤول' : 'عميل'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="font-medium truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                  <span>تاريخ التسجيل:</span>
                  <span>{new Date(user.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
