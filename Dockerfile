FROM node:20-alpine
WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --production

COPY index.html style.css ./
COPY js/ ./js/
COPY server/server.js ./server/

EXPOSE 8080
ENV PORT=8080
CMD ["node", "server/server.js"]
