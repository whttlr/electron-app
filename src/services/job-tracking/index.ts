/**
 * Job Tracking Service
 *
 * Manages CNC job creation, status updates, and history tracking
 * with database persistence via Supabase.
 */

import { bundledApiSupabaseService, type CncJob } from '../bundled-api-supabase';
import { machineConfigService } from '../machine-config';

export interface JobProgressData {
  timestamp: string
  x: number
  y: number
  z: number
  feedRate?: number
  spindleSpeed?: number
  command?: string
}

export interface ExtendedCncJob extends CncJob {
  machine_config_name?: string
  duration?: number // in seconds
  progress?: number // percentage 0-100
}

export class JobTrackingService {
  private static instance: JobTrackingService;

  private currentJob: ExtendedCncJob | null = null;

  private positionLog: JobProgressData[] = [];

  private startTime: Date | null = null;

  private constructor() {}

  static getInstance(): JobTrackingService {
    if (!JobTrackingService.instance) {
      JobTrackingService.instance = new JobTrackingService();
    }
    return JobTrackingService.instance;
  }

  /**
   * Start a new CNC job
   */
  async startJob(jobData: {
    job_name: string
    gcode_file?: string
    machine_config_id?: string
  }): Promise<ExtendedCncJob> {
    try {
      // Get active machine config if not provided
      let machineConfigId = jobData.machine_config_id;
      if (!machineConfigId) {
        const activeConfig = await machineConfigService.getActiveConfiguration();
        if (activeConfig) {
          machineConfigId = activeConfig.id!;
        }
      }

      // Create job in database
      const job = await bundledApiSupabaseService.createJob({
        job_name: jobData.job_name,
        gcode_file: jobData.gcode_file,
        machine_config_id: machineConfigId,
      });

      // Initialize tracking state
      this.currentJob = {
        ...job,
        progress: 0,
      };
      this.positionLog = [];
      this.startTime = new Date();

      // Update job status to running
      await this.updateJobStatus(job.id!, 'running');

      console.log(`✅ Started job: ${job.job_name}`);
      return this.currentJob;
    } catch (error) {
      console.error('Failed to start job:', error);
      throw error;
    }
  }

  /**
   * Update the current job status
   */
  async updateJobStatus(jobId: string, status: CncJob['status']): Promise<ExtendedCncJob> {
    try {
      const updatedJob = await bundledApiSupabaseService.updateJobStatus(
        jobId,
        status,
        this.positionLog,
      );

      if (this.currentJob?.id === jobId) {
        this.currentJob = {
          ...this.currentJob,
          ...updatedJob,
          duration: this.calculateDuration(),
        };

        // Handle job completion
        if (status === 'completed' || status === 'failed' || status === 'cancelled') {
          this.completeJob(status);
        }
      }

      console.log(`📊 Job ${jobId} status updated to: ${status}`);
      return this.currentJob || updatedJob;
    } catch (error) {
      console.error('Failed to update job status:', error);
      throw error;
    }
  }

  /**
   * Log machine position for the current job
   */
  logPosition(x: number, y: number, z: number, additionalData?: Partial<JobProgressData>): void {
    if (!this.currentJob) {
      return;
    }

    const logEntry: JobProgressData = {
      timestamp: new Date().toISOString(),
      x,
      y,
      z,
      ...additionalData,
    };

    this.positionLog.push(logEntry);

    // Update current job with latest position
    if (this.currentJob) {
      this.currentJob.position_log = this.positionLog;
    }

    // Limit log size to prevent memory issues (keep last 1000 entries)
    if (this.positionLog.length > 1000) {
      this.positionLog = this.positionLog.slice(-1000);
    }
  }

  /**
   * Update job progress percentage
   */
  updateProgress(progress: number): void {
    if (this.currentJob) {
      this.currentJob.progress = Math.max(0, Math.min(100, progress));
    }
  }

  /**
   * Pause the current job
   */
  async pauseCurrentJob(): Promise<ExtendedCncJob | null> {
    if (!this.currentJob) {
      throw new Error('No active job to pause');
    }

    return this.updateJobStatus(this.currentJob.id!, 'paused');
  }

  /**
   * Resume the current job
   */
  async resumeCurrentJob(): Promise<ExtendedCncJob | null> {
    if (!this.currentJob) {
      throw new Error('No active job to resume');
    }

    return this.updateJobStatus(this.currentJob.id!, 'running');
  }

  /**
   * Complete the current job
   */
  async completeCurrentJob(status: 'completed' | 'failed' | 'cancelled' = 'completed'): Promise<ExtendedCncJob | null> {
    if (!this.currentJob) {
      throw new Error('No active job to complete');
    }

    return this.updateJobStatus(this.currentJob.id!, status);
  }

  /**
   * Get the current active job
   */
  getCurrentJob(): ExtendedCncJob | null {
    return this.currentJob;
  }

  /**
   * Get recent job history
   */
  async getJobHistory(limit: number = 50, status?: string): Promise<ExtendedCncJob[]> {
    try {
      const jobs = await bundledApiSupabaseService.getJobs({ limit, status });

      // Enhance jobs with additional computed fields
      return jobs.map((job) => this.enhanceJob(job));
    } catch (error) {
      console.error('Failed to get job history:', error);
      return [];
    }
  }

  /**
   * Get job statistics
   */
  async getJobStatistics(): Promise<{
    total: number
    completed: number
    failed: number
    running: number
    avgDuration: number
  }> {
    try {
      const allJobs = await bundledApiSupabaseService.getJobs({ limit: 1000 });

      const stats = {
        total: allJobs.length,
        completed: allJobs.filter((j) => j.status === 'completed').length,
        failed: allJobs.filter((j) => j.status === 'failed').length,
        running: allJobs.filter((j) => j.status === 'running').length,
        avgDuration: 0,
      };

      // Calculate average duration for completed jobs
      const completedJobs = allJobs.filter((j) => j.status === 'completed' && j.start_time && j.end_time);

      if (completedJobs.length > 0) {
        const totalDuration = completedJobs.reduce((sum, job) => {
          const duration = new Date(job.end_time!).getTime() - new Date(job.start_time!).getTime();
          return sum + duration;
        }, 0);

        stats.avgDuration = totalDuration / completedJobs.length / 1000; // Convert to seconds
      }

      return stats;
    } catch (error) {
      console.error('Failed to get job statistics:', error);
      return {
        total: 0,
        completed: 0,
        failed: 0,
        running: 0,
        avgDuration: 0,
      };
    }
  }

  /**
   * Delete a job from history
   */
  async deleteJob(jobId: string): Promise<void> {
    // Note: This would require implementing a delete endpoint in the API
    // For now, we can update the status to 'cancelled' and hide it in the UI
    try {
      await this.updateJobStatus(jobId, 'cancelled');
      console.log(`🗑️ Job ${jobId} marked as cancelled`);
    } catch (error) {
      console.error('Failed to delete job:', error);
      throw error;
    }
  }

  /**
   * Check if service is connected to database
   */
  async isConnected(): Promise<boolean> {
    try {
      return await bundledApiSupabaseService.checkConnection();
    } catch {
      return false;
    }
  }

  // Private helper methods

  private completeJob(status: CncJob['status']): void {
    if (this.currentJob) {
      this.currentJob.status = status;
      this.currentJob.duration = this.calculateDuration();

      if (status === 'completed') {
        this.currentJob.progress = 100;
      }
    }

    // Clear current job state
    this.currentJob = null;
    this.positionLog = [];
    this.startTime = null;
  }

  private calculateDuration(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  private enhanceJob(job: CncJob): ExtendedCncJob {
    const enhanced: ExtendedCncJob = { ...job };

    // Calculate duration if we have start and end times
    if (job.start_time && job.end_time) {
      const startTime = new Date(job.start_time).getTime();
      const endTime = new Date(job.end_time).getTime();
      enhanced.duration = Math.floor((endTime - startTime) / 1000);
    }

    // Add machine config name (this would need to be populated from the API join)
    // For now, we'll leave it undefined and could enhance the API to include this

    return enhanced;
  }
}

// Export singleton instance
export const jobTrackingService = JobTrackingService.getInstance();

// Export types
export * from '../bundled-api-supabase';
