import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Slide } from '../types';

interface HeroSliderProps {
  slides: Slide[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  if (!slides || slides.length === 0) {
      return (
          <div className="w-full h-[320px] md:h-[400px] bg-slate-200 rounded-2xl mb-8 flex items-center justify-center text-slate-400">
              배너가 없습니다.
          </div>
      );
  }

  return (
    <div className="relative w-full h-[320px] md:h-[400px] overflow-hidden rounded-2xl mb-8 group shadow-xl bg-slate-900">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img src={slide.img} alt={slide.title} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white max-w-3xl">
            <span className="inline-block px-3 py-1 bg-blue-600 rounded text-xs font-bold mb-3 tracking-wider uppercase shadow-sm">
                Featured
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight drop-shadow-lg">
                {slide.title}
            </h2>
            <p className="text-slate-200 text-lg md:text-xl font-light drop-shadow-md leading-relaxed">
                {slide.desc}
            </p>
          </div>
        </div>
      ))}
      
      {slides.length > 1 && (
        <>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-6 right-8 z-20 flex gap-2">
                {slides.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                    }`}
                />
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;