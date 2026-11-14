/**
 * Admin Panel Layout
 * Grouped dark sidebar (collapsible to a 56 px rail, auto-collapsed in the
 * page builder) + top bar with breadcrumb and user.
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import { useAdminUser } from '@/hooks/useAdminUser';
import { Icon, type IconName } from '@/components/admin/icons';

interface NavItem {
  name: string;
  href: string;
  icon: IconName;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  { label: 'Overview', items: [{ name: 'Dashboard', href: '/admin', icon: 'dash' }] },
  {
    label: 'Content',
    items: [
      { name: 'Pages', href: '/admin/pages', icon: 'page' },
      { name: 'Sections', href: '/admin/sections', icon: 'layers' },
      { name: 'Media', href: '/admin/media', icon: 'image' },
      { name: 'Menus', href: '/admin/menus', icon: 'menu' },
      { name: 'Footers', href: '/admin/footers', icon: 'footer' },
    ],
  },
  {
    label: 'Blog',
    items: [
      { name: 'Posts', href: '/admin/blog/posts', icon: 'pen' },
      { name: 'Categories', href: '/admin/blog/categories', icon: 'folder' },
      { name: 'Tags', href: '/admin/blog/tags', icon: 'tag' },
      { name: 'API Keys', href: '/admin/blog/api-keys', icon: 'key', adminOnly: true },
    ],
  },
  {
    label: 'Site',
    items: [
      { name: 'Translations', href: '/admin/translations', icon: 'globe' },
      { name: 'Contact Sales', href: '/admin/contact-sales', icon: 'phone' },
      { name: 'Settings', href: '/admin/settings', icon: 'sliders' },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Users', href: '/admin/users', icon: 'users', adminOnly: true },
      { name: 'My Profile', href: '/admin/profile', icon: 'user' },
    ],
  },
];

function isActiveItem(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(href + '/');
}

function crumbFor(pathname: string): string {
  for (const g of navGroups) {
    // Longest match wins (e.g. /admin/blog/posts over /admin)
    const hit = g.items.find((i) => i.href !== '/admin' && isActiveItem(pathname, i.href));
    if (hit) return hit.name;
  }
  return 'Dashboard';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggle } = useSidebar();
  const { user, isAdmin } = useAdminUser();
  const isLoginPage = pathname === '/admin/login';
  const isBuilder = pathname.startsWith('/admin/pages/builder/');
  // The builder always gets the rail so the canvas keeps its width.
  const collapsed = isBuilder || isCollapsed;

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; max-age=0';
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
    router.refresh();
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const displayName = user?.name || 'Administrator';

  return (
    <div className="min-h-screen bg-[#F6F7F9] dark:bg-gray-900 font-[Inter,system-ui,sans-serif] text-[#101828]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#101828] flex flex-col py-4 transition-[width] duration-200 ${
          collapsed ? 'w-14 items-center px-0' : 'w-[248px] px-3'
        }`}
      >
        <div
          className={`flex items-center pb-3 ${
            collapsed ? 'flex-col gap-2' : 'justify-between px-3'
          }`}
        >
          <Link href="/admin" className="flex items-center gap-2.5" title="Admin Panel">
            <span className="w-7 h-7 rounded-lg bg-[#2563EB] flex-none" />
            {!collapsed && <span className="text-white font-bold text-base">Admin Panel</span>}
          </Link>
          {!isBuilder && (
            <button
              onClick={toggle}
              className="w-8 h-8 grid place-items-center rounded-lg text-[#98A2B3] hover:bg-[#1D2939] hover:text-white"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon name="panel" />
            </button>
          )}
        </div>

        <nav className={`flex-1 min-h-0 overflow-y-auto ${collapsed ? 'w-full px-2' : ''}`}>
          {navGroups.map((group, gi) => {
            const items = group.items.filter((i) => !i.adminOnly || isAdmin);
            if (items.length === 0) return null;
            return (
              <div key={group.label}>
                {collapsed ? (
                  <div className={gi === 0 ? 'h-1' : 'h-px bg-[#1D2939] my-3'} />
                ) : (
                  <div className="text-[11px] font-semibold tracking-[.08em] uppercase text-[#98A2B3] px-3 mt-5 mb-1.5">
                    {group.label}
                  </div>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActiveItem(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={collapsed ? item.name : undefined}
                          aria-label={collapsed ? item.name : undefined}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-center h-[38px] rounded-lg text-sm font-medium transition-colors ${
                            collapsed ? 'justify-center' : 'gap-3 px-3'
                          } ${
                            active
                              ? 'bg-[#2563EB] text-white'
                              : 'text-[#D0D5DD] hover:bg-[#1D2939] hover:text-white'
                          }`}
                        >
                          <Icon name={item.icon} />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className={`border-t border-[#1D2939] mt-2 pt-2 ${collapsed ? 'w-full px-2' : ''}`}>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            aria-label="Logout"
            className={`flex items-center w-full h-11 rounded-lg text-sm font-medium text-[#FDA29B] hover:bg-[#1D2939] ${
              collapsed ? 'justify-center' : 'gap-3 px-3'
            }`}
          >
            <Icon name="logout" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`min-h-screen flex flex-col transition-[padding] duration-200 ${
          collapsed ? 'pl-14' : 'pl-[248px]'
        }`}
      >
        {!isBuilder && (
          <header className="h-16 flex-none sticky top-0 z-40 flex items-center justify-between px-8 bg-white border-b border-[#E4E7EC]">
            <div className="text-sm text-[#475467]">
              Admin <span className="text-[#98A2B3]">/</span>{' '}
              <span className="text-[#101828] font-semibold">{crumbFor(pathname)}</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#D0D5DD] bg-white text-sm font-medium text-[#101828] hover:bg-[#F9FAFB]"
              >
                <Icon name="external" />
                View site
              </a>
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#E4E7EC]">
                <div className="w-8 h-8 rounded-full bg-[#EEF4FF] text-[#1D4ED8] grid place-items-center font-bold text-[13px]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{displayName}</span>
              </div>
            </div>
          </header>
        )}
        <main className={isBuilder ? 'flex-1' : 'flex-1 px-8 py-7'}>{children}</main>
      </div>
    </div>
  );
}
