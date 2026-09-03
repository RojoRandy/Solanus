import type { Modulo } from '@comedor-solanus/shared';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Package,
  HandHeart,
  HeartHandshake,
  FileBarChart,
  UserCog,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  modulo: Modulo;
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { modulo: 'dashboard', label: 'Panel general', to: '/', icon: LayoutDashboard },
  { modulo: 'asistencia', label: 'Turno de comida', to: '/asistencia', icon: UtensilsCrossed },
  { modulo: 'comensales', label: 'Comensales', to: '/comensales', icon: Users },
  { modulo: 'inventario', label: 'Inventario', to: '/inventario', icon: Package },
  { modulo: 'bienhechores', label: 'Bienhechores', to: '/bienhechores', icon: HandHeart },
  { modulo: 'voluntarios', label: 'Voluntarios', to: '/voluntarios', icon: HeartHandshake },
  { modulo: 'reportes', label: 'Reportes', to: '/reportes', icon: FileBarChart },
  { modulo: 'usuarios', label: 'Usuarios del sistema', to: '/usuarios', icon: UserCog },
  { modulo: 'configuracion', label: 'Configuración', to: '/configuracion', icon: Settings },
];
