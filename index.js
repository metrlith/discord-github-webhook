const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(express.json());

app.post('/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  try {
    if (event === 'ping') {
      await axios.post(DISCORD_WEBHOOK_URL, { content: '📡 GitHub webhook connected successfully!' });
    }

    else if (event === 'push') {
      const commits = payload.commits.map(c =>
        `- [\`${c.id.slice(0, 7)}\`] ${c.message} (${c.author.name})`
      ).join('\n');

      const message = `📦 **${payload.pusher.name}** pushed to \`${payload.repository.name}\`:\n${commits}`;
      await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    }

    else if (event === 'pull_request') {
      const action = payload.action;
      const pr = payload.pull_request;

      const message = `🔀 **${payload.sender.login}** ${action} a pull request in \`${payload.repository.name}\`:\n` +
                      `[#${pr.number}] ${pr.title}\n` +
                      `<${pr.html_url}>`;

      await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    }

    else if (event === 'issues') {
      const action = payload.action;
      const issue = payload.issue;

      const message = `📌 **${payload.sender.login}** ${action} an issue in \`${payload.repository.name}\`:\n` +
                      `[#${issue.number}] ${issue.title}\n` +
                      `<${issue.html_url}>`;

      await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    }

    else if (event === 'release') {
      const release = payload.release;

      const message = `🚀 **${payload.sender.login}** published a new release in \`${payload.repository.name}\`:\n` +
                      `**${release.name || release.tag_name}**\n` +
                      `${release.body?.substring(0, 200) || 'No description.'}\n` +
                      `<${release.html_url}>`;

      await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    }

    else {
      console.log(`🔍 Unhandled event: ${event}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error handling webhook:', err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("🚀 Webhook server running on port 3000"));