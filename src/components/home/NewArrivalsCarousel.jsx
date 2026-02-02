import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { QuickAddCard } from '../shop/QuickAddCard';

export const NewArrivalsCarousel = ({ products, onQuickView }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -350 : 350;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative group">
            <div className="flex justify-between items-end mb-8 px-4">
                <h2 className="text-3xl md:text-4xl font-serif text-white">New Arrivals</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="p-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-12 px-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollBehavior: 'smooth' }}
            >
                {products.map(product => (
                    <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-center">
                        <QuickAddCard product={product} onQuickView={onQuickView} />
                    </div>
                ))}
            </div>

            {/* Fade effect on right edge */}
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none" />
        </div>
    );
};
