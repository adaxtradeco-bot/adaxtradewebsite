'use client';

import React from 'react';

interface LocationSectionProps {
  data: {
    title: string;
    subtitle?: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    hours: string;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function LocationSection({ data, style }: LocationSectionProps) {
  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-12`}>
          <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
          {data.subtitle && (
            <p className="text-lg opacity-80">{data.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map Placeholder */}
          <div className="bg-slate-200 dark:bg-slate-700 rounded-xl h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-slate-600 dark:text-slate-400">Interactive Map</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">📍</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Address</h3>
                  <p className="text-slate-600 dark:text-slate-400">{data.address}</p>
                  <p className="text-slate-600 dark:text-slate-400">{data.city}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">📞</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Phone</h3>
                  <p className="text-slate-600 dark:text-slate-400">{data.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">✉️</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Email</h3>
                  <p className="text-slate-600 dark:text-slate-400">{data.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">🕐</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Business Hours</h3>
                  <p className="text-slate-600 dark:text-slate-400">{data.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
