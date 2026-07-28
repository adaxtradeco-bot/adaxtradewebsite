import HomeCoverSection from '@/components/builder-sections/HomeCoverSection';
import HomeInnovationSection from '@/components/builder-sections/HomeInnovationSection';
import { HOME_SHOWCASE_TEMPLATES } from '@/lib/page-builder/section-templates/home-showcase';

const homeCoverTemplate = HOME_SHOWCASE_TEMPLATES.find((t) => t.type === 'home-cover')!;
const homeInnovationTemplate = HOME_SHOWCASE_TEMPLATES.find((t) => t.type === 'home-innovation')!;

export default function TestHomeShowcasePage() {
  return (
    <div>
      <HomeCoverSection data={homeCoverTemplate.defaultData.data as any} style={homeCoverTemplate.defaultData.style} />
      <HomeInnovationSection
        data={homeInnovationTemplate.defaultData.data as any}
        style={homeInnovationTemplate.defaultData.style}
      />

      <div className="p-8 text-center bg-white dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
          Test Page — home-cover / home-innovation seed data
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Scroll through the cover above (parallax mode) and the sticky-title card showcase below. Hover a card with a
          location tag to see its pin light up on the map.
        </p>
      </div>
    </div>
  );
}
