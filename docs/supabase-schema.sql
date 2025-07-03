-- Supabase Database Schema for CNC Application
-- Execute this in your Supabase SQL Editor

-- Machine configurations table
CREATE TABLE IF NOT EXISTS machine_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  work_area_x DECIMAL,
  work_area_y DECIMAL,
  work_area_z DECIMAL,
  units TEXT DEFAULT 'mm' CHECK (units IN ('mm', 'in')),
  connection_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CNC jobs table
CREATE TABLE IF NOT EXISTS cnc_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_config_id UUID REFERENCES machine_configs(id) ON DELETE SET NULL,
  job_name TEXT NOT NULL,
  gcode_file TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  position_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plugin configurations table (for future use)
CREATE TABLE IF NOT EXISTS plugin_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_name TEXT NOT NULL,
  placement TEXT NOT NULL CHECK (placement IN ('dashboard', 'standalone', 'modal', 'sidebar')),
  screen TEXT NOT NULL CHECK (screen IN ('main', 'controls', 'settings', 'new')),
  config JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time machine state table (for future use)
CREATE TABLE IF NOT EXISTS machine_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_config_id UUID REFERENCES machine_configs(id) ON DELETE CASCADE,
  position_x DECIMAL,
  position_y DECIMAL,
  position_z DECIMAL,
  status TEXT,
  temperature JSONB,
  spindle_speed DECIMAL,
  feed_rate DECIMAL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_machine_configs_name ON machine_configs(name);
CREATE INDEX IF NOT EXISTS idx_cnc_jobs_status ON cnc_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cnc_jobs_created_at ON cnc_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cnc_jobs_machine_config ON cnc_jobs(machine_config_id);
CREATE INDEX IF NOT EXISTS idx_plugin_configs_enabled ON plugin_configs(enabled);
CREATE INDEX IF NOT EXISTS idx_machine_state_config ON machine_state(machine_config_id);
CREATE INDEX IF NOT EXISTS idx_machine_state_updated ON machine_state(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE machine_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cnc_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all operations for single-user desktop app)
-- You can make these more restrictive if needed

CREATE POLICY IF NOT EXISTS "Allow all operations on machine_configs" 
ON machine_configs FOR ALL 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on cnc_jobs" 
ON cnc_jobs FOR ALL 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on plugin_configs" 
ON plugin_configs FOR ALL 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on machine_state" 
ON machine_state FOR ALL 
USING (true);

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE machine_state;
ALTER PUBLICATION supabase_realtime ADD TABLE cnc_jobs;

-- Insert some sample data
INSERT INTO machine_configs (name, work_area_x, work_area_y, work_area_z, units, connection_settings) 
VALUES 
  (
    'CNC Router 3018', 
    300, 
    180, 
    45, 
    'mm',
    '{"port": "/dev/ttyUSB0", "baudRate": 115200, "dataBits": 8, "stopBits": 1, "parity": "none"}'::jsonb
  ),
  (
    'Shapeoko 3', 
    425, 
    425, 
    75, 
    'mm',
    '{"port": "/dev/ttyACM0", "baudRate": 115200, "dataBits": 8, "stopBits": 1, "parity": "none"}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database schema created successfully! You can now test the Supabase integration.' as message;