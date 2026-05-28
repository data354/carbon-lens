# CarbonLens

Frontend for the **CarbonLens** application — a platform designed to quantify forest carbon sequestration using artificial intelligence, satellite remote sensing, and field survey data.

## Table of Contents

- [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
  - [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Environment Variables](#1-environment-variables-️)
  - [Start Docker Services](#2-start-docker-services)
  - [Database Setup](#3-database-setup)
  - [Running the Application](#4-running-the-application-)
    - [Run with Docker](#run-with-docker--recommanded)
    - [Run Locally](#run-locally--without-docker)
- [Useful Commands](#useful-commands)

## Architecture

### Tech Stack

| Layer     | Technology                                                                 |
| :-------- | :------------------------------------------------------------------------- |
| Framework | [Next.js 15](https://nextjs.org)                                           |
| Runtime   | [Bun](https://bun.sh)                                                      |
| Styling   | [TailwindCSS](https://tailwindcss.com), [Shadcn/UI](https://ui.shadcn.com) |
| Database  | [PostgreSQL](https://www.postgresql.org)                                   |
| ORM       | [Prisma](https://prisma.io)                                                |
| Auth      | [Better Auth](https://better-auth.com)                                     |

### Project structure 🗂️

```
web/
├── src/
│   ├── app/                 # Next.js pages, routes, and layouts
│   ├── assets/              # Static assets (images, fonts, icons, etc.)
│   ├── components/          # Shared reusable UI components
│   ├── features/            # Business modules (auth, dashboard, mapping, etc.)
│   ├── lib/                 # Shared helpers, utilities, and services
│   ├── types/               # TypeScript types definitions
│   └── configs/             # Global application configuration
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Prisma migration history
├── public/                  # Public static assets
├── Dockerfile               # Docker image configuration
├── .vscode/                 # VS Code config folder
├── .github/                 # Github config folder
└── compose.yaml             # Docker Compose configuration
```

## Prerequisites

Before getting started, make sure the following tools are installed on your machine :

- [Docker](https://docs.docker.com/get-docker) _(recommanded)_
- [Bun](https://bun.com/docs/installation)

## Installation

### 1. Environment Variables ⚙️

Copy the `.env.example` file to create your local environment configuration :

```bash
cp .env.example .env
```

Then, fill in the required environment variables in the generated `.env` file.

### 2. Start Docker Services

The application requires a running PostgreSQL instance to function properly.

```bash
docker compose up -d
```

This command starts :

- a `PostgreSQL` instance for data storage ;
- an `Adminer` instance for database management and visualization.

The full configuration is available in the `compose.yaml` file.

**🛑 Stop Services**

```bash
docker compose down
```

### 3. Database Setup

#### 1. Apply migrations 🔄

This step synchronizes the database structure with the Prisma schema.

```bash
bun prisma db push
```

#### 2. Seed the database 🌱

Seeding automatically inserts the initial data required for the application to work properly.

```bash
bun prisma db seed
```

### 4. Running the Application 🚀

The application can be executed in two different ways.

- #### Run with Docker 🐳 _(recommanded)_

##### 1. Build the Docker Image

```bash
docker build  -t carbon-lens-app .
```

###### Available Build Arguments 🔧

You can provide additional build arguments during the Docker image build process :

| Argument  | Description                            | Default Value           |
| :-------- | :------------------------------------- | :---------------------- |
| `API_URL` | Base URL of the carbon data API        | `http://localhost:8080` |
| `APP_URL` | Base URL of the web application itself | `http://localhost:3000` |

Example :

```bash
docker build \
  --build-arg API_URL=http://localhost:8080 \
  --build-arg APP_URL=http://localhost:3000 \
  -t carbon-lens-app .
```

##### 2. Run the Container

```bash
docker run \
  --name carbon-lens-app \
  --env-file .env carbon-lens-app \
  -p 3000:3000 \
  carbon-lens-app
```

The application will be available at : `http://localhost:3000`.

- #### Run Locally 💻 (without Docker)

##### 1. Install Dependencies 📦

```bash
bun install --frozen-lockfile
```

##### 2. Start the Development Server

```bash
bun run dev
```

The application will be available at : `http://localhost:3000`.

## Useful Commands

| Command              | Description                              |
| :------------------- | :--------------------------------------- |
| `bun run dev`        | Start the development server             |
| `bun run build`      | Generate the production build            |
| `bun run start`      | Start the application in production mode |
| `bun prisma studio`  | Open Prisma Studio                       |
| `bun prisma db seed` | Run database seeding                     |
| `bun prisma db push` | Synchronize the Prisma schema            |
