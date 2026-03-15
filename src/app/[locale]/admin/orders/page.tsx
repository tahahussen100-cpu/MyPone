"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Trash2, X, Send, Loader2 } from 'lucide-react';

export default function AdminOrders() {
  const t = useTranslations('Admin');
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(email)')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      fetchMessages(selectedOrder.id);
      
      const channel = supabase
        .channel(`admin_order_chat:${selectedOrder.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'order_messages',
          filter: `order_id=eq.${selectedOrder.id}`
        }, (payload: any) => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedOrder]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (orderId: string) => {
    const { data } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOrder) return;

    setSendingMessage(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('order_messages')
      .insert({
        order_id: selectedOrder.id,
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
      .from('orders')
      .update({ status })
      .eq('id', id);
    
    if (!error) fetchOrders();
    else alert('Error updating status');
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) fetchOrders();
    else alert('Error deleting order');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="font-cairo text-right" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-tajawal text-primary">{t('orders')}</h1>
        <Button onClick={fetchOrders} variant="outline" size="sm">تحديث</Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden text-sm">
        <table className="w-full text-right">
          <thead className="bg-secondary text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-bold">رقم الطلب</th>
              <th className="px-6 py-4 font-bold">العميل</th>
              <th className="px-6 py-4 font-bold text-center">التاريخ</th>
              <th className="px-6 py-4 font-bold text-center">المبلغ</th>
              <th className="px-6 py-4 font-bold text-center">الحالة</th>
              <th className="px-6 py-4 font-bold text-left">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">جاري التحميل...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground opacity-50">لا يوجد طلبات حالياً.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">#{order.auto_order_id || order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{order.users?.email || 'عميل غير مسجل'}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-center">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-4 text-center font-bold text-primary">{order.total} ج.م</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-end">
                    <Button variant="secondary" size="sm" className="gap-2 rounded-lg" onClick={() => setSelectedOrder(order)}>
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>المحادثة</span>
                    </Button>
                    <select 
                      className="bg-background border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="Pending">قيد الانتظار</option>
                      <option value="Confirmed">تم التأكيد</option>
                      <option value="Shipped">تم الشحن</option>
                      <option value="Delivered">تم التوصيل</option>
                      <option value="Cancelled">ملغى</option>
                    </select>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteOrder(order.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Chat Sidebar/Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
              <div className="text-right">
                <h3 className="font-bold font-tajawal">محادثة: {selectedOrder.users?.email || 'عميل'}</h3>
                <p className="text-[10px] text-muted-foreground">طلب #{selectedOrder.auto_order_id || selectedOrder.id.slice(0, 8)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm opacity-50">
                  لا توجد رسائل بعد. ابدأ المحادثة بخصوص الطلب.
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
