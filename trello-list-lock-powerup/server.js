/**
 * Simple Express server to enforce list title locks via Trello webhooks
 * This server monitors list updates and automatically reverts name changes on locked lists
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

// Verify webhook signature
function verifyWebhook(request, secret) {
  const signature = request.headers['x-trello-webhook'];
  const payload = JSON.stringify(request.body) + process.env.CALLBACK_URL;
  const hash = crypto.createHmac('sha1', secret).update(payload).digest('base64');
  return signature === hash;
}

// Get list data from Trello
async function getList(listId) {
  try {
    const response = await axios.get(
      `https://api.trello.com/1/lists/${listId}`,
      {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          pluginData: true
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching list:', error.message);
    return null;
  }
}

// Update list name
async function updateListName(listId, name) {
  try {
    await axios.put(
      `https://api.trello.com/1/lists/${listId}`,
      null,
      {
        params: {
          key: TRELLO_API_KEY,
          token: TRELLO_TOKEN,
          name: name
        }
      }
    );
    console.log(`✅ Reverted list ${listId} to: "${name}"`);
  } catch (error) {
    console.error('Error updating list:', error.message);
  }
}

// Webhook endpoint - HEAD request for verification
app.head('/webhook', (req, res) => {
  res.status(200).send();
});

// Webhook endpoint - POST for events
app.post('/webhook', async (req, res) => {
  // Acknowledge webhook immediately
  res.status(200).send('OK');

  const action = req.body.action;

  // Check if this is a list update action
  if (action && action.type === 'updateList' && action.data.list) {
    const listId = action.data.list.id;
    const oldName = action.data.old?.name;
    const newName = action.data.list.name;

    // Only proceed if the name actually changed
    if (oldName && newName && oldName !== newName) {
      console.log(`📝 List renamed: "${oldName}" → "${newName}"`);

      // Get the list's lock status
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
              console.log(`🔒 List "${listId}" is locked. Reverting to: "${originalName}"`);

              // Revert the name change
              await updateListName(listId, originalName);
            }
          } catch (error) {
            console.error('Error parsing plugin data:', error.message);
          }
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
  console.log(`🚀 List Lock Power-Up server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🔑 API Key: ${TRELLO_API_KEY.substring(0, 8)}...`);
  console.log(`\n⚠️  IMPORTANT: Set these environment variables:`);
  console.log(`   - TRELLO_API_KEY`);
  console.log(`   - TRELLO_TOKEN`);
  console.log(`   - CALLBACK_URL (your public server URL)\n`);
});

module.exports = app;
