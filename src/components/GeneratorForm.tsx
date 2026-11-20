import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronDown, KeyRound, Loader2, Trash2 } from 'lucide-react';
import type { AiProvider, DomainOption, LiveAiConfig } from '../types/research';
import { SAMPLE_IDEAS } from '../utils/academicGenerator';
import { MagneticButton } from './MagneticButton';

interface GeneratorFormProps {
  idea: string;
  onIdeaChange: (value: string) => void;
  domain: DomainOption;
  onDomainChange: (domain: DomainOption) => void;
  customDomain: string;
  onCustomDomainChange: (value: string) => void;
  liveAi: LiveAiConfig;
  onLiveAiChange: (config: LiveAiConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  errorMessage: string | null;
}

const DOMAINS: DomainOption[] = ['AI', 'IoT', 'Web', 'Cybersecurity', 'Other'];

export function GeneratorForm({
  idea,
  onIdeaChange,
  domain,
  onDomainChange,
  customDomain,
  onCustomDomainChange,
  liveAi,
  onLiveAiChange,
  onGenerate,
  isGenerating,
  errorMessage,
}: GeneratorFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const handleSampleSelect = (sampleText: string, sampleDomain: DomainOption) => {
    onIdeaChange(sampleText);
    onDomainChange(sampleDomain);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  const handleProviderChange = (provider: AiProvider) => {
    onLiveAiChange({ ...liveAi, provider });
  };

  const handleClearKey = () => {
    onLiveAiChange({ ...liveAi, enabled: false, apiKey: '' });
  };

  return (
    <section
      id="generator"
      aria-labelledby="workspace-heading"
      className="border-t border-[#262626] bg-black/55 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-mono text-xs tracking-wide text-[#888888]">
              01. Research Input Workspace
            </p>
            <h2
              id="workspace-heading"
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Define your project thesis
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#A3A3A3]">
            Enter a concise problem statement and target domain. Leave Live AI empty to use the
            built-in domain-aware academic synthesizer.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.14 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="border border-[#262626] bg-[#0A0A0A] p-6 sm:p-10"
        >
          {/* Project Idea Input */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="project-idea-input"
                className="text-sm font-medium tracking-wide text-white"
              >
                Project Idea
              </label>
              <span className="font-mono text-xs text-[#888888] tabular-nums">
                {idea.trim().length} chars
              </span>
            </div>

            <textarea
              id="project-idea-input"
              rows={3}
              value={idea}
              onChange={(e) => onIdeaChange(e.target.value)}
              placeholder="e.g., Detect fake news using machine learning and NLP on social media posts"
              className="mt-3 w-full resize-y border border-[#262626] bg-black px-4 py-3.5 text-base leading-relaxed text-white placeholder-[#737373] transition-colors duration-200 focus:border-white focus:outline-none"
            />

            {/* 3 Clickable Sample-Idea Chips with spring hover */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="mr-1 font-mono text-xs text-[#888888]">Sample prompts:</span>
              {SAMPLE_IDEAS.map((sample) => {
                const isSelected = idea.trim() === sample.text;
                return (
                  <motion.button
                    key={sample.id}
                    type="button"
                    whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={() => handleSampleSelect(sample.text, sample.domain)}
                    className={`min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      isSelected
                        ? 'border-white bg-white text-black'
                        : 'border-[#262626] bg-black text-[#A3A3A3] hover:border-[#666666] hover:text-white'
                    }`}
                  >
                    {sample.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Domain Selector with shared layoutId sliding active pill */}
          <div className="mt-8 border-t border-[#262626] pt-8">
            <span className="block text-sm font-medium tracking-wide text-white">
              Research Domain
            </span>

            <div
              role="radiogroup"
              aria-label="Research Domain"
              className="mt-3.5 flex flex-wrap items-center gap-2.5"
            >
              {DOMAINS.map((item) => {
                const active = domain === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onDomainChange(item)}
                    className={`relative min-h-[40px] rounded-full border px-5 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      active
                        ? 'border-white text-black'
                        : 'border-[#262626] bg-black text-[#A3A3A3] hover:border-[#666666] hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="domain-pill-active"
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 32 }
                        }
                        className="absolute inset-0 rounded-full bg-white"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{item}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence initial={false}>
              {domain === 'Other' && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <label htmlFor="custom-domain-input" className="sr-only">
                    Custom Research Domain
                  </label>
                  <input
                    id="custom-domain-input"
                    type="text"
                    value={customDomain}
                    onChange={(e) => onCustomDomainChange(e.target.value)}
                    placeholder="Specify custom domain (e.g., Bioinformatics, Renewable Smart Grids, FinTech)"
                    className="w-full border border-[#262626] bg-black px-4 py-3 text-sm text-white placeholder-[#737373] transition-colors duration-150 focus:border-white focus:outline-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Optional Live AI Toggle (Collapsed by default) */}
          <div className="mt-8 border-t border-[#262626] pt-6">
            <button
              type="button"
              aria-expanded={aiPanelOpen}
              onClick={() => setAiPanelOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 py-2 text-left text-sm text-[#A3A3A3] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="inline-flex items-center gap-2.5 font-medium">
                <KeyRound className="h-4 w-4 text-[#888888]" aria-hidden="true" />
                <span>Optional Live AI Toggle</span>
                <span className="font-mono text-xs text-[#888888]">
                  ·{' '}
                  {liveAi.enabled && liveAi.apiKey.trim()
                    ? `${liveAi.provider === 'gemini' ? 'Gemini' : 'OpenAI'} active`
                    : 'Built-in generator active'}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#888888] transition-transform duration-200 ${
                  aiPanelOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence initial={false}>
              {aiPanelOpen && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4 border border-[#262626] bg-black p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <p className="text-xs leading-relaxed text-[#A3A3A3]">
                        Paste a free Gemini or OpenAI API key stored locally in your browser
                        (`localStorage`). When empty, ScholarCraft runs 100% offline with its
                        built-in domain-aware academic engine.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onLiveAiChange({ ...liveAi, enabled: !liveAi.enabled })
                        }
                        className={`min-h-[36px] shrink-0 border px-4 py-1.5 font-mono text-xs whitespace-nowrap transition-colors ${
                          liveAi.enabled
                            ? 'border-white bg-white text-black'
                            : 'border-[#262626] bg-[#0A0A0A] text-[#A3A3A3] hover:border-[#525252] hover:text-white'
                        }`}
                      >
                        {liveAi.enabled ? 'Live AI: Enabled' : 'Live AI: Off'}
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
                      <div className="relative flex border border-[#262626] bg-[#0A0A0A]">
                        {(['gemini', 'openai'] as AiProvider[]).map((prov) => {
                          const isProvActive = liveAi.provider === prov;
                          return (
                            <button
                              key={prov}
                              type="button"
                              onClick={() => handleProviderChange(prov)}
                              className={`relative min-h-[40px] px-4 font-mono text-xs uppercase transition-colors ${
                                isProvActive ? 'text-black' : 'text-[#888888] hover:text-white'
                              }`}
                            >
                              {isProvActive && (
                                <motion.span
                                  layoutId="provider-pill-active"
                                  transition={
                                    prefersReducedMotion
                                      ? { duration: 0 }
                                      : { type: 'spring', stiffness: 420, damping: 32 }
                                  }
                                  className="absolute inset-0 bg-white"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="relative z-10">{prov}</span>
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="password"
                        value={liveAi.apiKey}
                        onChange={(e) =>
                          onLiveAiChange({
                            ...liveAi,
                            apiKey: e.target.value,
                            enabled: e.target.value.trim().length > 0 ? true : liveAi.enabled,
                          })
                        }
                        placeholder={
                          liveAi.provider === 'gemini'
                            ? 'Paste Gemini API key (AIza...)'
                            : 'Paste OpenAI API key (sk-...)'
                        }
                        aria-label="Optional API key"
                        className="min-h-[40px] border border-[#262626] bg-[#0A0A0A] px-3.5 py-2 font-mono text-xs text-white placeholder-[#737373] focus:border-white focus:outline-none"
                      />

                      {liveAi.apiKey && (
                        <button
                          type="button"
                          onClick={handleClearKey}
                          aria-label="Clear stored API key"
                          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-[#262626] bg-[#0A0A0A] px-3.5 py-2 font-mono text-xs text-[#A3A3A3] transition-colors hover:border-white hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Notice */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                role="alert"
                className="mt-6 border border-white/40 bg-black px-4 py-3 font-mono text-xs text-white"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Row */}
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[#262626] pt-8 sm:flex-row sm:items-center">
            <div className="font-mono text-xs text-[#888888]">
              Output package: 3 Titles · 150–200 Word Abstract · 5 Keywords · 3 Objectives · 3
              Enhancements
            </div>

            <MagneticButton
              type="submit"
              disabled={isGenerating}
              className="inline-flex min-h-[46px] items-center justify-center gap-3 border border-white bg-white px-7 py-3 text-sm font-semibold text-black whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Synthesizing Manuscript...</span>
                </>
              ) : (
                <>
                  <span>Generate Research Package</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </MagneticButton>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
