import { defineConfig } from '@hey-api/openapi-ts';

const toCamelCase = (value: string) =>
  value
    .replace(/Controller$/, '')
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase());

export default defineConfig({
  input: process.env.CALTREK_OPENAPI_URL ?? 'http://localhost:8080/v3/api-docs',
  output: 'packages/api-client/src/generated',
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: './packages/api-client/src/client-config',
    },
    {
      name: '@hey-api/sdk',
      client: true,
      operations: {
        strategy: 'single',
        containerName: 'Api',

        nesting(operation) {
          const controller =
            operation.tags?.[0] ??
            'default';

          const controllerName = toCamelCase(controller);

          const methodName =
            operation.operationId
              ?.replace(new RegExp(`^${controller}`, 'i'), '')
              .replace(/^(.)/, (char) => char.toLowerCase()) ??
            operation.method.toLowerCase();

          return [controllerName, methodName];
        },
      },
    },
  ],
});
