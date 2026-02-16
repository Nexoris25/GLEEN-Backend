<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

GLEEN Backend is a NestJS + Sequelize (PostgreSQL) API. This document explains how to set it up locally for development using Docker for the database and Adminer as a DB UI.

---

## Prerequisites

- Node.js (recommend >= 18)
- npm
- Docker and Docker Compose
- Git

---

## 1. Clone the repository

```bash
git clone <repo-url>
cd GLEEN-Backend
```

---

## 2. Environment configuration

The application reads configuration from `.env` at the project root.

1. Create `.env` (or update the existing one) with at least the database and JWT settings required for local dev.

   ```env
   # Database configuration for development
   DEV_DB_USERNAME='gleen_db'
   DEV_DB_PASSWORD=CBKt6N3MJi4D6w3f
   DEV_DB_NAME='gleen_db'
   DEV_DB_HOSTNAME=127.0.0.1
   DEV_DB_DIALECT=postgres
   DEV_DB_PORT=5433

   # Example JWT settings (adjust as needed)
   JWT_SECRET_KEY=your-local-jwt-secret
   JWT_EXPIRATION_TIME=30d
   ```

2. Make sure the file name is exactly `.env` and it lives in the project root (`/Users/user/nexoris/GLEEN-Backend`).

The Nest config in `src/config.ts` will load this file automatically via `dotenv`.

---

## 3. Start the local Postgres + Adminer stack

For local development, Postgres and Adminer are provided via `docker-compose.dev.yml`.

From the project root:

```bash
docker compose -f docker-compose.dev.yml up -d
```

This will start:

- `gleen-dev-postgres` on `127.0.0.1:5433` (mapped to container port 5432)
- `gleen-dev-adminer` on `http://localhost:8080`

To check the status:

```bash
docker compose -f docker-compose.dev.yml ps
```

You should see ports similar to:

```text
gleen-dev-postgres ... 0.0.0.0:5433->5432/tcp
gleen-dev-adminer  ... 0.0.0.0:8080->8080/tcp
```

### Accessing the database via Adminer

Open `http://localhost:8080` in a browser and use:

- System: PostgreSQL
- Server: `postgres`
- Username: `gleen_db`
- Password: `CBKt6N3MJi4D6w3f`
- Database: `gleen_db`

This is the same database the Nest application will use in development.

---

## 4. Install Node dependencies

From the project root:

```bash
npm install
```

This will install all runtime and dev dependencies defined in `package.json`.

---

## 5. Run database migrations and seeds (optional but recommended)

The project uses `sequelize-cli` for migrations and seeds. Make sure the DB stack is running before executing these.

Run migrations:

```bash
npm run migrate:up
```

Run seeds (if you want initial data):

```bash
npm run db:seed:all
```

You can undo the last migration or seed via:

```bash
npm run migrate:undo
npm run db:seed:undo
```

---

## 6. Start the application locally

### Development mode (recommended for daily work)

```bash
npm run start:dev
```

This runs Nest in watch mode: it recompiles and restarts on file changes.

### Plain start (no watch)

```bash
npm run start
```

### Production-like run

Build the project:

```bash
npm run build
```

Then run the built JS:

```bash
npm run start:prod
```

---

## 7. Running tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

---

## 8. Useful commands

- Rebuild continuously during development:

  ```bash
  npm run build:watch
  ```

- Run migrations only:

  ```bash
  npm run migrate:up
  ```

- Seed database:

  ```bash
  npm run db:seed:all
  ```

- Stop and remove the dev DB stack:

  ```bash
  docker compose -f docker-compose.dev.yml down -v
  ```

---

## 9. Local setup checklist

If something is not working, verify:

- `.env` exists in the project root and has the `DEV_DB_*` variables.
- `docker compose -f docker-compose.dev.yml ps` shows Postgres on `0.0.0.0:5433->5432/tcp`.
- You can connect with:

  ```bash
  psql "postgresql://gleen_db:CBKt6N3MJi4D6w3f@127.0.0.1:5433/gleen_db"
  ```

- `npm run start:dev` shows Nest starting without `SequelizeConnectionError`.

Once all of the above are true, you should have a fully working local GLEEN backend environment.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
