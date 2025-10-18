import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  NumberInput,
  Select,
  Button,
  Alert,
  Toggle,
  Grid,
  FormField,
  Stack,
  Skeleton,
} from '@whttlr/ui-core';
import { SettingOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { PluginRenderer } from '../../ui/plugin';
import { useUpdateService } from '../../services/update/useUpdateService';
import {
  useMachineConfig, useStateConfig, useUIConfig, useAPIConfig,
} from '../../services/config';
import { AppSettings } from '../../services/settings';
import { useSettings } from '../../services/settings/SettingsContext';

const SettingsView: React.FC = () => {
  const [formValues, setFormValues] = useState<AppSettings | null>(null);

  // Global settings context
  const {
    settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    updateSettings,
  } = useSettings();

  // Configuration hooks (for fallback defaults)
  const {
    machineConfig,
    isLoading: machineLoading,
    error: machineError,
    workingAreaDimensions,
    defaultPosition,
    feedRateLimits,
  } = useMachineConfig();

  const {
    stateConfig,
    isLoading: stateLoading,
  } = useStateConfig();

  const {
    uiConfig,
    isLoading: uiLoading,
  } = useUIConfig();

  const {
    apiConfig,
    isLoading: apiLoading,
  } = useAPIConfig();

  const {
    updateData,
    updateStatus,
    checkForUpdates,
    showUpdateDialog,
  } = useUpdateService();

  const [isSaving, setIsSaving] = useState(false);
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);

  // Helper function to update nested form values
  const updateFormValue = (path: string[], value: any) => {
    if (!formValues) return;

    const newValues = { ...formValues };
    let current: any = newValues;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    setFormValues(newValues);
  };

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!formValues) return;

    const values = formValues;
    try {
      setIsSaving(true);

      // Save settings via global context
      await updateSettings(values);

      message.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckForUpdates = async () => {
    try {
      setCheckingForUpdates(true);
      await checkForUpdates();
      if (updateData?.updateAvailable) {
        message.success('Update available! Click the notification to view details.');
      } else {
        message.info('No updates available. You are running the latest version.');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      message.error('Failed to check for updates. Please try again later.');
    } finally {
      setCheckingForUpdates(false);
    }
  };

  const isLoading = machineLoading || stateLoading || uiLoading || apiLoading || isLoadingSettings;
  const hasError = machineError || settingsError;

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}>Settings</h2>
        <Stack spacing={16}>
          <Skeleton variant="rectangular" width="100%" height="200px" />
          <Skeleton variant="rectangular" width="100%" height="200px" />
        </Stack>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}>Settings</h2>
        <Alert
          variant="destructive"
          title="Configuration Error"
          description={`Failed to load configuration: ${hasError}`}
        />
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}>Settings</h2>
        <Alert
          variant="info"
          title="Configuration Loading"
          description="Waiting for configuration to load..."
        />
      </div>
    );
  }

  return (
    <div data-testid="settings-container">
      <h2 style={{ marginBottom: '24px' }}>Settings</h2>

      <div>
        <Grid cols={2} gap={4}>
            <Card>
              <CardHeader>
                <CardTitle>Machine Configuration</CardTitle>
                <SettingOutlined style={{ fontSize: '18px' }} />
              </CardHeader>
              <CardContent>
                <Stack spacing={12}>
                  <FormField label="Machine Name">
                    <Input
                      placeholder="Enter machine name"
                      value={formValues?.machine?.name || ''}
                      onChange={(e) => updateFormValue(['machine', 'name'], e.target.value)}
                    />
                  </FormField>

                  <FormField label="Units">
                    <Select
                      value={formValues?.machine?.units || 'metric'}
                      onChange={(value) => updateFormValue(['machine', 'units'], value)}
                      options={[
                        { value: 'metric', label: 'Metric (mm)' },
                        { value: 'imperial', label: 'Imperial (inches)' },
                      ]}
                    />
                  </FormField>

                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', marginTop: '12px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Work Area (mm)</h4>
                    <Grid cols={3} gap={2}>
                      <FormField label="X">
                        <NumberInput
                          min={0}
                          value={formValues?.machine?.workArea?.x || 0}
                          onChange={(value) => updateFormValue(['machine', 'workArea', 'x'], value || 0)}
                          step={1}
                        />
                      </FormField>
                      <FormField label="Y">
                        <NumberInput
                          min={0}
                          value={formValues?.machine?.workArea?.y || 0}
                          onChange={(value) => updateFormValue(['machine', 'workArea', 'y'], value || 0)}
                          step={1}
                        />
                      </FormField>
                      <FormField label="Z">
                        <NumberInput
                          min={0}
                          value={formValues?.machine?.workArea?.z || 0}
                          onChange={(value) => updateFormValue(['machine', 'workArea', 'z'], value || 0)}
                          step={1}
                        />
                      </FormField>
                    </Grid>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jog Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack spacing={12}>
                  <FormField label="Default Speed (mm/min)">
                    <NumberInput
                      min={1}
                      max={10000}
                      value={formValues?.jog?.defaultSpeed || 1000}
                      onChange={(value) => updateFormValue(['jog', 'defaultSpeed'], value || 1000)}
                      step={10}
                    />
                  </FormField>

                  <FormField label="Acceleration (mm/s²)">
                    <NumberInput
                      min={1}
                      max={2000}
                      value={formValues?.jog?.acceleration || 100}
                      onChange={(value) => updateFormValue(['jog', 'acceleration'], value || 100)}
                      step={1}
                    />
                  </FormField>

                  <FormField label="Maximum Speed (mm/min)">
                    <NumberInput
                      min={1}
                      max={20000}
                      value={formValues?.jog?.maxSpeed || 5000}
                      onChange={(value) => updateFormValue(['jog', 'maxSpeed'], value || 5000)}
                      step={10}
                    />
                  </FormField>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack spacing={12}>
                  <FormField label="Serial Port">
                    <Select
                      value={formValues?.connection?.port || '/dev/ttyUSB0'}
                      onChange={(value) => updateFormValue(['connection', 'port'], value)}
                      options={[
                        { value: '/dev/ttyUSB0', label: '/dev/ttyUSB0' },
                        { value: '/dev/ttyACM0', label: '/dev/ttyACM0' },
                        { value: 'COM3', label: 'COM3' },
                        { value: 'COM4', label: 'COM4' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Baud Rate">
                    <Select
                      value={formValues?.connection?.baudRate?.toString() || '115200'}
                      onChange={(value) => updateFormValue(['connection', 'baudRate'], Number(value))}
                      options={[
                        { value: '9600', label: '9600' },
                        { value: '19200', label: '19200' },
                        { value: '38400', label: '38400' },
                        { value: '57600', label: '57600' },
                        { value: '115200', label: '115200' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Connection Timeout (ms)">
                    <NumberInput
                      min={1000}
                      max={30000}
                      value={formValues?.connection?.timeout || 5000}
                      onChange={(value) => updateFormValue(['connection', 'timeout'], value || 5000)}
                      step={100}
                    />
                  </FormField>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack spacing={12}>
                  <FormField label="Theme">
                    <Select
                      value={formValues?.ui?.theme || 'light'}
                      onChange={(value) => updateFormValue(['ui', 'theme'], value)}
                      options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Language">
                    <Select
                      value={formValues?.ui?.language || 'en'}
                      onChange={(value) => updateFormValue(['ui', 'language'], value)}
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' },
                        { value: 'de', label: 'German' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Display Options">
                    <Stack spacing={8}>
                      <Toggle
                        checked={formValues?.ui?.showGrid || false}
                        onChange={(checked) => updateFormValue(['ui', 'showGrid'], checked)}
                        label="Show Grid in Workspace"
                      />
                      <Toggle
                        checked={formValues?.ui?.showCoordinates || false}
                        onChange={(checked) => updateFormValue(['ui', 'showCoordinates'], checked)}
                        label="Show Coordinates Display"
                      />
                      <Toggle
                        checked={formValues?.ui?.autoConnect || false}
                        onChange={(checked) => updateFormValue(['ui', 'autoConnect'], checked)}
                        label="Auto-connect on Startup"
                      />
                    </Stack>
                  </FormField>
                </Stack>
              </CardContent>
            </Card>
        </Grid>

        <Grid cols={2} gap={4} style={{ marginTop: '16px' }}>
          <Card>
            <CardHeader>
              <CardTitle>Update Settings</CardTitle>
              <UploadOutlined style={{ fontSize: '18px' }} />
            </CardHeader>
            <CardContent>
              <Stack spacing={12}>
                <FormField label="Update Options">
                  <Stack spacing={8}>
                    <Toggle
                      checked={formValues?.updates?.autoCheck || false}
                      onChange={(checked) => updateFormValue(['updates', 'autoCheck'], checked)}
                      label="Check for updates automatically"
                    />
                    <Toggle
                      checked={formValues?.updates?.includePreReleases || false}
                      onChange={(checked) => updateFormValue(['updates', 'includePreReleases'], checked)}
                      label="Include pre-release versions"
                    />
                  </Stack>
                </FormField>

                <FormField label="Check Interval">
                  <Select
                    value={formValues?.updates?.checkInterval?.toString() || '86400000'}
                    onChange={(value) => updateFormValue(['updates', 'checkInterval'], Number(value))}
                    options={[
                      { value: '1800000', label: '30 minutes' },
                      { value: '3600000', label: '1 hour' },
                      { value: '7200000', label: '2 hours' },
                      { value: '21600000', label: '6 hours' },
                      { value: '43200000', label: '12 hours' },
                      { value: '86400000', label: '24 hours' },
                    ]}
                  />
                </FormField>
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', marginTop: '12px' }}>
                  <Stack spacing={8} align="center">
                    <Button
                      variant="outline"
                      leftIcon={<UploadOutlined />}
                      loading={checkingForUpdates}
                      onClick={handleCheckForUpdates}
                    >
                      Check for Updates Now
                    </Button>
                    {updateData?.updateAvailable && (
                      <Alert
                        variant="success"
                        title="Update Available"
                        description={`Version ${updateData.latestVersion} is available`}
                        actions={
                          <Button size="sm" variant="ghost" onClick={showUpdateDialog}>
                            View Details
                          </Button>
                        }
                      />
                    )}
                  </Stack>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <div style={{ marginTop: '24px' }}>
          <Button
            variant="default"
            leftIcon={<SaveOutlined />}
            size="lg"
            loading={isSaving}
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Render plugins configured for the settings screen */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginBottom: '16px' }}>Plugin Settings</h3>
        <PluginRenderer screen="settings" />
      </div>
    </div>
  );
};

export default SettingsView;
