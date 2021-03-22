# CONCURRENCY

- [Run Sequentially](#run-sequentially)
- [Run Once](#run-once)

## Usage

```javascript
const Concurrency = require('concurrency');

const concurrency = new Concurrency(redisHost, redisPort);
```

Concurrency constructor use redis [createClient](#https://www.npmjs.com/package/redis#rediscreateclient) props.

### Run Sequentially

Will make sure that the provided function is run only once at a time across all the instances
And will queue subsequent calls until they can be processed. The order of the queue is not guaranteed (the first process to ask for the lock will get it if it's available)
Therefore this is not designed to handle a high traffic, order dependant queue, but more for long running jobs that can have a few items in the queue at most.

```javascript
concurrency.runSequentially(
  (lockName: string),
  (retryIntervalMs: number),
  timeOutMs,
  func,
);
```

- **lockName** A unique identifier for the lock
- **retryIntervalMs** The interval in ms at which we will retry to run if the queue was busy at last attempt
- **timeOutMs** The maximum time (in ms) to hold the lock for. If this time is exceeded, the lock is automatically released to prevent deadlocks.
- **func** The function to execute. Can be async (will be awaited)

### Run Once

Same behavior as runSequentially() but will not retry if the lock is already held by another process.
This is used to ensure that a certain job is performed only once among several instances.

```javascript
concurrency.runOnce(
  (lockName: string),
  (retryIntervalMs: number),
  timeOutMs,
  func,
);
```

- **lockName** A unique identifier for the lock
- **timeOutMs** The maximum time (in ms) to hold the lock for. If this time is exceeded, the lock is automatically released to prevent deadlocks.
- **func** The function to execute. Can be async (will be awaited)
- **onDidNotRun** (Optional) Callback that will be called if the job did not run, passing the reason as a string param.
