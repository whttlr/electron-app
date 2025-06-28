/**
 * Configuration Service Module
 * 
 * Public API exports for the configuration service.
 * Provides centralized access to all application configuration.
 */

export { configService } from './ConfigService';
export type { ConfigValues, ConfigValues as ConfigServiceValues } from './ConfigService';

// Convenience exports for common configuration access
export const getDefaultState = () => configService.getDefaultState();
export const getMachineConfig = () => configService.getMachineConfig();
export const getJogDefaults = () => configService.getJogDefaults();
export const getApiConfig = () => configService.getApiConfig();
export const getVisualizationConfig = () => configService.getVisualizationConfig();
export const isFeatureEnabled = (feature: string) => configService.isFeatureEnabled(feature as any);
export const isDevelopment = () => configService.isDevelopment();
export const isMockEnabled = () => configService.isMockEnabled();

// Machine feature convenience exports
export const isMachineFeatureEnabled = (feature: string) => configService.isMachineFeatureEnabled(feature as any);
export const getWorkCoordinateSystems = () => configService.getWorkCoordinateSystems();
export const getDefaultWorkCoordinateSystem = () => configService.getDefaultWorkCoordinateSystem();
export const getToolDirections = () => configService.getToolDirections();
export const getDefaultToolDirection = () => configService.getDefaultToolDirection();
export const getSpindleRange = () => configService.getSpindleRange();
export const getToolDirectionCommand = (direction: string) => configService.getToolDirectionCommand(direction as any);
export const getCoolantCommands = () => configService.getCoolantCommands();
export const getMachineCapabilities = () => configService.getMachineCapabilities();
export const getGCodeSettings = () => configService.getGCodeSettings();