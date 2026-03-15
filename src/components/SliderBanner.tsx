"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function SliderBanner() {
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    { id: 1, image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000&auto=format&fit=crop', title: locale === 'ar' ? 'سامسونج' : 'Samsung' },
    { id: 2, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2000&auto=format&fit=crop', title: locale === 'ar' ? 'أيفون' : 'iPhone' }
  ];

  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % banners.length), [banners.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[350px] md:h-[550px] bg-black overflow-hidden rounded-3xl mb-12 shadow-2xl group">
      <div className="flex h-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0">
            <Image src={banner.image} alt={banner.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-4xl md:text-7xl font-bold text-white">{banner.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
