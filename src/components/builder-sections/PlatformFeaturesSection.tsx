'use client';

import Image from 'next/image';

interface FeatureItem {
  icon: string;
  text: string;
  enabled?: boolean;
}

interface PlatformFeaturesSectionProps {
  data: {
    title?: string;
    titleHighlight?: string;
    subtitle?: string;
    backgroundImage?: string;
    leftFeatures: FeatureItem[];
    rightFeatures: FeatureItem[];
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function PlatformFeaturesSection({ data, style }: PlatformFeaturesSectionProps) {
  const enabledLeftFeatures = data.leftFeatures.filter(f => f.enabled !== false);
  const enabledRightFeatures = data.rightFeatures.filter(f => f.enabled !== false);

  return (
    <section 
      className="py-20"
      style={{ backgroundColor: style.backgroundColor, color: style.textColor }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {(data.title || data.subtitle) && (
          <div className="text-center mb-16">
            {data.title && (
              <h2 className="text-3xl lg:text-4xl font-normal text-slate-700 dark:text-slate-300 mb-8">
                {data.titleHighlight ? (
                  <>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{data.titleHighlight}</span> {data.title}
                  </>
                ) : (
                  data.title
                )}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-xl text-slate-600 dark:text-slate-400 font-normal">
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div 
          className="grid md:grid-cols-2 gap-8 md:gap-12 pb-16 bg-cover bg-center bg-no-repeat"
          style={data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})` } : {}}
        >
          {/* Left Column */}
          <div className="space-y-6">
            {enabledLeftFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <div className="flex-grow-1">
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-0">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:justify-end">
            {enabledRightFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <div className="flex-grow-1">
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-0">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}