---
title: "How to Manage Multiple Git and GitHub Accounts Without Messing Up Your Repos"
summary: "A practical guide to handling multiple Git identities without mixing up commit authors, remotes, or GitHub accounts across different repositories."
publishDate: 2021-06-18
tags:
  - git
  - github
  - developer-workflow
  - configuration
featured: false
---

Working across personal projects, company repositories, side experiments, and open source often means one thing: multiple Git and GitHub identities on the same machine.

That setup is common, but it comes with a real cost when the configuration is not handled carefully. The wrong Git identity can slip into a repository, pushes can fail for confusing reasons, and a lot of time can be wasted debugging what turns out to be an avoidable account or configuration issue.

This post is a practical guide to avoiding those mistakes. It also explains some of the Git behavior underneath, so you can understand why these issues happen instead of only memorizing fixes.

Short on time? Use these quick links:

- [Safety checks before you push](#4-safety-checks-before-you-push)
- [Global vs repository-level Git config](#5-global-vs-repository-level-git-config)
- [Ways to manage multiple accounts](#6-ways-to-manage-multiple-accounts)
- [How to inspect the current repo configuration](#8-how-to-inspect-the-current-repo-configuration)
- [Common problems and how to fix them](#9-common-problems-and-how-to-fix-them)
- [Quick pre-push checklist](#10-quick-pre-push-checklist)

## 1. Introduction

Using multiple Git and GitHub accounts is normal. A lot of developers have:

- One personal GitHub account
- One or more work GitHub accounts
- Different repositories with different access rules
- Different authentication methods across projects

The problem is not having multiple accounts. The problem is losing track of which identity Git is using in a given repository.

That confusion shows up in two places:

- **Commit identity**: `user.name` and `user.email`
- **Authentication identity**: the account or credential used when talking to GitHub

Those two are related, but they are not the same thing. That distinction is worth understanding early.

## 2. Why Git Account Mix-Ups Happen

Git is happy to work with multiple repositories, but it does not automatically know which identity you intended for each one.

Most problems happen because of one or more of these reasons:

- A global Git config applies to every repository unless overridden locally
- Cached HTTPS credentials silently authenticate as the wrong GitHub account
- SSH keys are present, but the wrong key gets selected for a repository
- The remote URL points to a repository or account path you were not expecting
- You assume a previous repo’s setup also applies to the current one

Git is not really “confused” here. It is just using the information currently available:

- config from `.git/config`
- config from your global Git settings
- the remote URL
- your local credential helper or SSH agent

If those pieces do not match your intent, the result looks like random behavior even though Git is behaving consistently.

## 3. What Can Go Wrong

When multiple identities are involved, the failure modes are usually predictable.

### Wrong commit author

Your commit may show the wrong `user.name` or `user.email`, especially if a personal global config leaks into a work repository.

### Permission denied during push

This is common when the repo remote is correct, but GitHub authentication is happening through the wrong account.

Example:

```bash
remote: Permission to company/project.git denied to personal-account.
fatal: unable to access 'https://github.com/company/project.git/': The requested URL returned error: 403
```

### Pushing to the wrong remote

Sometimes the repository itself is pointed at the wrong origin, especially after cloning, renaming, or reusing an old local folder.

### Confusing project history

Even if a push succeeds, the wrong author identity in commits can make repository history look messy and can cause confusion in teams, audits, or contribution tracking.

## 4. Safety Checks Before You Push

If you only remember one section from this post, make it this one.

Before pushing from a repo where identity matters, check these things:

### Check the remote

```bash
git remote -v
```

This tells you:

- which repository you are talking to
- whether the remote uses HTTPS or SSH
- whether the remote path matches the intended owner

### Check the repo-level identity

```bash
git config --get user.name
git config --get user.email
```

If these return the wrong values, your commits will carry the wrong author information.

### Check where the config came from

```bash
git config --show-origin --get user.name
git config --show-origin --get user.email
```

This is especially useful because it tells you whether the value came from:

- your global config
- your local repository config
- some included config file

### Check the credential helper

```bash
git config --show-origin --get credential.helper
```

If you are using HTTPS, this helps you understand how credentials may be cached and reused.

### Check the current branch

```bash
git branch --show-current
```

Not directly related to account identity, but it is part of the same “do not push blindly” habit.

## 5. Global vs Repository-Level Git Config

This is one of the most important concepts in a mixed-account setup.

### Global config

Global config lives in your user-level Git settings and applies everywhere unless overridden.

Examples:

```bash
git config --global user.name "Naveen Kumar"
git config --global user.email "me@example.com"
```

This is convenient, but it becomes risky if your machine is used for both personal and work repositories.

### Repository-level config

Repository-level config lives inside `.git/config` for a specific repo.

Examples:

```bash
git config user.name "Naveen Kumar"
git config user.email "naveen@company.com"
```

This is usually the safer option when you use multiple identities. It makes the repository explicit about which author identity it expects.

### Practical rule

A simple rule that works well:

- Use global config only for defaults you truly want everywhere
- Set `user.name` and `user.email` locally inside repos where identity must differ

That avoids accidental author mix-ups without making your whole Git setup overly complex.

## 6. Ways to Manage Multiple Accounts

There is no single “correct” setup. What matters is that your approach is predictable.

### Option 1: Separate SSH keys

A common approach is to keep:

- one SSH key for personal GitHub
- one SSH key for work GitHub

Then map them through `~/.ssh/config` using different host aliases.

Example:

```sshconfig
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal

Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
```

Then repository remotes can use different aliases:

```bash
git@github-personal:naveenkhn/myblog.git
git@github-work:company/internal-tooling.git
```

This makes account intent visible in the remote itself.

### Option 2: HTTPS with PATs

Some teams prefer HTTPS instead of SSH.

In that case, GitHub authentication usually relies on:

- a credential helper
- a Personal Access Token (PAT)
- cached credentials per host or account context

This works fine, but it is more likely to produce “wrong cached account” issues if you switch frequently between identities.

### Option 3: Repo-specific Git config

Even if authentication differs repo by repo, commit identity can still be controlled safely at the repository level.

That means you can keep your authentication method flexible while still protecting commit authorship.

### Option 4: Included config files

Advanced users sometimes split Git config into multiple files and include them conditionally. That can work well, but it adds another layer of indirection.

If your setup is not yet stable, start simpler first.

## 7. A Safe Setup You Can Follow

If you want something practical and low-risk, this is a good baseline:

1. Keep a clear global default only if it is truly safe
2. Set `user.name` and `user.email` locally in repositories that need different identities
3. Make the remote URL easy to verify
4. Use either:
   - separate SSH keys with clear host aliases, or
   - HTTPS with intentional credential management
5. Check the repo config before the first push from a new repository

For example, after cloning a work repo:

```bash
git remote -v
git config user.name "Your Work Name"
git config user.email "you@company.com"
git config --show-origin --get user.email
```

That small habit prevents a lot of cleanup later.

## 8. How to Inspect the Current Repo Configuration

Here is a compact set of commands worth remembering.

### Show remotes

```bash
git remote -v
```

### Show commit identity

```bash
git config --get user.name
git config --get user.email
```

### Show where those values came from

```bash
git config --show-origin --get user.name
git config --show-origin --get user.email
```

### Show all relevant repo config

```bash
git config --local --list
```

### Show global defaults

```bash
git config --global --list
```

### Check which SSH identity is being used

If your remote uses an SSH alias, you can test it directly:

```bash
ssh -T git@github-work
```

or:

```bash
ssh -T git@github-personal
```

This does not replace checking the repo remote, but it helps confirm the SSH side of the setup.

## 9. Common Problems and How to Fix Them

### Problem: wrong commit author before push

If the commit is local and not yet pushed, you can usually fix the latest commit author:

```bash
git commit --amend --reset-author
```

Or set the correct repo identity first:

```bash
git config user.name "Correct Name"
git config user.email "correct@example.com"
git commit --amend --reset-author
```

### Problem: wrong remote URL

Inspect first:

```bash
git remote -v
```

Then correct it:

```bash
git remote set-url origin git@github-work:company/project.git
```

or:

```bash
git remote set-url origin https://github.com/company/project.git
```

### Problem: HTTPS push uses the wrong cached account

This is one of the most common issues with multiple GitHub accounts over HTTPS.

Typical symptom:

```bash
remote: Permission to company/project.git denied to personal-account.
fatal: unable to access 'https://github.com/company/project.git/': The requested URL returned error: 403
```

The repo may be correct. The credential is not.

On macOS, for example, you may need to clear the GitHub credential from the keychain and authenticate again with the intended account and PAT.

### Problem: SSH key is not the one you expected

If SSH is in use, check:

- the remote URL
- your `~/.ssh/config`
- which host alias the repo uses
- whether the right key is loaded

This is where consistent SSH aliases help a lot.

## 10. Quick Pre-Push Checklist

Before pushing from a repo where identity matters, quickly ask:

- Is this the right repository?
- Is the remote URL correct?
- Is the branch correct?
- Is `user.name` correct for this repo?
- Is `user.email` correct for this repo?
- Am I authenticating with the intended GitHub account?

This takes less than a minute and prevents a surprising number of mistakes.

## 11. Conclusion

Managing multiple Git and GitHub accounts is less about clever setup and more about consistency.

The safest approach is usually:

- keep identity explicit at the repo level
- make the remote easy to inspect
- understand whether authentication is happening through SSH or HTTPS
- verify before pushing instead of cleaning up after the fact

If you build that habit, switching between work and personal repositories becomes routine instead of risky.
