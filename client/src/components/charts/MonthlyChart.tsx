import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChartData } from '@/types/finance';

interface MonthlyChartProps {
  data: ChartData;
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    income: data.income[index],
    expenses: data.expenses[index],
  }));

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monthly Overview</CardTitle>
        <Select defaultValue="6months">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="12months">Last 12 months</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={2}
                name="Income"
                dot={{ fill: 'hsl(142, 76%, 36%)' }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(0, 84%, 60%)" 
                strokeWidth={2}
                name="Expenses"
                dot={{ fill: 'hsl(0, 84%, 60%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
