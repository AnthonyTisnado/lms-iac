import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

const styles: Record<Variant, string> = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  success: 'bg-green-600 text-white hover:bg-green-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100'
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return <button className={`${styles[variant]} ${className}`} {...props}>{children}</button>;
}
