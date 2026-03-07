---
title: "Learn the Benefits of Serverless Functions with AWS Lambda: A Reusable Page View Counter"
summary: "A practical demo of why serverless functions are useful—using a reusable page-view counter built with AWS Lambda + API Gateway + DynamoDB."
publishDate: 2023-10-03
tags:
  - aws
  - serverless
  - lambda
  - dynamodb
featured: false
---

Serverless functions let you ship event-driven features without running servers. In this post, you’ll learn what serverless functions are, why they matter in modern cloud workflows, and how to apply the idea with a practical AWS example.

By the end, you’ll understand:

- When serverless functions are a good fit (and when they aren’t)
- The core architecture behind many serverless utilities (HTTP → function → managed storage)
- How a reusable `(site, page)` page-view counter works end-to-end on AWS

Code repo: https://github.com/naveenkhn/serverless_utils/tree/main/pageview_counter

## What are serverless functions?

**Serverless functions** (often called *FaaS — Function as a Service*) let you run small pieces of code without managing servers. You deploy a function, choose how it’s triggered (HTTP request, queue message, file upload, cron schedule), and the cloud provider handles provisioning, scaling, and the runtime.

On AWS, this commonly looks like:

- **AWS Lambda** for compute
- **API Gateway** for HTTP endpoints
- A managed store like **DynamoDB** (or S3/SQS/etc.) for state

## Why they matter today

Serverless functions are a great fit for features that are **event-driven** and don’t justify running a full backend: counters, contact forms, webhook receivers, scheduled jobs, lightweight APIs, and automation.

They’re popular because they give you:

- **No server management**: no instances, patching, or uptime babysitting
- **Pay-per-use**: you’re billed when the function runs, not while it sits idle
- **Automatic scaling**: traffic spikes don’t require capacity planning
- **Fast iteration**: deploy a focused unit of code tied to a trigger (like HTTP)

## Where AI fits (and where it doesn’t)

AI has increased the number of “glue workflows” people want to automate: ingest an event (webhook/form/email), run a bit of compute (summarize/classify/extract), then store results or trigger a follow-up.

Serverless functions fit that **event → compute → side-effect** pattern well when the work is short-lived and on-demand. For heavier workloads (long-running jobs, large batch processing, GPU inference), containers or dedicated managed services are often a better fit.

## What we’ll build (a reusable page view counter)

We’ll build a simple **page view counter** as a practical demonstration of these benefits.

What you’ll end up with:

- A serverless function behind an HTTP endpoint
- A durable counter stored in DynamoDB
- A reusable key design so the same backend supports multiple sites and pages

Code repo: https://github.com/naveenkhn/serverless_utils/tree/main/pageview_counter

## Architecture

At a high level:

```
Browser (fetch)
  -> API Gateway (GET /visit)
    -> Lambda (increment)
      -> DynamoDB (atomic ADD)
```

Key idea for reuse: store counts by `(site, page)` so one backend supports multiple sites and routes.

Example keys:

- `portfolio::/`
- `blog::/`
- `blog::/posts/my-post/`

## Data model (DynamoDB)

You can keep the table minimal:

- Table: `pageview_counter`
- Partition key attribute: `page` (String)
- Attributes:
  - `page`: `"blog::/posts/my-post/"`
  - `views`: `123`

DynamoDB’s `ADD` operation makes increments **atomic**, which is exactly what you want when multiple visitors hit at the same time.

## Lambda handler (the core logic)

The handler:

1) Reads `site` and `page` from query parameters
2) Validates and normalizes the path
3) Increments `views` atomically
4) Returns JSON for the UI

Snippet (simplified):

```py
site = (qs.get("site") or "").strip().lower()
page = normalize(qs.get("page") or "/")
if not site:
    return 400

key = f"{site}::{page}"

resp = table.update_item(
  Key={"page": key},
  UpdateExpression="ADD #v :incr",
  ExpressionAttributeNames={"#v": "views"},
  ExpressionAttributeValues={":incr": 1},
  ReturnValues="UPDATED_NEW",
)

return {"views": int(resp["Attributes"]["views"]), "site": site, "page": page}
```

## AWS SAM template (infrastructure as code)

AWS SAM lets you define infrastructure as code for:

- Lambda function
- API Gateway route
- DynamoDB table
- IAM permissions (Lambda can update the table)

Snippet (shape of it):

```yaml
Events:
  PageviewApi:
    Type: Api
    Properties:
      Path: /visit
      Method: get
Policies:
  - DynamoDBCrudPolicy:
      TableName: pageview_counter
```

## Deploy (SAM CLI)

From the `pageview_counter` directory:

```bash
sam build
sam deploy --guided
```

After deploy, you’ll get an API URL like:

```
https://<api-id>.execute-api.<region>.amazonaws.com/Prod/visit/
```

## Test the endpoint

Increment blog home:

```bash
curl "https://<api>/Prod/visit/?site=blog&page=/"
```

Increment a specific post:

```bash
curl "https://<api>/Prod/visit/?site=blog&page=/posts/my-post/"
```

## Suggestions: frontend integration patterns

This section is intentionally recommendations only. The backend API stays the same, and you can integrate it however you prefer.

### React (portfolio)

- Call once on mount
- Use `window.location.pathname` for the `page`
- Normalize trailing slashes to keep keys consistent

```js
const site = 'portfolio';
const path = window.location.pathname || '/';
const page = path === '/' || path.endsWith('/') ? path : `${path}/`;

fetch(`${API}?site=${site}&page=${encodeURIComponent(page)}`)
  .then((r) => r.json())
  .then((d) => setViews(d.views));
```

### Static sites (Astro, etc.)

- Fetch client-side at runtime (not at build time)
- Render into a placeholder element (footer, header, post meta)

## Suggestions: security and abuse controls

This endpoint is often public by default. That’s fine for demos and personal utilities, but it also means anyone can script requests and inflate counts.

Optional controls (pick what fits your needs):

- API keys + throttling in API Gateway
- Origin allowlist for browser usage (CORS helps browsers, but is not auth)
- Split “read” vs “increment” endpoints if you want stricter write protection

## Suggestions: gotchas

- Path normalization: `/posts/x` vs `/posts/x/` should not create two counters.
- SPA routing: if your app changes routes without a full reload, a “footer mount” won’t increment per route.
- Dev mode double calls: some dev setups can run effects twice, so don’t panic if local testing increments more than expected.

## Wrap-up

This is one example, but the pattern generalizes nicely: a serverless function + a managed data store can power lots of personal-site utilities without running a traditional backend.

Full code: https://github.com/naveenkhn/serverless_utils/tree/main/pageview_counter
