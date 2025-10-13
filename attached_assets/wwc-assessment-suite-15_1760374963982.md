# WholeWellness Coaching — Assessment Suite (15-Pack)
Version: 1.0 • Owner: Product & Coaching Science • Status: Implement

This document specifies 15 value‑add assessments for WholeWellness Coaching that are AI‑analysis ready, longitudinal, shareable with human coaches, and aligned with current mental‑health and relationships trends. It includes data models, API contracts, scoring outlines, and seed items to bootstrap implementation.

---

## Executive Summary
- **Scope:** 15 assessments spanning attachment, communication, conflict, safety, burnout, trust, digital hygiene, intimacy, finances, sleep/recovery, life transitions, and light‑risk personality traits (educational, not diagnostic).
- **Storage & Analysis:** All assessments persist to Supabase with versioned schemas; scores are computed server‑side and summarized by AI with an auditable prompt. Coaches can view results via explicit, time‑boxed share tokens.
- **Implementation Choices (Recommended):**
  - Frontend: React + Vite + TanStack Query + Zod form validation.
  - API: Express (Node 20, ESM). Rate‑limited POSTs.
  - DB: Supabase (PostgreSQL). Tables + RLS policies defined below.
  - Versioning: `assessment_versions` pinned per user session for reliable longitudinal comparisons.
  - Sharing: `coach_shares` tokens (random shortid), default expiry 72h; optional direct coach binding by `coach_id`.
  - Compliance: Educational only; PIPEDA/GDPR friendly consent + export/delete supported.

---

## Catalogue: The Fifteen Assessments

Each entry lists **Purpose**, **Length**, **Measures**, **Scoring**, **Primary Outputs (User)**, **Coach View**. Seed items included later.

1. **Advanced Attachment & Conflict Pattern (AAC‑P)**
   - Purpose: Identify attachment blend and conflict dynamics (pursue/withdraw, flooding risk).
   - Length: 28–40 items (branching).
   - Measures: secure/anxious/avoidant/fearful; demand‑withdraw; flooding.
   - Scoring: Subscales 0–100; Conflict Index 0–100.
   - User Outputs: Style blend, triggers, 3‑step de‑escalation plan.
   - Coach View: Trigger heatmap; EFT/Gottman suggestions.

2. **Relationship Red‑Flags & Safety Screener (RRSS)**
   - Purpose: Spot patterns of coercive control and safety risks (educational).
   - Length: 18 (+4 probes).
   - Measures: Emotional, financial, digital, physical risk signals.
   - Scoring: Domain bands + “escalation needed” boolean.
   - User Outputs: Red‑flag summary; safety resources; logging tips.
   - Coach View: Escalation banner; referral checklist.

3. **Emotional Regulation & Trigger Index (ERTI)**
   - Purpose: Gauge regulation skills that support change.
   - Length: 20.
   - Measures: Reappraisal, impulse control, somatic awareness, self‑soothing.
   - Scoring: 4 subscales + composite; top triggers (from free‑text entities).
   - User Outputs: 90‑second reset sequence.
   - Coach View: “What regulates this client” panel.

4. **Communication Style & Listening Bias (CSLB)**
   - Purpose: Map directness/indirectness, interruption, fixer bias.
   - Length: 24.
   - Measures: Directness, granularity, interruption propensity, listening stance.
   - Scoring: Style quadrant; friction pairs.
   - User Outputs: Weekly “one thing to try”; do/don’t list.
   - Coach View: Partner mismatch map.

5. **Trust Health & Betrayal Recovery Readiness (TBRR)**
   - Purpose: Support post‑rupture rebuilding.
   - Length: 16.
   - Measures: Transparency, follow‑through, repair, intrusive thoughts.
   - Scoring: Readiness stage (Not Ready → Rebuilding).
   - User Outputs: Micro‑commitments; repair script.
   - Coach View: Boundaries checklist; relapse markers.

6. **Love Languages & Needs Prioritizer (LLNP)**
   - Purpose: Prioritize high‑impact caring actions.
   - Length: 25 forced‑choice.
   - Measures: Acts, Words, Time, Gifts, Touch (+ effort/impact).
   - Scoring: Weighted ranking; “quick wins”.
   - User Outputs: Top 5 actions with scheduling nudges.
   - Coach View: Compliance tracker.

7. **Conflict De‑escalation Skill Gap (CDSG)**
   - Purpose: Assess practical conflict skills.
   - Length: 18 scenarios.
   - Measures: Time‑out use, repair statements, cue recognition.
   - Scoring: Skill ladder (1–5) per skill + readiness score.
   - User Outputs: Personalized fight‑plan card.
   - Coach View: Role‑play focus order.

8. **Secure Attachment Progress Tracker (SAPT)**
   - Purpose: Longitudinal weekly pulse toward secure attachment.
   - Length: 10 weekly.
   - Measures: Safety, responsiveness, vulnerability, self‑soothing, joy.
   - Scoring: Trendline; minimal detectable change.
   - User Outputs: Streaks; small wins.
   - Coach View: Trend charts; planning cues.

9. **Burnout & Resilience Micro‑Index (BRMI)**
   - Purpose: Identify burnout risk limiting relationship bandwidth.
   - Length: 14 (+ WHO‑5 optional).
   - Measures: Exhaustion, cynicism, recovery behaviors, support.
   - Scoring: Risk band + resilience anchors.
   - User Outputs: Tiny habit menu.
   - Coach View: Work/recovery correlation view.

10. **Digital Hygiene & Social Media Impact (DHSM)**
    - Purpose: Address doom‑scrolling, jealousy triggers, sleep hygiene.
    - Length: 15.
    - Measures: Night phone use, comparison spiral, jealousy/porn conflict.
    - Scoring: Risk areas + “phone‑free zones” readiness.
    - User Outputs: 7‑day digital reset plan.
    - Coach View: Boundary agreement template.

11. **Money Scripts & Financial Compatibility (MSFC)**
    - Purpose: Reveal money beliefs and couple compatibility.
    - Length: 20.
    - Measures: Security, status, avoidance, generosity, risk tolerance.
    - Scoring: Profile + conflict hotspots; compatibility map (if partnered).
    - User Outputs: 2 budgeting rituals; conversation prompts.
    - Coach View: Values alignment notes.

12. **Sexual Intimacy & Consent Comfort (SICC)** *(educational, sensitive)*
    - Purpose: Surface consent comfort, desire mismatch, aftercare.
    - Length: 20.
    - Measures: Initiation comfort, boundaries clarity, aftercare needs.
    - Scoring: Comfort bands per domain.
    - User Outputs: Boundary statement builder; aftercare menu.
    - Coach View: Communication guidance; no diagnostics.

13. **Sleep & Recovery Impact (SRI)**
    - Purpose: Sleep quality impacts mood/conflict.
    - Length: 12.
    - Measures: Sleep debt, snoring/OSA suspicion, device use, wake consistency.
    - Scoring: Sleep strain index; hygiene score.
    - User Outputs: 14‑day sleep setup plan.
    - Coach View: Recovery focus suggestions.

14. **Life Transitions Stress Radar (LTSR)**
    - Purpose: Identify acute stressors (move, job change, grief, new baby).
    - Length: 12.
    - Measures: Event impact, time pressure, social support strain.
    - Scoring: Transition strain band; buffer deficits.
    - User Outputs: Buffer plan (delegate/simplify/support).
    - Coach View: Session prioritization map.

15. **Dark Traits Lite Tendencies (DTL‑Lite)** *(educational, risk‑managed)*
    - Purpose: Non‑diagnostic screening of antagonism/grandiosity/impulsivity risk.
    - Length: 14.
    - Measures: Antagonism, entitlement, strategic empathy deficit.
    - Scoring: Risk band; **educational framing only**.
    - User Outputs: Self‑check guide; repair behaviors.
    - Coach View: Caution markers; de‑escalation tactics.

---

## Seed Items (sample prompts by assessment)

> Each item has a `domain` tag for scoring. Scales use Likert 1–5 (Strongly disagree → Strongly agree) unless noted.

### AAC‑P (5 items)
1. “When conflict starts, I feel a strong urge to seek reassurance immediately.” *(domain: anxious)*  
2. “I downplay problems to avoid making things worse.” *(avoidant)*  
3. “During arguments, I feel overwhelmed by my body sensations.” *(flooding)*  
4. “I tend to push for answers while my partner withdraws.” *(demand_withdraw)*  
5. “I can express needs without fear my partner will disconnect.” *(secure)*

### RRSS (5 items)
1. “I hesitate to spend money because my partner may react.” *(financial_control)*  
2. “I’ve been pressured to share device passwords.” *(digital_control)*  
3. “I change my plans to avoid making them angry.” *(emotional_control)*  
4. “I feel unsafe during or after conflicts.” *(physical_safety)*  
5. “I often doubt my memory after arguments.” *(gaslighting_signal)*

### ERTI (5 items)
1. “I can name what I’m feeling in the moment.” *(granularity)*  
2. “I can slow down impulses during conflict.” *(impulse_control)*  
3. “I notice early body cues before I flip my lid.” *(somatic_awareness)*  
4. “I have a go‑to practice to calm down.” *(self_soothing)*  
5. “I can reframe unhelpful thoughts.” *(reappraisal)*

### CSLB (5 items)
1. “I speak directly about what I want.” *(directness)*  
2. “I interrupt to correct details.” *(interruption)*  
3. “I listen for feelings beyond the words.” *(listening_emotion)*  
4. “I avoid raising issues to keep the peace.” *(indirectness)*  
5. “I try to fix problems before I fully understand them.” *(fixer_bias)*

### TBRR (5 items)
1. “We have transparent access to relevant accounts/devices.” *(transparency)*  
2. “Commitments made are reliably kept.” *(follow_through)*  
3. “We use specific repair steps after hurts.” *(repair)*  
4. “I experience intrusive thoughts about the betrayal.” *(intrusions)*  
5. “I feel willing to engage in a recovery plan.” *(readiness)*

### LLNP (forced‑choice examples)
- Pick one: “Plan a quiet evening together” vs “Hear why you appreciate me.” *(time vs words)*  
- Pick one: “A thoughtful small gift” vs “A lingering hug.” *(gifts vs touch)*  
- Pick one: “Help with a task I dread” vs “Uninterrupted time to talk.” *(acts vs time)*  
- Pick one: “A sincere text” vs “Breakfast prepared.” *(words vs acts)*  
- Pick one: “Spontaneous day out” vs “Warm back rub.” *(time vs touch)*

### CDSG (5 scenario stems)
- “Heart rate >100 and voices rising: best next step?” *(timeout_skill)*  
- “Partner signals shutdown: what do you do?” *(cue_recognition)*  
- “You broke a promise: pick the repair statement.” *(repair_script)*  
- “Argument spirals at night: choose plan.” *(context_management)*  
- “Third party criticism: how to align as a team?” *(ally_stance)*

### SAPT (weekly 5 items)
1. “I felt emotionally safe with my partner this week.” *(safety)*  
2. “We responded to each other’s bids.” *(responsiveness)*  
3. “I could express vulnerability and be received.” *(vulnerability)*  
4. “I soothed myself effectively.” *(self_soothing)*  
5. “We had shared joy moments.” *(joy)*

### BRMI (5 items)
1. “I feel emotionally exhausted.” *(exhaustion)*  
2. “Work feels pointless lately.” *(cynicism)*  
3. “I take micro‑recovery breaks most days.” *(recovery_behaviors)*  
4. “I have supportive check‑ins.” *(support)*  
5. “My workload allows me to switch off.” *(boundaries)*

### DHSM (5 items)
1. “I use my phone in bed most nights.” *(sleep_disrupt)*  
2. “Social posts trigger comparison spirals.” *(comparison)*  
3. “Jealousy is triggered by online interactions.” *(jealousy)*  
4. “Porn use causes conflict for us.” *(porn_conflict)*  
5. “We keep phone‑free zones/times.” *(boundaries)*

### MSFC (5 items)
1. “Saving money makes me feel safe.” *(security)*  
2. “Spending on status feels validating.” *(status)*  
3. “I avoid looking at finances.” *(avoidance)*  
4. “I’m generous even when tight.” *(generosity)*  
5. “I’m comfortable with investment risk.” *(risk_tolerance)*

### SICC (5 items — sensitive)
1. “It’s easy to say ‘not tonight’ without guilt.” *(boundary_assertion)*  
2. “We discuss consent explicitly.” *(consent_dialogue)*  
3. “I know what aftercare I need.” *(aftercare)*  
4. “I can name desire differences without shame.” *(desire_mismatch)*  
5. “I feel emotionally safe during intimacy.” *(safety)*

### SRI (5 items)
1. “I wake at a consistent time.” *(regularity)*  
2. “Screens within 1 hour of bed.” *(sleep_hygiene)*  
3. “Snoring/paused breathing is an issue.” *(osa_suspect)*  
4. “I feel restored in the morning.” *(restoration)*  
5. “Bedroom is cool/dark/quiet.” *(environment)*

### LTSR (5 items)
1. “I’m navigating a major life change.” *(event_presence)*  
2. “Time pressure feels constant.” *(time_pressure)*  
3. “I have enough practical support.” *(support)*  
4. “I’m grieving a loss/change.” *(grief)*  
5. “Our routines are disrupted.” *(routine_disrupt)*

### DTL‑Lite (5 items — educational)
1. “I downplay others’ needs when they conflict with mine.” *(antagonism)*  
2. “I feel I deserve special treatment.” *(entitlement)*  
3. “I read emotions mainly to get what I want.” *(strategic_empathy)*  
4. “Rules apply less to me.” *(rule_bending)*  
5. “I take risky actions without thinking through impact.” *(impulsivity)*

---

## Data Model (Supabase)

### Tables
```sql
create table assessments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  min_questions int not null,
  max_questions int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table assessment_versions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  version int not null,
  changelog text,
  schema_hash text,
  released_at timestamptz not null default now(),
  is_current boolean not null default false,
  unique (assessment_id, version)
);

create table assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_version_id uuid not null references assessment_versions(id) on delete cascade,
  order_index int not null,
  type text not null check (type in ('likert','mcq','text','scenario','forced_choice')),
  prompt text not null,
  scale_min int,
  scale_max int,
  scale_min_label text,
  scale_max_label text,
  domain text not null
);

create table assessment_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references assessment_questions(id) on delete cascade,
  value text not null,
  label text not null,
  weight numeric
);

create table user_assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  assessment_version_id uuid not null references assessment_versions(id),
  user_id uuid not null,
  partner_user_id uuid,
  status text not null check (status in ('in_progress','completed','abandoned')) default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create table user_assessment_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references user_assessment_sessions(id) on delete cascade,
  question_id uuid not null references assessment_questions(id) on delete cascade,
  answer_value numeric,
  answer_text text,
  created_at timestamptz not null default now()
);

create table user_assessment_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references user_assessment_sessions(id) on delete cascade,
  subscale_scores jsonb not null,
  composite numeric,
  risk_flags text[] default '{}',
  explanations jsonb,
  created_at timestamptz not null default now()
);

create table coach_shares (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references user_assessment_sessions(id) on delete cascade,
  coach_id uuid,
  token text unique not null,
  expires_at timestamptz not null,
  permissions text[] not null default array['read_results','read_answers'],
  created_by_user_id uuid not null,
  created_at timestamptz not null default now()
);
```

### RLS (essentials)
```sql
alter table user_assessment_sessions enable row level security;
alter table user_assessment_answers enable row level security;
alter table user_assessment_scores enable row level security;
alter table coach_shares enable row level security;

-- Users can see their own sessions
create policy "user can read own sessions"
on user_assessment_sessions
for select using (auth.uid() = user_id);

create policy "user can insert own sessions"
on user_assessment_sessions
for insert with check (auth.uid() = user_id);

-- Answers follow session ownership
create policy "user answers"
on user_assessment_answers
for all using (
  exists (
    select 1 from user_assessment_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from user_assessment_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

-- Scores follow session ownership
create policy "user scores"
on user_assessment_scores
for select using (
  exists (
    select 1 from user_assessment_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

-- Coach/Share access by token (via RPC or using jwt custom claim)
create policy "coach via token"
on user_assessment_sessions
for select using (
  exists (
    select 1 from coach_shares cs
    where cs.session_id = id
      and cs.expires_at > now()
      and (
        (cs.coach_id is not null and cs.coach_id = auth.uid())
        or (current_setting('request.jwt.claims', true)::jsonb ->> 'coach_share_token') = cs.token
      )
  )
);
```

---

## API Contracts

### REST Endpoints
```
GET  /api/assessments/assessment-types        -> list {slug,title,category,is_active,min,max,version}
POST /api/assessments/start                    -> { assessment_slug } => { session_id }
POST /api/assessments/answer                   -> { session_id, question_id, value|text } => 200
POST /api/assessments/complete                 -> { session_id } => { scores, summary }
GET  /api/assessments/result/:session_id       -> owner or coach token → result
POST /api/assessments/share                    -> { session_id, coach_id? } => { share_url, token, expires_at }
GET  /api/assessments/share/:token             -> { result readonly }
```

### JSON Shapes
```json
// assessment-types (GET)
[
  { "slug":"aacp","title":"Advanced Attachment & Conflict Pattern","category":"relationship","min":28,"max":40,"version":1 },
  { "slug":"rrss","title":"Relationship Red-Flags & Safety Screener","category":"safety","min":18,"max":22,"version":1 }
]
```

```json
// start (POST)
{ "assessment_slug":"aacp" } -> { "session_id":"uuid" }
```

```json
// answer (POST)
{ "session_id":"uuid","question_id":"uuid","value":4 }
```

```json
// complete (POST) -> includes AI text
{
  "session_id":"uuid",
  "scores": {
    "subscale_scores": {"anxious":62,"avoidant":24,"secure":54},
    "composite":53,
    "risk_flags":["flooding_risk"]
  },
  "summary": "You show anxious tendencies in early conflict. Try a 90-second reset..."
}
```

```json
// share (POST)
{ "session_id":"uuid","coach_id":null } ->
{ "token":"7gH4kQ", "expires_at":"2025-12-31T00:00:00Z", "share_url":"https://app/result/share/7gH4kQ" }
```

---

## Scoring & AI

### Scoring Outline
- Likert items: map 1–5 → 0–100 linearly (reverse‑score where `domain` requires).
- Subscales: mean of domain scores; Composite: weighted mean (weights in metadata).
- Threshold flags: e.g., RRSS `physical_safety` ≥ 80 → `escalate_resource_notice`.
- Persist to `user_assessment_scores` before AI call.

### AI Summary Template (server)
```
SYSTEM: You are Coach Charles, a supportive, evidence-aware assistant. You do not diagnose.
INPUT:
- Assessment: {{title}} v{{version}}
- Subscales: {{subscale_scores_json}}
- Composite: {{composite}}
- Risk flags: {{risk_flags}}
- Context: {{relationship_status}}, {{goals}}

TASK:
1) Summarize top 3 patterns in plain language.
2) Offer 3 tiny, specific actions for the next 7 days.
3) Provide one reflection question.
4) If risk flags present, prepend a brief “safety first” notice with static resources.
TONE: Respectful, clear, brief. No diagnosis. Encourage self-efficacy.
```

---

## Frontend UX

- **Flow:** Catalog → Start → Paged items (autosave) → Complete → Results (share/export).
- **Share:** “Share with a coach” creates token link; copy or email. Token view is read‑only.
- **Partner Mode:** Invite partner to the same assessment; couple comparison available for AAC‑P, CSLB, LLNP, CDSG.
- **Longitudinal:** SAPT weekly pulse chart; BRMI monthly; others quarterly; trend visualization in dashboard.
- **Accessibility:** Keyboard navigable; clear consent line; privacy & terms in header when chat/footer hidden.

---

## Seed Bootstrap (script outline)

- Create slugs: `aacp, rrss, erti, cslb, tbrr, llnp, cdsg, sapt, brmi, dhsm, msfc, sicc, sri, ltsr, dtl_lite`.
- Insert `assessments` + `assessment_versions (v1, is_current=true)`.
- Insert 5 seed questions from above per assessment (expand later).

> A `seed_assessments.ts` can read a local JSON bundle, insert records, and output inserted `assessment_version_id`s for UI use.

Example seed JSON shape:
```json
{
  "slug": "aacp",
  "title": "Advanced Attachment & Conflict Pattern",
  "category": "relationship",
  "version": 1,
  "items": [
    { "type":"likert","prompt":"When conflict starts, I seek reassurance...","domain":"anxious","scale_min":1,"scale_max":5 },
    { "type":"likert","prompt":"I downplay problems to avoid escalation.","domain":"avoidant","scale_min":1,"scale_max":5 }
  ]
}
```

---

## Compliance & Safety Notes
- Educational use only; not diagnostic. Clear consent & disclaimers.
- Red‑flag handling: static resources & encourage professional help; no automated coach outreach without consent.
- Privacy: User controls sharing; export/delete; default retention 24 months.

---

## Next Steps
1) Create tables + RLS (SQL above).  
2) Implement endpoints per contracts.  
3) Build the “Assessment Runner” UI (Zod + React Hook Form or Headless UI).  
4) Seed v1 items for all 15; verify scoring and AI summary.  
5) Add Share Token views and Coach Dashboard read‑only results.  

---

**End of Spec**