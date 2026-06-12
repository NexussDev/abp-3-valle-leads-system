import { CSSProperties } from 'react';

type OriginKey =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'site'
  | 'indicacao'
  | 'outro'
  | 'loja_fisica'
  | 'webmotors'
  | 'olx'
  | 'mercado_livre'
  | 'chaves_na_mao';

interface OriginVisual {
  label: string;
  bg: string;
  fg: string;
  icon: JSX.Element;
}

const ICON_PROPS = { width: 12, height: 12, viewBox: '0 0 24 24' };

const WHATSAPP_ICON = (
  <svg {...ICON_PROPS} fill="currentColor">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26L4.43 19.4l2.224-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
  </svg>
);

const INSTAGRAM_ICON = (
  <svg {...ICON_PROPS} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const FACEBOOK_ICON = (
  <svg {...ICON_PROPS} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const GLOBE_ICON = (
  <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const HEART_ICON = (
  <svg {...ICON_PROPS} fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const STORE_ICON = (
  <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1-5h16l1 5" />
    <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
    <path d="M3 9h18" />
  </svg>
);

const DOTS_ICON = (
  <svg {...ICON_PROPS} fill="currentColor">
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
  </svg>
);

const VISUALS: Record<OriginKey, OriginVisual> = {
  whatsapp:      { label: 'WhatsApp',    bg: '#25D366', fg: '#ffffff', icon: WHATSAPP_ICON },
  instagram:     { label: 'Instagram',   bg: 'linear-gradient(135deg,#feda75 0%,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5 100%)', fg: '#ffffff', icon: INSTAGRAM_ICON },
  facebook:      { label: 'Facebook',    bg: '#1877F2', fg: '#ffffff', icon: FACEBOOK_ICON },
  site:          { label: 'Site',        bg: '#0ea5e9', fg: '#ffffff', icon: GLOBE_ICON },
  indicacao:     { label: 'Indicação',   bg: '#ec4899', fg: '#ffffff', icon: HEART_ICON },
  outro:         { label: 'Outro',       bg: '#64748b', fg: '#ffffff', icon: DOTS_ICON },
  loja_fisica:   { label: 'Loja Física', bg: '#0f766e', fg: '#ffffff', icon: STORE_ICON },
  webmotors:     { label: 'Webmotors',   bg: '#ff6900', fg: '#ffffff', icon: GLOBE_ICON },
  olx:           { label: 'OLX',         bg: '#6c2bd9', fg: '#ffffff', icon: GLOBE_ICON },
  mercado_livre: { label: 'Mercado Livre', bg: '#fff159', fg: '#2d3277', icon: GLOBE_ICON },
  chaves_na_mao: { label: 'Chaves na Mão', bg: '#1f2937', fg: '#ffffff', icon: GLOBE_ICON },
};

function normalize(raw: string): OriginKey {
  const k = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s-]+/g, '_');

  if (k.includes('whatsapp') || k === 'wpp' || k === 'zap') return 'whatsapp';
  if (k.includes('instagram') || k === 'ig' || k === 'insta') return 'instagram';
  if (k.includes('facebook') || k === 'fb' || k.includes('marketplace')) return 'facebook';
  if (k.includes('indicac')) return 'indicacao';
  if (k.includes('loja')) return 'loja_fisica';
  if (k.includes('webmotors')) return 'webmotors';
  if (k === 'olx') return 'olx';
  if (k.includes('mercado_livre') || k === 'ml') return 'mercado_livre';
  if (k.includes('chaves')) return 'chaves_na_mao';
  if (k === 'site' || k.includes('website') || k.includes('landing')) return 'site';
  return 'outro';
}

interface OriginBadgeProps {
  origin?: string | null;
  style?: CSSProperties;
}

export default function OriginBadge({ origin, style }: OriginBadgeProps) {
  if (!origin) return null;
  const v = VISUALS[normalize(origin)];

  return (
    <span
      title={v.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: v.bg,
        color: v.fg,
        borderRadius: 999,
        padding: '3px 9px 3px 7px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.02em',
        lineHeight: 1,
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', lineHeight: 0 }}>{v.icon}</span>
      {v.label}
    </span>
  );
}
