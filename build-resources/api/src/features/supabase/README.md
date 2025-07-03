# Supabase Feature Module

## Overview
This module provides database integration with Supabase for managing machine configurations, job history, and other persistent data for the CNC application.

## Endpoints

### Machine Configurations
- `GET /api/v1/supabase/machine-configs` - Get all machine configurations
- `GET /api/v1/supabase/machine-configs/:id` - Get specific configuration
- `POST /api/v1/supabase/machine-configs` - Create new configuration
- `PUT /api/v1/supabase/machine-configs/:id` - Update configuration
- `DELETE /api/v1/supabase/machine-configs/:id` - Delete configuration

### Job History
- `GET /api/v1/supabase/jobs` - Get job history (with pagination)
- `POST /api/v1/supabase/jobs` - Create new job
- `PATCH /api/v1/supabase/jobs/:id/status` - Update job status

## Configuration
Environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Anonymous key for client access
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin access

## Database Schema
See `/docs/supabase-bundled-api.md` for complete database schema.