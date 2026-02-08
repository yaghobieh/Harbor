// Portal - API docs and portal generator (stub for future implementation)

export interface PortalGeneratorOptions {
  outDir?: string;
  title?: string;
}

export class PortalGenerator {
  constructor(private options: PortalGeneratorOptions = {}) {}

  get config(): PortalGeneratorOptions {
    return this.options;
  }

  generate(): void {
    console.log('[Harbor] Portal generation is coming soon.');
  }
}

export function createPortal(_options?: PortalGeneratorOptions): PortalGenerator {
  return new PortalGenerator(_options);
}

export function generateDocs(): void {
  console.log('[Harbor] API documentation generation is coming soon.');
}
