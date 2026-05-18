/**
 * Responsive Preview Component
 * Shows section in different device sizes
 */

'use client';

import React from 'react';
import { PreviewDevice } from '@/types/section-preview';

interface ResponsivePreviewProps {
  device: PreviewDevice;
  children: React.ReactNode;
}

const DEVICE_DIMENSIONS = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '100%', label: 'Tablet' },
  mobile: { width: '375px', height: '100%', label: 'Mobile' },
};

export function ResponsivePreview({ device, children }: ResponsivePreviewProps) {
  const dimensions = DEVICE_DIMENSIONS[device];

  return (
    <div className="w-full h-full flex items-start justify-center overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
      <div
        className="bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          width: dimensions.width,
          maxWidth: '100%',
          minHeight: '400px',
          borderRadius: device === 'mobile' ? '2rem' : '0.5rem',
        }}
      >
        <div className="w-full h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
