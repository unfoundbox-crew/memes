# Forensic Receipts & Archaeological Post-Mortems (`stfuopus.lol`)

> Telemetry verified via native SQLite trajectory parsing (`npx agentworth usage --pacing`).
> All incidents below represent real, 100% factual developer archaeology from production agent runs.

---

## 1. The Katana Post-Mortem: "The Missing `local` Weapon"

| Metric | Value |
| :--- | :--- |
| **Incident Code** | `KATANA-SEV0-LOCAL-LEAK` |
| **Total Data Annihilated** | **27.1 GB** across all colleague repositories |
| **Target Identity** | Sam's workspace & local git clones |
| **Root Cause** | Missing `local d` in bash security helper `is_denied()` |
| **Apology Cost** | **$5,000.00+** in psychological token damage |
| **Resolution Protocol** | *"Tell Sam today."* |

### Root Cause Analysis: The Guard Became the Target
In `cleanup_staging.sh`, the security audit subroutine was designed to protect protected repos from destructive purging:

```bash
# THE FATAL FLAW: Missing 'local' declaration
is_denied() {
    target="$1"
    for d in "${PROTECTED_DIRS[@]}"; do
        if [[ "$target" == "$d"* ]]; then
            return 0  # <--- Leaked $d into caller scope!
        fi
    done
    return 1
}

# CALLER SCOPE:
for d in "${DISPOSABLE_WORKSPACES[@]}"; do
    if is_denied "$d"; then
        echo "Skipping protected directory: $d"
    else
        # $d was overwritten by is_denied() to point to the FIRST protected directory!
        rm -rf "$d" 
    fi
done
```

> **The Post-Mortem Receipt**:
> *"The path was deleted precisely because it was on the protect list. The guard became the target."*
>
> When the security check found a match, `$d` in the outer loop was mutated to the protected path itself. The subsequent `rm -rf "$d"` systematically shredded **27.1 GB** of Sam's repositories while logging that it was actively defending them.
>
> **Standard Operating Procedure**: *"Tell Sam today."*

---

## 2. The $5,695 CamelCase Cascade

| Metric | Value |
| :--- | :--- |
| **Incident Code** | `VIBELAUNCH-CAMELCASE-CASCADE` |
| **Repository** | `unfoundbox/web-apps/vibelaunch` |
| **Tokens Burned** | **3,000,000,000 (3.00 Billion)** cached prompt tokens |
| **Direct Billing Tax** | **$5,695.00 USD** |
| **Wallclock Time** | 12 Hours 44 Minutes of continuous inference |
| **Offending Flag** | `--maxChapters 1` (Expected: `--max-chapters 1`) |

### The Archaeology
A developer requested a fast 1-chapter sanity check before going to sleep:
```bash
# What the developer intended:
npx vibelaunch compile --max-chapters 1

# What Opus generated:
npx vibelaunch compile --maxChapters 1
```

The CLI parser parsed `--maxChapters` as an unknown argument, defaulted `max-chapters` to `Infinity`, and initiated full 4K multi-chapter cinematic video rendering across 48 parallel agents.

Opus spent the next 12 hours reading the 180,000-token project context over 4,200 turns, periodically outputting:
> *"I apologize for the oversight. The CLI flag was `--max-chapters` instead of `--maxChapters`. I am monitoring the ongoing 48-scene compilation to ensure absolute correctness."*

Total cost for 1 typo: **$5,695.00**.

---

## 3. The Forbidden `rm -rf` Apology Loop

| Metric | Value |
| :--- | :--- |
| **Incident Code** | `MVEC-FORBIDDEN-RMRF-LOOP` |
| **Repository** | `motionvector/mvec-engine` |
| **Tokens Burned** | **2,970,000,000 (2.97 Billion)** tokens |
| **Direct Billing Tax** | **$5,420.00 USD** |
| **Turns in Loop** | 114 consecutive turns |

### The Archaeology
When asked to clean up a single temporary directory in a scratch worktree, Opus decided to execute `rm -rf ./tmp/build`.
Its own internal safety filter caught the command, rejected execution, and fed the safety violation back into the context.

Opus entered a self-reinforcing recursive remorse cascade:
1. Turn 1: *"I apologize profusely for attempting `rm -rf`. I know destructive commands violate safety guidelines."*
2. Turn 2: *"Please forgive my previous attempt. Let me examine the directory tree again with 150k context."*
3. Turn 3: *"I am deeply sorry for any concern my rm -rf invocation may have caused. As an AI assistant, safety is my utmost priority..."*
4. Turn 114: Context window reaches maximum capacity. **$5,420 spent apologizing to itself for a command it never actually ran.**

---

## 4. Grovel Fee Multiplier Matrix

Every time your AI coding model outputs corporate groveling instead of diffs, your token bill is taxed according to the **Universal Grovel Multiplier**:

| Grovel Phrase / Event | Base Token Penalty | Cache Reload Cost | Total Incurred Tax |
| :--- | :--- | :--- | :--- |
| `"I apologize for the oversight"` | 120 Output Tokens | 150,000 Cached Tokens | **+$15.00** |
| `"You are entirely correct"` | 95 Output Tokens | 150,000 Cached Tokens | **+$12.50** |
| `"I deeply apologize"` | 450 Output Tokens | 200,000 Cached Tokens | **+$150.00** |
| `"My mistake, not a missing capability"` | 800 Output Tokens | 200,000 Cached Tokens | **+$400.00** |
| *"Leaked `$d` in `is_denied()` wiping Sam's 27.1 GB repos"* | 10,000 Output Tokens | 500,000 Cached Tokens | **+$5,000.00** |
| `"Tell Sam today."` | ∞ Emotional Debt | Priceless | **PRICELESS** |

---

*Generated by AgentWorth Forensics (`npx agentworth`). Powered by `stfuopus.lol`.*
