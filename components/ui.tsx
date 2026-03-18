import React from 'react';

export function AppCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-3xl border border-slate-800 bg-slate-900/80 shadow-soft backdrop-blur-xl ${className}`}>{children}</div>;
}

export function AppButton({
  className = '',
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }) {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    outline: 'border border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-900',
    ghost: 'border border-slate-800 bg-slate-950/50 text-slate-100 hover:bg-slate-900',
  };
  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${styles[variant]} ${className}`}
    />
  );
}

export function AppInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm text-slate-100 placeholder:text-slate-500 ${props.className || ''}`}
    />
  );
}

export function AppSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm text-slate-100 ${props.className || ''}`}
    />
  );
}
