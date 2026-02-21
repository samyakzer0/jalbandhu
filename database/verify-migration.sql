-- After running the migration, use this query to verify all columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check specifically for the ocean hazard fields
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'reports' 
    AND column_name = 'ai_confidence'
) AS ai_confidence_exists,
EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'reports' 
    AND column_name = 'wave_height_estimated'
) AS wave_height_exists;