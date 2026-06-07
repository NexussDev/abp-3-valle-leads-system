import { describe, it, expect, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { submitPublicLead, publicClient } from './publicLeadsApi';

describe('submitPublicLead', () => {
  const mock = new MockAdapter(publicClient);

  afterEach(() => mock.reset());

  it('POST /leads → devolve o payload do backend em caso de sucesso', async () => {
    mock.onPost(/\/leads$/).reply(201, {
      message: 'Cadastro realizado com sucesso! Em breve entraremos em contato.',
      lead: { id: 'lead-1', name: 'Teo - HR-V', status: 'novo_lead' },
    });

    const result = await submitPublicLead({
      nome: 'Teo',
      whatsapp: '11999999999',
      cidade: 'São Paulo',
      veiculo: 'HR-V',
      origem: 'instagram',
    });

    expect(result.lead.id).toBe('lead-1');
    expect(result.lead.status).toBe('novo_lead');
    expect(mock.history.post.length).toBe(1);
    const sent = JSON.parse(mock.history.post[0].data);
    expect(sent).toMatchObject({
      nome: 'Teo',
      whatsapp: '11999999999',
      veiculo: 'HR-V',
      origem: 'instagram',
    });
  });

  it('propaga erro de rede para o caller', async () => {
    mock.onPost(/\/leads$/).reply(503, { status: 'error', message: 'Sistema não configurado.' });

    await expect(
      submitPublicLead({ nome: 'Teo', whatsapp: '11999999999' }),
    ).rejects.toThrow();
  });
});
