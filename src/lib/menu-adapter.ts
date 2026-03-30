/**
 * Menu Adapter - Converts database menu format to ModernNavbar format
 */

interface IconConfig {
  name: string;
  type: 'solid' | 'regular' | 'light' | 'thin' | 'duotone' | 'brands';
  size: string;
  color?: string;
}

interface NavigationSubItem {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  iconConfig?: IconConfig;
  badge?: string;
}

interface NavigationColumn {
  title: string;
  icon?: string;
  iconConfig?: IconConfig;
  items: NavigationSubItem[];
}

interface NavigationItem {
  label: string;
  href?: string;
  icon?: string;
  iconConfig?: IconConfig;
  dropdown?: {
    columns: NavigationColumn[];
  };
}

export function convertMenuToNavigation(menuItems: any[]): NavigationItem[] {
  return menuItems.map(item => ({
    ...item,
    // Keep both icon (emoji) and iconConfig (FA) as-is — ModernNavbar handles both
    icon: item.icon || undefined,
    iconConfig: item.iconConfig || undefined,
    dropdown: item.dropdown
      ? {
          columns: (item.dropdown.columns || []).map((col: any) => ({
            ...col,
            icon: col.icon || undefined,
            iconConfig: col.iconConfig || undefined,
            items: (col.items || []).map((subItem: any) => ({
              ...subItem,
              icon: subItem.icon || undefined,
              iconConfig: subItem.iconConfig || undefined,
            })),
          })),
        }
      : undefined,
  }));
}
