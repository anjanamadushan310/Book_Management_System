import { Module, Global } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ErrorLoggerService } from './error-logger.service';

@Global()
@Module({
  providers: [ValidationService, ErrorLoggerService],
  exports: [ValidationService, ErrorLoggerService],
})
export class CommonModule {}