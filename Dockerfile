FROM nginx:alpine
COPY dist/* /usr/share/nginx/html/
COPY docs /usr/share/nginx/html/docs
