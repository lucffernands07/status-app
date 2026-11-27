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
  facialHair?: string;
  facialHairColor?: string;
}

export interface OpcaoSelecaoMicah {
  id: string;
  rotulo: string;
  hex?: string;
}

export const OPCOES_CABELO_MICAH: OpcaoSelecaoMicah[] = [
  { id: 'none', rotulo: 'Sem cabelo' },
  { id: 'fonze', rotulo: 'Fonze' },
  { id: 'dougFunny', rotulo: 'Doug Funny' },
  { id: 'pixie', rotulo: 'Pixie' },
  { id: 'full', rotulo: 'Cheio' },
  { id: 'dannyPhantom', rotulo: 'Danny Phantom' },
  { id: 'mrClean', rotulo: 'Careca / Raspa' },
  { id: 'turban', rotulo: 'Turbante' },
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

export const OPCOES_OCULOS_MICAH: OpcaoSelecaoMicah[] = [
  { id: 'none', rotulo: 'Sem óculos' },
  { id: 'round', rotulo: 'Redondo' },
  { id: 'square', rotulo: 'Quadrado' },
];

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

export function AvatarStatus({
  nome,
  corPrincipal,
  estilo = 'robo',
  visual,
}: AvatarStatusProps) {
  const corFundoFinal =
    visual?.corFundo || corPrincipal || COR_FUNDO_ESTILO[estilo] || '#a855f7';

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
      const glassesRaw = visual?.glasses ?? VISUAL_PADRAO_MICAH.glasses;
      const glasses = glassesRaw === 'squares' ? 'square' : glassesRaw;
      const glassesColor = limparHex(
        visual?.glassesColor ?? VISUAL_PADRAO_MICAH.glassesColor,
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

      if (glasses === 'none') {
        opcoes.glassesProbability = 0;
      } else {
        opcoes.glassesProbability = 100;
        opcoes.glasses = [glasses];
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
    visual?.baseColor,
    visual?.eyebrows,
    visual?.facialHair,
    visual?.facialHairColor,
    visual?.glasses,
    visual?.glassesColor,
    visual?.hair,
    visual?.hairColor,
    visual?.mouth,
    visual?.seed,
  ]);

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 shadow-lg"
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
      </div>
      <span className="mt-1 rounded-full border border-white/20 bg-slate-950/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
        {nome}
      </span>
    </div>
  );
}