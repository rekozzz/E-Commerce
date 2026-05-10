import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { DB_CONNECTION } from '../db/drizzle.provider';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // ── Registration ──────────────────────────────────────────────────────────

  /**
   * Registers a new user with the 'user' role.
   * Throws ConflictException if the email is already taken.
   */
  async register(email: string, password: string) {
    // 1. Check for duplicate email
    const existing = await this.db
      .select({ id: schema.usersTable.id })
      .from(schema.usersTable)
      .where(eq(schema.usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('An account with that email already exists.');
    }

    // 2. Hash the password (cost factor 10 is the bcrypt default)
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert and return the new user (without the hash)
    const [newUser] = await this.db
      .insert(schema.usersTable)
      .values({ email, passwordHash })
      .returning({
        id: schema.usersTable.id,
        email: schema.usersTable.email,
        role: schema.usersTable.role,
        createdAt: schema.usersTable.createdAt,
      });

    return newUser;
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  async validateUser(email: string, password: string) {
    const result = await this.db.select().from(schema.usersTable).where(eq(schema.usersTable.email, email)).limit(1);
    const user = result[0];
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /** Called on app startup to ensure a default admin user exists. */
  async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@example.com';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';

    const existing = await this.db.select().from(schema.usersTable).where(eq(schema.usersTable.email, adminEmail)).limit(1);

    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await this.db.insert(schema.usersTable).values({
        email: adminEmail,
        passwordHash,
        role: 'admin',
      });
      
      console.log(`✅ Default admin created from .env: ${adminEmail}`);
    }
  }
}
