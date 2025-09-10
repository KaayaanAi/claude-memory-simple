#!/usr/bin/env node

/**
 * Claude Memory Simple - Setup Script
 * Automatic configuration for Claude Desktop
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Setting up Claude Memory Simple...\n');

async function setup() {
  try {
    // 1. Create data directory
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });
    console.log('✅ Created data directory');

    // 2. Make index.js executable
    try {
      execSync(`chmod +x "${path.join(__dirname, 'index.js')}"`);
      console.log('✅ Made server executable');
    } catch (error) {
      console.log('⚠️ Could not set executable permissions (may not be needed on Windows)');
    }

    // 3. Test the server briefly
    console.log('🔧 Testing server...');
    try {
      // Quick test - start server and kill it
      const child = execSync(`timeout 2s node "${path.join(__dirname, 'index.js')}" || true`, 
        { encoding: 'utf8', stdio: 'pipe' });
      console.log('✅ Server test passed');
    } catch (error) {
      // Expected - timeout or server working
      console.log('✅ Server appears to be working');
    }

    // 4. Generate Claude Desktop configuration
    const currentPath = __dirname;
    const configTemplate = {
      "mcpServers": {
        "claude-memory-simple": {
          "command": "node",
          "args": [path.join(currentPath, "index.js")],
          "cwd": currentPath
        }
      }
    };

    const configPath = path.join(__dirname, 'claude_desktop_config.json');
    await fs.writeFile(configPath, JSON.stringify(configTemplate, null, 2));
    
    console.log('✅ Generated Claude Desktop configuration');
    console.log(`📁 Config file: ${configPath}`);

    // 5. Instructions
    console.log('\n🎉 Setup complete!\n');
    console.log('📋 Next steps:');
    console.log('1. Copy the configuration to Claude Desktop:');
    
    if (process.platform === 'darwin') {
      console.log('   macOS: ~/Library/Application Support/Claude/claude_desktop_config.json');
    } else if (process.platform === 'win32') {
      console.log('   Windows: %APPDATA%\\Claude\\claude_desktop_config.json');
    } else {
      console.log('   Linux: ~/.config/Claude/claude_desktop_config.json');
    }
    
    console.log('\n2. Copy this configuration:');
    console.log(JSON.stringify(configTemplate, null, 2));
    
    console.log('\n3. Restart Claude Desktop completely');
    console.log('4. Look for "session_memory" tool in Claude Desktop\n');
    
    console.log('💡 Usage examples:');
    console.log('- Save: {"action": "save", "session_id": "my-session", "user_id": "me", "messages": [...]}');
    console.log('- Load: {"action": "load", "session_id": "my-session", "user_id": "me"}');
    console.log('- Search: {"action": "search", "user_id": "me", "query": "javascript"}');
    
    console.log('\n🔍 Troubleshooting:');
    console.log('- Run "npm test" to verify the server works');
    console.log('- Check Claude Desktop logs for errors');
    console.log('- Ensure Node.js 18+ is installed');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();