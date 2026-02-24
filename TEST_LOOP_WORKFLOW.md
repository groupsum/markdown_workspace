# Autonomous Test Loop Scenario Workflow

## Operating mode
Work in fast, decisive bursts and repeat this loop until all known issues are resolved.

## Loop procedure
0. **Review → Plan → Notate → Execute**
   - Review prior notes in `AGENT_NOTES.md`.
   - Review current project features and current repo guidance.
   - Create an explicit execution plan with short steps.
   - Notate the plan in `AGENT_NOTES.md` before implementation.
   - Execute the plan and capture outcomes.
1. **Start backend**
   - Launch the uvicorn backend service and confirm it is reachable.
2. **Start clients**
   - Launch both `admin_client` and `public_client`.
3. **Exercise hooks and GUI**
   - Use both clients through their hooks and GUI flows.
4. **Review network capture**
   - Inspect PCAP/network traces, including headers, payloads, and responses sent/received.
5. **Failure analysis**
   - Evaluate traffic and behavior to determine whether a failure occurred and the root cause.
6. **Remediate**
   - Fix the issue and document the remediation approach.
7. **Repeat**
   - Continue the loop until all identified issues are resolved.
8. **Cross-project review**
   - Review each project's current state and assess gaps, errors, issues, and potential change requests.
9. **Document requests and defects**
   - Record change requests, feature requests, and bugs in `AGENT_NOTES.md`.
10. **Autonomous execution**
   - Continue without waiting for further instruction unless blocked by hard constraints.
11. **Persistent self-notes**
   - Keep notes current and actionable after each burst.
12. **Update agent instructions**
   - Update `agents.md` when process expectations evolve.
13. **Enforce these procedures**
   - Keep `agents.md` aligned to require this workflow.
14. **Always apply the cycle**
   - Always review, plan, notate, execute, test, verify, repeat, check, review, request, and annotate.

## Required artifacts for each loop
- A timestamped plan entry in `AGENT_NOTES.md`.
- A run log entry (what was run, what failed/passed, what changed).
- A network review note for relevant requests/responses.
- A closure entry listing remaining issues or confirming zero open issues.

## Optional helper command
Use the helper script to prepend a timestamped run-log entry quickly:

```bash
./scripts/log_execution_burst.sh AGENT_NOTES.md "Summarize this execution burst"
```

