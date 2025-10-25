import { copyFileSync } from 'fs';
import { join } from 'path';

const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
const productionSchemaPath = join(process.cwd(), 'prisma', 'schema.production.prisma');

try {
  copyFileSync(productionSchemaPath, schemaPath);
  console.log('✅ Switched to PostgreSQL schema');
  console.log('📝 Next steps:');
  console.log('   1. Set DATABASE_URL to your PostgreSQL connection string');
  console.log('   2. Run: npm run prisma:generate');
  console.log('   3. Run: npx prisma migrate dev --name init_postgres');
} catch (error) {
  console.error('❌ Error switching schema:', error.message);
}
