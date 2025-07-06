import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Header title={title} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
