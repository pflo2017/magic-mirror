-- Check what tables currently exist in the database
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Also check for any custom types
SELECT 
    typname as type_name,
    typtype as type_type
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'  -- enum types
ORDER BY typname;

-- Check for functions
SELECT 
    proname as function_name,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

