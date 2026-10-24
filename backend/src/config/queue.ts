import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from './env.js';

export interface EventJobPayload {
  type: 'SEND_TICKET_EMAIL' | 'SEND_REMINDER_EMAIL' | 'GENERATE_CERTIFICATE' | 'SEND_CERTIFICATE_EMAIL' | 'SEND_GALLERY_NOTIFICATION';
  data: any;
}

let redisConnection: Redis | null = null;
let bullQueue: Queue | null = null;
let bullWorker: Worker | null = null;
let useBullMQ = false;

// In-Memory Queue Fallback with retries, deduplication, and job tracking
class MemoryQueue {
  private queue: { id: string; name: string; payload: EventJobPayload; retries: number }[] = [];
  private processing = false;
  private processedIds = new Set<string>();
  private handlers: ((job: { id: string; name: string; data: EventJobPayload }) => Promise<void>)[] = [];

  registerWorker(handler: (job: { id: string; name: string; data: EventJobPayload }) => Promise<void>) {
    this.handlers.push(handler);
  }

  async add(name: string, payload: EventJobPayload, options?: { jobId?: string }) {
    const id = options?.jobId || `${name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    if (this.processedIds.has(id)) {
      console.log(`[MemoryQueue] Deduplicating job ${id} (already queued or processed)`);
      return;
    }
    this.processedIds.add(id);
    this.queue.push({ id, name, payload, retries: 0 });
    this.processNext();
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    const job = this.queue.shift();
    if (!job) {
      this.processing = false;
      return;
    }

    try {
      console.log(`[Queue] 🚀 Processing job [${job.name}] ID: ${job.id}`);
      for (const handler of this.handlers) {
        await handler({ id: job.id, name: job.name, data: job.payload });
      }
      console.log(`[Queue] ✅ Job [${job.name}] ID: ${job.id} completed successfully`);
    } catch (err: any) {
      console.error(`[Queue] ❌ Job [${job.name}] ID: ${job.id} failed:`, err.message);
      if (job.retries < 3) {
        job.retries += 1;
        console.log(`[Queue] 🔄 Retrying job ${job.id} (Attempt ${job.retries}/3) in 2 seconds...`);
        setTimeout(() => {
          this.queue.push(job);
          this.processNext();
        }, 2000);
      }
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }
}

const memoryQueue = new MemoryQueue();

export const initQueue = async (workerHandler: (job: { id: string; name: string; data: EventJobPayload }) => Promise<void>) => {
  if (config.redisUrl) {
    try {
      redisConnection = new Redis(config.redisUrl, {
        maxRetriesPerRequest: null,
        connectTimeout: 3000,
      });

      await new Promise<void>((resolve, reject) => {
        redisConnection!.once('connect', () => resolve());
        redisConnection!.once('error', (err) => reject(err));
      });

      bullQueue = new Queue('eventsphere-jobs', { connection: redisConnection });
      bullWorker = new Worker(
        'eventsphere-jobs',
        async (job: Job) => {
          await workerHandler({ id: job.id || '', name: job.name, data: job.data });
        },
        { connection: redisConnection }
      );

      useBullMQ = true;
      console.log('✅ BullMQ queue initialized with Redis backend');
      return;
    } catch (err: any) {
      console.warn(`⚠️ Redis connection failed (${err.message}). Using asynchronous in-memory background job queue.`);
    }
  } else {
    console.log('ℹ️ No REDIS_URL configured. Initializing asynchronous in-memory job queue with retry and deduplication.');
  }

  memoryQueue.registerWorker(workerHandler);
};

export const enqueueJob = async (name: string, payload: EventJobPayload, options?: { jobId?: string }) => {
  if (useBullMQ && bullQueue) {
    await bullQueue.add(name, payload, {
      jobId: options?.jobId,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });
  } else {
    await memoryQueue.add(name, payload, options);
  }
};
