import * as React from 'react';
import { HandCoins, HandHeart } from 'lucide-react';
import { puedeAcceder } from '@comedor-solanus/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { RegistrarDonativoDineroDialog } from '@/features/donativos/components/RegistrarDonativoDineroDialog';
import { useDonativosDinero } from '@/features/donativos/api';
import { ETIQUETA_METODO_PAGO } from '@/features/donativos/types';
import { formatMoneda } from '@/features/inventario/format';
import { useAuth } from '@/lib/auth-context';
import { RegistrarDonativoDialog } from './RegistrarDonativoDialog';

/**
 * Punto de captura de donativos recibidos durante el turno. El donativo en dinero
 * lo registran los tres roles (es lo que llega en la puerta); el donativo en
 * especie sigue restringido a quien puede tocar inventario.
 */
export function DonativosTurno({ turnoId }: { turnoId: number }) {
  const { user } = useAuth();
  const puedeVerHistorial = Boolean(user && puedeAcceder(user.rol, 'bienhechores'));
  const puedeEspecie = Boolean(user && puedeAcceder(user.rol, 'inventario'));

  const [dineroAbierto, setDineroAbierto] = React.useState(false);
  const [especieAbierto, setEspecieAbierto] = React.useState(false);

  const { data } = useDonativosDinero({ turnoId }, { enabled: puedeVerHistorial });
  const donativos = data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Donativos del turno</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDineroAbierto(true)}>
            <HandCoins /> En dinero
          </Button>
          {puedeEspecie && (
            <Button variant="outline" size="sm" onClick={() => setEspecieAbierto(true)}>
              <HandHeart /> En especie
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!puedeVerHistorial ? (
          <p className="text-sm text-muted-foreground">
            Registra el donativo en dinero recibido en este turno.
          </p>
        ) : donativos.length === 0 ? (
          <EmptyState icon={HandCoins} title="Sin donativos en dinero en este turno" className="py-6" />
        ) : (
          <div className="flex flex-col divide-y divide-border text-sm">
            {donativos.map((donativo) => (
              <div key={donativo.id} className="flex items-center justify-between py-1.5">
                <span>{donativo.bienhechor.nombre}</span>
                <span className="text-muted-foreground">
                  {formatMoneda(donativo.monto)} · {ETIQUETA_METODO_PAGO[donativo.metodoPago]}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <RegistrarDonativoDineroDialog open={dineroAbierto} onOpenChange={setDineroAbierto} turnoId={turnoId} />
      {puedeEspecie && (
        <RegistrarDonativoDialog open={especieAbierto} onOpenChange={setEspecieAbierto} />
      )}
    </Card>
  );
}
