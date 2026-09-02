import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { puedeAcceder } from '@comedor-solanus/shared';
import { useAuth } from '@/lib/auth-context';
import { NAV_ITEMS } from './nav-config';

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function AppLayout() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => puedeAcceder(user.rol, item.modulo));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
            <img src="/logo-comedor.png" alt="" className="h-9 w-9 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Comedor Solanus</span>
              <span className="text-xs text-muted-foreground">Amigos de los Capuchinos ABP</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={
                        <NavLink
                          to={item.to}
                          end={item.to === '/'}
                          className={({ isActive }) => (isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : '')}
                        />
                      }
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{iniciales(user.nombre)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium">{user.nombre}</span>
              <span className="truncate text-xs text-muted-foreground capitalize">{user.rol.toLowerCase().replace('_', ' ')}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto shrink-0" onClick={logout} aria-label="Cerrar sesión">
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
