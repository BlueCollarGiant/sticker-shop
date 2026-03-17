# Docs Audit Report

## Executive Summary (5 bullets max)
- The docs define a basic REST API skeleton (JWT auth, products/orders/admin) suitable for a simple e-commerce backend.
- Documentation coverage is limited to generic API/service patterns; there is no product, data, or AI pipeline spec for the described chat-bot app.
- Core MVP decisions are missing: identity approach, data model for bots/conversations/messages, moderation flow, and monetization/entitlements.
- The current API design focuses on "products/orders" and does not align with the stated AI chat app scope, creating a major scope/terminology mismatch.
- Several doc-level inconsistencies (response shapes, stray text, TODOs) reduce clarity and readiness for implementation.

## Docs Inventory
| File | Purpose | Completeness | Notes |
| --- | --- | --- | --- |
| docs/backend/api-design.md | REST API conventions and endpoint list | 30% | Covers auth/products/orders/admin only; no AI, bots, moderation, or entitlements; response format conflicts with examples; TODOs for pagination/filtering. |
| docs/backend/services.md | Service-layer pattern example | 15% | Generic stub; no concrete service list or domain responsibilities; not tied to actual product features. |

## Contradictions & Ambiguities
- API response format specifies `{ success, data, message }`, but auth endpoints return `{ user, token }` without the wrapper.
- The API defines "products/orders/admin" endpoints that conflict with the described AI chat-bot product scope (no bots/conversations/messages).
- Stray text (`dY"'`) appears in multiple endpoint lines, making authorization requirements unclear.
- "Admin only" endpoints are listed without any role/permission model or enforcement rules.
- JWT authentication is required but token lifecycle (refresh/expiry/rotation) is unspecified.
- Pagination and filtering are marked TODO with no contract details, leaving client integration undefined.

## MVP Critical Gaps
- Identity/auth approach: No decision on anonymous-first vs login-first, guest upgrade paths, or account linking.
- Data model: No entities for users, bots/NPCs, scenarios, conversations, messages, or entitlements; only products/orders exist.
- API contracts: No endpoints or schemas for bot creation, conversation lifecycle, message moderation states, or AI usage limits.
- AI pipeline: No server-side architecture, queueing, retries, prompt assembly, model selection, or quota enforcement.
- App store implications: No documentation for wrapper app risks, minimum native features, or app-store compliance constraints.
- Monetization/entitlements: No plan for subscriptions/credits, purchase verification, or enforcement points.

## Security & Safety Review
Missing trust-boundary definitions:
- Where OpenAI (and any other) API keys live and how they are protected.
- What is verified server-side vs client-side (especially entitlements, quotas, and moderation status).
- Rate limiting, abuse detection, and anti-automation protections.
- Data retention/logging policy for moderated content and user conversations.
- Moderation states and UI behavior for "post-render overlay blur" (what is stored, what is displayed).

Minimal recommended security invariants (to document explicitly):
- AI provider keys and secrets never reach the client; all model calls originate server-side.
- Client input is untrusted; moderation, entitlements, and quotas are enforced server-side.
- Every AI response has a moderation state that drives UI behavior (including overlay blur) and is logged.
- Rate limits exist per user/device/IP and per model operation (text vs image).
- Audit logs for moderation events and purchase verification are retained with defined retention windows.

## Monetization Readiness
What the docs say: nothing beyond generic product/order endpoints (not tied to subscriptions or credits).

What is missing:
- Entitlement model (subscription tiers, credit packs, free allowances, renewal rules).
- Quota model (per-day/per-month limits, per-feature costs, and rollover behavior).
- Restore purchases flow and validation policy.
- Server-side verification stance and enforcement points (do not trust client).

Minimal monetization spec outline:
- Entitlement types and mapping to features/quotas.
- Purchase verification flow and storage of receipts/transactions.
- Consumption rules per AI action (text generation, image generation).
- Restore/reconcile behavior on reinstall and across devices.
- Admin tooling or support flow for disputes/refunds.

## App Store Readiness
Missing items for iOS/Android release:
- Minimum functionality for wrapper apps vs app-store rejection risk.
- Privacy policy and data handling disclosures for AI content and UGC.
- Content policy and moderation escalation procedures.
- Parental controls / age gating decisions for user-generated content.
- Data deletion/export workflows.

Checklist of items to document:
- Wrapper architecture, offline behavior, and native feature set.
- Privacy policy mapping: data collected, retention, and third-party processors.
- UGC moderation policy and enforcement details.
- In-app purchase flow and restore purchase guarantees.
- App review support materials (test accounts, moderation examples).

## Question Backlog (Must Answer)
### Product
- [P0] Is the app anonymous-first or login-first, and what is the upgrade path for guest users?
- [P0] What is the core MVP scope (bots, conversations, images) for 9 weeks?
- [P1] What are the primary user journeys and success metrics?
- [P2] Which features are explicitly out of scope for MVP?

### Architecture
- [P0] Where do AI calls run (server, edge, workers), and how are quotas enforced?
- [P0] What storage layer(s) back conversations, bots, and moderation logs?
- [P1] What background jobs are required (moderation, retries, receipts)?
- [P2] What analytics/telemetry is needed at launch?

### Data
- [P0] What are the canonical entities and relationships (user, bot/NPC, scenario, conversation, message, entitlement)?
- [P0] What fields define moderation state and UI behavior (blur vs block)?
- [P1] What data retention policy applies to conversations and moderated content?
- [P2] What is the data export/deletion model?

### API
- [P0] What are the exact endpoints and schemas for bots, conversations, and messages?
- [P0] What is the contract for moderation results and client UI state?
- [P1] What pagination, filtering, and sorting rules apply?
- [P2] What versioning strategy will be used for breaking changes?

### Safety
- [P0] What is the moderation pipeline (pre/post, thresholds, human review)?
- [P0] What rate limits and abuse controls are required on day one?
- [P1] What audit logs are needed for policy compliance?
- [P2] What user appeal or dispute process exists for moderation?

### Monetization
- [P0] Subscription vs credits decision and entitlement structure.
- [P0] How are purchases verified and reconciled server-side?
- [P1] What is the quota model for text vs image operations?
- [P2] How are refunds and chargebacks handled?

### App Store
- [P0] What native capabilities are required to avoid wrapper app rejection?
- [P0] What disclosures are needed for AI/UGC and third-party processors?
- [P1] What is the minimum moderation policy for store approval?
- [P2] What test-account and review-mode tooling will be provided?

## Recommended Next Docs (In Order)
1. Product Requirements Doc (MVP): define scope, user journeys, success metrics, and explicit out-of-scope items.
2. Domain Model & Data Schema: canonical entities, relationships, and moderation/entitlement fields.
3. API Contract Spec: endpoints with request/response schemas for bots, conversations, messages, and moderation states.
4. AI Pipeline & Moderation Spec: model calls, prompts, filters, quotas, and logging rules.
5. Monetization & Entitlements Spec: purchase verification, quotas, restore flow, and enforcement points.
6. App Store Readiness Checklist: privacy disclosures, UGC policy, and wrapper app considerations.

## Glossary Fixes
- Bot vs NPC: define if they are synonyms or distinct entities.
- Scenario: what it is, how it relates to bots and conversations.
- Conversation vs Message: lifecycle and ownership rules.
- Entitlement: definition, types, and enforcement points.
- Filtered vs Blocked: meanings, UI behavior (overlay blur), and storage.
- User vs Account vs Device: identity model and linking rules.
