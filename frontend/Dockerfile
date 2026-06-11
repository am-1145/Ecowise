FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve static built files via clean webserver
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l $PORT"]
