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

### 2. Dedicated Agent Mode (Recommended) 🔒
For power users who heavily utilize extended, agent-specific capabilities (e.g., Kilo's `.kilocode/agents` or Cline's `.cline/memory`), **Dedicated Agent Mode** is the primary way to use SkillsBoot. It locks the workspace to a single agent. This unlocks full compatibility with your agent's unique capabilities, safely isolating configurations to prevent conflicts while perfectly adhering to the agent's expected file structure.

### 3. Flexible Mode (Switching Agents) 🔄
Need to move from Claude Code to GitHub Copilot? If you disable the Dedicated Agent lock, you enter **Flexible Mode**. This mode allows you to instantly switch the instruction context between different AI agents. However, for compatibility across platforms, Flexible Mode **only** supports the core standard features listed below:

| Agent | AGENTS.md | Skills | MCP Config |
| :--- | :--- | :--- | :--- |
| **GitHub Copilot** | `AGENTS.md` | `.github/skills/` | `.vscode/mcp.json` |
| **Claude Code** | `CLAUDE.md` | `.claude/skills/` | `.mcp.json` |
| **Cursor** | `AGENTS.md` | `.cursor/skills/` | `.cursor/mcp.json` |
| **Kilo** | `AGENTS.md` | `.kilocode/skills/` | `.kilo/kilo.jsonc` |
| **Codex** | `AGENTS.md` | `.agents/skills/` | `.codex/config.toml` |
| **Windsurf** | `AGENTS.md` | `.windsurf/skills/` | _(Not supported)_ |
| **Cline** | `AGENTS.md` | `.clinerules/skills/` | _(Not supported)_ |

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

### 2. Choose Your Mode (Welcome Screen)
* **Dedicated Agent Mode**: This is the recommended mode. Select your primary agent to lock the extension globally to that tool, enabling advanced tool-specific features.
* **Flexible Mode ("Off")**: If you prefer switching agents on the fly, select off. You will be limited to standard features.

### 3. Initialize or Import
* **New**: Scaffold a fresh, reusable Master Instruction. Dropdown is locked if in Dedicated Mode.
* **Import**: Already have skills in your project? Select your agent and choose exactly which features to import natively.

### 4. Code!
Your AI assistant is now supercharged and strictly following your managed standards.

---

## 🔧 Installation

1. Install the extension from the VS Code Marketplace.
2. Open the SkillsBoot view in the Activity Bar.
3. Start centralizing your AI intelligence today!
