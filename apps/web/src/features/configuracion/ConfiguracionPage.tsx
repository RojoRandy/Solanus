import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnidadesTab } from './components/UnidadesTab';
import { CategoriasTab } from './components/CategoriasTab';
import { StockMinimoTab } from './components/StockMinimoTab';

export function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">Catálogos de inventario y stock mínimo por producto</p>
      </div>

      <Tabs defaultValue="stock-minimo">
        <TabsList>
          <TabsTrigger value="stock-minimo">Stock mínimo</TabsTrigger>
          <TabsTrigger value="unidades">Unidades de medida</TabsTrigger>
          <TabsTrigger value="categorias">Categorías de productos</TabsTrigger>
        </TabsList>
        <TabsContent value="stock-minimo">
          <StockMinimoTab />
        </TabsContent>
        <TabsContent value="unidades">
          <UnidadesTab />
        </TabsContent>
        <TabsContent value="categorias">
          <CategoriasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
