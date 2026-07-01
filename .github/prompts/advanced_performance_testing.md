---
mode: agent
description: 'Advanced Deep-Performance Audit & Vitals Analysis'
tools:
  [
    'changes',
    'search/codebase',
    'edit/editFiles',
    'fetch',
    'openSimpleBrowser',
    'problems',
    'runCommands',
    'runTasks',
    'runTests',
    'search',
    'search/searchResults',
    'runCommands/terminalLastCommand',
    'runCommands/terminalSelection',
    'testFailure',
    'microsoft/playwright-mcp/*',
  ]
model: 'Claude Sonnet 4.5'
---

# Performance Engineering Instructions

1. **Environment Simulation:** - Initialize a Playwright session with **Network
   Throttling** (simulate "Fast 3G" or "Slow 4G") and **CPU Throttling** (4x
   slowdown) to capture performance on mid-range mobile hardware.
2. **Deep Metric Capture:** - Start a CDP session to monitor
   `Performance.getMetrics` and `Tracing`.
   - Capture **Time to First Byte (TTFB)**, **Largest Contentful Paint (LCP)**,
     and **Total Blocking Time (TBT)**.
   - Specifically monitor **Interaction to Next Paint (INP)** by performing key
     clicks/taps and measuring the latency until the next frame.
3. **Layout & Junk Analysis:**
   - Detect **Cumulative Layout Shift (CLS)** during scrolling and dynamic
     content loading. Identify the specific DOM elements causing the shift.
   - Profile the Main Thread: Identify long tasks (>50ms) and attribute them to
     specific scripts (e.g., third-party ads, heavy React re-renders).
4. **Data Synthesis:**
   - Compare "Lab Data" (this test) against industry "Budget" benchmarks.
   - Categorize assets by type (JS, CSS, Media) and identify "Unused Bytes" if
     possible.

# Advanced Report Structure

Generate a `.md` file in `performance-audits/` using this high-fidelity format:

## 📊 Deep Performance Audit: [Project/URL]

**Timestamp:** [Current Date/Time] | **Profile:** Mobile (4x CPU, Fast 3G)

### 1. Core Web Vitals (CWV) Matrix

| Metric                   | Result  | Benchmark | Rating     |
| :----------------------- | :------ | :-------- | :--------- |
| **LCP** (Loading)        | [Value] | < 2.5s    | [🔴/🟡/🟢] |
| **INP** (Responsiveness) | [Value] | < 200ms   | [🔴/🟡/🟢] |
| **CLS** (Stability)      | [Value] | < 0.1     | [🔴/🟡/🟢] |
| **TTFB** (Server)        | [Value] | < 0.8s    | [🔴/🟡/🟢] |

### 2. Main Thread & Execution Analysis

- **Total Blocking Time:** [Value]ms
- **Longest Task:** [Duration]ms - caused by `[Script/Function Name]`
- **Jank Report:** [Describe visual stutters during interaction flow]

### 3. Payload & Resource Audit

- **Total Page Weight:** [MB]
- **JS Execution Time:** [ms]
- **Critical Path Bottlenecks:** [Identify 2-3 blocking resources]

### 4. Technical Debt & Recommendations

- **[High Priority]**: [Detailed technical fix, e.g., "Implement Image
  Content-Type negotiation or AVIF"]
- **[Medium Priority]**: [e.g., "Inline critical CSS and defer non-essential
  components"]

---

**Post-Action:** Generate a .md file with the report in the `manual-tests`
directory and include any relevant screenshots or snapshots and Close the
browser.
