# SARA — Project Page

Project page for SARA, intended for **https://surgical-robotics.github.io/SARA/**

## Content

Title: **SARA: Toward Surgical Agentic Robotics for Resilient Manipulation**

The page includes the supplied abstract, system overview, method figure, and five
video galleries in this order:

| Gallery | Source files | Desktop layout |
| --- | --- | --- |
| Simulation tasks | `static/videos_sim/s_*.mp4` | 2 columns × 4 rows |
| Simulation recovery | `static/videos_sim/i_*.mp4` | 2 columns × 4 rows |
| Physical tasks | `static/videos_real/S_*.mp4` | 2 columns × 3 rows |
| Physical recovery | `static/videos_real/F_*.mp4` | 2 columns × 3 rows |
| External disturbances | `static/videos_real/I_*.mp4` | 2 columns × 3 rows |

Galleries use two columns above 760px and one column on smaller screens.
Video sections share the same 1120px maximum container width as the research
figures, aligning their left and right edges. Simulation
clips are named in numerical file order: Needle Pick and Place, Peg Transfer, Shunt Insertion, Gauze Lifting, Tissue Retraction, Needle Handover Through a Ring, Debridement, Suturing. Real-world
clips are matched by task name across all three groups, with Debridement
preceding Suturing. The physical ring-handover task uses the shorter caption
`Threaded Needle Handover` in all three groups. Research figures open
in an enlarged dialog. Videos autoplay muted and loop when visible. Offscreen
videos and videos in hidden tabs pause and resume from their current position when
visible again; explicit manual pauses are preserved. While fullscreen is active,
only that video's playback continues. Videos request metadata preload, with
autoplay managed by JavaScript instead of starting all 34 native players at once.
A compact seek bar with
play/pause and fullscreen controls (when supported) appears along the bottom only
on hover or keyboard focus. Touching a video reveals the controls for three seconds;
dragging keeps them available until the interaction ends. The native range input
supports pointer and keyboard seeking, using source-video seconds so phase labels
and the configured playback rate remain aligned. Elapsed and total source-video
time appear beside the seek bar. While the controls are visible and video is playing,
the seek bar follows the media clock on every animation frame; hidden controls do
not run their own animation loops. Volume and speed selectors are omitted. Playback
rates and mute are enforced by the page. Real-world clips
ending in `X1` use browser playback rate 2; `X2` clips already contain footage
accelerated to 2× and use browser playback rate 1. All physical video captions
therefore display `2× speed`, describing the effective speed of the demonstration.
Browser autoplay
policies may require visitors to start playback manually. The page has no Code
link or Explore SARA section.

Video controls request `nodownload`, direct fallback media links are omitted,
and video context menus and dragging are disabled. These are interface
restrictions, not access control: publicly served media can still be retrieved,
and a public repository exposes its tracked media files.

## Visual design and interactions

The page uses an editorial layout with white backgrounds, dark green typography,
and green/amber/red phase colors. The text-only hero emphasizes the project
name and full title, followed by four rounded keyword labels: Surgical agentic
robotics, Sim-to-real, 8 simulation tasks, and 6 real-world tasks. Overview and Method retain the supplied scientific
figures; no additional method diagram or interactive stepper is shown.

The visible hero wordmark omits the colon; the complete title retains it in
metadata and accessible text. The SARA wordmark is limited to 104px on desktop
and 68–88px on mobile, giving the full research title more visual weight.
The SARA wordmark uses regular-weight Georgia italic in deep green (`#244f3e`),
with a small pale-green dot that echoes the navigation logo. The full research title, including Resilient, uses a consistent
dark color, sans-serif font, upright style, and weight, with balanced wrapping and
relaxed letter spacing.

Simulation and Real-world experiments use unnumbered section headings, matching
Abstract and Method. Gallery numbering restarts within each section: Simulation
uses 1 Normal Execution and 2 Failure Recovery; Real-world experiments uses
1 Normal Execution, 2 Failure Recovery, and 3 External Disturbance. Compact
number badges also appear in the group headings, with matching numbers in the
sticky gallery navigation. Each link always carries its category's pale background,
colored number, and a simple circular icon: a green check for normal execution,
an amber return arrow for recovery, and a red incoming-force symbol for disturbance.
The icons supplement the text labels and are hidden from assistive technology.
The current group uses a stronger matching tint, colored text, and a bottom rule;
hovering a link also strengthens its category tint.
Horizontal rules, additional spacing, and very light category backgrounds separate
groups: green (`#fafdfb`) for normal execution, yellow (`#fffdf7`) for recovery, and
red (`#fffafa`) for external disturbance. These near-white backgrounds identify the
gallery category, while video borders and labels continue to show the current
playback phase. Backgrounds extend into the gutters without changing the video
widths or their alignment with the research figures. Duplicate
platform labels and repeated counts remain omitted. Video
captions show the effective physical demonstration speed. Each video's state label and task name
share the same 16px type size on desktop and mobile, with slightly heavier task names.
Video captions and attribute labels have transparent backgrounds, allowing the
group tint to show through; attributes retain thin outlines. Fullscreen captions
use light text against the dark player background.
Each gallery heading includes only
the phase colors relevant to that gallery; the legend wraps below the heading on
small screens. Sticky gallery links and the active chapter marker help navigate
the long page.
The supplied abstract uses consistent task terminology and appears as one paragraph,
sharing the full container width with the overview figure. An italic research
question introduces Method: "Can emerging coding agents deliver augmented dexterity
across diverse surgical tasks and remain reliable when failures occur?" The question shares
the figure's full width, with justified text and no bold emphasis. The overview figure shows
its upper diagram inline, cropping the unfinished placeholder panel with CSS;
the zoom dialog still opens the complete original image. The mobile layout stacks
content and videos, and reduced-motion preferences disable interface transitions.

## Task attributes

All 34 simulation and real-world cards show two neutral outlined labels immediately
after the task name, including recovery and disturbance clips: Unimanual/Bimanual
and Rigid/Deformable/Rigid + deformable. Labels sit on the same line when space allows
and wrap naturally on narrow screens or after long task names. Corresponding clips
share the nominal task's attributes within each platform. Arm coordination follows
the active manipulators in the nominal demonstration; object properties refer to the manipulated
objects, excluding passive supports and robot instruments. Rigid + deformable
covers the needle together with its thread and, for suturing, the tissue interaction.

Attributes were initially drafted from sampled video frames and updated with the
author's corrections. Debridement is confirmed as Deformable in both simulation
and real-world demonstrations.

| Task | Simulation | Real world |
| --- | --- | --- |
| Needle Pick and Place | Unimanual · Rigid | Unimanual · Rigid |
| Peg Transfer | Unimanual · Rigid | Unimanual · Rigid |
| Shunt Insertion | Unimanual · Deformable | Unimanual · Deformable |
| Gauze Lifting | Unimanual · Deformable | — |
| Tissue Retraction | Unimanual · Deformable | — |
| Needle Handover Through a Ring | Bimanual · Rigid + deformable | Bimanual · Rigid + deformable |
| Debridement | Unimanual · Deformable | Unimanual · Deformable |
| Suturing | Bimanual · Rigid + deformable | Bimanual · Rigid + deformable |

## Video state annotations

Each video retains a thin, dynamic 2px border and a compact dot with the current
phase label above it. Normal Execution uses green (`#28764f`), Failure Recovery
uses amber yellow (`#b8860b`), and External Disturbance uses red (`#d52222`).
Legends and navigation icons use the same palette. Recovery text uses a darker
amber (`#805d00`) for readability on the light backgrounds. Borders indicate the
current playback phase, while the very pale section backgrounds identify the
category of the complete demonstration.

The extra segmented timeline has been removed. Phase labels and borders follow
media events, with DOM writes only when the phase changes and no animation loop.
Seeking, looping, and resuming update the phase. Fullscreen labels remain light
against the dark player background. The hover controls still provide a smooth
seek bar, elapsed/total time, play/pause, and fullscreen; hidden controls skip
progress repainting. Visible-only autoplay and the existing playback rates remain
unchanged.
Intervals live in `static/js/video-states.js`, in source-video seconds (start
inclusive, end exclusive). Playback speed does not change the annotation times.
Unannotated intervals are green; seeking and looping update the state.

Simulation recovery clips (`i_1`–`i_8`) use these intervals, respectively:
2–9; 3–11; 8–14; 2–8; 3–9; 2–8 and 15–20; 10–16 and 24–32; 2–14 seconds.
Simulation task clips (`s_1`–`s_8`) remain green throughout.

Debridement recovery (`F`): 11–19 seconds. Debridement external disturbance
(`I`): 27–33 and 43–46 seconds disturbance, 33–43 and 46–53 seconds recovery.
All other intervals show normal execution.

## Media preparation

- Overview: `static/images/abstract.png` (the supplied image still includes a placeholder panel).
- Method: `static/images/sara_pipeline.png`.
- Video posters: `static/images/posters/`.
- Published physical videos: `static/videos_web/` (H.264, original resolution, fast-start MP4).
- Original physical videos: `static/videos_real/` (preserved locally and ignored by Git).
- Simulation videos: `static/videos_sim/` (published directly).

To regenerate posters and web copies after changing source footage, install
FFmpeg and run from this directory:

```bash
python3 scripts/prepare_media.py
```

The three physical Suturing clips and posters use the approved 1536×864 source
crop at (384, 214): remove 384 pixels from the left, 214 from the top, and 2 from
the bottom, then resize to 1920×1080. This preserves 16:9 and enlarges the pad by
1.25×. Original footage, timing, and configured playback speeds are preserved.

The script preserves source files, processes two clips at a time, and skips
up-to-date outputs. Commit generated `static/videos_web/` and
`static/images/posters/` together with the page. To add or remove videos, edit the
corresponding static gallery in `index.html`; the page has no build dependency.

## Remaining publication details

- Confirm author list, affiliations, venue, and paper URL before adding them.
- Add the final BibTeX once citation details are available.
- Replace the overview image's placeholder panel with final keyframes.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Repository and deployment

Repository: https://github.com/surgical-robotics/SARA

This `website/` directory is the local Git repository root. Run Git commands here,
so `index.html`, `static/`, and `.nojekyll` appear at the root of the GitHub repository.

The local `origin` should point to `https://github.com/surgical-robotics/SARA.git`.
Verify with `git remote -v` before pushing.

After committing your changes, publish with:

```bash
git push -u origin main
```

If the remote already contains an initial README commit, fetch and merge it first:

```bash
git fetch origin
git merge origin/main --allow-unrelated-histories
```

Resolve any conflicts, commit the resolution, and push again. Do not force-push.

In the SARA repository, open **Settings → Pages** and change **Source** to
**GitHub Actions**. The workflow `.github/workflows/pages.yml` runs on pushes to
`main` and can be started manually from **Actions → Deploy SARA website → Run workflow**.
Do not also use branch-based publishing with this workflow.

The build runs `python3 scripts/build_site.py`, validates all local page assets,
and uploads only the publishable `_site/` directory. Original physical footage,
Git metadata, scripts, and unused template dependencies are excluded. The deploy
step uses GitHub Pages' maximum wait of 10 minutes. Larger timeout values are
clamped by the deploy action and cannot extend this service limit. Ubuntu is
pinned to 24.04. If upload succeeds but deployment times out, inspect the full
Deploy to GitHub Pages log for the deployment ID and repeated status values;
the warning annotations alone do not identify why publication is stalled.

To validate the artifact locally:

```bash
python3 scripts/build_site.py
```

After a successful deployment, visit https://surgical-robotics.github.io/SARA/.
If deployment times out, inspect the deploy log and GitHub Pages service status;
the live site may still show the last successful version.

This repository starts with a fresh SARA history, independent of the copied
project. Existing template acknowledgments and licensing are retained.

## Acknowledgments

Built on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template),
adopted from the [Nerfies](https://nerfies.github.io/) page.

## Website License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
