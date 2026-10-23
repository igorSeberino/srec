# Diário de onboarding (ONB-01)

Registro de quem subiu o SREC localmente, quanto tempo levou e onde travou.
Serve de evidência da fricção real e sustenta a métrica **M-23** (passos
manuais para subir o sistema) de [`metricas-baseline.md`](metricas-baseline.md).

## Passos manuais

| Cenário | Passos | Fonte |
|---|---|---|
| Antes (código recebido) | **7**: instalar PostgreSQL; criar o banco `srec`; criar `server/.env`; `npm install` no server; `npm install --legacy-peer-deps` no client; `npm run dev` no server; `npm run dev` no client | M-23 do baseline |
| Depois (OPS-01, `main`) | **1**: `docker compose up -d --build` | `docker-compose.yml` |

Pré-requisito do cenário "depois": Docker com o daemon em execução (ver travada 1).

## Registros

### Igor Seberino (PO + QA) — cenário "depois", `main` @ `1c7a0be`

- Máquina: Windows 11, Docker 29.8.2 (Docker Desktop), Node 24.22.0.
- Comando: `docker compose up -d --build` (imagens já com cache parcial).
- Tempo do comando: **55 s**.
- Verificação (o 200 é o que vale, ver BUG-11):

| Checagem | Obtido |
|---|---|
| `curl http://localhost:5000/` | `SREC Coworking API is running...` |
| `curl -w '%{http_code}' http://localhost:5000/api/resources` | `200` |
| `curl http://localhost:5173` contém `id="root"` | sim |
| `docker compose ps` | postgres `healthy`, server e client `Up` |

**Travadas**

1. Daemon parado. Com o Docker Desktop fechado, o primeiro comando falha:
   `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; check if the path is correct and if the daemon is running: open //./pipe/dockerDesktopLinuxEngine: O sistema não pode encontrar o arquivo especificado.`
   Resolução: iniciar o Docker Desktop e esperar o daemon responder em
   `docker info`. O README não menciona esse pré-requisito.

### Adrian Cesar (Backend) — pendente
### Renato Colin (Frontend) — pendente
### Gabriel Carvalho (DevOps) — pendente
### Diego Nessler (Requisitos) — pendente

Cada pessoa copia o bloco do Igor e preenche: máquina, comando, tempo, tabela
de verificação e cada travada com a **mensagem de erro exata**.

## Pendências para fechar a ONB-01

- [ ] As 4 pessoas restantes registrarem sua execução (critério: 5 de 5).
- [ ] Atualizar M-23 em `metricas-baseline.md` (QA-04), com a coluna "depois" = 1.
