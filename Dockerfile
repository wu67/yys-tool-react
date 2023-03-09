FROM node:18.15.0-slim
RUN  mkdir -p /app
WORKDIR /app
COPY package.json .
CMD (npm --registry=https://registry.npmmirror.com install) && npm run dev
EXPOSE 8888
