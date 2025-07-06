# Personal Finance Management Web Application

## Overview

This is a comprehensive personal finance management web application built with a modern full-stack architecture. The application allows users to track income, expenses, budgets, and savings goals through an intuitive, responsive interface. The system uses React with TypeScript for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **State Management**: Zustand for global state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter (lightweight React router)
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Charts**: Recharts for financial data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Simple in-memory session store for authentication
- **API Design**: RESTful endpoints with standardized error handling
- **Development**: Hot reloading with Vite integration in development mode

### Database Architecture
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema**: Normalized relational design with proper foreign key relationships
- **Migrations**: Drizzle Kit for schema management and migrations

## Key Components

### Authentication System
- Session-based authentication with Bearer token headers
- Simple in-memory session storage (suitable for development/small scale)
- Protected routes with authentication middleware
- User registration and login with password validation

### Data Models
- **Users**: Core user account information with unique email/username constraints
- **Categories**: User-specific income/expense categorization system
- **Transactions**: Detailed financial transactions with category linking and recurring support
- **Budgets**: Period-based budget planning with category associations
- **Savings Goals**: Target-based savings tracking with progress monitoring

### UI Components
- Responsive design with mobile-first approach
- Comprehensive component library using Radix UI primitives
- Dashboard with statistical cards, charts, and quick actions
- Modal-based forms for data entry
- Real-time data updates with optimistic UI patterns

## Data Flow

1. **Authentication Flow**: User login → Session creation → Token storage → Protected API access
2. **Data Entry Flow**: Form submission → Validation → API request → Database update → Cache invalidation → UI refresh
3. **Dashboard Flow**: Page load → Multiple parallel API requests → Data aggregation → Chart/stats calculation → Component rendering
4. **Real-time Updates**: Mutation success → Query cache invalidation → Automatic re-fetch → UI synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM with excellent TypeScript integration
- **@tanstack/react-query**: Powerful data synchronization for React
- **@radix-ui/***: Accessible, unstyled UI primitives
- **recharts**: Composable charting library for React

### Development Tools
- **Vite**: Fast build tool with HMR support
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database schema management and migration tool
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development
- Vite dev server with Express.js backend integration
- Hot module replacement for frontend changes
- TypeScript compilation with strict type checking
- Development-specific error overlays and debugging tools

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Single deployment artifact with static file serving
- Environment-based configuration for database connections

### Database Management
- Schema migrations handled through Drizzle Kit
- Database URL configuration through environment variables
- Connection pooling suitable for serverless deployment

## Completed Features

### Core Functionality
- ✅ **User Authentication**: Complete login/register system with session management
- ✅ **Dashboard**: Financial overview with statistics cards, charts, and quick actions
- ✅ **Transaction Management**: Add, view, edit, and delete income/expense transactions
- ✅ **Budget Planning**: Create, track, and manage budgets with progress indicators
- ✅ **Savings Goals**: Set and monitor savings targets with progress tracking
- ✅ **Financial Reports**: Comprehensive analytics with filtering and CSV export
- ✅ **Local Storage**: All data automatically saved and persisted locally
- ✅ **Responsive Design**: Mobile-first approach with full responsive layout

### Pages & Navigation
- ✅ **Dashboard**: Central hub with overview and quick actions
- ✅ **Income**: Dedicated income transaction management and analytics
- ✅ **Expenses**: Expense tracking with category breakdown and statistics
- ✅ **Budget**: Budget creation and progress monitoring
- ✅ **Savings**: Savings goal management with timeline tracking
- ✅ **Reports**: Advanced financial analytics and data export

### User Interface Components
- ✅ **Forms**: Transaction, Budget, and Savings Goal creation forms
- ✅ **Tables**: Sortable and interactive data tables
- ✅ **Charts**: Financial data visualization (placeholder implementation)
- ✅ **Cards**: Statistical overview cards with trend indicators
- ✅ **Progress Bars**: Budget and savings goal progress visualization
- ✅ **Modals**: Modal dialogs for form interactions
- ✅ **Navigation**: Sidebar navigation with active states

### Technical Implementation
- ✅ **State Management**: Zustand with persistence middleware
- ✅ **Data Synchronization**: Server-client sync with local storage fallback
- ✅ **Form Validation**: Zod schema validation with React Hook Form
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Performance**: Optimized queries and efficient re-renders

## Changelog

- July 06, 2025: Initial setup and basic authentication
- July 06, 2025: Complete feature implementation - all pages functional
- July 06, 2025: Added local storage persistence and comprehensive CRUD operations
- July 06, 2025: Implemented budget management, savings goals, and financial reporting

## User Preferences

Preferred communication style: Simple, everyday language.
All data should be saved in local storage for offline capability.