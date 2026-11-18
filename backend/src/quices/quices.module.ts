import { Module } from '@nestjs/common';
import { QuicesController } from './quices.controller';
import { QuicesService } from './quices.service';

@Module({
  controllers: [QuicesController],
  providers: [QuicesService],
})
export class QuicesModule {}
