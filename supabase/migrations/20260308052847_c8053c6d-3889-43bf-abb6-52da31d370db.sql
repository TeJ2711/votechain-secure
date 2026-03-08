
DELETE FROM votes WHERE election_id IN (SELECT id FROM elections WHERE created_by = 'c7127c53-36ca-4cab-9a31-64c7ad4d87cd');
DELETE FROM candidates WHERE election_id IN (SELECT id FROM elections WHERE created_by = 'c7127c53-36ca-4cab-9a31-64c7ad4d87cd');
DELETE FROM elections WHERE created_by = 'c7127c53-36ca-4cab-9a31-64c7ad4d87cd';
DELETE FROM auth.users WHERE id = 'c7127c53-36ca-4cab-9a31-64c7ad4d87cd';
