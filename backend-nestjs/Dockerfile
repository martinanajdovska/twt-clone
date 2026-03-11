FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
ENV NODE_ENV=development
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["yarn", "start:prod"]