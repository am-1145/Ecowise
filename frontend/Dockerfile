FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2: Serve static built files via clean webserver
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "find dist -type f -name '*.html' -exec sed -i \"s|__VITE_API_URL__|$VITE_API_URL|g\" {} + && serve -s dist -l $PORT"]
