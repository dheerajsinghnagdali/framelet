import { Injectable } from '@angular/core';
import { createFramelet as createCoreFramelet } from '@framelet/core';
import type { FrameletOptions } from '@framelet/core';

@Injectable({ providedIn: 'root' })
export class FrameletService {
  create(options?: FrameletOptions) {
    return createCoreFramelet(options);
  }
}

export { createFramelet } from '@framelet/core';
export * from '@framelet/core';
