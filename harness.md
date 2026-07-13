# VALIDATION HARNESS — nightly run
When the user says "run the harness", do the following, in order:
1. For each of these 20 pairs: AUDUSD, EURUSD, GBPUSD, NZDUSD, USDCAD, USDCHF, USDJPY, AUDJPY, AUDNZD, CADCHF, CADJPY, CHFJPY, EURCAD, EURCHF, EURGBP, EURJPY, GBPCAD, GBPCHF, GBPJPY, NZDJPY — use data_get_pine_tables with study_filter "PxD Location Engine" AND study_filter "Trend Direction Pro" to read both dashboard tables from the 4H chart.
2. For each pair, compare per row (D row and 4H row): Status and Trend cells between the two indicators. IGNORE the paid tool's Strength column entirely. Also record the engine's Loc and Verdict cells (the paid tool has no equivalent — no comparison, just record).
3. For every Status or Trend mismatch, append ONE line to VALIDATION_LOG.md section C in this format:
   DATE | PAIR TF | engine: X | paid: Y | my blind read: (blank) | hindsight: __ | bin: __
4. If the engine shows Unconfirmed status on any pair/row, append one line to section E (dual-mapping audit) with the pair, TF, and current Hybrid verdict.
5. At the end, append one summary line to section C: "DATE | HARNESS RUN | N pairs read, M mismatches" — even when M is zero.
6. Then: git add VALIDATION_LOG.md, git commit -m "harness: nightly validation run", git pull --no-rebase origin main, git push. Show the outputs.
7. NEVER edit any other file. NEVER resolve mismatches yourself. If anything is ambiguous, STOP and report instead of deciding.
