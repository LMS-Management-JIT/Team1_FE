# Stage 1: Build React App
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Nhận biến API URL từ docker-compose
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# THAY ĐỔI Ở ĐÂY: Ép build bằng Vite, bỏ qua bước kiểm tra tsc
RUN npx vite build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# run:
# wsl -d Ubuntu
# cd /mnt/d/Docker_Deploy
# sudo docker compose up -d --build
# sudo docker compose down

# clean:
# wsl.exe --manage Ubuntu --set-sparse true --allow-unsafe