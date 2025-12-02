/**
 * Menu Adapter - Converts unified tree structure to ModernNavbar format
 * Converts: MenuNode[] → NavigationItem[]
 */

interface MenuNode {
  id: string;
  type: 'dropdown' | 'category' | 'page' | 'link';
  label: string;
  icon?: string;
  displayType?: string;
  backgroundColor?: string;
  description?: string;
  pageId?: string;
  href?: string;
  badge?: string;
  children?: MenuNode[];
}

interface NavigationItem {
  label: string;
  href?: string;
  dropdown?: {
    columns: {
      title: string;
      items: {
        title: string;
        description?: string;
        href: string;
        icon?: string;
        badge?: string;
      }[];
    }[];
  };
}

export function convertMenuToNavigation(menuNodes: MenuNode[]): NavigationItem[] {
  return menuNodes.map(node => {
    if (node.type === 'link') {
      return {
        label: node.label,
        href: node.href || '/'
      };
    }

    if (node.type === 'dropdown') {
      const columns = node.children
        ?.filter(child => child.type === 'category')
        .map(category => ({
          title: category.label,
          items: category.children
            ?.filter(item => item.type === 'page')
            .map(page => ({
              title: page.label,
              description: page.description,
              href: page.href || '/',
              icon: page.icon,
              badge: page.badge
            })) || []
        })) || [];

      return {
        label: node.label,
        href: node.href,
        dropdown: {
          columns
        }
      };
    }

    return {
      label: node.label,
      href: node.href || '/'
    };
  });
}
