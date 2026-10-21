# SREC — client

Frontend React + Vite do Sistema de Reservas & Coworking.

## Rodando

```bash
npm ci --legacy-peer-deps
cp .env.example .env.local   # opcional: ajuste a URL da API
npm run dev
```

## Configuração

| Variável       | Padrão                      | Descrição                          |
| -------------- | --------------------------- | ---------------------------------- |
| `VITE_API_URL` | `http://localhost:5000/api` | URL base da API, sem barra no fim. |

Variáveis `VITE_*` são embutidas no build: mudar a URL exige rodar `npm run build` de novo,
mas não exige editar código.

## Scripts

| Script                  | O que faz                         |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento       |
| `npm run build`         | Build de produção em `dist/`      |
| `npm run lint`          | ESLint (inclui `jsx-a11y`)        |
| `npm test`              | Testes (Vitest + Testing Library) |
| `npm run test:coverage` | Testes com relatório de cobertura |

## Estrutura

```
src/
  App.jsx            composição da tela (abas + painéis)
  components/        peças de UI genéricas (Header, Tabs, Feedback)
  features/
    resources/       cadastro e lista de espaços
    reservations/    agendamento e lista de reservas
  hooks/             estado e carga de dados (useCollection, useFeedback...)
  services/
    http.js          único ponto de fetch, parse e tratamento de erro
    api.js           endpoints da API
    datetime.js      contrato de horário com a API (ISO 8601 com offset)
  test/              setup e fixtures dos testes
```

## Contrato de horário

O `<input type="datetime-local">` entrega o horário local sem fuso. Antes de enviar,
`toApiDateTime` converte para ISO 8601 em UTC (`2030-01-10T12:00:00.000Z`); na exibição,
`formatDateTime` converte de volta para o fuso do navegador. Os testes rodam com
`TZ=America/Sao_Paulo` fixo.
