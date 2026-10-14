import type { Controller } from "./controller";

const jobs = new Set<Controller>();

const MAX_UPDATE = 20;

let process = false;

let updateCount = 0;

const flushQueue = () => {
  const all = [...jobs.values()].slice(0);

  jobs.clear();

  for (const job of all) {
    job.notify();
  }

  process = false;

  // fix miss update
  if (jobs.size) {
    updateCount++;
    if (updateCount > MAX_UPDATE) {
      throw new Error(`[reactivity-store] detected an infinite update loop, pendingJobs: ${[...jobs].map((j) => j._namespace || "unknown").join(", ")}`);
    }
    flushQueue();
  }
};

/**
 * @internal
 */
export const queueJob = (job: Controller) => {
  jobs.add(job);

  if (process) return;

  process = true;

  updateCount = 0;

  Promise.resolve().then(flushQueue);
};
