# blog.naveenkhn.com

Static technical blog for `blog.naveenkhn.com`, built with Astro and deployed via GitHub Pages.

## Tech Stack

- Astro
- MD/MDX content collections
- GitHub Actions (build + deploy to Pages)
- Custom domain: `blog.naveenkhn.com`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Build and Preview

```bash
npm run build
npm run preview
```

## Content Workflow

All posts are in `src/content/tech/`.

Create a new post file:

```md
---
title: Your post title
summary: One-line summary of the post
publishDate: 2026-02-25
tags:
  - github
  - automation
featured: false
draft: false
---
```

Current post route pattern:
- `src/content/tech/my-post.md` -> `/posts/my-post/`

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`.

### Deployment Flow

1. GitHub Actions checks out the repository.
2. Node.js is installed and npm dependencies are restored.
3. `npm run build` generates the static site into `dist/`.
4. The workflow uploads `dist/` as the GitHub Pages artifact.
5. The deploy job publishes that artifact to GitHub Pages.

### Required GitHub Settings

1. Go to `Settings -> Pages`.
2. Set source to `GitHub Actions`.
3. Set custom domain to `blog.naveenkhn.com`.
4. Enable `Enforce HTTPS` after certificate is issued.

## Page Views

Page views are fetched client-side from the shared page-view counter API in `src/layouts/BaseLayout.astro`.

- `site` is fixed as `blog`
- `page` is derived from `window.location.pathname`
- paths are normalized to include a trailing slash
- the request is sent to the `/visit/` endpoint on page load
- that same request increments the counter for the `(site, page)` key and returns the current `views` value
- the returned value is rendered in the footer

Because tracking is route-based, new posts are counted automatically without adding per-post configuration.

## Domain

`CNAME` is committed with:

```txt
blog.naveenkhn.com
```
