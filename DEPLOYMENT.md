# RoutineMate – Production Deployment Guide

This guide covers 3 production deployment strategies for **RoutineMate**:
1. **[Recommended] Docker & Docker Compose** (Single VPS / AWS EC2 / DigitalOcean)
2. **Cloud PaaS Platforms** (Railway / Render + Vercel / Netlify)
3. **Linux VPS with Nginx & Let's Encrypt SSL** (Bare Metal / Ubuntu)

---

## Important: Production Requirements for Web Push Notifications

> [!IMPORTANT]
> The **Web Push API** and **Service Workers** (`sw.js`) strictly require a **Secure Context (HTTPS)** in production. While modern browsers allow `localhost` over HTTP for local testing, any public domain (e.g. `https://routinemate.yourdomain.com`) must have a valid SSL certificate.

---

## Strategy 1: One-Click Docker Compose (Recommended)

Docker Compose bundles **MySQL 8**, the **Spring Boot backend**, and the **React (Nginx)** frontend into unified, isolated containers with automatic database initialization.

### Prerequisites:
- Install [Docker Desktop](https://www.docker.com/) (Windows/macOS) or Docker Engine + Docker Compose Plugin (Linux).

### Step 1: Start All Services

From the project root:

```bash
docker compose up --build -d
```

### What happens automatically:
1. `db`: Launches MySQL 8 container, creates `routine_mate`, and imports `schema.sql`.
2. `backend`: Compiles the Spring Boot JAR inside a lightweight Temurin-21 container and connects to the MySQL container.
3. `frontend`: Compiles the React Vite bundle and serves it via Nginx on port `80`, automatically proxying `/api/*` to the backend.

### Step 2: Access Application
Open your browser at **`http://localhost`** (or your server's public IP).

### Managing Containers:
```bash
# View live logs
docker compose logs -f

# Check container status
docker compose ps

# Stop containers
docker compose down

# Stop and wipe database volume (clean reset)
docker compose down -v
```

---

## Strategy 2: Cloud PaaS Deployment (Railway / Render + Vercel)

### Part A: Database & Backend on Railway

1. Sign up at [Railway.app](https://railway.app/).
2. **Provision MySQL:**
   - Click **New Project** → **Provision MySQL**.
   - Under **Connect**, copy the `MYSQL_URL` connection string.
   - Go to the **Data** tab in Railway MySQL and paste the contents of `schema.sql` into the query console to initialize tables.
3. **Deploy Backend:**
   - Click **New** → **GitHub Repo** → select your `student_daily_routine` repository.
   - Set **Root Directory** to `/backend`.
   - Add Environment Variables in Railway:
     - `SPRING_DATASOURCE_URL`: `jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
     - `SPRING_DATASOURCE_USERNAME`: `${{MYSQLUSER}}`
     - `SPRING_DATASOURCE_PASSWORD`: `${{MYSQLPASSWORD}}`
     - `APP_JWT_SECRET`: `404E635266556A586E3272357538782F413F4428472B4B6250645367566B59707336763979244226452948404D635166`
   - Railway will build and deploy your Spring Boot app and assign a public URL (e.g. `https://routinemate-backend.up.railway.app`).

### Part B: Deploy Frontend on Vercel

1. Sign up at [Vercel.com](https://vercel.com/).
2. Click **Add New** → **Project** → select your repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://routinemate-backend.up.railway.app/api`
6. Click **Deploy**. Vercel will provide an instant HTTPS URL with free SSL!

---

## Strategy 3: Ubuntu 22.04 / 24.04 VPS Deployment (EC2, Droplet, Linode)

### Step 1: Install Dependencies on Server

```bash
sudo apt update && sudo apt install -y openjdk-21-jre-headless mysql-server nginx certbot python3-certbot-nginx
```

### Step 2: Configure MySQL 8

```bash
sudo mysql
```
```sql
CREATE DATABASE routine_mate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'routinemate'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON routine_mate.* TO 'routinemate'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Import schema:
```bash
mysql -u routinemate -p routine_mate < schema.sql
```

### Step 3: Build & Deploy Backend as a Systemd Service

1. Package JAR on your machine:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```
2. Copy `target/routinemate-backend-1.0.0.jar` to `/opt/routinemate/app.jar` on your server.
3. Create systemd service:
   ```bash
   sudo nano /etc/systemd/system/routinemate.service
   ```
   Add:
   ```ini
   [Unit]
   Description=RoutineMate Backend Service
   After=syslog.target network.target mysql.service

   [Service]
   User=ubuntu
   WorkingDirectory=/opt/routinemate
   ExecStart=/usr/bin/java -jar /opt/routinemate/app.jar
   Environment="SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/routine_mate?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
   Environment="SPRING_DATASOURCE_USERNAME=routinemate"
   Environment="SPRING_DATASOURCE_PASSWORD=YourStrongPassword123!"
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
4. Start backend:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now routinemate
   ```

### Step 4: Build & Deploy Frontend with Nginx

1. Build frontend locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Copy `frontend/dist/` contents to `/var/www/routinemate` on the server.
3. Configure Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/routinemate
   ```
   Paste:
   ```nginx
   server {
       server_name yourdomain.com;

       root /var/www/routinemate;
       index index.html;

       location /api/ {
           proxy_pass http://localhost:8080/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
4. Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/routinemate /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Step 5: Enable Free HTTPS (Let's Encrypt SSL)

```bash
sudo certbot --nginx -d yourdomain.com
```

Certbot configures SSL certificates automatically. Open **`https://yourdomain.com`** and your Web Push notifications will be fully operational across all mobile and desktop devices.
