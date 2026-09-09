import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, HandCoins, HandHeart, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { HistorialDonativos } from '@/features/donativos/components/HistorialDonativos';
import { RegistrarDonativoDineroDialog } from '@/features/donativos/components/RegistrarDonativoDineroDialog';
import { useBienhechor } from './api';

export function BienhechorDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const bienhechorId = Number(id);
  const [donativoAbierto, setDonativoAbierto] = React.useState(false);

  const { data: bienhechor, isLoading, isError } = useBienhechor(bienhechorId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !bienhechor) {
    return (
      <EmptyState
        icon={HandHeart}
        title="No se encontró el bienhechor"
        description="Puede que haya sido dado de baja o el enlace ya no sea válido."
        action={<Button render={<Link to="/bienhechores" />}>Volver a bienhechores</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{bienhechor.nombre}</h1>
            {!bienhechor.activo && <Badge variant="outline">Inactivo</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDonativoAbierto(true)}>
            <HandCoins />
            Registrar donativo
          </Button>
          <Button variant="outline" render={<Link to={`/bienhechores/${bienhechor.id}/editar`} />}>
            <Pencil />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Contacto</dt>
              <dd>{bienhechor.contacto ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">RFC</dt>
              <dd>{bienhechor.rfc ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <HistorialDonativos bienhechorId={bienhechor.id} />

      <RegistrarDonativoDineroDialog
        open={donativoAbierto}
        onOpenChange={setDonativoAbierto}
        bienhechorId={bienhechor.id}
      />
    </div>
  );
}
