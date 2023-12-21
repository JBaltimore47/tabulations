Install
===


Docker
---



1. Build and launch backend

_while in the main directory_
```
sudo docker build -t tabulate-backend:0.1 .
docker run --detach --volume logs:/tmp/logs --volume "$(pwd)":/opt/app -p 8000:8000 --name tabulate-backend tabulate-backend:0.1
```


2. Build and launch frontend
```
cd webui
sudo docker build -t tabulate-frontend:0.1 .
docker run --detach -t --volume logs:/tmp/logs --volume $(pwd):/opt/app -p 3000:3000 --name tabulate-frontend tabulate-frontend:0.1
```

You can encapsulate these within a systemd service and start at boot if you want, or you could just manually start it yourself:

```
sudo docker start tabulate-frontend
sudo docker start tabulate-backend
```
