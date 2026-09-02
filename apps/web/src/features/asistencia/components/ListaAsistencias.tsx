import { toast } from 'sonner';
import { Users, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { useEliminarAsistencia } from '../api';
import { resolverFoto } from '../utils';
import type { Turno } from '../types';

function iniciales(nombres: string, apellidos: string): string {
  return `${nombres[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase();
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function ListaAsistencias({ turno }: { turno: Turno }) {
  const { user } = useAuth();
  const puedeDeshacer = user?.rol === 'ADMINISTRADOR' || user?.rol === 'USUARIO';
  const eliminar = useEliminarAsistencia();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Comensales de este turno</CardTitle>
        <span className="text-2xl font-semibold text-primary">{turno.totalAsistencias}</span>
      </CardHeader>
      <CardContent>
        {turno.asistencias.length === 0 ? (
          <EmptyState icon={Users} title="Todavía no hay asistencias" description="Registra el primer folio arriba." />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {turno.asistencias.map((asistencia) => (
              <div key={asistencia.id} className="flex items-center gap-3 py-2.5">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={resolverFoto(asistencia.comensal.fotoPath)} />
                  <AvatarFallback>{iniciales(asistencia.comensal.nombres, asistencia.comensal.apellidos)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {asistencia.comensal.nombres} {asistencia.comensal.apellidos}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Folio {asistencia.comensal.folio} · {formatHora(asistencia.createdAt)}
                  </span>
                </div>
                {puedeDeshacer && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Deshacer asistencia"
                    onClick={() =>
                      eliminar.mutate(asistencia.id, {
                        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo deshacer.'),
                      })
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
