FROM debian:bullseye


RUN apt update && apt upgrade -y
RUN apt install python3 pip -y
RUN apt remove python3-django -y



COPY requirements-pip.txt /tmp/requirements-pip.txt
RUN pip3 install -r /tmp/requirements-pip.txt



WORKDIR /opt/app/
COPY . /opt/app/


EXPOSE 8000

CMD ["/usr/bin/python3", "manage.py", "runserver", "0.0.0.0:8000", "--noreload"]


