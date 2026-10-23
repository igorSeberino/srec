# SREC — visão do produto e regras de negócio

O SREC (Sistema de Reserva de Espaços e Coworking) resolve um problema de
alocação exclusiva: em um coworking, dois ocupantes não podem usar a mesma
estação de trabalho nem a mesma sala de reunião no mesmo intervalo de tempo.
O sistema substitui a planilha compartilhada por um cadastro de espaços e um
registro de reservas que recusa sobreposições.

Este documento descreve o produto **como ele existe hoje**. Onde a
documentação do grupo anterior (`Documentação Oficial SREC.md`) divergir, o
código vence. As divergências estão catalogadas em
[`docs/auditoria/divergencias-doc-codigo.md`](../auditoria/divergencias-doc-codigo.md),
e as três que tratam do banco estão detalhadas em
[`docs/arquitetura/der.md`](../arquitetura/der.md).

As evidências apontam para a `main` depois de FE-01 (PR #35), FE-04 (PR #36) e
OPS-01 (PR #40). O backend está como foi recebido.

## O que o sistema entrega

| Capacidade | Onde | Estado |
|---|---|---|
| Cadastro de espaços com nome, tipo e capacidade | `client/src/features/resources/ResourceForm.jsx:19-29`, `POST /api/resources` | funciona, com defeito em tipo e capacidade (RN01, RN02) |
| Listagem de espaços | `client/src/features/resources/ResourceListItem.jsx:5-20`, `GET /api/resources` | funciona |
| Exclusão de espaço | `client/src/features/resources/ResourcesPanel.jsx:6-14`, `DELETE /api/resources/:id` | funciona, mas apaga o histórico de reservas (RN09) |
| Criação de reserva com recusa de sobreposição | `client/src/features/reservations/ReservationForm.jsx:23-39`, `POST /api/reservations` | funciona em uso sequencial; falha sob concorrência (RN03) |
| Listagem de reservas em ordem cronológica | `client/src/features/reservations/ReservationList.jsx:17-21`, `GET /api/reservations` | funciona |
| Concluir ou cancelar reserva | `client/src/features/reservations/ReservationListItem.jsx:21-37`, `PATCH /api/reservations/:id/status` | funciona pela interface; a API aceita qualquer valor (RN07) |
| Exclusão definitiva de reserva | `client/src/features/reservations/ReservationsPanel.jsx:21-24`, `DELETE /api/reservations/:id` | funciona |

## O que o sistema não entrega

Quatro capacidades que a documentação recebida afirma existir e que **não têm
uma linha de código**: controle de acesso de administrador (RF14), usuário
identificado dono da reserva (RF13), ativação e inativação de espaço via
`is_active` (RF15) e a rota `PUT /api/reservations/{id}/cancel` (RF11).
Detalhamento e decisão em [`docs/produto/requisitos.md`](requisitos.md).

Consequência de produto a ter clara: **o SREC é hoje um sistema de uso
confiado.** Qualquer pessoa com acesso à URL cadastra, altera e exclui
qualquer coisa, e o campo "Nome do Responsável"
(`client/src/features/reservations/ReservationForm.jsx:60-71`) é texto livre
sem verificação. Isso é aceitável em um coworking pequeno com acesso restrito à
rede interna, e inaceitável em qualquer exposição pública. Não é bug; é o
perímetro de uso do produto, e precisa estar escrito.

## Atores

Um só: o **Operador**, qualquer pessoa com acesso à aplicação, com poder
total. `Administrador` e `Usuário identificado` existem apenas na
documentação recebida. Ver a seção "Atores" de
[`docs/produto/requisitos.md`](requisitos.md).

## Regras de negócio

Mesma convenção de `Situação` dos requisitos: `implementado`,
`implementado com defeito (BUG-nn)` ou `(CS-nn)`, `documentado mas inexistente`,
`não implementado`.

---

### RN01 — Um espaço é estação de trabalho ou sala de reunião

Todo espaço pertence a exatamente um de dois tipos: `workstation` (foco
individual, capacidade unitária) ou `meeting_room` (foco colaborativo,
capacidade em grupo). A distinção vem da própria definição do produto
(`Documentação Oficial SREC.md:9-11`).

**Situação.** `implementado com defeito (BUG-10)`

**Evidência.** A interface oferece só os dois valores corretos, em um
`<select>` (`client/src/features/resources/ResourceForm.jsx:48-56`), a partir
das constantes de `client/src/constants/domain.js:1-4`. A API aceita qualquer
string: `server/src/controllers/resourceController.js:7` só verifica presença
(`if (!name || !type)`), e `server/src/config/initDb.js:8` declara
`type VARCHAR(50) NOT NULL` com os valores válidos apenas em **comentário
SQL**, que o banco ignora. `POST /api/resources` com `{"type":"banana"}`
responde `201`.

No código recebido, a lista exibia qualquer tipo desconhecido como "Estação de
Trabalho". Desde FE-01, `resourceTypeLabel`
(`client/src/constants/domain.js:17-21`) mostra o valor cru: o dado inválido
deixou de ficar disfarçado na tela, mas continua sendo aceito pela API.

**Trabalho na N2.** O índice de specs atribui BUG-10 a BE-03, mas a spec
BE-03 só trata `status`. O `CHECK (type IN ('workstation','meeting_room'))`
tem prefixo de migration reservado em OPS-02 (`1761000007000`), sem spec que
o implemente.

---

### RN02 — A capacidade de um espaço é pelo menos uma pessoa

Espaço com capacidade zero ou negativa não representa nada no mundo físico.

**Situação.** `implementado com defeito (BUG-09)`

**Evidência.** `server/src/controllers/resourceController.js:10` passa
`capacity || 1`. Em JavaScript, `0 || 1` vale `1`: enviar `capacity: 0` grava
**1**, responde `201`, e o Operador nunca sabe que o valor foi trocado.
Enviar `capacity: -5` grava `-5`, porque `-5` é *truthy* e
`server/src/config/initDb.js:9` não tem `CHECK`. O cliente mitiga com
`min="1"` no `<input type="number">`
(`client/src/features/resources/ResourceForm.jsx:60-68`), que é validação de
navegador e não protege a API.

Duas falhas opostas no mesmo parâmetro: um valor inválido é silenciosamente
corrigido, outro é silenciosamente aceito. Nenhum dos dois devolve erro.

**Trabalho na N2.** O índice de specs atribui BUG-09 a BE-02, mas a spec
BE-02 só trata a janela da reserva. O `CHECK` de capacidade divide o prefixo
`1761000007000` de OPS-02 com RN01, também sem spec. FE-03 espelha a regra no
cliente, o que não protege a API.

---

### RN03 — Duas reservas não podem se sobrepor no mesmo espaço

É a regra central do produto. Duas reservas do mesmo espaço se sobrepõem
quando o início de uma é anterior ao fim da outra e o fim da primeira é
posterior ao início da segunda:

```text
Início_banco < Fim_novo AND Fim_banco > Início_novo
```

Reservas encostadas (o fim de uma coincide com o início da outra) **não**
se sobrepõem, porque a comparação é estrita.

**Situação.** `implementado com defeito (BUG-01)`

**Evidência.** A fórmula está correta e implementada em
`server/src/models/reservationModel.js:55`,
`(start_time < $3 AND end_time > $2)`, com `$2` = início novo e `$3` = fim
novo (`reservationModel.js:59`). Confere literalmente com
`Documentação Oficial SREC.md:72`. Tem teste unitário
(`server/src/models/reservationModel.test.js:11-37`).

O defeito é de execução, não de lógica:
`server/src/controllers/reservationController.js:12-16` **lê** a
disponibilidade e `:23-28` **escreve** a reserva, sem transação, sem
`SELECT ... FOR UPDATE` e sem constraint de respaldo no banco
(`initDb.js:14-23` não tem `EXCLUDE`). Entre a leitura e a escrita há uma
janela em que outra requisição lê o mesmo "disponível". Duas requisições
simultâneas para o mesmo intervalo recebem `201` as duas.

Dois caminhos adicionais furam esta regra:

* reserva com `end_time < start_time` (RN05) define intervalo vazio, que
  nunca satisfaz a fórmula, então nunca colide com nada;
* reserva com `status NULL` (RN07) é invisível ao `WHERE status != 'cancelled'`
  de `reservationModel.js:53`, porque `NULL != 'cancelled'` avalia para
  `NULL`.

**Trabalho na N2.** BE-01: constraint `EXCLUDE` no banco. A constraint é o
que torna a regra inviolável por qualquer caminho, inclusive `psql`.

---

### RN04 — Reserva cancelada libera o horário

Cancelar uma reserva devolve o intervalo ao pool de disponibilidade.

**Situação.** `implementado`

**Evidência.** `server/src/models/reservationModel.js:53` filtra
`status != 'cancelled'` na verificação de disponibilidade. Reserva
`cancelled` não bloqueia novas reservas no mesmo intervalo.

**Ressalva.** Depende de `status` ser sempre um dos três valores válidos. Com
`status NULL` (ver RN07), a reserva não é `cancelled`, mas também não
bloqueia. A regra só fica sólida depois de BE-03 e do `NOT NULL` em `status`.

---

### RN05 — O fim de uma reserva é posterior ao seu início

Uma reserva ocupa um intervalo de tempo com duração positiva.

**Situação.** `não implementado`

**Evidência.** `server/src/controllers/reservationController.js:7` verifica
apenas a presença dos quatro campos; não há comparação entre `start_time` e
`end_time` em nenhuma das 90 linhas do controller.
`server/src/config/initDb.js:18-19` declara as duas colunas `NOT NULL` e nada
mais.

É o BUG-02, e o agravante é o encadeamento com RN03: o intervalo invertido é
vazio, então a fórmula de sobreposição nunca é satisfeita por ele. A reserva
corrompida **não aparece** nas verificações de disponibilidade de ninguém.

**Trabalho na N2.** BE-02: `CHECK (end_time > start_time)` e validação no
controller devolvendo `400`.

---

### RN06 — Uma reserva não pode começar no passado

Reservar um horário que já passou não tem significado operacional: o espaço
já foi ou não foi usado.

**Situação.** `não implementado`

**Evidência.** Não há comparação com `NOW()`, `CURRENT_TIMESTAMP` ou
`Date.now()` em `server/src/controllers/reservationController.js`. Os
`<input type="datetime-local">` do cliente
(`client/src/features/reservations/ReservationForm.jsx:74-92`) não têm
atributo `min`. É o BUG-08.

**Trabalho na N2.** BE-02 já decidiu o comportamento: a API recusa
`start_time` anterior ao momento da criação, com 60 s de tolerância de
relógio (`MAX_CLOCK_SKEW_MS`). A regra fica só na aplicação, porque depende de
`now()`, que não pode entrar em `CHECK`.

---

### RN07 — Uma reserva nasce agendada e pode ser concluída ou cancelada

Ciclo de vida: `scheduled → completed` ou `scheduled → cancelled`. Estado
final não transiciona. A documentação recebida descreve o mesmo ciclo
(`Documentação Oficial SREC.md:32`: `Agendado -> Concluído ou Cancelado`).

**Situação.** `implementado com defeito (BUG-03)`

**Evidência.** O nascimento está correto:
`server/src/models/reservationModel.js:6` insere sem `status`, e
`server/src/config/initDb.js:20` aplica `DEFAULT 'scheduled'`.

A interface respeita o ciclo: os botões de concluir e cancelar só aparecem
quando o status é `scheduled`
(`client/src/features/reservations/ReservationListItem.jsx:21`) e enviam
exatamente `completed` (`:26`) e `cancelled` (`:32`), a partir de
`client/src/constants/domain.js:11-15`.

A API não respeita nada.
`server/src/controllers/reservationController.js:60-73` repassa
`req.body.status` direto para o `UPDATE` (`reservationModel.js:32-41`) sem
verificar valor nem transição:

* `{"status":"banana"}` grava `banana` e responde `200`. Não há `CHECK` em
  `initDb.js:20`.
* `{"status":"scheduled"}` em reserva já `completed` volta a um estado
  anterior.
* corpo `{}` faz `req.body.status` ser `undefined`
  (`reservationController.js:63`), o driver `pg` grava `NULL`, e
  `status VARCHAR(20) DEFAULT 'scheduled'` não é `NOT NULL`. A partir daí a
  reserva **desaparece de RN03**: em `reservationModel.js:53`,
  `NULL != 'cancelled'` avalia para `NULL` e a linha não entra no resultado.
  Um `PATCH` com corpo vazio desarma a regra central para aquela reserva.

A proteção do ciclo de vida existe apenas na camada que o usuário vê.

**Trabalho na N2.** BE-03: `CHECK (status IN ('scheduled','cancelled','completed'))`
e validação no controller. O `SET NOT NULL` em `status` está na migration de
BE-01; a tabela de prefixos de OPS-02 o atribui a BE-03. Ver a nota de
divergência entre specs em [`docs/arquitetura/der.md`](../arquitetura/der.md).

---

### RN08 — Cancelar e excluir são ações diferentes

Cancelar muda o status e preserva o registro para histórico. Excluir remove
o registro. São intenções distintas e não devem ser confundidas.

**Situação.** `implementado`

**Evidência.** Os dois caminhos existem e são distintos na API:
`PATCH /api/reservations/:id/status` com `cancelled`
(`server/src/routes/reservationRoutes.js:8`) preserva a linha;
`DELETE /api/reservations/:id` (`:9`) executa
`DELETE FROM reservations WHERE id = $1` (`reservationModel.js:44`).

**Achado colateral, não catalogado.** A interface descreve a exclusão com três
vocabulários, e um deles é a palavra reservada para a outra ação:

* o `window.confirm` diz "Deseja **cancelar** esta reserva permanentemente?"
  (`client/src/features/reservations/ReservationsPanel.jsx:22`);
* o nome acessível do botão diz "Excluir definitivamente"
  (`client/src/features/reservations/ReservationListItem.jsx:39`);
* o feedback de sucesso diz "Reserva removida!" (`ReservationsPanel.jsx:23`).

Um Operador que queira cancelar tende a clicar na lixeira, porque o texto de
confirmação fala de cancelamento, e perde o histórico. FE-01 preservou esse
texto de propósito, por ser refatoração sem mudança de comportamento. O
problema não está em `docs/auditoria/` nem em nenhuma spec: fica registrado
aqui para virar issue com a label `bug do cliente`.

---

### RN09 — Excluir um espaço não deve destruir o histórico de reservas

O registro de que uma sala foi usada em determinado horário é informação de
negócio e sobrevive à sala.

**Situação.** `não implementado`

**Evidência.** `server/src/config/initDb.js:16` declara
`resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE`. Excluir um
recurso apaga, no mesmo comando e em silêncio, **todas** as suas reservas,
passadas e futuras. O `window.confirm`
(`client/src/features/resources/ResourcesPanel.jsx:7`), "Deseja realmente
remover este espaço?", não menciona a perda, e a resposta da API é
`{"message":"Resource deleted successfully"}`
(`server/src/controllers/resourceController.js:64`), sem contagem do que foi
destruído.

É o BUG-06, o único bug do catálogo que **perde dado de forma irrecuperável**
com um clique.

**Trabalho na N2.** FE-05 dá superfície ao problema, com um diálogo que avisa
a exclusão em cascata, e está condicionada à decisão de BE-08 entre exclusão
física e desativação lógica. A troca de `ON DELETE CASCADE` por
`ON DELETE RESTRICT` tem prefixo de migration reservado em OPS-02
(`1761000008000`), sem spec que a implemente. Se não entrar na N2, é débito de
prioridade máxima no handoff da N3.

---

### RN10 — Toda reserva pertence a um espaço existente

**Situação.** `implementado com defeito (CS-02)`

**Evidência.** A chave estrangeira existe (`initDb.js:16`,
`REFERENCES resources(id)`) e impede que `resource_id` aponte para recurso
inexistente. Dois furos:

1. **A coluna aceita `NULL`.** `initDb.js:16` não declara `NOT NULL`. Um
   `INSERT` por `psql` com `resource_id NULL` é aceito pelo banco. A API
   barra por acidente: `!resource_id` é verdadeiro para `null`
   (`reservationController.js:7`). A integridade referencial depende de uma
   checagem de *truthiness* no JavaScript.
2. **`resource_id` inexistente devolve `500`.** `POST /api/reservations` com
   `resource_id: 99999` viola a FK, o PostgreSQL levanta `23503`, e o `catch`
   genérico de `reservationController.js:30-33` devolve
   `{"error":"Internal server error"}`. O Operador recebe "erro do servidor"
   quando o erro é dele. É o tratamento de erro duplicado do CS-02.

**Trabalho na N2.** BE-04 mapeia o SQLSTATE `23503` para `409` no middleware
central de erro. O `NOT NULL` em `resource_id` não está em nenhuma spec nem na
tabela de prefixos de OPS-02: é pendência declarada em
[`docs/arquitetura/der.md`](../arquitetura/der.md).

---

### RN11 — Os horários são os horários locais do coworking

O Operador digita e lê horários no fuso em que o coworking opera
(`America/Sao_Paulo`, UTC-03).

**Situação.** `implementado com defeito (BUG-07)`

**Evidência.** `server/src/config/initDb.js:18-19` usa `TIMESTAMP` sem
`WITH TIME ZONE`: o PostgreSQL guarda os dígitos e **descarta** qualquer
offset recebido. O cliente envia string sem offset, produzida por
`<input type="datetime-local">`
(`client/src/features/reservations/ReservationForm.jsx:74-92`, enviada em
`:29-30`), e na leitura aplica `new Date(...).toLocaleString('pt-BR')`
(`client/src/features/reservations/ReservationListItem.jsx:15-16`), que
reinterpreta o valor. O horário exibido pode diferir do digitado.

O critério decisivo do teste: hoje o resultado **muda** se o processo Node
subir com `TZ=UTC`. Comportamento de negócio que depende da variável de
ambiente da máquina não é comportamento; é acidente.

**Trabalho na N2.** BE-07 (`TIMESTAMPTZ`) e FE-02 (enviar com offset
explícito).

---

### RN12 — Toda reserva tem um responsável identificável

**Situação.** `documentado mas inexistente`

**Evidência.** A documentação recebida declara `UUID user_id`
(`Documentação Oficial SREC.md:94`) e afirma que `GET /api/reservations`
lista "as reservas do usuário atual" (`:116`). O que existe é
`user_name VARCHAR(100) NOT NULL` (`initDb.js:17`), preenchido por digitação
livre (`client/src/features/reservations/ReservationForm.jsx:60-71`), sem
tabela de usuários, sem FK e sem unicidade. `findAll` não tem `WHERE`
(`reservationModel.js:15`): lista tudo, de todos.

"Responsável" no SREC é uma etiqueta de texto, não uma identidade. Duas
pessoas chamadas Carlos são a mesma string, e o sistema não as distingue.

**Decisão da N2.** Não implementar; corrigir a documentação e registrar como
débito da N3. Ver RF13 em [`docs/produto/requisitos.md`](requisitos.md).

---

### RN13 — Só o administrador gerencia os espaços

**Situação.** `documentado mas inexistente`

**Evidência.** `Documentação Oficial SREC.md:109` marca `POST /api/resources`
como "Nível de acesso Admin", e `:45` e `:52` amarram o CRUD de espaços ao
ator `admin`. No código, `server/src/index.js:13-14` registra apenas `cors()`
e `express.json()` antes das rotas (`:17-18`);
`server/src/routes/resourceRoutes.js:5-9` não tem middleware; e
`server/package.json:18-23` não traz nenhuma dependência de autenticação.
`curl -X DELETE http://localhost:5000/api/resources/1` apaga um espaço e, por
RN09, todas as reservas dele.

**Decisão da N2.** Não implementar; corrigir a documentação e registrar como
débito da N3. Ver RF14.

---

### RN14 — Espaço inativo não pode ser reservado

**Situação.** `documentado mas inexistente`

**Evidência.** `Documentação Oficial SREC.md:88` declara
`BOOLEAN is_active` em `RESOURCE`. A coluna não existe
(`server/src/config/initDb.js:5-12`), os models não a leem nem escrevem
(`server/src/models/resourceModel.js:6`, `:29`) e nenhuma consulta a filtra.

A ausência tem custo direto: a única forma de tirar um espaço de circulação
é `DELETE`, que por RN09 destrói o histórico. **A falta de `is_active`
transforma uma inativação temporária em perda permanente de dado.**

**Decisão da N2.** Não implementar nesta entrega; BE-08 decide entre exclusão
física e desativação lógica, e FE-05 se adapta à decisão. Ver RF15.

---

### RN15 — A duração de uma reserva tem limites

Uma reserva de 5 minutos ou de 3 anos não serve ao negócio de coworking.

**Situação.** `não implementado`

**Evidência.** Não há nenhum limite em código, nem mínimo nem máximo:
`server/src/controllers/reservationController.js:4-34` não compara duração, e
`server/src/config/initDb.js:18-19` não tem `CHECK`. A documentação recebida
também não menciona limites.

**Decisão de produto pendente.** Os valores de mínimo e máximo são decisão do
PO, não do engenheiro de requisitos. Até que existam, o `CHECK` de janela de
BE-02 implementa apenas RN05 (`end_time > start_time`), que é a parte
inquestionável. Levantar com `@igorSeberino`.

## Rastreabilidade regra → requisito → spec

| Regra | Situação | Requisito | Spec da N2 |
|---|---|---|---|
| RN01 | implementado com defeito (BUG-10) | RF01 | nenhuma (prefixo `1761000007000` reservado em OPS-02) |
| RN02 | implementado com defeito (BUG-09) | RF01 | nenhuma no backend (prefixo `1761000007000`); FE-03 no cliente |
| RN03 | implementado com defeito (BUG-01) | RF06 | BE-01 |
| RN04 | implementado | RF06, RF09 | — (sólida após BE-03) |
| RN05 | não implementado | RF06 | BE-02 |
| RN06 | não implementado | RF06 | BE-02 |
| RN07 | implementado com defeito (BUG-03) | RF09, RF19 | BE-03, BE-01 (`NOT NULL`) |
| RN08 | implementado | RF09, RF10 | nenhuma (achado colateral, abrir issue) |
| RN09 | não implementado | RF05 | FE-05 (aviso); prefixo `1761000008000` reservado em OPS-02 |
| RN10 | implementado com defeito (CS-02) | RF06 | BE-04; `NOT NULL` sem spec |
| RN11 | implementado com defeito (BUG-07) | RF06, RNF04 | BE-07, FE-02 |
| RN12 | documentado mas inexistente | RF13 | nenhuma (débito da N3) |
| RN13 | documentado mas inexistente | RF14 | nenhuma (débito da N3) |
| RN14 | documentado mas inexistente | RF15 | BE-08 decide; FE-05 se adapta |
| RN15 | não implementado | RF06 | nenhuma (decisão de produto pendente) |

**Leitura.** Das 15 regras de negócio, **2** estão implementadas (RN04, que
depende de BE-03 para ser sólida, e RN08, com o achado de texto na
interface), **6** estão implementadas com defeito catalogado, **4** não
existem e **3** existem apenas na documentação recebida. A documentação
recebida registrava **1** regra de negócio: a fórmula anti-sobreposição
(`Documentação Oficial SREC.md:67-75`).
