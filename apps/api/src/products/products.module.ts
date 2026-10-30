import { Module } from '@nestjs/common'
import { UpstreamModule } from '../upstream/upstream.module'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  imports: [UpstreamModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
