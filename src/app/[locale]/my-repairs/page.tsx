"use client";

import { useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Wrench, CheckCircle2, XCircle, Trash2, ArrowRight, MessageSquare, Send, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyRepairsPage() {
  const locale = useLocale();
  const supabase = createClient();
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMyRepairs = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }

    const { data, error } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setRepairs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyRepairs();
  }, [supabase]);

  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRepair) {
      fetchMessages(selectedRepair.id);
      
      const channel = supabase
        .channel(`chat:${selectedRepair.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'repair_messages',
          filter: `repair_id=eq.${selectedRepair.id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedRepair, supabase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (repairId: string) => {
    const { data } = await supabase
      .from('repair_messages')
      .select('*')
      .eq('repair_id', repairId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRepair) return;

    setSendingMessage(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('repair_messages')
      .insert({
        repair_id: selectedRepair.id,
        sender_id: session?.user?.id,
        sender_role: 'user',
        message: newMessage.trim()
      });

    if (error) alert('Failed to send message');
    else setNewMessage('');
    setSendingMessage(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this request?')) return;
    
    setCancellingId(id);
    const { error } = await supabase
      .from('repair_orders')
      .update({ status: 'Cancelled' })
      .eq('id', id);

    if (!error) {
      setRepairs(repairs.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
    } else {
      alert(locale === 'ar' ? 'فشل الغاء الطلب' : 'Failed to cancel request');
    }
    setCancellingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب نهائياً من القائمة؟' : 'Are you sure you want to permanently delete this request from the list?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('repair_orders')
      .delete()
      .eq('id', id);

    if (!error) {
      setRepairs(repairs.filter(r => r.id !== id));
      if (selectedRepair?.id === id) setSelectedRepair(null);
    } else {
      alert(locale === 'ar' ? 'فشل حذف الطلب' : 'Failed to delete request');
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'In Progress': return <Wrench size={16} />;
      case 'Completed': return <CheckCircle2 size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl font-cairo" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold font-tajawal text-primary mb-2">
            {locale === 'ar' ? 'طلبات الصيانة الخاصة بي' : 'My Repair Requests'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'تتبع حالة أجهزتك وتواصل مع الإدارة' : 'Track your device status and chat with admin'}
          </p>
        </div>
        <Link href="/repair">
          <Button className="gap-2 rounded-xl">
            <Wrench size={18} />
            {locale === 'ar' ? 'طلب جديد' : 'New Request'}
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl animate-pulse border border-border"></div>
          ))
        ) : repairs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <Wrench size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-xl text-muted-foreground mb-6">
              {locale === 'ar' ? 'لم تقم بإرسال أي طلبات صيانة بعد.' : 'You haven\'t submitted any repair requests yet.'}
            </p>
            <Link href="/repair">
              <Button variant="outline" className="rounded-xl">
                {locale === 'ar' ? 'اطلب صيانة الآن' : 'Request Repair Now'}
              </Button>
            </Link>
          </div>
        ) : (
          repairs.map((repair) => (
            <div key={repair.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              <div className="flex-1 space-y-2 text-right">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                    #{repair.auto_order_id}
                  </span>
                  <Badge variant="outline" className={getStatusColor(repair.status)}>
                    <span className="flex items-center gap-1.5 py-0.5">
                      {getStatusIcon(repair.status)}
                      {repair.status}
                    </span>
                  </Badge>
                </div>
                <h3 className="text-xl font-bold">{repair.device}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{repair.problem}</p>
                <div className="text-[10px] text-muted-foreground pt-1">
                  {new Date(repair.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'long' })}
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {/* Trash Icon for deletion */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  onClick={() => handleDelete(repair.id)}
                  title={locale === 'ar' ? 'حذف الطلب' : 'Delete Request'}
                >
                  <Trash2 size={20} />
                </Button>

                <Button 
                  variant="secondary" 
                  className="flex-1 md:flex-none gap-2 rounded-xl"
                  onClick={() => setSelectedRepair(repair)}
                >
                  <MessageSquare size={16} />
                  {locale === 'ar' ? 'المحادثة' : 'Chat'}
                </Button>
                
                {repair.status === 'Pending' && (
                  <Button 
                    variant="destructive" 
                    className="flex-1 md:flex-none gap-2 rounded-xl text-xs"
                    onClick={() => handleCancel(repair.id)}
                    disabled={cancellingId === repair.id}
                  >
                    {locale === 'ar' ? 'إلغاء الطلب' : 'Cancel Request'}
                  </Button>
                )}
                
                <Link href={`/repair?track=${repair.auto_order_id}`} className="flex-1 md:flex-none">
                  <Button variant="outline" className="w-full gap-2 rounded-xl">
                    <ArrowRight size={16} className={locale === 'ar' ? 'rotate-180' : ''} />
                    {locale === 'ar' ? 'التفاصيل' : 'Details'}
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Sidebar/Overlay */}
      {selectedRepair && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
              <div className="text-right">
                <h3 className="font-bold font-tajawal">محادثة مع الدعم الفني</h3>
                <p className="text-[10px] text-muted-foreground">طلب #{selectedRepair.auto_order_id} - {selectedRepair.device}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedRepair(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm opacity-50">
                  لا توجد رسائل بعد. انتظر رد الإدارة أو ابدأ بالاستفسار.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender_role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}>
                      {msg.message}
                      <div className={`text-[9px] mt-1 opacity-70 ${msg.sender_role === 'user' ? 'text-left' : 'text-right'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2 bg-background">
              <Input 
                placeholder="اكتب رسالتك هنا..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                disabled={sendingMessage}
                className="rounded-xl border-border"
              />
              <Button type="submit" size="icon" disabled={sendingMessage || !newMessage.trim()} className="rounded-xl shrink-0">
                {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
