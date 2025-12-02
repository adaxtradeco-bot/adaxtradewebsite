'use client';

import { useState } from 'react';

interface VideoModule {
  emoji: string;
  title: string;
  description: string;
}

interface VideoPreviewNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  videoPlaceholder?: string;
  videoNotes: string[];
  modules: VideoModule[];
  ctaText?: string;
}

export default function VideoPreviewNWMSection({
  eyebrow = 'Platform preview',
  title,
  description,
  videoPlaceholder = 'Embed product tour video / screen recording here',
  videoNotes = [],
  modules = [],
  ctaText = '▶ Watch full product tour'
}: VideoPreviewNWMSectionProps) {
  const [activeModule, setActiveModule] = useState(0);

  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3 block">{eyebrow}</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Video Frame */}
        <div className="relative rounded-[2rem] border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-cyan-500/10 via-white to-transparent dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-transparent p-5 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group">
          {/* Chrome Dots */}
          <div className="flex gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 dark:bg-slate-700 opacity-65 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 dark:bg-slate-700 opacity-65 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 dark:bg-slate-700 opacity-65 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Body */}
          <div className="grid lg:grid-cols-[1.15fr_0.9fr] gap-6">
            {/* Left: Video */}
            <div>
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 dark:from-cyan-500/10 dark:to-violet-500/10 aspect-video flex items-center justify-center mb-4 group-hover:border-solid transition-all duration-300">
                <span className="text-slate-600 dark:text-slate-400">{videoPlaceholder}</span>
              </div>

              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {videoNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 hover:text-cyan-400 dark:hover:text-cyan-400 transition-colors duration-200 cursor-pointer">
                    <span className="text-cyan-400 dark:text-cyan-400 mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Modules */}
            <div className="flex flex-col gap-2">
              {modules.map((module, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeModule === idx
                      ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-transparent dark:from-cyan-500/10 dark:to-transparent shadow-lg -translate-y-1 scale-105'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:border-cyan-400/40 dark:hover:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                  onClick={() => setActiveModule(idx)}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{module.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{module.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button className="absolute bottom-5 right-5 px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white text-sm hover:bg-slate-800 dark:hover:bg-slate-800 hover:border-cyan-500/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  );
}
