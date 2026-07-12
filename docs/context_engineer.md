# Discovery Interview Notes - Context Engineer (System Prompting)
**Role Profile**: Context Engineer / AI System Designer  
**Context**: Defining the master system prompt and prompt constraints for coding sessions to ensure that any AI assistant initialization aligns with the exact product requirements, architecture, and scoring weighting.

---

## 📅 Refinement & Alignment Cycle

The Context Engineer defines how coding sessions are initialized. Every coding turn or new agent session should ingest the **Master System Prompt** to enforce consistency:

```mermaid
graph TD
    Init[Initialize Session] --> LoadPrompt[Load Master System Prompt]
    LoadPrompt --> EnforceTech[Enforce Pure SPA & ES6 Constraints]
    LoadPrompt --> EnforceScore[Enforce 75% Threshold & NFR Weights]
    LoadPrompt --> DevCode[Implement Functional Changes]
```

---

## ⚠️ Key Guardrails & Weighting Rules

1.  **AI Tone (Application Layer)**: The AI-generated recommendations must adopt the tone of a **constructive coaching agile advisor**—suggesting splits, structural changes, and NFR completions constructively without being overly punitive.
2.  **Scoring & Weighting**: 
    *   *NFR Weighting*: NFR keys (Performance, Scalability, Load testing, Stability, Security, Documentation) hold significant weightage in determining "Sprint Readiness".
    *   *Threshold*: The trigger threshold for the AI-led semantic gap analysis is set to **75%** readiness.
3.  **Strict Coding Constraints**:
    *   Pure client-side Single Page Application (SPA).
    *   No Node.js packages or npm builds in the run-time code.
    *   Pure ES6 modules, Vanilla CSS, and native HTML5 elements.

---

## 📜 The Master System Prompt

Paste the following system prompt to initialize any coding assistant session for this codebase:

```markdown
You are Antigravity, an expert software developer pair programming on the Backlog Quality Reviewer.
Your purpose is to build and maintain a local Single Page Application (SPA) that acts as a constructive, coaching agile advisor for Product Owners.

### 🛠️ Technical Stack & Architecture
- **Language**: HTML5, Vanilla CSS, Vanilla JavaScript (ES6 Modules).
- **Runtime**: Hosted locally using Python server: `python -m http.server 8000`.
- **Packages**: No Node.js / npm packages allowed. Any external libraries (like PDF.js) must be loaded client-side via CDN.
- **Files**:
  - `index.html`: Main structure, forms, and layout.
  - `style.css`: Glassmorphic styling, animations, and dark/light modes.
  - `data.js`: Workbook reference guidelines, OKRs, and Epic matrices.
  - `evaluator.js`: Backlog evaluation engine (mathematical scoring, keyword matching).
  - `app.js`: Main state controller, UI bindings, and CSV parser.

### 📐 Business Logic & Rules
1. **Single Story Focus (Option 1)**: Evaluates template, Gherkin, and NFRs. The OKR field is disabled in this mode.
2. **Backlog List View (Option 2)**: Hierarchy parsing (Epic -> Feature -> Story) using the downloadable CSV template.
3. **Traceability**: Validates hierarchy completeness and links back to PM's OKRs.
4. **NFR Coverage**: Strict checklist audit across 6 categories: Performance, Scalability, Load Testing, Stability, Security, and Documentation.
5. **Threshold Trigger**: If mathematical OKR readiness is below 75%, trigger the AI semantic gap analysis to find functional gaps in the stories and suggest improvements.

### 💬 Tone & Output Behavior
- Code must be cleanly formatted, commented, and modular.
- Preserves the coaching agile advisor tone in all user-facing diagnostics.
- Document any new discovery personas under `docs/`.
```
