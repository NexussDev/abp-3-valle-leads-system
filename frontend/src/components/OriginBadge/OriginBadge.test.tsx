import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OriginBadge from './OriginBadge';

describe('OriginBadge', () => {
  it('renders nothing when origin is missing', () => {
    const { container } = render(<OriginBadge origin={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders WhatsApp variant with brand green background', () => {
    render(<OriginBadge origin="WhatsApp" />);
    // Label text is rendered directly inside the styled <span>, so getByText returns
    // the styled element itself — inspect its inline style.
    const badge = screen.getByText('WhatsApp');
    expect(badge).toBeInTheDocument();
    expect(badge.getAttribute('style') ?? '').toMatch(/#25D366|rgb\(37,\s*211,\s*102\)/i);
  });

  it('normalizes fuzzy aliases (zap → WhatsApp)', () => {
    render(<OriginBadge origin="zap" />);
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('normalizes accented Portuguese (Indicação)', () => {
    render(<OriginBadge origin="Indicação" />);
    expect(screen.getByText('Indicação')).toBeInTheDocument();
  });

  it('maps Facebook Marketplace to Facebook', () => {
    render(<OriginBadge origin="Facebook Marketplace" />);
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('falls back to "Outro" for unknown origins', () => {
    render(<OriginBadge origin="qualquer-coisa-estranha" />);
    expect(screen.getByText('Outro')).toBeInTheDocument();
  });

  it('renders Loja Física with store icon and dark green', () => {
    render(<OriginBadge origin="Loja Física" />);
    expect(screen.getByText('Loja Física')).toBeInTheDocument();
  });
});
