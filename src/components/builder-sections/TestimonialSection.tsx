'use client';

import { Star } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

interface TestimonialSectionProps {
  data: {
    title: string;
    subtitle: string;
    testimonials: Testimonial[];
  };
  style: {
    layout: 'grid' | 'carousel';
    columns: 2 | 3;
    showRating: boolean;
    showAvatar: boolean;
  };
}

export default function TestimonialSection({ data, style = { layout: 'grid', columns: 3, showRating: true, showAvatar: true } }: TestimonialSectionProps) {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className={`grid gap-8 ${style?.columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {data.testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-700/50 transition-all"
            >
              {style?.showRating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              )}

              <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                {style?.showAvatar && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
