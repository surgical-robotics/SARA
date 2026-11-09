# SARA — Project Page

Project page for SARA, intended for **https://surgical-robotics.github.io/SARA/**

## Content

Title: **SARA: Toward Surgical Agentic Robotics for Resilient Manipulation Subtasks**

The page includes the supplied abstract, system overview, method figure, and five
video galleries in this order:

| Gallery | Source files | Desktop layout |
| --- | --- | --- |
| Simulation tasks | `static/videos_sim/s_*.mp4` | 4 columns × 2 rows |
| Simulation recovery | `static/videos_sim/i_*.mp4` | 4 columns × 2 rows |
| Physical tasks | `static/videos_real/S_*.mp4` | 3 columns × 2 rows |
| Physical recovery | `static/videos_real/F_*.mp4` | 3 columns × 2 rows |
| External disturbances | `static/videos_real/I_*.mp4` | 3 columns × 2 rows |

Galleries adapt to two columns on tablets and one on narrow phones. Simulation
clips are named in numerical file order: Needle Pick and Place, Peg Transfer, Shunt Insertion, Gauze Lifting, Tissue Retraction, Threaded Needle Handover Through a Ring, Debridement, Suturing. Real-world
clips are matched by task name across all three groups, with Debridement
preceding Suturing. Research figures open
in an enlarged dialog. All videos autoplay muted, loop, and retain playback controls. Real-world clips
ending in `X1` play at 2× speed; `X2` clips play at normal speed. Browser autoplay
policies may require visitors to start playback manually. The page has no Code
link or Explore SARA section.

Video controls request `nodownload`, direct fallback media links are omitted,
and video context menus and dragging are disabled. These are interface
restrictions, not access control: publicly served media can still be retrieved,
and a public repository exposes its tracked media files.

## Real-world video state annotations

Real-world cards use synchronized borders and text labels: green for Normal
Execution, orange for Failure Recovery, and red for External Disturbance.
Intervals live in `static/js/video-states.js`, in source-video seconds (start
inclusive, end exclusive). Playback speed does not change the annotation times.
Unannotated intervals are green; seeking and looping update the state.

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
step allows up to 30 minutes for GitHub Pages to finish; this accommodates slow
deployments but cannot fix a GitHub service outage. Ubuntu is pinned to 24.04.

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
