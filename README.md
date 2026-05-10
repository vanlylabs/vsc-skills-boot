# SkillsBoot 🚀

**One source of truth for your AI instructions. Initialize once, share across projects, and switch seamlessly between different AI agents like GitHub Copilot, Claude Code, Cursor, and more.**

SkillsBoot solves the "instruction fragmentation" problem. Instead of copy-pasting `skills` or `AGENTS.md` or `mcp config` between projects, you maintain a central library of **Master Instructions** and surgicaly link them to your projects.

---

## ✨ Why SkillsBoot?

*   **📦 One Source of Truth**: Manage your core AI guidelines, coding standards, and architectural patterns in one place. Edit once, sync everywhere.
*   **🌐 Cross-Project Sharing**: Ensure consistency across your entire portfolio. Your custom "Senior Architect" persona follows you into every new project.
*   **🔄 Instant Agent Switching**: Moving from Claude Code to GitHub Copilot? Just flip a toggle. SkillsBoot automatically re-maps and transforms your instructions for the target agent.
*   **🔗 Symlink Architecture**: High-speed, zero-copy synchronization. Your AI agents see native files, but your system sees a perfectly managed central hub.

---

## 🛠 How It Works

SkillsBoot acts as a central distribution hub for your AI context, translating high-level templates into tool-specific configurations.

<img src="architecture-flow.png" width="400" alt="SkillsBoot Architecture">

1.  **Master Templates**: Your instructions are stored in a standard, portable format (containing `AGENTS.md`, `skills/`, and `mcp/mcp.json`) in your home directory (`~/.skillsboot/templates`).
2.  **Tool Adapters**: When you apply an instruction, SkillsBoot utilizes specialized adapters to transform the master template into a "Variant"—a version optimized for specific tools (like Cline or Claude Code). MCP configurations are automatically converted between formats (TOML, JSON, JSONC) and key mappings.
3.  **Project Linking & Syncing**: SkillsBoot creates symbolic links for files like `AGENTS.md` and `skills/`. For MCP configurations, it performs bidirectional synchronization—meaning you can edit your MCP config directly in your project, and SkillsBoot will sync it back to your central library.

---

## 📂 Supported Tools/Config

SkillsBoot standardizes configuration across the most popular AI coding assistants:

| Agent | AGENTS.md | Skills | MCP Config |
| :--- | :--- | :--- | :--- |
| **GitHub Copilot** | `AGENTS.md` | `.github/skills/` | `.vscode/mcp.json` |
| **Claude Code** | `CLAUDE.md` | `.claude/skills/` | `.mcp.json` |
| **Cursor** | `AGENTS.md` | `.cursor/skills/` | `.cursor/mcp.json` |
| **Kilo** | `AGENTS.md` | `.kilocode/skills/` | `.kilo/kilo.jsonc` |
| **Codex** | `AGENTS.md` | `.agents/skills/` | `.codex/config.toml` |
| **Windsurf** | `AGENTS.md` | `.windsurf/skills/` | _(Not supported)_ |
| **Cline** | `AGENTS.md` | `.clinerules/skills/` | _(Not supported)_ |

> [!NOTE]
> **MCP Sync Limitations**: While SkillsBoot handles format conversion, not all MCP features are shared across all tools. Some agents support unique fields (e.g., Kilo's `timeout` or Codex's `env_vars`) that might be stored in the central template but won't be mapped to tools that don't support them.

---

## 🚀 Getting Started

### 1. Access the Manager
Find the **Rocket Icon** in the VS Code Activity Bar to open the SkillsBoot Manager.

### 2. Initialize or Import
*   **New Instruction**: Click **"New"** to scaffold a fresh master template from scratch.
*   **Project Import**: Click **"Import"** if you're in a project with existing rules. SkillsBoot will automatically detect the tool, migrate your rules to the central library, and replace local files with managed links.

### 3. Apply & Scale
Use the dropdown on any instruction card to link it to your current project. Switch agents on the fly by changing the tool selection—SkillsBoot handles the transition instantly.

---

## 🔧 Installation

1. Install the extension from the VS Code Marketplace.
2. Open the SkillsBoot view in the Activity Bar.
3. Start centralizing your AI intelligence today.
