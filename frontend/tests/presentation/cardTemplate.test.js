import { describe, expect, it } from 'vitest';

import { renderCardFront } from '../../src/presentation/templates/cardTemplate.js';
import { SAMPLE_CARDS } from '../helpers/fixtures.js';

const [challenge, question, penalty] = SAMPLE_CARDS;

describe('renderCardFront', () => {
  it('renderiza número, categoria, título e penalidade', () => {
    const html = renderCardFront(challenge);
    expect(html).toContain('Nº D1');
    expect(html).toContain('<span class="pill">Desafio</span>');
    expect(html).toContain('DESAFIO UM');
    expect(html).toContain('<small>PENALIDADE</small>Tome 1 shot.');
  });

  it('inclui a resposta oculta só em cartas com resposta', () => {
    expect(renderCardFront(question)).toContain('<div class="ans" id="ans-box" hidden><small>RESPOSTA</small>2.</div>');
    expect(renderCardFront(challenge)).not.toContain('ans-box');
  });

  it('marca penalidades de rodada como regra temporária', () => {
    expect(renderCardFront(penalty)).toContain('REGRA TEMPORÁRIA');
    expect(renderCardFront(challenge)).not.toContain('REGRA TEMPORÁRIA');
  });

  it('escapa HTML do conteúdo', () => {
    const html = renderCardFront({ ...challenge, desc: '<script>"x"&</script>' });
    expect(html).toContain('&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;');
  });
});
