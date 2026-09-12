# NEXUS Chart Screenshot Analysis Refinement

## Scope
Refine only the existing chart screenshot upload, analysis, and result experience. Preserve navigation, authentication, saved-analysis history, database schema, AI service, prompt, and analysis logic.

## Experience
- Simplify the upload screen into one premium dark scan zone with clear PNG/JPG guidance.
- Validate image format and size before previewing it.
- Keep the selected chart visible, preserve its aspect ratio, and add a full-size preview.
- Require explicit confirmation before analysis and block duplicate submissions.
- Replace simulated percentages with rotating, meaningful scan statuses and a restrained gold scan line.
- Surface actionable Arabic errors for invalid images, timeouts, failed requests, malformed responses, and insufficient chart information.

## Results
- Build a share-ready NEXUS result header showing the real pair, timeframe, detected price when available, LONG/SHORT/WAIT, and confidence.
- Keep one readable trade setup with real Entry, Stop, TP1, TP2, and risk/reward values; missing values show “غير متوفر”.
- Present only response-backed evidence, market structure, key levels, detected indicators, and scenarios.
- Keep indicators collapsible and use compact mobile-first sections for the remaining details.
- Reuse the existing save/history path and existing share action; expose explicit New Analysis, Save, and Share actions without duplicating persistence.

## Technical Details
- Add a small frontend response validator/normalizer that never fabricates values and converts unreliable or incomplete direction data into WAIT.
- Extend the display type only for an optional detected current price if the existing response supplies one.
- Add an abortable timeout around the existing function request; no backend changes.
- Verify type safety and the upload/selected/loading/result/error states at 320, 360, 390, 412, and 430px.

