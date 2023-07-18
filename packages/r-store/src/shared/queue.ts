const jobs = new Set<() => void>();

let process = false;

const flushQueue = () => {
  const all = [...jobs.values()].slice(0);

  jobs.clear();

  for (const job of all) {
    job();
  }

  process = false;
};

/**
 * @internal
 */
export const queueJob = (job: () => void) => {
  jobs.add(job);

  if (process) return;

  process = true;

  Promise.resolve().then(flushQueue);
};
