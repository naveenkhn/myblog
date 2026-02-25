---
title: How to Add a Snake Animation to Your GitHub Contributions
summary: Learn how to turn your GitHub contributions into a snake animation and automate updates.
publishDate: 2026-02-25
tags:
  - github
  - automation
  - animation
featured: true
---

The GitHub "snake" graphic is a simple way to visualize your contribution graph. You can generate it automatically with a GitHub Action and publish it as SVG/GIF.
![Snake animation from my GitHub contributions](https://raw.githubusercontent.com/naveenkhn/naveenkhn/output/github-contribution-grid-snake.svg)

## What you need

1. A public repository for workflow automation.
2. GitHub Actions enabled.
3. A profile README (`username/username` repository) if you want to display it on your profile.

## 1) Add the workflow

Create `.github/workflows/snake.yml`:

```yaml
name: Generate Snake

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk/svg-only@v3
        with:
          github_user_name: naveenkhn
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark

      - name: Push generated files
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Replace `naveenkhn` with your GitHub username.

## 2) Reference the generated image

After workflow runs, use this in your README:

```md
![GitHub Snake](https://raw.githubusercontent.com/naveenkhn/naveenkhn/output/github-contribution-grid-snake.svg)
```

For dark mode:

```md
![GitHub Snake Dark](https://raw.githubusercontent.com/naveenkhn/naveenkhn/output/github-contribution-grid-snake-dark.svg)
```

## 3) Keep it reliable

1. Use `workflow_dispatch` for manual reruns.
2. Keep schedule daily to avoid noisy commits.
3. Confirm repository is public if you want raw GitHub URLs to render everywhere.

The result is an auto-updating visual badge that makes your activity section more interactive without manual effort.
