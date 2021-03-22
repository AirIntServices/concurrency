const { promisify } = require('util');
const RedisLock = require('redis-lock');
const { createClient } = require('redis');

class Concurrency {
  constructor(...config) {
    this.redis = createClient(...config);

    this.redisSet = promisify(this.redis.set).bind(this.redis);
    this.redisDel = promisify(this.redis.del).bind(this.redis);
  }

  /**
   * Will make sure that the provided function is run only once at a time across all the instances
   * And will queue subsequent calls until they can be processed. The order of the queue is not guaranteed (the first process to ask for the lock will get it if it's available)
   * Therefore this is not designed to handle a high traffic, order dependant queue, but more for long running jobs that can have a few items in the queue at most.
   *
   * @param {string} lockName A unique identifier for the lock
   * @param {decimal} retryIntervalMs The interval in ms at which we will retry to run if the queue was busy at last attempt
   * @param {*} timeOutMs The maximum time (in ms) to hold the lock for. If this time is exceeded, the lock is automatically released to prevent deadlocks.
   * @param {*} func The function to execute. Can be async (will be awaited)
   */
  async runSequentially(lockName, retryIntervalMs, timeOutMs, func) {
    const lock = promisify(RedisLock(this.redis, retryIntervalMs));
    const startTime = new Date().getTime();
    const unlock = await lock(lockName, timeOutMs);
    const endTime = new Date().getTime();
    const runDelay = (endTime - startTime) / 1000;

    let error;
    let result;

    try {
      result = await func(runDelay);
    } catch (err) {
      error = err;
    } finally {
      await unlock();
    }

    if (error) {
      throw error;
    }
    return result;
  }

  /**
   * Same behavior as runSequentially() but will not retry if the lock is already held by another process.
   * This is used to ensure that a certain job is performed only once among several instances.
   *
   * @param {*} lockName A unique identifier for the lock
   * @param {*} timeOutMs The maximum time (in ms) to hold the lock for. If this time is exceeded, the lock is automatically released to prevent deadlocks.
   * @param {*} func The function to execute. Can be async (will be awaited)
   * @param {*} onDidNotRun (Optional) Callback that will be called if the job did not run, passing the reason as a string param.
   */
  async runOnce(lockName, timeOutMs, func, onDidNotRun = () => {}) {
    const lockKey = `lock_once.${lockName}`;
    try {
      const redisReply = await this.redisSet(
        lockKey,
        'locked',
        'PX',
        timeOutMs,
        'NX',
      );
      if (redisReply === null) {
        onDidNotRun('Lock is already held by another process');
        return null;
      }
    } catch (err) {
      onDidNotRun(err.message);
      return null;
    }

    let error;
    let result;

    try {
      result = await func();
    } catch (err) {
      error = err;
    } finally {
      await this.redisDel(lockKey);
    }

    if (error) {
      throw error;
    }
    return result;
  }
}

module.exports = Concurrency;
