# Express TypeScript API Starter

A clean and reusable starter template for building REST APIs with **Express.js and TypeScript**.

## Tech Stack

* Node.js
* Express.js
* TypeScript
* Biome
* CORS
* Cookie Parser
* Dotenv
* HTTP Status
* Chalk

## Getting Started

### Clone the repository

```bash
git clone YOUR_GITHUB_REPO_URL
cd express-typescript-api-starter
```

### Install dependencies

```bash
npm install
```

### Setup environment variables

```bash
cp .env.example .env
```

### Run the development server

```bash
npm run dev
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Check formatting
npm run format:check

# Fix formatting
npm run format:fix

# Check linting
npm run lint:check

# Fix linting issues
npm run lint:fix

# Check formatting and linting
npm run check

# Fix formatting and linting issues
npm run check:fix
```

## Project Structure

```text
src/
├── config/
├── controllers/
├── errors/
├── middlewares/
├── routes/
├── services/
├── types/
├── utils/
├── app.ts
└── server.ts
```

## Environment Variables

Create a `.env` file and configure the required environment variables.

```env
NODE_ENV=development
PORT=5000
```

## Features

* Express.js with TypeScript
* Scalable project structure
* Global error handling
* Custom application errors
* Environment variable configuration
* CORS support
* Cookie parsing
* Biome formatting and linting
* Development and production setup

## License

This project is open source and available for personal and educational use.
