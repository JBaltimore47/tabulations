from debian:bullseye

RUN apt update
RUN apt upgrade -y



#Install Nodejs 16
RUN apt install curl -y
RUN sh -c "curl -sL https://deb.nodesource.com/setup_16.x | bash -"
RUN apt install nodejs -y 


# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
RUN cd /tmp && npm install --force
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/


WORKDIR /opt/app/
#COPY . /opt/app/


EXPOSE 3000

ENTRYPOINT npm start
