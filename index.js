const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(express.json());

app.post('/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'push') {
    const commits = payload.commits.map(c =>
      `- [\`${c.id.slice(0, 7)}\`] ${c.message} (${c.author.name})`
    ).join('\n');

    const message = `📦 **${payload.pusher.name}** pushed to \`${payload.repository.name}\`:\n${commits}`;
    await axios.post(DISCORD_WEBHOOK_URL, { content: message });
  }

  if (event === 'ping') {
    await axios.post(DISCORD_WEBHOOK_URL, { content: '📡 GitHub webhook connected successfully!' });
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("🚀 Webhook server running on port 3000"));