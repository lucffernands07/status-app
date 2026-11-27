import { useEffect, useState } from 'react';

export type OpcaoSexual = 'Hetero' | 'Gay';
export type AcaoStatus = 'Ouvir' | 'Lendo' | 'Jogando';
export type SentimentoStatus = 'Feliz' | 'Cansado' | 'Chorando' | 'Nervoso';
export type CorApelidoStatus = 'Branco' | 'Ciano' | 'Rosa' | 'Laranja';

export interface DadosStatus {
  apelido: string;
  corApelido: CorApelidoStatus;
  opcaoSexual: OpcaoSexual;
  mostrarOpcaoSexual: boolean;
  acao: AcaoStatus;
  detalheAcao: string;
  sentimento: SentimentoStatus;
}

interface EditarStatusProps {
  aberto: boolean;
  dados: DadosStatus;
  onSalvar: (novosDados: DadosStatus) => void;
  onFechar: () => void;
}

const CORES_APELIDO: { valor: CorApelidoStatus; rotulo: string; amostraClass: string }[] = [
  { valor: 'Branco', rotulo: 'Branco', amostraClass: 'bg-white border-slate-400' },
  { valor: 'Ciano', rotulo: 'Ciano', amostraClass: 'bg-cyan-400 border-cyan-200' },
  { valor: 'Rosa', rotulo: 'Rosa', amostraClass: 'bg-pink-400 border-pink-200' },
  { valor: 'Laranja', rotulo: 'Laranja', amostraClass: 'bg-orange-400 border-orange-200' },
];

const OPCOES_SEXUAIS: OpcaoSexual[] = ['Hetero', 'Gay'];
const ACOES_PADRAO: AcaoStatus[] = ['Ouvir', 'Lendo', 'Jogando'];

const SENTIMENTOS_PADRAO: {
  valor: SentimentoStatus;
  emoji: string;
  rotulo: string;
}[] = [
  { valor: 'Feliz', emoji: '😄', rotulo: 'Feliz' },
  { valor: 'Cansado', emoji: '😫', rotulo: 'Cansado' },
  { valor: 'Chorando', emoji: '😭', rotulo: 'Chorando' },
  { valor: 'Nervoso', emoji: '😡', rotulo: 'Nervoso' },
];

export function EditarStatus({
  aberto,
  dados,
  onSalvar,
  onFechar,
}: EditarStatusProps) {
  const [apelido, setApelido] = useState(dados.apelido);
  const [corApelido, setCorApelido] = useState<CorApelidoStatus>(dados.corApelido);
  const [opcaoSexual, setOpcaoSexual] = useState<OpcaoSexual>(dados.opcaoSexual);
  const [mostrarOpcaoSexual, setMostrarOpcaoSexual] = useState(
    dados.mostrarOpcaoSexual
  );
  const [acao, setAcao] = useState<AcaoStatus>(dados.acao);
  const [detalheAcao, setDetalheAcao] = useState(dados.detalheAcao);
  const [sentimento, setSentimento] = useState<SentimentoStatus>(dados.sentimento);

  useEffect(() => {
    if (aberto) {
      setApelido(dados.apelido);
      setCorApelido(dados.corApelido);
      setOpcaoSexual(dados.opcaoSexual);
      setMostrarOpcaoSexual(dados.mostrarOpcaoSexual);
      setAcao(dados.acao);
      setDetalheAcao(dados.detalheAcao);
      setSentimento(dados.sentimento);
    }
  }, [aberto, dados]);

  if (!aberto) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apelidoLimpo = apelido.trim() || 'Lucky_07';
    onSalvar({
      apelido: apelidoLimpo,
      corApelido,
      opcaoSexual,
      mostrarOpcaoSexual,
      acao,
      detalheAcao: detalheAcao.trim(),
      sentimento,
    });
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-sky-400">Editar Status</h2>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg px-2.5 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Apelido (exposto com a ação no mapa)
          </label>
          <input
            type="text"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            placeholder="Ex.: Lucky_07"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none mb-2"
          />

          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Cor do apelido
          </span>
          <div className="flex flex-wrap gap-2">
            {CORES_APELIDO.map((item) => {
              const ativo = corApelido === item.valor;
              return (
                <button
                  key={item.valor}
                  type="button"
                  onClick={() => setCorApelido(item.valor)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
                    ativo
                      ? 'border-yellow-400 bg-slate-800 text-white'
                      : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full border ${item.amostraClass}`} />
                  <span>{item.rotulo}</span>
                </button>
              );
            })}
            <span className="inline-flex items-center rounded-xl border border-dashed border-slate-700 px-2.5 py-1.5 text-xs text-slate-500">
              + Outras na loja
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 space-y-2.5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Opção sexual (exibida apenas dentro dos detalhes)
          </span>
          <div className="flex flex-wrap gap-2">
            {OPCOES_SEXUAIS.map((item) => {
              const ativo = opcaoSexual === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOpcaoSexual(item)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition ${
                    ativo
                      ? 'border-sky-400 bg-sky-600 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item}
                </button>
              );
            })}
            <span className="inline-flex items-center rounded-xl border border-dashed border-slate-700 px-3 py-1.5 text-xs text-slate-500">
              + Outras na loja
            </span>
          </div>

          <label className="flex items-center justify-between pt-1 text-xs cursor-pointer">
            <span className="text-slate-200 font-medium">
              Mostrar opção sexual ao clicar nos detalhes
            </span>
            <input
              type="checkbox"
              checked={mostrarOpcaoSexual}
              onChange={(e) => setMostrarOpcaoSexual(e.target.checked)}
              className="h-4 w-4 accent-sky-500"
            />
          </label>
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Ação atual
          </span>
          <div className="flex flex-wrap gap-2 mb-2">
            {ACOES_PADRAO.map((item) => {
              const ativo = acao === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAcao(item)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold border transition ${
                    ativo
                      ? 'border-emerald-400 bg-emerald-600 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item}
                </button>
              );
            })}
            <span className="inline-flex items-center rounded-xl border border-dashed border-slate-700 px-3 py-2 text-xs text-slate-500">
              + Outras na loja
            </span>
          </div>

          <input
            type="text"
            value={detalheAcao}
            onChange={(e) => setDetalheAcao(e.target.value)}
            placeholder={
              acao === 'Ouvir'
                ? "Ex.: Guns n' Rose ou Guns n' Rose - November rain"
                : acao === 'Lendo'
                  ? 'Nome do livro'
                  : 'Nome do jogo'
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Como está se sentindo (1 ativo, demais sem cor)
          </span>
          <div className="grid grid-cols-4 gap-2">
            {SENTIMENTOS_PADRAO.map((item) => {
              const selecionado = sentimento === item.valor;
              return (
                <button
                  key={item.valor}
                  type="button"
                  onClick={() => setSentimento(item.valor)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 text-xs transition ${
                    selecionado
                      ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-500 grayscale opacity-45 hover:opacity-75'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="mt-1 font-medium">{item.rotulo}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Demais emoticons disponíveis na loja.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
          >
            Salvar status
          </button>
        </div>
      </form>
    </div>
  );
}