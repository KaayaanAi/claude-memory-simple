#!/usr/bin/env node

/**
 * Claude Memory Simple - Bulletproof MCP Session Memory
 * Works out-of-the-box with Claude Desktop
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple configuration - no external dependencies
const CONFIG = {
  dataDir: path.join(__dirname, 'data'),
  maxSessions: 1000,
  maxMessageLength: 50000,
  enableSearch: true
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(CONFIG.dataDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error.message);
  }
}

// Simple file-based storage
class SessionStorage {
  constructor() {
    this.dataDir = CONFIG.dataDir;
  }

  getSessionPath(sessionId, userId) {
    const safeSessionId = sessionId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const safeUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.dataDir, `${safeUserId}_${safeSessionId}.json`);
  }

  async saveSession(sessionId, userId, data) {
    try {
      const filePath = this.getSessionPath(sessionId, userId);
      const sessionData = {
        sessionId,
        userId,
        savedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        ...data
      };
      
      await fs.writeFile(filePath, JSON.stringify(sessionData, null, 2));
      return { success: true, filePath };
    } catch (error) {
      console.error('Save session error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async loadSession(sessionId, userId) {
    try {
      const filePath = this.getSessionPath(sessionId, userId);
      const data = await fs.readFile(filePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { success: false, error: 'Session not found' };
      }
      console.error('Load session error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async searchSessions(userId, query) {
    try {
      const files = await fs.readdir(this.dataDir);
      const userFiles = files.filter(f => f.startsWith(`${userId.replace(/[^a-zA-Z0-9-_]/g, '_')}_`));
      const results = [];

      for (const file of userFiles.slice(0, 20)) { // Limit search results
        try {
          const filePath = path.join(this.dataDir, file);
          const data = await fs.readFile(filePath, 'utf8');
          const session = JSON.parse(data);
          
          // Simple text search in messages and summary
          const searchText = query.toLowerCase();
          let matches = false;
          
          if (session.summary?.toLowerCase().includes(searchText)) {
            matches = true;
          }
          
          if (session.messages) {
            for (const msg of session.messages) {
              if (msg.content?.toLowerCase().includes(searchText)) {
                matches = true;
                break;
              }
            }
          }
          
          if (matches) {
            results.push({
              sessionId: session.sessionId,
              summary: session.summary || 'No summary available',
              savedAt: session.savedAt,
              messageCount: session.messages?.length || 0
            });
          }
        } catch (err) {
          // Skip corrupted files
          continue;
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('Search sessions error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Initialize storage
const storage = new SessionStorage();

// Create MCP Server
const server = new Server(
  { name: 'claude-memory-simple', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Single tool that handles everything
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: 'session_memory',
      description: 'Save, load, and search conversation sessions. Supports three actions: save (store conversation), load (retrieve conversation), and search (find similar conversations).',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['save', 'load', 'search'],
            description: 'Action to perform: save, load, or search'
          },
          session_id: {
            type: 'string',
            description: 'Unique session identifier (required for save and load)'
          },
          user_id: {
            type: 'string',
            description: 'User identifier (required for all actions)',
            default: 'default_user'
          },
          messages: {
            type: 'array',
            description: 'Array of conversation messages (required for save action)',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                content: { type: 'string' },
                timestamp: { type: 'string' }
              },
              required: ['role', 'content']
            }
          },
          summary: {
            type: 'string',
            description: 'Optional conversation summary (for save action)'
          },
          query: {
            type: 'string',
            description: 'Search query (required for search action)'
          }
        },
        required: ['action', 'user_id']
      }
    }]
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name !== 'session_memory') {
    return {
      content: [{ type: 'text', text: 'Unknown tool' }],
      isError: true
    };
  }

  const { action, session_id, user_id = 'default_user', messages, summary, query } = args;

  try {
    switch (action) {
      case 'save':
        if (!session_id || !messages) {
          return {
            content: [{ type: 'text', text: 'Save action requires session_id and messages' }],
            isError: true
          };
        }

        // Generate simple summary if not provided
        const autoSummary = summary || generateSimpleSummary(messages);
        
        const saveResult = await storage.saveSession(session_id, user_id, {
          messages: messages.slice(0, 100), // Limit messages
          summary: autoSummary,
          messageCount: messages.length
        });

        if (saveResult.success) {
          return {
            content: [{
              type: 'text',
              text: `✅ Session saved successfully!\n\nSession ID: ${session_id}\nUser ID: ${user_id}\nMessages: ${messages.length}\nSummary: ${autoSummary}\n\nSaved to: ${saveResult.filePath}`
            }]
          };
        } else {
          return {
            content: [{ type: 'text', text: `❌ Save failed: ${saveResult.error}` }],
            isError: true
          };
        }

      case 'load':
        if (!session_id) {
          return {
            content: [{ type: 'text', text: 'Load action requires session_id' }],
            isError: true
          };
        }

        const loadResult = await storage.loadSession(session_id, user_id);

        if (loadResult.success) {
          const session = loadResult.data;
          const messagesText = session.messages
            ?.slice(-10) // Show last 10 messages
            .map(msg => `**${msg.role}**: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`)
            .join('\n\n') || 'No messages found';

          return {
            content: [{
              type: 'text',
              text: `✅ Session loaded successfully!\n\n**Session ID**: ${session.sessionId}\n**User ID**: ${session.userId}\n**Saved**: ${session.savedAt}\n**Messages**: ${session.messageCount || 0}\n\n**Summary**: ${session.summary || 'No summary available'}\n\n**Recent Messages**:\n${messagesText}`
            }]
          };
        } else {
          return {
            content: [{ type: 'text', text: `❌ Load failed: ${loadResult.error}` }],
            isError: true
          };
        }

      case 'search':
        if (!query) {
          return {
            content: [{ type: 'text', text: 'Search action requires query' }],
            isError: true
          };
        }

        const searchResult = await storage.searchSessions(user_id, query);

        if (searchResult.success) {
          if (searchResult.results.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `🔍 No sessions found matching: "${query}"\n\nTry different keywords or check if you have saved sessions.`
              }]
            };
          }

          const resultsText = searchResult.results
            .map(result => `**${result.sessionId}**\n📅 ${result.savedAt}\n💬 ${result.messageCount} messages\n📝 ${result.summary}`)
            .join('\n\n---\n\n');

          return {
            content: [{
              type: 'text',
              text: `🔍 Found ${searchResult.results.length} sessions matching: "${query}"\n\n${resultsText}`
            }]
          };
        } else {
          return {
            content: [{ type: 'text', text: `❌ Search failed: ${searchResult.error}` }],
            isError: true
          };
        }

      default:
        return {
          content: [{ type: 'text', text: 'Invalid action. Use: save, load, or search' }],
          isError: true
        };
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    return {
      content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
      isError: true
    };
  }
});

// Simple summary generator
function generateSimpleSummary(messages) {
  if (!messages || messages.length === 0) return 'Empty conversation';
  
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  
  const firstUserMessage = userMessages[0]?.content?.substring(0, 100) || 'No user message';
  const topics = extractTopics(messages);
  
  return `Conversation about ${topics}. Started with: "${firstUserMessage}${firstUserMessage.length >= 100 ? '...' : ''}" (${messages.length} messages, ${userMessages.length} from user, ${assistantMessages.length} responses)`;
}

function extractTopics(messages) {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  
  // Simple keyword detection
  const keywords = [
    'javascript', 'python', 'react', 'code', 'programming', 'api', 'database',
    'web', 'development', 'bug', 'error', 'help', 'question', 'project', 'task'
  ];
  
  const found = keywords.filter(keyword => allText.includes(keyword));
  
  if (found.length > 0) {
    return found.slice(0, 3).join(', ');
  }
  
  return 'general discussion';
}

// Main function
async function main() {
  try {
    console.error('🚀 Starting Claude Memory Simple...');
    
    await ensureDataDir();
    console.error(`📁 Data directory: ${CONFIG.dataDir}`);
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('✅ Claude Memory Simple is ready!');
    console.error('Available tool: session_memory (save/load/search)');
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('👋 Shutting down...');
  process.exit(0);
});

// Start the server
main().catch(console.error);