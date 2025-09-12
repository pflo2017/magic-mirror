-- Image cache table for storing generated transformations
CREATE TABLE IF NOT EXISTS image_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(100) NOT NULL UNIQUE,
  image_hash VARCHAR(64) NOT NULL,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  generated_image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  file_size_bytes INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_cache_key ON image_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_image_cache_hash ON image_cache(image_hash);
CREATE INDEX IF NOT EXISTS idx_image_cache_style ON image_cache(style_id);
CREATE INDEX IF NOT EXISTS idx_image_cache_accessed ON image_cache(last_accessed);
CREATE INDEX IF NOT EXISTS idx_image_cache_active ON image_cache(is_active);

-- RLS policies for image cache
ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access for cache lookups (no sensitive data in cache)
CREATE POLICY "Allow public cache read" ON image_cache
  FOR SELECT USING (is_active = true);

-- Allow service role to manage cache
CREATE POLICY "Allow service role cache management" ON image_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Cache statistics view
CREATE OR REPLACE VIEW cache_stats AS
SELECT 
  COUNT(*) as total_entries,
  COUNT(*) FILTER (WHERE last_accessed > NOW() - INTERVAL '24 hours') as entries_accessed_24h,
  COUNT(*) FILTER (WHERE last_accessed > NOW() - INTERVAL '7 days') as entries_accessed_7d,
  SUM(access_count) as total_access_count,
  AVG(access_count) as avg_access_count,
  SUM(file_size_bytes) as total_size_bytes,
  COUNT(DISTINCT style_id) as unique_styles_cached,
  COUNT(DISTINCT image_hash) as unique_images_cached
FROM image_cache 
WHERE is_active = true;

-- Function to cleanup old cache entries
CREATE OR REPLACE FUNCTION cleanup_old_cache_entries(max_age_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete entries older than max_age_days
  DELETE FROM image_cache 
  WHERE last_accessed < NOW() - (max_age_days || ' days')::INTERVAL
    AND is_active = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cache hit rate
CREATE OR REPLACE FUNCTION get_cache_hit_rate(days INTEGER DEFAULT 7)
RETURNS NUMERIC AS $$
DECLARE
  total_requests INTEGER;
  cache_hits INTEGER;
BEGIN
  -- Get total AI generation requests in the period
  SELECT COUNT(*) INTO total_requests
  FROM ai_generations 
  WHERE created_at > NOW() - (days || ' days')::INTERVAL;
  
  -- Get cache hits (entries accessed in the period)
  SELECT COUNT(*) INTO cache_hits
  FROM image_cache 
  WHERE last_accessed > NOW() - (days || ' days')::INTERVAL
    AND is_active = true;
  
  -- Return hit rate as percentage
  IF total_requests > 0 THEN
    RETURN ROUND((cache_hits::NUMERIC / total_requests::NUMERIC) * 100, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_accessed when cache is hit
CREATE OR REPLACE FUNCTION update_cache_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed = NOW();
  NEW.access_count = OLD.access_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cache access updates
DROP TRIGGER IF EXISTS trigger_update_cache_access ON image_cache;
CREATE TRIGGER trigger_update_cache_access
  BEFORE UPDATE ON image_cache
  FOR EACH ROW
  WHEN (OLD.last_accessed IS DISTINCT FROM NEW.last_accessed)
  EXECUTE FUNCTION update_cache_access();

-- Grant permissions
GRANT SELECT ON cache_stats TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_old_cache_entries(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_cache_hit_rate(INTEGER) TO authenticated, service_role;


