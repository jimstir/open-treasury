## The Open Treasury

**⚠️ NOTE: ** Do not use these contract on any mainnet blockchain as testing is still ongoing.

Create a transparent on-chain treasury with goverance mechanisms.

### Prerequisites

- Docker and Docker Compose installed
- Node.js and npm (for local development)

### Development Environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/open-treasury.git
   cd open-treasury
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Start the development environment**

   ```bash
   # Using npm scripts (recommended)
   npm run docker:dev
   
   # Or directly with docker-compose
   # docker-compose up --build
   ```

4. **Access the services**

   - API Server: http://localhost:4000
   - Database Admin (Adminer): http://localhost:8080
   - PostgreSQL: localhost:5432 (user: postgres, pass: postgres)

## 📦 Components

### Frontend

- [React Web Interface](/lib/ui-001)

### Smart Contracts

- The contract used [Smart Contracts](lib/contracts)
    1 The deployment scripts for local envirnoments, [is here](lib/contracts/scripts)
    2 The deployment scripts for browser wallet deployment [is here](lib/web-ui/ui-001/src/blockchain)

### Backend

- [API Server](/lib/api-server)
- PostgreSQL Database
- Prisma ORM

## 🔧 Development

- Node.js 16+
- npm or yarn
- Docker (for database)

### Local Development

1. **Start the database**

   ```bash
   docker-compose up -d db
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd lib/api-server && npm install
   cd ../../lib/contracts && npm install
   ```

3. **Set up environment**

   ```bash
   cp .env.example .env
   # Update DATABASE_URL and other variables
   ```

4. **Run migrations**

   ```bash
   cd lib/api-server
   npx prisma migrate dev
   ```

5. **Start services**
   - API Server: `npm run dev` in `lib/api-server`
   - Web UI: `npm start` in root

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
