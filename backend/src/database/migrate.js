import { createTables } from './schema.js';

const migrate = async () => {
  try {
    console.log('🚀 Starting migration to Turso...');
    await createTables();
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();