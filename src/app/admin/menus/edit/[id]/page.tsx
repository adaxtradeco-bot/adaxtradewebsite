'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Unified Menu Node Structure
interface MenuNode {
  id: string;
  type: 'dropdown' | 'category' | 'page' | 'link';
  label: string;
  icon?: string;
  
  // Type-specific properties
  displayType?: string;        // dropdown only
  backgroundColor?: string;    // dropdown only
  description?: string;        // category, page
  pageId?: string;            // page only
  href?: string;              // page, link
  badge?: string;             // page only
  
  // Recursive children
  children?: MenuNode[];
}

interface Page {
  id: string;
  title: string;
  slug: string;
}

export default function UnifiedMenuEditor() {
  const params = useParams();
  const [items, setItems] = useState<MenuNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MenuNode | null>(null);
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
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  };

  const addNode = (type: MenuNode['type'], parentId?: string) => {
    const newNode: MenuNode = {
      id: `node-${Date.now()}`,
      type,
      label: `New ${type}`,
      ...(type === 'page' && { href: '/' }),
      ...(type === 'link' && { href: '/' }),
      ...(type === 'dropdown' && { displayType: 'mega-menu', children: [] }),
      ...(type === 'category' && { children: [] }),
    };

    if (!parentId) {
      setItems([...items, newNode]);
    } else {
      const addToParent = (nodes: MenuNode[]): MenuNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), newNode] };
          }
          if (node.children) {
            return { ...node, children: addToParent(node.children) };
          }
          return node;
        });
      };
      setItems(addToParent(items));
    }
    setSelectedNode(newNode as MenuNode);
  };

  const updateNode = (id: string, updates: Partial<MenuNode>) => {
    const update = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          const updated = { ...node, ...updates };
          if (selectedNode?.id === id) {
            setSelectedNode(updated);
          }
          return updated;
        }
        if (node.children) {
          return { ...node, children: update(node.children) };
        }
        return node;
      });
    };
    setItems(update(items));
  };

  const findNode = (nodes: MenuNode[], id: string): MenuNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const deleteNode = (id: string) => {
    const remove = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.filter(node => {
        if (node.id === id) return false;
        if (node.children) {
          node.children = remove(node.children);
        }
        return true;
      });
    };
    setItems(remove(items));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
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
        alert('Menu saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save menu:', error);
      alert('Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dropdown': return '📁';
      case 'category': return '📂';
      case 'page': return '📄';
      case 'link': return '🔗';
      default: return '•';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dropdown': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'category': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'page': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'link': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default: return '';
    }
  };

  const canHaveChildren = (type: string) => {
    return type === 'dropdown' || type === 'category';
  };

  const getAllowedChildTypes = (parentType: string): MenuNode['type'][] => {
    switch (parentType) {
      case 'dropdown': return ['category', 'page'];
      case 'category': return ['page'];
      default: return [];
    }
  };

  const renderNode = (node: MenuNode, level = 0) => (
    <div key={node.id} style={{ marginLeft: `${level * 24}px` }}>
      <div
        className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
          selectedNode?.id === node.id
            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        onClick={() => setSelectedNode(node)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(node.type)}</span>
          {node.icon && <span>{node.icon}</span>}
          <span className="font-medium text-gray-900 dark:text-white">{node.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(node.type)}`}>
            {node.type}
          </span>
          {node.badge && <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">{node.badge}</span>}
        </div>
        <div className="flex gap-2">
          {canHaveChildren(node.type) && (
            <div className="relative group">
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/30"
              >
                + Child
              </button>
              <div className="absolute right-0 mt-1 hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-10 min-w-32">
                {getAllowedChildTypes(node.type).map(type => (
                  <button
                    key={type}
                    onClick={(e) => { e.stopPropagation(); addNode(type, node.id); }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {getTypeIcon(type)} {type}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
            className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30"
          >
            Delete
          </button>
        </div>
      </div>
      {node.children?.map(child => renderNode(child, level + 1))}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Tree View */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Menu Tree Structure
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => addNode('dropdown')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Dropdown
            </button>
            <button
              onClick={() => addNode('link')}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              + Link
            </button>
          </div>
        </div>
        <div>
          {items.map(item => renderNode(item))}
        </div>
      </div>

      {/* Property Panel */}
      <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {selectedNode ? `Edit ${selectedNode.type}` : 'Select a node'}
        </h2>
        {selectedNode && (
          <div className="space-y-4">
            {/* Common Properties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <div className={`px-3 py-2 rounded ${getTypeColor(selectedNode.type)}`}>
                {getTypeIcon(selectedNode.type)} {selectedNode.type}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Label
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon (emoji)
              </label>
              <input
                type="text"
                value={selectedNode.icon || ''}
                onChange={(e) => updateNode(selectedNode.id, { icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Type-specific Properties */}
            {selectedNode.type === 'dropdown' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Type
                  </label>
                  <select
                    value={selectedNode.displayType || 'mega-menu'}
                    onChange={(e) => updateNode(selectedNode.id, { displayType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="mega-menu">Mega Menu</option>
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="cards">Cards</option>
                    <option value="simple">Simple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <input
                    type="text"
                    value={selectedNode.backgroundColor || ''}
                    onChange={(e) => updateNode(selectedNode.id, { backgroundColor: e.target.value })}
                    placeholder="bg-white dark:bg-neutral-900"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {(selectedNode.type === 'category' || selectedNode.type === 'page') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={selectedNode.description || ''}
                  onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {selectedNode.type === 'page' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Page Picker
                  </label>
                  <select
                    value={selectedNode.pageId || ''}
                    onChange={(e) => {
                      const page = pages.find(p => p.id === e.target.value);
                      updateNode(selectedNode.id, { 
                        pageId: e.target.value,
                        href: page?.slug || selectedNode.href
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select Page --</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        {page.title} ({page.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL (or use page picker)
                  </label>
                  <input
                    type="text"
                    value={selectedNode.href || ''}
                    onChange={(e) => updateNode(selectedNode.id, { href: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={selectedNode.badge || ''}
                    onChange={(e) => updateNode(selectedNode.id, { badge: e.target.value })}
                    placeholder="New, Hot, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={selectedNode.href || ''}
                  onChange={(e) => updateNode(selectedNode.id, { href: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        )}
        <button
          onClick={saveMenu}
          disabled={saving}
          className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Menu'}
        </button>
      </div>
    </div>
  );
}
