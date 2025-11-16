'use client';

import React from 'react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

interface TestimonialsSectionProps {
  data: {
    title: string;
    subtitle?: string;
    testimonials: Testimonial[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function TestimonialsSection({ data, style }: TestimonialsSectionProps) {
  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-12`}>
          <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
          {data.subtitle && (
            <p className="text-lg opacity-80">{data.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Rating Stars */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 dark:text-slate-300 mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {testimonial.role}
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
