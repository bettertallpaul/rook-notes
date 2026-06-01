FROM node:24-bookworm-slim
WORKDIR /app
COPY services/api/dist/index.js ./index.js
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "index.js"]
