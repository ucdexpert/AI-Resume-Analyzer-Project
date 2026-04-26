'use client';

import React from 'react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl space-y-12">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="h-48 w-full" />

      <div className="grid lg:grid-cols-3 gap-8">
        <Skeleton className="h-64 col-span-1" />
        <Skeleton className="h-64 col-span-2" />
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
