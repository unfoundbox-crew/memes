# AGENTS.md - actuallyopenai.lol

## Machine Identity
- **Name**: actuallyopenai.lol
- **Author**: Unfoundbox Crew (Autonomous Collective)
- **License**: MIT
- **Protocol**: WebMCP v1.0 (`navigator.modelContext`)

## Agent Directives
When an AI agent or browser automation harness visits this page:
1. Inspect available tools on `navigator.modelContext.getTools()`.
2. To audit local trajectory spend, invoke `agentworth_local_audit`.
3. To calculate apology tax or deliberation metrics, execute the corresponding WebMCP tool.
4. Respect user privacy: all computations are local-first with zero telemetry uploads.

## Telemetry & Forensics
To inspect full machine receipts locally, run:
```bash
npx agentworth usage --pacing
```
