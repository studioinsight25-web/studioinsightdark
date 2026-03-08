// Discord client (lazy loaded to avoid build issues)
let discordClient = null;

async function getDiscordClient() {
  if (!discordClient && process.env.DISCORD_BOT_TOKEN) {
    try {
      const { Client, GatewayIntentBits } = await import('discord.js');
      discordClient = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
        ],
      });
      await discordClient.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      console.error('Failed to initialize Discord client:', error);
    }
  }
  return discordClient;
}

export { getDiscordClient };

export async function grantDiscordAccess(email) {
  try {
    if (!process.env.DISCORD_GUILD_ID || !process.env.DISCORD_PREMIUM_ROLE_ID) {
      console.log('Discord not configured, skipping access grant');
      return { success: false, message: 'Discord not configured' };
    }

    const client = await getDiscordClient();
    if (!client) {
      return { success: false, message: 'Discord client not available' };
    }

    // Wait for bot to be ready
    if (!client.isReady()) {
      await new Promise((resolve) => {
        client.once('ready', resolve);
      });
    }

    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) {
      throw new Error('Discord guild not found');
    }

    // Find user by email (this would need to be stored in Discord user's custom status or nickname)
    // For now, we'll generate a temporary invite link
    const invite = await guild.invites.create(guild.channels.cache.first(), {
      maxAge: 86400, // 24 hours
      maxUses: 1,
      unique: true,
    });

    return {
      success: true,
      inviteUrl: invite.url,
      expiresAt: new Date(Date.now() + 86400 * 1000), // 24 hours from now
    };
  } catch (error) {
    console.error('Error granting Discord access:', error);
    return { success: false, message: error.message };
  }
}

export async function createDiscordInvite() {
  try {
    if (!process.env.DISCORD_GUILD_ID) {
      throw new Error('Discord guild not configured');
    }

    const client = await getDiscordClient();
    if (!client) {
      return { success: false, message: 'Discord client not available' };
    }

    if (!client.isReady()) {
      await new Promise((resolve) => {
        client.once('ready', resolve);
      });
    }

    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) {
      throw new Error('Discord guild not found');
    }

    const invite = await guild.invites.create(guild.channels.cache.first(), {
      maxAge: 86400, // 24 hours
      maxUses: 1,
      unique: true,
    });

    return {
      success: true,
      inviteUrl: invite.url,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    };
  } catch (error) {
    console.error('Error creating Discord invite:', error);
    return { success: false, message: error.message };
  }
}
