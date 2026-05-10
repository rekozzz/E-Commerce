import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt')) // All order routes require a valid JWT
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders  — "Checkout / Place Order"
   *
   * Restricted to the 'user' role only.
   * Admins are actively blocked (403 Forbidden) because they are not
   * customers and should not be placing orders in the system.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(dto, req.user.id);
  }

  /**
   * GET /orders/my — View own order history
   *
   * Any authenticated user (customer or admin) can view their own orders.
   * No role restriction needed here.
   */
  @Get('my')
  myOrders(@Request() req: any) {
    return this.ordersService.findByUser(req.user.id);
  }
}
