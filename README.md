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
clips are named in numerical file order: Needle Pick and Place, Peg Transfer, Shunt Insertion, Gauze Lifting, Tissue Retraction, Threaded Needle Handover Through a Ring, Debridement, Suturing. Real-world
clips are matched by task name across all three groups, with Debridement
preceding Suturing. Research figures open
in an enlarged dialog. All videos autoplay muted and loop. Compact play/pause and fullscreen controls (when supported) appear at the
bottom right on hover or keyboard focus, and remain visible on touch devices
or while paused. Progress bars, timestamps, volume, and speed selectors are omitted. Playback
rates and mute are enforced by the page. Real-world clips
ending in `X1` play at 2× speed; `X2` clips play at normal speed. Browser autoplay
policies may require visitors to start playback manually. The page has no Code
link or Explore SARA section.

Video controls request `nodownload`, direct fallback media links are omitted,
and video context menus and dragging are disabled. These are interface
restrictions, not access control: publicly served media can still be retrieved,
and a public repository exposes its tracked media files.

## Visual design and interactions

The page uses an editorial layout with white backgrounds, dark green typography,
and green/orange/red phase colors. The text-only hero emphasizes the project
name and full title, followed by four rounded keyword labels: Surgical agentic
robotics, Sim-to-real, 8 simulation tasks, and 6 real-world tasks. Overview and Method retain the supplied scientific
figures; no additional method diagram or interactive stepper is shown.

Section titles and video task names are emphasized, while duplicate platform
labels, decorative chapter numbers, and repeated counts are omitted. Video
captions retain the physical playback speed. Each gallery heading includes only
the phase colors relevant to that gallery; the legend wraps below the heading on
small screens. Sticky gallery links and the active chapter marker help navigate
the long page.
The supplied abstract uses consistent task terminology. The overview figure shows
its upper diagram inline, cropping the unfinished placeholder panel with CSS;
the zoom dialog still opens the complete original image. The mobile layout stacks
content and videos, and reduced-motion preferences disable interface transitions.

## Video state annotations

Simulation and real-world cards use synchronized borders and text labels: green for Normal
Execution, orange for Recovery, and red for External Disturbance.
Each phase uses a thin colored video border and a lightly tinted label. Recovery
uses dark-orange text on pale orange, without an additional card outline. The
short label describes the recovery phase; the underlying events and timings are
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
