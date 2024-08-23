FROM node:20-alpine

USER root

RUN mkdir project
WORKDIR /project

COPY . /project

## TODO: Are these necessary to avoid local artifacts copied inside the container?
RUN rm -rf node_modules
RUN rm -rf demo/node_modules
RUN rm -rf demo/server/node_modules
RUN rm -rf dist
RUN rm -rf demo/dist

# Install Lean/elan
ENV ELAN_HOME=/usr/local/elan \
  PATH=/usr/local/elan/bin:$PATH
RUN export LEAN_VERSION="$(cat /project/demo/server/LeanProject/lean-toolchain)" && \
  curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -sSf | sh -s -- -y --no-modify-path --default-toolchain $LEAN_VERSION; \
    chmod -R a+w $ELAN_HOME; \
    elan --version; \
    lean --version; \
    leanc --version; \
    lake --version;

# Install the demo project
RUN npm install
RUN npm run setup_demo

CMD ["npm", "start"]