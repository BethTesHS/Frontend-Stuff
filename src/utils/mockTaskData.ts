import { Task, TaskStats } from '@/services/adminApi';

export const MOCK_TASK_STATS: TaskStats = {
  active: 4,
  idle: 1,
  offline: 0
};

export const MOCK_TASKS: Task[] = [
  { 
    id: 'CELERY-8FA2-4112', 
    name: 'Sync Database', 
    status: 'running', 
    duration: '02:45', 
    eta: '00:30' 
  },
  { 
    id: 'CELERY-12B5-9921', 
    name: 'Generate Analytics Report', 
    status: 'pending', 
    duration: '--:--', 
    eta: '05:00' 
  },
  { 
    id: 'CELERY-44E1-2209', 
    name: 'Image Compression Batch', 
    status: 'completed', 
    duration: '00:12', 
    finishedAt: '12:30 PM' 
  },
  { 
    id: 'CELERY-90FA-1100', 
    name: 'Cloud Backup Sync', 
    status: 'failed', 
    duration: '00:04', 
    failedAt: '11:15 AM', 
    error: 'TimeoutException - Connection to AWS S3 failed.' 
  },
  { 
    id: 'CELERY-55X2-8831', 
    name: 'Weekly Email Newsletter', 
    status: 'completed', 
    duration: '05:22', 
    finishedAt: '09:00 AM' 
  },
];