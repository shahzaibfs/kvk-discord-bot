const { createClient } = require("redis");
const config = require("../config");
const { success, info, error, warn } = require("../utils/Console");

class RedisClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    if (this.client?.isOpen) {
      return this.client;
    }

    this.client = createClient(config.redis);

    this.client.on("connect", () => {
      success("[Redis] Connected");
    });

    this.client.on("reconnecting", () => {
      warn("[Redis] Reconnecting...");
    });

    this.client.on("error", (err) => {
      error("[Redis]", err);
    });

    this.client.on("end", () => {
      info("[Redis] Disconnected");
    });

    await this.client.connect();

    return this.client;
  }

  getClient() {
    if (!this.client) {
      throw new Error("Redis has not been connected.");
    }

    return this.client;
  }

  async disconnect() {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }
}

module.exports = new RedisClient();
