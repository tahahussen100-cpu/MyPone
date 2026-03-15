"use client";

import { useTranslations } from 'next-intl';

export default function FloatingWhatsApp() {
  const t = useTranslations('Navigation');
  const phoneNumber = '01223736692';
  
  // Custom message encoded
  const message = 'مرحباً، لدي استفسار بخصوص منتجات My Phone!';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
      aria-label="Contact us on WhatsApp"
      title="WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="w-8 h-8 fill-current"
      >
        {/* FontAwesome WhatsApp Icon Path */}
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.4c-33.2 0-65.6-8.9-94-25.8l-6.7-4-69.8 18.3 18.7-68.1-4.4-7.1C46.9 299 35.8 262 35.8 223.9c0-103.9 84.6-188.5 188.5-188.5 49.3 0 96.6 19.2 131.5 54.1 34.9 34.9 54.1 82.2 54.1 131.5 0 103.9-84.6 188.5-188.5 188.5zm103.8-141.6c-5.7-2.8-33.7-16.6-38.9-18.5-5.2-1.9-9-2.8-12.8 2.8-3.8 5.7-14.7 18.5-18 22.3-3.3 3.8-6.6 4.3-12.3 1.4-5.7-2.8-24-8.8-45.8-28.2-16.9-15.1-28.3-33.8-31.6-39.5-3.3-5.7-.4-8.8 2.5-11.6 2.8-2.6 5.7-6.6 8.5-9.9 2.8-3.3 3.8-5.7 5.7-9.5 1.9-3.8.9-7.1-.5-9.9-1.4-2.8-12.8-30.8-17.5-42.2-4.6-11.1-9.2-9.6-12.8-9.8-3.3-.2-7.1-.2-10.9-.2-3.8 0-9.9 1.4-15.1 7.1-5.2 5.7-20.3 19.9-20.3 48.3 0 28.4 20.8 55.9 23.7 59.7 2.8 3.8 40.8 62.3 98.8 87.3 13.8 5.9 24.6 9.4 33 12 13.9 4.4 26.5 3.8 36.5 2.3 11.2-1.7 33.7-13.7 38.4-27 4.7-13.3 4.7-24.6 3.3-27.1-1.4-2.4-5.2-3.8-10.9-6.6z" />
      </svg>
    </a>
  );
}
