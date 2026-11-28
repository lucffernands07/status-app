import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react';
import {
  AvatarStatus,
  OPCOES_ACESSORIOS_AVATAR,
  OPCOES_BARBA_MICAH,
  OPCOES_BOCA_MICAH,
  OPCOES_CABELO_MICAH,
  OPCOES_COR_BARBA_MICAH,
  OPCOES_COR_CABELO_MICAH,
  OPCOES_COR_FUNDO_MICAH,
  OPCOES_COR_OCULOS_MICAH,
  OPCOES_COR_PELE_MICAH,
  VISUAL_PADRAO_MICAH,
  type ConfigVisualAvatar,
  type EstiloAvatar,
  type OpcaoSelecaoMicah,
} from './AvatarStatus';

export interface VisualAvatarComBanner extends ConfigVisualAvatar {
  bannerParede?: string;
  imagemBanner?: string;
  acessorio?: string;
  corAcessorio?: string;
  acessorioX?: number;
  acessorioY?: number;
}

export interface ConfigJogoUsuario {
  somAtivo: boolean;
  vibracaoAtiva: boolean;
  temaAvatar: EstiloAvatar;
  visualAvatar?: VisualAvatarComBanner;
  isPremium?: boolean;
}

interface MenuPerfilProps {
  aberto: boolean;
  apelidoAtual: string;
  configJogo: ConfigJogoUsuario;
  onSalvarPerfil: (novoApelido: string, novaConfig: ConfigJogoUsuario) => void;
  onFechar: () => void;
}

interface SeletorSetasProps {
  titulo: string;
  opcoes: OpcaoSelecaoMicah[];
  valorAtual: string;
  onChange: (novoId: string) => void;
  isOpcaoPremium?: (opcao: OpcaoSelecaoMicah) => boolean;
}

const PAPEIS_PAREDE_BANNER: (OpcaoSelecaoMicah & {
  nome?: string;
  estiloFundo: string;
})[] = [
  {
    id: 'padrao',
    nome: 'Padrão Escuro',
    rotulo: 'Padrão Escuro',
    hex: '#0f172a',
    estiloFundo:
      'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(9,13,22,0.96) 100%)',
  },
  {
    id: 'aurora',
    nome: 'Aurora Boreal',
    rotulo: 'Aurora Boreal',
    hex: '#0e7490',
    estiloFundo:
      'radial-gradient(circle at 20% 25%, rgba(45,212,191,0.35), transparent 50%), linear-gradient(135deg, #090d16 0%, #0e7490 50%, #6d28d9 100%)',
  },
  {
    id: 'por-do-sol',
    nome: 'Pôr do Sol',
    rotulo: 'Pôr do Sol',
    hex: '#be185d',
    estiloFundo:
      'radial-gradient(circle at 80% 25%, rgba(251,191,36,0.35), transparent 50%), linear-gradient(135deg, #2e1065 0%, #be185d 52%, #ea580c 100%)',
  },
  {
    id: 'cyber-grid',
    nome: 'Grade Neon',
    rotulo: 'Grade Neon',
    hex: '#38bdf8',
    estiloFundo:
      'linear-gradient(to right, rgba(56,189,248,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.14) 1px, transparent 1px), linear-gradient(180deg, #090d16 0%, #1e1b4b 100%)',
  },
  {
    id: 'floresta',
    nome: 'Floresta',
    rotulo: 'Floresta',
    hex: '#10b981',
    estiloFundo:
      'radial-gradient(circle at 25% 30%, rgba(52,211,153,0.28), transparent 50%), linear-gradient(135deg, #052e16 0%, #065f46 55%, #090d16 100%)',
  },
  {
    id: 'areia-dourada',
    nome: 'Areia Quente',
    rotulo: 'Areia Quente',
    hex: '#d97706',
    estiloFundo:
      'radial-gradient(circle at 75% 25%, rgba(253,230,138,0.3), transparent 50%), linear-gradient(135deg, #451a03 0%, #b45309 55%, #291508 100%)',
  },
];

const LIMITE_OFFSET = 25;
const PASSO_OFFSET = 2;

function limitarOffset(valor: number): number {
  return Math.max(-LIMITE_OFFSET, Math.min(LIMITE_OFFSET, Math.round(valor)));
}

function normalizarAcessorioId(id?: string): string {
  const bruto = (id || 'none').trim();
  if (bruto === 'squares') return 'square';
  if (bruto === 'lenco') return 'gravata-borboleta';
  return bruto;
}

function cabeloEhGratis(opcao?: OpcaoSelecaoMicah): boolean {
  if (!opcao) return false;
  if (opcao.premium === false) return true;
  if (opcao.premium === true) return false;
  const texto = `${opcao.id} ${opcao.rotulo}`.toLowerCase();
  return texto.includes('fonze') || texto.includes('pixie');
}

function acessorioEhGratis(opcao?: OpcaoSelecaoMicah): boolean {
  if (!opcao) return false;
  if (opcao.premium === false) return true;
  if (opcao.premium === true) return false;
  const texto = `${opcao.id} ${opcao.rotulo}`.toLowerCase();
  return (
    texto.includes('sem ') ||
    texto.includes('none') ||
    texto.includes('oculos') ||
    texto.includes('óculos') ||
    texto.includes('round') ||
    texto.includes('square') ||
    texto.includes('bone') ||
    texto.includes('boné')
  );
}

function SeletorSetas({
  titulo,
  opcoes,
  valorAtual,
  onChange,
  isOpcaoPremium,
}: SeletorSetasProps) {
  const normalizado = normalizarAcessorioId(valorAtual);
  const indiceAtual = Math.max(
    0,
    opcoes.findIndex(
      (item) => item.id.toLowerCase() === normalizado.toLowerCase()
    )
  );
  const itemAtual = opcoes[indiceAtual] ?? opcoes[0];
  const itemTemDiamante = Boolean(isOpcaoPremium?.(itemAtual));

  const handleAnterior = () => {
    const anterior = (indiceAtual - 1 + opcoes.length) % opcoes.length;
    onChange(opcoes[anterior].id);
  };

  const handleProximo = () => {
    const proximo = (indiceAtual + 1) % opcoes.length;
    onChange(opcoes[proximo].id);
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200 leading-none">
        <span className="truncate">{titulo}</span>
        <span className="ml-1 shrink-0 text-[9px] font-normal text-slate-300/80">
          {indiceAtual + 1}/{opcoes.length}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-slate-900/65 p-0.5">
        <button
          type="button"
          onClick={handleAnterior}
          aria-label={`Anterior em ${titulo}`}
          className="flex h-5 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800/80 text-[11px] font-bold text-slate-200 hover:border-purple-400 hover:bg-purple-950/60 hover:text-white transition"
        >
          &lt;
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1 text-center">
          {itemAtual?.hex && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/30"
              style={{ backgroundColor: itemAtual.hex }}
            />
          )}
          <span className="truncate text-[10px] font-semibold text-white">
            {itemAtual?.rotulo ?? ''}
          </span>
          {itemTemDiamante && (
            <span className="shrink-0 text-[10px] leading-none">💎</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleProximo}
          aria-label={`Próximo em ${titulo}`}
          className="flex h-5 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800/80 text-[11px] font-bold text-slate-200 hover:border-purple-400 hover:bg-purple-950/60 hover:text-white transition"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export function MenuPerfil({
  aberto,
  apelidoAtual,
  configJogo,
  onSalvarPerfil,
  onFechar,
}: MenuPerfilProps) {
  const [isPremiumSimulado, setIsPremiumSimulado] = useState(
    Boolean(configJogo.isPremium)
  );
  const [avisoBloqueio, setAvisoBloqueio] = useState('');

  const [seed, setSeed] = useState(
    configJogo.visualAvatar?.seed ?? VISUAL_PADRAO_MICAH.seed
  );
  const [corFundo, setCorFundo] = useState(
    configJogo.visualAvatar?.corFundo ?? VISUAL_PADRAO_MICAH.corFundo
  );
  const [bannerParede, setBannerParede] = useState(
    configJogo.visualAvatar?.bannerParede ?? PAPEIS_PAREDE_BANNER[0].id
  );
  const [imagemBanner, setImagemBanner] = useState(
    configJogo.visualAvatar?.imagemBanner ?? ''
  );
  const [urlBanner, setUrlBanner] = useState(
    configJogo.visualAvatar?.imagemBanner?.startsWith('data:')
      ? ''
      : configJogo.visualAvatar?.imagemBanner ?? ''
  );
  const [hair, setHair] = useState(
    configJogo.visualAvatar?.hair ?? VISUAL_PADRAO_MICAH.hair
  );
  const [hairColor, setHairColor] = useState(
    configJogo.visualAvatar?.hairColor ?? VISUAL_PADRAO_MICAH.hairColor
  );
  const [baseColor, setBaseColor] = useState(
    configJogo.visualAvatar?.baseColor ?? VISUAL_PADRAO_MICAH.baseColor
  );
  const [mouth, setMouth] = useState(
    configJogo.visualAvatar?.mouth ?? VISUAL_PADRAO_MICAH.mouth
  );
  const [acessorio, setAcessorio] = useState(
    normalizarAcessorioId(
      configJogo.visualAvatar?.acessorio ??
        configJogo.visualAvatar?.glasses ??
        VISUAL_PADRAO_MICAH.glasses
    )
  );
  const [corAcessorio, setCorAcessorio] = useState(
    configJogo.visualAvatar?.corAcessorio ??
      configJogo.visualAvatar?.glassesColor ??
      VISUAL_PADRAO_MICAH.glassesColor
  );
  const [acessorioX, setAcessorioX] = useState(
    configJogo.visualAvatar?.acessorioX ?? 0
  );
  const [acessorioY, setAcessorioY] = useState(
    configJogo.visualAvatar?.acessorioY ?? 0
  );
  const [facialHair, setFacialHair] = useState(
    configJogo.visualAvatar?.facialHair ?? VISUAL_PADRAO_MICAH.facialHair
  );
  const [facialHairColor, setFacialHairColor] = useState(
    configJogo.visualAvatar?.facialHairColor ??
      VISUAL_PADRAO_MICAH.facialHairColor
  );

  const arrasteRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    if (aberto) {
      const visualSalvo = configJogo.visualAvatar;
      setIsPremiumSimulado(Boolean(configJogo.isPremium));
      setAvisoBloqueio('');
      setSeed(visualSalvo?.seed ?? VISUAL_PADRAO_MICAH.seed);
      setCorFundo(visualSalvo?.corFundo ?? VISUAL_PADRAO_MICAH.corFundo);
      setBannerParede(visualSalvo?.bannerParede ?? PAPEIS_PAREDE_BANNER[0].id);
      const imgSalva = visualSalvo?.imagemBanner ?? '';
      setImagemBanner(imgSalva);
      setUrlBanner(imgSalva.startsWith('data:') ? '' : imgSalva);
      setHair(visualSalvo?.hair ?? VISUAL_PADRAO_MICAH.hair);
      setHairColor(visualSalvo?.hairColor ?? VISUAL_PADRAO_MICAH.hairColor);
      setBaseColor(visualSalvo?.baseColor ?? VISUAL_PADRAO_MICAH.baseColor);
      setMouth(visualSalvo?.mouth ?? VISUAL_PADRAO_MICAH.mouth);

      const acessorioInicial = normalizarAcessorioId(
        visualSalvo?.acessorio ??
          visualSalvo?.glasses ??
          VISUAL_PADRAO_MICAH.glasses
      );
      setAcessorio(acessorioInicial);
      setCorAcessorio(
        visualSalvo?.corAcessorio ??
          visualSalvo?.glassesColor ??
          VISUAL_PADRAO_MICAH.glassesColor
      );
      setAcessorioX(limitarOffset(visualSalvo?.acessorioX ?? 0));
      setAcessorioY(limitarOffset(visualSalvo?.acessorioY ?? 0));
      setFacialHair(
        visualSalvo?.facialHair ?? VISUAL_PADRAO_MICAH.facialHair
      );
      setFacialHairColor(
        visualSalvo?.facialHairColor ?? VISUAL_PADRAO_MICAH.facialHairColor
      );
    }
  }, [aberto, configJogo]);

  if (!aberto) return null;

  const nomePreview = apelidoAtual.trim() || 'Status';
  const bannerAtual =
    PAPEIS_PAREDE_BANNER.find((item) => item.id === bannerParede) ??
    PAPEIS_PAREDE_BANNER[0];

  const acessorioNormalizado = normalizarAcessorioId(acessorio);
  const acessorioEhMovel = acessorioNormalizado !== 'none';

  const visualPreview: VisualAvatarComBanner = {
    corFundo,
    bannerParede: bannerAtual.id,
    imagemBanner,
    seed,
    hair,
    hairColor,
    baseColor,
    mouth,
    glasses: acessorioNormalizado,
    glassesColor: corAcessorio,
    acessorio: acessorioNormalizado,
    corAcessorio,
    acessorioX: acessorioEhMovel ? acessorioX : 0,
    acessorioY: acessorioEhMovel ? acessorioY : 0,
    facialHair,
    facialHairColor,
  };

  const handlePointerDownAvatar = (e: PointerEvent<HTMLDivElement>) => {
    if (!acessorioEhMovel) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasteRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: acessorioX,
      origY: acessorioY,
    };
  };

  const handlePointerMoveAvatar = (e: PointerEvent<HTMLDivElement>) => {
    if (!arrasteRef.current || !acessorioEhMovel) return;
    const dx = e.clientX - arrasteRef.current.startX;
    const dy = e.clientY - arrasteRef.current.startY;
    setAcessorioX(limitarOffset(arrasteRef.current.origX + dx * 0.65));
    setAcessorioY(limitarOffset(arrasteRef.current.origY + dy * 0.65));
  };

  const handlePointerUpAvatar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    arrasteRef.current = null;
  };

  const moverAcessorio = (dx: number, dy: number) => {
    setAcessorioX((x) => limitarOffset(x + dx));
    setAcessorioY((y) => limitarOffset(y + dy));
  };

  const resetarPosicaoAcessorio = () => {
    setAcessorioX(0);
    setAcessorioY(0);
  };

  const handleUploadImagemBanner = (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === 'string') {
        setImagemBanner(leitor.result);
        setUrlBanner('');
        setAvisoBloqueio('');
      }
    };
    leitor.readAsDataURL(arquivo);
  };

  const handleAplicarUrlBanner = () => {
    const limpa = urlBanner.trim();
    if (!limpa) return;
    setImagemBanner(limpa);
    setAvisoBloqueio('');
  };

  const handleLimparImagemBanner = () => {
    setImagemBanner('');
    setUrlBanner('');
  };

  const sortearNovaSeed = () => {
    setSeed(`micah-${Math.random().toString(36).slice(2, 8)}`);
  };

  const handleSalvar = () => {
    const visualSalvoAnterior = configJogo.visualAvatar;
    const liberado = isPremiumSimulado || Boolean(configJogo.isPremium);

    if (liberado) {
      onSalvarPerfil(apelidoAtual, {
        ...configJogo,
        isPremium: true,
        visualAvatar: visualPreview,
      });
      onFechar();
      return;
    }

    const opcaoCabeloEscolhida = OPCOES_CABELO_MICAH.find(
      (item) => item.id.toLowerCase() === hair.toLowerCase()
    );
    const cabeloAnteriorGratis =
      visualSalvoAnterior?.hair &&
      cabeloEhGratis(
        OPCOES_CABELO_MICAH.find(
          (item) =>
            item.id.toLowerCase() === visualSalvoAnterior.hair?.toLowerCase()
        )
      );

    const hairValido = cabeloEhGratis(opcaoCabeloEscolhida)
      ? hair
      : cabeloAnteriorGratis
        ? (visualSalvoAnterior.hair as string)
        : (OPCOES_CABELO_MICAH.find((item) => cabeloEhGratis(item))?.id ??
          'fonze');

    const opcaoAcessorioEscolhida = OPCOES_ACESSORIOS_AVATAR.find(
      (item) => item.id.toLowerCase() === acessorioNormalizado.toLowerCase()
    );
    const acessorioAnteriorBruto = normalizarAcessorioId(
      visualSalvoAnterior?.acessorio ?? visualSalvoAnterior?.glasses
    );
    const acessorioAnteriorGratis =
      acessorioAnteriorBruto &&
      acessorioEhGratis(
        OPCOES_ACESSORIOS_AVATAR.find(
          (item) =>
            item.id.toLowerCase() === acessorioAnteriorBruto.toLowerCase()
        )
      );

    const acessorioValido = acessorioEhGratis(opcaoAcessorioEscolhida)
      ? acessorioNormalizado
      : acessorioAnteriorGratis
        ? acessorioAnteriorBruto
        : 'none';

    const acessorioSalvoEhMovel = acessorioValido !== 'none';

    const coordXValida = acessorioSalvoEhMovel
      ? limitarOffset(acessorioX)
      : (visualSalvoAnterior?.acessorioX ?? 0);
    const coordYValida = acessorioSalvoEhMovel
      ? limitarOffset(acessorioY)
      : (visualSalvoAnterior?.acessorioY ?? 0);

    const bannerImgValida = visualSalvoAnterior?.imagemBanner ?? '';

    const bloqueouAlgumItem =
      hairValido !== hair ||
      acessorioValido !== acessorioNormalizado ||
      imagemBanner !== bannerImgValida;

    if (bloqueouAlgumItem) {
      setAvisoBloqueio(
        'Itens 💎 ficaram apenas no preview: só os itens grátis foram salvos (Pacote Premium R$ 1,99).'
      );
    }

    const visualParaSalvar: VisualAvatarComBanner = {
      corFundo,
      bannerParede: bannerAtual.id,
      imagemBanner: bannerImgValida,
      seed,
      hair: hairValido,
      hairColor,
      baseColor,
      mouth,
      glasses: acessorioValido,
      glassesColor: corAcessorio,
      acessorio: acessorioValido,
      corAcessorio,
      acessorioX: coordXValida,
      acessorioY: coordYValida,
      facialHair,
      facialHairColor,
    };

    onSalvarPerfil(apelidoAtual, {
      ...configJogo,
      isPremium: false,
      visualAvatar: visualParaSalvar,
    });
    onFechar();
  };

  const temImagemBanner = Boolean(imagemBanner.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-[1px]">
      <div className="flex h-fit max-h-[96vh] w-full max-w-2xl flex-col rounded-l-2xl border-y border-l border-white/15 bg-slate-950/65 text-white shadow-2xl backdrop-blur-[2px] overflow-y-auto">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-1.5 shrink-0 bg-slate-950/50">
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white leading-tight truncate">
              Editar avatar
            </h2>
            <p className="text-[9px] text-slate-300/80 leading-tight truncate">
              Use &lt; e &gt; para trocar cada parte · 💎 = preview no Pacote Premium
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsPremiumSimulado((prev) => !prev);
                setAvisoBloqueio('');
              }}
              className={`rounded-lg border px-2 py-0.5 text-[9px] font-semibold transition ${
                isPremiumSimulado
                  ? 'border-amber-300 bg-amber-500/25 text-amber-100'
                  : 'border-white/15 bg-slate-900/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isPremiumSimulado ? '💎 Premium Ativo' : '💎 Testar R$ 1,99'}
            </button>

            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar menu perfil"
              className="rounded-lg border border-white/15 bg-slate-900/70 px-2 py-0.5 text-xs text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className="relative flex shrink-0 flex-col items-center justify-center border-b border-white/10 px-3 py-2.5 overflow-hidden"
          style={
            temImagemBanner
              ? {
                  backgroundImage: `url("${imagemBanner.replace(/"/g, '%22')}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  background: bannerAtual.estiloFundo,
                  backgroundSize:
                    bannerAtual.id === 'cyber-grid'
                      ? '18px 18px, 18px 18px, 100% 100%'
                      : 'cover',
                }
          }
        >
          <div className="pointer-events-none absolute inset-0 bg-slate-950/30" />

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              onPointerDown={handlePointerDownAvatar}
              onPointerMove={handlePointerMoveAvatar}
              onPointerUp={handlePointerUpAvatar}
              onPointerCancel={handlePointerUpAvatar}
              className={`flex items-center justify-center touch-none ${
                acessorioEhMovel ? 'cursor-move' : ''
              }`}
            >
              <AvatarStatus
                nome={nomePreview}
                estilo={configJogo.temaAvatar}
                visual={visualPreview}
              />
            </div>

            <button
              type="button"
              onClick={sortearNovaSeed}
              className="rounded-lg border border-white/15 bg-slate-900/75 px-2.5 py-0.5 text-[9px] font-semibold text-purple-200 hover:bg-slate-800 transition"
            >
              🎲 Nova seed ({seed})
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-3 py-2 space-y-2">
          {avisoBloqueio && (
            <div className="rounded-lg border border-amber-400/40 bg-amber-950/50 px-2.5 py-1 text-[10px] text-amber-200">
              {avisoBloqueio}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1">
            <SeletorSetas
              titulo="Cabelo"
              opcoes={OPCOES_CABELO_MICAH}
              valorAtual={hair}
              onChange={setHair}
              isOpcaoPremium={(opcao) => !cabeloEhGratis(opcao)}
            />

            <SeletorSetas
              titulo="Cor do cabelo"
              opcoes={OPCOES_COR_CABELO_MICAH}
              valorAtual={hairColor}
              onChange={setHairColor}
            />

            <SeletorSetas
              titulo="Boca"
              opcoes={OPCOES_BOCA_MICAH}
              valorAtual={mouth}
              onChange={setMouth}
            />

            <SeletorSetas
              titulo="Tom de pele"
              opcoes={OPCOES_COR_PELE_MICAH}
              valorAtual={baseColor}
              onChange={setBaseColor}
            />

            <SeletorSetas
              titulo="Acessórios"
              opcoes={OPCOES_ACESSORIOS_AVATAR}
              valorAtual={acessorioNormalizado}
              onChange={(novoId) => {
                setAcessorio(normalizarAcessorioId(novoId));
                setAcessorioX(0);
                setAcessorioY(0);
              }}
              isOpcaoPremium={(opcao) => !acessorioEhGratis(opcao)}
            />

            <SeletorSetas
              titulo="Cor do acessório"
              opcoes={OPCOES_COR_OCULOS_MICAH}
              valorAtual={corAcessorio}
              onChange={setCorAcessorio}
            />

            {acessorioEhMovel && (
              <div className="col-span-2 flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1">
                <span className="text-[10px] font-semibold text-slate-200">
                  Mover acessório (X:{acessorioX} Y:{acessorioY})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moverAcessorio(-PASSO_OFFSET, 0)}
                    className="rounded border border-white/15 bg-slate-800 px-2 py-0.5 text-[10px] font-bold hover:border-purple-400"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moverAcessorio(0, -PASSO_OFFSET)}
                    className="rounded border border-white/15 bg-slate-800 px-2 py-0.5 text-[10px] font-bold hover:border-purple-400"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moverAcessorio(0, PASSO_OFFSET)}
                    className="rounded border border-white/15 bg-slate-800 px-2 py-0.5 text-[10px] font-bold hover:border-purple-400"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => moverAcessorio(PASSO_OFFSET, 0)}
                    className="rounded border border-white/15 bg-slate-800 px-2 py-0.5 text-[10px] font-bold hover:border-purple-400"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={resetarPosicaoAcessorio}
                    className="rounded border border-white/15 bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            <SeletorSetas
              titulo="Barba"
              opcoes={OPCOES_BARBA_MICAH}
              valorAtual={facialHair}
              onChange={setFacialHair}
            />

            <SeletorSetas
              titulo="Cor da barba"
              opcoes={OPCOES_COR_BARBA_MICAH}
              valorAtual={facialHairColor}
              onChange={setFacialHairColor}
            />

            <SeletorSetas
              titulo="Cor de fundo"
              opcoes={OPCOES_COR_FUNDO_MICAH}
              valorAtual={corFundo}
              onChange={setCorFundo}
            />

            <SeletorSetas
              titulo="Papel de parede"
              opcoes={PAPEIS_PAREDE_BANNER}
              valorAtual={bannerParede}
              onChange={(novoId) => {
                setBannerParede(novoId);
                setImagemBanner('');
              }}
            />
          </div>

          <div className="space-y-1 rounded-lg border border-white/10 bg-slate-900/55 px-2 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200 leading-none">
              <span className="flex items-center gap-1">
                <span>Imagem no banner</span>
                <span>💎</span>
              </span>
              {temImagemBanner && (
                <button
                  type="button"
                  onClick={handleLimparImagemBanner}
                  className="text-[9px] text-rose-300 hover:text-rose-200"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-white/20 bg-slate-950/60 px-2 py-1 text-[10px] font-medium text-purple-200 hover:border-purple-400">
                Escolher foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImagemBanner}
                  className="hidden"
                />
              </label>

              <div className="flex gap-1">
                <input
                  type="text"
                  value={urlBanner}
                  onChange={(e) => setUrlBanner(e.target.value)}
                  placeholder="Link da imagem..."
                  className="w-full rounded-md border border-white/15 bg-slate-950/65 px-1.5 py-0.5 text-[10px] text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAplicarUrlBanner}
                  className="shrink-0 rounded-md bg-purple-600/85 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-purple-500"
                >
                  Pôr
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/10 px-3 py-1.5 shrink-0 bg-slate-950/65">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 rounded-xl border border-white/15 bg-slate-900/75 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="flex-1 rounded-xl bg-purple-600/90 py-1.5 text-[11px] font-semibold text-white hover:bg-purple-500"
          >
            Salvar avatar
          </button>
        </div>
      </div>
    </div>
  );
}