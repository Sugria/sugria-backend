import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { RequestMethod } from '@nestjs/common';

interface Route {
  path: string;
  method: string;
}

@Injectable()
export class RoutesService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  getRoutes(): Route[] {
    const routes: Route[] = [];
    const controllers = this.discoveryService.getControllers();

    controllers.forEach(wrapper => {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) return;

      const prototype = Object.getPrototypeOf(instance);
      const methods = this.metadataScanner.getAllMethodNames(prototype);

      methods.forEach(method => {
        const path = Reflect.getMetadata('path', instance[method]);
        const requestMethod = Reflect.getMetadata('method', instance[method]);

        if (path && requestMethod) {
          const controllerPath = Reflect.getMetadata('path', metatype);
          const fullPath = controllerPath ? `/${controllerPath}/${path}` : `/${path}`;
          
          routes.push({
            path: fullPath.replace(/\/+/g, '/'), // Clean up double slashes
            method: RequestMethod[requestMethod],
          });
        }
      });
    });

    return routes.sort((a, b) => a.path.localeCompare(b.path));
  }
} 