const { api, pool, resetDatabase, insertResource, insertReservation, countReservations } = require('../helpers/api');

const resource = (overrides = {}) => ({ name: 'Sala Azul', type: 'meeting_room', capacity: 8, ...overrides });

describe('API de recursos', () => {
  beforeEach(resetDatabase);
  afterAll(() => pool.end());

  describe('POST /api/resources', () => {
    it('R-01 cria com corpo completo e válido → 201', async () => {
      const response = await api().post('/api/resources').send(resource());

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ id: 1, name: 'Sala Azul', type: 'meeting_room', capacity: 8 });
    });

    it('R-02 assume capacidade 1 quando capacity é omitido → 201', async () => {
      const response = await api().post('/api/resources').send({ name: 'Mesa 1', type: 'workstation' });

      expect(response.status).toBe(201);
      expect(response.body.capacity).toBe(1);
    });

    it.each([
      ['R-03 sem name', { type: 'workstation' }],
      ['R-04 sem type', { name: 'Mesa 1' }],
    ])('%s → 400 sem gravar', async (_scenario, body) => {
      const response = await api().post('/api/resources').send(body);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'RESOURCE_FIELDS_REQUIRED' });
      expect((await pool.query('SELECT COUNT(*) AS n FROM resources')).rows[0].n).toBe('0');
    });

    // BUG-10 e BUG-09 continuam abertos (#47). test.failing passa enquanto o
    // bug existe e quebra no dia em que for corrigido: aí vira `it` normal.
    test.failing('R-05 recusa tipo fora do enum, "sofa" → 400 (BUG-10, #47)', async () => {
      const response = await api().post('/api/resources').send(resource({ type: 'sofa' }));

      expect(response.status).toBe(400);
    });

    test.failing('R-06 recusa capacity 0 → 400 (BUG-09, #47)', async () => {
      const response = await api().post('/api/resources').send(resource({ capacity: 0 }));

      expect(response.status).toBe(400);
    });

    test.failing('R-07 recusa capacity negativa → 400 (BUG-09, #47)', async () => {
      const response = await api().post('/api/resources').send(resource({ capacity: -5 }));

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/resources', () => {
    it('R-08 base vazia → 200 e []', async () => {
      const response = await api().get('/api/resources');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('R-09 devolve os recursos em ordem de id → 200', async () => {
      await insertResource({ name: 'B' });
      await insertResource({ name: 'A' });

      const response = await api().get('/api/resources');

      expect(response.status).toBe(200);
      expect(response.body.map((r) => r.name)).toEqual(['B', 'A']);
    });
  });

  describe('GET /api/resources/:id', () => {
    it('R-10 id existente → 200', async () => {
      const created = await insertResource();

      const response = await api().get(`/api/resources/${created.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: created.id, name: 'Sala Azul' });
    });

    it('R-11 id inexistente → 404', async () => {
      const response = await api().get('/api/resources/999999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    });

    // BUG-04: o código recebido devolvia 500 com o erro cru do Postgres.
    it('R-12 id não numérico "abc" → 400 (BUG-04)', async () => {
      const response = await api().get('/api/resources/abc');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'INVALID_ID_PARAM' });
    });
  });

  describe('PUT /api/resources/:id', () => {
    it('R-13 corpo completo → 200 com os três campos trocados', async () => {
      const created = await insertResource();

      const response = await api().put(`/api/resources/${created.id}`).send({ name: 'Sala Verde', type: 'workstation', capacity: 2 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ name: 'Sala Verde', type: 'workstation', capacity: 2 });
    });

    // BUG-05: o corpo parcial virava NOT NULL violado e 500.
    it.each([
      ['só name', { name: 'Sala Verde' }, { name: 'Sala Verde', type: 'meeting_room', capacity: 8 }],
      ['só capacity', { capacity: 4 }, { name: 'Sala Azul', type: 'meeting_room', capacity: 4 }],
      ['só type', { type: 'workstation' }, { name: 'Sala Azul', type: 'workstation', capacity: 8 }],
    ])('R-14 corpo parcial (%s) → 200 preservando o resto (BUG-05)', async (_scenario, body, expected) => {
      const created = await insertResource();

      const response = await api().put(`/api/resources/${created.id}`).send(body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(expected);
    });

    it('R-15 corpo vazio {} → 400 (BUG-05)', async () => {
      const created = await insertResource();

      const response = await api().put(`/api/resources/${created.id}`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'EMPTY_UPDATE' });
    });

    it('R-15b name só com espaços → 400', async () => {
      const created = await insertResource();

      const response = await api().put(`/api/resources/${created.id}`).send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'INVALID_NAME' });
    });

    it('R-16 id inexistente → 404', async () => {
      const response = await api().put('/api/resources/999999').send({ capacity: 3 });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    });

    it('R-17 id não numérico "abc" → 400 (BUG-04)', async () => {
      const response = await api().put('/api/resources/abc').send({ capacity: 3 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('R-18 id existente → 200 e o GET seguinte dá 404', async () => {
      const created = await insertResource();

      const response = await api().delete(`/api/resources/${created.id}`);

      expect(response.status).toBe(200);
      expect((await api().get(`/api/resources/${created.id}`)).status).toBe(404);
    });

    it('R-19 id inexistente → 404', async () => {
      const response = await api().delete('/api/resources/999999');

      expect(response.status).toBe(404);
    });

    it('R-20 id não numérico "abc" → 400 (BUG-04)', async () => {
      const response = await api().delete('/api/resources/abc');

      expect(response.status).toBe(400);
    });

    // BUG-06: a regra de produto (bloquear ou só avisar) ainda não foi
    // decidida no backend; FE-05 resolveu do lado do client com aviso.
    it.todo('R-21 recusa apagar espaço com reserva ativa (BUG-06, aguarda decisão de produto)');

    it('R-22 apagar o espaço apaga as reservas dele em cascata (BUG-06, documenta o comportamento)', async () => {
      const created = await insertResource();
      await insertReservation({ resourceId: created.id, start: '2030-01-10T14:00:00-03:00', end: '2030-01-10T15:00:00-03:00' });
      await insertReservation({ resourceId: created.id, start: '2030-01-11T14:00:00-03:00', end: '2030-01-11T15:00:00-03:00' });

      const response = await api().delete(`/api/resources/${created.id}`);

      expect(response.status).toBe(200);
      expect(await countReservations()).toBe(0);
    });
  });
});
