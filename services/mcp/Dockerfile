FROM node:24-bookworm-slim
WORKDIR /app
COPY services/mcp/dist/index.js ./index.js
EXPOSE 3002
CMD ["node", "index.js"]
