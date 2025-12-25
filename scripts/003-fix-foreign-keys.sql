-- Migration to fix foreign key constraints
-- This removes old Neon Auth dependencies and uses our custom users table

-- Drop old foreign key constraints if they exist
ALTER TABLE IF EXISTS user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE IF EXISTS user_stats DROP CONSTRAINT IF EXISTS user_stats_id_fkey;
ALTER TABLE IF EXISTS user_settings DROP CONSTRAINT IF EXISTS user_settings_id_fkey;
ALTER TABLE IF EXISTS error_items DROP CONSTRAINT IF EXISTS error_items_user_id_fkey;
ALTER TABLE IF EXISTS mystery_items DROP CONSTRAINT IF EXISTS mystery_items_user_id_fkey;
ALTER TABLE IF EXISTS sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS forge_responses DROP CONSTRAINT IF EXISTS forge_responses_user_id_fkey;
ALTER TABLE IF EXISTS auth_sessions DROP CONSTRAINT IF EXISTS auth_sessions_user_id_fkey;

-- Recreate foreign keys pointing to our users table
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_stats ADD CONSTRAINT user_stats_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_settings ADD CONSTRAINT user_settings_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE error_items ADD CONSTRAINT error_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE mystery_items ADD CONSTRAINT mystery_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forge_responses ADD CONSTRAINT forge_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
