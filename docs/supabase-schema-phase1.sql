-- Phase 1: Configuration Management Schema Updates
-- Run this after the initial schema to add configuration management

-- Application configuration storage
CREATE TABLE IF NOT EXISTS app_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL CHECK (config_type IN ('machine', 'state', 'app', 'ui', 'api', 'defaults', 'visualization')),
  config_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Selected machine preference
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_key TEXT UNIQUE NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update machine_configs table to add axis limits and speed configurations
ALTER TABLE machine_configs
ADD COLUMN IF NOT EXISTS axis_limits JSONB DEFAULT '{
  "x": {"min": 0, "max": 300},
  "y": {"min": 0, "max": 180},
  "z": {"min": -45, "max": 0}
}'::jsonb,
ADD COLUMN IF NOT EXISTS speed_limits JSONB DEFAULT '{
  "max_feed_rate": 3000,
  "max_rapid_rate": 5000,
  "max_spindle_rpm": 10000
}'::jsonb;

-- Feed and speeds table for tools and materials
CREATE TABLE IF NOT EXISTS feed_speeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_config_id UUID REFERENCES machine_configs(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  material TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('drilling', 'milling', 'facing', 'profiling', 'pocketing', 'engraving')),
  feed_rate DECIMAL NOT NULL,
  spindle_speed DECIMAL NOT NULL,
  depth_of_cut DECIMAL,
  stepover DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(machine_config_id, tool_type, material, operation)
);

-- Plugin settings storage
CREATE TABLE IF NOT EXISTS plugin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id TEXT NOT NULL,
  settings_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plugin_id)
);

-- Plugin statistics
CREATE TABLE IF NOT EXISTS plugin_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id TEXT UNIQUE NOT NULL,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  installs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_configurations_type ON app_configurations(config_type);
CREATE INDEX IF NOT EXISTS idx_app_configurations_active ON app_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);
CREATE INDEX IF NOT EXISTS idx_feed_speeds_machine ON feed_speeds(machine_config_id);
CREATE INDEX IF NOT EXISTS idx_plugin_settings_plugin ON plugin_settings(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_stats_plugin ON plugin_stats(plugin_id);

-- Enable RLS
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_speeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Drop existing policies first to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations on app_configurations" ON app_configurations;
DROP POLICY IF EXISTS "Allow all operations on user_preferences" ON user_preferences;
DROP POLICY IF EXISTS "Allow all operations on feed_speeds" ON feed_speeds;
DROP POLICY IF EXISTS "Allow all operations on plugin_settings" ON plugin_settings;
DROP POLICY IF EXISTS "Allow all operations on plugin_stats" ON plugin_stats;

CREATE POLICY "Allow all operations on app_configurations" 
ON app_configurations FOR ALL 
USING (true);

CREATE POLICY "Allow all operations on user_preferences" 
ON user_preferences FOR ALL 
USING (true);

CREATE POLICY "Allow all operations on feed_speeds" 
ON feed_speeds FOR ALL 
USING (true);

CREATE POLICY "Allow all operations on plugin_settings" 
ON plugin_settings FOR ALL 
USING (true);

CREATE POLICY "Allow all operations on plugin_stats" 
ON plugin_stats FOR ALL 
USING (true);

-- Add update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_configurations_updated_at BEFORE UPDATE ON app_configurations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_speeds_updated_at BEFORE UPDATE ON feed_speeds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_settings_updated_at BEFORE UPDATE ON plugin_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_stats_updated_at BEFORE UPDATE ON plugin_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample feed/speed data
INSERT INTO feed_speeds (machine_config_id, tool_type, material, operation, feed_rate, spindle_speed, depth_of_cut, stepover)
SELECT 
  (SELECT id FROM machine_configs WHERE name = 'CNC Router 3018' LIMIT 1),
  tool,
  material,
  operation,
  feed_rate,
  spindle_speed,
  depth_of_cut,
  stepover
FROM (VALUES
  ('1/8" End Mill', 'Plywood', 'profiling', 1000, 10000, 3, 1.5),
  ('1/8" End Mill', 'Plywood', 'pocketing', 800, 10000, 2, 1),
  ('1/4" End Mill', 'Aluminum', 'profiling', 300, 8000, 0.5, 2),
  ('1/4" End Mill', 'Aluminum', 'pocketing', 250, 8000, 0.3, 1.5),
  ('V-Bit 60°', 'Plywood', 'engraving', 1500, 10000, 2, NULL),
  ('1/8" Ball End', 'Acrylic', 'facing', 600, 9000, 1, 0.5)
) AS t(tool, material, operation, feed_rate, spindle_speed, depth_of_cut, stepover)
ON CONFLICT DO NOTHING;

SELECT 'Phase 1 configuration management schema created successfully!' as message;