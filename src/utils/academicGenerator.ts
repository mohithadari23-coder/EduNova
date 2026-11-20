import type {
  AiProvider,
  DomainOption,
  ResearchOutput,
  SampleIdea,
} from '../types/research';

export const SAMPLE_IDEAS: SampleIdea[] = [
  {
    id: 'fake-news-nlp',
    label: 'Fake News Detection (AI)',
    domain: 'AI',
    text: 'Detect fake news using machine learning and NLP on social media posts',
  },
  {
    id: 'smart-hvac-iot',
    label: 'Smart Energy HVAC (IoT)',
    domain: 'IoT',
    text: 'Optimize campus HVAC energy consumption using low-power IoT sensor networks and edge analytics',
  },
  {
    id: 'zero-trust-cloud',
    label: 'Zero-Trust Intrusion Defense (Cybersecurity)',
    domain: 'Cybersecurity',
    text: 'Detect lateral movement anomalies in cloud-native microservices using zero-trust behavioral telemetry',
  },
];

interface DomainProfile {
  label: string;
  methodologyNoun: string;
  architecturePhrase: string;
  pipelinePhrase: string;
  evaluationMetric: string;
  benchmarkContext: string;
  keywordsPool: string[];
  enhancements: [string, string, string];
  titlePrefixes: [string, string, string];
}

const DOMAIN_PROFILES: Record<Exclude<DomainOption, 'Other'>, DomainProfile> = {
  AI: {
    label: 'Artificial Intelligence & Machine Learning',
    methodologyNoun: 'multi-stage transformer and representation learning framework',
    architecturePhrase:
      'hierarchical attention mechanisms coupled with calibrated feature extraction layers',
    pipelinePhrase:
      'automated tokenization, contextual embedding normalization, and ensemble classification',
    evaluationMetric:
      'precision, recall, macro F1-score, and area under the receiver operating characteristic curve',
    benchmarkContext:
      'cross-validated multi-source benchmark corpora under class-imbalance and noisy perturbation conditions',
    keywordsPool: [
      'Deep Representation Learning',
      'Transformer Attention',
      'Automated Classification',
      'Model Generalization',
      'Explainable Artificial Intelligence',
    ],
    enhancements: [
      'Incorporate parameter-efficient federated fine-tuning across decentralized institutions to preserve data privacy without degrading predictive recall.',
      'Integrate post-hoc explainability attribution maps (SHAP and Integrated Gradients) to provide human-auditable decision rationales for domain practitioners.',
      'Extend the inference pipeline with continual learning and drift-aware calibration so model weights adapt autonomously to emerging real-world distributions.',
    ],
    titlePrefixes: [
      'A Hybrid Representation Learning Framework for',
      'Context-Aware Neural Modeling and Empirical Evaluation of',
      'Robust Attention-Guided Architecture for Automated',
    ],
  },
  IoT: {
    label: 'Internet of Things & Edge Systems',
    methodologyNoun: 'resource-constrained edge-cloud telemetry architecture',
    architecturePhrase:
      'distributed sensor-fusion nodes communicating over lightweight MQTT and CoAP protocols',
    pipelinePhrase:
      'real-time signal denoising, quantized edge inference, and closed-loop actuation scheduling',
    evaluationMetric:
      'end-to-end transmission latency, packet delivery ratio, energy-per-inference, and sensing accuracy',
    benchmarkContext:
      'heterogeneous microcontroller testbeds subjected to intermittent wireless connectivity and dynamic workload bursts',
    keywordsPool: [
      'Edge-Cloud Telemetry',
      'TinyML Quantization',
      'Sensor Fusion Networks',
      'Low-Power Actuation',
      'MQTT Protocol Optimization',
    ],
    enhancements: [
      'Deploy ultra-low-power TinyML quantized kernels directly onto ARM Cortex-M nodes to eliminate cloud round-trip bottlenecks during network outages.',
      'Adopt adaptive LoRaWAN and BLE mesh duty-cycling policies driven by reinforcement learning to extend battery longevity across remote deployments.',
      'Introduce hardware root-of-trust attestation and lightweight post-quantum session keys to safeguard firmware integrity across distributed sensor fleets.',
    ],
    titlePrefixes: [
      'An Energy-Efficient Edge-Cloud Telemetry Architecture for',
      'Low-Latency Distributed Sensor Fusion and Control for',
      'Resilient TinyML-Enabled Cyber-Physical Framework for',
    ],
  },
  Web: {
    label: 'Web Engineering & Distributed Platforms',
    methodologyNoun: 'modular edge-rendered distributed web architecture',
    architecturePhrase:
      'event-driven microservices paired with optimistic state reconciliation and schema-typed APIs',
    pipelinePhrase:
      'progressive client hydration, deterministic caching invalidation, and asynchronous queue orchestration',
    evaluationMetric:
      'p99 request latency, throughput under concurrency, core web vitals, and fault-recovery time',
    benchmarkContext:
      'simulated multi-region traffic workloads across high-concurrency browser and server environments',
    keywordsPool: [
      'Distributed Web Architecture',
      'Edge Compute Orchestration',
      'Optimistic State Sync',
      'API Schema Governance',
      'Fault-Tolerant Microservices',
    ],
    enhancements: [
      'Adopt WebAssembly compute workers in the browser runtime to offload intensive data parsing and visualization without blocking the main UI thread.',
      'Implement conflict-free replicated data types (CRDTs) for seamless offline-first multi-user collaboration and deterministic state convergence.',
      'Introduce automated canary routing and predictive edge cache pre-warming to sustain sub-50ms time-to-first-byte across global regions.',
    ],
    titlePrefixes: [
      'A Scalable Event-Driven Web Architecture for',
      'Low-Latency Edge Orchestration and State Synchronization in',
      'Fault-Tolerant Full-Stack Platform Design for',
    ],
  },
  Cybersecurity: {
    label: 'Cybersecurity & Zero-Trust Systems',
    methodologyNoun: 'zero-trust behavioral anomaly detection and response framework',
    architecturePhrase:
      'continuous cryptographic identity verification integrated with graph-based telemetry correlation',
    pipelinePhrase:
      'high-frequency packet inspection, MITRE ATT&CK tactic mapping, and automated policy containment',
    evaluationMetric:
      'true positive detection rate, false alarm ratio, mean time to detect, and verification overhead',
    benchmarkContext:
      'adversarial red-team intrusion traces and zero-day lateral-movement simulation environments',
    keywordsPool: [
      'Zero-Trust Telemetry',
      'Behavioral Anomaly Detection',
      'Cryptographic Attestation',
      'Automated Threat Triage',
      'Adversarial Resilience',
    ],
    enhancements: [
      'Integrate confidential computing enclaves and zero-knowledge proofs to verify workload integrity without exposing sensitive operational payloads.',
      'Incorporate adversarial robustness training against evasion and poisoning attacks targeting automated intrusion detection classifiers.',
      'Connect telemetry outputs with automated SOAR playbooks capable of micro-segmenting compromised workloads within milliseconds of anomaly confirmation.',
    ],
    titlePrefixes: [
      'A Zero-Trust Behavioral Telemetry Framework for',
      'Graph-Based Anomaly Correlation and Automated Defense in',
      'Adversarially Resilient Cryptographic Detection Architecture for',
    ],
  },
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'for',
  'of',
  'in',
  'on',
  'at',
  'to',
  'with',
  'using',
  'via',
  'by',
  'from',
  'based',
  'into',
  'through',
  'over',
  'under',
  'system',
  'platform',
  'application',
  'app',
  'project',
  'tool',
  'build',
  'create',
  'develop',
]);

const ACRONYMS = new Set([
  'ai',
  'ml',
  'nlp',
  'iot',
  'cnn',
  'rnn',
  'lstm',
  'llm',
  'api',
  'rest',
  'sql',
  'hvac',
  'ddos',
  'mqtt',
  'http',
  'https',
  'rbac',
  'soc',
  'siem',
  'eeg',
  'ecg',
  'mri',
  'ct',
  'uav',
  'gnn',
  'gan',
  'rag',
]);

function toAcademicTitleCase(input: string): string {
  const minor = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'by',
    'for',
    'from',
    'in',
    'into',
    'of',
    'on',
    'or',
    'the',
    'to',
    'via',
    'with',
  ]);
  return input
    .trim()
    .split(/\s+/)
    .map((word, index, arr) => {
      const clean = word.toLowerCase();
      if (ACRONYMS.has(clean)) return clean.toUpperCase();
      if (index > 0 && index < arr.length - 1 && minor.has(clean)) {
        return clean;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function cleanIdeaPhrase(rawIdea: string): string {
  const trimmed = rawIdea
    .trim()
    .replace(/^(e\.g\.,?\s*|build\s+a\s+|create\s+an?\s+|develop\s+an?\s+|design\s+an?\s+)/i, '')
    .replace(/[.!?]+$/, '');
  return trimmed || 'automated domain-specific decision support and telemetry analysis';
}

function extractTopicNounPhrase(cleanIdea: string): string {
  // Convert leading verb like "Detect X" -> "Automated Detection of X"
  const verbMap: Record<string, string> = {
    detect: 'Automated Detection of',
    detecting: 'Automated Detection of',
    predict: 'Predictive Modeling of',
    predicting: 'Predictive Modeling of',
    optimize: 'Optimization of',
    optimizing: 'Optimization of',
    classify: 'Multi-Class Classification of',
    classifying: 'Multi-Class Classification of',
    monitor: 'Real-Time Monitoring of',
    monitoring: 'Real-Time Monitoring of',
    secure: 'Cryptographic Securing of',
    securing: 'Cryptographic Securing of',
    automate: 'Intelligent Automation of',
    automating: 'Intelligent Automation of',
    analyze: 'Empirical Analysis of',
    analyzing: 'Empirical Analysis of',
    diagnose: 'Diagnostic Inference for',
    diagnosing: 'Diagnostic Inference for',
    forecast: 'Spatiotemporal Forecasting of',
    forecasting: 'Spatiotemporal Forecasting of',
    recommend: 'Personalized Recommendation for',
    recommending: 'Personalized Recommendation for',
  };

  const parts = cleanIdea.split(/\s+/);
  const firstLower = parts[0]?.toLowerCase() ?? '';
  if (verbMap[firstLower] && parts.length > 1) {
    return `${verbMap[firstLower]} ${parts.slice(1).join(' ')}`;
  }
  return cleanIdea;
}

function extractDomainKeywords(
  cleanIdea: string,
  domainLabel: string,
  pool: string[]
): [string, string, string, string, string] {
  const words = cleanIdea
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));

  const extracted: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const pair = toAcademicTitleCase(`${words[i]} ${words[i + 1]}`);
    if (!extracted.includes(pair) && pair.length <= 34) {
      extracted.push(pair);
    }
    if (extracted.length >= 2) break;
  }

  if (extracted.length === 0 && words.length > 0) {
    extracted.push(toAcademicTitleCase(words.slice(0, 2).join(' ')));
  }

  const combined = [...extracted];
  for (const item of pool) {
    if (combined.length >= 5) break;
    if (!combined.some((k) => k.toLowerCase() === item.toLowerCase())) {
      combined.push(item);
    }
  }

  while (combined.length < 5) {
    combined.push(`${domainLabel.split('&')[0].trim()} Systems`);
  }

  return [combined[0], combined[1], combined[2], combined[3], combined[4]];
}

function getCustomDomainProfile(customDomain: string): DomainProfile {
  const cleanDomain = toAcademicTitleCase(customDomain.trim() || 'Interdisciplinary Systems');
  return {
    label: cleanDomain,
    methodologyNoun: `domain-calibrated ${cleanDomain.toLowerCase()} analytical architecture`,
    architecturePhrase: `modular computational pipelines tailored to ${cleanDomain.toLowerCase()} operational constraints`,
    pipelinePhrase: `structured data ingestion, domain-specific feature synthesis, and validated inference`,
    evaluationMetric: `predictive reliability, operational throughput, error-rate reduction, and domain fidelity`,
    benchmarkContext: `curated ${cleanDomain.toLowerCase()} validation datasets and controlled experimental trials`,
    keywordsPool: [
      `${cleanDomain} Informatics`,
      'Empirical Validation',
      'Adaptive Decision Support',
      'Scalable Pipeline Design',
      'Domain-Specific Modeling',
    ],
    enhancements: [
      `Construct standardized open-access ${cleanDomain.toLowerCase()} benchmark suites to facilitate reproducible cross-institutional validation.`,
      `Integrate human-in-the-loop expert feedback loops calibrated specifically for high-stakes ${cleanDomain.toLowerCase()} workflows.`,
      `Scale the architecture toward multi-modal longitudinal datasets to capture seasonal and structural shifts across ${cleanDomain.toLowerCase()} environments.`,
    ],
    titlePrefixes: [
      `An Empirical ${cleanDomain} Framework for`,
      `Domain-Calibrated Computational Architecture for`,
      `Systematic Modeling and Validation of`,
    ],
  };
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function normalizeAbstractToRange(sentences: string[], extraClauses: string[]): string {
  let result = sentences.join(' ').replace(/\s+/g, ' ').trim();
  let words = countWords(result);

  let idx = 0;
  while (words < 158 && idx < extraClauses.length) {
    result = `${result} ${extraClauses[idx]}`.replace(/\s+/g, ' ').trim();
    words = countWords(result);
    idx++;
  }

  if (words > 195) {
    // Trim cleanly from the end while preserving complete sentence boundaries if possible
    const splitSentences = result.match(/[^.!?]+[.!?]+/g) ?? [result];
    while (splitSentences.length > 3 && countWords(splitSentences.join(' ')) > 195) {
      splitSentences.pop();
    }
    result = splitSentences.join(' ').trim();
    words = countWords(result);
  }

  // Final deterministic safeguard to guarantee 150-200 words
  if (words > 200) {
    const tokenList = result.split(/\s+/).slice(0, 188);
    result = `${tokenList.join(' ').replace(/[,;:\s]+$/, '')}.`;
  } else if (words < 150) {
    const pad =
      'Furthermore, comprehensive ablation studies and sensitivity analyses validate the stability, reproducibility, and practical deployability of the proposed methodology across diverse real-world operating conditions and domain benchmarks.';
    result = `${result} ${pad}`.trim();
    if (countWords(result) > 198) {
      const tokenList = result.split(/\s+/).slice(0, 185);
      result = `${tokenList.join(' ').replace(/[,;:\s]+$/, '')}.`;
    }
  }

  return result;
}

export function generateBuiltInResearch(
  rawIdea: string,
  domain: DomainOption,
  customDomain?: string
): ResearchOutput {
  const cleanIdea = cleanIdeaPhrase(rawIdea);
  const topicNoun = extractTopicNounPhrase(cleanIdea);
  const titledTopic = toAcademicTitleCase(topicNoun);

  const profile =
    domain === 'Other'
      ? getCustomDomainProfile(customDomain || 'Applied Computing')
      : DOMAIN_PROFILES[domain];

  const titles: [string, string, string] = [
    `${profile.titlePrefixes[0]} ${titledTopic}`,
    `${titledTopic}: ${profile.titlePrefixes[1]} ${profile.label.split('&')[0].trim()} Pipelines`,
    `${profile.titlePrefixes[2]} ${titledTopic} in Modern ${profile.label.split('&')[0].trim()} Environments`,
  ];

  const coreLower = cleanIdea.charAt(0).toLowerCase() + cleanIdea.slice(1);
  const nounLower = topicNoun.charAt(0).toLowerCase() + topicNoun.slice(1);

  const sentences = [
    `Rapid growth in contemporary ${profile.label.toLowerCase()} workflows has intensified the demand for rigorous, scalable approaches to ${coreLower}, yet conventional solutions frequently struggle with noisy inputs, fragmented telemetry, and limited cross-domain generalization.`,
    `To address these limitations, this study proposes a ${profile.methodologyNoun} specifically engineered for ${nounLower} through ${profile.architecturePhrase}.`,
    `The end-to-end operational workflow integrates ${profile.pipelinePhrase}, enabling consistent representation fidelity while minimizing computational bottlenecks and manual tuning overhead.`,
    `Experimental evaluation is structured around ${profile.benchmarkContext}, systematically measuring ${profile.evaluationMetric} against established baseline implementations.`,
    `Empirical observations demonstrate that decoupling feature synthesis from domain-specific decision boundaries yields stronger calibration, improved resilience under distribution shifts, and transparent diagnostic traceability.`,
    `Consequently, this research contributes a reproducible architectural blueprint and quantitative benchmark methodology for deploying trustworthy ${profile.label.toLowerCase()} solutions in production academic and industrial settings.`,
  ];

  const extraClauses = [
    `Additional ablation experiments isolate the contribution of each architectural module to overall stability and inference efficiency.`,
    `By balancing algorithmic rigor with practical resource constraints, the proposed system establishes a verifiable foundation for subsequent scholarly investigation and real-world adoption.`,
    `Statistical significance testing across repeated trials further confirms consistent performance gains over conventional heuristic baselines.`,
  ];

  const abstract = normalizeAbstractToRange(sentences, extraClauses);
  const keywords = extractDomainKeywords(cleanIdea, profile.label, profile.keywordsPool);

  const objectives: [string, string, string] = [
    `To formulate and architect a domain-aligned computational pipeline capable of ${coreLower} with high precision and minimal structural latency.`,
    `To implement automated preprocessing, feature normalization, and validation routines tailored to ${profile.label.toLowerCase()} workloads and edge-case noise.`,
    `To benchmark the proposed framework against baseline methods using ${profile.evaluationMetric} across representative experimental datasets.`,
  ];

  return {
    titles,
    abstract,
    wordCount: countWords(abstract),
    keywords,
    objectives,
    futureEnhancements: profile.enhancements,
    domainLabel: profile.label,
    sourceIdea: rawIdea.trim() || cleanIdea,
    generationMode: 'built-in',
  };
}

function buildLiveAiPrompt(idea: string, domainLabel: string): string {
  return `You are an expert IEEE and Springer academic research advisor.
Given the following project idea and research domain, generate a complete structured research brief.

Project Idea: "${idea}"
Research Domain: "${domainLabel}"

Return ONLY valid JSON (no markdown code fences) matching this exact schema:
{
  "titles": ["title 1", "title 2", "title 3"],
  "abstract": "A cohesive, formal academic abstract strictly between 155 and 190 words.",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "objectives": ["To ...", "To ...", "To ..."],
  "futureEnhancements": ["enhancement 1", "enhancement 2", "enhancement 3"]
}

Strict constraints:
1. "titles" must have exactly 3 distinct IEEE/Springer-style academic titles.
2. "abstract" must be a single cohesive academic paragraph strictly between 150 and 200 words (aim for 165–185 words). Count your words carefully.
3. "keywords" must have exactly 5 concise academic keywords.
4. "objectives" must have exactly 3 action-oriented objectives starting with "To ...".
5. "futureEnhancements" must have exactly 3 forward-looking extensions tailored to ${domainLabel}.`;
}

function extractJsonObject(raw: string): Record<string, unknown> {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Model response did not contain valid JSON.');
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

function coerceLiveOutput(
  parsed: Record<string, unknown>,
  idea: string,
  domain: DomainOption,
  customDomain: string | undefined,
  provider: AiProvider
): ResearchOutput {
  const fallback = generateBuiltInResearch(idea, domain, customDomain);

  const titlesArr = Array.isArray(parsed.titles)
    ? parsed.titles.map((t) => String(t).trim()).filter(Boolean)
    : [];
  const titles: [string, string, string] = [
    titlesArr[0] || fallback.titles[0],
    titlesArr[1] || fallback.titles[1],
    titlesArr[2] || fallback.titles[2],
  ];

  let abstract = typeof parsed.abstract === 'string' ? parsed.abstract.trim() : fallback.abstract;
  const wc = countWords(abstract);
  if (wc < 140 || wc > 215) {
    abstract = normalizeAbstractToRange([abstract], [
      'Comprehensive empirical benchmarking across representative validation datasets confirms the robustness, scalability, and reproducibility of the proposed methodology.',
      'Furthermore, ablation analyses quantify the contribution of each pipeline stage to overall predictive accuracy and operational efficiency.',
    ]);
  }

  const kwArr = Array.isArray(parsed.keywords)
    ? parsed.keywords.map((k) => String(k).trim()).filter(Boolean)
    : [];
  const keywords: [string, string, string, string, string] = [
    kwArr[0] || fallback.keywords[0],
    kwArr[1] || fallback.keywords[1],
    kwArr[2] || fallback.keywords[2],
    kwArr[3] || fallback.keywords[3],
    kwArr[4] || fallback.keywords[4],
  ];

  const objArr = Array.isArray(parsed.objectives)
    ? parsed.objectives.map((o) => String(o).trim()).filter(Boolean)
    : [];
  const objectives: [string, string, string] = [
    objArr[0] || fallback.objectives[0],
    objArr[1] || fallback.objectives[1],
    objArr[2] || fallback.objectives[2],
  ];

  const enhArr = Array.isArray(parsed.futureEnhancements)
    ? parsed.futureEnhancements.map((e) => String(e).trim()).filter(Boolean)
    : [];
  const futureEnhancements: [string, string, string] = [
    enhArr[0] || fallback.futureEnhancements[0],
    enhArr[1] || fallback.futureEnhancements[1],
    enhArr[2] || fallback.futureEnhancements[2],
  ];

  return {
    titles,
    abstract,
    wordCount: countWords(abstract),
    keywords,
    objectives,
    futureEnhancements,
    domainLabel: fallback.domainLabel,
    sourceIdea: idea.trim(),
    generationMode: provider,
  };
}

export async function generateWithLiveAi(
  idea: string,
  domain: DomainOption,
  customDomain: string | undefined,
  provider: AiProvider,
  apiKey: string
): Promise<ResearchOutput> {
  const domainLabel =
    domain === 'Other'
      ? (customDomain?.trim() || 'Interdisciplinary Computing')
      : DOMAIN_PROFILES[domain].label;

  const prompt = buildLiveAiPrompt(idea, domainLabel);

  if (provider === 'gemini') {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      apiKey.trim()
    )}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(
        `Gemini API request failed (${response.status}). Check your API key or switch to built-in mode. ${errBody.slice(0, 120)}`
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = extractJsonObject(rawText);
    return coerceLiveOutput(parsed, idea, domain, customDomain, 'gemini');
  }

  // OpenAI provider
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You output strictly valid JSON academic research packages.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `OpenAI API request failed (${response.status}). Verify your API key or use built-in mode. ${errBody.slice(0, 120)}`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawText = data.choices?.[0]?.message?.content ?? '';
  const parsed = extractJsonObject(rawText);
  return coerceLiveOutput(parsed, idea, domain, customDomain, 'openai');
}

export function formatResearchAsText(output: ResearchOutput): string {
  const divider = '====================================================================';
  return [
    'SCHOLARCRAFT — ACADEMIC RESEARCH BRIEF',
    divider,
    `Domain: ${output.domainLabel}`,
    `Source Idea: ${output.sourceIdea}`,
    `Abstract Word Count: ${output.wordCount} words`,
    '',
    '1. RESEARCH TITLE OPTIONS (IEEE / SPRINGER STYLE)',
    ...output.titles.map((t, i) => `   [${i + 1}] ${t}`),
    '',
    '2. RESEARCH ABSTRACT',
    output.abstract,
    '',
    '3. INDEX KEYWORDS',
    `   ${output.keywords.join(' · ')}`,
    '',
    '4. RESEARCH OBJECTIVES',
    ...output.objectives.map((obj, i) => `   0${i + 1}. ${obj}`),
    '',
    '5. POSSIBLE FUTURE ENHANCEMENTS',
    ...output.futureEnhancements.map((enh, i) => `   0${i + 1}. ${enh}`),
    divider,
  ].join('\n');
}
