import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';
import type { DashboardStats } from '@/types/finance';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Balance',
      value: `$${stats.totalBalance.toLocaleString()}`,
      change: `+5.2% from last month`,
      changeType: 'positive' as const,
      icon: Wallet,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Monthly Income',
      value: `$${stats.monthlyIncome.toLocaleString()}`,
      change: `+${stats.incomeChange.toFixed(1)}% from last month`,
      changeType: stats.incomeChange >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Monthly Expenses',
      value: `$${stats.monthlyExpenses.toLocaleString()}`,
      change: `${stats.expenseChange >= 0 ? '+' : ''}${stats.expenseChange.toFixed(1)}% from last month`,
      changeType: stats.expenseChange <= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingDown,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Savings Goal',
      value: `${stats.savingsProgress}%`,
      change: `$6,800 of $10,000`,
      changeType: 'neutral' as const,
      icon: Target,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm mt-1 ${
                    card.changeType === 'positive' ? 'text-green-600' :
                    card.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {card.changeType === 'positive' && <TrendingUp className="inline w-4 h-4 mr-1" />}
                    {card.changeType === 'negative' && <TrendingDown className="inline w-4 h-4 mr-1" />}
                    <span>{card.change}</span>
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} text-xl`} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
