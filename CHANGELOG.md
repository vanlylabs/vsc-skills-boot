# Changelog

## [1.0.1] - 2026-05-05
### Fixed
- **Workspace Isolation**: Fixed an issue where the active instruction state would leak across different VS Code projects by switching from `GlobalState` to `WorkspaceState`.
- **Filesystem Validation**: The UI now actively verifies the existence of symbolic links before showing an instruction as "Active," preventing desync between the manager and the actual project state.

## [1.0.0] - 2026-03-21
### Added
- **Initial Release of SkillsBoot**: A centralized AI instruction and skill manager for VS Code.
- **Master Templates**: Define SKILLs, and AGENTS.md once in a central library (`~/.skillsboot`).
- **Tool-Specific Variants**: Automatically transform master templates into formats optimized for different AI agents (Cline, Claude Code, GitHub Copilot, Cursor, etc.).
- **Symbolic Linking Engine**: Projects link directly to active instruction variants, ensuring the "Source of Truth" remains central while keeping project-local tools functional.
- **SkillsBoot Manager UI**: A dedicated VS Code Activity Bar view for managing instructions, creating new ones, and switching between tools.
