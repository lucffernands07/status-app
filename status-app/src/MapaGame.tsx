import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
  type TouchEvent,
} from 'react';
import { AvatarStatus } from './AvatarStatus';
import {
  Quarto3D,
  type DadosQuarto3D,
  type DecoracaoEstante3D,
  type PosicaoItem3D,
  type TipoItemQuarto3D,
} from './Quarto3D';

interface MapaGameProps {
  aoVoltarGps: () => void;
  nomeUsuario?: string;
}

interface CorParede {
  id: string;
  nome: string;
  hex: string;
  borda: string;
}

interface EstadoQuarto {
  corParedeId: string;
  itens: Record<TipoItemQuarto3D, boolean>;
  posicoesItens: Record<TipoItemQuarto3D, PosicaoItem3D>;
  estante: DecoracaoEstante3D;
  fotoPoster: string;
  gifTv: string;
}

export interface DadosQuarto3DComCamera extends DadosQuarto3D {
  rotacaoY?: number;
  rotacaoX?: number;
  zoom?: number;
}

const CORES_PAREDE: CorParede[] = [
  { id: 'indigo', nome: 'Noite Roxa', hex: '#1e1b4b', borda: '#4338ca' },
  { id: 'areia', nome: 'Areia Quente', hex: '#e7d8c1', borda: '#b89f7d' },
  { id: 'branco', nome: 'Branco Gelo', hex: '#f1f5f9', borda: '#cbd5e1' },
  { id: 'menta', nome: 'Verde Menta', hex: '#134e4a', borda: '#2dd4bf' },
  { id: 'ceu', nome: 'Azul Céu', hex: '#0c4a6e', borda: '#38bdf8' },
  { id: 'rosa', nome: 'Rosa Suave', hex: '#831843', borda: '#f472b6' },
];

const POSICOES_INICIAIS: Record<TipoItemQuarto3D, PosicaoItem3D> = {
  cama: { x: 0, z: 1.25 },
  estante: { x: 0, z: 2.65 },
  tv: { x: 2.9, z: -0.6 },
  rack: { x: 2.65, z: -0.6 },
  poster: { x: -2.9, z: -0.6 },
};

const ESTADO_VAZIO: EstadoQuarto = {
  corParedeId: 'indigo',
  itens: {
    tv: false,
    cama: false,
    poster: false,
    estante: false,
    rack: false,
  },
  posicoesItens: {
    cama: { ...POSICOES_INICIAIS.cama },
    estante: { ...POSICOES_INICIAIS.estante },
    tv: { ...POSICOES_INICIAIS.tv },
    rack: { ...POSICOES_INICIAIS.rack },
    poster: { ...POSICOES_INICIAIS.poster },
  },
  estante: {
    livros: false,
    objetos: false,
  },
  fotoPoster: '',
  gifTv: '',
};

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.6;
const ZOOM_PADRAO = 1;
const PASSO_MOVER = 0.25;
const LIMITE_COORD = 2.9;

function normalizarGraus360(angulo: number): number {
  const mod = angulo % 360;
  return mod < 0 ? mod + 360 : mod;
}

function limitarZoom(valor: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number(valor.toFixed(2))));
}

function limitarCoord(valor: number): number {
  return Math.max(
    -LIMITE_COORD,
    Math.min(LIMITE_COORD, Number(valor.toFixed(2)))
  );
}

function distanciaToques(touches: React.TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function normalizarPosicoes(
  bruto: unknown
): Record<TipoItemQuarto3D, PosicaoItem3D> {
  const obj =
    bruto && typeof bruto === 'object'
      ? (bruto as Record<string, Record<string, unknown>>)
      : {};

  const lerItem = (chave: TipoItemQuarto3D): PosicaoItem3D => ({
    x:
      typeof obj[chave]?.x === 'number'
        ? limitarCoord(obj[chave].x as number)
        : POSICOES_INICIAIS[chave].x,
    z:
      typeof obj[chave]?.z === 'number'
        ? limitarCoord(obj[chave].z as number)
        : POSICOES_INICIAIS[chave].z,
  });

  return {
    cama: lerItem('cama'),
    estante: lerItem('estante'),
    tv: lerItem('tv'),
    rack: lerItem('rack'),
    poster: lerItem('poster'),
  };
}

function carregarQuarto(chaveUsuario: string): EstadoQuarto {
  try {
    const bruto = localStorage.getItem(`status_app_quarto_${chaveUsuario}`);
    if (!bruto) return ESTADO_VAZIO;
    const parsed = JSON.parse(bruto);
    return {
      corParedeId:
        typeof parsed?.corParedeId === 'string' ? parsed.corParedeId : 'indigo',
      itens: {
        tv: Boolean(parsed?.itens?.tv),
        cama: Boolean(parsed?.itens?.cama),
        poster: Boolean(parsed?.itens?.poster),
        estante: Boolean(parsed?.itens?.estante),
        rack: Boolean(parsed?.itens?.rack),
      },
      posicoesItens: normalizarPosicoes(parsed?.posicoesItens),
      estante: {
        livros: Boolean(parsed?.estante?.livros),
        objetos: Boolean(parsed?.estante?.objetos),
      },
      fotoPoster: typeof parsed?.fotoPoster === 'string' ? parsed.fotoPoster : '',
      gifTv: typeof parsed?.gifTv === 'string' ? parsed.gifTv : '',
    };
  } catch {
    return ESTADO_VAZIO;
  }
}

const ROTULO_ITEM: Record<TipoItemQuarto3D, string> = {
  cama: 'Cama',
  estante: 'Estante',
  tv: 'TV',
  rack: 'Rack + PS5',
  poster: 'Pôster',
};

export function MapaGame({ aoVoltarGps, nomeUsuario = 'Status' }: MapaGameProps) {
  const chaveUsuario = (nomeUsuario || 'Status').trim() || 'Status';
  const [quarto, setQuarto] = useState<EstadoQuarto>(() =>
    carregarQuarto(chaveUsuario)
  );
  const [painelAberto, setPainelAberto] = useState(false);
  const [itemSelecionadoMover, setItemSelecionadoMover] =
    useState<TipoItemQuarto3D>('cama');
  const [urlPoster, setUrlPoster] = useState('');
  const [urlGifTv, setUrlGifTv] = useState('');
  const [rotacaoY, setRotacaoY] = useState(0);
  const [rotacaoX, setRotacaoX] = useState(12);
  const [zoom, setZoom] = useState(ZOOM_PADRAO);
  const [arrastando, setArrastando] = useState(false);

  const pontoInicialRef = useRef<{
    x: number;
    y: number;
    rotY: number;
    rotX: number;
  } | null>(null);

  const pincaInicialRef = useRef<{
    distancia: number;
    zoomInicial: number;
  } | null>(null);

  useEffect(() => {
    setQuarto(carregarQuarto(chaveUsuario));
  }, [chaveUsuario]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `status_app_quarto_${chaveUsuario}`,
        JSON.stringify(quarto)
      );
    } catch {
      // ignora erro de quota do localStorage em imagens grandes
    }
  }, [chaveUsuario, quarto]);

  const paredeAtual =
    CORES_PAREDE.find((c) => c.id === quarto.corParedeId) ?? CORES_PAREDE[0];

  const dados3D: DadosQuarto3DComCamera = {
    corParedeHex: paredeAtual.hex,
    corParedeBorda: paredeAtual.borda,
    itens: quarto.itens,
    posicoesItens: quarto.posicoesItens,
    estante: quarto.estante,
    fotoPoster: quarto.fotoPoster,
    gifTv: quarto.gifTv,
    rotacaoY,
    rotacaoX,
    zoom,
  };

  const handlePointerDown = (evento: PointerEvent<HTMLDivElement>) => {
    if (pincaInicialRef.current) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastando(true);
    pontoInicialRef.current = {
      x: evento.clientX,
      y: evento.clientY,
      rotY: rotacaoY,
      rotX: rotacaoX,
    };
  };

  const handlePointerMove = (evento: PointerEvent<HTMLDivElement>) => {
    if (pincaInicialRef.current || !arrastando || !pontoInicialRef.current)
      return;
    const dx = evento.clientX - pontoInicialRef.current.x;
    const dy = evento.clientY - pontoInicialRef.current.y;

    const proximoY = normalizarGraus360(pontoInicialRef.current.rotY + dx * 0.85);
    const proximoX = Math.max(
      -25,
      Math.min(35, pontoInicialRef.current.rotX - dy * 0.25)
    );

    setRotacaoY(proximoY);
    setRotacaoX(proximoX);
  };

  const handlePointerUp = (evento: PointerEvent<HTMLDivElement>) => {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    setArrastando(false);
    pontoInicialRef.current = null;
  };

  const handleTouchStart = (evento: TouchEvent<HTMLDivElement>) => {
    if (evento.touches.length === 2) {
      setArrastando(false);
      pontoInicialRef.current = null;
      pincaInicialRef.current = {
        distancia: distanciaToques(evento.touches),
        zoomInicial: zoom,
      };
    }
  };

  const handleTouchMove = (evento: TouchEvent<HTMLDivElement>) => {
    if (evento.touches.length === 2 && pincaInicialRef.current) {
      const atual = distanciaToques(evento.touches);
      if (pincaInicialRef.current.distancia > 0) {
        const fator = atual / pincaInicialRef.current.distancia;
        setZoom(limitarZoom(pincaInicialRef.current.zoomInicial * fator));
      }
    }
  };

  const handleTouchEnd = (evento: TouchEvent<HTMLDivElement>) => {
    if (evento.touches.length < 2) {
      pincaInicialRef.current = null;
    }
  };

  const alterarZoom = (delta: number) => {
    setZoom((atual) => limitarZoom(atual + delta));
  };

  const girar90Graus = () => {
    setRotacaoY((atual) => normalizarGraus360(atual + 90));
  };

  const resetarCamera = () => {
    setRotacaoY(0);
    setRotacaoX(12);
    setZoom(ZOOM_PADRAO);
  };

  const alternarItem = (tipo: TipoItemQuarto3D) => {
    setQuarto((atual) => ({
      ...atual,
      itens: {
        ...atual.itens,
        [tipo]: !atual.itens[tipo],
      },
    }));
  };

  const alternarDecoracaoEstante = (chave: keyof DecoracaoEstante3D) => {
    setQuarto((atual) => ({
      ...atual,
      itens: {
        ...atual.itens,
        estante: true,
      },
      estante: {
        ...atual.estante,
        [chave]: !atual.estante[chave],
      },
    }));
  };

  const moverItem = (dx: number, dz: number) => {
    setQuarto((atual) => {
      const posAtual = atual.posicoesItens[itemSelecionadoMover] ?? {
        x: 0,
        z: 0,
      };
      return {
        ...atual,
        posicoesItens: {
          ...atual.posicoesItens,
          [itemSelecionadoMover]: {
            x: limitarCoord(posAtual.x + dx),
            z: limitarCoord(posAtual.z + dz),
          },
        },
      };
    });
  };

  const resetarPosicaoItem = () => {
    setQuarto((atual) => ({
      ...atual,
      posicoesItens: {
        ...atual.posicoesItens,
        [itemSelecionadoMover]: { ...POSICOES_INICIAIS[itemSelecionadoMover] },
      },
    }));
  };

  const selecionarCorParede = (corParedeId: string) => {
    setQuarto((atual) => ({
      ...atual,
      corParedeId,
    }));
  };

  const handleUploadFotoPoster = (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === 'string') {
        setQuarto((atual) => ({
          ...atual,
          fotoPoster: leitor.result as string,
          itens: {
            ...atual.itens,
            poster: true,
          },
        }));
      }
    };
    leitor.readAsDataURL(arquivo);
  };

  const aplicarUrlPoster = () => {
    const limpa = urlPoster.trim();
    if (!limpa) return;
    setQuarto((atual) => ({
      ...atual,
      fotoPoster: limpa,
      itens: {
        ...atual.itens,
        poster: true,
      },
    }));
  };

  const handleUploadGifTv = (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === 'string') {
        setQuarto((atual) => ({
          ...atual,
          gifTv: leitor.result as string,
          itens: {
            ...atual.itens,
            tv: true,
          },
        }));
      }
    };
    leitor.readAsDataURL(arquivo);
  };

  const aplicarUrlGifTv = () => {
    const limpa = urlGifTv.trim();
    if (!limpa) return;
    setQuarto((atual) => ({
      ...atual,
      gifTv: limpa,
      itens: {
        ...atual.itens,
        tv: true,
      },
    }));
  };

  const limparGifTv = () => {
    setUrlGifTv('');
    setQuarto((atual) => ({
      ...atual,
      gifTv: '',
    }));
  };

  const limparQuarto = () => {
    setQuarto(ESTADO_VAZIO);
    setUrlPoster('');
    setUrlGifTv('');
  };

  const posAtualSelecionado =
    quarto.posicoesItens[itemSelecionadoMover] ?? { x: 0, z: 0 };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white select-none">
      {/* Área interativa de rotação 360° e zoom do quarto */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`absolute inset-0 z-10 touch-none ${
          arrastando ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <Quarto3D dados={dados3D as DadosQuarto3D} />
      </div>

      {/* Topo organizado para telas estreitas de 360px */}
      <div className="pointer-events-none fixed top-3 inset-x-3 z-20 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="pointer-events-auto truncate rounded-full bg-slate-950/65 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-100 border border-white/15 backdrop-blur-[2px]">
            Segundo Mundo · {chaveUsuario}
          </span>

          <button
            type="button"
            onClick={() => setPainelAberto((aberto) => !aberto)}
            className="pointer-events-auto shrink-0 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-semibold text-white border border-white/20 shadow-lg hover:bg-slate-900 backdrop-blur-[2px]"
          >
            {painelAberto ? 'Esconder Quarto' : 'Decorar Quarto'}
          </button>
        </div>

        <div className="flex items-center justify-center">
          <AvatarStatus nome={chaveUsuario} corPrincipal="#a855f7" />
        </div>
      </div>

      {/* Gaveta de decoração compacta e semitransparente */}
      {painelAberto && (
        <div className="fixed top-28 right-2.5 z-30 max-h-[58vh] overflow-y-auto w-60 rounded-2xl border border-white/15 bg-slate-950/55 p-2.5 text-[11px] text-white shadow-xl backdrop-blur-[2px] space-y-2">
          <div>
            <div className="text-[10px] font-semibold text-slate-200 mb-1">
              Cor lisa das paredes
            </div>
            <div className="grid grid-cols-3 gap-1">
              {CORES_PAREDE.map((cor) => {
                const ativa = paredeAtual.id === cor.id;
                return (
                  <button
                    key={cor.id}
                    type="button"
                    onClick={() => selecionarCorParede(cor.id)}
                    className={`flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[10px] font-medium transition ${
                      ativa
                        ? 'border-amber-300 bg-slate-800/80 text-white'
                        : 'border-slate-700/60 bg-slate-900/55 text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/40"
                      style={{ backgroundColor: cor.hex }}
                    />
                    <span className="truncate">{cor.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-200 mb-1">
              Móveis e itens do quarto
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => alternarItem('tv')}
                className={`rounded-lg border py-1 text-[10px] font-semibold transition ${
                  quarto.itens.tv
                    ? 'border-sky-400 bg-sky-600/40 text-sky-100'
                    : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                }`}
              >
                📺 TV
              </button>
              <button
                type="button"
                onClick={() => alternarItem('rack')}
                className={`rounded-lg border py-1 text-[10px] font-semibold transition ${
                  quarto.itens.rack
                    ? 'border-indigo-400 bg-indigo-600/40 text-indigo-100'
                    : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                }`}
              >
                🎮 Rack PS5
              </button>
              <button
                type="button"
                onClick={() => alternarItem('cama')}
                className={`rounded-lg border py-1 text-[10px] font-semibold transition ${
                  quarto.itens.cama
                    ? 'border-purple-400 bg-purple-600/40 text-purple-100'
                    : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                }`}
              >
                🛏️ Cama
              </button>
              <button
                type="button"
                onClick={() => alternarItem('estante')}
                className={`rounded-lg border py-1 text-[10px] font-semibold transition ${
                  quarto.itens.estante
                    ? 'border-amber-500 bg-amber-700/40 text-amber-100'
                    : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                }`}
              >
                🗄️ Estante
              </button>
              <button
                type="button"
                onClick={() => alternarItem('poster')}
                className={`rounded-lg border py-1 text-[10px] font-semibold transition ${
                  quarto.itens.poster
                    ? 'border-amber-400 bg-amber-600/40 text-amber-100'
                    : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                }`}
              >
                🖼️ Pôster
              </button>
            </div>
          </div>

          {/* Conteúdo dentro da estante */}
          <div className="space-y-1 border-t border-white/10 pt-1.5">
            <div className="text-[10px] font-semibold text-slate-200">
              Na estante (atrás da cama)
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => alternarDecoracaoEstante('livros')}
                className={`rounded-lg border py-1 text-[10px] font-semibold transition ${
                  quarto.estante.livros
                    ? 'border-emerald-400 bg-emerald-600/40 text-emerald-100'
                    : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                }`}
              >
                📚 Livros
              </button>
              <button
                type="button"
                onClick={() => alternarDecoracaoEstante('objetos')}
                className={`rounded-lg border py-1 text-[10px] font-semibold transition ${
                  quarto.estante.objetos
                    ? 'border-cyan-400 bg-cyan-600/40 text-cyan-100'
                    : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                }`}
              >
                🏺 Objetos
              </button>
            </div>
          </div>

          {/* Mover qualquer item de lugar */}
          <div className="space-y-1 border-t border-white/10 pt-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-200">
                Mover item de lugar
              </span>
              <span className="text-[9px] text-slate-300">
                X:{posAtualSelecionado.x.toFixed(2)} Z:
                {posAtualSelecionado.z.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {(Object.keys(ROTULO_ITEM) as TipoItemQuarto3D[]).map((chave) => (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setItemSelecionadoMover(chave)}
                  className={`rounded-lg border py-1 text-[9px] font-semibold transition ${
                    itemSelecionadoMover === chave
                      ? 'border-purple-400 bg-purple-600/40 text-white'
                      : 'border-slate-700/60 bg-slate-900/55 text-slate-300 hover:text-white'
                  }`}
                >
                  {ROTULO_ITEM[chave]}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => moverItem(-PASSO_MOVER, 0)}
                className="flex-1 rounded-lg border border-slate-600/60 bg-slate-900/70 py-1 text-xs font-bold hover:bg-slate-800/80"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => moverItem(0, -PASSO_MOVER)}
                className="flex-1 rounded-lg border border-slate-600/60 bg-slate-900/70 py-1 text-xs font-bold hover:bg-slate-800/80"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moverItem(0, PASSO_MOVER)}
                className="flex-1 rounded-lg border border-slate-600/60 bg-slate-900/70 py-1 text-xs font-bold hover:bg-slate-800/80"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => moverItem(PASSO_MOVER, 0)}
                className="flex-1 rounded-lg border border-slate-600/60 bg-slate-900/70 py-1 text-xs font-bold hover:bg-slate-800/80"
              >
                →
              </button>
              <button
                type="button"
                onClick={resetarPosicaoItem}
                className="rounded-lg border border-slate-600/60 bg-slate-900/70 px-1.5 py-1 text-[9px] text-slate-200 hover:bg-slate-800/80"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-1 border-t border-white/10 pt-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-200">
                GIF na tela da TV
              </span>
              {quarto.gifTv && (
                <button
                  type="button"
                  onClick={limparGifTv}
                  className="text-[9px] text-rose-300 hover:text-rose-200"
                >
                  Remover GIF
                </button>
              )}
            </div>
            <label className="block cursor-pointer rounded-lg border border-dashed border-slate-600/70 bg-slate-900/55 px-2 py-1 text-center text-[10px] text-sky-200 hover:border-sky-400">
              Escolher arquivo .gif
              <input
                type="file"
                accept="image/gif,.gif"
                onChange={handleUploadGifTv}
                className="hidden"
              />
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={urlGifTv}
                onChange={(e) => setUrlGifTv(e.target.value)}
                placeholder="Link do GIF..."
                className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-2 py-1 text-[10px] text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={aplicarUrlGifTv}
                className="rounded-lg bg-sky-600/85 px-2 py-1 text-[10px] font-semibold text-white hover:bg-sky-500"
              >
                Pôr
              </button>
            </div>
          </div>

          <div className="space-y-1 border-t border-white/10 pt-1.5">
            <div className="text-[10px] font-semibold text-slate-200">
              Foto do pôster
            </div>
            <label className="block cursor-pointer rounded-lg border border-dashed border-slate-600/70 bg-slate-900/55 px-2 py-1 text-center text-[10px] text-amber-200 hover:border-amber-400">
              Escolher foto
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFotoPoster}
                className="hidden"
              />
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={urlPoster}
                onChange={(e) => setUrlPoster(e.target.value)}
                placeholder="Link da imagem..."
                className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-2 py-1 text-[10px] text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={aplicarUrlPoster}
                className="rounded-lg bg-purple-600/85 px-2 py-1 text-[10px] font-semibold text-white hover:bg-purple-500"
              >
                Pôr
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-0.5">
            <button
              type="button"
              onClick={limparQuarto}
              className="rounded-lg border border-slate-700/70 bg-slate-900/65 px-2 py-1 text-[10px] text-slate-200 hover:bg-slate-800/80 hover:text-white"
            >
              Esvaziar quarto
            </button>
          </div>
        </div>
      )}

      {/* Barra inferior compacta com 360°, zoom (- / +) e voltar */}
      <div className="fixed bottom-4 inset-x-3 z-20 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={girar90Graus}
            className="rounded-full bg-slate-900/80 px-2.5 py-2 text-[11px] font-semibold text-purple-200 border border-slate-700 shadow-lg hover:bg-slate-800 backdrop-blur-[2px]"
          >
            360° ({Math.round(rotacaoY)}°)
          </button>

          <button
            type="button"
            onClick={() => alterarZoom(-0.15)}
            aria-label="Afastar zoom"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-sm font-bold text-sky-200 border border-slate-700 shadow-lg hover:bg-slate-800 backdrop-blur-[2px]"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => alterarZoom(0.15)}
            aria-label="Aproximar zoom"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-sm font-bold text-sky-200 border border-slate-700 shadow-lg hover:bg-slate-800 backdrop-blur-[2px]"
          >
            +
          </button>

          <button
            type="button"
            onClick={resetarCamera}
            className="rounded-full bg-slate-900/75 px-2 py-2 text-[10px] font-semibold text-slate-300 border border-slate-700 shadow-lg hover:bg-slate-800 hover:text-white backdrop-blur-[2px]"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>

        <button
          type="button"
          onClick={aoVoltarGps}
          className="rounded-full bg-white/90 px-3.5 py-2 text-[11px] font-semibold text-slate-900 shadow-lg hover:bg-white shrink-0"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}