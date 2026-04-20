# Practice Test Site — Reusable Pattern

This file describes the architecture and conventions used to build a practice-test
web app for a class. Copy the same pattern into a new repository to create a
practice test for a different course.

## What the site is for

- A **paper-based** test is given in class. Students cannot use notes or devices
  during the real test, so practice questions must be answerable from memory.
- The practice site is a **static web app**, hosted on **GitHub Pages** (so
  `index.html` must be in the repository root and everything must be front-end).
- Students do **not** submit answers. Each question has a **Show Answer** button
  that reveals the worked solution.
- Questions are displayed all on one scrollable page (per topic page).
- Math renders via **KaTeX** (auto-render, delimiters `$...$`, `$$...$$`,
  `\(...\)`, `\[...\]`).
- Code is shown in `<pre><code>` blocks.

## File layout

```
index.html          Topic page 1 (home; linked from nav as "active")
<topic2>.html       Topic page 2 (e.g., transformers.html)
<topic3>.html       Topic page 3 (e.g., fastapi.html)
styles.css          Shared styling for all pages
script.js           Shared answer-toggle + visibility/renumbering logic
visibility.js       Single-file config: which question keys are visible
PATTERN.md          This document (reference for future sessions)
```

All pages share `styles.css`, `script.js`, and `visibility.js`. Adding a new
topic is just a new `<topic>.html` that follows the same template.

## Page template

Every HTML page has this shell. The only per-page differences are the `<title>`,
the active nav link, and the questions in `<main id="questions">`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Practice Test — <Topic></title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<link rel="stylesheet" href="styles.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false},
      {left: '\\(', right: '\\)', display: false},
      {left: '\\[', right: '\\]', display: true}
    ]
  });"></script>
<script defer src="visibility.js"></script>
<script defer src="script.js"></script>
</head>
<body>
<nav class="topnav">
  <a href="index.html">Topic 1</a>
  <a href="topic2.html" class="active">Topic 2</a>
  <a href="topic3.html">Topic 3</a>
</nav>
<header>
  <h1>Practice Test</h1>
  <p>Topic 2. Try each question on paper first, then click <em>Show Answer</em> to check.</p>
</header>

<main id="questions">
  <!-- questions go here -->
</main>

<footer>Good luck!</footer>
</body>
</html>
```

The order of `<script defer>` tags matters: `visibility.js` must load before
`script.js` so that `VISIBLE_KEYS` is defined when `script.js` runs. Both have
`defer`, which preserves document order.

## Question template

Every question is a `<section class="question">` with a unique `data-key`
attribute. Script.js uses the data-key to decide visibility and to renumber.

```html
<section class="question" data-key="topic2-1">
  <div class="question-header">
    <span class="question-number">Question 1</span>
    <span class="question-type">short answer</span>
  </div>
  <div class="prompt">
    <!-- Paragraphs, math ($...$, $$...$$), code blocks, tables, etc. -->
  </div>
  <button class="reveal" onclick="toggleAnswer(this)">Show Answer</button>
  <div class="answer">
    <div class="answer-label">Answer</div>
    <!-- Worked solution, reasoning as a <ul>. -->
  </div>
</section>
```

Conventions used so far:
- `question-type` is a small uppercase tag. Values used: `fill in the blanks`,
  `short answer`, `code from memory`. Freely add more as needed.
- The answer block should lead with the final answer, then a
  **Reasoning** paragraph and a `<ul>` explaining each step.
- The `Question N` text is **rewritten by script.js on page load** to reflect
  the current visible order. You can leave the hardcoded number as-is when
  authoring; it will be overwritten.

## Special styling patterns

These classes and elements are already in `styles.css` and are used by existing
questions — reuse them verbatim for consistency:

- **Blanks for fill-in questions**: `<span class="blank">&nbsp;</span>`
  renders as a short underlined slot the student mentally fills in.
- **Code blocks**: use `<pre><code>...</code></pre>`. Monospace, subtle gray
  background.
- **Matrices**: use `<table class="matrix">` with `<thead>` for column labels
  and `<th class="row-label">` for row labels. See existing questions for the
  exact structure.
- **Display math**: use `$$ ... $$` for centered display equations. KaTeX
  renders `\begin{bmatrix} ... \end{bmatrix}` for matrices.

## visibility.js — how to hide/show questions without editing HTML

`visibility.js` is a single-file config:

```js
const VISIBLE_KEYS = [
  "topic1-1",
  "topic1-2",
  // "topic1-3",   // commented out -> hidden
  "topic2-1",
];
```

Behavior (implemented in `script.js`):
- Any `<section class="question">` whose `data-key` is **not** in `VISIBLE_KEYS`
  is hidden via `display: none`.
- Visible questions are **renumbered** 1, 2, 3, … in document order, so the
  student never sees gaps.
- A given page may render zero visible questions if none of its keys are in
  the list — that's fine.

Typical workflow for the instructor:
1. Edit `visibility.js` to list only the keys for the current class day.
2. `git commit` and `git push`.
3. GitHub Pages redeploys; students see only the selected questions.

## Naming convention for keys

Use a short topic prefix plus a number: `ffn-1`, `tx-3`, `api-5`. Keep them
stable once assigned so the instructor's `VISIBLE_KEYS` list doesn't drift.
When adding a new question, increment the next available number for that
topic and add an entry to `visibility.js` (usually at the bottom of that
topic's group).

## Working with the instructor

- Expect the instructor to want questions added **one at a time**, with
  review in between. Don't batch.
- When the instructor describes a question, **always propose concrete
  numbers/content first** (e.g., specific image dimensions, a specific
  sentence, specific matrix values) rather than leaving placeholders.
- Avoid **memorable constants** students might have memorized from standard
  datasets (e.g., avoid $28\times 28$, $32\times 32$, 10 classes). Pick
  unusual sizes/counts that force actual computation.
- If a prior question defined a vocabulary, formula, or other context, reuse
  it in later questions on the same page for continuity.
- After adding a question, report briefly what was added (the key, the
  answer) and ask for the next one — do not volunteer summaries of the
  whole file or the whole session.

## GitHub Pages deployment

- Everything is static. No build step.
- The site serves `index.html` at the repo root when Pages is enabled on the
  `main` branch (root).
- Codespaces preview: the instructor uses VS Code Live Server; you do not
  need to start a server yourself.
