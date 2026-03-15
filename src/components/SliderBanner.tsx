"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function SliderBanner() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    { 
      id: 1, 
      image: '/images/banners/banner1.png', 
      title: locale === 'ar' ? 'سامسونج S21 Ultra' : 'Samsung S21 Ultra', 
      subtitle: locale === 'ar' ? 'قوة الأداء والتصوير في يدك' : 'Power and photography in your hands'
    },
    { 
      id: 2, 
      image: '/images/banners/banner2.png', 
      title: locale === 'ar' ? 'جرابات أيفون' : 'iPhone Cases', 
      subtitle: locale === 'ar' ? 'أفضل حماية لهاتفك بتصميم عصري' : 'Best protection for your phone with modern design'
    },
    { 
      id: 3, 
      image: '/images/banners/banner3.png', 
      title: locale === 'ar' ? 'سماعات وايرلس' : 'Wireless Headphones', 
      subtitle: locale === 'ar' ? 'استمتع بنقاء الصوت والراحة التامة' : 'Enjoy pure sound and ultimate comfort'
    },
    { 
      id: 4, 
      image: '/images/banners/banner4.png', 
      title: locale === 'ar' ? 'اسكرينات حماية' : 'Screen Protectors', 
      subtitle: locale === 'ar' ? 'حافظ على خصوصية بياناتك بأمان' : 'Keep your data private and secure'
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[350px] md:h-[550px] bg-black overflow-hidden rounded-3xl mb-12 shadow-2xl group" dir="ltr">
      {/* Slides Container - Using LTR for the container to make translateX calculations simpler */}
      <div 
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="relative w-full h-full flex-shrink-0"
          >
            {/* Background Image with Ken Burns Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <Image 
                src={banner.image} 
                alt={banner.title} 
                fill 
                className="object-cover transition-transform duration-[10000ms] ease-linear hover:scale-110"
                style={{ 
                  animation: 'kenburns 20s ease infinite alternate'
                }}
                priority={banner.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 text-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-7xl font-black font-tajawal text-white mb-4 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-2xl text-white/80 font-cairo mb-8 max-w-xl mx-auto drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                  {banner.subtitle}
                </p>
                <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                  <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    {locale === 'ar' ? 'تصفح الآن' : 'Browse Now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10"
      >
        <ChevronRight size={24} />
      </button>

      {/* Modern Navigation Dots/Lines */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all duration-500 rounded-full h-1.5 ${currentSlide === i ? 'w-12 bg-primary' : 'w-4 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
