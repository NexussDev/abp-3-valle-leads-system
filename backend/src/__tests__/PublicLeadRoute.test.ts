import publicRoutes from '../presentation/routes/publicRoutes';

interface RouteLayer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: { name: string; handle: Function }[];
  };
}

describe('publicRoutes — wiring', () => {
  const stack = (publicRoutes as unknown as { stack: RouteLayer[] }).stack;

  it('expõe POST /leads', () => {
    const layer = stack.find(
      (l) => l.route?.path === '/leads' && l.route?.methods.post === true,
    );
    expect(layer).toBeDefined();
  });

  it('POST /leads NÃO tem authMiddleware no stack — rota pública', () => {
    const layer = stack.find(
      (l) => l.route?.path === '/leads' && l.route?.methods.post === true,
    );
    const names = layer?.route?.stack.map((s) => s.name) ?? [];
    expect(names).not.toContain('authMiddleware');
  });
});
