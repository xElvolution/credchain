'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm text-text-primary',
            'placeholder:text-muted transition-colors duration-200',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={4}
          className={cn(
            'w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary',
            'placeholder:text-muted transition-colors duration-200',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            error && 'border-rose-500/60',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
