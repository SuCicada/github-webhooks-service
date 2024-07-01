FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN apk add make && \
      make init && yarn build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist/github-webhooks-service.js .
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules/.prisma/client  ./node_modules/.prisma/client
COPY --from=build /app/node_modules/@prisma/client/runtime/library.js ./node_modules/@prisma/client/runtime/library.js

CMD ["node", "github-webhooks-service.js"]
