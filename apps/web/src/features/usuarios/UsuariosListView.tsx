import { useState } from 'react';
import { AlertCircle, Pencil, Plus, Search, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEliminarUsuario, useUsuarios } from './api';
import { UsuarioFormDialog } from './components/UsuarioFormDialog';
import type { Usuario } from './types';

const ETIQUETA_ROL: Record<Usuario['rol'], string> = {
  ADMINISTRADOR: 'Administrador',
  USUARIO: 'Usuario',
  USUARIO_SIMPLE: 'Usuario simple',
};

export function UsuariosListView() {
  const { user } = useAuth();
  const [buscar, setBuscar] = useState('');
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  const { data: usuarios, isLoading, isError, refetch } = useUsuarios();
  const eliminar = useEliminarUsuario();

  const filtrados = (usuarios ?? []).filter((u) => {
    const texto = buscar.trim().toLowerCase();
    if (!texto) return true;
    return u.nombre.toLowerCase().includes(texto) || u.username.toLowerCase().includes(texto);
  });

  function abrirNuevo() {
    setUsuarioEditar(null);
    setDialogoAbierto(true);
  }

  function abrirEditar(usuario: Usuario) {
    setUsuarioEditar(usuario);
    setDialogoAbierto(true);
  }

  async function handleEliminar(usuario: Usuario) {
    try {
      await eliminar.mutateAsync(usuario.id);
      toast.success(`"${usuario.nombre}" se dio de baja`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo dar de baja al usuario');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios del sistema</h1>
          <p className="text-sm text-muted-foreground">Alta, edición y baja de las cuentas que acceden a la herramienta</p>
        </div>
        <Button onClick={abrirNuevo}>
          <Plus />
          Nuevo usuario
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={buscar} onChange={(event) => setBuscar(event.target.value)} placeholder="Buscar por nombre o usuario…" className="pl-8" />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={AlertCircle}
          title="No se pudo cargar la lista de usuarios"
          description="Ocurrió un problema al consultar el servidor. Intenta de nuevo."
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      )}

      {!isLoading && !isError && filtrados.length === 0 && (
        <EmptyState icon={UserCog} title="Sin resultados" description="No hay usuarios que coincidan con tu búsqueda." />
      )}

      {!isLoading && !isError && filtrados.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((usuario) => {
                const esUnoMismo = usuario.id === user?.id;
                return (
                  <TableRow key={usuario.id} className="animate-in fade-in">
                    <TableCell className="font-medium">{usuario.username}</TableCell>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{ETIQUETA_ROL[usuario.rol]}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.activo ? 'default' : 'outline'}>{usuario.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => abrirEditar(usuario)} title="Editar">
                          <Pencil className="size-3.5" />
                        </Button>
                        {usuario.activo && (
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={<Button variant="ghost" size="sm" disabled={esUnoMismo} title={esUnoMismo ? 'No puedes desactivar tu propia cuenta' : undefined} />}
                            >
                              Dar de baja
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Dar de baja este usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;{usuario.nombre}&quot; ya no podrá iniciar sesión. Puede reactivarse más adelante.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => void handleEliminar(usuario)}>Dar de baja</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <UsuarioFormDialog usuario={usuarioEditar} open={dialogoAbierto} onOpenChange={setDialogoAbierto} />
    </div>
  );
}
