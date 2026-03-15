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
      image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000&auto=format&fit=crop', 
      title: locale === 'ar' ? 'سامسونج S21 Ultra' : 'Samsung S21 Ultra', 
      subtitle: locale === 'ar' ? 'قوة الأداء والتصوير في يدك' : 'Power and photography in your hands'
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2000&auto=format&fit=crop', 
      title: locale === 'ar' ? 'جرابات أيفون' : 'iPhone Cases', 
      subtitle: locale === 'ar' ? 'أفضل حماية لهاتفك بتصميم عصري' : 'Best protection for your phone with modern design'
    }
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
      <div 
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0">
            <div className="absolute inset-0 overflow-hidden">
              <Image 
                src={banner.image} 
                alt={banner.title} 
                fill 
                className="object-cover"
                priority={banner.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 text-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-7xl font-black font-tajawal text-white mb-4">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-2xl text-white/80 font-cairo mb-8 max-w-xl mx-auto">
                  {banner.subtitle}
                </p>
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold">
                  {locale === 'ar' ? 'تصفح الآن' : 'Browse Now'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/20 text-white"><ChevronLeft size={24} /></button>
      <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/20 text-white"><ChevronRight size={24} /></button>
    </div>
  );
}
