import { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import {
  AvatarStatus,
  VISUAL_PADRAO_MICAH,
  type ConfigVisualAvatar,
  type EstiloAvatar,
} from './AvatarStatus';
import { MapaGame } from './MapaGame';
import { MenuPerfil, type ConfigJogoUsuario } from './MenuPerfil';
import { RankAcoes, type ItemRankingAcao } from './RankAcoes';
import {
  EditarStatus,
  type AcaoStatus,
  type CorApelidoStatus,
  type DadosStatus,
  type SentimentoStatus,
} from './EditarStatus';

interface Coordenadas {
  lat: number;
  lng: number;
}

interface UsuarioSimulado {
  id: string;
  apelido: string;
  corApelido: CorApelidoStatus;
  corBalaoApelidoClass: string;
  acao: AcaoStatus;
  detalhe: string;
  sentimento: SentimentoStatus;
  offsetLat: number;
  offsetLng: number;
  visualAvatar: ConfigVisualAvatar;
}

const COORDENADA_PADRAO: Coordenadas = {
  lat: -22.89407,
  lng: -47.21626,
};

const CARTO_TILE_URL =
  'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_5fh5_1_f2839193f7977c518acd9f0c';

const CHAVE_CURTIDAS_LOCAL = 'status_app_curtidas_ids_v1';
const CHAVE_CONFIG_JOGO = 'status_app_config_jogo_v1';

const ESTILOS_AVATAR_VALIDOS: EstiloAvatar[] = [
  'robo',
  'aventureiro',
  'heroi',
  'cyber',
  'mago',
  'fera',
];

const SUFIXO_ALEATORIO_TESTE = Math.random().toString(36).slice(2, 6);

const USUARIOS_SIMULADOS: UsuarioSimulado[] = [
  {
    id: 'Teste_02',
    apelido: 'Teste_02',
    corApelido: 'Ciano',
    corBalaoApelidoClass: 'text-cyan-800',
    acao: 'Jogando',
    detalhe: 'Zelda - Ocarina of Time',
    sentimento: 'Feliz',
    offsetLat: -0.00145,
    offsetLng: 0.00015,
    visualAvatar: {
      corFundo: '#0284c7',
      seed: `homem-teste-${SUFIXO_ALEATORIO_TESTE}`,
      hair: 'fonze',
      hairColor: '6b3e26',
      baseColor: 'ac6651',
      mouth: 'smile',
      glasses: 'none',
      glassesColor: '111827',
      facialHair: 'beard',
      facialHairColor: '6b3e26',
    },
  },
  {
    id: 'teste_03',
    apelido: 'teste_03',
    corApelido: 'Rosa',
    corBalaoApelidoClass: 'text-pink-800',
    acao: 'Lendo',
    detalhe: 'Antes de Morrer - Jenny Downham',
    sentimento: 'Cansado',
    offsetLat: -0.00095,
    offsetLng: 0.0022,
    visualAvatar: {
      corFundo: '#be123c',
      seed: `mulher-teste-${SUFIXO_ALEATORIO_TESTE}`,
      hair: 'full',
      hairColor: 'c2410c',
      baseColor: 'f9c9b6',
      mouth: 'laughing',
      glasses: 'round',
      glassesColor: '111827',
      facialHair: 'none',
      facialHairColor: '000000',
    },
  },
];

const VERBO_ACAO: Record<AcaoStatus, string> = {
  Ouvir: 'Ouvindo',
  Lendo: 'Lendo',
  Jogando: 'Jogando',
};

const COR_APELIDO_CLASS: Record<CorApelidoStatus, string> = {
  Branco: 'text-white',
  Ciano: 'text-cyan-700',
  Rosa: 'text-pink-700',
  Laranja: 'text-orange-700',
};

const EMOJI_SENTIMENTO: Record<SentimentoStatus, { emoji: string; rotulo: string }> = {
  Feliz: { emoji: '😄', rotulo: 'Feliz' },
  Cansado: { emoji: '😫', rotulo: 'Cansado' },
  Chorando: { emoji: '😭', rotulo: 'Chorando' },
  Nervoso: { emoji: '😡', rotulo: 'Nervoso' },
};

const TODOS_SENTIMENTOS: SentimentoStatus[] = [
  'Feliz',
  'Cansado',
  'Chorando',
  'Nervoso',
];

function lerIdsCurtidosLocal(): string[] {
  try {
    const bruto = localStorage.getItem(CHAVE_CURTIDAS_LOCAL);
    if (!bruto) return [];
    const parsed = JSON.parse(bruto);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function normalizarEstiloAvatar(valor: unknown): EstiloAvatar {
  if (
    typeof valor === 'string' &&
    ESTILOS_AVATAR_VALIDOS.includes(valor as EstiloAvatar)
  ) {
    return valor as EstiloAvatar;
  }
  return 'robo';
}

function normalizarVisualAvatar(bruto: unknown): ConfigVisualAvatar {
  const obj =
    bruto && typeof bruto === 'object'
      ? (bruto as Record<string, unknown>)
      : {};

  return {
    corFundo:
      typeof obj.corFundo === 'string'
        ? obj.corFundo
        : VISUAL_PADRAO_MICAH.corFundo,
    variante: typeof obj.variante === 'string' ? obj.variante : undefined,
    seed: typeof obj.seed === 'string' ? obj.seed : VISUAL_PADRAO_MICAH.seed,
    hair: typeof obj.hair === 'string' ? obj.hair : VISUAL_PADRAO_MICAH.hair,
    hairColor:
      typeof obj.hairColor === 'string'
        ? obj.hairColor
        : VISUAL_PADRAO_MICAH.hairColor,
    baseColor:
      typeof obj.baseColor === 'string'
        ? obj.baseColor
        : VISUAL_PADRAO_MICAH.baseColor,
    mouth:
      typeof obj.mouth === 'string' ? obj.mouth : VISUAL_PADRAO_MICAH.mouth,
    eyebrows: typeof obj.eyebrows === 'string' ? obj.eyebrows : undefined,
    glasses:
      typeof obj.glasses === 'string'
        ? obj.glasses
        : VISUAL_PADRAO_MICAH.glasses,
    glassesColor:
      typeof obj.glassesColor === 'string'
        ? obj.glassesColor
        : VISUAL_PADRAO_MICAH.glassesColor,
    facialHair:
      typeof obj.facialHair === 'string'
        ? obj.facialHair
        : VISUAL_PADRAO_MICAH.facialHair,
    facialHairColor:
      typeof obj.facialHairColor === 'string'
        ? obj.facialHairColor
        : VISUAL_PADRAO_MICAH.facialHairColor,
  };
}

function carregarConfigJogo(): ConfigJogoUsuario {
  try {
    const bruto = localStorage.getItem(CHAVE_CONFIG_JOGO);
    if (!bruto) {
      return {
        somAtivo: true,
        vibracaoAtiva: true,
        temaAvatar: 'robo',
        visualAvatar: normalizarVisualAvatar(null),
      };
    }
    const parsed = JSON.parse(bruto);
    return {
      somAtivo: typeof parsed?.somAtivo === 'boolean' ? parsed.somAtivo : true,
      vibracaoAtiva:
        typeof parsed?.vibracaoAtiva === 'boolean' ? parsed.vibracaoAtiva : true,
      temaAvatar: normalizarEstiloAvatar(parsed?.temaAvatar),
      visualAvatar: normalizarVisualAvatar(parsed?.visualAvatar),
    };
  } catch {
    return {
      somAtivo: true,
      vibracaoAtiva: true,
      temaAvatar: 'robo',
      visualAvatar: normalizarVisualAvatar(null),
    };
  }
}

function CentralizarMapa({ coords }: { coords: Coordenadas }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([coords.lat, coords.lng], map.getZoom(), {
      duration: 0.6,
    });
  }, [coords, map]);

  return null;
}

export function MapaGps() {
  const [modoGame, setModoGame] = useState(false);
  const [usuarioGameAberto, setUsuarioGameAberto] = useState<UsuarioSimulado | null>(
    null
  );
  const [coords, setCoords] = useState<Coordenadas>(COORDENADA_PADRAO);
  const [statusGps, setStatusGps] = useState('Buscando GPS...');
  const [reinicioContador, setReinicioContador] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [rankingAberto, setRankingAberto] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [configJogo, setConfigJogo] = useState<ConfigJogoUsuario>(() =>
    carregarConfigJogo()
  );
  const [usuarioDetalheAberto, setUsuarioDetalheAberto] =
    useState<UsuarioSimulado | null>(null);

  const [dadosStatus, setDadosStatus] = useState<DadosStatus>({
    apelido: 'Lucky_07',
    corApelido: 'Laranja',
    opcaoSexual: 'Hetero',
    mostrarOpcaoSexual: true,
    acao: 'Ouvir',
    detalheAcao: "Guns n' Rose - November rain",
    sentimento: 'Feliz',
  });

  const [idsCurtidos, setIdsCurtidos] = useState<string[]>(() =>
    lerIdsCurtidosLocal()
  );

  const [curtidasPorUsuario, setCurtidasPorUsuario] = useState<
    Record<string, number>
  >(() => {
    const iniciais = lerIdsCurtidosLocal();
    const mapa: Record<string, number> = {};
    USUARIOS_SIMULADOS.forEach((u) => {
      mapa[u.id] = iniciais.includes(u.id) ? 1 : 0;
    });
    return mapa;
  });

  const [curtidasPorAcao, setCurtidasPorAcao] = useState<
    Record<AcaoStatus, number>
  >(() => {
    const iniciais = lerIdsCurtidosLocal();
    const totais: Record<AcaoStatus, number> = {
      Ouvir: 0,
      Lendo: 0,
      Jogando: 0,
    };
    USUARIOS_SIMULADOS.forEach((u) => {
      if (iniciais.includes(u.id)) {
        totais[u.acao] += 1;
      }
    });
    return totais;
  });

  const [avisoCurtida, setAvisoCurtida] = useState('');

  useEffect(() => {
    if (modoGame || usuarioGameAberto) return;

    if (!('geolocation' in navigator)) {
      setStatusGps('GPS indisponível neste navegador');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (posicao) => {
        setCoords({
          lat: posicao.coords.latitude,
          lng: posicao.coords.longitude,
        });
        setStatusGps('GPS ativo');
      },
      (erro) => {
        setStatusGps(`GPS sem sinal (${erro.message})`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [modoGame, usuarioGameAberto, reinicioContador]);

  const iconeAvatar = useMemo(() => {
    const html = renderToStaticMarkup(
      <AvatarStatus
        nome={dadosStatus.apelido}
        estilo={configJogo.temaAvatar}
        visual={configJogo.visualAvatar}
      />
    );
    return L.divIcon({
      html,
      className: 'bg-transparent border-0 cursor-pointer',
      iconSize: [80, 96],
      iconAnchor: [40, 48],
    });
  }, [dadosStatus.apelido, configJogo.temaAvatar, configJogo.visualAvatar]);

  const iconesSimulados = useMemo(() => {
    return USUARIOS_SIMULADOS.map((usuario) => {
      const jaCurtiu = idsCurtidos.includes(usuario.id);
      const totalCurtidas = curtidasPorUsuario[usuario.id] ?? 0;
      const verbo = VERBO_ACAO[usuario.acao];
      const textoCompleto = `${usuario.apelido} ${verbo} ${usuario.detalhe}`.trim();
      const deveRolar = textoCompleto.length > 22;

      const conteudoBalao = (
        <>
          <span className={`font-bold ${usuario.corBalaoApelidoClass}`}>
            {usuario.apelido}
          </span>{' '}
          <span className="font-black text-purple-800">{verbo}</span>{' '}
          <span className="font-semibold text-slate-900">{usuario.detalhe}</span>
        </>
      );

      const htmlFaixa = renderToStaticMarkup(
        <div className="flex items-center gap-1.5">
          <div className="w-[156px] overflow-hidden rounded-full border border-black bg-yellow-300 px-2.5 py-0.5 text-[10px] shadow-md">
            {deveRolar ? (
              <div
                className="flex w-max whitespace-nowrap"
                style={{ animation: 'marquee 7s linear infinite' }}
              >
                <span className="pr-6">{conteudoBalao}</span>
                <span className="pr-6">{conteudoBalao}</span>
              </div>
            ) : (
              <div className="truncate text-center whitespace-nowrap">
                {conteudoBalao}
              </div>
            )}
          </div>
          <button
            type="button"
            data-curtir-usuario={usuario.id}
            aria-label={`Curtir status de ${usuario.apelido}`}
            className={`flex items-center gap-0.5 rounded-full border border-black px-2 py-0.5 text-[10px] font-semibold shadow-md whitespace-nowrap ${
              jaCurtiu
                ? 'bg-emerald-900/95 text-emerald-300'
                : 'bg-slate-900/95 text-sky-300 hover:bg-slate-800'
            }`}
          >
            <span>👍</span>
            <span>{totalCurtidas}</span>
          </button>
        </div>
      );

      const htmlAvatar = renderToStaticMarkup(
        <AvatarStatus nome={usuario.apelido} visual={usuario.visualAvatar} />
      );

      return {
        usuario,
        coord: {
          lat: coords.lat + usuario.offsetLat,
          lng: coords.lng + usuario.offsetLng,
        },
        iconeFaixa: L.divIcon({
          html: htmlFaixa,
          className:
            'bg-transparent border-0 flex items-center justify-center',
          iconSize: [216, 24],
          iconAnchor: [91, 70],
        }),
        iconeAvatar: L.divIcon({
          html: htmlAvatar,
          className: 'bg-transparent border-0 cursor-pointer opacity-90',
          iconSize: [72, 88],
          iconAnchor: [36, 44],
        }),
      };
    });
  }, [coords.lat, coords.lng, curtidasPorUsuario, idsCurtidos]);

  const verboAtual = VERBO_ACAO[dadosStatus.acao];
  const corApelidoClasse = COR_APELIDO_CLASS[dadosStatus.corApelido];

  const textoDetalheRapido = useMemo(() => {
    if (!dadosStatus.detalheAcao) return '';
    if (dadosStatus.acao === 'Ouvir') {
      return dadosStatus.detalheAcao.split(' - ')[0].trim();
    }
    return dadosStatus.detalheAcao.trim();
  }, [dadosStatus.acao, dadosStatus.detalheAcao]);

  const iconeFaixaPrincipal = useMemo(() => {
    const textoCompletoPlano =
      `${dadosStatus.apelido} ${verboAtual} ${textoDetalheRapido}`.trim();
    const deveRolar = textoCompletoPlano.length > 22;

    const conteudoBalao = (
      <>
        <span className={`font-bold ${corApelidoClasse}`}>
          {dadosStatus.apelido}
        </span>{' '}
        <span className="font-black text-purple-800">{verboAtual}</span>
        {textoDetalheRapido ? (
          <span className="font-semibold text-slate-900">
            {' '}
            {textoDetalheRapido}
          </span>
        ) : null}
      </>
    );

    const html = renderToStaticMarkup(
      <div className="w-[176px] overflow-hidden rounded-full border border-black bg-yellow-300 px-2.5 py-0.5 text-[10px] shadow-md">
        {deveRolar ? (
          <div
            className="flex w-max whitespace-nowrap"
            style={{ animation: 'marquee 7s linear infinite' }}
          >
            <span className="pr-6">{conteudoBalao}</span>
            <span className="pr-6">{conteudoBalao}</span>
          </div>
        ) : (
          <div className="truncate text-center whitespace-nowrap">
            {conteudoBalao}
          </div>
        )}
      </div>
    );

    return L.divIcon({
      html,
      className:
        'bg-transparent border-0 pointer-events-none flex justify-center',
      iconSize: [182, 24],
      iconAnchor: [91, 74],
    });
  }, [dadosStatus.apelido, corApelidoClasse, verboAtual, textoDetalheRapido]);

  const itensRanking = useMemo<ItemRankingAcao[]>(() => {
    const lista: ItemRankingAcao[] = [
      {
        id: 'usuario-atual',
        apelido: dadosStatus.apelido,
        corApelido: dadosStatus.corApelido,
        acao: dadosStatus.acao,
        detalhe: dadosStatus.detalheAcao || 'Não informado',
        curtidas: curtidasPorAcao[dadosStatus.acao],
        ehUsuarioAtual: true,
      },
    ];

    USUARIOS_SIMULADOS.forEach((usuario) => {
      lista.push({
        id: usuario.id,
        apelido: usuario.apelido,
        corApelido: usuario.corApelido,
        acao: usuario.acao,
        detalhe: usuario.detalhe,
        curtidas: curtidasPorAcao[usuario.acao],
      });
    });

    return lista;
  }, [
    curtidasPorAcao,
    dadosStatus.acao,
    dadosStatus.apelido,
    dadosStatus.corApelido,
    dadosStatus.detalheAcao,
  ]);

  const handleMover = () => {
    setCoords((atual) => ({
      lat: atual.lat + 0.00035,
      lng: atual.lng + 0.00035,
    }));
    setStatusGps('Movimento simulado');
  };

  const handleReiniciar = () => {
    setStatusGps('Buscando GPS...');
    setReinicioContador((c) => c + 1);
  };

  const handleCurtirUsuario = (usuario: UsuarioSimulado) => {
    if (idsCurtidos.includes(usuario.id)) {
      setAvisoCurtida(`Você já curtiu ${usuario.apelido}`);
      return;
    }

    const atualizados = [...idsCurtidos, usuario.id];
    setIdsCurtidos(atualizados);
    setCurtidasPorUsuario((atual) => ({
      ...atual,
      [usuario.id]: (atual[usuario.id] ?? 0) + 1,
    }));
    setCurtidasPorAcao((atual) => ({
      ...atual,
      [usuario.acao]: atual[usuario.acao] + 1,
    }));
    setAvisoCurtida('');

    try {
      localStorage.setItem(CHAVE_CURTIDAS_LOCAL, JSON.stringify(atualizados));
    } catch {
      // ignora falha de armazenamento local
    }
  };

  if (modoGame) {
    return <MapaGame aoVoltarGps={() => setModoGame(false)} />;
  }

  if (usuarioGameAberto) {
    return (
      <div className="relative h-screen w-screen overflow-hidden">
        <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2 rounded-full border border-purple-400/50 bg-slate-900/95 px-4 py-1.5 text-xs font-semibold text-white shadow-xl">
          Mundo virtual de{' '}
          <span className="text-purple-300">{usuarioGameAberto.apelido}</span>
        </div>
        <MapaGame aoVoltarGps={() => setUsuarioGameAberto(null)} />
      </div>
    );
  }

  const jaCurtiuDetalhe = usuarioDetalheAberto
    ? idsCurtidos.includes(usuarioDetalheAberto.id)
    : false;
  const totalCurtidasDetalhe = usuarioDetalheAberto
    ? curtidasPorUsuario[usuarioDetalheAberto.id] ?? 0
    : 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={17}
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url={CARTO_TILE_URL}
        />
        <Marker
          position={[coords.lat, coords.lng]}
          icon={iconeFaixaPrincipal}
          zIndexOffset={-10}
        />
        <Marker
          position={[coords.lat, coords.lng]}
          icon={iconeAvatar}
          eventHandlers={{
            click: () => setModalAberto(true),
          }}
        />

        {iconesSimulados.map(
          ({ usuario, coord, iconeFaixa, iconeAvatar: iconeAv }) => (
            <div key={usuario.id}>
              <Marker
                position={[coord.lat, coord.lng]}
                icon={iconeFaixa}
                zIndexOffset={-10}
                eventHandlers={{
                  click: (evento) => {
                    const alvo = evento.originalEvent.target as HTMLElement | null;
                    if (alvo?.closest(`[data-curtir-usuario="${usuario.id}"]`)) {
                      handleCurtirUsuario(usuario);
                      return;
                    }
                    setUsuarioDetalheAberto(usuario);
                  },
                }}
              />
              <Marker
                position={[coord.lat, coord.lng]}
                icon={iconeAv}
                eventHandlers={{
                  click: () => setUsuarioDetalheAberto(usuario),
                }}
              />
            </div>
          )
        )}

        <CentralizarMapa coords={coords} />
      </MapContainer>

      <div className="fixed top-3 left-3 z-20 flex flex-col items-start gap-1.5 pointer-events-none max-w-[calc(100vw-24px)]">
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMenuPerfilAberto(true)}
            aria-label="Abrir menu perfil"
            className="rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white shadow border border-white/15 hover:bg-slate-800/90 backdrop-blur-[2px]"
          >
            ☰
          </button>
          <div className="rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] text-white shadow border border-white/15 backdrop-blur-[2px]">
            <span className="font-semibold">{statusGps}</span>
            <span className="text-sky-300 ml-1.5">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {avisoCurtida && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-amber-400/50 bg-slate-950/75 px-2.5 py-1 text-[11px] text-amber-200 shadow backdrop-blur-[2px]">
            <span>{avisoCurtida}</span>
            <button
              type="button"
              onClick={() => setAvisoCurtida('')}
              className="text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {usuarioDetalheAberto && (
          <div className="pointer-events-auto w-full max-w-xs rounded-xl border border-white/15 bg-slate-950/60 p-2.5 text-xs text-white shadow-xl backdrop-blur-[2px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-300">
                Detalhes de {usuarioDetalheAberto.apelido}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCurtirUsuario(usuarioDetalheAberto)}
                  className={`rounded border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-[2px] ${
                    jaCurtiuDetalhe
                      ? 'bg-emerald-600/35 border-emerald-400/50 text-emerald-100'
                      : 'bg-sky-600/35 border-sky-400/50 text-sky-100 hover:bg-sky-600/50'
                  }`}
                >
                  👍 {totalCurtidasDetalhe}
                </button>
                <button
                  type="button"
                  onClick={() => setUsuarioDetalheAberto(null)}
                  className="rounded border border-white/10 bg-slate-900/50 px-1.5 py-0.5 text-slate-300 hover:bg-slate-800/70 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {dadosStatus.mostrarOpcaoSexual && (
              <div className="text-slate-100">
                <span className="text-slate-300/80">Opção sexual: </span>
                <span className="font-semibold">{dadosStatus.opcaoSexual}</span>
              </div>
            )}

            <div className="text-slate-100">
              <span className="text-slate-300/80">
                {VERBO_ACAO[usuarioDetalheAberto.acao]}:{' '}
              </span>
              <span className="font-semibold">{usuarioDetalheAberto.detalhe}</span>
            </div>

            <div>
              <div className="text-[11px] text-slate-300/85 mb-1">
                Sentimento atual:
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {TODOS_SENTIMENTOS.map((item) => {
                  const ativo = usuarioDetalheAberto.sentimento === item;
                  return (
                    <div
                      key={item}
                      className={`flex flex-col items-center rounded-lg border py-1 text-[10px] backdrop-blur-[2px] ${
                        ativo
                          ? 'border-amber-400 bg-slate-900/75 text-white font-semibold'
                          : 'border-white/10 bg-slate-950/35 text-slate-300/70 grayscale opacity-55'
                      }`}
                    >
                      <span className="text-base">
                        {EMOJI_SENTIMENTO[item].emoji}
                      </span>
                      <span>{EMOJI_SENTIMENTO[item].rotulo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const selecionado = usuarioDetalheAberto;
                  setUsuarioDetalheAberto(null);
                  setUsuarioGameAberto(selecionado);
                }}
                className="w-full rounded-lg bg-purple-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-purple-500"
              >
                Ver MapaGame
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-20 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={() => setRankingAberto(true)}
          className="rounded-full bg-purple-700/90 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-purple-600 backdrop-blur-[2px]"
        >
          Ranking
        </button>

        <button
          type="button"
          onClick={handleMover}
          className="rounded-full bg-sky-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-500 backdrop-blur-[2px]"
        >
          Mover
        </button>

        <button
          type="button"
          onClick={handleReiniciar}
          className="rounded-full bg-amber-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-amber-500 backdrop-blur-[2px]"
        >
          Reiniciar
        </button>

        <button
          type="button"
          onClick={() => setModoGame(true)}
          className="rounded-full bg-slate-900/85 px-4 py-3 text-sm font-semibold text-white shadow-lg border border-white/15 hover:bg-slate-800/90 backdrop-blur-[2px]"
        >
          Entrar no MapaGame
        </button>
      </div>

      <MenuPerfil
        aberto={menuPerfilAberto}
        apelidoAtual={dadosStatus.apelido}
        configJogo={configJogo}
        onSalvarPerfil={(novoApelido, novaConfig) => {
          setDadosStatus((atual) => ({ ...atual, apelido: novoApelido }));
          setConfigJogo(novaConfig);
          try {
            localStorage.setItem(CHAVE_CONFIG_JOGO, JSON.stringify(novaConfig));
          } catch {
            // ignora erro de armazenamento local
          }
        }}
        onFechar={() => setMenuPerfilAberto(false)}
      />

      <EditarStatus
        aberto={modalAberto}
        dados={dadosStatus}
        onSalvar={(novosDados) => setDadosStatus(novosDados)}
        onFechar={() => setModalAberto(false)}
      />

      <RankAcoes
        aberto={rankingAberto}
        itens={itensRanking}
        onFechar={() => setRankingAberto(false)}
      />
    </div>
  );
}