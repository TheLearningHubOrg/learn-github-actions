// Models a `concurrency:` group. A group holds at most one running and one
// pending run. What happens to the others depends on cancel-in-progress.

export class ConcurrencyGroup {
  /** @param {{ cancelInProgress?: boolean }} options */
  constructor({ cancelInProgress = false } = {}) {
    this.cancelInProgress = cancelInProgress;
    this.running = null;
    this.pending = null;
    this.log = [];
  }

  /** A new run for this group is queued. */
  enqueue(runId) {
    if (this.running === null) {
      this.running = runId;
      this.log.push(`${runId}: started`);
      return;
    }
    if (this.cancelInProgress) {
      this.log.push(`${this.running}: cancelled (superseded by ${runId})`);
      this.running = runId;
      this.log.push(`${runId}: started`);
      return;
    }
    // Without cancel-in-progress the running job is left alone, but only one
    // run may wait. An older pending run is cancelled, never queued behind.
    if (this.pending !== null) this.log.push(`${this.pending}: cancelled (pending replaced by ${runId})`);
    this.pending = runId;
    this.log.push(`${runId}: pending`);
  }

  /** The running run finishes; the pending one (if any) starts. */
  complete(runId) {
    if (this.running !== runId) throw new Error(`${runId} is not running`);
    this.log.push(`${runId}: completed`);
    this.running = this.pending;
    this.pending = null;
    if (this.running !== null) this.log.push(`${this.running}: started`);
  }
}
