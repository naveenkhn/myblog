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

Deployment is handled by `.github/workflows/deploy.yml` on pushes to `main`.

### Required GitHub Settings

1. Go to `Settings -> Pages`.
2. Set source to `GitHub Actions`.
3. Set custom domain to `blog.naveenkhn.com`.
4. Enable `Enforce HTTPS` after certificate is issued.

## Domain

`CNAME` is committed with:

```txt
blog.naveenkhn.com
```
