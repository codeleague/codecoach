FROM node:alpine AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:alpine AS final
WORKDIR /app
COPY --from=build /app/package.json /app/yarn.lock ./
RUN yarn install --production
COPY --from=build /app/dist ./dist
RUN npm link

ENTRYPOINT ["/app/dist/index.js"]
