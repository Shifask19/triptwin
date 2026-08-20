import cluster from 'cluster';
import os from 'os';
import { config } from './config';

// Cap workers at 2 on free hosting tiers (1GB RAM)
const numCPUs = Math.min(os.cpus().length, 2);

if (cluster.isPrimary) {
  console.log(`[cluster] Primary ${process.pid} — starting ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork({ CLUSTER_WORKER_ID: String(i + 1) });
    console.log(`[cluster] Forked worker ${worker.process.pid} (id=${i + 1})`);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[cluster] Worker ${worker.process.pid} died — restarting`);
    const newWorker = cluster.fork({ CLUSTER_WORKER_ID: '99' }); // non-primary, skip seed
    console.log(`[cluster] Replacement worker ${newWorker.process.pid}`);
  });

} else {
  require('./server');
}
