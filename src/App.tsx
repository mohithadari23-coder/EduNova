import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { CustomCursor } from './components/CustomCursor';
import { BackgroundFieldCanvas } from './components/BackgroundFieldCanvas';
import { GeneratorForm } from './components/GeneratorForm';
import { Header } from './components/Header';
import { MagneticButton } from './components/MagneticButton';
import { Preloader } from './components/Preloader';
import { ResearchOutputs } from './components/ResearchOutputs';
import { WireframeHeroCanvas } from './components/WireframeHeroCanvas';
import type { DomainOption, LiveAiConfig, ResearchOutput } from './types/research';
import {
  SAMPLE_IDEAS,
  generateBuiltInResearch,
  generateWithLiveAi,
} from './utils/academicGenerator';

const LIVE_AI_STORAGE_KEY = 'scholarcraft_live_ai_config';

const HERO_HEADLINE_WORDS = [
  'AI',
  'Research',
  'Title,',
  'Abstract',
  '&',
  'Keyword',
  'Generator.',
];

const MARQUEE_ITEMS = [
  'IEEE & Springer Calibration',
  '150–200 Word Abstract Verification',
  'Domain-Aware Synthesis',
  'Action-Oriented Objectives',
  'Zero-Dependency Export',
];

function loadInitialLiveAiConfig(): LiveAiConfig {
  try {
    const raw = window.localStorage.getItem(LIVE_AI_STORAGE_KEY);
    if (!raw) {
      return { enabled: false, provider: 'gemini', apiKey: '' };
    }
    const parsed = JSON.parse(raw) as Partial<LiveAiConfig>;
    return {
      enabled: Boolean(parsed.enabled && parsed.apiKey),
      provider: parsed.provider === 'openai' ? 'openai' : 'gemini',
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
    };
  } catch {
    return { enabled: false, provider: 'gemini', apiKey: '' };
  }
}

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [preloaderDone, setPreloaderDone] = useState(false);

  const [idea, setIdea] = useState('');
  const [domain, setDomain] = useState<DomainOption>('AI');
  const [customDomain, setCustomDomain] = useState('');
  const [liveAi, setLiveAi] = useState<LiveAiConfig>(loadInitialLiveAiConfig);

  const [output, setOutput] = useState<ResearchOutput>(() =>
    generateBuiltInResearch(SAMPLE_IDEAS[0].text, 'AI')
  );
  const [isSamplePreview, setIsSamplePreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 32,
    restDelta: 0.001,
  });

  // Hero scroll-linked depth parallax
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const canvasScale = useTransform(heroScrollProgress, [0, 1], [1, 1.18]);
  const canvasY = useTransform(heroScrollProgress, [0, 1], ['0%', '14%']);
  const heroCopyY = useTransform(heroScrollProgress, [0, 1], ['0px', '48px']);
  const heroCopyOpacity = useTransform(heroScrollProgress, [0, 0.85], [1, 0.25]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LIVE_AI_STORAGE_KEY, JSON.stringify(liveAi));
    } catch {
      // Ignore storage quota errors
    }
  }, [liveAi]);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const handleStartDrafting = () => {
    scrollToSection('generator');
    window.setTimeout(() => {
      document.getElementById('project-idea-input')?.focus({ preventScroll: true });
    }, 350);
  };

  const handleGenerate = async () => {
    const trimmedIdea = idea.trim();
    if (!trimmedIdea) {
      setErrorMessage(
        'Please enter a project idea or select one of the sample prompts above to generate a manuscript package.'
      );
      document.getElementById('project-idea-input')?.focus();
      return;
    }

    if (domain === 'Other' && !customDomain.trim()) {
      setErrorMessage('Please specify your custom research domain before generating.');
      document.getElementById('custom-domain-input')?.focus();
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      let result: ResearchOutput;

      if (liveAi.enabled && liveAi.apiKey.trim()) {
        result = await generateWithLiveAi(
          trimmedIdea,
          domain,
          customDomain,
          liveAi.provider,
          liveAi.apiKey
        );
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 680));
        result = generateBuiltInResearch(trimmedIdea, domain, customDomain);
      }

      setOutput(result);
      setIsSamplePreview(false);
      scrollToSection('output');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Live AI generation encountered an error. You can disable Live AI to use the built-in generator.';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const heroStagger = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.56,
        delay: preloaderDone ? index * 0.08 : 0.14 + index * 0.08,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Full-viewport kinetic monochrome background field */}
      <BackgroundFieldCanvas />

      {/* Top fixed scroll progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 right-0 left-0 z-50 h-[2px] origin-left bg-white"
        aria-hidden="true"
      />

      <Preloader onComplete={handlePreloaderComplete} />
      <CustomCursor />

      <Header onStartDrafting={handleStartDrafting} />

      <main className="relative z-10">
        {/* Hero Section with Interactive 3D Geodesic Wireframe + Scroll Parallax */}
        <section
          ref={heroRef}
          id="overview"
          className="relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden bg-transparent py-20 sm:py-28"
        >
          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : { scale: canvasScale, y: canvasY }
            }
            className="pointer-events-none absolute inset-0"
          >
            <WireframeHeroCanvas />
          </motion.div>

          {/* Subtle vignette scrim for effortless legibility over 3D wireframe */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent"
            aria-hidden="true"
          />

          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : { y: heroCopyY, opacity: heroCopyOpacity }
            }
            className="relative z-10 mx-auto w-full max-w-[1200px] px-6"
          >
            <div className="max-w-2xl">
              <motion.p
                custom={0}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                variants={heroStagger}
                className="font-mono text-xs tracking-wide text-[#888888]"
              >
                ScholarCraft · Academic Manuscript Synthesizer
              </motion.p>

              {/* Word-by-word masked curtain reveal headline */}
              <h1 className="mt-5 font-display text-[clamp(2.35rem,4.6vw,4.15rem)] font-semibold leading-[1.06] tracking-tight text-white [text-wrap:balance]">
                {HERO_HEADLINE_WORDS.map((word, idx) => (
                  <span key={`${word}-${idx}`} className="mr-[0.26em] inline-block overflow-hidden">
                    <motion.span
                      className="inline-block"
                      initial={
                        prefersReducedMotion ? false : { y: '115%', opacity: 0 }
                      }
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{
                        duration: 0.62,
                        delay: (preloaderDone ? 0.05 : 0.25) + idx * 0.045,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                custom={2}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                variants={heroStagger}
                className="mt-6 max-w-xl text-base leading-relaxed text-[#A3A3A3] sm:text-lg"
              >
                Transform an early project concept into IEEE and Springer-ready research titles,
                verified 150–200 word abstracts, index keywords, methodology objectives, and
                domain-specific future directions.
              </motion.p>

              <motion.div
                custom={3}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                variants={heroStagger}
                className="mt-10 flex flex-wrap items-center gap-5"
              >
                <MagneticButton
                  onClick={handleStartDrafting}
                  className="inline-flex min-h-[48px] items-center gap-3 border border-white bg-white px-7 py-3 text-sm font-semibold text-black whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span>Compose Research Brief</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </MagneticButton>

                <button
                  type="button"
                  onClick={() => scrollToSection('output')}
                  className="min-h-[44px] px-2 text-sm font-medium text-[#A3A3A3] underline decoration-[#404040] underline-offset-8 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Inspect Sample Manuscript
                </button>
              </motion.div>
            </div>

            {/* Full-width structural summary strip below hero content */}
            <motion.div
              custom={4}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              variants={heroStagger}
              className="mt-20 grid grid-cols-2 gap-6 border-t border-[#262626] pt-8 sm:grid-cols-4"
            >
              {[
                { num: '03', label: 'IEEE & Springer Titles' },
                { num: '150–200', label: 'Verified Abstract Words' },
                { num: '05', label: 'Domain Index Keywords' },
                { num: '03 + 03', label: 'Objectives & Enhancements' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: (preloaderDone ? 0.25 : 0.45) + idx * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="font-mono text-2xl font-medium text-white tabular-nums">
                    {stat.num}
                  </div>
                  <div className="mt-1 text-xs text-[#888888]">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Infinite Monochrome Editorial Marquee Ribbon */}
        <div
          aria-hidden="true"
          className="overflow-hidden border-t border-[#262626] bg-[#050505]/85 py-3.5 backdrop-blur-xs"
        >
          <motion.div
            animate={prefersReducedMotion ? undefined : { x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
            className="flex w-max items-center gap-8 whitespace-nowrap"
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-8 font-mono text-xs text-[#888888]"
              >
                <span>{item}</span>
                <span className="text-[#404040]">·</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Core Input Workspace */}
        <GeneratorForm
          idea={idea}
          onIdeaChange={(val) => {
            setIdea(val);
            if (errorMessage) setErrorMessage(null);
          }}
          domain={domain}
          onDomainChange={(dom) => {
            setDomain(dom);
            if (errorMessage) setErrorMessage(null);
          }}
          customDomain={customDomain}
          onCustomDomainChange={setCustomDomain}
          liveAi={liveAi}
          onLiveAiChange={setLiveAi}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
        />

        {/* Scrollable Monochrome Output Cards */}
        <ResearchOutputs
          output={output}
          isGenerating={isGenerating}
          isSamplePreview={isSamplePreview}
        />

        {/* Academic Standards & Architecture Section */}
        <section
          id="standards"
          aria-labelledby="standards-heading"
          className="border-t border-[#262626] bg-black/55 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] px-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12 max-w-xl"
            >
              <p className="font-mono text-xs tracking-wide text-[#888888]">
                03. Editorial Methodology
              </p>
              <h2
                id="standards-heading"
                className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
              >
                Built for conference &amp; journal discipline
              </h2>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  index: '01',
                  title: 'IEEE & Springer Title Calibration',
                  body: 'Titles pair methodological novelty with domain context, avoiding vague buzzwords while preserving concise indexing clarity.',
                },
                {
                  index: '02',
                  title: '150–200 Word Abstract Verification',
                  body: 'Every generated abstract follows the four-part scholarly arc—problem, architecture, evaluation, and contribution—verified by live word count.',
                },
                {
                  index: '03',
                  title: 'Zero-Dependency Portability',
                  body: 'Runs completely in the browser with an offline domain-aware synthesizer, one-click clipboard actions, and clean plain-text export.',
                },
              ].map((item, idx) => (
                <motion.article
                  key={item.index}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 26, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ duration: 0.48, delay: idx * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  className="border border-[#262626] bg-[#0A0A0A] p-7 transition-colors duration-200 hover:border-[#525252]"
                >
                  <span className="font-mono text-xs text-[#888888] tabular-nums">
                    {item.index}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#262626] bg-black/85 py-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#888888]">
            <span className="font-display font-semibold text-white">ScholarCraft</span>
            <span aria-hidden="true">·</span>
            <span>AI Research Title, Abstract &amp; Keyword Generator</span>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('overview')}
            className="inline-flex min-h-[38px] items-center gap-2 font-mono text-xs text-[#888888] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
