# RideOn - Complete Uber-like Ride-Hailing Platform

## Project Overview

RideOn is a production-ready, full-stack ride-hailing platform built with JavaScript (no TypeScript). It includes web applications, mobile applications, real-time tracking, payment processing, and a comprehensive admin panel.

## Architecture Stack

- **Frontend Web**: Next.js (JavaScript)
- **Mobile Apps**: React Native (JavaScript)
- **Backend**: Node.js + Express (JavaScript)
- **Database**: PostgreSQL with Sequelize ORM
- **Maps**: LeafletJS for web, react-native-maps for mobile
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Payment**: Abstract payment gateway integration
- **Geospatial**: PostGIS for location queries

## Project Structure

```
rideon/
├── apps/
│   ├── backend/           # Express API server
│   ├── admin/             # Next.js admin panel
│   ├── web/               # Next.js rider web app
│   ├── rider-app/         # React Native rider mobile app
│   ├── driver-app/        # React Native driver mobile app
├── packages/
│   ├── shared/            # Shared utilities, constants, helpers
│   ├── ui-components/     # Shared React components
│   ├── validation/        # Shared validation schemas
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
└── package.json           # Root package.json for monorepo
```

## Key Features

### For Riders
- Real-time ride booking with map interface
- Fare estimation before booking
- Live driver tracking
- Multiple payment options
- Trip history and receipts
- Driver ratings and reviews

### For Drivers
- Online/Offline toggle
- Incoming ride requests with accept/decline
- Turn-by-turn navigation
- Earnings tracking
- Trip history
- Rider ratings

### For Admins
- Dashboard with key metrics
- User and driver management
- Document verification
- Trip monitoring
- Pricing and surge configuration
- Zone management
- Dispute resolution

## Quick Start

See [SETUP.md](docs/SETUP.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Set up database
cd apps/backend
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

## Documentation

- [Assumptions](docs/ASSUMPTIONS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [API Documentation](docs/API.md)
- [Frontend Guide](docs/FRONTEND.md)
- [Implementation Roadmap](docs/ROADMAP.md)
- [Setup Instructions](docs/SETUP.md)

## License

MIT
