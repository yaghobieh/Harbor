import { GET, router } from '@forgedevstack/harbor';

export const healthRoutes = router('/api/health', [
  GET('/', () => ({
    status: 'ok',
    service: '{{PROJECT_NAME}}',
  })),
]);
