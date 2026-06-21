"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Wrench, Clock, CheckCircle, XCircle, MessageSquare, Send, X, Loader2, Search } from 'lucide-react';

export default function AdminRepairs() {
  const t = useTranslations('Admin');
  const supabase = createClient();
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat State
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchRepairs = async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from('repair_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch error:', error);
      setFetchError(error.message);
    }
    if (data) setRepairs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

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
  }, [selectedRepair]);

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
        sender_role: 'admin',
        message: newMessage.trim()
      });

    if (error) alert('Failed to send message');
    else setNewMessage('');
    setSendingMessage(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('repair_orders')
      .update({ status })
      .eq('id', id);
    
    if (!error) fetchRepairs();
    else alert('Error updating status');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'In Progress': return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      (repair.phone && repair.phone.includes(query)) ||
      (repair.name && repair.name.toLowerCase().includes(query)) ||
      (repair.device && repair.device.toLowerCase().includes(query)) ||
      (repair.auto_order_id && repair.auto_order_id.toString().includes(query))
    );
  });

  return (
    <div className="font-cairo text-right min-h-screen relative" dir="rtl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold font-tajawal text-primary">{t('repairs')}</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* حقل البحث المتطور برقم الموبايل أو الاسم */}
          <div className="relative flex items-center min-w-[280px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="البحث برقم الهاتف أو الاسم أو الجهاز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 pl-3 rounded-xl border-border bg-card font-tajawal text-xs w-full"
            />
          </div>
          <Button onClick={fetchRepairs} variant="outline" size="sm" className="rounded-xl font-tajawal shrink-0">
            تحديث البيانات
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 border border-destructive/20 text-sm">
          خطأ في جلب البيانات: {fetchError}
          <br />
          تأكد من تطبيق كود الـ SQL في Supabase للسماح للأدمن برؤية الطلبات.
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto text-sm">
        <table className="w-full min-w-[800px]">
          <thead className="bg-secondary text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-bold text-right">رقم الجهاز</th>
              <th className="px-6 py-4 font-bold text-right">المستخدم</th>
              <th className="px-6 py-4 font-bold text-right">الجهاز</th>
              <th className="px-6 py-4 font-bold text-right">المشكلة</th>
              <th className="px-6 py-4 font-bold text-right">الحالة</th>
              <th className="px-6 py-4 font-bold text-right">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground font-tajawal">جاري التحميل...</td></tr>
            ) : filteredRepairs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted-foreground opacity-50 font-tajawal">
                  {searchQuery ? "لم يتم العثور على أي نتائج تطابق بحثك." : "لا يوجد طلبات صيانة حالياً."}
                </td>
              </tr>
            ) : (
              filteredRepairs.map(repair => (
                <tr key={repair.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">#{repair.auto_order_id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{repair.name}</div>
                    <div className="text-xs text-muted-foreground">{repair.phone}</div>
                  </td>
                  <td className="px-6 py-4">{repair.device}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={repair.problem}>{repair.problem}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(repair.status)}
                      <span>{repair.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="secondary" size="sm" className="gap-2 rounded-lg" onClick={() => setSelectedRepair(repair)}>
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>{t('chat') || 'المحادثة'}</span>
                    </Button>
                    <select 
                      className="bg-background border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                      value={repair.status}
                      onChange={(e) => updateStatus(repair.id, e.target.value)}
                    >
                      <option value="Pending">قيد الانتظار</option>
                      <option value="In Progress">جارِ الإصلاح</option>
                      <option value="Completed">تم الإصلاح</option>
                      <option value="Cancelled">ملغى</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Chat Sidebar/Overlay */}
      {selectedRepair && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
              <div className="text-right">
                <h3 className="font-bold font-tajawal">محادثة: {selectedRepair.name}</h3>
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
                  لا توجد رسائل بعد. ابدأ المحادثة مع العميل.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender_role === 'admin' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}>
                      {msg.message}
                      <div className={`text-[9px] mt-1 opacity-70 ${msg.sender_role === 'admin' ? 'text-left' : 'text-right'}`}>
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
