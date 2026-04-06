/**
 * AI Copilot Grid Section - Phase 3
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface CopilotCard {
  icon: string;
  tag: string;
  title: string;
  description: string;
  example: string;
  color: 'indigo' | 'cyan' | 'green' | 'violet';
}

interface ChatMessage {
  type: 'ai' | 'user';
  avatar: string;
  message: string;
  isTyping?: boolean;
}

interface AICopilotGridSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    cards: CopilotCard[];
    chatMock?: {
      title?: string;
      messages: ChatMessage[];
    };
    mediaPlaceholder?: string;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const iconColorClasses = {
  indigo: 'bg-indigo-500/15 border border-indigo-500/20',
  cyan: 'bg-cyan-500/15 border border-cyan-500/20',
  green: 'bg-green-500/15 border border-green-500/20',
  violet: 'bg-violet-500/15 border border-violet-500/20',
};

export default function AICopilotGridSection({
  data,
  style,
}: AICopilotGridSectionProps) {
  return (
    <section
      className={`py-20 border-t border-slate-200/70 dark:border-white/5 ${style?.backgroundColor || 'bg-slate-50 dark:bg-slate-950'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
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
              <br />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Copilot Cards */}
          <div className="flex flex-col gap-3">
            {data.cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:translate-x-1 cursor-default"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${iconColorClasses[card.color]}`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-0.5">
                      {card.tag}
                    </div>
                    <h3 className="text-sm font-bold">{card.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {card.description}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-indigo-500/25 pl-2.5">
                  {card.example}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Mock */}
          <div>
            {data.chatMock?.title && (
              <div className="text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-3">
                {data.chatMock.title}
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2.5">
              {data.chatMock?.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 items-start ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      msg.type === 'ai'
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                        : 'bg-green-500/20 text-green-700 dark:text-green-400'
                    }`}
                  >
                    {msg.avatar}
                  </div>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                      msg.type === 'ai'
                        ? 'bg-indigo-500/12 border border-indigo-500/20 text-slate-900 dark:text-white'
                        : 'bg-green-500/12 border border-green-500/20 text-slate-900 dark:text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.isTyping ? (
                      <div className="flex gap-1 items-center py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-typing-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-typing-dot animation-delay-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-typing-dot animation-delay-300" />
                      </div>
                    ) : (
                      msg.message
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data.mediaPlaceholder && (
              <div className="mt-4 bg-slate-100 dark:bg-indigo-500/5 border-2 border-dashed border-slate-300/70 dark:border-indigo-500/20 rounded-xl flex flex-col items-center justify-center p-8 gap-2 text-center min-h-[120px]">
                <div className="text-3xl opacity-40">🖼</div>
                <div className="text-xs text-slate-500 font-medium">
                  {data.mediaPlaceholder}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes typing-dot {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
        .animate-typing-dot {
          animation: typing-dot 0.8s infinite;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </section>
  );
}
