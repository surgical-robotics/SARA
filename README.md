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
clips use task numbers until descriptive task names are supplied. Real-world
clips are matched by task name across all three groups. Research figures open
in an enlarged dialog. All videos autoplay muted, loop, and retain playback controls. Real-world clips
ending in `X2` play at 2× speed; `X1` clips play at normal speed. Browser autoplay
policies may require visitors to start playback manually. The page has no Code
link or Explore SARA section.

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
- Optionally supply descriptive names for simulation tasks 01–08.

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

In the SARA repository, open **Settings → Pages** and select **Deploy from a branch**,
branch **main**, folder **/ (root)**, then save. After deployment succeeds, the
website will be available at https://surgical-robotics.github.io/SARA/.
`.nojekyll` ensures `static/` is published as-is.

This repository starts with a fresh SARA history, independent of the copied
project. Existing template acknowledgments and licensing are retained.

## Acknowledgments

Built on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template),
adopted from the [Nerfies](https://nerfies.github.io/) page.

## Website License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
