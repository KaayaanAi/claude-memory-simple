# Claude Memory Simple 🧠

[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)](https://github.com/KaayaanAi/claude-memory-simple/releases/tag/v1.0.0)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)](https://nodejs.org)
[![Claude Desktop](https://img.shields.io/badge/claude--desktop-compatible-purple.svg)](https://claude.ai)

**Bulletproof MCP session memory that works out-of-the-box with Claude Desktop**

No MongoDB, no complex configuration, no headaches. Just simple, reliable conversation memory that actually works.

> 🎉 **New in v1.0.0**: Complete rewrite focusing on reliability and simplicity. One tool, file storage, zero configuration.

## ⚡ Quick Start (3 commands)

```bash
git clone https://github.com/KaayaanAi/claude-memory-simple.git
cd claude-memory-simple
npm run setup
```

Then restart Claude Desktop and look for the `session_memory` tool. Done! 🎉

## ✨ Features

- **Single Tool**: `session_memory` handles save/load/search in one command
- **File-Based Storage**: No external databases required
- **Auto-Setup**: Generates Claude Desktop config automatically
- **Bulletproof STDIO**: Tested MCP protocol implementation
- **Zero Dependencies**: Only needs Node.js and the MCP SDK
- **Smart Summaries**: Auto-generates conversation summaries
- **Simple Search**: Find conversations by keyword
- **Error Handling**: Clear error messages and recovery

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- Claude Desktop installed

### Step 1: Install
```bash
# Clone or download this project
cd claude-memory-simple
npm install
npm run setup
```

### Step 2: Configure Claude Desktop

The setup script generates this configuration. Copy it to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "claude-memory-simple": {
      "command": "node",
      "args": ["/full/path/to/claude-memory-simple/index.js"],
      "cwd": "/full/path/to/claude-memory-simple"
    }
  }
}
```

### Step 3: Restart Claude Desktop

Completely quit and restart Claude Desktop. Look for the `session_memory` tool in the interface.

## 📖 Usage

The `session_memory` tool supports three actions:

### Save a Conversation
```json
{
  "action": "save",
  "session_id": "my-project-session",
  "user_id": "john_doe",
  "messages": [
    {
      "role": "user",
      "content": "Help me build a React app"
    },
    {
      "role": "assistant", 
      "content": "I'll help you create a React app..."
    }
  ],
  "summary": "Discussion about building a React app"
}
```

### Load a Conversation
```json
{
  "action": "load",
  "session_id": "my-project-session", 
  "user_id": "john_doe"
}
```

### Search Conversations
```json
{
  "action": "search",
  "user_id": "john_doe",
  "query": "React"
}
```

## 🔧 Testing

Before using with Claude Desktop, verify everything works:

```bash
npm test
```

This will:
- Start the MCP server
- Test all three actions (save/load/search)
- Verify file storage works
- Confirm STDIO protocol compliance

## 📁 File Structure

```
claude-memory-simple/
├── index.js          # Main MCP server
├── setup.js          # Auto-setup script  
├── test.js           # Testing script
├── package.json      # Dependencies
├── README.md         # This file
└── data/             # Stored conversations (created automatically)
    ├── user1_session1.json
    ├── user1_session2.json
    └── ...
```

## 🐛 Troubleshooting

### Claude Desktop shows "Server disconnected"

1. **Check the file paths** in your config are absolute and correct
2. **Verify Node.js version**: `node --version` (needs 18+)
3. **Test the server manually**: `npm test`
4. **Check Claude Desktop logs** for specific errors
5. **Restart Claude Desktop completely** (not just refresh)

### "session_memory tool not found"

1. **Verify Claude Desktop config** is in the right location
2. **Check JSON syntax** is valid (use `python3 -m json.tool config.json`)
3. **Ensure file permissions** allow Claude Desktop to read the config
4. **Try a different server name** in the config

### Storage issues

1. **Check write permissions** in the project directory
2. **Verify data directory exists**: Should be created automatically
3. **Look for error messages** in Claude Desktop logs
4. **Try manual test**: `node index.js` and send test requests

### Common fixes:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reset data directory
rm -rf data
mkdir data

# Re-run setup
npm run setup
```

## 🔍 How it works

1. **STDIO Protocol**: Uses standard input/output for Claude Desktop communication
2. **File Storage**: Each conversation saved as `{user}_{session}.json`
3. **Simple Search**: Text matching across message content and summaries
4. **Auto Summaries**: Generates summaries from conversation content
5. **Error Recovery**: Handles missing files, corrupted data, permissions issues

## 🚀 Advanced Usage

### Custom User IDs
Use meaningful user IDs to organize conversations:
```json
{"user_id": "project_alpha", "session_id": "day1_planning"}
{"user_id": "project_alpha", "session_id": "day2_implementation"}
```

### Bulk Operations
Search across all your sessions:
```json
{"action": "search", "user_id": "project_alpha", "query": "bug"}
```

### Session Naming
Use descriptive session IDs:
- `project-setup-2024-01-15`
- `debugging-auth-issue`
- `learning-react-hooks`

## 📊 Limits

- **Max messages per session**: 100 (older messages truncated)
- **Max message length**: 50,000 characters
- **Max sessions per user**: 1000 (oldest files may be cleaned up)
- **Search results**: Limited to 20 matches

## 🔐 Privacy

- All data stored locally in the `data/` directory
- No external services or cloud storage
- File names use safe characters (special chars replaced with `_`)
- No network requests except MCP protocol communication

## 🤝 Contributing

This is designed to be simple and stable. If you need more features, consider:

1. **Forking** for custom modifications
2. **File an issue** for bugs or critical missing features  
3. **Keep it simple** - complexity kills reliability

## 📄 License

MIT License - Use freely for personal and commercial projects.

---

**Need help?** Check the troubleshooting section above or test with `npm test` first!