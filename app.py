"""
EduNova — AI Research Title, Abstract & Keyword Generator
Streamlit port of https://github.com/mohithadari23-coder/EduNova
"""

import streamlit as st
from academic_generator import (
    SAMPLE_IDEAS,
    ResearchOutput,
    generate_built_in_research,
    generate_with_live_ai,
    format_research_as_text,
    count_words,
)

# ─────────────────────────── Page config ────────────────────────────
st.set_page_config(
    page_title="EduNova · Academic Research Generator",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────── Custom CSS ─────────────────────────────
st.markdown("""
<style>
/* Dark monochrome theme */
:root {
    --bg: #0a0a0a;
    --surface: #111111;
    --border: #262626;
    --text: #ffffff;
    --muted: #a3a3a3;
    --dim: #888888;
    --accent: #ffffff;
}
.stApp { background-color: var(--bg); color: var(--text); }
section[data-testid="stSidebar"] { background: #0d0d0d; border-right: 1px solid var(--border); }

/* Cards */
.card {
    background: #111;
    border: 1px solid #262626;
    border-radius: 4px;
    padding: 1.4rem 1.6rem;
    margin-bottom: 1rem;
    transition: border-color .2s;
}
.card:hover { border-color: #525252; }
.card-label {
    font-family: monospace;
    font-size: 0.72rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: .4rem;
}
.card-index {
    font-family: monospace;
    font-size: 0.72rem;
    color: #888;
    margin-bottom: .3rem;
}
.title-text {
    font-size: 1.05rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.4;
}
.abstract-text {
    font-size: 0.93rem;
    color: #d4d4d4;
    line-height: 1.75;
}
.keyword-pill {
    display: inline-block;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 2px;
    padding: .2rem .6rem;
    font-size: .78rem;
    color: #d4d4d4;
    margin: .2rem .2rem .2rem 0;
    font-family: monospace;
}
.obj-text {
    font-size: .88rem;
    color: #d4d4d4;
    line-height: 1.65;
    padding: .6rem 0;
    border-bottom: 1px solid #1c1c1c;
}
.obj-text:last-child { border-bottom: none; }
.hero-title {
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 700;
    letter-spacing: -.03em;
    line-height: 1.08;
    color: #fff;
    margin-bottom: .5rem;
}
.hero-sub {
    font-size: 1rem;
    color: #a3a3a3;
    line-height: 1.65;
    max-width: 540px;
}
.stats-grid { display: flex; gap: 2.5rem; margin-top: 1.4rem; flex-wrap: wrap; }
.stat-num { font-family: monospace; font-size: 1.5rem; color: #fff; font-weight: 600; }
.stat-label { font-size: .72rem; color: #888; margin-top: .1rem; }
.section-label { font-family: monospace; font-size: .72rem; color: #888; letter-spacing: .08em; margin-bottom: .4rem; }
.section-heading { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 1.2rem; }
.word-count-badge {
    display: inline-block;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 2px;
    padding: .15rem .55rem;
    font-family: monospace;
    font-size: .78rem;
    color: #d4d4d4;
    margin-left: .6rem;
}
.sample-preview-banner {
    background: #1a1a0a;
    border: 1px solid #3a3a1a;
    border-radius: 4px;
    padding: .6rem 1rem;
    font-size: .82rem;
    color: #a3a310;
    margin-bottom: 1rem;
}
.mode-badge {
    display: inline-block;
    background: #0a1a0a;
    border: 1px solid #1a3a1a;
    border-radius: 2px;
    padding: .15rem .55rem;
    font-family: monospace;
    font-size: .72rem;
    color: #4ade80;
    margin-left: .5rem;
}
hr.divider { border: none; border-top: 1px solid #262626; margin: 2rem 0; }
</style>
""", unsafe_allow_html=True)


# ─────────────────────────── Session state ──────────────────────────
def _init_state():
    if "output" not in st.session_state:
        st.session_state.output = generate_built_in_research(SAMPLE_IDEAS[0].text, "AI")
    if "is_sample" not in st.session_state:
        st.session_state.is_sample = True
    if "error" not in st.session_state:
        st.session_state.error = None

_init_state()


# ─────────────────────────── Sidebar ────────────────────────────────
with st.sidebar:
    st.markdown("## 🎓 EduNova")
    st.markdown("<span style='color:#888;font-size:.82rem'>Academic Manuscript Synthesizer</span>", unsafe_allow_html=True)
    st.divider()

    st.markdown("### ⚡ Live AI (Optional)")
    st.markdown("<span style='color:#888;font-size:.8rem'>Enter a key to use real AI. Leave blank for built-in generator.</span>", unsafe_allow_html=True)

    provider = st.radio(
        "Provider",
        options=["gemini", "openai"],
        format_func=lambda x: "🟣 Google Gemini" if x == "gemini" else "🟢 OpenAI GPT-4o",
        horizontal=True,
    )
    api_key = st.text_input(
        "API Key",
        type="password",
        placeholder="Paste your API key here…",
    )
    live_ai_enabled = bool(api_key and api_key.strip())

    if live_ai_enabled:
        st.success(f"✅ Live AI active — {provider.capitalize()}")
    else:
        st.info("🔧 Using built-in domain-aware synthesizer")

    st.divider()
    st.markdown("### 📖 Sample Ideas")
    for sample in SAMPLE_IDEAS:
        if st.button(f"📌 {sample.label}", use_container_width=True, key=f"sample_{sample.id}"):
            st.session_state["_prefill_idea"] = sample.text
            st.session_state["_prefill_domain"] = sample.domain
            st.rerun()

    st.divider()
    st.markdown(
        "<div style='font-size:.72rem;color:#555;'>EduNova · IEEE & Springer Ready<br>Built with Streamlit 🎈</div>",
        unsafe_allow_html=True,
    )


# ─────────────────────────── Hero ───────────────────────────────────
col_hero, col_stats = st.columns([3, 1])
with col_hero:
    st.markdown("""
<div class='hero-title'>AI Research Title,<br>Abstract &amp; Keyword Generator.</div>
<div class='hero-sub'>
Transform an early project concept into IEEE and Springer-ready research titles,
verified 150–200 word abstracts, index keywords, methodology objectives,
and domain-specific future directions.
</div>
<div class='stats-grid'>
  <div><div class='stat-num'>03</div><div class='stat-label'>IEEE &amp; Springer Titles</div></div>
  <div><div class='stat-num'>150–200</div><div class='stat-label'>Verified Abstract Words</div></div>
  <div><div class='stat-num'>05</div><div class='stat-label'>Domain Index Keywords</div></div>
  <div><div class='stat-num'>03 + 03</div><div class='stat-label'>Objectives &amp; Enhancements</div></div>
</div>
""", unsafe_allow_html=True)

st.markdown("<hr class='divider'>", unsafe_allow_html=True)


# ─────────────────────────── Generator Form ─────────────────────────
st.markdown("<div class='section-label'>01. Research Input Workspace</div>", unsafe_allow_html=True)
st.markdown("<div class='section-heading'>Define your project thesis</div>", unsafe_allow_html=True)

prefill_idea = st.session_state.pop("_prefill_idea", "")
prefill_domain = st.session_state.pop("_prefill_domain", None)

with st.form("generator_form"):
    idea_value = prefill_idea if prefill_idea else ""

    idea = st.text_area(
        "Project Idea",
        value=idea_value,
        height=100,
        placeholder="e.g. Detect fake news using machine learning and NLP on social media posts",
        help="Enter a concise problem statement or project concept.",
    )

    domains = ["AI", "IoT", "Web", "Cybersecurity", "Other"]
    domain_labels = {
        "AI": "🤖 AI & Machine Learning",
        "IoT": "📡 Internet of Things",
        "Web": "🌐 Web Engineering",
        "Cybersecurity": "🔒 Cybersecurity",
        "Other": "✏️ Other / Custom",
    }

    default_domain_idx = domains.index(prefill_domain) if prefill_domain and prefill_domain in domains else 0
    domain = st.selectbox(
        "Research Domain",
        options=domains,
        index=default_domain_idx,
        format_func=lambda x: domain_labels[x],
    )

    custom_domain = ""
    if domain == "Other":
        custom_domain = st.text_input(
            "Specify your domain",
            placeholder="e.g. Bioinformatics, Quantum Computing…",
        )

    submitted = st.form_submit_button(
        "⚡ Generate Research Brief",
        use_container_width=True,
        type="primary",
    )


# ─────────────────────────── Generation ─────────────────────────────
if submitted:
    idea_stripped = idea.strip()
    if not idea_stripped:
        st.error("⚠️ Please enter a project idea before generating.")
    elif domain == "Other" and not custom_domain.strip():
        st.error("⚠️ Please specify your custom research domain.")
    else:
        with st.spinner("Composing your academic research brief…"):
            try:
                if live_ai_enabled:
                    result = generate_with_live_ai(
                        idea_stripped, domain, custom_domain, provider, api_key
                    )
                else:
                    result = generate_built_in_research(idea_stripped, domain, custom_domain)

                st.session_state.output = result
                st.session_state.is_sample = False
                st.session_state.error = None
                st.success("✅ Research brief generated successfully!")
            except Exception as exc:
                st.session_state.error = str(exc)
                st.error(f"❌ Generation failed: {exc}")


# ─────────────────────────── Output Section ──────────────────────────
output: ResearchOutput = st.session_state.output

st.markdown("<hr class='divider'>", unsafe_allow_html=True)
st.markdown("<div class='section-label'>02. Generated Manuscript Package</div>", unsafe_allow_html=True)

col_head, col_badge = st.columns([4, 1])
with col_head:
    st.markdown("<div class='section-heading'>Your Research Brief</div>", unsafe_allow_html=True)
with col_badge:
    mode_text = {
        "built-in": "Built-in Engine",
        "gemini": "Gemini AI",
        "openai": "OpenAI",
    }.get(output.generation_mode, output.generation_mode)
    st.markdown(f"<span class='mode-badge'>⚡ {mode_text}</span>", unsafe_allow_html=True)

if st.session_state.is_sample:
    st.markdown(
        "<div class='sample-preview-banner'>📋 Showing a sample preview. Enter your own idea above and click Generate to see custom results.</div>",
        unsafe_allow_html=True,
    )

# Domain + source
st.markdown(
    f"<span style='font-size:.82rem;color:#888;'>Domain: <b style='color:#d4d4d4'>{output.domain_label}</b> &nbsp;·&nbsp; Source: <i style='color:#d4d4d4'>{output.source_idea[:90]}{'…' if len(output.source_idea) > 90 else ''}</i></span>",
    unsafe_allow_html=True,
)
st.markdown("")

# ── Titles ────────────────────────────────────────────────────────
with st.expander("📌 Research Titles (IEEE / Springer Style)", expanded=True):
    for i, title in enumerate(output.titles, 1):
        st.markdown(f"""
<div class='card'>
  <div class='card-index'>Title Option {i:02d}</div>
  <div class='title-text'>{title}</div>
</div>""", unsafe_allow_html=True)

# ── Abstract ─────────────────────────────────────────────────────
with st.expander(f"📄 Research Abstract  ({output.word_count} words)", expanded=True):
    wc = output.word_count
    badge_color = "#4ade80" if 150 <= wc <= 200 else "#f87171"
    st.markdown(f"""
<div class='card'>
  <div class='card-label'>Abstract
    <span style='display:inline-block;background:#0d1f0d;border:1px solid #1a3a1a;border-radius:2px;
    padding:.1rem .45rem;font-size:.72rem;color:{badge_color};margin-left:.5rem;'>{wc} words ✓</span>
  </div>
  <div class='abstract-text'>{output.abstract}</div>
</div>""", unsafe_allow_html=True)

# ── Keywords ─────────────────────────────────────────────────────
with st.expander("🏷️ Index Keywords", expanded=True):
    pills_html = "".join(f"<span class='keyword-pill'>{kw}</span>" for kw in output.keywords)
    st.markdown(f"<div class='card'><div class='card-label'>5 Domain Keywords</div>{pills_html}</div>", unsafe_allow_html=True)

# ── Objectives ───────────────────────────────────────────────────
with st.expander("🎯 Research Objectives", expanded=True):
    objs_html = "".join(
        f"<div class='obj-text'><b style='color:#888;font-family:monospace;font-size:.72rem;'>0{i+1}</b>&nbsp;&nbsp;{obj}</div>"
        for i, obj in enumerate(output.objectives)
    )
    st.markdown(f"<div class='card'>{objs_html}</div>", unsafe_allow_html=True)

# ── Future Enhancements ──────────────────────────────────────────
with st.expander("🚀 Possible Future Enhancements", expanded=True):
    enh_html = "".join(
        f"<div class='obj-text'><b style='color:#888;font-family:monospace;font-size:.72rem;'>0{i+1}</b>&nbsp;&nbsp;{enh}</div>"
        for i, enh in enumerate(output.future_enhancements)
    )
    st.markdown(f"<div class='card'>{enh_html}</div>", unsafe_allow_html=True)


# ─────────────────────────── Export ──────────────────────────────
st.markdown("<hr class='divider'>", unsafe_allow_html=True)
st.markdown("<div class='section-label'>03. Export</div>", unsafe_allow_html=True)
st.markdown("<div class='section-heading'>Download Your Brief</div>", unsafe_allow_html=True)

col_dl1, col_dl2, col_spacer = st.columns([1, 1, 3])
plain_text = format_research_as_text(output)

with col_dl1:
    st.download_button(
        label="📥 Download as .txt",
        data=plain_text,
        file_name="edunova_research_brief.txt",
        mime="text/plain",
        use_container_width=True,
    )
with col_dl2:
    st.download_button(
        label="📋 Copy as Markdown",
        data=f"# {output.titles[0]}\n\n## Abstract\n{output.abstract}\n\n## Keywords\n{', '.join(output.keywords)}\n\n## Objectives\n" + "\n".join(f"- {o}" for o in output.objectives) + "\n\n## Future Enhancements\n" + "\n".join(f"- {e}" for e in output.future_enhancements),
        file_name="edunova_research_brief.md",
        mime="text/markdown",
        use_container_width=True,
    )

st.markdown("<hr class='divider'>", unsafe_allow_html=True)

# ─────────────────────────── Info cards ──────────────────────────
st.markdown("<div class='section-label'>04. Editorial Methodology</div>", unsafe_allow_html=True)
st.markdown("<div class='section-heading'>Built for conference & journal discipline</div>", unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)
with col1:
    st.markdown("""
<div class='card'>
  <div class='card-index'>01</div>
  <div class='title-text' style='font-size:.95rem;'>IEEE & Springer Title Calibration</div>
  <div style='font-size:.83rem;color:#a3a3a3;margin-top:.6rem;line-height:1.6;'>
  Titles pair methodological novelty with domain context, avoiding vague buzzwords while preserving concise indexing clarity.
  </div>
</div>""", unsafe_allow_html=True)
with col2:
    st.markdown("""
<div class='card'>
  <div class='card-index'>02</div>
  <div class='title-text' style='font-size:.95rem;'>150–200 Word Abstract Verification</div>
  <div style='font-size:.83rem;color:#a3a3a3;margin-top:.6rem;line-height:1.6;'>
  Every abstract follows the four-part scholarly arc—problem, architecture, evaluation, and contribution—verified by live word count.
  </div>
</div>""", unsafe_allow_html=True)
with col3:
    st.markdown("""
<div class='card'>
  <div class='card-index'>03</div>
  <div class='title-text' style='font-size:.95rem;'>Zero-Dependency Portability</div>
  <div style='font-size:.83rem;color:#a3a3a3;margin-top:.6rem;line-height:1.6;'>
  Runs completely offline with a domain-aware synthesizer, one-click export, and clean plain-text download — no account required.
  </div>
</div>""", unsafe_allow_html=True)

st.markdown("<div style='text-align:center;color:#555;font-size:.78rem;padding:2rem 0 1rem;'>EduNova · Academic Manuscript Synthesizer · Built with Streamlit</div>", unsafe_allow_html=True)
