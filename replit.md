# Abmix System 2.0

## Overview

The Abmix System is a comprehensive proposal management platform designed for insurance and health plan sales operations. The system provides multiple role-based portals for vendors, supervisors, financial teams, implementation staff, clients, and administrators. It features real-time data synchronization, Google integrations, and automated workflow management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming
- **Charts**: Chart.js for analytics and visualizations
- **Email**: SendGrid for email notifications

### Deployment Architecture
- **Development**: Vite dev server with HMR on port 5173
- **Production**: Built static assets served by Express
- **Database**: Neon PostgreSQL serverless instance
- **Hosting**: Replit with custom domain (abmix.digital)

## Key Components

### Frontend Architecture
The client application is built with React and organized into role-specific portals:

- **VendorPortal**: Sales team interface for creating and managing proposals
- **SupervisorPortal**: Management dashboard with analytics and team oversight
- **FinancialPortal**: Financial team interface for proposal review and approval
- **ImplantacaoPortal**: Implementation team interface for deployment tracking
- **ClientPortal**: Customer interface for document submission and progress tracking
- **RestrictedAreaPortal**: Administrative interface with system management tools

### Backend Architecture
The server follows a modular Express.js structure:

- **Routes**: RESTful API endpoints organized by functionality
- **Storage Layer**: Abstracted database operations using Drizzle ORM
- **Google Services**: Integration modules for Drive, Sheets, and authentication
- **File Upload**: Multer-based file handling with validation
- **Authentication**: Role-based access control with session management

### Database Schema
The system uses PostgreSQL with the following key entities:

- **users**: Basic authentication users
- **systemUsers**: Extended user profiles with role-based access
- **vendors**: Sales team members with specific permissions
- **proposals**: Core business entities with comprehensive proposal data
- **vendorTargets**: Performance tracking for sales team
- **teamTargets**: Organizational goal management
- **awards**: Recognition and incentive tracking
- **attachments**: File upload management
- **driveConfigs**: Google Drive integration settings
- **systemSettings**: Application configuration storage
- **internalMessages**: Inter-team communication system

## Data Flow

### Proposal Creation Workflow
1. Vendor creates proposal with basic company and plan information
2. System generates unique proposal ID and client access token
3. Proposal data is automatically synchronized across all relevant portals
4. Client receives secure link to complete personal and dependent information
5. Real-time progress tracking updates all stakeholders
6. Document collection and validation occurs through the client portal
7. Financial and implementation teams review and process the proposal

### Real-Time Synchronization
The system implements real-time data synchronization using:
- **Database triggers**: Automatic updates across related entities
- **React Query**: Client-side data fetching and caching
- **Event-driven updates**: Progress tracking and status changes
- **Google Sheets integration**: External data synchronization

### File Management
- **Upload handling**: Multer-based file processing with type validation
- **Storage**: Local file system with database metadata tracking
- **Google Drive integration**: Automatic backup and folder organization
- **Access control**: Role-based file access permissions

## External Dependencies

### Google Workspace Integration
- **Google Drive**: Automated folder creation and file backup
- **Google Sheets**: Real-time data synchronization with external spreadsheets
- **Google Authentication**: OAuth2-based service account integration

### Third-Party Services
- **SendGrid**: Email notifications and client communications
- **Neon Database**: Serverless PostgreSQL hosting
- **Chart.js**: Interactive analytics and reporting visualizations

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Development Environment
- **Port Configuration**: Backend on 5000, frontend dev server on 5173
- **Hot Module Replacement**: Real-time code updates during development
- **Environment Variables**: Database URL and Google service credentials
- **CORS Configuration**: Wildcard origin support for development flexibility

### Production Deployment
- **Build Process**: Vite builds frontend to dist/public, ESBuild bundles server
- **Static Assets**: Express serves built React application
- **Database Migrations**: Drizzle Kit handles schema updates
- **Domain Configuration**: Custom domain (abmix.digital) with DNS management

### Security Considerations
- **Environment Variables**: Sensitive credentials stored securely
- **Input Validation**: Server-side validation for all user inputs
- **File Upload Security**: Type and size restrictions on file uploads
- **Role-Based Access**: Granular permissions based on user roles

### Monitoring and Maintenance
- **Error Handling**: Comprehensive error logging and user feedback
- **Performance Tracking**: Real-time analytics and system metrics
- **Backup Strategy**: Automated Google Drive backups and database snapshots
- **Update Management**: Version control with deployment automation

The system is designed for scalability and maintainability, with clear separation of concerns between frontend and backend, comprehensive error handling, and robust data persistence strategies.