// packages/api/src/generate-routes.ts
import * as routers from "./routes";

export async function generateRoutes(): Promise<Record<string, any>> {
  const routeMap: Record<string, any> = {};

  for (const [routeName, router] of Object.entries(routers)) {
    routeMap[routeName] = router;
    console.log(`Loaded router: ${routeName}`);
  }

  return routeMap;
}
