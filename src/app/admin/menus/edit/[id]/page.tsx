'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface DropdownItem {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  badge?: string;
}

interface DropdownColumn {
  title: string;
  icon?: string;
  items: DropdownItem[];
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  displayType?: string;
  backgroundColor?: string;
  dropdown?: {
    columns: DropdownColumn[];
  };
}

interface Page {
  id: string;
  title: string;
  slug: string;
  language: string;
}

export default function MenuEditor() {
  const params = useParams();
  const router = useRouter();
  const [menuName, setMenuName] = useState('');
  const [menuLanguage, setMenuLanguage] = useState('en');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<{ itemId: string; columnIndex: number } | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenu();
    fetchPages();
  }, [params.id]);

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/menus/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMenuName(data.menu.name);
        setMenuLanguage(data.menu.language);
        setItems(JSON.parse(data.menu.items || '[]'));
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    }
  };

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/pages', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Pages loaded:', data.pages?.length || 0);
        setPages(data.pages || []);
      } else {
        console.error('Failed to fetch pages:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: 'New Menu Item',
      href: '/',
    };
    setItems([...items, newItem]);
    setSelectedItem(newItem);
  };

  const addDropdownToItem = (itemId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          dropdown: {
            columns: [{
              title: 'New Column',
              items: []
            }]
          }
        };
      }
      return item;
    }));
  };

  const addColumnToDropdown = (itemId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        return {
          ...item,
          dropdown: {
            columns: [
              ...item.dropdown.columns,
              { title: 'New Column', items: [] }
            ]
          }
        };
      }
      return item;
    }));
  };

  const addItemToColumn = (itemId: string, columnIndex: number) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const newColumns = [...item.dropdown.columns];
        newColumns[columnIndex] = {
          ...newColumns[columnIndex],
          items: [
            ...newColumns[columnIndex].items,
            {
              title: 'New Item',
              description: 'Description',
              href: '/',
              icon: '📄'
            }
          ]
        };
        return { ...item, dropdown: { columns: newColumns } };
      }
      return item;
    }));
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if (selectedItem?.id === itemId) {
          setSelectedItem(updated);
        }
        return updated;
      }
      return item;
    }));
  };

  const updateColumn = (itemId: string, columnIndex: number, updates: Partial<DropdownColumn>) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const newColumns = [...item.dropdown.columns];
        newColumns[columnIndex] = { ...newColumns[columnIndex], ...updates };
        const updated = { ...item, dropdown: { columns: newColumns } };
        // Update selectedItem if it's the current item
        if (selectedItem?.id === itemId) {
          setSelectedItem(updated);
        }
        return updated;
      }
      return item;
    }));
  };

  const updateDropdownItem = (itemId: string, columnIndex: number, itemIndex: number, updates: Partial<DropdownItem>) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const newColumns = [...item.dropdown.columns];
        const newItems = [...newColumns[columnIndex].items];
        newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
        newColumns[columnIndex] = { ...newColumns[columnIndex], items: newItems };
        const updated = { ...item, dropdown: { columns: newColumns } };
        // Update selectedItem if it's the current item
        if (selectedItem?.id === itemId) {
          setSelectedItem(updated);
        }
        return updated;
      }
      return item;
    }));
  };

  const moveMenuItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setItems(newItems);
  };

  const moveColumn = (itemId: string, fromIndex: number, toIndex: number) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const newColumns = [...item.dropdown.columns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);
        return { ...item, dropdown: { columns: newColumns } };
      }
      return item;
    }));
  };

  const moveDropdownItem = (itemId: string, columnIndex: number, fromIndex: number, toIndex: number) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const newColumns = [...item.dropdown.columns];
        const newItems = [...newColumns[columnIndex].items];
        const [movedItem] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, movedItem);
        newColumns[columnIndex] = { ...newColumns[columnIndex], items: newItems };
        return { ...item, dropdown: { columns: newColumns } };
      }
      return item;
    }));
  };

  const deleteMenuItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  const deleteColumn = (itemId: string, columnIndex: number) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const newColumns = item.dropdown.columns.filter((_, i) => i !== columnIndex);
        // If no columns left, remove dropdown entirely
        if (newColumns.length === 0) {
          const { dropdown, ...itemWithoutDropdown } = item;
          return itemWithoutDropdown;
        }
        return { ...item, dropdown: { columns: newColumns } };
      }
      return item;
    }));
  };

  const removeDropdown = (itemId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const { dropdown, ...itemWithoutDropdown } = item;
        if (selectedItem?.id === itemId) {
          setSelectedItem(itemWithoutDropdown);
        }
        return itemWithoutDropdown;
      }
      return item;
    }));
  };

  const deleteDropdownItem = (itemId: string, columnIndex: number, itemIndex: number) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.dropdown) {
        const newColumns = [...item.dropdown.columns];
        newColumns[columnIndex] = {
          ...newColumns[columnIndex],
          items: newColumns[columnIndex].items.filter((_, i) => i !== itemIndex)
        };
        const updated = { ...item, dropdown: { columns: newColumns } };
        // Update selectedItem if it's the current item
        if (selectedItem?.id === itemId) {
          setSelectedItem(updated);
        }
        return updated;
      }
      return item;
    }));
  };

  const saveMenu = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/menus/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: JSON.stringify(items) }),
      });
      
      if (response.ok) {
        alert('✅ Menu saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save menu:', error);
      alert('❌ Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Menu: {menuName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {items.length} menu items
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/menus')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={saveMenu}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : '💾 Save Menu'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Menu Items List */}
        <div className="col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu Items</h2>
            <button
              onClick={addMenuItem}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, itemIdx) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div
                  className={`cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-50 dark:bg-blue-900/20 -m-4 p-4 rounded-lg' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); if (itemIdx > 0) moveMenuItem(itemIdx, itemIdx - 1); }}
                          disabled={itemIdx === 0}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (itemIdx < items.length - 1) moveMenuItem(itemIdx, itemIdx + 1); }}
                          disabled={itemIdx === items.length - 1}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.icon && <span className="text-xl">{item.icon}</span>}
                        <span className="font-semibold text-gray-900 dark:text-white">{item.label}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMenuItem(item.id); }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {item.href && !item.dropdown && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      🔗 {item.href}
                    </div>
                  )}

                  {item.dropdown ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          📁 Dropdown ({item.dropdown.columns.length} columns)
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeDropdown(item.id); }}
                          className="text-xs text-red-600 hover:text-red-700"
                          title="Remove dropdown"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      {item.dropdown.columns.map((col, colIdx) => (
                        <div key={colIdx} className="ml-4 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded flex items-center justify-between">
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            {col.icon} {col.title} ({col.items.length} items)
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); if (colIdx > 0) moveColumn(item.id, colIdx, colIdx - 1); }}
                              disabled={colIdx === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                              title="Move left"
                            >
                              ◀
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (colIdx < item.dropdown!.columns.length - 1) moveColumn(item.id, colIdx, colIdx + 1); }}
                              disabled={colIdx === item.dropdown!.columns.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                              title="Move right"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); addColumnToDropdown(item.id); }}
                        className="ml-4 text-xs text-blue-600 hover:text-blue-700"
                      >
                        + Add Column
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); addDropdownToItem(item.id); }}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                    >
                      + Add Dropdown
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-y-auto">
          {selectedItem ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit: {selectedItem.label}
              </h2>

              {/* Basic Properties */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedItem.label}
                    onChange={(e) => updateMenuItem(selectedItem.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon (emoji)
                  </label>
                  <input
                    type="text"
                    value={selectedItem.icon || ''}
                    onChange={(e) => updateMenuItem(selectedItem.id, { icon: e.target.value })}
                    placeholder="🚀"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Link/Page Selection */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {selectedItem.dropdown ? '🔗 Link (Optional - Click opens page, Hover shows dropdown)' : '🔗 Link URL'}
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Select from Pages ({pages.filter(p => p.language === menuLanguage).length} available)
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          const page = pages.find(p => p.id === e.target.value);
                          if (page) {
                            updateMenuItem(selectedItem.id, { href: `/${page.language}/${page.slug}` });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">-- Select a page ({pages.length} total) --</option>
                        {pages
                          .filter(p => p.language === menuLanguage)
                          .map(page => (
                            <option key={page.id} value={page.id}>
                              {page.title} (/{page.language}/{page.slug})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Custom URL
                      </label>
                      <input
                        type="text"
                        value={selectedItem.href || ''}
                        onChange={(e) => updateMenuItem(selectedItem.id, { href: e.target.value })}
                        placeholder="/en/custom-page or https://external.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    {selectedItem.href && (
                      <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        ✓ Current: {selectedItem.href}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dropdown Editor */}
              {selectedItem.dropdown && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Dropdown Columns
                    </h3>
                    <button
                      onClick={() => removeDropdown(selectedItem.id)}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 text-sm"
                    >
                      ✕ Remove Dropdown
                    </button>
                  </div>

                  {selectedItem.dropdown.columns.map((column, colIdx) => (
                    <div key={colIdx} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Column {colIdx + 1}
                        </h4>
                        <button
                          onClick={() => deleteColumn(selectedItem.id, colIdx)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️ Delete Column
                        </button>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Column Title
                          </label>
                          <input
                            type="text"
                            value={column.title}
                            onChange={(e) => updateColumn(selectedItem.id, colIdx, { title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Column Icon
                          </label>
                          <input
                            type="text"
                            value={column.icon || ''}
                            onChange={(e) => updateColumn(selectedItem.id, colIdx, { icon: e.target.value })}
                            placeholder="⭐"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Column Items */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Items ({column.items.length})
                          </span>
                          <button
                            onClick={() => addItemToColumn(selectedItem.id, colIdx)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            + Add Item
                          </button>
                        </div>

                        {column.items.map((dropItem, itemIdx) => (
                          <div key={itemIdx} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => { if (itemIdx > 0) moveDropdownItem(selectedItem.id, colIdx, itemIdx, itemIdx - 1); }}
                                    disabled={itemIdx === 0}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs leading-none"
                                    title="Move up"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => { if (itemIdx < column.items.length - 1) moveDropdownItem(selectedItem.id, colIdx, itemIdx, itemIdx + 1); }}
                                    disabled={itemIdx === column.items.length - 1}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs leading-none"
                                    title="Move down"
                                  >
                                    ▼
                                  </button>
                                </div>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Item {itemIdx + 1}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteDropdownItem(selectedItem.id, colIdx, itemIdx)}
                                className="text-red-600 hover:text-red-700 text-xs"
                              >
                                🗑️
                              </button>
                            </div>

                            <div className="space-y-2">
                              <input
                                type="text"
                                value={dropItem.title}
                                onChange={(e) => updateDropdownItem(selectedItem.id, colIdx, itemIdx, { title: e.target.value })}
                                placeholder="Title"
                                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              />
                              <input
                                type="text"
                                value={dropItem.description || ''}
                                onChange={(e) => updateDropdownItem(selectedItem.id, colIdx, itemIdx, { description: e.target.value })}
                                placeholder="Description"
                                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                              />
                              
                              <div className="space-y-1">
                                <select
                                  value=""
                                  onChange={(e) => {
                                    const page = pages.find(p => p.id === e.target.value);
                                    if (page) {
                                      updateDropdownItem(selectedItem.id, colIdx, itemIdx, { href: `/${page.language}/${page.slug}` });
                                    }
                                  }}
                                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                >
                                  <option value="">-- Select page --</option>
                                  {pages
                                    .filter(p => p.language === menuLanguage)
                                    .map(page => (
                                      <option key={page.id} value={page.id}>
                                        {page.title}
                                      </option>
                                    ))}
                                </select>
                                <input
                                  type="text"
                                  value={dropItem.href}
                                  onChange={(e) => updateDropdownItem(selectedItem.id, colIdx, itemIdx, { href: e.target.value })}
                                  placeholder="or custom URL"
                                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={dropItem.icon || ''}
                                  onChange={(e) => updateDropdownItem(selectedItem.id, colIdx, itemIdx, { icon: e.target.value })}
                                  placeholder="Icon 📝"
                                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                />
                                <input
                                  type="text"
                                  value={dropItem.badge || ''}
                                  onChange={(e) => updateDropdownItem(selectedItem.id, colIdx, itemIdx, { badge: e.target.value })}
                                  placeholder="Badge"
                                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <p>Select a menu item to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
