import { useEffect, useState } from 'react';

/**
 * Quantos cards mostrar por coluna do kanban antes de colapsar com "Ver mais".
 *
 * O cálculo é HEIGHT-based, não width-based: o que limita é quantos cards cabem
 * verticalmente na coluna sem cortar. Width só importa para o limite mínimo
 * (em mobile reduzimos um pouco porque cards podem ficar maiores e a UX espera
 * scroll vertical de página, não dentro de coluna).
 *
 * Constantes derivadas empiricamente do layout atual:
 *   - chrome (header da página + filtros + título da coluna + padding) ~ 280px
 *   - altura de um card (avatar/meta + chips + botão "Avançar" + margin) ~ 170px
 *
 * Em 1080p desktop  → (1080 - 280) / 170 ≈ 4 cards
 * Em 720p laptop    → (720  - 280) / 170 ≈ 2 cards
 * Em 1440p XL desk  → (1440 - 280) / 170 ≈ 6 cards
 */
const CHROME_PX = 280;
const CARD_PX = 170;
const HARD_MIN = 2;

function resolveLimit(viewportHeight: number, viewportWidth: number): number {
  if (viewportWidth <= 640) return HARD_MIN; // mobile: stack curto
  const available = viewportHeight - CHROME_PX;
  const fits = Math.floor(available / CARD_PX);
  return Math.max(HARD_MIN, fits);
}

export function useColumnLimit(): number {
  const [limit, setLimit] = useState(() => {
    if (typeof window === 'undefined') return 4;
    return resolveLimit(window.innerHeight, window.innerWidth);
  });

  useEffect(() => {
    function onResize() {
      setLimit(resolveLimit(window.innerHeight, window.innerWidth));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return limit;
}
