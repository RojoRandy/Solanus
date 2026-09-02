import { HeartHandshake } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveFotoUrl, type Voluntario } from './api';

interface VoluntarioAvatarProps {
  voluntario: Pick<Voluntario, 'nombres' | 'apellidos' | 'fotoPath'>;
  size?: 'default' | 'sm' | 'lg';
}

export function VoluntarioAvatar({ voluntario, size = 'default' }: VoluntarioAvatarProps) {
  const iniciales = `${voluntario.nombres.charAt(0)}${voluntario.apellidos.charAt(0)}`.toUpperCase();

  return (
    <Avatar size={size}>
      {voluntario.fotoPath && <AvatarImage src={resolveFotoUrl(voluntario.fotoPath)} alt={`${voluntario.nombres} ${voluntario.apellidos}`} />}
      <AvatarFallback>{iniciales || <HeartHandshake className="h-4 w-4" />}</AvatarFallback>
    </Avatar>
  );
}
