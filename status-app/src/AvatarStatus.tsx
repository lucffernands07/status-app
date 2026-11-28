import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import * as micah from '@dicebear/micah';

export type EstiloAvatar =
  | 'robo'
  | 'aventureiro'
  | 'heroi'
  | 'cyber'
  | 'mago'
  | 'fera';

export type TipoAcessorioAvatar =
  | 'none'
  | 'round'
  | 'square'
  | 'bone'
  | 'brincos'
  | 'panos-cabeca'
  | 'gravata-borboleta'
  | 'gravata-normal'
  | 'fone'
  | 'piercing'
  | 'piercing-duplo';

export interface ConfigVisualAvatar {
  corFundo?: string;
  variante?: string;
  seed?: string;
  hair?: string;
  hairColor?: string;
  baseColor?: string;
  mouth?: string;
  eyebrows?: string;
  glasses?: string;
  glassesColor?: string;
  acessorio?: string;
  corAcessorio?: string;
  acessorioX?: number;
  acessorioY?: number;
  facialHair?: string;
  facialHairColor?: string;
}

export interface OpcaoSelecaoMicah {
  id: string;
  rotulo: string;
  hex?: string;
  premium?: boolean;
}

export const OPCOES_CABELO_MICAH: OpcaoSelecaoMicah[] = [
  { id: 'none', rotulo: 'Sem cabelo', premium: true },
  { id: 'fonze', rotulo: 'Fonze', premium: false },
  { id: 'dougFunny', rotulo: 'Doug Funny', premium: true },
  { id: 'pixie', rotulo: 'Pixie', premium: false },
  { id: 'full', rotulo: 'Cheio', premium: true },
  { id: 'dannyPhantom', rotulo: 'Danny Phantom', premium: true },
  { id: 'mrClean', rotulo: 'Careca / Raspa', premium: true },
  { id: 'turban', rotulo: 'Turbante', premium: true },
];

export const OPCOES_COR_CABELO_MICAH: OpcaoSelecaoMicah[] = [
  { id: '000000', rotulo: 'Preto', hex: '#000000' },
  { id: '6b3e26', rotulo: 'Castanho', hex: '#6b3e26' },
  { id: 'f4d150', rotulo: 'Loiro', hex: '#f4d150' },
  { id: 'c2410c', rotulo: 'Ruivo', hex: '#c2410c' },
  { id: '77311d', rotulo: 'Café', hex: '#77311d' },
  { id: '9ca3af', rotulo: 'Grisalho', hex: '#9ca3af' },
];

export const OPCOES_COR_PELE_MICAH: OpcaoSelecaoMicah[] = [
  { id: 'f9c9b6', rotulo: 'Claro', hex: '#f9c9b6' },
  { id: 'ac6651', rotulo: 'Médio', hex: '#ac6651' },
  { id: '77311d', rotulo: 'Escuro', hex: '#77311d' },
  { id: 'f4d150', rotulo: 'Dourado', hex: '#f4d150' },
];

export const OPCOES_BOCA_MICAH: OpcaoSelecaoMicah[] = [
  { id: 'smile', rotulo: 'Sorriso' },
  { id: 'laughing', rotulo: 'Rindo' },
  { id: 'smirk', rotulo: 'Sorriso de canto' },
  { id: 'surprised', rotulo: 'Surpreso' },
  { id: 'sad', rotulo: 'Triste' },
  { id: 'nervous', rotulo: 'Nervoso' },
];

export const OPCOES_ACESSORIOS_AVATAR: OpcaoSelecaoMicah[] = [
  { id: 'none', rotulo: 'Sem acessório', premium: false },
  { id: 'round', rotulo: 'Óculos Redondo', premium: false },
  { id: 'square', rotulo: 'Óculos Quadrado', premium: false },
  { id: 'bone', rotulo: 'Boné', premium: false },
  { id: 'brincos', rotulo: 'Brincos', premium: true },
  { id: 'panos-cabeca', rotulo: 'Panos de cabeça', premium: true },
  { id: 'gravata-borboleta', rotulo: 'Gravata borboleta', premium: true },
  { id: 'gravata-normal', rotulo: 'Gravata normal', premium: true },
  { id: 'fone', rotulo: 'Fone', premium: true },
  { id: 'piercing', rotulo: 'Piercing', premium: true },
  { id: 'piercing-duplo', rotulo: 'Piercing duplo', premium: true },
];

export const OPCOES_OCULOS_MICAH = OPCOES_ACESSORIOS_AVATAR;

export const OPCOES_COR_OCULOS_MICAH: OpcaoSelecaoMicah[] = [
  { id: '111827', rotulo: 'Preto', hex: '#111827' },
  { id: 'eab308', rotulo: 'Dourado', hex: '#eab308' },
  { id: 'cbd5e1', rotulo: 'Prata', hex: '#cbd5e1' },
  { id: '2563eb', rotulo: 'Azul', hex: '#2563eb' },
  { id: 'dc2626', rotulo: 'Vermelho', hex: '#dc2626' },
];

export const OPCOES_BARBA_MICAH: OpcaoSelecaoMicah[] = [
  { id: 'none', rotulo: 'Sem barba' },
  { id: 'beard', rotulo: 'Barba' },
  { id: 'scruff', rotulo: 'Por fazer' },
];

export const OPCOES_COR_BARBA_MICAH: OpcaoSelecaoMicah[] = [
  { id: '000000', rotulo: 'Preto', hex: '#000000' },
  { id: '6b3e26', rotulo: 'Castanho', hex: '#6b3e26' },
  { id: 'f4d150', rotulo: 'Loiro', hex: '#f4d150' },
  { id: 'c2410c', rotulo: 'Ruivo', hex: '#c2410c' },
  { id: '77311d', rotulo: 'Café', hex: '#77311d' },
  { id: '9ca3af', rotulo: 'Grisalho', hex: '#9ca3af' },
];

export const OPCOES_COR_FUNDO_MICAH: OpcaoSelecaoMicah[] = [
  { id: '#6366f1', rotulo: 'Índigo', hex: '#6366f1' },
  { id: '#0284c7', rotulo: 'Azul céu', hex: '#0284c7' },
  { id: '#0d9488', rotulo: 'Verde água', hex: '#0d9488' },
  { id: '#be123c', rotulo: 'Carmesim', hex: '#be123c' },
  { id: '#7e22ce', rotulo: 'Roxo', hex: '#7e22ce' },
  { id: '#ea580c', rotulo: 'Laranja', hex: '#ea580c' },
  { id: '#1e293b', rotulo: 'Ardósia', hex: '#1e293b' },
];

export const VISUAL_PADRAO_MICAH: Required<
  Pick<
    ConfigVisualAvatar,
    | 'corFundo'
    | 'seed'
    | 'hair'
    | 'hairColor'
    | 'baseColor'
    | 'mouth'
    | 'glasses'
    | 'glassesColor'
    | 'facialHair'
    | 'facialHairColor'
  >
> = {
  corFundo: '#6366f1',
  seed: 'lucky-07',
  hair: 'fonze',
  hairColor: '6b3e26',
  baseColor: 'f9c9b6',
  mouth: 'smile',
  glasses: 'none',
  glassesColor: '111827',
  facialHair: 'none',
  facialHairColor: '6b3e26',
};

interface AvatarStatusProps {
  nome: string;
  corPrincipal?: string;
  estilo?: EstiloAvatar;
  visual?: ConfigVisualAvatar;
}

const COR_FUNDO_ESTILO: Record<EstiloAvatar, string> = {
  robo: '#6366f1',
  aventureiro: '#0284c7',
  heroi: '#0d9488',
  cyber: '#be123c',
  mago: '#7e22ce',
  fera: '#ea580c',
};

function limparHex(cor?: string, fallback = '#6366f1'): string {
  const base = (cor || fallback).trim();
  return base.startsWith('#') ? base.slice(1) : base;
}

function normalizarCssHex(cor?: string, fallback = '#111827'): string {
  const limpa = limparHex(cor, fallback);
  return `#${limpa}`;
}

function normalizarIdAcessorio(id?: string): string {
  const bruto = (id || 'none').trim();
  if (bruto === 'squares') return 'square';
  if (bruto === 'lenco') return 'gravata-borboleta';
  return bruto;
}

function CamadaAcessorioExtra({
  acessorio,
  corHex,
  offsetX = 0,
  offsetY = 0,
}: {
  acessorio: string;
  corHex: string;
  offsetX?: number;
  offsetY?: number;
}) {
  const transform = `translate(${offsetX}, ${offsetY})`;

  if (acessorio === 'bone') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <path
            d="M23 33 C22 1, 78 1, 77 33 Z"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M22 33 Q52 27 83 34 Q66 39 22 33 Z"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  if (acessorio === 'brincos') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <circle
            cx="27"
            cy="62"
            r="5.5"
            fill="none"
            stroke="#0f172a"
            strokeWidth="4.2"
          />
          <circle
            cx="27"
            cy="62"
            r="5.5"
            fill="none"
            stroke={corHex}
            strokeWidth="2.4"
          />
          <circle
            cx="73"
            cy="62"
            r="5.5"
            fill="none"
            stroke="#0f172a"
            strokeWidth="4.2"
          />
          <circle
            cx="73"
            cy="62"
            r="5.5"
            fill="none"
            stroke={corHex}
            strokeWidth="2.4"
          />
        </g>
      </svg>
    );
  }

  if (acessorio === 'panos-cabeca') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <path
            d="M23 36 C25 14, 75 14, 77 36 C64 31, 36 31, 23 36 Z"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M68 25 L82 17 L77 31 Z"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  if (acessorio === 'gravata-borboleta') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <polygon
            points="49,83 31,76.5 31,89.5"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <polygon
            points="51,83 69,76.5 69,89.5"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <rect
            x="45.3"
            y="78.5"
            width="9.4"
            height="9"
            rx="2.6"
            ry="2.6"
            fill={corHex}
            stroke="none"
          />
          <rect
            x="45.3"
            y="78.5"
            width="9.4"
            height="9"
            rx="2.6"
            ry="2.6"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2"
          />
        </g>
      </svg>
    );
  }

  if (acessorio === 'gravata-normal') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <rect
            x="46"
            y="76.5"
            width="8"
            height="6"
            rx="1.6"
            ry="1.6"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.1"
          />
          <polygon
            points="47,82.5 53,82.5 55,95.5 50,98.5 45,95.5"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  if (acessorio === 'fone') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <path
            d="M25 46 C25 15, 75 15, 75 46"
            fill="none"
            stroke="#0f172a"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <path
            d="M25 46 C25 15, 75 15, 75 46"
            fill="none"
            stroke={corHex}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <rect
            x="19"
            y="41"
            width="11"
            height="18"
            rx="4.5"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <rect
            x="70"
            y="41"
            width="11"
            height="18"
            rx="4.5"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="2.5"
          />
        </g>
      </svg>
    );
  }

  if (acessorio === 'piercing') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <circle
            cx="56.5"
            cy="55"
            r="1.9"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="1.4"
          />
        </g>
      </svg>
    );
  }

  if (acessorio === 'piercing-duplo') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g transform={transform}>
          <circle
            cx="54.5"
            cy="53.5"
            r="1.8"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="1.35"
          />
          <circle
            cx="59.5"
            cy="59.5"
            r="1.8"
            fill={corHex}
            stroke="#0f172a"
            strokeWidth="1.35"
          />
        </g>
      </svg>
    );
  }

  return null;
}

export function AvatarStatus({
  nome,
  corPrincipal,
  estilo = 'robo',
  visual,
}: AvatarStatusProps) {
  const corFundoFinal =
    visual?.corFundo || corPrincipal || COR_FUNDO_ESTILO[estilo] || '#a855f7';

  const acessorioAtivo = useMemo(() => {
    return normalizarIdAcessorio(
      visual?.acessorio ?? visual?.glasses ?? VISUAL_PADRAO_MICAH.glasses
    );
  }, [visual?.acessorio, visual?.glasses]);

  const corAcessorioHex = useMemo(() => {
    return normalizarCssHex(
      visual?.corAcessorio ??
        visual?.glassesColor ??
        VISUAL_PADRAO_MICAH.glassesColor,
      VISUAL_PADRAO_MICAH.glassesColor
    );
  }, [visual?.corAcessorio, visual?.glassesColor]);

  const avatarDataUrl = useMemo(() => {
    try {
      const seed = visual?.seed || VISUAL_PADRAO_MICAH.seed;
      const hair = visual?.hair ?? VISUAL_PADRAO_MICAH.hair;
      const hairColor = limparHex(
        visual?.hairColor ?? VISUAL_PADRAO_MICAH.hairColor,
        VISUAL_PADRAO_MICAH.hairColor
      );
      const baseColor = limparHex(
        visual?.baseColor ?? VISUAL_PADRAO_MICAH.baseColor,
        VISUAL_PADRAO_MICAH.baseColor
      );
      const mouth = visual?.mouth ?? VISUAL_PADRAO_MICAH.mouth;

      const glassesParaMicah =
        acessorioAtivo === 'round' || acessorioAtivo === 'square'
          ? acessorioAtivo
          : 'none';

      const glassesColor = limparHex(
        visual?.corAcessorio ??
          visual?.glassesColor ??
          VISUAL_PADRAO_MICAH.glassesColor,
        VISUAL_PADRAO_MICAH.glassesColor
      );
      const facialHair = visual?.facialHair ?? VISUAL_PADRAO_MICAH.facialHair;
      const facialHairColor = limparHex(
        visual?.facialHairColor ?? VISUAL_PADRAO_MICAH.facialHairColor,
        VISUAL_PADRAO_MICAH.facialHairColor
      );

      const opcoes: Record<string, unknown> = {
        seed,
        size: 64,
        baseColor: [baseColor],
        hairColor: [hairColor],
        mouth: [mouth],
      };

      if (hair === 'none') {
        opcoes.hairProbability = 0;
      } else {
        opcoes.hairProbability = 100;
        opcoes.hair = [hair];
      }

      if (glassesParaMicah === 'none') {
        opcoes.glassesProbability = 0;
      } else {
        opcoes.glassesProbability = 100;
        opcoes.glasses = [glassesParaMicah];
        opcoes.glassesColor = [glassesColor];
      }

      if (facialHair === 'none') {
        opcoes.facialHairProbability = 0;
      } else {
        opcoes.facialHairProbability = 100;
        opcoes.facialHair = [facialHair];
        opcoes.facialHairColor = [facialHairColor];
      }

      if (visual?.eyebrows) {
        opcoes.eyebrows = [visual.eyebrows];
      }

      const svg = createAvatar(
        micah as unknown as Parameters<typeof createAvatar>[0],
        opcoes as Parameters<typeof createAvatar>[1]
      ).toString();

      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } catch {
      return '';
    }
  }, [
    acessorioAtivo,
    visual?.baseColor,
    visual?.corAcessorio,
    visual?.eyebrows,
    visual?.facialHair,
    visual?.facialHairColor,
    visual?.glassesColor,
    visual?.hair,
    visual?.hairColor,
    visual?.mouth,
    visual?.seed,
  ]);

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 shadow-lg"
        style={{ backgroundColor: corFundoFinal }}
      >
        {avatarDataUrl ? (
          <img
            src={avatarDataUrl}
            alt={nome}
            className="h-14 w-14 object-contain"
          />
        ) : (
          <span className="text-sm font-bold text-white">
            {(nome || 'S').slice(0, 1).toUpperCase()}
          </span>
        )}
        <CamadaAcessorioExtra
          acessorio={acessorioAtivo}
          corHex={corAcessorioHex}
          offsetX={visual?.acessorioX ?? 0}
          offsetY={visual?.acessorioY ?? 0}
        />
      </div>
      <span className="mt-1 rounded-full border border-white/20 bg-slate-950/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
        {nome}
      </span>
    </div>
  );
}