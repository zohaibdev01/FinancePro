import { Menu, Search, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/useFinanceStore';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { setSidebarOpen, setTransactionModalOpen } = useUIStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-10 w-64"
            />
          </div>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          <Button onClick={() => setTransactionModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>
    </header>
  );
}
