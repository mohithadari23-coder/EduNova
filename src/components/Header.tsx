import { ArrowDownRight } from 'lucide-react';

interface HeaderProps {
  onStartDrafting: () => void;
}

export function Header({ onStartDrafting }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#262626] bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#overview"
          className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          ScholarCraft
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#888888]"
        >
          <a
            href="#overview"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Overview
          </a>
          <a
            href="#generator"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Workspace
          </a>
          <a
            href="#output"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Manuscript
          </a>
          <a
            href="#standards"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Standards
          </a>
        </nav>

        <button
          type="button"
          onClick={onStartDrafting}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-none border border-white bg-white px-4 py-2 text-xs font-semibold tracking-wide text-black whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span>Start Drafting</span>
          <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
