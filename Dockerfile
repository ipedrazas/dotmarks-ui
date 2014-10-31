############################################################
# Dockerfile to build Nginx Installed Containers
# Based on Ubuntu
############################################################


FROM nginx

ADD nginx.conf /etc/nginx.conf
ADD dist /usr/local/nginx/html

# docker build -t ipedrazas/dotmarks-ui .
# docker run -p 80:80 -d ipedrazas/dotmarks-ui

# docker rm -f nginx; docker run --name nginx -d -p 80:80 -p 8080:8080 -v /home/admin/sites-enabled:/etc/nginx/sites-enabled -v /home/admin/nginx-logs:/var/log/nginx dockerfile/nginx