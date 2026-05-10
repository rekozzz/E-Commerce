import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DB_CONNECTION } from '../db/drizzle.provider';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(dto: CreateOrderDto, userId: number) {
    return this.db.transaction(async (tx) => {
      const orderItemsToInsert: any[] = [];

      for (const item of dto.items) {
        const productQuery = await tx.select().from(schema.productsTable).where(eq(schema.productsTable.id, item.productId)).limit(1);
        const product = productQuery[0];

        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Requested ${item.quantity}, but only ${product.stockQuantity} in stock.`
          );
        }

        // Decrement stock
        await tx.update(schema.productsTable)
          .set({ stockQuantity: product.stockQuantity - item.quantity })
          .where(eq(schema.productsTable.id, product.id));

        orderItemsToInsert.push({
          productId: product.id,
          price: item.price.toString(),
          quantity: item.quantity,
        });
      }

      // Create Parent Order
      const orderResult = await tx.insert(schema.ordersTable).values({
        userId,
        totalAmount: dto.total.toString(),
        status: 'pending',
      }).returning();
      const parentOrder = orderResult[0];

      // Insert Order Items
      for(const oi of orderItemsToInsert) {
        await tx.insert(schema.orderItemsTable).values({
          ...oi,
          orderId: parentOrder.id,
        });
      }

      return {
        ...parentOrder,
        total: Number(parentOrder.totalAmount),
        orderItems: orderItemsToInsert
      };
    });
  }

  async findByUser(userId: number) {
    const orders = await this.db.query.ordersTable.findMany({
      where: eq(schema.ordersTable.userId, userId),
      orderBy: [desc(schema.ordersTable.createdAt)],
      with: {
        orderItems: {
          with: { product: true }
        }
      }
    });

    return orders.map(o => ({
      ...o,
      total: Number(o.totalAmount),
      orderItems: o.orderItems.map((oi) => ({
        id: oi.id,
        productId: oi.productId,
        name: oi.product.name,
        price: Number(oi.price),
        quantity: oi.quantity,
        imageUrl: oi.product.imageUrl
      }))
    }));
  }
}
