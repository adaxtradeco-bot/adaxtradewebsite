'use client';
import { motion } from 'framer-motion';

interface ComplianceBadge {
  icon: string;
  title: string;
  description?: string;
}

interface ComplianceBadgesSectionProps {
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    badges: ComplianceBadge[];
    backgroundGradient?: string;
  };
}

export function ComplianceBadgesSection({ data }: ComplianceBadgesSectionProps) {
  const { title, subtitle, description, badges, backgroundGradient = "from-cyan-600 to-blue-600" } = data;

  return (
    <section className={`py-20 bg-gradient-to-br ${backgroundGradient} text-white relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {subtitle && (
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-white/20">
              {subtitle}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-5xl mb-4">
                  {badge.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {badge.title}
                </h3>
                {badge.description && (
                  <p className="text-white/80 text-sm">
                    {badge.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}