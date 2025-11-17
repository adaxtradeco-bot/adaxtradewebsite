/**
 * SidebarContentSection - Sidebar navigation with content area
 * Supports tabs/categories in sidebar and dynamic content display
 */

'use client';

import { useState } from 'react';

interface ContentFeature {
  text: string;
}

interface TabContent {
  title: string;
  description: string;
  features: ContentFeature[];
  placeholderIcon?: string;
  placeholderText?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  content: TabContent;
}

interface SidebarContentSectionProps {
  backgroundColor?: string;
  textColor?: string;
  sidebarItems: SidebarItem[];
}

export default function SidebarContentSection({
  backgroundColor = 'bg-slate-50 dark:bg-slate-800',
  textColor = 'text-slate-900 dark:text-white',
  sidebarItems
}: SidebarContentSectionProps) {
  const [activeTab, setActiveTab] = useState(sidebarItems[0]?.id || '');
  const activeContent = sidebarItems.find(item => item.id === activeTab)?.content;

  if (!activeContent) return null;

  return (
    <section className={`${backgroundColor} ${textColor} py-16`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          {/* Sidebar */}
          <aside>
            <div className="rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-4 sticky top-6">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors capitalize ${
                    activeTab === item.id
                      ? 'bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-8">
            <h2 className="text-3xl font-bold mb-3">{activeContent.title}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {activeContent.description}
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {activeContent.features.map((feature, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-sm"
                >
                  {feature.text}
                </div>
              ))}
            </div>

            {/* Placeholder */}
            <div className="aspect-[5/2] bg-slate-100 dark:bg-slate-600 rounded-2xl border border-slate-200 dark:border-slate-500 flex items-center justify-center">
              <div className="text-center text-slate-600 dark:text-slate-300">
                <div className="text-4xl mb-2">{activeContent.placeholderIcon || '🎨'}</div>
                <p className="text-sm">{activeContent.placeholderText || 'Content preview'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
