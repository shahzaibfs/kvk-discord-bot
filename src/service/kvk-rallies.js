const redis = require("../redis");

class RallyLeaderService {
  getKey(guildId) {
    return `kvk:guild:${guildId}:rally-leaders`;
  }

  async getAll(guildId) {
    const leaders = await redis.getClient().hGetAll(this.getKey(guildId));

    console.log(leaders);

    return Object.fromEntries(
      Object.entries(leaders).map(([name, value]) => [name, JSON.parse(value)]),
    );
  }

  async get(guildId, leaderName) {
    const leader = await redis
      .getClient()
      .hGet(this.getKey(guildId), leaderName);

    return leader ? JSON.parse(leader) : null;
  }

  async save(guildId, leader) {
    const key = this.getKey(guildId);
    const db = redis.getClient();

    await db.hSet(key, leader.name, JSON.stringify(leader));

    return leader;
  }

  async remove(guildId, leaderName) {
    return redis.getClient().hDel(this.getKey(guildId), leaderName);
  }

  async reset(guildId) {
    return redis.getClient().del(this.getKey(guildId));
  }

  async exists(guildId, leaderName) {
    return redis.getClient().hExists(this.getKey(guildId), leaderName);
  }
}

module.exports = new RallyLeaderService();
