// src/bunny/bunny.module.ts
import { Module } from '@nestjs/common';
import { BunnyService } from '../services/bunny.service';

@Module({
  providers: [BunnyService],
  exports: [BunnyService], 
})
export class BunnyModule {}
