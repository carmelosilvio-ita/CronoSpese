import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  Calendar, 
  LogOut,
  Euro,
  Menu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: ('ADMIN' | 'CRONOMETRISTA')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'CRONOMETRISTA'] },
  { label: 'Le mie Note', icon: FileText, path: '/mie-note', roles: ['CRONOMETRISTA', 'ADMIN'] },
  { label: 'Gestione Note', icon: FileText, path: '/gestione-note', roles: ['ADMIN'] },
  { label: 'Registro Servizi', icon: Calendar, path: '/servizi', roles: ['ADMIN'] },
  { label: 'Tariffe Federali', icon: Euro, path: '/tariffe', roles: ['ADMIN'] },
  { label: 'Associazione', icon: Settings, path: '/impostazioni', roles: ['ADMIN'] },
];

export const DashboardLayout = ({ children, user }: { children: React.ReactNode, user: any }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-blue-400">Cronos Expense</h1>
        <p className="text-xs text-slate-400">{user.nome} {user.cognome} ({user.role})</p>
      </div>
      <nav className="flex-1 space-y-1">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              location.pathname === item.path 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <Button 
        variant="ghost" 
        className="mt-auto text-slate-300 hover:text-white hover:bg-slate-800 justify-start gap-3"
        onClick={() => navigate('/login')}
      >
        <LogOut size={20} />
        Esci
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white">
          <h1 className="font-bold">Cronos Expense</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};