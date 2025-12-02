'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Menus
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage navigation menus
          </p>
        </div>
        <Link
          href="/admin/menus/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Menu
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {menu.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {menu.location} • {menu.language.toUpperCase()}
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
              <Link
                href={`/admin/menus/edit/${menu.id}`}
                className="block w-full text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                Edit Menu
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
