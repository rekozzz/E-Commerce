import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { DB_CONNECTION } from '../db/drizzle.provider';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, ilike, or, and, desc } from 'drizzle-orm';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
    private readonly httpService: HttpService,
  ) {}

  async findAll(search?: string, category?: string) {
    const conditions: import("drizzle-orm").SQL<unknown>[] = [];
    if (search) {
      const searchOr = or(
        ilike(schema.productsTable.name, `%${search}%`),
        ilike(schema.productsTable.description, `%${search}%`)
      );
      if (searchOr) conditions.push(searchOr);
    }
    if (category) {
      conditions.push(eq(schema.productsTable.category, category));
    }

    const records = await this.db.select().from(schema.productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.productsTable.createdAt));
      
    // Parse decimal string back to numbers for the frontend
    return records.map(p => ({ ...p, price: Number(p.price) }));
  }

  async aiSearch(query: string) {
    if (!query) return [];
    
    try {
      // Forward to the Python AI Brain
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/search`, {
          query,
          top_k: 3
        })
      );
      
      // Parse decimal price values from the returned results and fix mappings
      return response.data.results.map((p: any) => ({
        ...p,
        price: Number(p.price),
        imageUrl: p.image_url,
        stockQuantity: p.stock_quantity
      }));
    } catch (error) {
      console.error('AI Search Error:', error?.message);
      // Fallback to basic ILIKE search if the AI service is down
      return this.findAll(query);
    }
  }

  async findOne(id: number) {
    const result = await this.db.select().from(schema.productsTable).where(eq(schema.productsTable.id, id)).limit(1);
    const p = result[0] || null;
    return p ? { ...p, price: Number(p.price) } : null;
  }

  async create(dto: CreateProductDto) {
    const result = await this.db.insert(schema.productsTable).values({
      ...dto,
      price: dto.price.toString(),
      category: dto.category || null,
    }).returning();
    return { ...result[0], price: Number(result[0].price) };
  }

  async update(id: number, dto: Partial<CreateProductDto>) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    const payload: any = { ...dto };
    if (dto.price !== undefined) payload.price = dto.price.toString();
    
    const result = await this.db.update(schema.productsTable)
      .set(payload)
      .where(eq(schema.productsTable.id, id))
      .returning();
    return { ...result[0], price: Number(result[0].price) };
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    await this.db.delete(schema.productsTable).where(eq(schema.productsTable.id, id));
  }

  async seedProducts() {
    const countQuery = await this.db.select({ id: schema.productsTable.id }).from(schema.productsTable).limit(1);
    if (countQuery.length > 0) return;

    // Categories
    const categoryDefs = [
      { name: 'Electronics', description: 'Gadgets & tech gear' },
      { name: 'Furniture', description: 'Desks, chairs & storage' },
      { name: 'Accessories', description: 'Cables, chargers & more' },
      { name: 'Home & Office', description: 'Lighting & workspace essentials' },
    ];
    await this.db.insert(schema.categoriesTable).values(categoryDefs).onConflictDoNothing();

    const samples = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Premium over-ear headphones with 30-hour battery life and active noise cancellation.',
        price: '299.99',
        category: 'Electronics',
        stockQuantity: 45,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&auto=format&fit=crop',
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX Blue switches and programmable macros.',
        price: '129.99',
        category: 'Electronics',
        stockQuantity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80&auto=format&fit=crop',
      },
      {
        name: '4K Gaming Monitor 27"',
        description: '27-inch IPS display, 144Hz refresh rate, 1ms response time, HDR400 certified.',
        price: '549.99',
        category: 'Electronics',
        stockQuantity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a573d5f5ec?w=600&q=80&auto=format&fit=crop',
      },
      {
        name: 'Ergonomic Office Chair',
        description: 'Lumbar support, adjustable armrests, breathable mesh back — built for all-day comfort.',
        price: '399.99',
        category: 'Furniture',
        stockQuantity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80&auto=format&fit=crop',
      },
      {
        name: 'Wireless Charging Pad',
        description: 'Fast 15W Qi wireless charger compatible with all Qi-enabled devices.',
        price: '39.99',
        category: 'Accessories',
        stockQuantity: 150,
        imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80&auto=format&fit=crop',
      },
      {
        name: 'Smart LED Desk Lamp',
        description: 'Touch-dimming, color temperature adjustment, USB-C charging port built in.',
        price: '59.99',
        category: 'Home & Office',
        stockQuantity: 65,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&auto=format&fit=crop',
      },
    ];

    await this.db.insert(schema.productsTable).values(samples);
  }
}
