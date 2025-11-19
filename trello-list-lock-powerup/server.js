/**
 * Enhanced Express server to enforce list title locks via Trello webhooks
 * This server monitors list updates and automatically reverts name changes on locked lists
 * Supports desktop AND mobile Trello apps
 */

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(express.static('.')); // Serve Power-Up files

// Configuration - Set these as environment variables
const TRELLO_API_KEY = process.env.TRELLO_API_KEY || 'your-api-key';
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'your-token';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
const PORT = process.env.PORT || 3000;

// Store locked list data (in production, use a database)
const lockedLists = new Map();

// Activity log for debugging and monitoring (keep last 50 events)
const activityLog = [];
const MAX_LOG_SIZE = 50;

// Statistics
const stats = {
  totalWebhooks: 0,
  listUpdates: 0,
  lockedReverts: 0,
  errors: 0,
  lastActivity: null
};

// Helper to add activity log entry
function logActivity(type, message, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    data
  };
  activityLog.unshift(entry);
  if (activityLog.length > MAX_LOG_SIZE) {
    activityLog.pop();
  }
  stats.lastActivity = entry.timestamp;
}

// Verify webhook signature
function verifyWebhook(request, secret) {
  const signature = request.headers['x-trello-webhook'];
  const payload = JSON.stringify(request.body) + process.env.CALLBACK_URL;
  const hash = crypto.createHmac('sha1', secret).update(payload).digest('base64');
  return signature === hash;
}

// Get list data from Trello (with retry logic)
async function getList(listId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(
        `https://api.trello.com/1/lists/${listId}`,
        {
          params: {
            key: TRELLO_API_KEY,
            token: TRELLO_TOKEN,
            pluginData: true
          },
          timeout: 10000 // 10 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching list (attempt ${attempt}/${retries}):`, error.message);
      logActivity('error', `Failed to fetch list ${listId}`, { attempt, error: error.message });

      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        stats.errors++;
        return null;
      }
    }
  }
  return null;
}

// Update list name (with retry logic)
async function updateListName(listId, name, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await axios.put(
        `https://api.trello.com/1/lists/${listId}`,
        null,
        {
          params: {
            key: TRELLO_API_KEY,
            token: TRELLO_TOKEN,
            name: name
          },
          timeout: 10000 // 10 second timeout
        }
      );
      console.log(`✅ Reverted list ${listId} to: "${name}"`);
      logActivity('revert', `Successfully reverted list to "${name}"`, { listId, name });
      stats.lockedReverts++;
      return true;
    } catch (error) {
      console.error(`Error updating list (attempt ${attempt}/${retries}):`, error.message);
      logActivity('error', `Failed to revert list ${listId}`, { attempt, error: error.message });

      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        stats.errors++;
        return false;
      }
    }
  }
  return false;
}

// Webhook endpoint - HEAD request for verification
app.head('/webhook', (req, res) => {
  res.status(200).send();
});

// Webhook endpoint - POST for events
app.post('/webhook', async (req, res) => {
  // Acknowledge webhook immediately (Trello requires quick response)
  res.status(200).send('OK');

  stats.totalWebhooks++;

  const action = req.body.action;
  const model = req.body.model;

  // Log all webhook events for debugging
  logActivity('webhook', `Received webhook: ${action?.type || 'unknown'}`, {
    actionType: action?.type,
    memberCreator: action?.memberCreator?.username || 'unknown'
  });

  // Check if this is a list update action
  if (action && action.type === 'updateList' && action.data.list) {
    const listId = action.data.list.id;
    const oldName = action.data.old?.name;
    const newName = action.data.list.name;
    const memberName = action.memberCreator?.username || action.memberCreator?.fullName || 'Unknown user';

    // Only proceed if the name actually changed
    if (oldName && newName && oldName !== newName) {
      stats.listUpdates++;
      console.log(`📝 List renamed by ${memberName}: "${oldName}" → "${newName}"`);
      console.log(`   Source: ${action.display?.translationKey || 'unknown'}`);

      logActivity('list-update', `List renamed: "${oldName}" → "${newName}"`, {
        listId,
        oldName,
        newName,
        memberName
      });

      // Get the list's lock status from Trello's plugin data
      const listData = await getList(listId);

      if (listData && listData.pluginData) {
        // Check if list is locked
        const lockData = listData.pluginData.find(
          pd => pd.idPlugin === TRELLO_API_KEY && pd.scope === 'list'
        );

        if (lockData && lockData.value) {
          try {
            const pluginData = JSON.parse(lockData.value);
            if (pluginData.shared && pluginData.shared.isLocked) {
              const originalName = pluginData.shared.originalName || oldName;
              console.log(`🔒 List "${listId}" is LOCKED. Reverting to: "${originalName}"`);
              console.log(`   This works for BOTH desktop and mobile Trello apps!`);

              logActivity('lock-detected', `Locked list detected, reverting`, {
                listId,
                originalName,
                attemptedName: newName,
                memberName
              });

              // Revert the name change (works for mobile AND desktop)
              const success = await updateListName(listId, originalName);

              if (success) {
                console.log(`✅ Successfully protected list from unauthorized rename (even from mobile!)`);
              } else {
                console.error(`❌ Failed to revert list name after multiple attempts`);
              }
            } else {
              console.log(`📝 List is not locked, name change allowed`);
            }
          } catch (error) {
            console.error('Error parsing plugin data:', error.message);
            logActivity('error', `Failed to parse plugin data for list ${listId}`, { error: error.message });
            stats.errors++;
          }
        } else {
          console.log(`📝 No lock data found for list, name change allowed`);
        }
      }
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Trello List Lock Power-Up',
    timestamp: new Date().toISOString(),
    stats,
    mobileProtection: 'enabled',
    webhookActive: stats.totalWebhooks > 0
  });
});

// Activity dashboard endpoint
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>List Lock Dashboard</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f6f8;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          color: #172b4d;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #5e6c84;
          margin-bottom: 30px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #0079bf;
        }
        .stat-label {
          font-size: 14px;
          color: #5e6c84;
          margin-top: 5px;
        }
        .activity-log {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 20px;
        }
        .log-entry {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
        }
        .log-entry:last-child {
          border-bottom: none;
        }
        .log-time {
          color: #5e6c84;
          font-size: 11px;
        }
        .log-type {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          margin-right: 8px;
        }
        .log-type-webhook { background: #e3fcef; color: #00875a; }
        .log-type-list-update { background: #fff4e6; color: #ff8b00; }
        .log-type-revert { background: #ffe5e5; color: #d32f2f; }
        .log-type-lock-detected { background: #fce4ec; color: #c2185b; }
        .log-type-error { background: #ffebee; color: #c62828; }
        .status-indicator {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #61bd4f;
          margin-right: 8px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .mobile-status {
          background: #e3fcef;
          border-left: 4px solid #61bd4f;
          padding: 15px;
          border-radius: 3px;
          margin-bottom: 20px;
        }
        .mobile-status strong {
          color: #00875a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔒 List Lock Protection Dashboard</h1>
        <p class="subtitle">
          <span class="status-indicator"></span>
          Active and monitoring • Protects desktop AND mobile
        </p>

        <div class="mobile-status">
          <strong>📱 Mobile Protection: ENABLED</strong><br>
          This server monitors ALL list changes from any platform (web, mobile, API) and automatically reverts unauthorized renames.
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-value" id="totalWebhooks">0</div>
            <div class="stat-label">Total Webhooks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="listUpdates">0</div>
            <div class="stat-label">List Renames</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="lockedReverts">0</div>
            <div class="stat-label">Protected (Reverted)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="errors">0</div>
            <div class="stat-label">Errors</div>
          </div>
        </div>

        <div class="activity-log">
          <h2 style="margin-top: 0;">Recent Activity</h2>
          <div id="activity"></div>
        </div>
      </div>

      <script>
        function loadData() {
          fetch('/api/stats')
            .then(r => r.json())
            .then(data => {
              document.getElementById('totalWebhooks').textContent = data.stats.totalWebhooks;
              document.getElementById('listUpdates').textContent = data.stats.listUpdates;
              document.getElementById('lockedReverts').textContent = data.stats.lockedReverts;
              document.getElementById('errors').textContent = data.stats.errors;

              const activity = document.getElementById('activity');
              if (data.activityLog.length === 0) {
                activity.innerHTML = '<p style="color: #5e6c84; text-align: center; padding: 20px;">No activity yet. Waiting for events...</p>';
              } else {
                activity.innerHTML = data.activityLog.map(entry => {
                  const time = new Date(entry.timestamp).toLocaleString();
                  return \`
                    <div class="log-entry">
                      <div>
                        <span class="log-type log-type-\${entry.type}">\${entry.type}</span>
                        \${entry.message}
                      </div>
                      <div class="log-time">\${time}</div>
                    </div>
                  \`;
                }).join('');
              }
            });
        }

        // Load data immediately and refresh every 5 seconds
        loadData();
        setInterval(loadData, 5000);
      </script>
    </body>
    </html>
  `);
});

// Stats API endpoint (for dashboard)
app.get('/api/stats', (req, res) => {
  res.json({
    stats,
    activityLog,
    mobileProtection: 'enabled',
    serverUptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Setup webhook endpoint
app.post('/api/setup-webhook', async (req, res) => {
  const { boardId, callbackUrl } = req.body;

  if (!boardId || !callbackUrl) {
    return res.status(400).json({
      error: 'Missing boardId or callbackUrl'
    });
  }

  try {
    const response = await axios.post(
      'https://api.trello.com/1/webhooks',
      null,
      {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          callbackURL: `${callbackUrl}/webhook`,
          idModel: boardId,
          description: 'List Title Lock Webhook'
        }
      }
    );

    res.json({
      success: true,
      webhook: response.data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create webhook',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 List Lock Power-Up Server Started`);
  console.log(`${'='.repeat(60)}\n`);

  console.log(`📱 Mobile Protection: ENABLED`);
  console.log(`   Automatically reverts list renames from ANY platform:`);
  console.log(`   ✅ Desktop web browser`);
  console.log(`   ✅ Mobile apps (iOS & Android)`);
  console.log(`   ✅ API calls`);
  console.log(`   ✅ Third-party integrations\n`);

  console.log(`🌐 Server Status:`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Webhook: http://localhost:${PORT}/webhook`);
  console.log(`   Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);

  console.log(`🔑 Configuration:`);
  console.log(`   API Key: ${TRELLO_API_KEY.substring(0, 8)}...`);
  console.log(`   Token: ${TRELLO_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Callback URL: ${process.env.CALLBACK_URL || '❌ Not set'}\n`);

  if (!process.env.TRELLO_API_KEY || TRELLO_API_KEY === 'your-api-key') {
    console.log(`⚠️  WARNING: TRELLO_API_KEY not configured`);
  }
  if (!process.env.TRELLO_TOKEN || TRELLO_TOKEN === 'your-token') {
    console.log(`⚠️  WARNING: TRELLO_TOKEN not configured`);
  }
  if (!process.env.CALLBACK_URL) {
    console.log(`⚠️  WARNING: CALLBACK_URL not configured`);
  }

  if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_TOKEN || !process.env.CALLBACK_URL) {
    console.log(`\n📋 Required Environment Variables:`);
    console.log(`   TRELLO_API_KEY=your-api-key`);
    console.log(`   TRELLO_TOKEN=your-token`);
    console.log(`   CALLBACK_URL=https://your-app.glitch.me\n`);
  } else {
    console.log(`✅ All configuration complete!\n`);
  }

  console.log(`📊 View real-time dashboard: ${process.env.CALLBACK_URL || 'http://localhost:' + PORT}/dashboard`);
  console.log(`${'='.repeat(60)}\n`);

  logActivity('server-start', 'Server started successfully', { port: PORT, mobileProtection: 'enabled' });
});

module.exports = app;
