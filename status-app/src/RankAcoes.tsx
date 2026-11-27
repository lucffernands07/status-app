import { useMemo } from 'react';
import type { AcaoStatus, CorApelidoStatus } from './EditarStatus';

export interface ItemRankingAcao {
  id: string;
  apelido: string;
  corApelido: CorApelidoStatus;
  acao: AcaoStatus;
  detalhe: string;
  curtidas: number;
  ehUsuarioAtual?: boolean;
}

interface RankAcoesProps {
  aberto: boolean;
  itens: ItemRankingAcao[];
  onFechar: () => void;
}

const INFO_ACOES: Record<
  AcaoStatus,
  { verbo: string; icone: string; rotuloItem: string; vazio: string }
> = {
  Ouvir: {
    verbo: 'Ouvindo',
    icone: '🎧',
    rotuloItem: 'Música / Banda',
    vazio: 'Nenhuma música curtida ainda',
  },
  Lendo: {
    verbo: 'Lendo',
    icone: '📖',
    rotuloItem: 'Livro',
    vazio: 'Nenhum livro curtido ainda',
  },
  Jogando: {
    verbo: 'Jogando',
    icone: '🎮',
    rotuloItem: 'Jogo',
    vazio: 'Nenhum jogo curtido ainda',
  },
};

const COR_APELIDO_RANK_CLASS: Record<CorApelidoStatus, string> = {
  Branco: 'text-white',
  Ciano: 'text-cyan-300',
  Rosa: 'text-pink-300',
  Laranja: 'text-orange-300',
};

const ORDEM_ACOES: AcaoStatus[] = ['Ouvir', 'Lendo', 'Jogando'];

export function RankAcoes({ aberto, itens, onFechar }: RankAcoesProps) {
  const lideresPorAcao = useMemo(() => {
    const grupos = ORDEM_ACOES.map((acao) => {
      const candidatos = itens
        .filter((item) => item.acao === acao)
        .sort((a, b) => {
          if (b.curtidas !== a.curtidas) return b.curtidas - a.curtidas;
          if (a.ehUsuarioAtual && !b.ehUsuarioAtual) return -1;
          if (b.ehUsuarioAtual && !a.ehUsuarioAtual) return 1;
          return a.apelido.localeCompare(b.apelido);
        });

      const lider = candidatos[0] ?? null;

      return {
        acao,
        lider,
        curtidas: lider ? lider.curtidas : 0,
      };
    });

    grupos.sort((a, b) => {
      if (b.curtidas !== a.curtidas) return b.curtidas - a.curtidas;
      return ORDEM_ACOES.indexOf(a.acao) - ORDEM_ACOES.indexOf(b.acao);
    });

    return grupos.map((grupo, indice) => ({
      ...grupo,
      posicao: indice + 1,
    }));
  }, [itens]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-purple-400">
              Ranking de Curtidas por Ação
            </h2>
            <p className="text-xs text-slate-400">
              Usuário mais curtido em música, livro e jogo
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg px-2.5 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5">
          {lideresPorAcao.map(({ posicao, acao, lider, curtidas }) => {
            const info = INFO_ACOES[acao];

            return (
              <div
                key={acao}
                className="rounded-xl border border-slate-800 bg-slate-800/50 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black bg-yellow-300 text-xs font-extrabold text-slate-950">
                      {posicao}º
                    </span>
                    <span className="text-lg">{info.icone}</span>
                    <span className="font-bold text-purple-300">{info.verbo}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-sky-300">
                    <span>👍</span>
                    <span>{curtidas}</span>
                  </div>
                </div>

                {lider && curtidas > 0 ? (
                  <div className="pl-9 space-y-0.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Mais curtido:</span>
                      <span
                        className={`font-bold ${COR_APELIDO_RANK_CLASS[lider.corApelido]}`}
                      >
                        {lider.apelido}
                      </span>
                      {lider.ehUsuarioAtual && (
                        <span className="rounded-full border border-purple-500/40 bg-purple-600/30 px-2 py-0.5 text-[10px] font-semibold text-purple-200">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400">{info.rotuloItem}: </span>
                      <span className="font-semibold text-white">
                        {lider.detalhe || 'Não informado'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="pl-9 text-xs text-slate-500">{info.vazio}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}