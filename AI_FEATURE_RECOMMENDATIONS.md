# AI Feature Review & Recommendations for RCCG Lighthouse Parish Website

## 1) Current website snapshot (high level)

The current app is a static HTML/CSS/JS church website with:
- Core ministry pages (`index`, `about`, `groups`, `prayer`, `counselling`, `faq`, `watchlive`, `give`).
- YouTube-based livestream + replay embeds.
- Formspree-powered prayer/counselling request forms.
- A basic FAQ structure that can become a knowledge base seed.

This is a good foundation for *low-risk, high-impact* AI enhancements without a full platform rewrite.

---

## 2) High-value AI features to implement (prioritized)

## A. AI Church Assistant (Web Chat)
**What it does:**
- Answers visitor questions about service times, location, ministries, giving options, and next steps.
- Guides users to the right page (watch live, prayer form, membership, counselling).

**Why it fits this site:**
- FAQ content and structured service information already exist.
- Immediate value for first-time visitors and online attendees.

**MVP scope:**
- Retrieval-augmented chat over your own website content.
- Strict “answer from church-approved content only” behavior.
- Escalation button: “Talk to a pastor / submit contact form.”

---

## B. Smart Prayer & Counselling Triage (Pastoral Copilot)
**What it does:**
- Classifies incoming prayer/counselling requests (healing, family, grief, urgent, etc.).
- Suggests response templates and follow-up priority for pastors/admin.

**Why it fits this site:**
- Prayer and counselling forms are already capturing structured requests.
- Helps ministry teams respond faster and more consistently.

**MVP scope:**
- Backend workflow that tags submissions and sends priority notifications.
- Human-in-the-loop only (AI suggests, staff approves).

---

## C. Sermon Intelligence Hub
**What it does:**
- Auto-transcribes YouTube sermons.
- Produces sermon summaries, key points, scripture extraction, and searchable topics.
- Enables “Ask this sermon” Q&A.

**Why it fits this site:**
- Existing `watch live` and replay videos make this naturally valuable.
- Extends sermon impact through the week.

**MVP scope:**
- Process latest N videos weekly.
- Publish summary cards + search by topic/scripture.

---

## D. Personalized Next-Step Recommendations
**What it does:**
- Recommends ministries, classes, events, or devotional resources based on visitor intent.
- Example: visitor mentions “new believer” -> directs to membership class + discipleship contacts.

**Why it fits this site:**
- Site already has clear pathways (membership, groups, ICARE, counselling, prayer).

**MVP scope:**
- Rules + lightweight AI intent detection.
- Non-invasive personalization (session-level, no sensitive profiling).

---

## E. Content Copilot for Church Team
**What it does:**
- Drafts weekly bulletins, event blurbs, social captions, and email updates from sermon notes.
- Repurposes one message into multi-platform communication.

**Why it fits this site:**
- Current site has placeholders for resources/bulletin workflows.
- Saves significant admin/media time.

**MVP scope:**
- Internal-only tool (not public).
- Approval workflow before publishing.

---

## 3) Recommended implementation sequence (90-day path)

### Phase 1 (Weeks 1–3): Foundation + Safety
- Create content inventory (pages, FAQs, service schedules, forms).
- Build a clean church knowledge base for retrieval.
- Define policy guardrails (no doctrine invention, no mental-health/medical/legal advice beyond safe guidance).

### Phase 2 (Weeks 4–6): Public AI Assistant MVP
- Launch web chat on top 3 pages (`index`, `watchlive`, `faq`).
- Add analytics: top questions, failed answers, clicks to next-step pages.
- Add fallback to contact/prayer/counselling forms.

### Phase 3 (Weeks 7–10): Pastoral Copilot + Sermon Summaries
- Add request triage + routing for prayer/counselling admins.
- Start automated sermon transcript + summary pipeline.

### Phase 4 (Weeks 11–13): Optimization
- Tune prompts and retrieval using real questions.
- Add multilingual support where needed.
- Introduce personalized next-step recommendations.

---

## 4) Guardrails and governance (critical for church context)

- **Human oversight:** AI never replaces pastoral judgement.
- **Data privacy:** explicit consent for personal/spiritual data, minimal retention, role-based access.
- **Safety routing:** crisis/urgent risk language triggers immediate human escalation.
- **Content integrity:** retrieval only from approved church content; versioned updates.
- **Tone policy:** compassionate, scripture-aligned, non-argumentative, and transparent that user is interacting with AI.

---

## 5) Technical approach (practical)

- Keep existing static frontend.
- Add a lightweight backend service for AI endpoints.
- Use retrieval pipeline over HTML content + FAQs + selected sermon transcripts.
- Store anonymized interaction logs for quality improvement.
- Add admin dashboard for unresolved questions and triage queues.

---

## 6) Success metrics to track

- Chat containment rate (questions resolved by assistant).
- Click-through to meaningful next steps (membership, prayer, counselling, watch live).
- Average response time to prayer/counselling requests.
- Sermon content engagement (searches, summary opens, follow-up views).
- Reduction in repetitive admin/media drafting hours.

---

## 7) Quick wins you can start immediately

1. Turn FAQ + service schedule into a structured JSON knowledge file.
2. Deploy a small web assistant limited to “church info + navigation.”
3. Start weekly sermon transcript + summary publishing.
4. Add AI-powered tagging for prayer/counselling submissions in internal workflow.

These four steps will deliver visible value quickly while keeping risk low and governance strong.
