'use client';

import React, { useState, useEffect } from 'react';

interface ProcessTag {
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

interface Slide {
  industry: string;
  headline: string;
  description: string;
  bullets: string[];
  processTags: ProcessTag[];
}

interface HOMEsLIDERpROProps {
  data: {
    slides: Slide[];
    autoplay?: boolean;
    interval?: number;
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const defaultSlides: Slide[] = [
  {
    industry: 'Fleet & Logistics',
    headline: 'Design fleet workflows without hardcoding',
    description: 'Model, automate, and evolve fleet-related operational processes using a flexible BPMS.',
    bullets: [
      'Visual process modeling',
      'Role-based task flows', 
      'Exception handling',
      'Integration-ready workflows'
    ],
    processTags: [
      { text: 'Vehicle Onboarding', size: 'md' },
      { text: 'Maintenance Request', size: 'lg' },
      { text: 'Dispatch Approval', size: 'sm' },
      { text: 'Incident Report', size: 'md' },
      { text: 'Driver Assignment', size: 'lg' },
      { text: 'Compliance Check', size: 'sm' }
    ]
  },
  {
    industry: 'Real Estate',
    headline: 'Orchestrate property processes end-to-end',
    description: 'Standardize and automate real estate operational workflows with configurable processes.',
    bullets: [
      'Contract workflows',
      'Multi-level approvals',
      'Customer service flows',
      'Payment-related processes'
    ],
    processTags: [
      { text: 'Property Onboarding', size: 'lg' },
      { text: 'Contract Approval', size: 'md' },
      { text: 'Rent Collection', size: 'sm' },
      { text: 'Maintenance Ticket', size: 'md' },
      { text: 'Ownership Transfer', size: 'lg' },
      { text: 'Customer Inquiry', size: 'sm' }
    ]
  },
  {
    industry: 'IoT Platforms',
    headline: 'Automate event-driven IoT operations',
    description: 'Coordinate device-related workflows triggered by events, rules, and conditions.',
    bullets: [
      'Event-driven workflows',
      'Rule-based automation',
      'Device lifecycle management',
      'External system integration'
    ],
    processTags: [
      { text: 'Device Registration', size: 'md' },
      { text: 'Firmware Update', size: 'lg' },
      { text: 'Alert Handling', size: 'sm' },
      { text: 'Rule Evaluation', size: 'md' },
      { text: 'Incident Escalation', size: 'lg' },
      { text: 'Data Validation', size: 'sm' }
    ]
  },
  {
    industry: 'Healthcare',
    headline: 'Coordinate clinical workflows with control',
    description: 'Enable structured, auditable, and adaptable healthcare processes.',
    bullets: [
      'Patient journey modeling',
      'Approval and compliance flows',
      'Inter-department coordination',
      'Integration with external systems'
    ],
    processTags: [
      { text: 'Patient Admission', size: 'lg' },
      { text: 'Appointment Scheduling', size: 'md' },
      { text: 'Lab Request', size: 'sm' },
      { text: 'Clinical Approval', size: 'md' },
      { text: 'Discharge Process', size: 'lg' },
      { text: 'Insurance Validation', size: 'sm' }
    ]
  },
  {
    industry: 'Construction',
    headline: 'Standardize construction project workflows',
    description: 'Manage construction processes across teams, projects, and approvals.',
    bullets: [
      'Project-based workflows',
      'Contractor coordination',
      'Approval checkpoints',
      'Progress tracking processes'
    ],
    processTags: [
      { text: 'Permit Workflow', size: 'md' },
      { text: 'Project Approval', size: 'lg' },
      { text: 'Contractor Assignment', size: 'sm' },
      { text: 'Progress Reporting', size: 'md' },
      { text: 'Safety Inspection', size: 'lg' },
      { text: 'Issue Resolution', size: 'sm' }
    ]
  },
  {
    industry: 'Human Resources',
    headline: 'Manage employee lifecycle processes',
    description: 'Design and automate HR workflows from hiring to exit.',
    bullets: [
      'Employee lifecycle workflows',
      'Approval-based processes',
      'Role and responsibility management',
      'Policy-driven automation'
    ],
    processTags: [
      { text: 'Recruitment Pipeline', size: 'lg' },
      { text: 'Employee Onboarding', size: 'md' },
      { text: 'Leave Approval', size: 'sm' },
      { text: 'Performance Review', size: 'md' },
      { text: 'Payroll Validation', size: 'lg' },
      { text: 'Offboarding', size: 'sm' }
    ]
  },
  {
    industry: 'Contract Management',
    headline: 'Control contract lifecycles with transparency',
    description: 'Orchestrate contract creation, review, approval, and renewal workflows.',
    bullets: [
      'Lifecycle-based workflows',
      'Legal and business approvals',
      'SLA and deadline tracking',
      'Document governance'
    ],
    processTags: [
      { text: 'Contract Drafting', size: 'md' },
      { text: 'Legal Review', size: 'lg' },
      { text: 'Multi-level Approval', size: 'sm' },
      { text: 'Renewal Reminder', size: 'md' },
      { text: 'Amendment Workflow', size: 'lg' },
      { text: 'Digital Archiving', size: 'sm' }
    ]
  }
];

export default function HOMEsLIDERpRO({ data, style }: HOMEsLIDERpROProps) {
  const slides = data?.slides || defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!data?.autoplay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, data.interval || 6000);
    return () => clearInterval(timer);
  }, [data?.autoplay, data?.interval, slides.length]);

  const getSizeClass = (size?: string) => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-4 py-2';
      default: return 'text-xs px-3 py-1.5';
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`min-w-full snap-start transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          >
            <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/30 py-20 px-8">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Column - Content */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    BPMS Use Case
                  </div>
                  
                  <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    {slide.industry}
                  </div>
                  
                  <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                    {slide.headline}
                  </h2>
                  
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {slide.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {slide.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Column - Process Cloud */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Processes you can build
                  </h3>
                  
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 min-h-[200px] flex flex-wrap gap-3 items-center justify-center">
                    {slide.processTags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`
                          ${getSizeClass(tag.size)}
                          bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium
                          animate-pulse hover:scale-105 transition-all duration-300
                          shadow-sm hover:shadow-md
                        `}
                        style={{
                          animationDelay: `${tagIndex * 0.2}s`,
                          animationDuration: '2s'
                        }}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-blue-500 w-8' 
                : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </section>
  );
}