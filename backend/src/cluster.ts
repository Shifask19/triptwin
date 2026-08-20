import cluster from 'cluster';
import os from 'os';
import { config } from './config';

const numCPUs = Math.min(os.cpus().length, 4); // cap at 4 on free tier

if (cluster.isPrimary) {
  console.log(`[cluster] Primary PID ${process.pid} — forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[cluster] Worker ${worker.process.pid} died (${signal ?? code}) — restarting`);
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    console.log(`[cluster] Worker ${worker.process.pid} online`);
  });

} else {
  // Each worker runs server.ts which handles migration + seed + Express
  require('./server');
  console.log(`[cluster] Worker ${process.pid} started on port ${config.port}`);
}
