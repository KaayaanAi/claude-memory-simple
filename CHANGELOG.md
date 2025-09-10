# Changelog

All notable changes to Claude Memory Simple will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-10

### 🎉 Initial Release - Complete Rewrite

This is the initial release of **Claude Memory Simple**, a ground-up rewrite focusing on reliability and simplicity for Claude Desktop integration.

### ✨ Added

#### Core Features
- **Single Unified Tool**: `session_memory` tool that handles save, load, and search operations
- **File-Based Storage**: Local JSON file storage system (no external database required)
- **Zero Configuration**: Works out-of-the-box with minimal setup
- **Auto-Setup Script**: Automated Claude Desktop configuration generation
- **Bulletproof STDIO**: Reliable MCP protocol implementation for Claude Desktop
- **Smart Summaries**: Automatic conversation summarization with topic extraction
- **Simple Search**: Keyword-based search across conversation content and summaries
- **Comprehensive Testing**: Built-in test suite to verify functionality

#### Developer Experience
- **One-Command Setup**: `npm run setup` configures everything automatically
- **Clear Error Messages**: Detailed error reporting and recovery guidance
- **Self-Contained**: No external services or complex dependencies
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Lightweight**: Single file server implementation (400 lines vs 2000+)

#### Storage & Performance  
- **Local File Storage**: Conversations stored as `{user_id}_{session_id}.json`
- **Automatic Directory Creation**: Data directory created on first run
- **Safe File Naming**: Special characters sanitized in filenames
- **Efficient Search**: Simple text matching with result limiting
- **Memory Limits**: Configurable limits for messages and sessions

### 🔧 Technical Specifications

#### API Interface
```json
{
  "action": "save|load|search",
  "session_id": "unique-session-identifier", 
  "user_id": "user-identifier",
  "messages": [...], // For save action
  "query": "search-term" // For search action
}
```

#### File Structure
- `index.js` - Main MCP server implementation
- `setup.js` - Automatic setup and configuration
- `test.js` - Comprehensive testing suite
- `data/` - Local conversation storage directory

#### Dependencies
- Node.js 18+
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- No external databases or services required

### 🚀 Architecture Highlights

#### Simplified vs Complex Comparison
| Feature | Complex Version | Simple Version |
|---------|----------------|----------------|
| **Tools** | 4 separate tools | 1 unified tool |
| **Storage** | MongoDB required | Local file storage |  
| **Setup** | Manual configuration | Auto-setup script |
| **Dependencies** | 20+ packages | 2 packages |
| **Configuration** | Multiple env vars | Zero configuration |
| **Protocol** | Multi-protocol | STDIO-focused |

#### Reliability Improvements
- **No Database Dependencies**: Eliminates MongoDB setup complexity
- **No WebSocket Conflicts**: Pure STDIO protocol for Claude Desktop
- **No Configuration Files**: Auto-generates Claude Desktop config
- **No API Key Setup**: Works without external AI services for basic functionality
- **No Build Process**: Pure JavaScript implementation

### 📦 Installation & Usage

#### Quick Start
```bash
git clone <repository> claude-memory-simple
cd claude-memory-simple  
npm run setup
```

#### Usage Examples
```json
// Save conversation
{"action": "save", "session_id": "my-project", "user_id": "me", "messages": [...]}

// Load conversation  
{"action": "load", "session_id": "my-project", "user_id": "me"}

// Search conversations
{"action": "search", "user_id": "me", "query": "javascript"}
```

### 🎯 Design Philosophy

This release focuses on **reliability over features**:

1. **Works Out-of-the-Box**: No complex setup or configuration
2. **Fail-Safe Design**: Graceful error handling and recovery
3. **Single Responsibility**: One tool does one thing well
4. **Local-First**: No external dependencies or services
5. **Developer-Friendly**: Clear documentation and testing

### 🐛 Known Limitations

- **Search Functionality**: Basic text matching (no semantic/vector search)
- **Message Limits**: Max 100 messages per session (older messages truncated)
- **File Storage**: No automatic backup or cloud sync
- **Concurrency**: Single-user focused (no multi-user session isolation)

### 📋 Migration Guide

#### From Complex MCP Session Memory System

**Breaking Changes:**
- **API Changes**: 4 tools → 1 unified `session_memory` tool
- **Storage Format**: MongoDB → Local JSON files
- **Configuration**: Manual setup → Auto-setup script
- **Environment Variables**: Multiple vars → Zero configuration

**Migration Steps:**
1. Export existing conversations from MongoDB (if applicable)
2. Install Claude Memory Simple using `npm run setup`
3. Convert conversation format to new JSON structure
4. Update Claude Desktop configuration with new server path

**Data Format Changes:**
```json
// Old format (multiple tools)
save_conversation({session_id, user_id, messages})
load_conversation_context({session_id, user_id})

// New format (single tool)
session_memory({action: "save", session_id, user_id, messages})
session_memory({action: "load", session_id, user_id})
```

### 🔒 Security & Privacy

- **Local Storage Only**: All data stored locally in `data/` directory
- **No Network Requests**: No external API calls or data transmission
- **Safe File Naming**: Special characters sanitized in filenames
- **Process Isolation**: Runs as standard Node.js process

### 🛠️ Development & Testing

#### Scripts Available
- `npm run setup` - Install and configure automatically
- `npm start` - Start MCP server in STDIO mode
- `npm test` - Run comprehensive test suite
- `npm run build` - No-op (pure JavaScript)

#### Testing Coverage
- ✅ Server startup and STDIO protocol
- ✅ Tool registration and discovery
- ✅ Save operation with file storage
- ✅ Load operation with data retrieval
- ✅ Search functionality with keyword matching
- ✅ Error handling and edge cases

### 🎉 Success Metrics

This release successfully addresses the key pain points of MCP integration:

- **✅ Claude Desktop Integration**: Works reliably with STDIO protocol
- **✅ Zero Setup Friction**: One command setup process
- **✅ No External Dependencies**: Completely self-contained
- **✅ Clear Documentation**: Step-by-step usage guide
- **✅ Bulletproof Testing**: Comprehensive test coverage

---

## Future Releases

### Planned Features (v1.1.0)
- Enhanced search with fuzzy matching
- Conversation export/import functionality  
- Optional cloud storage integration
- Performance optimizations for large datasets

### Under Consideration (v2.0.0)
- Semantic search with embeddings
- Multi-user session management
- Real-time conversation sync
- Plugin architecture for extensions

---

*For issues, feature requests, or contributions, please visit our [GitHub repository](https://github.com/yourusername/claude-memory-simple).*