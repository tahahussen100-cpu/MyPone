"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, UploadCloud, Loader2 } from 'lucide-react';

export default function AdminProducts() {
  const t = useTranslations('Admin');
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name_ar: '', name_en: '', description_ar: '', description_en: '', brand: '', price: 0, images: [] as string[]
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, images: [publicUrl] }));
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && formData.id) {
        const { error } = await supabase.from('products').update(formData).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { id, ...newProduct } = formData;
        const { error } = await supabase.from('products').insert([newProduct]);
        if (error) throw error;
      }
      setFormData({ id: '', name_ar: '', name_en: '', description_ar: '', description_en: '', brand: '', price: 0, images: [] });
      setIsEditing(false);
      fetchProducts();
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  return (
    <div className="font-cairo text-right" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-tajawal text-primary">{t('management')}</h1>
        <Button onClick={() => { setIsEditing(false); setFormData({ id: '', name_ar: '', name_en: '', description_ar: '', description_en: '', brand: '', price: 0, images: [] })}} className="gap-2">
          <Plus className="w-4 h-4" /> {t('addProduct')}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Product Form */}
        <div className="xl:col-span-1 bg-card border border-border rounded-xl p-6 h-fit sticky top-6 shadow-sm">
          <h2 className="text-xl font-bold font-tajawal mb-6 pb-2 border-b border-border">
            {isEditing ? t('editProduct') : t('createProduct')}
          </h2>
          <form onSubmit={handleSave} className="space-y-4 shadow-none">
            {/* Image Preview / Upload Area */}
            <div className="relative min-h-[160px] aspect-video bg-secondary/50 rounded-lg border-2 border-dashed border-primary/30 flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-secondary/80">
              {formData.images[0] ? (
                <img src={formData.images[0]} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground p-4">
                  <UploadCloud size={48} className="text-blue-500 mb-2 animate-pulse" />
                  <span className="text-sm font-bold text-foreground">اضغط لرفع صورة المنتج</span>
                  <span className="text-[10px] mt-1 text-muted-foreground">PNG, JPG up to 5MB</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                disabled={uploading}
              />
              {uploading && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            <Input placeholder={t('form.nameAr')} required value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
            <Input placeholder={t('form.nameEn')} required value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
            <Input placeholder={t('form.brand')} required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            <Input type="number" placeholder={t('form.price')} required min={0} value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            <textarea placeholder={t('form.descAr')} required className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} />
            <textarea placeholder={t('form.descEn')} required className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} />
            <Button type="submit" className="w-full h-11" disabled={loading || uploading}>
              {loading ? t('saving') : t('save')}
            </Button>
          </form>
        </div>

        {/* Product List */}
        <div className="xl:col-span-2">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-secondary text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">{t('table.name')}</th>
                  <th className="px-6 py-4 font-bold">{t('table.brand')}</th>
                  <th className="px-6 py-4 font-bold">{t('table.price')}</th>
                  <th className="px-6 py-4 font-bold text-center">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading && products.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center">جاري التحميل...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">لم يتم العثور على منتجات.</td></tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-secondary" />
                          )}
                          <div>
                            <div className="font-bold">{product.name_ar}</div>
                            <div className="text-xs text-muted-foreground">{product.name_en}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.brand}</td>
                      <td className="px-6 py-4 font-bold text-primary">{product.price.toLocaleString()} ج.م</td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setIsEditing(true); setFormData(product); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
