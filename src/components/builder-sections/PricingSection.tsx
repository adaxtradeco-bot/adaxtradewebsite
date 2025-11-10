/**
 * Pricing Table Section
 * 
 * Pricing plans with feature comparison
 * 
 * Features:
 * - Multiple pricing tiers
 * - Feature comparison list
 * - Highlighted popular plan
 * - Monthly/Yearly toggle
 * - Dark/Light mode support
 * - Hover effects and animations
 * - Responsive grid layout
 * 
 * Props:
 * - title: Section title
 * - subtitle: Section subtitle
 * - plans: Array of pricing plans
 *   - name: Plan name
 *   - price: Monthly price
 *   - yearlyPrice: Yearly price (optional)
 *   - description: Plan description
 *   - features: Array of features
 *   - highlighted: Boolean for popular badge
 *   - buttonText: CTA button text
 *   - buttonVariant: Button style
 * - showYearlyToggle: Enable yearly pricing toggle
 * 
 * Styling:
 * - Highlighted plan has gradient border
 * - Hover effects on cards
 * - Smooth transitions
 * 
 * @author Amazon Q
 * @created 2024-01-15
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
}

interface PricingSectionProps {
  section: {
    data: {
      title: string;
      subtitle?: string;
      plans: PricingPlan[];
      showYearlyToggle?: boolean;
    };
    style?: {
      backgroundColor?: string;
      textColor?: string;
      padding?: string;
    };
  };
  isBuilder?: boolean;
}

export default function PricingSection({ section, isBuilder = false }: PricingSectionProps) {
  const { data, style } = section;
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className={`${style?.backgroundColor || 'bg-slate-50'} dark:bg-slate-900 ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || 'py-16'}`}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              {data.subtitle}
            </p>
          )}
          
          {/* Yearly Toggle */}
          {data.showYearlyToggle && (
            <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  !isYearly 
                    ? 'bg-violet-600 text-white' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  isYearly 
                    ? 'bg-violet-600 text-white' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          )}
        </div>
        
        {/* Pricing Cards */}
        <div className={`grid gap-8 ${
          data.plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
          data.plans.length === 3 ? 'md:grid-cols-3' :
          'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {data.plans.map((plan, index) => {
            const price = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
            
            return (
              <div
                key={index}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-violet-500 to-cyan-500 p-[2px] transform hover:scale-105 shadow-xl shadow-violet-500/20 dark:shadow-violet-500/10'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-700/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className={plan.highlighted ? 'bg-white dark:bg-slate-800 rounded-2xl p-8 h-full' : ''}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold">${price}</span>
                    <span className="text-slate-600 dark:text-slate-300 ml-2">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  
                  <Button
                    variant={plan.buttonVariant || (plan.highlighted ? 'primary' : 'outline')}
                    className={`w-full mb-6 ${
                      plan.highlighted 
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0' 
                        : ''
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
