-- SQL for Order Enhancements
-- 1. Add auto_order_id to orders for easier tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS auto_order_id SERIAL;

-- 2. Create order_messages table for chat
CREATE TABLE IF NOT EXISTS public.order_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id),
  sender_role TEXT CHECK (sender_role IN ('user', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable RLS and add policies
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage order messages" ON public.order_messages;
CREATE POLICY "Admins can manage order messages" ON public.order_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can view own order messages" ON public.order_messages;
CREATE POLICY "Users can view own order messages" ON public.order_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert order messages" ON public.order_messages;
CREATE POLICY "Users can insert order messages" ON public.order_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- 4. Allow users to delete their own orders (Trash icon functionality)
DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;
CREATE POLICY "Users can delete own orders" ON public.orders FOR DELETE USING (auth.uid() = user_id);

-- 5. Ensure admins can update statuses
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
