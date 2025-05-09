FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install -g @nestjs/cli

RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY --from=build /app/dist ./dist

CMD ["node", "dist/main"]
EXPOSE 3000
