FROM nginx:alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist /usr/share/nginx/html
ENV PORT=80 API_URL=http://localhost:3001 NGINX_ENVSUBST_FILTER="^(PORT|API_URL)$"
EXPOSE 80
