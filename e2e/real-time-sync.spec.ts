/**
 * E2E Testing for Real-Time Sync Functionality
 * 
 * End-to-end tests for WebSocket communication, real-time updates,
 * offline queue management, and cross-client synchronization.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { WebSocket } from 'ws';

// Test configuration
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const WS_URL = process.env.WS_URL || 'ws://localhost:8080/ws';

// Mock WebSocket server for testing
class MockWebSocketServer {
  private server: any;
  private clients: Set<WebSocket> = new Set();
  private port: number;
  
  constructor(port: number = 8080) {
    this.port = port;
  }
  
  async start() {
    const { WebSocketServer } = await import('ws');
    this.server = new WebSocketServer({ port: this.port });
    
    this.server.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        this.clients.delete(ws);
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        timestamp: Date.now(),
      }));
    });
  }
  
  private handleMessage(sender: WebSocket, message: any) {
    switch (message.type) {
      case 'subscribe':
        // Echo subscription confirmation
        sender.send(JSON.stringify({
          type: 'subscribed',
          id: message.id,
          subscription: message.subscription,
        }));
        break;
        
      case 'data':
        // Broadcast data to all other clients
        this.broadcast(message, sender);
        break;
        
      case 'ping':
        // Respond with pong
        sender.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
        }));
        break;
    }
  }
  
  broadcast(message: any, exclude?: WebSocket) {
    this.clients.forEach(client => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  sendToAll(message: any) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  async stop() {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server.close(resolve);
      });
    }
  }
  
  getClientCount() {
    return this.clients.size;
  }
}

// Helper functions
async function waitForWebSocket(page: Page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      return window.syncManager && window.syncManager.getConnectionStatus().connected;
    },
    { timeout }
  );
}

async function simulateMachineUpdate(server: MockWebSocketServer, position: { x: number; y: number; z: number }) {
  server.sendToAll({
    type: 'data',
    data: {
      type: 'machine',
      payload: {
        position,
        timestamp: Date.now(),
      },
    },
  });
}

async function simulateJobUpdate(server: MockWebSocketServer, jobId: string, progress: number) {
  server.sendToAll({
    type: 'data',
    data: {
      type: 'job',
      payload: {
        jobId,
        progress,
        timestamp: Date.now(),
      },
    },
  });
}

// Test suite
test.describe('Real-Time Sync E2E Tests', () => {
  let mockServer: MockWebSocketServer;
  
  test.beforeAll(async () => {
    mockServer = new MockWebSocketServer();
    await mockServer.start();
  });
  
  test.afterAll(async () => {
    await mockServer.stop();
  });
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(APP_URL);
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
  });
  
  test.describe('WebSocket Connection', () => {
    test('should establish WebSocket connection on page load', async ({ page }) => {
      // Wait for WebSocket connection to be established
      await waitForWebSocket(page);
      
      // Check connection status in the UI
      const connectionStatus = await page.evaluate(() => {
        return window.syncManager.getConnectionStatus();
      });
      
      expect(connectionStatus.connected).toBe(true);
      expect(mockServer.getClientCount()).toBe(1);
    });
    
    test('should handle connection failures gracefully', async ({ page }) => {
      // Stop the mock server to simulate connection failure
      await mockServer.stop();
      
      // Check that the application handles the disconnection
      await page.waitForFunction(
        () => {
          const status = window.syncManager?.getConnectionStatus();
          return status && !status.connected;
        },
        { timeout: 10000 }
      );
      
      const connectionStatus = await page.evaluate(() => {
        return window.syncManager.getConnectionStatus();
      });
      
      expect(connectionStatus.connected).toBe(false);
      
      // Restart server for subsequent tests
      mockServer = new MockWebSocketServer();
      await mockServer.start();
    });
    
    test('should reconnect automatically after connection loss', async ({ page }) => {
      // First establish connection
      await waitForWebSocket(page);
      
      // Stop and restart server to simulate connection loss
      await mockServer.stop();
      mockServer = new MockWebSocketServer();
      await mockServer.start();
      
      // Wait for automatic reconnection
      await waitForWebSocket(page, 15000);
      
      const connectionStatus = await page.evaluate(() => {
        return window.syncManager.getConnectionStatus();
      });
      
      expect(connectionStatus.connected).toBe(true);
    });
  });
  
  test.describe('Real-Time Data Synchronization', () => {
    test('should sync machine position updates in real-time', async ({ page }) => {
      await waitForWebSocket(page);
      
      // Navigate to controls page to see machine position
      await page.click('[data-testid="nav-controls"]');
      
      // Simulate machine position update from server
      await simulateMachineUpdate(mockServer, { x: 100, y: 200, z: 50 });
      
      // Wait for position to update in UI
      await page.waitForFunction(
        () => {
          const machineStore = window.stores?.machine?.getState();
          return machineStore?.machine.position.x === 100 &&
                 machineStore?.machine.position.y === 200 &&
                 machineStore?.machine.position.z === 50;
        },
        { timeout: 5000 }
      );
      
      // Verify position is displayed in UI
      await expect(page.locator('[data-testid="position-x"]')).toContainText('100');
      await expect(page.locator('[data-testid="position-y"]')).toContainText('200');
      await expect(page.locator('[data-testid="position-z"]')).toContainText('50');
    });
    
    test('should sync job progress updates across clients', async ({ page }) => {
      await waitForWebSocket(page);
      
      // Navigate to jobs page
      await page.click('[data-testid="nav-jobs"]');
      
      // Add a test job through UI
      await page.click('[data-testid="add-job-button"]');
      await page.fill('[data-testid="job-name"]', 'Sync Test Job');
      await page.click('[data-testid="save-job"]');
      
      // Get the job ID
      const jobId = await page.evaluate(() => {
        const jobStore = window.stores?.job?.getState();
        return jobStore?.queue.jobs[0]?.id;
      });
      
      // Simulate job progress update from server
      await simulateJobUpdate(mockServer, jobId, 75);
      
      // Wait for progress to update in UI
      await page.waitForFunction(
        (expectedJobId) => {
          const jobStore = window.stores?.job?.getState();
          const job = jobStore?.queue.jobs.find(j => j.id === expectedJobId);
          return job?.progress === 75;
        },
        jobId,
        { timeout: 5000 }
      );
      
      // Verify progress is displayed in UI
      await expect(page.locator('[data-testid="job-progress"]')).toContainText('75%');
    });
  });
  
  test.describe('Multi-Client Synchronization', () => {
    test('should sync data between multiple browser instances', async ({ browser }) => {
      // Create two browser contexts (simulating two users)
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      // Navigate both pages to the application
      await page1.goto(APP_URL);
      await page2.goto(APP_URL);
      
      // Wait for both to connect
      await waitForWebSocket(page1);
      await waitForWebSocket(page2);
      
      // Verify both clients are connected
      expect(mockServer.getClientCount()).toBe(2);
      
      // Navigate both to controls page
      await page1.click('[data-testid="nav-controls"]');
      await page2.click('[data-testid="nav-controls"]');
      
      // Update position from page1
      await page1.click('[data-testid="jog-x-plus"]');
      
      // Wait for the update to sync to page2
      await page2.waitForFunction(
        () => {
          const machineStore = window.stores?.machine?.getState();
          return machineStore?.machine.position.x > 0;
        },
        { timeout: 5000 }
      );
      
      // Verify both pages show the same position
      const position1 = await page1.evaluate(() => {
        return window.stores?.machine?.getState().machine.position;
      });
      
      const position2 = await page2.evaluate(() => {
        return window.stores?.machine?.getState().machine.position;
      });
      
      expect(position1).toEqual(position2);
      
      await context1.close();
      await context2.close();
    });
  });
  
  test.describe('Offline Queue Management', () => {
    test('should queue messages when offline and send when reconnected', async ({ page }) => {
      await waitForWebSocket(page);
      
      // Navigate to controls page
      await page.click('[data-testid="nav-controls"]');
      
      // Disconnect from server
      await mockServer.stop();
      
      // Wait for disconnection
      await page.waitForFunction(
        () => {
          const status = window.syncManager?.getConnectionStatus();
          return status && !status.connected;
        },
        { timeout: 10000 }
      );
      
      // Perform actions while offline (should be queued)
      await page.click('[data-testid="jog-x-plus"]');
      await page.click('[data-testid="jog-y-plus"]');
      
      // Verify messages are queued
      const queueSize = await page.evaluate(() => {
        return window.syncManager.getConnectionStatus().queueSize;
      });
      
      expect(queueSize).toBeGreaterThan(0);
      
      // Reconnect
      mockServer = new MockWebSocketServer();
      await mockServer.start();
      
      // Wait for reconnection and queue processing
      await waitForWebSocket(page, 15000);
      
      // Verify queue is cleared
      const finalQueueSize = await page.evaluate(() => {
        return window.syncManager.getConnectionStatus().queueSize;
      });
      
      expect(finalQueueSize).toBe(0);
    });
  });
  
  test.describe('Conflict Resolution', () => {
    test('should resolve conflicts when multiple clients modify same data', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      await page1.goto(APP_URL);
      await page2.goto(APP_URL);
      
      await waitForWebSocket(page1);
      await waitForWebSocket(page2);
      
      // Navigate both to settings page
      await page1.click('[data-testid="nav-settings"]');
      await page2.click('[data-testid="nav-settings"]');
      
      // Both clients try to update the same setting simultaneously
      await Promise.all([
        page1.fill('[data-testid="machine-name"]', 'Machine from Client 1'),
        page2.fill('[data-testid="machine-name"]', 'Machine from Client 2'),
      ]);
      
      await Promise.all([
        page1.click('[data-testid="save-settings"]'),
        page2.click('[data-testid="save-settings"]'),
      ]);
      
      // Wait for conflict resolution
      await page1.waitForTimeout(2000);
      await page2.waitForTimeout(2000);
      
      // Verify both clients converge to the same state
      const settings1 = await page1.evaluate(() => {
        return window.stores?.settings?.getState().settings.machine.name;
      });
      
      const settings2 = await page2.evaluate(() => {
        return window.stores?.settings?.getState().settings.machine.name;
      });
      
      // Should have same final state (last writer wins or specific conflict resolution)
      expect(settings1).toBe(settings2);
      
      await context1.close();
      await context2.close();
    });
  });
  
  test.describe('Performance and Stress Testing', () => {
    test('should handle high-frequency updates without performance degradation', async ({ page }) => {
      await waitForWebSocket(page);
      await page.click('[data-testid="nav-controls"]');
      
      // Send rapid position updates
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        await simulateMachineUpdate(mockServer, { x: i, y: i * 2, z: i / 2 });
        
        // Small delay to avoid overwhelming
        if (i % 10 === 0) {
          await page.waitForTimeout(10);
        }
      }
      
      // Verify final state is reached within reasonable time
      await page.waitForFunction(
        () => {
          const machineStore = window.stores?.machine?.getState();
          return machineStore?.machine.position.x === 99;
        },
        { timeout: 10000 }
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should handle 100 updates in less than 10 seconds
      expect(duration).toBeLessThan(10000);
      
      // Verify UI is still responsive
      await page.click('[data-testid="jog-x-plus"]');
      
      await page.waitForFunction(
        () => {
          const machineStore = window.stores?.machine?.getState();
          return machineStore?.machine.position.x === 100;
        },
        { timeout: 2000 }
      );
    });
    
    test('should maintain sync with multiple concurrent users', async ({ browser }) => {
      // Create 5 browser contexts
      const contexts = await Promise.all(
        Array.from({ length: 5 }, () => browser.newContext())
      );
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );
      
      // Navigate all pages to the application
      await Promise.all(
        pages.map(page => page.goto(APP_URL))
      );
      
      // Wait for all to connect
      await Promise.all(
        pages.map(page => waitForWebSocket(page))
      );
      
      // Verify all clients are connected
      expect(mockServer.getClientCount()).toBe(5);
      
      // Navigate all to controls page
      await Promise.all(
        pages.map(page => page.click('[data-testid="nav-controls"]'))
      );
      
      // Each client performs some actions
      await Promise.all(
        pages.map(async (page, index) => {
          for (let i = 0; i < 5; i++) {
            await page.click('[data-testid="jog-x-plus"]');
            await page.waitForTimeout(100 * index); // Stagger actions
          }
        })
      );
      
      // Wait for synchronization
      await page.waitForTimeout(5000);
      
      // Verify all clients have the same final state
      const positions = await Promise.all(
        pages.map(page =>
          page.evaluate(() => {
            return window.stores?.machine?.getState().machine.position;
          })
        )
      );
      
      // All positions should be the same
      const firstPosition = positions[0];
      positions.forEach(position => {
        expect(position).toEqual(firstPosition);
      });
      
      // Clean up
      await Promise.all(contexts.map(context => context.close()));
    });
  });
  
  test.describe('Error Handling and Recovery', () => {
    test('should handle WebSocket errors gracefully', async ({ page }) => {
      await waitForWebSocket(page);
      
      // Simulate server error by sending invalid message
      await page.evaluate(() => {
        // Inject a malformed message directly into WebSocket
        if (window.syncManager && window.syncManager.ws) {
          window.syncManager.ws.send('invalid json{');
        }
      });
      
      // Application should continue functioning
      await page.click('[data-testid="nav-controls"]');
      await page.click('[data-testid="jog-x-plus"]');
      
      // Verify application is still responsive
      await page.waitForFunction(
        () => {
          const machineStore = window.stores?.machine?.getState();
          return machineStore?.machine.position.x > 0;
        },
        { timeout: 5000 }
      );
    });
    
    test('should recover from temporary network issues', async ({ page }) => {
      await waitForWebSocket(page);
      
      // Simulate network interruption
      await page.route('**/*', route => route.abort());
      
      // Wait for disconnection
      await page.waitForFunction(
        () => {
          const status = window.syncManager?.getConnectionStatus();
          return status && !status.connected;
        },
        { timeout: 10000 }
      );
      
      // Remove network block
      await page.unroute('**/*');
      
      // Wait for automatic recovery
      await waitForWebSocket(page, 20000);
      
      // Verify functionality is restored
      await page.click('[data-testid="nav-controls"]');
      await page.click('[data-testid="jog-x-plus"]');
      
      await page.waitForFunction(
        () => {
          const machineStore = window.stores?.machine?.getState();
          return machineStore?.machine.position.x > 0;
        },
        { timeout: 5000 }
      );
    });
  });
});

// Helper test to verify WebSocket server functionality
test.describe('WebSocket Server Tests', () => {
  test('should handle multiple concurrent connections', async () => {
    const server = new MockWebSocketServer(8081);
    await server.start();
    
    // Create multiple WebSocket connections
    const connections = await Promise.all(
      Array.from({ length: 10 }, () => {
        return new Promise<WebSocket>((resolve) => {
          const ws = new WebSocket('ws://localhost:8081');
          ws.on('open', () => resolve(ws));
        });
      })
    );
    
    expect(server.getClientCount()).toBe(10);
    
    // Close connections
    connections.forEach(ws => ws.close());
    
    // Wait for connections to close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(server.getClientCount()).toBe(0);
    
    await server.stop();
  });
});
