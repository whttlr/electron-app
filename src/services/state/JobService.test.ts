/**
 * Job Store Unit Tests
 *
 * Comprehensive tests for job queue management,
 * progress tracking, and job execution.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobStore, jobSelectors } from '../jobStore';
import type { JobRecord, JobStatus } from '../types';

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// Mock setTimeout for testing
jest.useFakeTimers();

describe('JobStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useJobStore());
    act(() => {
      result.current.reset();
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useJobStore());
      const state = result.current;

      expect(state.queue.jobs).toEqual([]);
      expect(state.currentJob).toBe(null);
      expect(state.completedJobs).toEqual([]);
      expect(state.failedJobs).toEqual([]);
      expect(state.totalJobsRun).toBe(0);
      expect(state.queue.isProcessing).toBe(false);
      expect(state.queue.autoStart).toBe(false);
    });
  });

  describe('Job Management', () => {
    const mockJobData = {
      name: 'Test Job',
      description: 'A test job',
      gcodeFile: 'test.gcode',
      material: {
        type: 'Wood',
        thickness: 10,
        dimensions: { width: 100, height: 100 },
      },
      toolSettings: {
        toolNumber: 1,
        spindleSpeed: 1000,
        feedRate: 500,
        plungeRate: 100,
      },
      workOrigin: { x: 0, y: 0, z: 0 },
      totalLines: 100,
      currentLine: 0,
      estimatedDuration: 60,
    };

    it('should add a job to the queue', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
      });

      expect(jobId!).toBeDefined();
      expect(result.current.queue.jobs).toHaveLength(1);

      const addedJob = result.current.queue.jobs[0];
      expect(addedJob.id).toBe(jobId!);
      expect(addedJob.name).toBe('Test Job');
      expect(addedJob.status).toBe('pending');
      expect(addedJob.progress).toBe(0);
    });

    it('should auto-queue job when autoStart is enabled', () => {
      const { result } = renderHook(() => useJobStore());

      act(() => {
        result.current.setAutoStart(true);
      });

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
      });

      const addedJob = result.current.queue.jobs[0];
      expect(addedJob.status).toBe('queued');
      expect(result.current.queue.currentJobId).toBe(jobId!);
    });

    it('should remove a job from the queue', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
      });

      expect(result.current.queue.jobs).toHaveLength(1);

      act(() => {
        result.current.removeJob(jobId!);
      });

      expect(result.current.queue.jobs).toHaveLength(0);
    });

    it('should not remove a running job', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
      });

      // Update job to running status
      act(() => {
        result.current.updateJob(jobId!, { status: 'running' });
      });

      act(() => {
        result.current.removeJob(jobId!);
      });

      expect(result.current.queue.jobs).toHaveLength(1);
    });

    it('should update job properties', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
      });

      act(() => {
        result.current.updateJob(jobId!, {
          progress: 50,
          currentLine: 50,
          status: 'running',
        });
      });

      const updatedJob = result.current.queue.jobs[0];
      expect(updatedJob.progress).toBe(50);
      expect(updatedJob.currentLine).toBe(50);
      expect(updatedJob.status).toBe('running');
    });
  });

  describe('Job Execution', () => {
    const mockJobData = {
      name: 'Execution Test Job',
      gcodeFile: 'test.gcode',
      material: {
        type: 'Wood',
        thickness: 10,
        dimensions: { width: 100, height: 100 },
      },
      toolSettings: {
        toolNumber: 1,
        spindleSpeed: 1000,
        feedRate: 500,
        plungeRate: 100,
      },
      workOrigin: { x: 0, y: 0, z: 0 },
      totalLines: 10, // Small number for faster testing
      currentLine: 0,
      estimatedDuration: 1, // 1 second for testing
    };

    it('should start a job', async () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
      });

      act(() => {
        result.current.startJob(jobId!);
      });

      const job = result.current.queue.jobs[0];
      expect(job.status).toBe('running');
      expect(job.startTime).toBeDefined();
      expect(result.current.queue.isProcessing).toBe(true);
      expect(result.current.currentJob?.id).toBe(jobId!);
    });

    it('should not start a job that is already running', async () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
      });

      act(() => {
        result.current.updateJob(jobId!, { status: 'running' });
      });

      await expect(async () => {
        await act(async () => {
          await result.current.startJob(jobId!);
        });
      }).rejects.toThrow('is already running');
    });

    it('should pause and resume a job', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
        result.current.updateJob(jobId!, { status: 'running' });
      });

      act(() => {
        result.current.pauseJob(jobId!);
      });

      expect(result.current.queue.jobs[0].status).toBe('paused');

      act(() => {
        result.current.resumeJob(jobId!);
      });

      expect(result.current.queue.jobs[0].status).toBe('running');
    });

    it('should stop a job', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
        result.current.updateJob(jobId!, { status: 'running', startTime: new Date() });
        result.current.queue.currentJobId = jobId!;
        result.current.queue.isProcessing = true;
      });

      act(() => {
        result.current.stopJob(jobId!);
      });

      const job = result.current.queue.jobs[0];
      expect(job.status).toBe('cancelled');
      expect(job.endTime).toBeDefined();
      expect(job.actualDuration).toBeDefined();
      expect(result.current.queue.currentJobId).toBeUndefined();
      expect(result.current.queue.isProcessing).toBe(false);
    });

    it('should complete a job', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
        result.current.updateJob(jobId!, { status: 'running', startTime: new Date() });
        result.current.queue.currentJobId = jobId!;
        result.current.queue.isProcessing = true;
      });

      act(() => {
        result.current.completeJob(jobId!);
      });

      expect(result.current.queue.jobs).toHaveLength(0);
      expect(result.current.completedJobs).toHaveLength(1);

      const completedJob = result.current.completedJobs[0];
      expect(completedJob.status).toBe('completed');
      expect(completedJob.progress).toBe(100);
      expect(completedJob.endTime).toBeDefined();
      expect(result.current.totalJobsRun).toBe(1);
    });

    it('should fail a job', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(mockJobData);
        result.current.updateJob(jobId!, { status: 'running', startTime: new Date() });
        result.current.queue.currentJobId = jobId!;
        result.current.queue.isProcessing = true;
      });

      act(() => {
        result.current.failJob(jobId!, 'Test error message');
      });

      expect(result.current.queue.jobs).toHaveLength(0);
      expect(result.current.failedJobs).toHaveLength(1);

      const failedJob = result.current.failedJobs[0];
      expect(failedJob.status).toBe('failed');
      expect(failedJob.errors).toContain('Test error message');
      expect(result.current.totalJobsRun).toBe(1);
    });
  });

  describe('Job Progress Tracking', () => {
    it('should update job progress', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          name: 'Progress Test',
          gcodeFile: 'test.gcode',
          material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
          toolSettings: {
            toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
          },
          workOrigin: { x: 0, y: 0, z: 0 },
          totalLines: 100,
          currentLine: 0,
          estimatedDuration: 60,
        });
      });

      act(() => {
        result.current.updateJobProgress(jobId!, 75, 75);
      });

      const job = result.current.queue.jobs[0];
      expect(job.progress).toBe(75);
      expect(job.currentLine).toBe(75);
    });

    it('should update current job progress when it matches', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob({
          name: 'Current Job Test',
          gcodeFile: 'test.gcode',
          material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
          toolSettings: {
            toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
          },
          workOrigin: { x: 0, y: 0, z: 0 },
          totalLines: 100,
          currentLine: 0,
          estimatedDuration: 60,
        });
        result.current.currentJob = result.current.queue.jobs[0];
      });

      act(() => {
        result.current.updateJobProgress(jobId!, 50, 50);
      });

      expect(result.current.currentJob?.progress).toBe(50);
      expect(result.current.currentJob?.currentLine).toBe(50);
    });
  });

  describe('Queue Management', () => {
    const createMockJob = (name: string) => ({
      name,
      gcodeFile: `${name}.gcode`,
      material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
      toolSettings: {
        toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
      },
      workOrigin: { x: 0, y: 0, z: 0 },
      totalLines: 100,
      currentLine: 0,
      estimatedDuration: 60,
    });

    it('should move job in queue', () => {
      const { result } = renderHook(() => useJobStore());

      let jobIds: string[];
      act(() => {
        jobIds = [
          result.current.addJob(createMockJob('Job 1')),
          result.current.addJob(createMockJob('Job 2')),
          result.current.addJob(createMockJob('Job 3')),
        ];
      });

      // Move job 3 to position 0
      act(() => {
        result.current.moveJobInQueue(jobIds![2], 0);
      });

      expect(result.current.queue.jobs[0].name).toBe('Job 3');
      expect(result.current.queue.jobs[1].name).toBe('Job 1');
      expect(result.current.queue.jobs[2].name).toBe('Job 2');
    });

    it('should clear queue except running jobs', () => {
      const { result } = renderHook(() => useJobStore());

      let jobIds: string[];
      act(() => {
        jobIds = [
          result.current.addJob(createMockJob('Job 1')),
          result.current.addJob(createMockJob('Job 2')),
          result.current.addJob(createMockJob('Job 3')),
        ];

        // Set middle job to running
        result.current.updateJob(jobIds![1], { status: 'running' });
      });

      act(() => {
        result.current.clearQueue();
      });

      expect(result.current.queue.jobs).toHaveLength(1);
      expect(result.current.queue.jobs[0].name).toBe('Job 2');
      expect(result.current.queue.jobs[0].status).toBe('running');
    });

    it('should get job by ID', () => {
      const { result } = renderHook(() => useJobStore());

      let jobId: string;
      act(() => {
        jobId = result.current.addJob(createMockJob('Find Me'));
      });

      const foundJob = result.current.getJobById(jobId!);
      expect(foundJob).toBeDefined();
      expect(foundJob?.name).toBe('Find Me');

      const notFoundJob = result.current.getJobById('non-existent');
      expect(notFoundJob).toBe(null);
    });

    it('should get jobs by status', () => {
      const { result } = renderHook(() => useJobStore());

      act(() => {
        const jobId1 = result.current.addJob(createMockJob('Pending Job'));
        const jobId2 = result.current.addJob(createMockJob('Running Job'));
        const jobId3 = result.current.addJob(createMockJob('Another Pending'));

        result.current.updateJob(jobId2, { status: 'running' });
      });

      const pendingJobs = result.current.getJobsByStatus('pending');
      expect(pendingJobs).toHaveLength(2);
      expect(pendingJobs.map((j) => j.name)).toContain('Pending Job');
      expect(pendingJobs.map((j) => j.name)).toContain('Another Pending');

      const runningJobs = result.current.getJobsByStatus('running');
      expect(runningJobs).toHaveLength(1);
      expect(runningJobs[0].name).toBe('Running Job');
    });
  });

  describe('Statistics', () => {
    it('should calculate statistics correctly', () => {
      const { result } = renderHook(() => useJobStore());

      // Simulate some completed and failed jobs
      act(() => {
        result.current.completedJobs = [
          { id: '1', name: 'Job 1', status: 'completed' } as JobRecord,
          { id: '2', name: 'Job 2', status: 'completed' } as JobRecord,
        ];
        result.current.failedJobs = [
          { id: '3', name: 'Job 3', status: 'failed' } as JobRecord,
        ];
        result.current.totalJobsRun = 3;
        result.current.totalRunTime = 300; // 5 minutes

        result.current.calculateStatistics();
      });

      expect(result.current.successRate).toBe(66.66666666666666); // 2/3 * 100
      expect(result.current.averageJobTime).toBe(100); // 300/3
    });
  });

  describe('Selectors', () => {
    it('should select current job', () => {
      const { result } = renderHook(() => {
        const store = useJobStore();
        return jobSelectors.currentJob(store);
      });

      expect(result.current).toBe(null);
    });

    it('should select processing status', () => {
      const { result } = renderHook(() => {
        const store = useJobStore();
        return jobSelectors.isProcessing(store);
      });

      expect(result.current).toBe(false);
    });

    it('should select queue length', () => {
      const { result } = renderHook(() => useJobStore());

      const queueLength = jobSelectors.queueLength(result.current);
      expect(queueLength).toBe(0);

      act(() => {
        result.current.addJob({
          name: 'Test Job',
          gcodeFile: 'test.gcode',
          material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
          toolSettings: {
            toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
          },
          workOrigin: { x: 0, y: 0, z: 0 },
          totalLines: 100,
          currentLine: 0,
          estimatedDuration: 60,
        });
      });

      const newQueueLength = jobSelectors.queueLength(result.current);
      expect(newQueueLength).toBe(1);
    });

    it('should select job statistics', () => {
      const { result } = renderHook(() => useJobStore());

      act(() => {
        result.current.totalJobsRun = 5;
        result.current.completedJobs = [{ id: '1' } as JobRecord, { id: '2' } as JobRecord];
        result.current.failedJobs = [{ id: '3' } as JobRecord];
        result.current.totalRunTime = 500;
        result.current.averageJobTime = 100;
        result.current.successRate = 80;
      });

      const stats = jobSelectors.statistics(result.current);
      expect(stats.totalJobsRun).toBe(5);
      expect(stats.completedCount).toBe(2);
      expect(stats.failedCount).toBe(1);
      expect(stats.totalRunTime).toBe(500);
      expect(stats.averageJobTime).toBe(100);
      expect(stats.successRate).toBe(80);
    });
  });
});
