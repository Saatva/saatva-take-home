import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { UpstreamModule } from './upstream/upstream.module'
import { ProductsModule } from './products/products.module'

@Module({
  imports: [UpstreamModule, ProductsModule],
  controllers: [HealthController],
})
export class AppModule {}
