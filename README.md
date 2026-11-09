# SARA — Project Page

Project page for SARA, intended for **https://surgical-robotics.github.io/SARA/**

The page is currently a **placeholder**: the layout and all section skeletons are in place,
but every figure, video and paragraph still needs to be filled in.

## Status

- [ ] Paper title, author list, venue (`index.html`, hero section + all meta tags)
- [ ] Abstract
- [ ] Research questions
- [ ] Method / pipeline description
- [ ] Teaser image → `static/images/teaser.png`
- [ ] Pipeline figure → `static/images/pipeline.png`
- [ ] Social preview image (1200×630) → `static/images/social_preview.png`
- [ ] Favicon → `static/images/favicon.ico`
- [ ] Demo videos → `static/videos/*.mp4`
- [ ] Paper PDF → `static/pdfs/`
- [ ] Paper / arXiv / code links in the hero section
- [ ] BibTeX entry

## Adding media

Every placeholder box in `index.html` has a commented-out `<img>` or `<video>` tag
directly above it showing the exact markup to use. Drop the file into the right
`static/` folder, then swap the `<div class="media-placeholder">` for that tag.

Rows are Bulma `columns` blocks — add or remove `<div class="column is-one-third">`
(or `is-half`) children to change how many items sit side by side.

Keep videos small: compress before committing, and use YouTube for anything over ~10 MB.
Compress images with [TinyPNG](https://tinypng.com).

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
