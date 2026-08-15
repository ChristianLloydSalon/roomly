import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  getVerificationMarker(): string {
    return 'pre-commit-hook-check';
  }
}
