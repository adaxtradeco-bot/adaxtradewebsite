'use client';

import { Linkedin, Twitter, Github, Mail } from 'lucide-react';
import Image from 'next/image';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
}

interface TeamSectionProps {
  data: {
    title: string;
    subtitle: string;
    members: TeamMember[];
  };
  style: {
    columns: 2 | 3 | 4;
    showBio: boolean;
    showSocial: boolean;
    cardStyle: 'minimal' | 'card';
  };
}

export default function TeamSection({ data, style = { columns: 3, showBio: true, showSocial: true, cardStyle: 'card' } }: TeamSectionProps) {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className={`grid gap-8 ${
          style?.columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          style?.columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
          'md:grid-cols-2'
        }`}>
          {data.members.map((member) => (
            <div
              key={member.id}
              className={`group ${
                style?.cardStyle === 'card'
                  ? 'bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-700/50'
                  : ''
              } transition-all`}
            >
              <div className="relative w-full aspect-square mb-4 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                {member.name}
              </h3>
              <p className="text-violet-600 dark:text-violet-400 font-medium mb-3">
                {member.role}
              </p>

              {style?.showBio && (
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>
              )}

              {style?.showSocial && (
                <div className="flex gap-3">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.social.email && (
                    <a
                      href={`mailto:${member.social.email}`}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
