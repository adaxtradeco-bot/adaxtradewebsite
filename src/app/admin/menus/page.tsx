'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Copy } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  location: string;
  language: string;
  items: MenuItem[];
  status: string;
}

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  tr: '🇹🇷',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸'
};

const languageNames: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  tr: 'Türkçe',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español'
};

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/menus', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus);
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  // فیلتر منوها
  const filteredMenus = menus.filter(menu => {
    const languageMatch = selectedLanguage === 'all' || menu.language === selectedLanguage;
    const locationMatch = selectedLocation === 'all' || menu.location === selectedLocation;
    return languageMatch && locationMatch;
  });

  // گروه‌بندی منوها بر اساس location و language
  const groupedMenus = filteredMenus.reduce((acc, menu) => {
    const key = `${menu.location}-${menu.language}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(menu);
    return acc;
  }, {} as Record<string, Menu[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Menus
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage navigation menus for different languages
          </p>
        </div>
        <Link
          href="/admin/menus/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Menu
        </Link>
      </div>

      {/* فیلترها */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="inline w-4 h-4 mr-1" />
              Filter by Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Languages</option>
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {languageFlags[code]} {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Locations</option>
              <option value="header">Header</option>
              <option value="footer">Footer</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredMenus.length} of {menus.length} menus
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{languageFlags[menu.language] || '🌐'}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {menu.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {menu.location.charAt(0).toUpperCase() + menu.location.slice(1)} • {languageNames[menu.language] || menu.language.toUpperCase()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  menu.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {menu.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {menu.items.length} items
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/menus/edit/${menu.id}`}
                  className="flex-1 text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Edit
                </Link>
                <button
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Copy for Translation"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
