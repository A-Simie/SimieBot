# SimieBot Refactor Report

I narrowed SimieBot back to the story we can defend clearly for the Auth0 hackathon: a secure, connected-account assistant that acts on behalf of the user across real services.

## The core goal

The core goal is to build an AI assistant that bridges the gap between "helpful" and "dangerous" by using two distinct levels of agentic security.

At the low-risk level, the assistant should help with ordinary digital-life tasks like summarizing email, checking calendar context, coordinating across connected services, and acting as a personal digital proxy.

At the high-risk level, the assistant should only be allowed to perform sensitive or irreversible actions when those actions are protected by stronger authorization. The value is not just automation. The value is safe automation with the right approval boundary.

## The project description

SimieBot is a highly secure, autonomous AI assistant designed to handle daily digital life. It can summarize morning emails, coordinate across connected apps, and grow into creator workflows. But unlike a standard chatbot, SimieBot is intended to be trusted with higher-stakes actions as well. By leveraging Auth0 Token Vault and CIBA-style asynchronous authorization through a LangGraph Server architecture, SimieBot can securely orchestrate APIs across a user's digital life while ensuring that financial transactions or other permanent actions require explicit real-time approval.

## End-to-end workflow direction

The creator workflow should be built around Amazon Nova as the planning layer and FFmpeg as the execution layer.

The intended end-to-end path is:

- Auth0-connected Google Drive to access the user's source media
- Amazon Nova to analyze the asset and generate edit instructions
- FFmpeg to execute those edit instructions and produce the output asset
- Auth0-connected YouTube to publish on behalf of the user

That means Auth0 matters at both ends of the workflow:

- Auth0 is used to securely access the user's source asset from Drive
- Auth0 is used again to publish to the user's YouTube account

Nova and FFmpeg sit in the middle as the intelligence and execution layers, but the real product story is still the secure user-delegated workflow from one user-owned system to another.

Any future high-stakes workflow should follow the same principle. It should be tied to a real user-authorized provider and should only exist if Auth0 materially improves the safety and trust model.

## What I changed

I kept the delegated architecture because that part was strong.

- I kept the router-based graph shape.
- I kept the specialist-node idea.
- I kept Gmail, Calendar, user info, and the connected-account flow.
- I integrated SerpAPI for secure, grounded web searching to verify facts before acting.
- I removed the features that were stretching the project away from the Auth0 story.
- I switched the model layer from OpenAI to Amazon Nova 2 Lite on Bedrock.
- I updated the Bedrock model ID to the supported inference-profile form.
- I made the placeholder creator workflows honest about being planned instead of pretending they were fully implemented.
- I fixed the interrupt resume issue so authorization resumes are less fragile.

## Why I made these changes

I wanted the project to feel more coherent and more credible.

The project had a good architecture, but the feature scope had drifted into places that do not really help the Auth0 judging story. I pulled it back toward workflows where Auth0 is clearly essential: connected accounts, Token Vault, scoped access, and acting on behalf of the user.

## Features I intentionally removed or demoted

- wallet scanner
- form filler
- bibliography
- generic RAG retrieval
- semantic video search as a core feature

I removed the weak crypto direction entirely so the project stays focused on connected-account creator workflows that are actually in scope.

I kept the creator direction, but reframed it properly:

- get media from a connected account like Drive or Slack
- plan edits with Nova
- execute the edit with FFmpeg
- publish through a connected user account like YouTube

That is a much better fit for Auth0 than a generic media-processing feature.

## Feature guardrail

Any new feature idea should pass one simple test:

- Does Auth0 materially matter to the workflow?
- Is the assistant acting on behalf of the user across a protected account, service, or approval boundary?
- Does the feature become more trustworthy or more powerful because of connected accounts, Token Vault, scoped access, or stronger approval?

If the answer is no, I should seriously consider dropping it.

If a feature does not align with that guide, it should be abandoned rather than forced into the product.

The kind of feature that does align with the guide is something like:

- message my mom at 10 AM while I am asleep

That fits the intended guardrail because it is an on-behalf-of-user action with real-world consequences, and it becomes much more compelling when it is done through the right identity, authorization, and approval model.

That is the standard I want to use when evaluating future additions.

## Mistakes I corrected

### 1. Feature scope drift

Some of the original features sounded exciting, but they were not helping the case we need to make.

For example, `wallet-scanner.ts` was pointing toward low-level chain analysis. That may be interesting in isolation, but it does not naturally showcase Auth0 in this project, so it should stay out of scope.

Another example was `form-filler.ts`. That was drifting toward computer-use style browser automation. It is a different category of product problem, and it weakens the Auth0 narrative instead of strengthening it.

### 2. Auth0 setup confusion

The app also had the kind of Auth0 confusion that is easy to miss until the popup flow breaks.

The most important correction was separating the app's custom API audience from the Auth0 Management API audience. The app should not use the Management API audience as its main `AUTH0_AUDIENCE`. It needs its own custom API audience for the LangGraph/app token flow.

I also made sure the Token Vault exchange uses the Custom API Client credentials rather than the regular web app credentials. That distinction matters a lot once connected-account authorization starts happening.

## Two concrete examples

### Example 1: a feature mistake

I removed the bibliography direction because it did not support the strongest hackathon story. It was a generic AI productivity idea, not an Auth0-centered connected-account workflow. Even if it were implemented well, it would still distract from the identity and delegated-access value we need to highlight.

### Example 2: an Auth0 mistake

I corrected the Bedrock/Auth0 runtime setup so the model and connected-account flow line up with the actual deployment story. On the Auth0 side, that meant making the env shape reflect the real separation between:

- the regular web app credentials
- the custom API audience
- the custom API client used for Token Vault exchange

Without that separation, the Google/Gmail authorization flow becomes brittle and hard to reason about.

## Current state of the project

The project is now in a healthier place.

- The architecture is still delegated and extensible.
- Gmail and Calendar remain part of the real assistant path.
- The Auth0 story is sharper.
- The misleading or weak-scope features are out of the way.
- The remaining planned tools are now framed honestly.

## What this repo is trying to be now

SimieBot is now better framed as a secure connected-account assistant that can:

- access Gmail on behalf of the user
- read calendar context
- search the web via SerpAPI to ground actions in real-time facts
- full Google Drive lifecycle (list, download, and create/save)
- use Auth0-protected identity context
- grow toward creator workflows across Drive, Slack, Nova, FFmpeg, and YouTube
- stay focused on creator and connected-account workflows that are already in scope

That is a much stronger foundation than trying to be every kind of agent at once.
