'use client';

import React from 'react';

interface Property {
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  image: string;
}

interface PropertiesSectionProps {
  data: {
    title: string;
    subtitle?: string;
    properties: Property[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function PropertiesSection({ data, style }: PropertiesSectionProps) {
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
          {data.properties.map((property, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-6xl">
                {property.image}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {property.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 flex items-center">
                  <span className="mr-2">📍</span>
                  {property.location}
                </p>
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {property.price}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <span className="mr-1">🛏️</span>
                    <span>{property.beds} Beds</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🚿</span>
                    <span>{property.baths} Baths</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">📐</span>
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
