import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/lib/api-client';
import { useActualizarUsuario, useCrearUsuario } from '../api';
import type { Usuario } from '../types';

const ROLES: { value: Usuario['rol']; label: string }[] = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'USUARIO', label: 'Usuario' },
  { value: 'USUARIO_SIMPLE', label: 'Usuario simple' },
];

const schema = z.object({
  username: z.string().trim().min(1, 'Indica el usuario'),
  nombre: z.string().trim().min(1, 'Indica el nombre'),
  rol: z.enum(['ADMINISTRADOR', 'USUARIO', 'USUARIO_SIMPLE'], { message: 'Selecciona un rol' }),
  // Requerida solo al crear; se valida a mano en el submit porque la regla
  // depende de `esEdicion`, que no está disponible dentro del schema.
  password: z.union([z.string().min(8, 'Mínimo 8 caracteres'), z.literal('')]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface UsuarioFormDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UsuarioFormDialog({ usuario, open, onOpenChange }: UsuarioFormDialogProps) {
  const esEdicion = usuario !== null;
  const crear = useCrearUsuario();
  const actualizar = useActualizarUsuario();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', nombre: '', rol: 'USUARIO', password: '' },
  });

  useEffect(() => {
    if (open) {
      reset(
        usuario
          ? { username: usuario.username, nombre: usuario.nombre, rol: usuario.rol, password: '' }
          : { username: '', nombre: '', rol: 'USUARIO', password: '' },
      );
    }
  }, [open, usuario, reset]);

  const rol = watch('rol');

  async function onSubmit(values: FormValues) {
    if (!esEdicion && !values.password) {
      toast.error('Indica una contraseña para el nuevo usuario.');
      return;
    }
    try {
      if (esEdicion && usuario) {
        await actualizar.mutateAsync({
          id: usuario.id,
          dto: { nombre: values.nombre, rol: values.rol, password: values.password || undefined },
        });
        toast.success('Usuario actualizado');
      } else {
        await crear.mutateAsync({ ...values, password: values.password! });
        toast.success('Usuario creado');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el usuario');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {esEdicion ? 'Actualiza el rol o la contraseña del usuario.' : 'Da de alta un nuevo usuario del sistema.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="usuario-username">Usuario</Label>
            <Input id="usuario-username" {...register('username')} disabled={esEdicion} autoFocus={!esEdicion} />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="usuario-nombre">Nombre completo</Label>
            <Input id="usuario-nombre" {...register('nombre')} autoFocus={esEdicion} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Rol</Label>
            <Select
              items={Object.fromEntries(ROLES.map((r) => [r.value, r.label]))}
              value={rol}
              onValueChange={(value) => setValue('rol', value as Usuario['rol'], { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="usuario-password">Contraseña{esEdicion && ' (opcional)'}</Label>
            <Input id="usuario-password" type="password" {...register('password')} placeholder={esEdicion ? 'Dejar en blanco para no cambiarla' : undefined} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {esEdicion ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
