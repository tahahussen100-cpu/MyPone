const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const pb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateSpecs() {
  const products = [
    {
      id: 'a3639e19-8977-4352-9e7a-61473de714f7', // iPhone 15 Pro
      description_en: 'The ultimate professional device. Forged in titanium and featuring the groundbreaking A17 Pro chip for next-level performance and AI capabilities.',
      description_ar: 'الاحترافي المطلق. مصمم من التيتانيوم القوي جداً وخفيف الوزن، ويأتي بشريحة A17 Pro لأداء غير مسبوق في الألعاب والذكاء الاصطناعي.',
      specs: {
        pros: {
          en: ['Titanium design', 'A17 Pro chip', 'Action button', 'USB-C connector', 'Advanced Pro camera system'],
          ar: ['تصميم من التيتانيوم', 'شريحة A17 Pro', 'زر الإجراءات الجديد', 'منفذ USB-C', 'نظام كاميرات Pro متطور']
        },
        'الشاشة': '6.1 بوصة Super Retina XDR OLED بشاشة ProMotion',
        'المعالج': 'Apple A17 Pro (3 nm)',
        'الرام': '8 جيجابايت',
        'مساحة التخزين': '1 تيرابايت NVMe',
        'الكاميرا الخلفية': '48+12+12 ميجابكسل مع تقريب بصري 3x',
        'الكاميرا الأمامية': '12 ميجابكسل TrueDepth',
        'البطارية': '3274 مللي أمبير - شحن سريع 20W',
        'نظام التشغيل': 'iOS 17',
        'الخامات': 'إطار من التيتانيوم مع ظهر زجاجي'
      }
    },
    {
      id: 'c238495b-cc8a-45a5-ad77-badfabcd9151', // Samsung S24 Ultra
      description_en: 'Welcome to the era of AI. The Galaxy S24 Ultra empowers you with intelligent features to unleash your creativity in a stunning titanium design.',
      description_ar: 'مرحباً بك في عصر الذكاء الاصطناعي. هاتف يمنحك مميزات ذكية رهيبة لإطلاق إبداعك، في تصميم أنيق وعصري من التيتانيوم المقاوم للخدش.',
      specs: {
        pros: {
          en: ['Galaxy AI features', 'Titanium frame', 'Built-in S-Pen', 'Corning Gorilla Armor', 'Unmatched zoom camera'],
          ar: ['مميزات الذكاء الاصطناعي Galaxy AI', 'إطار من التيتانيوم القوي', 'قلم S-Pen مدمج', 'طبقة حماية مضادة للانعكاس', 'نظام كاميرات وتكبير خرافي']
        },
        'الشاشة': '6.8 بوصة Dynamic LTPO AMOLED 2X',
        'المعالج': 'Snapdragon 8 Gen 3 (4 nm)',
        'الرام': '12 جيجابايت',
        'مساحة التخزين': '1 تيرابايت UFS 4.0',
        'الكاميرا الخلفية': '200+50+10+12 ميجابكسل بتقريب 5x و 3x',
        'الكاميرا الأمامية': '12 ميجابكسل، f/2.2',
        'البطارية': '5000 مللي أمبير - شحن سريع 45W',
        'نظام التشغيل': 'Android 14 (One UI 6.1)',
        'الخامات': 'إطار من التيتانيوم وزجاج Gorilla Armor'
      }
    },
    {
      id: 'efd92de9-56a4-496e-a568-c873189425b6', // Samsung S21 Ultra
      description_en: 'Epic in every way. Featuring a unique contour-cut camera to create a revolution in photography — letting you capture cinematic 8K video.',
      description_ar: 'خرافي بكل معنى الكلمة. يأتي بتصميم كاميرا مميز ليحدث ثورة في عالم التصوير مع إمكانية التقاط استثنائية للفيديو بدقة 8K.',
      specs: {
        pros: {
          en: ['Dynamic AMOLED 2X', 'S-Pen Support', 'Dual Telephoto', '108MP Sensor'],
          ar: ['شاشة مذهلة 120 هرتز', 'دعم قلم S-Pen', 'كاميرات تكبير مزدوجة 10x و 3x', 'مستشعر أساسي 108 ميجابكسل']
        },
        'الشاشة': '6.8 بوصة Dynamic AMOLED 2X',
        'المعالج': 'Exynos 2100 / Snapdragon 888 (5 nm)',
        'الرام': '12 أو 16 جيجابايت',
        'مساحة التخزين': '512 جيجابايت UFS 3.1',
        'الكاميرا الخلفية': '108+10+10+12 ميجابكسل - تقريب 100x',
        'الكاميرا الأمامية': '40 ميجابكسل بدقة 4K',
        'البطارية': '5000 مللي أمبير - شحن سريع 25W',
        'نظام التشغيل': 'قابل للتحديث إلى Android 14',
        'الخامات': 'إطار ألومنيوم وظهر زجاجي معدني'
      }
    }
  ];

  for (const p of products) {
    const { error } = await pb.from('products').update({
      description_en: p.description_en,
      description_ar: p.description_ar,
      specs: p.specs
    }).eq('id', p.id);
    if (error) console.error('Error updating', 'error:', error);
    else console.log('Successfully updated', p.id);
  }
}

updateSpecs();
