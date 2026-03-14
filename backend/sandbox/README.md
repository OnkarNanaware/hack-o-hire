# `/backend/sandbox`

Isolated execution environment for testing AI agent behavior, detecting prompt injection side effects, and analyzing suspicious code execution patterns.

## Structure

```
sandbox/
├── executor.py              # Docker container lifecycle manager
├── monitor.py               # Real-time syscall and network monitor
├── behavior_analyzer.py     # Pattern matching on execution traces
├── seccomp_profiles/
│   ├── default.json         # Default seccomp syscall whitelist
│   └── strict.json          # Strict-mode syscall profile
└── reports/                 # Sandbox execution report templates
```

## How It Works

1. **Container Launch**: Spins up a pre-built Docker sandbox image with no network access, read-only filesystem, and seccomp/AppArmor restrictions.
2. **Code Injection**: Injects the agent prompt or code snippet into the isolated container.
3. **Monitoring**: Captures all syscalls (via `strace`), file system access attempts, and network connection attempts.
4. **Behavior Analysis**: Compares captured traces against known malicious patterns (e.g., `/etc/passwd` reads, shell spawning, reverse shells).
5. **Risk Scoring**: Returns a `ModuleResult` with flagged behaviors and a risk score.

## Security Constraints

- No outbound network access
- Read-only root filesystem
- PID namespace isolation
- CPU and memory limits enforced via Docker cgroups
- Execution timeout: configurable (default 30s)
