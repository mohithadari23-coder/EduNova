"""
EduNova - Academic Research Generator (Python port of academicGenerator.ts)
Generates IEEE/Springer-style research titles, abstracts, keywords, objectives,
and future enhancements from a project idea and domain.
"""

from __future__ import annotations
import re
import json
import urllib.request
import urllib.error
from dataclasses import dataclass
from typing import Literal

DomainOption = Literal["AI", "IoT", "Web", "Cybersecurity", "Other"]
AiProvider = Literal["gemini", "openai"]


@dataclass
class ResearchOutput:
    titles: tuple[str, str, str]
    abstract: str
    word_count: int
    keywords: tuple[str, str, str, str, str]
    objectives: tuple[str, str, str]
    future_enhancements: tuple[str, str, str]
    domain_label: str
    source_idea: str
    generation_mode: str


@dataclass
class SampleIdea:
    id: str
    label: str
    domain: DomainOption
    text: str


SAMPLE_IDEAS: list[SampleIdea] = [
    SampleIdea(
        id="fake-news-nlp",
        label="Fake News Detection (AI)",
        domain="AI",
        text="Detect fake news using machine learning and NLP on social media posts",
    ),
    SampleIdea(
        id="smart-hvac-iot",
        label="Smart Energy HVAC (IoT)",
        domain="IoT",
        text="Optimize campus HVAC energy consumption using low-power IoT sensor networks and edge analytics",
    ),
    SampleIdea(
        id="zero-trust-cloud",
        label="Zero-Trust Intrusion Defense (Cybersecurity)",
        domain="Cybersecurity",
        text="Detect lateral movement anomalies in cloud-native microservices using zero-trust behavioral telemetry",
    ),
]


class DomainProfile:
    def __init__(
        self,
        label: str,
        methodology_noun: str,
        architecture_phrase: str,
        pipeline_phrase: str,
        evaluation_metric: str,
        benchmark_context: str,
        keywords_pool: list[str],
        enhancements: tuple[str, str, str],
        title_prefixes: tuple[str, str, str],
    ):
        self.label = label
        self.methodology_noun = methodology_noun
        self.architecture_phrase = architecture_phrase
        self.pipeline_phrase = pipeline_phrase
        self.evaluation_metric = evaluation_metric
        self.benchmark_context = benchmark_context
        self.keywords_pool = keywords_pool
        self.enhancements = enhancements
        self.title_prefixes = title_prefixes


DOMAIN_PROFILES: dict[str, DomainProfile] = {
    "AI": DomainProfile(
        label="Artificial Intelligence & Machine Learning",
        methodology_noun="multi-stage transformer and representation learning framework",
        architecture_phrase="hierarchical attention mechanisms coupled with calibrated feature extraction layers",
        pipeline_phrase="automated tokenization, contextual embedding normalization, and ensemble classification",
        evaluation_metric="precision, recall, macro F1-score, and area under the receiver operating characteristic curve",
        benchmark_context="cross-validated multi-source benchmark corpora under class-imbalance and noisy perturbation conditions",
        keywords_pool=[
            "Deep Representation Learning",
            "Transformer Attention",
            "Automated Classification",
            "Model Generalization",
            "Explainable Artificial Intelligence",
        ],
        enhancements=(
            "Incorporate parameter-efficient federated fine-tuning across decentralized institutions to preserve data privacy without degrading predictive recall.",
            "Integrate post-hoc explainability attribution maps (SHAP and Integrated Gradients) to provide human-auditable decision rationales for domain practitioners.",
            "Extend the inference pipeline with continual learning and drift-aware calibration so model weights adapt autonomously to emerging real-world distributions.",
        ),
        title_prefixes=(
            "A Hybrid Representation Learning Framework for",
            "Context-Aware Neural Modeling and Empirical Evaluation of",
            "Robust Attention-Guided Architecture for Automated",
        ),
    ),
    "IoT": DomainProfile(
        label="Internet of Things & Edge Systems",
        methodology_noun="resource-constrained edge-cloud telemetry architecture",
        architecture_phrase="distributed sensor-fusion nodes communicating over lightweight MQTT and CoAP protocols",
        pipeline_phrase="real-time signal denoising, quantized edge inference, and closed-loop actuation scheduling",
        evaluation_metric="end-to-end transmission latency, packet delivery ratio, energy-per-inference, and sensing accuracy",
        benchmark_context="heterogeneous microcontroller testbeds subjected to intermittent wireless connectivity and dynamic workload bursts",
        keywords_pool=[
            "Edge-Cloud Telemetry",
            "TinyML Quantization",
            "Sensor Fusion Networks",
            "Low-Power Actuation",
            "MQTT Protocol Optimization",
        ],
        enhancements=(
            "Deploy ultra-low-power TinyML quantized kernels directly onto ARM Cortex-M nodes to eliminate cloud round-trip bottlenecks during network outages.",
            "Adopt adaptive LoRaWAN and BLE mesh duty-cycling policies driven by reinforcement learning to extend battery longevity across remote deployments.",
            "Introduce hardware root-of-trust attestation and lightweight post-quantum session keys to safeguard firmware integrity across distributed sensor fleets.",
        ),
        title_prefixes=(
            "An Energy-Efficient Edge-Cloud Telemetry Architecture for",
            "Low-Latency Distributed Sensor Fusion and Control for",
            "Resilient TinyML-Enabled Cyber-Physical Framework for",
        ),
    ),
    "Web": DomainProfile(
        label="Web Engineering & Distributed Platforms",
        methodology_noun="modular edge-rendered distributed web architecture",
        architecture_phrase="event-driven microservices paired with optimistic state reconciliation and schema-typed APIs",
        pipeline_phrase="progressive client hydration, deterministic caching invalidation, and asynchronous queue orchestration",
        evaluation_metric="p99 request latency, throughput under concurrency, core web vitals, and fault-recovery time",
        benchmark_context="simulated multi-region traffic workloads across high-concurrency browser and server environments",
        keywords_pool=[
            "Distributed Web Architecture",
            "Edge Compute Orchestration",
            "Optimistic State Sync",
            "API Schema Governance",
            "Fault-Tolerant Microservices",
        ],
        enhancements=(
            "Adopt WebAssembly compute workers in the browser runtime to offload intensive data parsing and visualization without blocking the main UI thread.",
            "Implement conflict-free replicated data types (CRDTs) for seamless offline-first multi-user collaboration and deterministic state convergence.",
            "Introduce automated canary routing and predictive edge cache pre-warming to sustain sub-50ms time-to-first-byte across global regions.",
        ),
        title_prefixes=(
            "A Scalable Event-Driven Web Architecture for",
            "Low-Latency Edge Orchestration and State Synchronization in",
            "Fault-Tolerant Full-Stack Platform Design for",
        ),
    ),
    "Cybersecurity": DomainProfile(
        label="Cybersecurity & Zero-Trust Systems",
        methodology_noun="zero-trust behavioral anomaly detection and response framework",
        architecture_phrase="continuous cryptographic identity verification integrated with graph-based telemetry correlation",
        pipeline_phrase="high-frequency packet inspection, MITRE ATT&CK tactic mapping, and automated policy containment",
        evaluation_metric="true positive detection rate, false alarm ratio, mean time to detect, and verification overhead",
        benchmark_context="adversarial red-team intrusion traces and zero-day lateral-movement simulation environments",
        keywords_pool=[
            "Zero-Trust Telemetry",
            "Behavioral Anomaly Detection",
            "Cryptographic Attestation",
            "Automated Threat Triage",
            "Adversarial Resilience",
        ],
        enhancements=(
            "Integrate confidential computing enclaves and zero-knowledge proofs to verify workload integrity without exposing sensitive operational payloads.",
            "Incorporate adversarial robustness training against evasion and poisoning attacks targeting automated intrusion detection classifiers.",
            "Connect telemetry outputs with automated SOAR playbooks capable of micro-segmenting compromised workloads within milliseconds of anomaly confirmation.",
        ),
        title_prefixes=(
            "A Zero-Trust Behavioral Telemetry Framework for",
            "Graph-Based Anomaly Correlation and Automated Defense in",
            "Adversarially Resilient Cryptographic Detection Architecture for",
        ),
    ),
}

STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "for", "of", "in", "on", "at",
    "to", "with", "using", "via", "by", "from", "based", "into", "through",
    "over", "under", "system", "platform", "application", "app", "project",
    "tool", "build", "create", "develop",
}

ACRONYMS = {
    "ai", "ml", "nlp", "iot", "cnn", "rnn", "lstm", "llm", "api", "rest",
    "sql", "hvac", "ddos", "mqtt", "http", "https", "rbac", "soc", "siem",
    "eeg", "ecg", "mri", "ct", "uav", "gnn", "gan", "rag",
}

VERB_MAP = {
    "detect": "Automated Detection of",
    "detecting": "Automated Detection of",
    "predict": "Predictive Modeling of",
    "predicting": "Predictive Modeling of",
    "optimize": "Optimization of",
    "optimizing": "Optimization of",
    "classify": "Multi-Class Classification of",
    "classifying": "Multi-Class Classification of",
    "monitor": "Real-Time Monitoring of",
    "monitoring": "Real-Time Monitoring of",
    "secure": "Cryptographic Securing of",
    "securing": "Cryptographic Securing of",
    "automate": "Intelligent Automation of",
    "automating": "Intelligent Automation of",
    "analyze": "Empirical Analysis of",
    "analyzing": "Empirical Analysis of",
    "diagnose": "Diagnostic Inference for",
    "diagnosing": "Diagnostic Inference for",
    "forecast": "Spatiotemporal Forecasting of",
    "forecasting": "Spatiotemporal Forecasting of",
    "recommend": "Personalized Recommendation for",
    "recommending": "Personalized Recommendation for",
}

MINOR_WORDS = {
    "a", "an", "and", "as", "at", "by", "for", "from", "in",
    "into", "of", "on", "or", "the", "to", "via", "with",
}


def to_academic_title_case(text: str) -> str:
    words = text.strip().split()
    result = []
    for i, word in enumerate(words):
        clean = word.lower()
        if clean in ACRONYMS:
            result.append(clean.upper())
        elif 0 < i < len(words) - 1 and clean in MINOR_WORDS:
            result.append(clean)
        else:
            result.append(word[0].upper() + word[1:] if word else word)
    return " ".join(result)


def clean_idea_phrase(raw_idea: str) -> str:
    trimmed = raw_idea.strip()
    trimmed = re.sub(
        r"^(e\.g\.,?\s*|build\s+a\s+|create\s+an?\s+|develop\s+an?\s+|design\s+an?\s+)",
        "", trimmed, flags=re.IGNORECASE
    )
    trimmed = re.sub(r"[.!?]+$", "", trimmed).strip()
    return trimmed or "automated domain-specific decision support and telemetry analysis"


def extract_topic_noun_phrase(clean_idea: str) -> str:
    parts = clean_idea.split()
    first_lower = parts[0].lower() if parts else ""
    if first_lower in VERB_MAP and len(parts) > 1:
        return f"{VERB_MAP[first_lower]} {' '.join(parts[1:])}"
    return clean_idea


def extract_domain_keywords(
    clean_idea: str,
    domain_label: str,
    pool: list[str],
) -> tuple[str, str, str, str, str]:
    cleaned = re.sub(r"[^a-zA-Z0-9\s\-]", " ", clean_idea)
    words = [w for w in cleaned.split() if len(w) > 2 and w.lower() not in STOP_WORDS]

    extracted: list[str] = []
    for i in range(len(words) - 1):
        pair = to_academic_title_case(f"{words[i]} {words[i+1]}")
        if pair not in extracted and len(pair) <= 34:
            extracted.append(pair)
        if len(extracted) >= 2:
            break

    if not extracted and words:
        extracted.append(to_academic_title_case(" ".join(words[:2])))

    combined = list(extracted)
    for item in pool:
        if len(combined) >= 5:
            break
        if not any(k.lower() == item.lower() for k in combined):
            combined.append(item)

    fallback = f"{domain_label.split('&')[0].strip()} Systems"
    while len(combined) < 5:
        combined.append(fallback)

    return (combined[0], combined[1], combined[2], combined[3], combined[4])


def get_custom_domain_profile(custom_domain: str) -> DomainProfile:
    clean = to_academic_title_case(custom_domain.strip() or "Interdisciplinary Systems")
    low = clean.lower()
    return DomainProfile(
        label=clean,
        methodology_noun=f"domain-calibrated {low} analytical architecture",
        architecture_phrase=f"modular computational pipelines tailored to {low} operational constraints",
        pipeline_phrase="structured data ingestion, domain-specific feature synthesis, and validated inference",
        evaluation_metric="predictive reliability, operational throughput, error-rate reduction, and domain fidelity",
        benchmark_context=f"curated {low} validation datasets and controlled experimental trials",
        keywords_pool=[
            f"{clean} Informatics",
            "Empirical Validation",
            "Adaptive Decision Support",
            "Scalable Pipeline Design",
            "Domain-Specific Modeling",
        ],
        enhancements=(
            f"Construct standardized open-access {low} benchmark suites to facilitate reproducible cross-institutional validation.",
            f"Integrate human-in-the-loop expert feedback loops calibrated specifically for high-stakes {low} workflows.",
            f"Scale the architecture toward multi-modal longitudinal datasets to capture seasonal and structural shifts across {low} environments.",
        ),
        title_prefixes=(
            f"An Empirical {clean} Framework for",
            "Domain-Calibrated Computational Architecture for",
            "Systematic Modeling and Validation of",
        ),
    )


def count_words(text: str) -> int:
    return len(text.strip().split()) if text.strip() else 0


def normalize_abstract_to_range(sentences: list[str], extra_clauses: list[str]) -> str:
    result = " ".join(sentences).replace("  ", " ").strip()
    words = count_words(result)

    idx = 0
    while words < 158 and idx < len(extra_clauses):
        result = f"{result} {extra_clauses[idx]}".strip()
        words = count_words(result)
        idx += 1

    if words > 195:
        split_sentences = re.findall(r"[^.!?]+[.!?]+", result) or [result]
        while len(split_sentences) > 3 and count_words(" ".join(split_sentences)) > 195:
            split_sentences.pop()
        result = " ".join(split_sentences).strip()
        words = count_words(result)

    if words > 200:
        tokens = result.split()[:188]
        result = re.sub(r"[,;:\s]+$", "", " ".join(tokens)) + "."
    elif words < 150:
        pad = (
            "Furthermore, comprehensive ablation studies and sensitivity analyses validate "
            "the stability, reproducibility, and practical deployability of the proposed "
            "methodology across diverse real-world operating conditions and domain benchmarks."
        )
        result = f"{result} {pad}".strip()
        if count_words(result) > 198:
            tokens = result.split()[:185]
            result = re.sub(r"[,;:\s]+$", "", " ".join(tokens)) + "."

    return result


def generate_built_in_research(
    raw_idea: str,
    domain: DomainOption,
    custom_domain: str = "",
) -> ResearchOutput:
    clean_idea = clean_idea_phrase(raw_idea)
    topic_noun = extract_topic_noun_phrase(clean_idea)
    titled_topic = to_academic_title_case(topic_noun)

    if domain == "Other":
        profile = get_custom_domain_profile(custom_domain or "Applied Computing")
    else:
        profile = DOMAIN_PROFILES[domain]

    titles = (
        f"{profile.title_prefixes[0]} {titled_topic}",
        f"{titled_topic}: {profile.title_prefixes[1]} {profile.label.split('&')[0].strip()} Pipelines",
        f"{profile.title_prefixes[2]} {titled_topic} in Modern {profile.label.split('&')[0].strip()} Environments",
    )

    core_lower = clean_idea[0].lower() + clean_idea[1:] if clean_idea else clean_idea
    noun_lower = topic_noun[0].lower() + topic_noun[1:] if topic_noun else topic_noun

    sentences = [
        f"Rapid growth in contemporary {profile.label.lower()} workflows has intensified the demand for rigorous, scalable approaches to {core_lower}, yet conventional solutions frequently struggle with noisy inputs, fragmented telemetry, and limited cross-domain generalization.",
        f"To address these limitations, this study proposes a {profile.methodology_noun} specifically engineered for {noun_lower} through {profile.architecture_phrase}.",
        f"The end-to-end operational workflow integrates {profile.pipeline_phrase}, enabling consistent representation fidelity while minimizing computational bottlenecks and manual tuning overhead.",
        f"Experimental evaluation is structured around {profile.benchmark_context}, systematically measuring {profile.evaluation_metric} against established baseline implementations.",
        "Empirical observations demonstrate that decoupling feature synthesis from domain-specific decision boundaries yields stronger calibration, improved resilience under distribution shifts, and transparent diagnostic traceability.",
        f"Consequently, this research contributes a reproducible architectural blueprint and quantitative benchmark methodology for deploying trustworthy {profile.label.lower()} solutions in production academic and industrial settings.",
    ]

    extra_clauses = [
        "Additional ablation experiments isolate the contribution of each architectural module to overall stability and inference efficiency.",
        "By balancing algorithmic rigor with practical resource constraints, the proposed system establishes a verifiable foundation for subsequent scholarly investigation and real-world adoption.",
        "Statistical significance testing across repeated trials further confirms consistent performance gains over conventional heuristic baselines.",
    ]

    abstract = normalize_abstract_to_range(sentences, extra_clauses)
    keywords = extract_domain_keywords(clean_idea, profile.label, profile.keywords_pool)

    objectives = (
        f"To formulate and architect a domain-aligned computational pipeline capable of {core_lower} with high precision and minimal structural latency.",
        f"To implement automated preprocessing, feature normalization, and validation routines tailored to {profile.label.lower()} workloads and edge-case noise.",
        f"To benchmark the proposed framework against baseline methods using {profile.evaluation_metric} across representative experimental datasets.",
    )

    return ResearchOutput(
        titles=titles,
        abstract=abstract,
        word_count=count_words(abstract),
        keywords=keywords,
        objectives=objectives,
        future_enhancements=profile.enhancements,
        domain_label=profile.label,
        source_idea=raw_idea.strip() or clean_idea,
        generation_mode="built-in",
    )


def build_live_ai_prompt(idea: str, domain_label: str) -> str:
    return f"""You are an expert IEEE and Springer academic research advisor.
Given the following project idea and research domain, generate a complete structured research brief.

Project Idea: "{idea}"
Research Domain: "{domain_label}"

Return ONLY valid JSON (no markdown code fences) matching this exact schema:
{{
  "titles": ["title 1", "title 2", "title 3"],
  "abstract": "A cohesive, formal academic abstract strictly between 155 and 190 words.",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "objectives": ["To ...", "To ...", "To ..."],
  "futureEnhancements": ["enhancement 1", "enhancement 2", "enhancement 3"]
}}

Strict constraints:
1. "titles" must have exactly 3 distinct IEEE/Springer-style academic titles.
2. "abstract" must be a single cohesive academic paragraph strictly between 150 and 200 words (aim for 165-185 words). Count your words carefully.
3. "keywords" must have exactly 5 concise academic keywords.
4. "objectives" must have exactly 3 action-oriented objectives starting with "To ...".
5. "futureEnhancements" must have exactly 3 forward-looking extensions tailored to {domain_label}."""


def extract_json_object(raw: str) -> dict:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"```\s*$", "", cleaned, flags=re.IGNORECASE).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model response did not contain valid JSON.")
    return json.loads(cleaned[start:end + 1])


def coerce_live_output(
    parsed: dict,
    idea: str,
    domain: DomainOption,
    custom_domain: str,
    provider: AiProvider,
) -> ResearchOutput:
    fallback = generate_built_in_research(idea, domain, custom_domain)

    titles_arr = [str(t).strip() for t in parsed.get("titles", []) if t]
    titles = (
        titles_arr[0] if len(titles_arr) > 0 else fallback.titles[0],
        titles_arr[1] if len(titles_arr) > 1 else fallback.titles[1],
        titles_arr[2] if len(titles_arr) > 2 else fallback.titles[2],
    )

    abstract = str(parsed.get("abstract", "")).strip() or fallback.abstract
    wc = count_words(abstract)
    if wc < 140 or wc > 215:
        abstract = normalize_abstract_to_range([abstract], [
            "Comprehensive empirical benchmarking across representative validation datasets confirms the robustness, scalability, and reproducibility of the proposed methodology.",
            "Furthermore, ablation analyses quantify the contribution of each pipeline stage to overall predictive accuracy and operational efficiency.",
        ])

    kw_arr = [str(k).strip() for k in parsed.get("keywords", []) if k]
    keywords = (
        kw_arr[0] if len(kw_arr) > 0 else fallback.keywords[0],
        kw_arr[1] if len(kw_arr) > 1 else fallback.keywords[1],
        kw_arr[2] if len(kw_arr) > 2 else fallback.keywords[2],
        kw_arr[3] if len(kw_arr) > 3 else fallback.keywords[3],
        kw_arr[4] if len(kw_arr) > 4 else fallback.keywords[4],
    )

    obj_arr = [str(o).strip() for o in parsed.get("objectives", []) if o]
    objectives = (
        obj_arr[0] if len(obj_arr) > 0 else fallback.objectives[0],
        obj_arr[1] if len(obj_arr) > 1 else fallback.objectives[1],
        obj_arr[2] if len(obj_arr) > 2 else fallback.objectives[2],
    )

    enh_arr = [str(e).strip() for e in parsed.get("futureEnhancements", []) if e]
    future_enhancements = (
        enh_arr[0] if len(enh_arr) > 0 else fallback.future_enhancements[0],
        enh_arr[1] if len(enh_arr) > 1 else fallback.future_enhancements[1],
        enh_arr[2] if len(enh_arr) > 2 else fallback.future_enhancements[2],
    )

    return ResearchOutput(
        titles=titles,
        abstract=abstract,
        word_count=count_words(abstract),
        keywords=keywords,
        objectives=objectives,
        future_enhancements=future_enhancements,
        domain_label=fallback.domain_label,
        source_idea=idea.strip(),
        generation_mode=provider,
    )


def generate_with_live_ai(
    idea: str,
    domain: DomainOption,
    custom_domain: str,
    provider: AiProvider,
    api_key: str,
) -> ResearchOutput:
    domain_label = (
        custom_domain.strip() or "Interdisciplinary Computing"
        if domain == "Other"
        else DOMAIN_PROFILES[domain].label
    )
    prompt = build_live_ai_prompt(idea, domain_label)

    if provider == "gemini":
        import urllib.parse
        encoded_key = urllib.parse.quote(api_key.strip())
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={encoded_key}"
        body = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"},
        }).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")[:120]
            raise RuntimeError(f"Gemini API request failed ({e.code}). Check your API key. {err_body}")
        raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        parsed = extract_json_object(raw_text)
        return coerce_live_output(parsed, idea, domain, custom_domain, "gemini")

    # OpenAI
    url = "https://api.openai.com/v1/chat/completions"
    body = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You output strictly valid JSON academic research packages."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
    }).encode("utf-8")
    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key.strip()}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")[:120]
        raise RuntimeError(f"OpenAI API request failed ({e.code}). Check your API key. {err_body}")
    raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    parsed = extract_json_object(raw_text)
    return coerce_live_output(parsed, idea, domain, custom_domain, "openai")


def format_research_as_text(output: ResearchOutput) -> str:
    divider = "=" * 68
    lines = [
        "EDUNOVA — ACADEMIC RESEARCH BRIEF",
        divider,
        f"Domain: {output.domain_label}",
        f"Source Idea: {output.source_idea}",
        f"Abstract Word Count: {output.word_count} words",
        "",
        "1. RESEARCH TITLE OPTIONS (IEEE / SPRINGER STYLE)",
        *[f"   [{i+1}] {t}" for i, t in enumerate(output.titles)],
        "",
        "2. RESEARCH ABSTRACT",
        output.abstract,
        "",
        "3. INDEX KEYWORDS",
        f"   {' · '.join(output.keywords)}",
        "",
        "4. RESEARCH OBJECTIVES",
        *[f"   0{i+1}. {obj}" for i, obj in enumerate(output.objectives)],
        "",
        "5. POSSIBLE FUTURE ENHANCEMENTS",
        *[f"   0{i+1}. {enh}" for i, enh in enumerate(output.future_enhancements)],
        divider,
    ]
    return "\n".join(lines)
