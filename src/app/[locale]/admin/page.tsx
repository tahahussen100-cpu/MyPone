import { getTranslations } from 'next-intl/server';

export default async function AdminOverview() {
  const t = await getTranslations('Admin');

  return (
    <div>
      <h1 className="text-3xl font-bold font-tajawal mb-8">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground font-cairo mb-2">{t('stats.sales')}</h3>
          <p className="text-3xl font-bold text-primary">0 EGP</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground font-cairo mb-2">{t('stats.pending')}</h3>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground font-cairo mb-2">{t('stats.repairs')}</h3>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground font-cairo mb-2">{t('stats.users')}</h3>
          <p className="text-3xl font-bold">1</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[400px]">
          <h3 className="text-xl font-bold font-tajawal mb-4">{t('recentOrders')}</h3>
          <p className="text-muted-foreground">{t('noOrders')}</p>
        </div>
        
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[400px]">
          <h3 className="text-xl font-bold font-tajawal mb-4">{t('alerts')}</h3>
          <div className="space-y-4">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-sm">
              <strong className="text-accent space-x-2 block mb-1">Notice</strong>
              To use the SQL Editor, ensure the `exec_sql` RPC function is created in your Supabase project.
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm">
              <strong className="text-primary space-x-2 block mb-1">Configuration</strong>
              Gemini API Key needs to be active for the AI Image background removal tool to function.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
