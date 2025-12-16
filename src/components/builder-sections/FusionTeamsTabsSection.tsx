'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TabItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  image: string;
  imageAlt: string;
  trustedByImage: string;
  trustedByAlt: string;
  enabled: boolean;
}

interface FusionTeamsTabsSectionProps {
  data: {
    mainTitle: string;
    mainDescription: string;
    tabs: TabItem[];
    trustedByText: string;
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function FusionTeamsTabsSection({ data, style }: FusionTeamsTabsSectionProps) {
  const enabledTabs = data.tabs.filter(tab => tab.enabled);
  const [activeTab, setActiveTab] = useState(enabledTabs[0]?.id || '');

  if (enabledTabs.length === 0) return null;

  return (
    <section 
      className="py-20 lg:py-28 hidden lg:block"
      style={{ backgroundColor: style.backgroundColor, color: style.textColor }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-medium text-slate-800 dark:text-slate-200 mb-4">
            {data.mainTitle}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
            {data.mainDescription}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-16">
          <div className="flex flex-wrap gap-2 border-0 relative">
            {enabledTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 text-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold">
                  {index + 1}
                </span>
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {enabledTabs.map((tab) => (
            <div
              key={tab.id}
              className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
            >
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
                {/* Image */}
                <div className="xl:col-span-4 hidden xl:block">
                  <Image
                    src={tab.image}
                    alt={tab.imageAlt}
                    width={352}
                    height={500}
                    className="w-full h-auto rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="xl:col-span-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="mb-8">
                        <h4 className="text-2xl font-medium mb-2">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {tab.title}
                          </span>
                        </h4>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                          {tab.subtitle}
                        </p>
                      </div>

                      <div>
                        <p className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                          {tab.description}
                        </p>
                        <ul className="space-y-3">
                          {tab.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Trusted By Section */}
                  <div className="mt-12">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
                      <p className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">
                        {data.trustedByText}
                      </p>
                      <Image
                        src={tab.trustedByImage}
                        alt={tab.trustedByAlt}
                        width={2000}
                        height={130}
                        className="w-full h-auto max-h-32 object-contain"
                      />
                    </div>
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