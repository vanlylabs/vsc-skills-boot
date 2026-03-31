# Changelog

## [1.0.0] - 2026-03-21
### Added
- **Initial Release of SkillsBoot**: A centralized AI instruction and skill manager for VS Code.
- **Master Templates**: Define SKILLs, and AGENTS.md once in a central library (`~/.skillsboot`).
- **Tool-Specific Variants**: Automatically transform master templates into formats optimized for different AI agents (Cline, Claude Code, GitHub Copilot, Cursor, etc.).
- **Symbolic Linking Engine**: Projects link directly to active instruction variants, ensuring the "Source of Truth" remains central while keeping project-local tools functional.
- **SkillsBoot Manager UI**: A dedicated VS Code Activity Bar view for managing instructions, creating new ones, and switching between tools.
