# The guide has no server: the image proves the models and actions work by
# running the test suite at build time, then ships a small CLI that prints
# matrix plans, job waves and effective if: conditions.

# ---- test: full install, run node:test -------------------------------------
FROM node:24-alpine AS test
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY actions ./actions
COPY test ./test
RUN npm test

# ---- runtime: only the code the CLI needs ----------------------------------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=test --chown=node:node /app/package.json ./
COPY --from=test --chown=node:node /app/src ./src
COPY --from=test --chown=node:node /app/actions ./actions
USER node
ENTRYPOINT ["node", "src/cli.js"]
CMD ["demo"]
