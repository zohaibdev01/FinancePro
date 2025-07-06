import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Calendar, ChartBar, Download } from 'lucide-react';
import { useUIStore } from '@/store/useFinanceStore';
import { useLocation } from 'wouter';

export default function QuickActions() {
  const { setTransactionModalOpen, setBudgetModalOpen } = useUIStore();
  const [, setLocation] = useLocation();

  const handleAddIncome = () => {
    setTransactionModalOpen(true);
  };

  const handleAddExpense = () => {
    setTransactionModalOpen(true);
  };

  const handleExportData = () => {
    setLocation('/reports');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 h-auto flex flex-col items-center"
            onClick={handleAddIncome}
          >
            <PlusCircle size={24} className="mb-2" />
            <span>Add Income</span>
          </Button>
          
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 h-auto flex flex-col items-center"
            onClick={handleAddExpense}
          >
            <MinusCircle size={24} className="mb-2" />
            <span>Add Expense</span>
          </Button>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 h-auto flex flex-col items-center"
            onClick={() => setBudgetModalOpen(true)}
          >
            <Calendar size={24} className="mb-2" />
            <span>Set Budget</span>
          </Button>
          
          <Button 
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 h-auto flex flex-col items-center"
            onClick={() => setLocation('/reports')}
          >
            <ChartBar size={24} className="mb-2" />
            <span>View Reports</span>
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleExportData}
          >
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
