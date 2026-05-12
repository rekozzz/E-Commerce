import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DB_CONNECTION = 'DB_CONNECTION';

export const DrizzleProvider: Provider = {
  provide: DB_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const host = configService.get<string>('DB_HOST', 'localhost');
    const port = configService.get<number>('DB_PORT', 5432);
    const user = configService.get<string>('DB_USERNAME', 'postgres');
    const password = configService.get<string>('DB_PASSWORD', 'postgres');
    const database = configService.get<string>('DB_NAME', 'asset_management');

    const pool = new Pool({
      host,
      port,
      user,
      password,
      database,
      ssl: host !== 'localhost' && host !== '127.0.0.1' ? { rejectUnauthorized: false } : false,
    });

    return drizzle(pool, { schema });
  },
};
