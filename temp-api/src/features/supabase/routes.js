import express from 'express'
import { SupabaseMachineController, SupabaseJobController } from './controller.js'

const router = express.Router()

// Initialize controllers
const machineController = new SupabaseMachineController()
const jobController = new SupabaseJobController()

/**
 * @swagger
 * tags:
 *   - name: Machine Configs
 *     description: Machine configuration management via Supabase
 *   - name: Job History
 *     description: CNC job tracking and history
 */

// Machine configuration routes
router.get('/machine-configs', machineController.getAllConfigs.bind(machineController))
router.get('/machine-configs/:id', machineController.getConfig.bind(machineController))
router.post('/machine-configs', machineController.createConfig.bind(machineController))
router.put('/machine-configs/:id', machineController.updateConfig.bind(machineController))
router.delete('/machine-configs/:id', machineController.deleteConfig.bind(machineController))

// Job history routes
router.get('/jobs', jobController.getAllJobs.bind(jobController))
router.post('/jobs', jobController.createJob.bind(jobController))
router.patch('/jobs/:id/status', jobController.updateJobStatus.bind(jobController))

export default router