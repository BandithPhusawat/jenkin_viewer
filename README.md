# Jenkins Dashboard

Dashboard สำหรับดู Jenkins build status ของแต่ละโปรเจกต์ — POC ก่อนนำไปใช้กับ Jenkins ของ SCB

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Zustand** — UI/client state
- **TanStack Query** — server state + auto polling
- **Tailwind CSS** — styling
- **Axios** — Jenkins API client
- **Docker Compose** — Jenkins + Redis + Dashboard ทั้งหมด

## โครงสร้างไฟล์

```
jenkins-dashboard/
├── docker/
│   ├── jenkins/              # Jenkins image config
│   │   ├── Dockerfile
│   │   ├── plugins.txt
│   │   ├── jenkins.yaml      # Configuration as Code (พร้อม sample jobs 3 ตัว)
│   │   └── init.groovy.d/
│   │       └── basic-security.groovy   # auto-generate API token
│   └── dashboard/
│       ├── Dockerfile        # Production multi-stage
│       └── Dockerfile.dev    # Dev mode + hot reload
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts          # health check + jenkins ping
│   │   │   └── projects/route.ts        # main API endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # dashboard UI
│   │   └── providers.tsx                # TanStack Query provider
│   ├── lib/
│   │   └── jenkins/
│   │       ├── client.ts                # Jenkins HTTP client
│   │       └── parser.ts                # แปลง response → ProjectStatus
│   ├── stores/
│   │   └── filterStore.ts               # Zustand
│   └── types/
│       └── jenkins.ts
├── docker-compose.dev.yml
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env
└── Makefile
```

## วิธีรัน

### 1. รันครั้งแรก

```bash
make dev
```

หรือถ้าไม่มี make:

```bash
docker compose -f docker-compose.dev.yml up --build
```

ครั้งแรกใช้เวลา 3-5 นาที (download Jenkins image + plugins + npm install)

### 2. เปิดในเบราว์เซอร์

- **Dashboard:** http://localhost:3000
- **Jenkins UI:** http://localhost:8080 (admin / admin123)

### 3. ใช้งานทันทีได้เลย

ตอนแรก `.env` ตั้งให้ใช้ user `admin` / password `admin123` ซึ่งทำงานได้เลย

หลัง Jenkins boot เสร็จ จะมี sample jobs 3 ตัวขึ้นมา:
- `sample-frontend-app` (BRANCH=main, TAG=v1.0.0)
- `sample-backend-api` (BRANCH=develop, TAG=v2.1.0)
- `sample-mobile-app` (BRANCH=release/2.0, TAG=v2.0.0-rc1)

ลอง trigger build ใน Jenkins UI ดูว่าข้อมูลขึ้นใน dashboard หรือไม่

### 4. (Optional) เปลี่ยนมาใช้ API token แทน password

หลัง Jenkins start เสร็จ ดู logs:

```bash
make token
# หรือ
docker compose -f docker-compose.dev.yml logs jenkins | grep -A1 "DASHBOARD API TOKEN"
```

จะเห็น token ของ user `dashboard-bot` แล้วแก้ `.env`:

```
JENKINS_USER=dashboard-bot
JENKINS_API_TOKEN=<token-from-logs>
```

แล้ว restart: `make restart`

## คำสั่ง Makefile

```bash
make dev               # start แบบ foreground (เห็น log)
make up                # start แบบ background
make down              # stop
make logs              # tail logs ทั้งหมด
make logs-jenkins      # logs เฉพาะ jenkins
make logs-dashboard    # logs เฉพาะ dashboard
make restart           # restart
make clean             # ล้างทุกอย่างรวม volumes
make token             # หา API token ของ dashboard-bot
make shell-dashboard   # เข้า container dashboard
make shell-jenkins     # เข้า container jenkins
```

## Troubleshooting

**Dashboard ขึ้นว่า "Disconnected"** — รอให้ Jenkins boot เสร็จก่อน (ดู `make logs-jenkins`) แล้ว refresh หน้า

**Jenkins boot ช้ามาก** — ครั้งแรกต้อง download plugins ทั้งหมด อดทนรอ 2-3 นาที

**Port ชน** — ถ้ามีอะไรใช้ port 3000, 8080, 6379 อยู่ ให้แก้ใน `docker-compose.dev.yml`

**อยาก reset ทุกอย่าง** — `make clean` (ลบ Jenkins data ด้วย)
