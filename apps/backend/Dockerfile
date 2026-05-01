FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/simulation-engine/package.json ./packages/simulation-engine/package.json

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "@basketball-manager/backend"]
