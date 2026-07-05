# Digital Asset Lifecycle Management (DALM) Program
## Backlog Quality Review Web Portal - Product Brief & Technical Documentation

This interactive web portal is designed for **Product Owners, Scrum Masters, and Agile Teams** working on the Digital Asset Lifecycle Management (DALM) program. It acts as an automated governance gate and training resource, validating Epics, Features, and User Stories against the guidelines and traceability matrix defined in the program workbook.

The tool provides real-time quality scoring, scans for Non-Functional Requirements (NFRs), verifies Gherkin BDD formatting in Acceptance Criteria, checks for strategic OKR/KPI alignment, and recommends logical story splits to ensure every backlog item is **Sprint-Ready**.

---

## 📖 Product Brief & Business Context

In a Digital Asset Lifecycle Management (DALM) program, establishing a traceable hierarchy from strategic goals down to single tasks is critical to success. This portal automates the review of user stories to guarantee that:
1. **Strategic Tracing**: Every User Story aligns to a specific Feature and a parent Epic, which in turn maps directly to a **Program OKR** and **measurable KPI**.
2. **Quality Standards**: Stories follow the standard template (`As a [persona], I want to [action], so that [value]`) with specific, descriptive personas rather than generic tags like "User".
3. **BDD Acceptance Criteria**: Acceptance criteria follow standard **Gherkin syntax** (`Scenario:`, `Given`, `When`, `Then`, `And`), making them clear, testable, and automation-ready.
4. **NFR Inclusion**: Non-functional requirements (Security, Performance SLAs, Audit logs, and Usability) are explicitly documented.
5. **Optimal Sizing**: Large stories are flagged for breakdown based on scenario complexity (maximum of 3 per story) and story points (maximum of 8 per story).

---

## 🛠️ Key Portal Features

### 1. Interactive Review Editor & Form
- **Dynamic Selectors**: Automatically maps Features to their corresponding parent Epics based on the program matrix.
- **Real-Time Analysis**: Scans title, description, and acceptance criteria fields on every keystroke, dynamically recalculating the score and rendering feedback.
- **Example Preloaders**: Allows testing the evaluator instantly by loading predefined high-quality stories (e.g., *US-01.1.1 Cloud Storage Connector*) and poor-quality backlog items directly from the dropdown.

### 2. Multi-Mode Inputs (Manual & File Upload)
- **Manual Form Entry**: Direct field-by-field entry for writing new stories.
- **Batch CSV Import**: Load lists of backlog items via a CSV upload, which parses columns (ID, Title, Story Description, Acceptance Criteria) and displays them in a selectable queue.
- **Client-Side PDF Text Extraction**: Upload the program workbook PDF. The portal uses **PDF.js** via CDN to read document pages, uses natural language heuristics to extract user stories, and automatically imports them.

### 3. Comprehensive Evaluation Engine (`evaluator.js`)
The story quality score (up to **100%**) is evaluated across four core dimensions:
*   **Template Structure (25%)**: Validates the presence of `As a`, `I want to`, and `So that` blocks. Deducts points for generic personas (like "User") and complex conjunctions in actions.
*   **Gherkin Acceptance Criteria (25%)**: Scans criteria for BDD keywords. Confirms that every scenario contains pre-conditions (`Given`), triggers (`When`), and outcomes (`Then`).
*   **Program Traceability (25%)**: Confirms alignment with the program Epics (`E-01` through `E-05`) and displays the specific parent OKRs and KPI metrics targeted.
*   **Non-Functional Requirements (25%)**: Scans text for four categories:
    *   *Security & RBAC* (e.g., authentication, permissions, data privacy).
    *   *Performance & SLA* (e.g., latency, size limits, conversion speed).
    *   *Reliability & Compliance* (e.g., backup, retention policy, audit trails).
    *   *Usability & Interface Feedback* (e.g., toast messages, previews, mobile responsive).

### 4. Smart Breakdown & Splitting Assistant
If a user story is deemed too large (Scenarios > 3, Story Points > 8, or action contains "and/or/also"), the portal displays a **Breakdown Warning** and automatically recommends a set of smaller, sprint-ready sub-stories. The PO can click **"Apply Split"** to automatically insert the new sub-stories into their active review queue.

### 5. Multi-Format Exporter
Once reviewed and polished, POs can export a formatted **Markdown Quality Report** (`.md`) containing:
- High-level score and readiness grade.
- Traceability map to strategic OKRs and parent KPIs.
- Sanitized user story and Gherkin blocks.
- Highlighted NFR checklist and breakdown recommendations.

---

## 📐 Traceability Mapping Reference (DALM Program)

The portal incorporates the program matrix directly to trace backlog alignment:

| Epic ID | Epic Title | Linked OKRs | Primary KPIs & Targets |
| :--- | :--- | :--- | :--- |
| **E-01** | Asset Ingestion & Centralized Repository | OKR-1 | Ingestion cycle time (<2 hrs), Duplicate rate (<5%), Adoption (85%) |
| **E-02** | Asset Governance, Compliance & Rights | OKR-2 | License compliance (100%), Policy violations (-90%), Breach detection (<1 hr) |
| **E-03** | Approval Workflow & Collaboration | OKR-3 | Approval cycle time (-50%), SLA breach rate (<5%), CSAT (4.5/5.0) |
| **E-04** | Asset Distribution & Portal Management | OKR-1 | Time-to-market (-40%), Asset reuse rate (60%), Self-service rate (80%) |
| **E-05** | Asset Retirement, Archival & Analytics | OKR-1, OKR-2 | Retention compliance (100%), Storage savings (15%), Violation rate (0) |

---

## 💻 Tech Stack & Architecture

- **Core**: HTML5 Semantic markup & Modern ES6 JavaScript Modules.
- **Styling**: Vanilla CSS3 custom variables, CSS Grid/Flexbox layouts, glassmorphic panels, and transitions.
- **Libraries**: [PDF.js](https://mozilla.github.io/pdf.js/) (v3.4.120) loaded via CDN for browser-side PDF text extraction.
- **Build/Server**: Purely client-side SPA. No compilation or `npm` installations required. Served locally using Python.

---

## 🚀 How to Run the Portal Locally

Since the application uses ES modules (`import`/`export`), it must be served by a local web server (opening the file directly via `file://` is blocked by browser CORS security).

1.  **Open terminal** in the project directory:
    ```powershell
    cd C:\Users\koshy\.gemini\antigravity\scratch\backlog-reviewer
    ```
2.  **Start Python HTTP Server**:
    ```powershell
    python -m http.server 8000
    ```
3.  **Access the web portal** in your browser:
    [http://localhost:8000](http://localhost:8000)

---

## 🧪 Quality Criteria Scoring Matrix

The rating system inside the evaluator computes scores dynamically:

```
[Total Score: 100%]
   ├── Template Structure [25%]
   │     ├── Persona Specificity (10%) (e.g. -5% if generic "User" persona used)
   │     ├── Action Singularity (10%) (e.g. -5% if contains "and", "or" in action)
   │     └── Benefit Statement (5%)
   ├── Gherkin Syntax compliance [25%]
   │     ├── Scenario presence (10%)
   │     ├── Given-When-Then usage (10%)
   │     └── Scenario volume (5%) (e.g. 0% if scenarios > 3)
   ├── OKR & KPI Traceability [25%]
   │     ├── Epic association (10%)
   │     ├── Feature association (10%)
   │     └── Linked OKR reference (5%)
   └── Non-Functional Requirements [25%]
         ├── Security & RBAC check (6%)
         ├── Performance & SLA check (6%)
         ├── Reliability & Audit log (6%)
         └── Usability & UI Feedback (7%)
```
- **Grade 85%+**: **Sprint Ready** (Green)
- **Grade 60% - 84%**: **Needs Improvement** (Amber)
- **Grade <60%**: **Critical Action Required** (Red)
