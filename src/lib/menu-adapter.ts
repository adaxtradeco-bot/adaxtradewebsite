/**
 * Menu Adapter - Converts database menu format to ModernNavbar format
 */

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

export function convertMenuToNavigation(menuItems: any[]): NavigationItem[] {
  // Database format already matches NavigationItem structure
  return menuItems;
}
