/**
 * Omnichannel Hub Section - Unified Channel Integration
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface ChannelCard {
  icon: string;
  title: string;
  description: string;
}

interface OmnichannelHubSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    hubIcon?: string;
    channels?: Array<{
      icon: string;
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';
      color: string;
    }>;
    channelCards?: ChannelCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const positionClasses = {
  'top-left': 'top-[10%] left-[15%]',
  'top-right': 'top-[10%] right-[15%]',
  'bottom-left': 'bottom-[10%] left-[15%]',
  'bottom-right': 'bottom-[10%] right-[15%]',
  'left': 'top-1/2 left-[5%] -translate-y-1/2',
  'right': 'top-1/2 right-[5%] -translate-y-1/2',
};

export default function OmnichannelHubSection({
  data,
  style,
}: OmnichannelHubSectionProps) {
  const channels = data.channels || [];
  const channelCards = data.channelCards || [];

  return (
    <section
      className={`py-20 border-t border-slate-200/70 dark:border-white/5 ${style?.backgroundColor || 'bg-white dark:bg-slate-900'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
    >
      <div className="max-w-6xl mx-auto px-8">
        {data.eyebrow && (
          <div className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 mb-3">
            {data.eyebrow}
          </div>
        )}

        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
          {data.title}
          {data.highlightedTitle && (
            <>
              {' '}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                {data.highlightedTitle}
              </span>
            </>
          )}
        </h2>

        {data.lead && (
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-12">
            {data.lead}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          {/* Visual Hub */}
          <div className="relative h-[400px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
            {/* Center Hub */}
            <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center text-5xl shadow-[0_0_60px_rgba(99,102,241,0.4)]">
              {data.hubIcon || '🎯'}
            </div>

            {/* Channel Nodes */}
            {channels.map((channel, idx) => (
              <div
                key={idx}
                className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-slate-300 dark:border-white/20 transition-all duration-300 hover:scale-110 ${positionClasses[channel.position]}`}
                style={{
                  backgroundColor: `${channel.color}26`,
                  animation: `pulse-channel 3s ease-in-out infinite ${idx * 0.5}s`,
                }}
              >
                {channel.icon}
              </div>
            ))}
          </div>

          {/* Channel Cards */}
          <div className="flex flex-col gap-3">
            {channelCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 transition-all duration-300 hover:border-indigo-500/30 hover:translate-x-1"
              >
                <h4 className="text-base font-bold mb-1 flex items-center gap-2">
                  <span className="text-xl">{card.icon}</span>
                  {card.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-channel {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
          }
        }
      `}</style>
    </section>
  );
}
