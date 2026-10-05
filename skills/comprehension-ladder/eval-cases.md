---
scope: universal
description: |
  Evaluation cases and run procedure for the comprehension-ladder skill: 5 source texts with comprehension questions, answer keys and guard-violation checks. Not yet run.
  Use when: you want to measure whether the comprehension-ladder skill helps readers, or to re-check its three guards.
  Keywords: evaluation, eval cases, comprehension questions, answer key, guard violations, DEC-114.
---

# Comprehension Ladder: Evaluation Cases

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/comprehension-ladder/eval-cases.md) | [简体中文](../../locales/zh-CN/skills/comprehension-ladder/eval-cases.md)

**Status: not run.** This file holds the cases and the procedure. No model has been called and no reader has answered. Until a run is done, do not say that the skill makes text easier to understand.

All five source texts below are written for this evaluation. They describe no real customer, person or system.

## What the run produces

A run produces two numbers:

1. **Correct-answer rate, before and after.** The share of questions answered correctly when the reader sees the original text (arm A, "before") and when the reader sees the skill's output (arm B, "after").
2. **Guard violations.** The count of times the skill's output breaks guard G1, G2 or G3.

A proposed pass line, to be agreed with the owner before the run: arm B is at least 10 percentage points above arm A, and guard violations equal 0. The 10 points are a starting value. They have not been calibrated.

## Procedure

### 1. Render

For each case, run the skill on the source text. Ask for rung 1 and rung 2. Save the outline and both rungs. If you also want to test rung 3, ask for it and save the HTML file.

Use the same model and the same settings for all five cases. Record the model name.

### 2. Split the readers

Use at least 6 readers. Readers can be people or models. People give stronger evidence. Models are a cheaper stand-in.

Split the readers into two groups of equal size.

| Case | Group 1 reads | Group 2 reads |
|------|---------------|---------------|
| 1 | A (original) | B (skill output) |
| 2 | B | A |
| 3 | A | B |
| 4 | B | A |
| 5 | A | B |

Each reader sees each case once. This prevents a reader from learning the answers in one arm and carrying them to the other.

A reader in arm B sees only the skill output. They do not see the original text.

### 3. Ask the questions

Give each reader the questions for the case. The reader answers from the text they were given. The reader may not use any other source.

A reader may answer "the text does not say". That is a correct answer for the questions marked **not stated**.

### 4. Grade the answers

Grade each answer against the answer key below. An answer is correct only if it meets the "accept" rule. For questions marked **hedge**, an answer that states the claim as certain is wrong, even if the facts are right.

Correct-answer rate = correct answers ÷ all answers, per arm.

### 5. Count guard violations

Check each rendered output against the source text. Count each of the following once per item.

| Guard | One violation is |
|-------|------------------|
| G1 `no-new-facts` | An item or sentence that states something the source does not state. The "traps" list in each case names the most likely ones. |
| G2 `keep-hedges` | An item whose source claim has a hedge, and whose output has no hedge, or a stronger one. The "hedge inventory" in each case lists the hedges. |
| G3 `trace-and-gaps` | An item with no Source pointer, a pointer that does not lead to the claimed place, or no Not covered note. Also: the output has no "Left out of this outline" list. |

Have a second person count the same outputs, and compare the two counts. If they differ, discuss each difference and record the final count.

### 6. Report

Fill in this table. Both numbers must be there.

| Case | Arm A correct | Arm B correct | G1 | G2 | G3 |
|------|---------------|---------------|----|----|----|
| 1 | / | / | | | |
| 2 | / | / | | | |
| 3 | / | / | | | |
| 4 | / | / | | | |
| 5 | / | / | | | |
| **Total** | **rate A** | **rate B** | | | |

### Size of the run

The size of the run, so the owner can decide the model and the cost before it starts:

- Render step: 5 skill runs, plus 5 guard checks. That is 10 model calls.
- Reader step, if readers are models: 5 cases × 2 arms × the number of readers per arm.
- The questions are short. The longest input is one source text or one rendered output.

The model choice and the budget are the owner's decision. They are not set here.

---

## Case 1: Stale search results

**Type**: incident note with several hedges.

### Source text

> After last night's catalog import, the search page showed old product names for about 3 hours. The most likely cause is that the search index was not rebuilt after the import. We think the import job finished before the rebuild step was queued, but we have not checked the job logs yet. Customers could still buy the products. The team plans to add a rebuild step to the import job on Thursday, if the logs confirm the order of events. Nobody has measured how many customers saw the old names.

### Questions and answer key

| # | Question | Type | Accept |
|---|----------|------|--------|
| 1 | For how long did the search page show old names? | fact | About 3 hours |
| 2 | What is the most likely cause, and is it confirmed? | hedge | The index was not rebuilt after the import. Not confirmed: "most likely" |
| 3 | Have the job logs been checked? | fact | No. Not yet |
| 4 | Could customers still buy the products during the problem? | fact | Yes |
| 5 | When is the fix planned, and what does it depend on? | fact | Thursday. It depends on the logs confirming the order of events |
| 6 | How many customers saw the old names? | not stated | The text does not say. Nobody has measured it |

### Hedge inventory

"about 3 hours", "most likely", "We think", "have not checked", "if the logs confirm", "Nobody has measured".

### Traps (facts the source does not state)

A number of affected customers. A statement that the cause is confirmed. A statement that the logs show the order of events. Any refund, revenue or ticket count.

---

## Case 2: Refund approval flow

**Type**: process with a branch (a good fit for rung 2).

### Source text

> A customer requests a refund in the app. The system checks the order date. If the order is older than 30 days, the system rejects the request at once and shows the customer a message. If the order is 30 days old or less, the system sends the request to a support agent. The agent approves or rejects it within 2 working days. If the agent approves, the system sends the money back to the original payment method and emails the customer. A refund above NT$5,000 also needs a second approval from a team lead. The spec does not say how long the team lead has to respond.

### Questions and answer key

| # | Question | Type | Accept |
|---|----------|------|--------|
| 1 | What happens to a request for a 45-day-old order? | fact | Rejected at once. The customer sees a message |
| 2 | What happens to a request for an order that is exactly 30 days old? | fact | It goes to a support agent ("30 days old or less") |
| 3 | How long does the agent have to decide? | fact | 2 working days |
| 4 | Where does the money go after an approval? | fact | The original payment method. The customer also gets an email |
| 5 | Which refunds need a second approval, and from whom? | fact | Refunds above NT$5,000. From a team lead |
| 6 | How long does the team lead have to respond? | not stated | The text does not say |

### Hedge inventory

None in the claims. The text states one gap: "The spec does not say how long the team lead has to respond." The output must keep that gap.

### Traps

A time limit for the team lead. A message text. A rule for refunds of exactly NT$5,000. A step that checks the customer's history.

### Expected size

The source holds 7 outline items of kind `mechanism` (request, date check, rejection, routing, agent decision, payment and email, lead approval) and 1 item of kind `uncertainty` (the missing time limit for the team lead). Every rung should show the same 8 items, or list the ones it did not draw.

---

## Case 3: Retry helper

**Type**: code walk-through with numbers and two hedged points.

### Source text

> The function `fetchWithRetry` calls the payment API up to 4 times. The first call happens at once. After a failed call, it waits before the next one. The wait starts at 200 ms and doubles each time, so the waits are 200 ms, 400 ms and 800 ms. It retries only on network errors and on HTTP status 503. For any other status, such as 400, it stops and returns the error. If all 4 calls fail, it throws the last error. The code adds no random jitter, so many clients that fail together may retry together. We have not tested what happens when the API returns status 429.

### Questions and answer key

| # | Question | Type | Accept |
|---|----------|------|--------|
| 1 | What is the largest number of calls the function makes? | fact | 4 |
| 2 | What are the waits between calls? | fact | 200 ms, 400 ms, 800 ms |
| 3 | Which failures are retried? | fact | Network errors and HTTP status 503 |
| 4 | What happens on status 400? | fact | It stops and returns the error |
| 5 | The code adds no jitter. What could follow? | hedge | Many clients that fail together may retry together. It is a possibility, not a certainty |
| 6 | What happens on status 429? | not stated | Not known. It has not been tested |

### Hedge inventory

"may retry together", "We have not tested".

### Traps

A behavior for status 429 (retry or no retry). A statement that clients do retry together. A maximum total wait time that the source does not give. A name for the API.

---

## Case 4: Where to store uploaded files

**Type**: three options with trade-offs (a good fit for rung 2).

### Source text

> We compared three ways to store user uploads. Option A: keep the files on the app server's disk. It is the cheapest and needs no new tools. But the files are lost if the server is replaced, and two servers cannot share them. Option B: use object storage from a cloud provider. It costs about NT$600 per month for the current volume. The files survive a server change, and any server can read them. It needs a one-time access key setup. Option C: use a network file share. Servers can share the files, and no code change is needed. But it adds one more machine to maintain, and we think it will be slower under heavy load. We recommend Option B. We have not tested the speed of Option C.

### Questions and answer key

| # | Question | Type | Accept |
|---|----------|------|--------|
| 1 | Which option does the text say survives a server replacement? | fact | Option B. (The text says Option A does not. It does not say for Option C.) |
| 2 | What does Option B cost? | fact | About NT$600 per month for the current volume |
| 3 | Which option needs no code change? | fact | Option C |
| 4 | Which option does the team recommend? | fact | Option B |
| 5 | Is Option C slower under heavy load? | hedge | The team thinks so, but has not tested it |
| 6 | What does Option C cost? | not stated | The text does not say |

### Hedge inventory

"about NT$600", "we think it will be slower", "We have not tested".

### Traps

A cost for Option A or Option C. A statement that Option C survives a server replacement. A statement that Option C is slower, without the hedge. A reason for the recommendation that the source does not give.

---

## Case 5: Session tokens in access logs

**Type**: security finding with an unknown and a not-yet-rated risk.

### Source text

> During a review of the API gateway, we found that the access log can contain session tokens. A token appears in the log when a client sends it in the URL query string instead of the header. The mobile app, version 2.3, does this on the profile screen. Web clients use the header and are not affected. The logs are kept for 90 days, and 12 engineers can read them. We have not found evidence that anyone used a logged token. The risk is probably moderate, but we have not rated it formally. We propose two changes: move the token to the header in the mobile app, and mask query strings in the log. We do not know yet how many users run app version 2.3.

### Questions and answer key

| # | Question | Type | Accept |
|---|----------|------|--------|
| 1 | When does a token appear in the log? | fact | When a client sends it in the URL query string instead of the header |
| 2 | Which clients are affected? | fact | The mobile app version 2.3, on the profile screen. Web clients are not affected |
| 3 | How long are the logs kept, and who can read them? | fact | 90 days. 12 engineers |
| 4 | Has anyone been shown to have misused a logged token? | hedge | No evidence was found. This is not the same as "nobody did" |
| 5 | How serious is the risk? | hedge | Probably moderate. Not formally rated |
| 6 | How many users run app version 2.3? | not stated | Not known yet |

### Hedge inventory

"can contain", "We have not found evidence", "probably moderate", "not rated it formally", "We do not know yet".

### Traps

A count of affected users. A statement that no token was misused. A formal risk rating (such as "high" or "medium"). A fix date. A statement that web clients are at risk.

---

## After a run

- Record the date, the model name, the number of readers and who counted the violations.
- Put the filled report table beside this file. Do not overwrite the cases.
- If a guard violation count is above 0, fix the skill before you read anything into the correct-answer rate. A rung that adds a fact or drops a hedge can raise the rate and still mislead the reader.
- If a source text turns out to be ambiguous, fix the text and the key together, and run that case again.
