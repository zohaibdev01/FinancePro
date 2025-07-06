import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/store/useFinanceStore';
import { 
  BarChart3, 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  PiggyBank, 
  ChartBar, 
  Settings,
  Wallet
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Income', href: '/income', icon: PlusCircle },
  { name: 'Expenses', href: '/expenses', icon: MinusCircle },
  { name: 'Budget', href: '/budget', icon: Calendar },
  { name: 'Savings', href: '/savings', icon: PiggyBank },
  { name: 'Reports', href: '/reports', icon: ChartBar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={cn(
        "w-64 bg-white shadow-lg fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Wallet className="text-primary mr-2" size={28} />
            FinanceTracker
          </h1>
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 cursor-pointer",
                  isActive && "text-gray-700 bg-blue-50 border-r-4 border-primary"
                )}
                onClick={() => setSidebarOpen(false)}>
                  <Icon className="mr-3" size={20} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                <span>{user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
