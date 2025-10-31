import { pool } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runNewMigrations() {
  const migrationsDir = path.join(__dirname, '../../migrations');
  
  try {
    console.log('🔄 Running new migrations...');
    
    // Выполняем только миграции 004 и 005
    const files = ['004_add_push_subscriptions.sql', '005_add_notification_settings.sql'];
    
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File ${file} not found, skipping`);
        continue;
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        try {
          await pool.execute(statement);
        } catch (error: any) {
          // Игнорируем ошибки, если таблица уже существует
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_FIELDNAME') {
            console.log(`⚠️  ${file}: Table or column already exists, skipping`);
          } else {
            throw error;
          }
        }
      }
      
      console.log(`✅ Completed: ${file}`);
    }
    
    console.log('✅ All new migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runNewMigrations();

