import express from 'express'
import { SupabaseMachineController, SupabaseJobController, SupabaseConfigController } from './controller.js'

const router = express.Router()

// Initialize controllers
const machineController = new SupabaseMachineController()
const jobController = new SupabaseJobController()
const configController = new SupabaseConfigController()

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

// App Configuration routes
router.get('/app-configurations', configController.getAppConfigurations.bind(configController))
router.post('/app-configurations', configController.createAppConfiguration.bind(configController))
router.put('/app-configurations/:id', configController.updateAppConfiguration.bind(configController))
router.patch('/app-configurations/deactivate/:config_type', configController.deactivateAppConfiguration.bind(configController))

// User Preferences routes
router.get('/user-preferences', configController.getUserPreferences.bind(configController))
router.post('/user-preferences', configController.saveUserPreference.bind(configController))

// Plugin Settings routes
router.get('/plugin-settings', configController.getPluginSettings.bind(configController))
router.get('/plugin-settings/:plugin_id', configController.getPluginSettings.bind(configController))
router.post('/plugin-settings', configController.savePluginSettings.bind(configController))

// Plugin Stats routes
router.get('/plugin-stats', configController.getPluginStats.bind(configController))
router.get('/plugin-stats/:plugin_id', configController.getPluginStats.bind(configController))
router.patch('/plugin-stats/:plugin_id', configController.updatePluginStats.bind(configController))
router.patch('/plugin-stats/:plugin_id/increment', configController.updatePluginStats.bind(configController))

// Feed Speeds routes
router.get('/feed-speeds', configController.getFeedSpeeds.bind(configController))
router.post('/feed-speeds', configController.saveFeedSpeed.bind(configController))
router.put('/feed-speeds/:id', configController.updateFeedSpeed.bind(configController))
router.delete('/feed-speeds/:id', configController.deleteFeedSpeed.bind(configController))

export default router