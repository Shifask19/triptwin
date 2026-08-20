/**
 * Cluster mode — forks one worker per CPU core.
 * Use in production for maximum throughput on multi-core servers.
 * Start with: npm run start:cluster
 */
import cluster from 'cluster';
import os from 'os';
import { config } from './config';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`[cluster] Primary PID ${process.pid} — forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[cluster] Worker ${worker.process.pid} died (${signal ?? code}) — restarting`);
    cluster.fork(); // auto-restart dead workers
  });

  cluster.on('online', (worker) => {
    console.log(`[cluster] Worker ${worker.process.pid} online`);
  });

} else {
  // Each worker runs the Express app
  import('./server');
  console.log(`[cluster] Worker ${process.pid} started on port ${config.port}`);
}
