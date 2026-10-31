'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

const authHeaders = (json = false): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  ...(json && { 'Content-Type': 'application/json' }),
});

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : 'Never');

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canPublish, setCanPublish] = useState(false);

  const load = useCallback(async () => {
    try {
      const [keysRes, settingsRes] = await Promise.all([
        fetch('/api/admin/blog/api-keys', { headers: authHeaders() }),
        fetch('/api/admin/blog/api-keys/settings', { headers: authHeaders() }),
      ]);
      const keysBody = await keysRes.json();
      if (!keysRes.ok) throw new Error(keysBody.error || 'Failed to load API keys');
      setKeys(keysBody.keys);
      if (settingsRes.ok) setCanPublish((await settingsRes.json()).apiCanPublish === true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/blog/api-keys', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to create API key');
      setNewKey(body.key);
      setCopied(false);
      setName('');
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (key: ApiKeyRow) => {
    if (!confirm(`Revoke "${key.name}"? Anything using this key will stop working.`)) return;
    const res = await fetch(`/api/admin/blog/api-keys/${key.id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) await load();
    else alert((await res.json()).error || 'Failed to revoke API key');
  };

  const togglePublish = async (value: boolean) => {
    setCanPublish(value);
    const res = await fetch('/api/admin/blog/api-keys/settings', {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ apiCanPublish: value }),
    });
    if (!res.ok) {
      setCanPublish(!value);
      alert((await res.json()).error || 'Failed to save setting');
    }
  };

  const copyKey = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog API keys</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Keys let AI agents and automations create blog posts through the external API.
        </p>
      </div>

      {newKey && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <p className="mb-2 font-medium text-amber-900 dark:text-amber-200">
            Copy this key now. It cannot be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100">
              {newKey}
            </code>
            <Button type="button" onClick={copyKey}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <button type="button" className="mt-3 text-sm text-amber-900 underline dark:text-amber-200" onClick={() => setNewKey(null)}>
            I have saved it
          </button>
        </div>
      )}

      <form onSubmit={createKey} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name (e.g. n8n workflow)"
          maxLength={100}
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <Button type="submit" disabled={creating || !name.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Create key
        </Button>
      </form>

      <label className="mb-6 flex items-start gap-3 text-gray-900 dark:text-white">
        <input type="checkbox" className="mt-1" checked={canPublish} onChange={(e) => togglePublish(e.target.checked)} />
        <span>
          Allow API to publish directly
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            When off, posts sent as published or scheduled are saved as drafts for review.
          </span>
        </span>
      </label>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 text-left text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Last used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-900 dark:divide-gray-700 dark:text-gray-100">
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && keys.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No API keys yet</td></tr>
            )}
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-4 py-3 font-mono text-sm"><KeyRound className="mr-1 inline h-4 w-4" />bk_{key.prefix}</td>
                <td className="px-4 py-3">{key.name}</td>
                <td className="px-4 py-3 text-sm">{formatDate(key.lastUsedAt)}</td>
                <td className="px-4 py-3 text-sm">{key.revokedAt ? 'Revoked' : 'Active'}</td>
                <td className="px-4 py-3 text-right">
                  {!key.revokedAt && (
                    <Button type="button" variant="outline" onClick={() => revokeKey(key)}>Revoke</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
