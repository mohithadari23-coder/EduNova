import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Copy, Download } from 'lucide-react';
import type { ResearchOutput } from '../types/research';
import { formatResearchAsText } from '../utils/academicGenerator';
import { MagneticButton } from './MagneticButton';
import { TiltCard } from './TiltCard';

interface ResearchOutputsProps {
  output: ResearchOutput;
  isGenerating: boolean;
  isSamplePreview: boolean;
}

const SYNTHESIS_STEPS = [
  'Parsing thesis vectors and domain taxonomy...',
  'Calibrating IEEE & Springer title structures...',
  'Composing 150–200 word academic abstract arc...',
  'Extracting index keywords & research roadmap...',
];

function CopyFeedbackIcon({ copied }: { copied: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {copied ? (
        <motion.span
          key="check"
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="inline-flex"
        >
          <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </motion.span>
      ) : (
        <motion.span
          key="copy"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.14 }}
          className="inline-flex"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function ResearchOutputs({
  output,
  isGenerating,
  isSamplePreview,
}: ResearchOutputsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setStepIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % SYNTHESIS_STEPS.length);
    }, 320);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1800);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1800);
    }
  };

  const handleExportTxt = () => {
    const content = formatResearchAsText(output);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scholarcraft-research-brief.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inRange = output.wordCount >= 150 && output.wordCount <= 200;
  const outputKey = `${output.sourceIdea}-${output.domainLabel}-${output.wordCount}`;

  return (
    <section
      id="output"
      aria-labelledby="output-heading"
      className="border-t border-[#262626] bg-black/45 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section Header + Copy All / Export .txt Controls */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex flex-col justify-between gap-6 border-b border-[#262626] pb-8 lg:flex-row lg:items-end"
        >
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#888888]">
              <span>02. Generated Research Package</span>
              <span aria-hidden="true">·</span>
              <span>{output.domainLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{isSamplePreview ? 'Featured Sample Draft' : 'Custom Draft'}</span>
            </div>
            <h2
              id="output-heading"
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Structured Academic Manuscript
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <MagneticButton
              onClick={() => handleCopy('all', formatResearchAsText(output))}
              className="inline-flex min-h-[42px] items-center gap-2 border border-[#262626] bg-[#0A0A0A] px-5 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {copiedId === 'all' ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copied All</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy All</span>
                </>
              )}
            </MagneticButton>

            <MagneticButton
              onClick={handleExportTxt}
              className="inline-flex min-h-[42px] items-center gap-2 border border-white bg-white px-5 py-2 text-xs font-semibold text-black whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export as .txt</span>
            </MagneticButton>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading-state"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              aria-live="polite"
              className="space-y-6 border border-[#262626] bg-[#0A0A0A] p-8 sm:p-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] pb-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stepIndex}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="font-mono text-xs text-white"
                  >
                    {SYNTHESIS_STEPS[stepIndex]}
                  </motion.span>
                </AnimatePresence>

                {/* Animated monochrome waveform bars */}
                <div className="flex items-end gap-1 h-4" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <motion.span
                      key={bar}
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { scaleY: [0.3, 1, 0.4] }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 0.75,
                        delay: bar * 0.1,
                        ease: 'easeInOut',
                      }}
                      className="h-4 w-[2px] origin-bottom bg-white"
                    />
                  ))}
                </div>
              </div>

              <div className="h-[2px] w-full overflow-hidden bg-[#262626]">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                  className="h-full w-1/3 bg-white"
                />
              </div>

              <div className="grid gap-4 pt-2">
                <div className="h-6 w-3/4 animate-pulse bg-[#171717]" />
                <div className="h-24 w-full animate-pulse bg-[#171717]" />
                <div className="h-6 w-1/2 animate-pulse bg-[#171717]" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={outputKey}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Card 1: 3 Research Title Options */}
              <TiltCard className="p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4 border-b border-[#262626] pb-4">
                  <div>
                    <span className="font-mono text-xs text-[#888888]">01 / Titles</span>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      Research Title Options
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-[#888888] whitespace-nowrap">
                    IEEE / Springer Style
                  </span>
                </div>

                <div className="mt-2 divide-y divide-[#262626]">
                  {output.titles.map((title, index) => {
                    const key = `title-${index}`;
                    const copied = copiedId === key;
                    return (
                      <motion.div
                        key={key}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 'some' }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-xs text-[#888888] tabular-nums shrink-0">
                            0{index + 1}
                          </span>
                          <p className="font-display text-base font-medium leading-snug text-white sm:text-lg">
                            {title}
                          </p>
                        </div>

                        <motion.button
                          type="button"
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                          onClick={() => handleCopy(key, title)}
                          aria-label={`Copy title option ${index + 1}`}
                          className="inline-flex min-h-[38px] items-center gap-2 self-start border border-[#262626] bg-black px-3.5 py-1.5 font-mono text-xs text-[#A3A3A3] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-white hover:text-white sm:self-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          <CopyFeedbackIcon copied={copied} />
                          <span className={copied ? 'text-white' : ''}>
                            {copied ? 'Copied' : 'Copy'}
                          </span>
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </TiltCard>

              {/* Card 2: Research Abstract (150-200 words) */}
              <TiltCard className="p-6 sm:p-8" delay={0.06}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] pb-4">
                  <div>
                    <span className="font-mono text-xs text-[#888888]">02 / Abstract</span>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      Research Abstract
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="border border-[#262626] bg-black px-3 py-1.5 font-mono text-xs text-white tabular-nums whitespace-nowrap">
                      {output.wordCount} words ·{' '}
                      {inRange ? 'Verified 150–200 range' : '150–200 target'}
                    </span>
                    <motion.button
                      type="button"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                      onClick={() => handleCopy('abstract', output.abstract)}
                      className="inline-flex min-h-[36px] items-center gap-2 border border-[#262626] bg-black px-3.5 py-1.5 font-mono text-xs text-[#A3A3A3] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <CopyFeedbackIcon copied={copiedId === 'abstract'} />
                      <span className={copiedId === 'abstract' ? 'text-white' : ''}>
                        {copiedId === 'abstract' ? 'Copied' : 'Copy Abstract'}
                      </span>
                    </motion.button>
                  </div>
                </div>

                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                  className="mt-6 max-w-[74ch] text-base leading-[1.78] text-[#E5E5E5]"
                >
                  {output.abstract}
                </motion.p>
              </TiltCard>

              {/* Card 3: 5 Keywords */}
              <TiltCard className="p-6 sm:p-8" delay={0.1}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] pb-4">
                  <div>
                    <span className="font-mono text-xs text-[#888888]">03 / Index Terms</span>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      5 Keywords
                    </h3>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                    onClick={() => handleCopy('keywords', output.keywords.join(', '))}
                    className="inline-flex min-h-[38px] items-center gap-2 border border-[#262626] bg-black px-3.5 py-1.5 font-mono text-xs text-[#A3A3A3] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <CopyFeedbackIcon copied={copiedId === 'keywords'} />
                    <span className={copiedId === 'keywords' ? 'text-white' : ''}>
                      {copiedId === 'keywords' ? 'Copied Keywords' : 'Copy Keywords'}
                    </span>
                  </motion.button>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {output.keywords.map((kw, index) => (
                    <motion.span
                      key={`${kw}-${index}`}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.92 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { y: -3, scale: 1.04, borderColor: '#FFFFFF' }
                      }
                      viewport={{ once: true, amount: 'some' }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="rounded-full border border-[#262626] bg-black px-4 py-2 font-mono text-xs text-white transition-colors duration-150"
                    >
                      {kw}
                    </motion.span>
                  ))}
                </div>
              </TiltCard>

              {/* Card 4 & Card 5 Side-by-Side Grid on Desktop */}
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Card 4: 3 Research Objectives */}
                <TiltCard className="p-6 sm:p-8" delay={0.12}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-[#262626] pb-4">
                    <div>
                      <span className="font-mono text-xs text-[#888888]">04 / Methodology</span>
                      <h3 className="mt-1 font-display text-xl font-semibold text-white">
                        3 Research Objectives
                      </h3>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                      onClick={() =>
                        handleCopy(
                          'objectives',
                          output.objectives.map((o, i) => `0${i + 1}. ${o}`).join('\n')
                        )
                      }
                      className="inline-flex min-h-[36px] items-center gap-2 border border-[#262626] bg-black px-3 py-1 font-mono text-xs text-[#A3A3A3] whitespace-nowrap shrink-0 transition-colors hover:border-white hover:text-white"
                    >
                      <CopyFeedbackIcon copied={copiedId === 'objectives'} />
                      <span className={copiedId === 'objectives' ? 'text-white' : ''}>
                        {copiedId === 'objectives' ? 'Copied' : 'Copy'}
                      </span>
                    </motion.button>
                  </div>

                  <ol className="mt-2 divide-y divide-[#262626]">
                    {output.objectives.map((objective, idx) => (
                      <motion.li
                        key={idx}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 'some' }}
                        transition={{
                          duration: 0.38,
                          delay: idx * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex items-baseline gap-4 py-5"
                      >
                        <span className="font-mono text-xs font-medium text-[#888888] tabular-nums shrink-0">
                          0{idx + 1}.
                        </span>
                        <p className="text-sm leading-relaxed text-[#E5E5E5] sm:text-[15px]">
                          {objective}
                        </p>
                      </motion.li>
                    ))}
                  </ol>
                </TiltCard>

                {/* Card 5: 3 Possible Future Enhancements */}
                <TiltCard className="p-6 sm:p-8" delay={0.16}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-[#262626] pb-4">
                    <div>
                      <span className="font-mono text-xs text-[#888888]">05 / Roadmap</span>
                      <h3 className="mt-1 font-display text-xl font-semibold text-white">
                        3 Possible Future Enhancements
                      </h3>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                      onClick={() =>
                        handleCopy(
                          'enhancements',
                          output.futureEnhancements.map((e, i) => `0${i + 1}. ${e}`).join('\n')
                        )
                      }
                      className="inline-flex min-h-[36px] items-center gap-2 border border-[#262626] bg-black px-3 py-1 font-mono text-xs text-[#A3A3A3] whitespace-nowrap shrink-0 transition-colors hover:border-white hover:text-white"
                    >
                      <CopyFeedbackIcon copied={copiedId === 'enhancements'} />
                      <span className={copiedId === 'enhancements' ? 'text-white' : ''}>
                        {copiedId === 'enhancements' ? 'Copied' : 'Copy'}
                      </span>
                    </motion.button>
                  </div>

                  <ol className="mt-2 divide-y divide-[#262626]">
                    {output.futureEnhancements.map((enhancement, idx) => (
                      <motion.li
                        key={idx}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 'some' }}
                        transition={{
                          duration: 0.38,
                          delay: idx * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex items-baseline gap-4 py-5"
                      >
                        <span className="font-mono text-xs font-medium text-[#888888] tabular-nums shrink-0">
                          0{idx + 1}.
                        </span>
                        <p className="text-sm leading-relaxed text-[#E5E5E5] sm:text-[15px]">
                          {enhancement}
                        </p>
                      </motion.li>
                    ))}
                  </ol>
                </TiltCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
