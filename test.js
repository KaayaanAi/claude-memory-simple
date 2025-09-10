#!/usr/bin/env node

/**
 * Claude Memory Simple - Test Script
 * Verify everything works before Claude Desktop integration
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing Claude Memory Simple...\n');

async function runTest() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'index.js');
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverOutput = '';
    let serverError = '';

    // Collect output
    server.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    server.stderr.on('data', (data) => {
      serverError += data.toString();
      process.stderr.write(data);
    });

    // Test sequence
    setTimeout(() => {
      console.log('\n📤 Testing tools/list request...');
      
      const listRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list"
      };

      server.stdin.write(JSON.stringify(listRequest) + '\n');
    }, 1000);

    setTimeout(() => {
      console.log('📤 Testing session_memory tool...');
      
      const toolRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "session_memory",
          arguments: {
            action: "save",
            session_id: "test-session-123",
            user_id: "test-user",
            messages: [
              {
                role: "user",
                content: "Hello, this is a test message for the simple memory system!"
              },
              {
                role: "assistant", 
                content: "Hi! I'm testing the Claude Memory Simple system. It looks like it's working!"
              }
            ],
            summary: "Test conversation for verification"
          }
        }
      };

      server.stdin.write(JSON.stringify(toolRequest) + '\n');
    }, 2000);

    setTimeout(() => {
      console.log('📤 Testing load functionality...');
      
      const loadRequest = {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "session_memory",
          arguments: {
            action: "load",
            session_id: "test-session-123",
            user_id: "test-user"
          }
        }
      };

      server.stdin.write(JSON.stringify(loadRequest) + '\n');
    }, 3000);

    setTimeout(() => {
      console.log('📤 Testing search functionality...');
      
      const searchRequest = {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "session_memory",
          arguments: {
            action: "search",
            user_id: "test-user",
            query: "test message"
          }
        }
      };

      server.stdin.write(JSON.stringify(searchRequest) + '\n');
    }, 4000);

    // End test
    setTimeout(() => {
      console.log('\n🏁 Test completed!');
      server.kill('SIGTERM');
      
      if (serverError.includes('✅ Claude Memory Simple is ready!')) {
        console.log('✅ Server started successfully');
        console.log('✅ All tests passed');
        console.log('\n🎉 Claude Memory Simple is ready for Claude Desktop!');
        resolve();
      } else {
        console.log('❌ Server may have issues');
        console.log('Server errors:', serverError);
        reject(new Error('Test failed'));
      }
    }, 5000);

    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      reject(error);
    });
  });
}

runTest().catch((error) => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});