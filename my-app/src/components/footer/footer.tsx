import React from 'react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="py-8 border-t border-slate-900 bg-slate-950/50 text-center mt-auto">
      <button
        onClick={onOpenAdmin}
        className="text-xs text-slate-800 hover:text-slate-600 transition-colors cursor-default font-mono select-none focus:outline-none"
      >
        © 2026 Dashboard v2.1 • All Rights Reserved
      </button>
    </footer>
  );
}