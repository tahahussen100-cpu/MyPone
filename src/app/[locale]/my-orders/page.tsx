"use client";

import { useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Clock, CheckCircle2, XCircle, Trash2, ArrowRight, MessageSquare, Send, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const locale = useLocale();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMyOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedOrder) {
      fetchMessages(selectedOrder.id);
      
      const channel = supabase
        .channel(`order_chat:${selectedOrder.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'order_messages',
          filter: `order_id=eq.${selectedOrder.id}`
        }, (payload) => {
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
        sender_role: 'user',
        message: newMessage.trim()
      });

    if (error) alert('Failed to send message');
    else setNewMessage('');
    setSendingMessage(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب نهائياً؟' : 'Are you sure you want to permanently delete this order?')) return;
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (!error) {
      setOrders(orders.filter(o => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } else {
      alert(locale === 'ar' ? 'فشل حذف الطلب' : 'Failed to delete order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Confirmed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Delivered': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl font-cairo" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-10 text-right">
        <h1 className="text-4xl font-bold font-tajawal text-primary mb-2">
          {locale === 'ar' ? 'طلباتي' : 'My Orders'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar' ? 'تابع حالة طلباتك وتواصل مع الإدارة' : 'Track your orders and chat with admin'}
        </p>
      </div>

      <div className="space-y-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-card rounded-2xl animate-pulse border border-border"></div>
          ))
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-xl text-muted-foreground mb-6">
              {locale === 'ar' ? 'لم تقم بإجراء أي طلبات حتى الآن.' : 'You haven\'t placed any orders yet.'}
            </p>
            <Link href="/products">
              <Button variant="default" className="rounded-xl px-8">
                {locale === 'ar' ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}
              </Button>
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                    #{order.auto_order_id || order.id.slice(0, 8)}
                  </span>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="text-xl font-bold text-primary">
                  {order.total.toFixed(2)} ج.م
                </div>
              </div>

              <div className="mb-6 space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm text-right">
                    <span>{locale === 'ar' ? item.products?.name_ar : item.products?.name_en} x {item.quantity}</span>
                    <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  onClick={() => handleDelete(order.id)}
                  title={locale === 'ar' ? 'حذف الطلب' : 'Delete Order'}
                >
                  <Trash2 size={20} />
                </Button>

                <Button 
                  variant="secondary" 
                  className="gap-2 rounded-xl"
                  onClick={() => setSelectedOrder(order)}
                >
                  <MessageSquare size={16} />
                  {locale === 'ar' ? 'المحادثة' : 'Chat'}
                </Button>
                
                <Link href={`/cart`} className="hidden">
                  <Button variant="outline" className="gap-2 rounded-xl">
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
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
              <div className="text-right">
                <h3 className="font-bold font-tajawal">محادثة بخصوص الطلب</h3>
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
                  لا توجد رسائل بعد. استفسر عن حالة طلبك هنا.
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
