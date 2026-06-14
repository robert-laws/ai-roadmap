import {
  Bot,
  CalendarClock,
  Code2,
  Gamepad2,
  Images,
  Layers3,
  PenTool,
  Sparkles
} from "lucide-react";
import type { Lesson, Track, TrackId } from "../types";

const lesson = (item: Omit<Lesson, "relatedLessonIds"> & { relatedLessonIds?: string[] }): Lesson => ({
  relatedLessonIds: item.relatedLessonIds ?? [],
  ...item
});

const trackALessons: Lesson[] = [
  lesson({
    id: "a-foundations-context",
    trackId: "A",
    pathLabel: "Generic foundations",
    title: "Map Claude context sources",
    duration: "Day 1-2",
    objective:
      "Understand how project instructions, memory, folder files, and conversation context shape AI output.",
    prerequisites: ["Access to the Operation Sunrise project", "A folder or project where you can safely edit instructions"],
    tools: ["Claude Cowork", "Operation Sunrise folder"],
    goalNumbers: [9, 11],
    steps: [
      "Open the Operation Sunrise project instructions and identify the parts that describe durable goals, tone, constraints, and current work.",
      "Rewrite one paragraph so it specifically describes the current AI learning roadmap and the social media overhaul north star.",
      "Start a fresh chat in the same project and ask what context it has about you and the roadmap.",
      "Create a second chat and ask the same question, then compare what came from project instructions, memory, folder files, and the active conversation.",
      "Write a short note explaining which context source should hold durable instructions, temporary task details, and source-of-truth files."
    ],
    checkpoint:
      "You can explain where Claude's context came from in a new chat without guessing.",
    proofArtifact:
      "A saved context-source note or screenshot showing the fresh-chat comparison.",
    prompts: [
      "What do you know about my current AI learning roadmap, and where does each piece of context seem to come from?",
      "Critique my project instructions. What should be more durable, more specific, or moved into files?"
    ],
    relatedLessonIds: ["a-pip-project-scaffold", "a-foundations-skill"]
  }),
  lesson({
    id: "a-foundations-skill",
    trackId: "A",
    pathLabel: "Generic foundations",
    title: "Build your first personal skill",
    duration: "Day 2-4",
    objective:
      "Create an on-demand workflow skill that packages draft ideas into platform-ready social posts.",
    prerequisites: ["Completed context-source exercise", "Access to a skill-creator workflow or equivalent skill folder"],
    tools: ["Claude Cowork", "skill-creator", "Text editor"],
    goalNumbers: [6, 9],
    steps: [
      "Read a production skill's SKILL.md and note its trigger description, workflow steps, references, and output expectations.",
      "Draft the purpose of a `post-packager` skill: input, expected output formats, tone requirements, and when it should trigger.",
      "Create the skill folder with a SKILL.md that contains a concise description, workflow, and formatting rules.",
      "Run a test in a fresh chat using one rough post idea from the roadmap.",
      "Revise the skill until it consistently returns platform-ready post copy with clear next actions."
    ],
    checkpoint: "A fresh chat triggers and uses your own skill correctly.",
    proofArtifact: "The SKILL.md file plus one before/after test output.",
    prompts: [
      "Use my `post-packager` skill to turn this lesson outcome into X and Instagram post drafts.",
      "What context did the skill need that was missing from its SKILL.md?"
    ],
    relatedLessonIds: ["f-weekly-pipeline", "a-pip-pipeline-skill"]
  }),
  lesson({
    id: "a-foundations-automation",
    trackId: "A",
    pathLabel: "Generic foundations",
    title: "Create a recurring content heartbeat",
    duration: "Day 4-6",
    objective:
      "Use connectors, scheduled tasks, and artifacts to make the learning system visible and recurring.",
    prerequisites: ["A working skill or repeatable workflow", "A folder that contains roadmap or content pipeline files"],
    tools: ["Claude Cowork", "Scheduled tasks", "Artifacts", "Calendar connector"],
    goalNumbers: [6, 9],
    steps: [
      "Choose one recurring review moment, such as Monday morning content planning or Friday proof-of-skill review.",
      "Write the scheduled task prompt so it reads the roadmap folder, identifies stalled lessons, and proposes the next publishable work.",
      "Create a simple artifact dashboard that summarizes tracks, active lessons, proof artifacts, and blockers.",
      "Add one connector-backed enhancement, such as a calendar block for the weekly production session.",
      "Review the first automated output and adjust the prompt so it is specific, short, and action-oriented."
    ],
    checkpoint: "One recurring task exists and one live view shows status without rebuilding it manually.",
    proofArtifact: "A screenshot or exported text of the scheduled task and dashboard.",
    prompts: [
      "Every Monday, read the AI learning roadmap folder and propose the next three content-worthy tasks.",
      "Build a live artifact dashboard for lesson status, proof artifacts, and stalled items."
    ],
    relatedLessonIds: ["f-weekly-pipeline", "f-agent-handoff"]
  }),
  lesson({
    id: "a-foundations-cli",
    trackId: "A",
    pathLabel: "Generic foundations",
    title: "Run one end-to-end Claude Code task",
    duration: "Day 6-10",
    objective:
      "Learn the terminal-based build loop by completing one real file-producing task with Claude Code.",
    prerequisites: ["Node installed", "A safe project folder for testing", "Comfort running terminal commands"],
    tools: ["Claude Code CLI", "Terminal", "ffmpeg optional"],
    goalNumbers: [4, 9, 11],
    steps: [
      "Install Claude Code, open a test project folder, and run `/init` to generate a CLAUDE.md.",
      "Read the generated CLAUDE.md and edit it into clear project instructions for the test project.",
      "Ask Claude Code to build a one-page site or make a small media edit, then let it inspect files and run commands.",
      "Course-correct once during the build by asking for a specific design, content, or output change.",
      "Run the output locally and capture what worked, what was missing, and what instruction improved the result."
    ],
    checkpoint: "You completed one real task in Claude Code from prompt to local output.",
    proofArtifact: "A screenshot, output file, or repo commit from the completed CLI task.",
    prompts: [
      "Build and locally preview a one-page site that explains one AI workflow I learned this week.",
      "Given this video file, trim it, caption it, and resize it for a vertical social post."
    ],
    relatedLessonIds: ["c-static-site", "d-canvas-loop"]
  }),
  lesson({
    id: "a-pip-project-scaffold",
    trackId: "A",
    pathLabel: "Pip & Atlas chosen path",
    title: "Create the Pip & Atlas project bible",
    duration: "Phase 1",
    objective:
      "Turn a blank folder into a durable source of truth for an original companion-adventure comic.",
    prerequisites: ["Operation Sunrise folder access", "Commitment to keep Pip & Atlas creatively distinct from reference projects"],
    tools: ["Claude Cowork", "Markdown files", "Project instructions"],
    goalNumbers: [3, 9, 11],
    steps: [
      "Create the `pip-and-atlas/` scaffold with `series-bible/`, `issues/issue-01/`, and `production/` folders.",
      "Write `series-bible/00-brief.md` with the premise, tone, character dynamic, world, and production constraints.",
      "Write `characters.md`, `world.md`, and `visual-style.md` with enough detail for a new chat to continue the series correctly.",
      "Open a fresh chat, point it at the folder, and ask it to pitch an episode.",
      "Patch every wrong assumption from that fresh-chat test back into the brief or bible."
    ],
    checkpoint: "A fresh chat can describe the series and pitch an episode that fits the canon.",
    proofArtifact: "The project scaffold and a fresh-chat episode pitch annotated with fixes.",
    prompts: [
      "Using only the files in this folder, describe Pip, Atlas, their world, and the tone of the series.",
      "Pitch three short episode ideas that match the series bible and avoid borrowing from any reference IP."
    ],
    relatedLessonIds: ["a-foundations-context", "b-character-sheets"]
  }),
  lesson({
    id: "a-pip-pipeline-skill",
    trackId: "A",
    pathLabel: "Pip & Atlas chosen path",
    title: "Design the comic pipeline skill",
    duration: "Phase 2",
    objective:
      "Build a custom skill that turns a story idea into script, storyboard, panel prompts, and assembly instructions.",
    prerequisites: ["Pip & Atlas bible exists", "A reference skill reviewed for structure only"],
    tools: ["skill-creator", "Midjourney", "Markdown", "Claude Cowork"],
    goalNumbers: [3, 9],
    steps: [
      "Study a production comic skill only for structure: trigger, workflow phases, references, and output format.",
      "Write `production/pipeline.md` with the exact stages: idea, script, storyboard, panel prompts, image generation, assembly, review.",
      "Create a new `pip-atlas-pipeline` skill with original prompt templates and explicit IP constraints.",
      "Add character-consistency rules for reference images, character sheets, seeds, and recurring visual vocabulary.",
      "Test the skill with a four-panel page and revise it until the workflow is complete without extra explanation."
    ],
    checkpoint: "The custom skill runs the complete comic workflow on a test page.",
    proofArtifact: "The skill folder plus a four-panel test page plan and prompt set.",
    prompts: [
      "Use the Pip & Atlas pipeline to turn this idea into a four-panel page: Atlas plans the route, Pip finds the shortcut.",
      "Audit these panel prompts for character consistency and IP distinctiveness."
    ],
    relatedLessonIds: ["b-character-sheets", "e-motion-comic"]
  }),
  lesson({
    id: "a-pip-studio-automation",
    trackId: "A",
    pathLabel: "Pip & Atlas chosen path",
    title: "Automate the Pip & Atlas studio",
    duration: "Phase 3",
    objective:
      "Create the weekly production heartbeat and dashboard for issue progress, pages, panels, and blockers.",
    prerequisites: ["Pip & Atlas pipeline drafted", "At least one issue folder"],
    tools: ["Scheduled tasks", "Artifacts", "Calendar connector"],
    goalNumbers: [3, 6, 9],
    steps: [
      "Write a weekly writers' room task that reads the series bible and current issue folder.",
      "Make the task propose next pages, flag stalled panels, and identify publishable behind-the-scenes posts.",
      "Create a production dashboard with issue status, page count, panel states, proof assets, and next action.",
      "Add a weekly production session to your calendar if that connector is available.",
      "Review whether the automation helps or creates noise, then shorten the task prompt accordingly."
    ],
    checkpoint: "The studio has one recurring heartbeat and one live status view.",
    proofArtifact: "A screenshot or export of the task prompt and dashboard.",
    prompts: [
      "Read the Pip & Atlas folder and propose next week's production plan with blockers and publishable updates.",
      "Build a dashboard that tracks script, storyboard, prompts, generated panels, assembled pages, and teaser status."
    ],
    relatedLessonIds: ["f-weekly-pipeline", "a-pip-print-shop"]
  }),
  lesson({
    id: "a-pip-print-shop",
    trackId: "A",
    pathLabel: "Pip & Atlas chosen path",
    title: "Use Claude Code as the print shop",
    duration: "Phase 4",
    objective:
      "Build production scripts that assemble comic panels into finished pages and teaser clips.",
    prerequisites: ["A generated test page or panel set", "Claude Code installed", "Basic terminal comfort"],
    tools: ["Claude Code CLI", "Python", "ffmpeg", "ElevenLabs optional", "Suno optional"],
    goalNumbers: [3, 5, 9],
    steps: [
      "Run Claude Code in the `pip-and-atlas/` folder and initialize or refine CLAUDE.md into a production handbook.",
      "Ask it to build a page assembler script with gutters, margins, print export, and social export settings.",
      "Run the assembler on a test panel folder and inspect spacing, naming, and output formats.",
      "Ask it to build a 20-second motion-comic teaser using panel pans, captions, and optional narration or music.",
      "Save the exact commands into `production/pipeline.md` so the workflow is repeatable."
    ],
    checkpoint: "One command assembles a page, and one teaser clip exists or is ready to render.",
    proofArtifact: "The assembler script, sample page output, and teaser command or video.",
    prompts: [
      "Write a Python comic-page assembler for these panels with gutters, margins, and social/print export sizes.",
      "Create an ffmpeg command that pans across four panels and adds captions for a 20-second vertical teaser."
    ],
    relatedLessonIds: ["d-canvas-loop", "e-motion-comic"]
  }),
  lesson({
    id: "a-pip-issue-one",
    trackId: "A",
    pathLabel: "Pip & Atlas chosen path",
    title: "Ship Pip & Atlas Issue #1",
    duration: "Phase 5",
    objective:
      "Use the infrastructure you built to publish a complete short issue and a behind-the-scenes social post.",
    prerequisites: ["Pipeline skill", "Dashboard", "Assembler", "At least one test page"],
    tools: ["Midjourney", "Claude Code", "Topview or video editor", "Social platforms"],
    goalNumbers: [3, 5, 6, 9],
    steps: [
      "Choose a 6-10 page story idea that fits the series bible and can be finished with the current pipeline.",
      "Use your skill to produce script, storyboard, panel prompts, and production checklist.",
      "Generate panels, assemble pages, and review the issue for character consistency and readability.",
      "Create a teaser and a 'Built This Week' post explaining the AI comic studio you built.",
      "Archive the final issue, teaser, prompts, and lessons learned as proof artifacts."
    ],
    checkpoint: "Issue #1 exists as a finished artifact and the build story is ready to post.",
    proofArtifact: "Finished issue pages, teaser clip, prompt archive, and social draft.",
    prompts: [
      "Plan a 6-page Issue #1 that proves the pipeline without overcomplicating production.",
      "Turn this completed issue into a 'Built This Week' post about building an AI comic studio."
    ],
    relatedLessonIds: ["f-content-ready", "e-motion-comic"]
  })
];

const scaffoldLessons: Lesson[] = [
  lesson({
    id: "b-character-sheets",
    trackId: "B",
    title: "Create consistent character reference sheets",
    duration: "2 sessions",
    objective:
      "Build reusable character sheets and prompt patterns for consistent visual storytelling.",
    prerequisites: ["A character or brand concept", "Access to Midjourney or an image model"],
    tools: ["Midjourney", "Nano Banana 2", "Seedance 2.0", "Reference folders"],
    goalNumbers: [3, 10],
    steps: [
      "Define the character in text: silhouette, colors, outfit, personality, constraints, and forbidden traits.",
      "Generate a first sheet with front, side, back, expressions, and simple poses.",
      "Pick the strongest image and record seed, style reference, character reference, and prompt notes.",
      "Generate three scenes using the same reference setup and compare identity drift.",
      "Update a model guide with what worked, what failed, and the exact reusable prompt pattern."
    ],
    checkpoint: "The same character is recognizable across at least three different scenes.",
    proofArtifact: "A character sheet, three scene outputs, and a short model guide note.",
    prompts: [
      "Create a character sheet for [character] with front, side, back, expressions, clean background, consistent design.",
      "Generate [scene] using this character reference. Preserve silhouette, colors, face shape, outfit, and personality."
    ],
    relatedLessonIds: ["a-pip-pipeline-skill", "e-portfolio-gallery"]
  }),
  lesson({
    id: "b-model-guide",
    trackId: "B",
    title: "Write a visual model field guide",
    duration: "1 session",
    objective:
      "Turn repeated experiments into a practical model-specific prompting guide.",
    prerequisites: ["At least six generated image or video attempts"],
    tools: ["Midjourney", "Seedance 2.0", "Gemini Pro", "Grok"],
    goalNumbers: [10],
    steps: [
      "Choose one model and one task type, such as consistent characters, scene extension, or video motion.",
      "Run a controlled set of prompts where only one variable changes each time.",
      "Record input prompt, model settings, output quality, failure mode, and reuse potential.",
      "Summarize the model's strengths, weaknesses, prompt syntax, and best-use cases.",
      "Convert the guide into a publishable post or reference page."
    ],
    checkpoint: "You can explain when to use the model and how to prompt it for one repeatable task.",
    proofArtifact: "A guide page with examples, settings, and prompt recommendations.",
    prompts: [
      "Compare these six outputs and extract the prompting rules that actually changed the result.",
      "Turn these notes into a concise model guide for creators learning [model]."
    ],
    relatedLessonIds: ["f-content-ready"]
  }),
  lesson({
    id: "c-static-site",
    trackId: "C",
    title: "Ship a static GitHub Pages site",
    duration: "2 sessions",
    objective:
      "Build, preview, and publish a static site that can become the home for your AI portfolio.",
    prerequisites: ["GitHub account", "Node installed", "Basic HTML/CSS/JS comfort"],
    tools: ["Vite", "React", "GitHub Pages", "GitHub Actions"],
    goalNumbers: [4, 7, 8],
    steps: [
      "Create a Vite app with a clear app shell, route structure, and reusable data file.",
      "Build one useful page first, not a landing page: dashboard, gallery, or tracker.",
      "Add a GitHub Actions workflow that builds `dist` and deploys to Pages.",
      "Run a production build locally and fix asset paths for the repository base URL.",
      "Push to GitHub, enable Pages from GitHub Actions, and verify the live URL."
    ],
    checkpoint: "The site is live and a deep-linked page works after refresh.",
    proofArtifact: "The GitHub Pages URL and a screenshot of the live site.",
    prompts: [
      "Audit this Vite app for GitHub Pages deployment issues.",
      "Create a GitHub Actions workflow that builds and deploys this Vite app to Pages."
    ],
    relatedLessonIds: ["c-crud-supabase", "d-canvas-loop"]
  }),
  lesson({
    id: "c-crud-supabase",
    trackId: "C",
    title: "Add database-backed CRUD",
    duration: "3 sessions",
    objective:
      "Extend a static front end with real persistent records using Supabase.",
    prerequisites: ["Static site deployed", "Supabase account", "A data model worth persisting"],
    tools: ["Supabase", "React", "TypeScript", "GitHub"],
    goalNumbers: [4],
    steps: [
      "Choose one entity, such as portfolio items, lessons, notes, or prompt experiments.",
      "Design fields, required values, empty states, and validation rules.",
      "Create the Supabase table and row-level policies appropriate for the first use case.",
      "Build list, create, edit, and delete views with loading and error states.",
      "Deploy and verify that records persist across browsers."
    ],
    checkpoint: "One real entity can be created, edited, deleted, and viewed after refresh.",
    proofArtifact: "A deployed CRUD screen plus a short schema note.",
    prompts: [
      "Design a minimal Supabase schema for [entity] with public read and owner-only write.",
      "Implement CRUD for this entity with loading, empty, success, and error states."
    ],
    relatedLessonIds: ["e-portfolio-gallery"]
  }),
  lesson({
    id: "d-canvas-loop",
    trackId: "D",
    title: "Build a small interactive scene",
    duration: "2 sessions",
    objective:
      "Learn the core loop behind playable and explorable browser experiences.",
    prerequisites: ["Static site basics", "A simple scene idea"],
    tools: ["Canvas", "Three.js", "Vite", "AI-generated textures"],
    goalNumbers: [1, 2],
    steps: [
      "Choose a tiny interaction: move, collect, reveal, avoid, or explore.",
      "Use a proven library for the hard part if physics, 3D, or game rules matter.",
      "Build the loop: initialize state, update every frame, draw the scene, handle input.",
      "Add one AI-generated visual asset and verify it loads on desktop and mobile.",
      "Deploy the scene and record what made it feel interactive instead of static."
    ],
    checkpoint: "A user can control or explore something in the browser for at least one minute.",
    proofArtifact: "A deployed interactive scene and a short implementation note.",
    prompts: [
      "Design a tiny browser game loop with controls, win condition, and assets for [idea].",
      "Review this Three.js scene for blank-canvas risks, mobile framing, and interaction problems."
    ],
    relatedLessonIds: ["e-motion-comic", "c-static-site"]
  }),
  lesson({
    id: "e-portfolio-gallery",
    trackId: "E",
    title: "Build a multimodal portfolio gallery",
    duration: "3 sessions",
    objective:
      "Combine generated images, tags, notes, and context into a browsable owned hub.",
    prerequisites: ["Static site deployed", "A set of generated images or videos"],
    tools: ["Midjourney", "React", "Supabase optional", "GitHub Pages"],
    goalNumbers: [5, 7],
    steps: [
      "Select 12-24 strongest generated assets and group them by project, style, model, or use case.",
      "Write captions that explain the prompt goal, tool, result, and what you learned.",
      "Build gallery filters for model, subject, format, and project.",
      "Add detail views with source prompt, settings, notes, and related assets.",
      "Publish the gallery as a portfolio destination rather than a raw image dump."
    ],
    checkpoint: "The gallery helps someone understand your capability, process, and strongest outputs.",
    proofArtifact: "A live gallery page with at least 12 annotated assets.",
    prompts: [
      "Turn these generated assets into a portfolio taxonomy with tags and captions.",
      "Write concise process notes for each image: goal, tool, prompt move, result, next experiment."
    ],
    relatedLessonIds: ["c-crud-supabase", "b-model-guide"]
  }),
  lesson({
    id: "e-motion-comic",
    trackId: "E",
    title: "Create a motion-comic teaser",
    duration: "2 sessions",
    objective:
      "Layer image, voice, music, captions, and motion into a signature multimodal output.",
    prerequisites: ["Finished panels or visual sequence", "Basic ffmpeg or video editor access"],
    tools: ["ElevenLabs", "Suno.ai", "Topview.ai", "Seedance 2.0", "ffmpeg"],
    goalNumbers: [5, 8],
    steps: [
      "Choose a short visual sequence with a clear beginning, turn, and ending.",
      "Write a 20-30 second narration script and generate a voice pass.",
      "Generate or choose a short music bed that supports the mood without overpowering narration.",
      "Animate panels with pans, zooms, captions, and timing that matches the narration.",
      "Export in a vertical social format and a website-friendly format."
    ],
    checkpoint: "The final teaser feels like one composed piece, not separate assets stitched together.",
    proofArtifact: "A vertical teaser video plus the script, voice, music, and source panel notes.",
    prompts: [
      "Write a 25-second teaser script for this visual sequence with a strong final line.",
      "Create an edit decision list for pan, zoom, caption, narration, and music timing."
    ],
    relatedLessonIds: ["a-pip-print-shop", "f-content-ready"]
  }),
  lesson({
    id: "f-weekly-pipeline",
    trackId: "F",
    title: "Design the weekly content pipeline",
    duration: "2 sessions",
    objective:
      "Turn learning activity into a semi-automated idea-to-post workflow.",
    prerequisites: ["At least one repeatable lesson workflow", "A clear social platform target"],
    tools: ["Scheduled tasks", "Custom skills", "Artifacts", "Calendar"],
    goalNumbers: [6],
    steps: [
      "Define the weekly inputs: lessons completed, proof artifacts, experiments, failures, and upcoming focus.",
      "Create a task that proposes post ideas, asks for missing context, and packages the best one.",
      "Use a custom skill to turn the chosen idea into platform-specific drafts.",
      "Add a review checklist for accuracy, voice, visuals, and call-to-action.",
      "Store the output in a ready-to-post folder or tracker."
    ],
    checkpoint: "One weekly cycle produces at least one reviewed post draft from learning work.",
    proofArtifact: "A ready-to-post draft generated from a completed lesson.",
    prompts: [
      "Read this week's lesson notes and proof artifacts. Propose three post ideas ranked by usefulness and novelty.",
      "Package this selected idea into X, Instagram, and newsletter-style drafts in my voice."
    ],
    relatedLessonIds: ["a-foundations-automation", "f-content-ready"]
  }),
  lesson({
    id: "f-agent-handoff",
    trackId: "F",
    title: "Use subagents for parallel production",
    duration: "1 session",
    objective:
      "Split research, drafting, asset review, and publishing prep into clear isolated agent tasks.",
    prerequisites: ["A content pipeline draft", "A project with enough files for agents to inspect"],
    tools: ["Subagents", "Claude Code", "Project files"],
    goalNumbers: [6, 9],
    steps: [
      "Identify three separable jobs: research, draft, visual review, QA, or publishing checklist.",
      "Write a one-paragraph brief for each agent with inputs, outputs, constraints, and stop conditions.",
      "Run the agents in parallel or sequence and keep their outputs in separate files.",
      "Compare their recommendations and choose one final direction yourself.",
      "Update the pipeline with what should become repeatable."
    ],
    checkpoint: "Parallel work produces cleaner options without losing the final editorial decision.",
    proofArtifact: "Agent briefs plus final synthesized output.",
    prompts: [
      "Act as a research subagent. Inspect these notes and return only claims worth verifying before publishing.",
      "Act as a visual QA subagent. Review these assets for consistency, readability, and social crop risks."
    ],
    relatedLessonIds: ["f-content-ready"]
  }),
  lesson({
    id: "f-content-ready",
    trackId: "F",
    title: "Package one proof-of-skill post",
    duration: "1 session",
    objective:
      "Convert a completed project into publishable social proof with assets, caption, and process notes.",
    prerequisites: ["A completed proof artifact", "At least one target platform"],
    tools: ["post-packager skill", "Topview.ai optional", "Image editor optional"],
    goalNumbers: [6],
    steps: [
      "Choose one proof artifact that demonstrates a concrete capability, not just effort.",
      "Write the story arc: problem, experiment, build move, result, and what you learned.",
      "Create or select the visual asset that makes the post understandable without extra context.",
      "Generate platform-specific drafts, then manually tighten for voice and accuracy.",
      "Save the final caption, asset, alt text, and posting notes together."
    ],
    checkpoint: "A post can be published without reopening the project to find missing pieces.",
    proofArtifact: "Final caption, asset, alt text, tags, and posting checklist.",
    prompts: [
      "Turn this proof artifact into a concise 'Built This Week' post with a clear before/after.",
      "Create alt text and a short caption variant for this visual asset."
    ],
    relatedLessonIds: ["a-pip-issue-one", "b-model-guide"]
  })
];

const makeTrack = (
  id: TrackId,
  title: string,
  shortTitle: string,
  status: string,
  duration: string,
  accent: string,
  cover: string,
  icon: Track["icon"],
  dependencies: TrackId[],
  socialPayoff: string,
  proofOfSkill: string,
  overview: string,
  whyItMatters: string,
  lessons: Lesson[]
): Track => ({
  id,
  title,
  shortTitle,
  status,
  duration,
  accent,
  cover,
  icon,
  dependencies,
  socialPayoff,
  proofOfSkill,
  overview,
  whyItMatters,
  lessons
});

export const tracks: Track[] = [
  makeTrack(
    "A",
    "Cowork & Claude Code Foundations",
    "Foundations",
    "In progress",
    "1-2 weeks",
    "#d76f55",
    "linear-gradient(135deg, #382527 0%, #d76f55 52%, #f0c36f 100%)",
    Bot,
    [],
    "Faster content ops: skills and scheduled tasks running the weekly pipeline.",
    "Custom skill, scheduled task, and artifact dashboard; chosen capstone is Pip & Atlas Issue #1.",
    "The starting track for understanding context, skills, connectors, scheduled work, artifacts, and Claude Code.",
    "This track turns AI from a chat box into a working studio with reusable instructions, repeatable workflows, and visible output.",
    trackALessons
  ),
  makeTrack(
    "B",
    "Visual Storytelling & Image-Model Craft",
    "Visual Craft",
    "Next",
    "Parallel after A",
    "#65b8c6",
    "linear-gradient(135deg, #143342 0%, #65b8c6 55%, #d8f0ef 100%)",
    Images,
    [],
    "Consistent visual identity, recurring character series, and shareable model guides.",
    "A short visual story with one consistent character cast from concept to final outputs.",
    "Character consistency, image-model prompting, style references, seeds, and model-specific field guides.",
    "Strong visuals make the roadmap public-facing: character work, model guides, and recurring series become content assets.",
    scaffoldLessons.filter((item) => item.trackId === "B")
  ),
  makeTrack(
    "C",
    "Full-Stack Web",
    "Web",
    "Planned",
    "After A, parallel with B",
    "#9fbd63",
    "linear-gradient(135deg, #263a22 0%, #9fbd63 52%, #edf1c9 100%)",
    Code2,
    [],
    "An owned hub site beyond bio links, with real workflows and deployable examples.",
    "A deployed site with database-driven content and one external API integration.",
    "Static front ends, deployment, database-backed CRUD, third-party APIs, auth, and interactive workflows.",
    "This is the owned surface where the rest of the learning becomes visible, organized, and durable.",
    scaffoldLessons.filter((item) => item.trackId === "C")
  ),
  makeTrack(
    "D",
    "Interactive Environments & Games",
    "Interactive",
    "Planned",
    "After C basics",
    "#b39adf",
    "linear-gradient(135deg, #302a45 0%, #b39adf 54%, #eee6ff 100%)",
    Gamepad2,
    ["C", "B"],
    "Interactive and playable content that earns shares and demonstrates capability.",
    "A playable browser game or explorable 3D scene, deployed.",
    "Canvas, Three.js, game loops, interaction design, and AI-generated assets.",
    "Interaction proves depth quickly: users can touch the work instead of only reading about it.",
    scaffoldLessons.filter((item) => item.trackId === "D")
  ),
  makeTrack(
    "E",
    "Multimodal Combination Projects",
    "Multimodal",
    "Payoff tier",
    "After B + C",
    "#d7a746",
    "linear-gradient(135deg, #433014 0%, #d7a746 50%, #f8e7b4 100%)",
    Layers3,
    ["B", "C"],
    "Signature multimodal content that differentiates the social presence.",
    "One shipped combo project combining image, site, voice, music, motion, or video.",
    "Portfolio sites, animated long-form, voice/music/video workflows, and layered AI outputs.",
    "This track combines the pieces into work that is harder to copy and easier to recognize.",
    scaffoldLessons.filter((item) => item.trackId === "E")
  ),
  makeTrack(
    "F",
    "Automation & Agents",
    "Automation",
    "Can start early",
    "Ongoing after A",
    "#55bea0",
    "linear-gradient(135deg, #173b36 0%, #55bea0 54%, #d4f1df 100%)",
    CalendarClock,
    ["A"],
    "The pipeline itself: idea to draft to asset to ready-to-post, semi-automated.",
    "A semi-automated content pipeline that packages learning output into social posts.",
    "Scheduled tasks, agent workflows, content operations, review loops, and publishing prep.",
    "This makes learning compound by turning every proof of skill into a reusable content event.",
    scaffoldLessons.filter((item) => item.trackId === "F")
  )
];

export const northStar =
  "Every track increases reach and impact of Robert's social presence. Each proof-of-skill project should double as publishable content or pipeline infrastructure.";

export const goals = [
  "Interactive environments, high-quality graphics",
  "Games, high-quality graphics",
  "Visual stories with consistent characters",
  "Complex deployable websites with DB, CRUD, and APIs",
  "Creative multimodal combos with voice, image, video, and music",
  "Automation and agents for social media pipelines",
  "Midjourney portfolio site",
  "Animated long-form content and scrollytelling",
  "Maximize Cowork, skills, project context, and instructions",
  "Guides for visual models",
  "Full-potential use of AI tools and open suggestions"
];

export const toolInventory = [
  { name: "Claude Cowork + Code", status: "Owned", role: "Primary orchestration, skills, scheduled tasks, CLI build loop" },
  { name: "ChatGPT + Codex", status: "Owned", role: "Second coding agent, implementation, cross-checking builds" },
  { name: "Gemini Pro", status: "Owned", role: "Google visual models and multimodal experiments" },
  { name: "Grok", status: "Owned", role: "Alternative model, image generation, real-time research" },
  { name: "Midjourney", status: "Owned", role: "Hero images, character references, game assets" },
  { name: "ElevenLabs", status: "Owned", role: "Voice and narration" },
  { name: "Suno.ai", status: "Owned", role: "Music and soundtrack generation" },
  { name: "Topview.ai", status: "Owned", role: "AI video editing and Seedance 2.0 access" },
  { name: "GitHub + Vercel + Supabase", status: "Needs free setup", role: "Deployments, database, APIs, and full-stack practice" }
];

export const allLessons = tracks.flatMap((track) => track.lessons);

export const findTrack = (trackId: TrackId) => tracks.find((track) => track.id === trackId);

export const findLesson = (lessonId: string) => allLessons.find((lesson) => lesson.id === lessonId);

export const trackOrder: TrackId[] = ["A", "B", "C", "D", "E", "F"];

export const iconSet = { Sparkles, PenTool };
