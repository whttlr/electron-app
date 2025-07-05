/**
 * Job Management Store
 * 
 * Zustand store for CNC job queue management, progress tracking,
 * and job execution state.
 */

import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
// import { immer } from 'zustand/middleware';
import type {
  JobRecord,
  JobQueue,
  JobStatus,
  Position3D,
  StoreActions,
  ErrorState,
} from './types';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

export interface JobStore {
  // Job Queue
  queue: JobQueue;
  
  // Current Job
  currentJob: JobRecord | null;
  
  // Job History
  completedJobs: JobRecord[];
  failedJobs: JobRecord[];
  
  // Statistics
  totalJobsRun: number;
  totalRunTime: number;
  averageJobTime: number;
  successRate: number;
  
  // Actions
  addJob: (job: Omit<JobRecord, 'id' | 'progress' | 'status'>) => string;
  removeJob: (jobId: string) => void;
  updateJob: (jobId: string, updates: Partial<JobRecord>) => void;
  startJob: (jobId: string) => Promise<void>;
  pauseJob: (jobId: string) => void;
  resumeJob: (jobId: string) => void;
  stopJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  moveJobInQueue: (jobId: string, newIndex: number) => void;
  clearQueue: () => void;
  clearHistory: () => void;
  updateJobProgress: (jobId: string, progress: number, currentLine: number) => void;
  completeJob: (jobId: string) => void;
  failJob: (jobId: string, error: string) => void;
  queueJob: (jobId: string) => void;
  setAutoStart: (autoStart: boolean) => void;
  getJobById: (jobId: string) => JobRecord | null;
  getJobsByStatus: (status: JobStatus) => JobRecord[];
  getQueuePosition: (jobId: string) => number;
  calculateStatistics: () => void;
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialQueue: JobQueue = {
  jobs: [],
  currentJobId: undefined,
  isProcessing: false,
  autoStart: false,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useJobStore = create<JobStore>()((
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        queue: initialQueue,
        currentJob: null,
        completedJobs: [],
        failedJobs: [],
        totalJobsRun: 0,
        totalRunTime: 0,
        averageJobTime: 0,
        successRate: 0,
        
        // Actions
        addJob: (jobData) => {
          const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const newJob: JobRecord = {
            ...jobData,
            id: jobId,
            status: 'pending',
            progress: 0,
            currentLine: 0,
            errors: [],
            warnings: [],
            metadata: jobData.metadata || {},
          };
          
          set((state) => {
            state.queue.jobs.push(newJob);
            
            // Auto-start if enabled and no job is currently running
            if (state.queue.autoStart && !state.queue.isProcessing && state.queue.jobs.length === 1) {
              state.queue.currentJobId = jobId;
              newJob.status = 'queued';
            }
          });
          
          return jobId;
        },
        
        removeJob: (jobId) => set((state) => {
          const jobIndex = state.queue.jobs.findIndex(j => j.id === jobId);
          if (jobIndex !== -1) {
            const job = state.queue.jobs[jobIndex];
            
            // Don't remove if job is currently running
            if (job.status === 'running') {
              return;
            }
            
            state.queue.jobs.splice(jobIndex, 1);
            
            // Clear current job if it was removed
            if (state.queue.currentJobId === jobId) {
              state.queue.currentJobId = undefined;
              state.currentJob = null;
            }
          }
        }),
        
        updateJob: (jobId, updates) => set((state) => {
          const job = state.queue.jobs.find(j => j.id === jobId);
          if (job) {
            Object.assign(job, updates);
            
            // Update current job if it's the one being updated
            if (state.currentJob?.id === jobId) {
              Object.assign(state.currentJob, updates);
            }
          }
        }),
        
        startJob: async (jobId) => {
          const state = get();
          const job = state.queue.jobs.find(j => j.id === jobId);
          
          if (!job) {
            throw new Error(`Job ${jobId} not found`);
          }
          
          if (job.status === 'running') {
            throw new Error(`Job ${jobId} is already running`);
          }
          
          if (state.queue.isProcessing) {
            throw new Error('Another job is already processing');
          }
          
          set((draft) => {
            const jobToStart = draft.queue.jobs.find(j => j.id === jobId);
            if (jobToStart) {
              jobToStart.status = 'running';
              jobToStart.startTime = new Date();
              jobToStart.progress = 0;
              jobToStart.currentLine = 0;
              jobToStart.errors = [];
              jobToStart.warnings = [];
              
              draft.queue.currentJobId = jobId;
              draft.currentJob = jobToStart;
              draft.queue.isProcessing = true;
            }
          });
          
          try {
            // Simulate job execution
            const jobToRun = get().queue.jobs.find(j => j.id === jobId);
            if (jobToRun) {
              await get().simulateJobExecution(jobToRun);
            }
          } catch (error) {
            get().failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
          }
        },
        
        pauseJob: (jobId) => set((state) => {
          const job = state.queue.jobs.find(j => j.id === jobId);
          if (job && job.status === 'running') {
            job.status = 'paused';
            
            if (state.currentJob?.id === jobId) {
              state.currentJob.status = 'paused';
            }
          }
        }),
        
        resumeJob: (jobId) => set((state) => {
          const job = state.queue.jobs.find(j => j.id === jobId);
          if (job && job.status === 'paused') {
            job.status = 'running';
            
            if (state.currentJob?.id === jobId) {
              state.currentJob.status = 'running';
            }
          }
        }),
        
        stopJob: (jobId) => set((state) => {
          const job = state.queue.jobs.find(j => j.id === jobId);
          if (job && (job.status === 'running' || job.status === 'paused')) {
            job.status = 'cancelled';
            job.endTime = new Date();
            
            if (job.startTime) {
              job.actualDuration = (job.endTime.getTime() - job.startTime.getTime()) / 1000;
            }
            
            // Clear current job
            if (state.queue.currentJobId === jobId) {
              state.queue.currentJobId = undefined;
              state.currentJob = null;
              state.queue.isProcessing = false;
            }
          }
        }),
        
        cancelJob: (jobId) => set((state) => {
          const job = state.queue.jobs.find(j => j.id === jobId);
          if (job && job.status !== 'running') {
            job.status = 'cancelled';
            
            // Remove from queue
            const jobIndex = state.queue.jobs.findIndex(j => j.id === jobId);
            if (jobIndex !== -1) {
              state.queue.jobs.splice(jobIndex, 1);
            }
          }
        }),
        
        moveJobInQueue: (jobId, newIndex) => set((state) => {
          const currentIndex = state.queue.jobs.findIndex(j => j.id === jobId);
          if (currentIndex !== -1 && currentIndex !== newIndex) {
            const job = state.queue.jobs.splice(currentIndex, 1)[0];
            state.queue.jobs.splice(newIndex, 0, job);
          }
        }),
        
        clearQueue: () => set((state) => {
          // Only clear non-running jobs
          state.queue.jobs = state.queue.jobs.filter(j => j.status === 'running');
        }),
        
        clearHistory: () => set((state) => {
          state.completedJobs = [];
          state.failedJobs = [];
        }),
        
        updateJobProgress: (jobId, progress, currentLine) => set((state) => {
          const job = state.queue.jobs.find(j => j.id === jobId);
          if (job) {
            job.progress = progress;
            job.currentLine = currentLine;
            
            if (state.currentJob?.id === jobId) {
              state.currentJob.progress = progress;
              state.currentJob.currentLine = currentLine;
            }
          }
        }),
        
        completeJob: (jobId) => set((state) => {
          const jobIndex = state.queue.jobs.findIndex(j => j.id === jobId);
          if (jobIndex !== -1) {
            const job = state.queue.jobs[jobIndex];
            job.status = 'completed';
            job.endTime = new Date();
            job.progress = 100;
            
            if (job.startTime) {
              job.actualDuration = (job.endTime.getTime() - job.startTime.getTime()) / 1000;
            }
            
            // Move to completed jobs
            state.completedJobs.push(job);
            state.queue.jobs.splice(jobIndex, 1);
            
            // Clear current job
            if (state.queue.currentJobId === jobId) {
              state.queue.currentJobId = undefined;
              state.currentJob = null;
              state.queue.isProcessing = false;
            }
            
            // Update statistics
            state.totalJobsRun++;
            if (job.actualDuration) {
              state.totalRunTime += job.actualDuration;
            }
            
            // Auto-start next job if enabled
            if (state.queue.autoStart && state.queue.jobs.length > 0) {
              const nextJob = state.queue.jobs.find(j => j.status === 'pending');
              if (nextJob) {
                nextJob.status = 'queued';
                state.queue.currentJobId = nextJob.id;
                // Don't auto-start immediately to allow UI updates
                setTimeout(() => {
                  get().startJob(nextJob.id);
                }, 1000);
              }
            }
          }
        }),
        
        failJob: (jobId, error) => set((state) => {
          const jobIndex = state.queue.jobs.findIndex(j => j.id === jobId);
          if (jobIndex !== -1) {
            const job = state.queue.jobs[jobIndex];
            job.status = 'failed';
            job.endTime = new Date();
            job.errors.push(error);
            
            if (job.startTime) {
              job.actualDuration = (job.endTime.getTime() - job.startTime.getTime()) / 1000;
            }
            
            // Move to failed jobs
            state.failedJobs.push(job);
            state.queue.jobs.splice(jobIndex, 1);
            
            // Clear current job
            if (state.queue.currentJobId === jobId) {
              state.queue.currentJobId = undefined;
              state.currentJob = null;
              state.queue.isProcessing = false;
            }
            
            // Update statistics
            state.totalJobsRun++;
            if (job.actualDuration) {
              state.totalRunTime += job.actualDuration;
            }
          }
        }),
        
        queueJob: (jobId) => set((state) => {
          const job = state.queue.jobs.find(j => j.id === jobId);
          if (job && job.status === 'pending') {
            job.status = 'queued';
            
            if (!state.queue.currentJobId) {
              state.queue.currentJobId = jobId;
              state.currentJob = job;
            }
          }
        }),
        
        setAutoStart: (autoStart) => set((state) => {
          state.queue.autoStart = autoStart;
        }),
        
        getJobById: (jobId) => {
          const state = get();
          return state.queue.jobs.find(j => j.id === jobId) || null;
        },
        
        getJobsByStatus: (status) => {
          const state = get();
          return state.queue.jobs.filter(j => j.status === status);
        },
        
        getQueuePosition: (jobId) => {
          const state = get();
          return state.queue.jobs.findIndex(j => j.id === jobId);
        },
        
        calculateStatistics: () => set((state) => {
          const totalJobs = state.totalJobsRun;
          const completedJobs = state.completedJobs.length;
          
          state.successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
          state.averageJobTime = totalJobs > 0 ? state.totalRunTime / totalJobs : 0;
        }),
        
        // Simulate job execution (for demo purposes)
        simulateJobExecution: async (job: JobRecord) => {
          const totalLines = job.totalLines || 1000;
          const duration = job.estimatedDuration || 60; // seconds
          const stepDelay = (duration * 1000) / totalLines;
          
          for (let line = 0; line < totalLines; line++) {
            const currentState = get();
            const currentJob = currentState.queue.jobs.find(j => j.id === job.id);
            
            if (!currentJob || currentJob.status === 'cancelled') {
              throw new Error('Job was cancelled');
            }
            
            if (currentJob.status === 'paused') {
              // Wait for resume
              await new Promise(resolve => {
                const checkResume = () => {
                  const state = get();
                  const job = state.queue.jobs.find(j => j.id === currentJob.id);
                  if (job?.status === 'running') {
                    resolve(undefined);
                  } else if (job?.status === 'cancelled') {
                    throw new Error('Job was cancelled');
                  } else {
                    setTimeout(checkResume, 100);
                  }
                };
                checkResume();
              });
            }
            
            const progress = Math.round((line / totalLines) * 100);
            get().updateJobProgress(job.id, progress, line);
            
            await new Promise(resolve => setTimeout(resolve, stepDelay));
          }
          
          // Complete the job
          get().completeJob(job.id);
        },
        
        reset: () => set((state) => {
          state.queue = initialQueue;
          state.currentJob = null;
          state.completedJobs = [];
          state.failedJobs = [];
          state.totalJobsRun = 0;
          state.totalRunTime = 0;
          state.averageJobTime = 0;
          state.successRate = 0;
        }),
      })),
      {
        name: 'job-store',
        storage: localStorage,
        partialize: (state) => ({
          queue: {
            jobs: state.queue.jobs.filter(j => j.status !== 'running'),
            autoStart: state.queue.autoStart,
            isProcessing: false,
            currentJobId: undefined,
          },
          completedJobs: state.completedJobs.slice(-50), // Keep last 50 completed jobs
          failedJobs: state.failedJobs.slice(-50), // Keep last 50 failed jobs
          totalJobsRun: state.totalJobsRun,
          totalRunTime: state.totalRunTime,
          averageJobTime: state.averageJobTime,
          successRate: state.successRate,
        }),
        version: 1,
      }
    )
  ));

// ============================================================================
// STORE SELECTORS
// ============================================================================

export const jobSelectors = {
  currentJob: (state: JobStore) => state.currentJob,
  queuedJobs: (state: JobStore) => state.queue.jobs.filter(j => j.status === 'queued'),
  pendingJobs: (state: JobStore) => state.queue.jobs.filter(j => j.status === 'pending'),
  runningJobs: (state: JobStore) => state.queue.jobs.filter(j => j.status === 'running'),
  completedJobs: (state: JobStore) => state.completedJobs,
  failedJobs: (state: JobStore) => state.failedJobs,
  isProcessing: (state: JobStore) => state.queue.isProcessing,
  queueLength: (state: JobStore) => state.queue.jobs.length,
  autoStart: (state: JobStore) => state.queue.autoStart,
  statistics: (state: JobStore) => ({
    totalJobsRun: state.totalJobsRun,
    totalRunTime: state.totalRunTime,
    averageJobTime: state.averageJobTime,
    successRate: state.successRate,
    completedCount: state.completedJobs.length,
    failedCount: state.failedJobs.length,
  }),
  jobProgress: (state: JobStore) => (jobId: string) => {
    const job = state.queue.jobs.find(j => j.id === jobId);
    return job ? {
      progress: job.progress,
      currentLine: job.currentLine,
      totalLines: job.totalLines,
      status: job.status,
    } : null;
  },
};

// ============================================================================
// STORE SUBSCRIPTIONS
// ============================================================================

// Auto-calculate statistics when jobs complete
useJobStore.subscribe(
  (state) => [state.completedJobs.length, state.failedJobs.length],
  () => {
    useJobStore.getState().calculateStatistics();
  }
);

// Auto-start next job when current job completes
useJobStore.subscribe(
  (state) => state.currentJob,
  (currentJob, prevJob) => {
    if (prevJob && !currentJob) {
      // Job completed, check for next job
      const state = useJobStore.getState();
      if (state.queue.autoStart && state.queue.jobs.length > 0) {
        const nextJob = state.queue.jobs.find(j => j.status === 'pending');
        if (nextJob) {
          setTimeout(() => {
            state.queueJob(nextJob.id);
          }, 1000);
        }
      }
    }
  }
);
