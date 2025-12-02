import { prisma } from './prisma';

export async function getMenu(location: string, language: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: {
        location_language: {
          location,
          language
        }
      }
    });

    if (!menu) return null;

    return {
      ...menu,
      items: JSON.parse(menu.items)
    };
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return null;
  }
}
