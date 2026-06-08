# SkillsBoot 🚀

**One source of truth for your AI instructions. Initialize once, share across projects, and switch seamlessly between different AI agents like GitHub Copilot, Claude Code, Cursor, and more.**

SkillsBoot solves the "instruction fragmentation" problem. Instead of copy-pasting `skills`, `AGENTS.md`, or `MCP config` between projects, you maintain a central library of **Master Instructions** and surgically link them to your projects.

---

## ✨ Key Features & Solutions

### 1. Reuse AI Instructions Across Projects 📦
Stop repeating yourself. Keep your custom "Senior Architect" persona, project guidelines, and coding standards in a single vault. SkillsBoot allows different projects to natively reuse core AI instructions covering:
- **Skills**
- **AGENTS.md**
- **MCP Configurations**

### 2. Seamless Agent Switching 🔄
Moving from Claude Code to GitHub Copilot? Just flip a toggle. **Switch Mode** ensures your core features (Skills, AGENTS.md, MCP) are instantly re-mapped, transformed, and injected into the appropriate format for your newly selected agent. Refer below table for features supported in switch mode.
| Agent | AGENTS.md | Skills | MCP Config |
| :--- | :--- | :--- | :--- |
| **GitHub Copilot** | `AGENTS.md` | `.github/skills/` | `.vscode/mcp.json` |
| **Claude Code** | `CLAUDE.md` | `.claude/skills/` | `.mcp.json` |
| **Cursor** | `AGENTS.md` | `.cursor/skills/` | `.cursor/mcp.json` |
| **Kilo** | `AGENTS.md` | `.kilocode/skills/` | `.kilo/kilo.jsonc` |
| **Codex** | `AGENTS.md` | `.agents/skills/` | `.codex/config.toml` |
| **Windsurf** | `AGENTS.md` | `.windsurf/skills/` | _(Not supported)_ |
| **Cline** | `AGENTS.md` | `.clinerules/skills/` | _(Not supported)_ |

### 3. Dedicated Agent Mode 🔒
For power users who heavily utilize extended, agent-specific capabilities (e.g., Kilo's `.kilocode/agents` or Cline's `.cline/memory`), **Dedicated Agent Mode** locks the workspace to a single agent. This unlocks support for your agent's unique features, isolating them safely to prevent conflicts when switching.

### 4. Clear & Easy Instruction Management 📂
With the SkillsBoot Manager UI, managing dozens of custom instructions is effortless. It takes one click to Apply, Remove, Edit, or Duplicate instructions across your entire portfolio.

---

## 🛠 How It Works

<img src="architecture-flow.png" width="400" alt="SkillsBoot Architecture">

1. **Master Templates**: Instructions are stored in a standard, portable format (`~/.skillsboot/templates`).
2. **Tool Adapters**: SkillsBoot dynamically translates templates into "Variants"—versions natively optimized for specific tools (e.g., TOML for Codex, JSONC for Kilo).
3. **Symlink Architecture**: High-speed, zero-copy synchronization physically links your configured Variant directly to your active project folder. Your agent reads native files while your system stays perfectly managed.

---

## 🚀 Getting Started

### 1. Access the Manager
Find the **Rocket Icon** in the VS Code Activity Bar to open the SkillsBoot Manager.

### 2. Initialize or Import
* **New**: Scaffold a fresh, reusable Master Instruction.
* **Import**: Already have skills in your project? SkillsBoot will auto-detect the agent, migrate your skills into the vault, and replace the local copies with managed symlinks.

### 3. Choose Your Mode
* **Dedicated Agent Mode**: Select an agent from the top "Dedicated Agent" menu. This locks the extension to one agent, triggering a simple "Apply/Remove" toggle and enabling agent-specific extended features!
* **Switch Mode**: Select an agent from the dropdown on any instruction card to apply core features. Switch tools at any time.


### 4. Code!
Your AI assistant is now supercharged and strictly following your managed standards.

---

## 🔧 Installation

1. Install the extension from the VS Code Marketplace.
2. Open the SkillsBoot view in the Activity Bar.
3. Start centralizing your AI intelligence today!
