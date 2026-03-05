import React from 'react';
import { Brain } from 'lucide-react';

/**
 * Header Component
 * Displays the app logo and tagline
 */
export default function Header() {
  return (
    <div className="text-center mb-8 slide-in">
      <div className="flex items-center justify-center gap-3 mb-2">
        {/* Perplexity-style circular icon */}
        <svg 
          className="w-10 h-10" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#4F46E5"/>
          <circle cx="12" cy="12" r="6" fill="#818CF8"/>
          <circle cx="12" cy="12" r="2" fill="#C7D2FE"/>
        </svg>
        
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          LearnFlow
        </h1>
      </div>
      
      <p className="text-slate-600 text-sm mono">
        Spaced repetition • Leitner system • Efficient learning
      </p>
    </div>
  );
}