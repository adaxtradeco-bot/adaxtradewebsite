'use client';

import { useState } from 'react';
import { SECTION_TEMPLATES } from '@/lib/page-builder/section-registry';
import Toast from '@/components/ui/Toast';
import CreateSectionWizard from '@/components/admin/CreateSectionWizard';

const ALL_CATEGORIES = ['All', ...Array.from(new Set(SECTION_TEMPLATES.map(t => t.category)))];

export default function AdminSections() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredSections = SECTION_TEMPLATES.filter(section => {
    const matchesCategory = selectedCategory === 'All' || section.category === selectedCategory;
    const matchesSearch =
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Section Library
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {SECTION_TEMPLATES.length} section templates available
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          + Create New Section
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sections by name, description or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
              {category !== 'All' && (
                <span className="ml-1 text-xs opacity-70">
                  ({SECTION_TEMPLATES.filter(t => t.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <div
            key={section.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{section.icon}</div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {section.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {section.name}
              </h3>

              <code className="text-xs text-blue-600 dark:text-blue-400 mb-2 block font-mono">
                {section.type}
              </code>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {section.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  id: {section.id}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(section.type);
                    setToast({ message: `Copied type: ${section.type}`, type: 'success' });
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Copy type
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSections.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sections found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {showWizard && (
        <CreateSectionWizard
          onClose={() => setShowWizard(false)}
          onSuccess={(message) => {
            setToast({ message, type: 'success' });
            setShowWizard(false);
          }}
          onError={(message) => {
            setToast({ message, type: 'error' });
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
