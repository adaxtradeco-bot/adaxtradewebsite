import type { SectionConfig } from '@/lib/page-builder/section-schemas';

export interface BuilderPostData {
  id: string;
  title: string;
  slug: string;
  status: string;
  language: string;
  builderData: SectionConfig[];
}

function authHeaders(json = false): Record<string, string> {
  const token = localStorage.getItem('adminToken');
  if (!token) throw new Error('No auth token');
  return { ...(json && { 'Content-Type': 'application/json' }), Authorization: `Bearer ${token}` };
}

/** Load a post for the page builder. */
export async function loadBuilderPost(postId: string): Promise<BuilderPostData | null> {
  try {
    const response = await fetch(`/api/admin/blog/posts/${postId}/builder`, { headers: authHeaders() });
    if (!response.ok) throw new Error(`Failed to load post: ${response.statusText}`);
    return (await response.json()).post;
  } catch (error) {
    console.error('Failed to load builder post:', error);
    return null;
  }
}

/** Save the builder sections of a post. */
export async function saveBuilderPost(postId: string, sections: SectionConfig[]): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/blog/posts/${postId}/builder`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ builderData: sections }),
    });
    if (!response.ok) throw new Error(`Failed to save post: ${response.statusText}`);
    return true;
  } catch (error) {
    console.error('Failed to save builder post:', error);
    return false;
  }
}
