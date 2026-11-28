import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { decompressFrames, parseGIF } from 'gifuct-js';

export type TipoItemQuarto3D =
  | 'tv'
  | 'cama'
  | 'poster'
  | 'estante'
  | 'rack'
  | 'porta'
  | 'janela';

export interface PosicaoItem3D {
  x: number;
  z: number;
}

export interface DecoracaoEstante3D {
  livros: boolean;
  objetos: boolean;
}

export interface DadosQuarto3D {
  corParedeHex: string;
  corParedeBorda: string;
  itens: Record<TipoItemQuarto3D, boolean>;
  posicoesItens?: Record<TipoItemQuarto3D, PosicaoItem3D>;
  estante?: DecoracaoEstante3D;
  fotoPoster: string;
  gifTv?: string;
  rotacaoY?: number;
  rotacaoX?: number;
  zoom?: number;
}

interface Quarto3DProps {
  dados: DadosQuarto3D;
}

interface ParedeDinamicaProps {
  posicao: [number, number, number];
  tamanho: [number, number, number];
  cor: string;
}

interface QuadroGif {
  canvas: HTMLCanvasElement;
  delayMs: number;
}

const POSICOES_PADRAO_ITENS: Record<TipoItemQuarto3D, PosicaoItem3D> = {
  cama: { x: 0, z: 1.25 },
  estante: { x: 0, z: 2.65 },
  tv: { x: 2.9, z: -0.6 },
  rack: { x: 2.65, z: -0.6 },
  poster: { x: -2.9, z: -0.6 },
  porta: { x: -1.35, z: -2.9 },
  janela: { x: 1.25, z: -2.9 },
};

function rotacaoPorPosicao(pos: PosicaoItem3D): [number, number, number] {
  if (pos.x <= -2.55) return [0, Math.PI / 2, 0];
  if (pos.x >= 2.55) return [0, -Math.PI / 2, 0];
  return [0, 0, 0];
}

function PortaNoQuarto({ pos }: { pos: PosicaoItem3D }) {
  const rotacao = rotacaoPorPosicao(pos);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={rotacao}>
      <mesh position={[0, 1.05, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.04, 2.1, 0.08]} />
        <meshStandardMaterial color="#3f2716" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.02, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 2.0, 0.06]} />
        <meshStandardMaterial color="#854d27" roughness={0.6} />
      </mesh>
      <mesh position={[0.34, 1.0, 0.09]} castShadow>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function JanelaNoQuarto({ pos }: { pos: PosicaoItem3D }) {
  const rotacao = rotacaoPorPosicao(pos);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={rotacao}>
      <mesh position={[0, 2.15, 0.03]} castShadow>
        <boxGeometry args={[1.56, 0.1, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.05, 0.03]} castShadow>
        <boxGeometry args={[1.62, 0.1, 0.12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      <mesh position={[-0.73, 1.6, 0.03]} castShadow>
        <boxGeometry args={[0.1, 1.02, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      <mesh position={[0.73, 1.6, 0.03]} castShadow>
        <boxGeometry args={[0.1, 1.02, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.6, 0.025]}>
        <planeGeometry args={[1.38, 0.94]} />
        <meshStandardMaterial
          color="#7dd3fc"
          transparent
          opacity={0.55}
          roughness={0.15}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 1.6, 0.04]}>
        <boxGeometry args={[0.04, 0.94, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>
    </group>
  );
}

function ParedeDinamica({ posicao, tamanho, cor }: ParedeDinamicaProps) {
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const posParede = useRef(new THREE.Vector3(...posicao));
  const centroQuarto = useRef(new THREE.Vector3(0, 1.1, 0));

  useFrame(({ camera }) => {
    if (!matRef.current) return;

    const distCamParede = camera.position.distanceTo(posParede.current);
    const distCamCentro = camera.position.distanceTo(centroQuarto.current);
    const estaNaFrente = distCamParede < distCamCentro - 0.35;

    matRef.current.transparent = estaNaFrente;
    matRef.current.opacity = estaNaFrente ? 0.08 : 1;
    matRef.current.depthWrite = !estaNaFrente;
    matRef.current.needsUpdate = true;
  });

  return (
    <mesh position={posicao} receiveShadow>
      <boxGeometry args={tamanho} />
      <meshStandardMaterial
        ref={matRef}
        color={cor}
        roughness={0.75}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function ControleCameraSincronizado({
  rotacaoY,
  rotacaoX,
  zoom,
}: {
  rotacaoY?: number;
  rotacaoX?: number;
  zoom?: number;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();
  const ultimoRotY = useRef<number | undefined>(undefined);
  const ultimoRotX = useRef<number | undefined>(undefined);
  const ultimoZoom = useRef<number | undefined>(undefined);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const mudouRot =
      (rotacaoY !== undefined && rotacaoY !== ultimoRotY.current) ||
      (rotacaoX !== undefined && rotacaoX !== ultimoRotX.current);

    const mudouZoom = zoom !== undefined && zoom !== ultimoZoom.current;

    if (mudouRot || mudouZoom) {
      const angY = THREE.MathUtils.degToRad(rotacaoY ?? 0);
      const angX = THREE.MathUtils.degToRad(
        Math.max(5, Math.min(75, 28 - (rotacaoX ?? 12)))
      );
      const fatorZoom = zoom && zoom > 0 ? zoom : 1;
      const distancia = THREE.MathUtils.clamp(6.8 / fatorZoom, 2.4, 18);

      const alvo = controls.target;
      const horizontal = distancia * Math.cos(angX);
      camera.position.set(
        alvo.x + horizontal * Math.sin(angY),
        alvo.y + distancia * Math.sin(angX),
        alvo.z + horizontal * Math.cos(angY)
      );
      camera.lookAt(alvo);
      controls.update();

      ultimoRotY.current = rotacaoY;
      ultimoRotX.current = rotacaoX;
      ultimoZoom.current = zoom;
    }
  }, [camera, rotacaoY, rotacaoX, zoom]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 1.1, 0]}
      enablePan={false}
      minDistance={2.4}
      maxDistance={18}
      maxPolarAngle={Math.PI / 2 - 0.08}
    />
  );
}

function PosterComFoto({
  fotoUrl,
  pos,
}: {
  fotoUrl: string;
  pos: PosicaoItem3D;
}) {
  const [textura, setTextura] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!fotoUrl) {
      setTextura((anterior) => {
        anterior?.dispose();
        return null;
      });
      return;
    }

    let cancelado = false;
    const imagem = new Image();
    imagem.crossOrigin = 'anonymous';

    imagem.onload = () => {
      if (cancelado) return;
      const novaTextura = new THREE.Texture(imagem);
      novaTextura.colorSpace = THREE.SRGBColorSpace;
      novaTextura.needsUpdate = true;

      setTextura((anterior) => {
        anterior?.dispose();
        return novaTextura;
      });
    };

    imagem.onerror = () => {
      if (cancelado) return;
      setTextura((anterior) => {
        anterior?.dispose();
        return null;
      });
    };

    imagem.src = fotoUrl;

    return () => {
      cancelado = true;
    };
  }, [fotoUrl]);

  useEffect(() => {
    return () => {
      textura?.dispose();
    };
  }, [textura]);

  return (
    <group position={[pos.x, 1.85, pos.z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.75, 0.08]} />
        <meshStandardMaterial color="#f5d08a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.2, 1.6]} />
        {textura ? (
          <meshBasicMaterial map={textura} side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial
            color="#475569"
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>
    </group>
  );
}

function TvNaParede({
  gifUrl,
  pos,
}: {
  gifUrl?: string;
  pos: PosicaoItem3D;
}) {
  const [quadros, setQuadros] = useState<QuadroGif[]>([]);
  const [texturaTela, setTexturaTela] = useState<THREE.CanvasTexture | null>(
    null
  );
  const [texturaImagemFallback, setTexturaImagemFallback] =
    useState<THREE.Texture | null>(null);
  const indiceQuadroRef = useRef(0);
  const acumuladorMsRef = useRef(0);
  const canvasDestinoRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!gifUrl) {
      setQuadros([]);
      setTexturaImagemFallback((anterior) => {
        anterior?.dispose();
        return null;
      });
      return;
    }

    let cancelado = false;

    const carregarFallbackImagem = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (cancelado) return;
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setTexturaImagemFallback((anterior) => {
          anterior?.dispose();
          return tex;
        });
      };
      img.onerror = () => {
        if (cancelado) return;
        setTexturaImagemFallback((anterior) => {
          anterior?.dispose();
          return null;
        });
      };
      img.src = gifUrl;
    };

    async function carregarGif() {
      try {
        const resposta = await fetch(gifUrl as string);
        if (!resposta.ok) {
          throw new Error('Falha ao buscar GIF');
        }
        const buffer = await resposta.arrayBuffer();
        if (cancelado) return;

        const gif = parseGIF(buffer);
        const frames = decompressFrames(gif, true);
        if (!frames.length || cancelado) {
          throw new Error('Sem quadros no GIF');
        }

        const largura = gif.lsd.width || frames[0]?.dims.width || 320;
        const altura = gif.lsd.height || frames[0]?.dims.height || 180;

        const acumuladorCanvas = document.createElement('canvas');
        acumuladorCanvas.width = largura;
        acumuladorCanvas.height = altura;
        const acumCtx = acumuladorCanvas.getContext('2d');
        if (!acumCtx) {
          throw new Error('Sem contexto 2D');
        }

        const framesProntos: QuadroGif[] = [];

        for (const frame of frames) {
          const {
            left = 0,
            top = 0,
            width = largura,
            height = altura,
          } = frame.dims;

          if (frame.disposalType === 2) {
            acumCtx.clearRect(left, top, width, height);
          }

          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = Math.max(1, width);
          frameCanvas.height = Math.max(1, height);
          const frameCtx = frameCanvas.getContext('2d');
          if (!frameCtx) continue;

          const imageData = frameCtx.createImageData(
            Math.max(1, width),
            Math.max(1, height)
          );
          imageData.data.set(frame.patch);
          frameCtx.putImageData(imageData, 0, 0);

          acumCtx.drawImage(frameCanvas, left, top);

          const saidaFrame = document.createElement('canvas');
          saidaFrame.width = largura;
          saidaFrame.height = altura;
          const saidaCtx = saidaFrame.getContext('2d');
          if (!saidaCtx) continue;

          saidaCtx.fillStyle = '#0f172a';
          saidaCtx.fillRect(0, 0, largura, altura);
          saidaCtx.drawImage(acumuladorCanvas, 0, 0);

          const delayCentissegundos = frame.delay ?? 8;
          const delayMs =
            delayCentissegundos <= 1 ? 80 : delayCentissegundos * 10;

          framesProntos.push({
            canvas: saidaFrame,
            delayMs: Math.max(25, delayMs),
          });
        }

        if (!framesProntos.length || cancelado) {
          throw new Error('Nenhum quadro válido gerado');
        }

        indiceQuadroRef.current = 0;
        acumuladorMsRef.current = 0;

        const telaCanvas = document.createElement('canvas');
        telaCanvas.width = largura;
        telaCanvas.height = altura;
        const telaCtx = telaCanvas.getContext('2d');
        if (telaCtx) {
          telaCtx.drawImage(framesProntos[0].canvas, 0, 0);
        }
        canvasDestinoRef.current = telaCanvas;

        const novaTextura = new THREE.CanvasTexture(telaCanvas);
        novaTextura.colorSpace = THREE.SRGBColorSpace;
        novaTextura.needsUpdate = true;

        setTexturaTela((anterior) => {
          anterior?.dispose();
          return novaTextura;
        });
        setTexturaImagemFallback((anterior) => {
          anterior?.dispose();
          return null;
        });
        setQuadros(framesProntos);
      } catch (err) {
        console.warn('Erro ao carregar GIF da TV:', err);
        if (!cancelado) {
          setQuadros([]);
          carregarFallbackImagem();
        }
      }
    }

    carregarGif();

    return () => {
      cancelado = true;
    };
  }, [gifUrl]);

  useEffect(() => {
    return () => {
      texturaTela?.dispose();
    };
  }, [texturaTela]);

  useEffect(() => {
    return () => {
      texturaImagemFallback?.dispose();
    };
  }, [texturaImagemFallback]);

  useFrame((_, delta) => {
    if (!quadros.length || !texturaTela || !canvasDestinoRef.current) return;

    acumuladorMsRef.current += delta * 1000;
    const quadroAtual = quadros[indiceQuadroRef.current] ?? quadros[0];

    if (acumuladorMsRef.current >= quadroAtual.delayMs) {
      acumuladorMsRef.current %= quadroAtual.delayMs;
      indiceQuadroRef.current = (indiceQuadroRef.current + 1) % quadros.length;

      const proximoQuadro = quadros[indiceQuadroRef.current];
      const ctx = canvasDestinoRef.current.getContext('2d');
      if (ctx && proximoQuadro) {
        ctx.clearRect(
          0,
          0,
          canvasDestinoRef.current.width,
          canvasDestinoRef.current.height
        );
        ctx.drawImage(proximoQuadro.canvas, 0, 0);
        texturaTela.needsUpdate = true;
      }
    }
  });

  const texturaAtiva =
    texturaTela && quadros.length > 0 ? texturaTela : texturaImagemFallback;

  return (
    <group position={[pos.x, 1.85, pos.z]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.85, 1.08, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[1.68, 0.92]} />
        {texturaAtiva ? (
          <meshBasicMaterial
            key={texturaAtiva.uuid}
            map={texturaAtiva}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshBasicMaterial color="#2563eb" side={THREE.DoubleSide} />
        )}
      </mesh>
    </group>
  );
}

function RackComPs5({ pos }: { pos: PosicaoItem3D }) {
  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.5, 0.45]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.26, 0.03]}>
        <boxGeometry args={[1.68, 0.24, 0.42]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      <group position={[-0.45, 0.55, 0]}>
        <mesh position={[0, 0.24, 0]} castShadow>
          <boxGeometry args={[0.14, 0.48, 0.26]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[-0.085, 0.24, 0.015]} castShadow>
          <boxGeometry args={[0.025, 0.5, 0.29]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} />
        </mesh>
        <mesh position={[0.085, 0.24, -0.015]} castShadow>
          <boxGeometry args={[0.025, 0.5, 0.29]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} />
        </mesh>
      </group>

      <group position={[0.25, 0.59, 0.04]} rotation={[0, 0.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.07, 0.14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.02, 0.02]}>
          <boxGeometry args={[0.1, 0.04, 0.11]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function EstanteAtrasCama({
  pos,
  decoracao,
}: {
  pos: PosicaoItem3D;
  decoracao: DecoracaoEstante3D;
}) {
  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, Math.PI, 0]}>
      <mesh position={[-0.78, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.8, 0.36]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.7} />
      </mesh>
      <mesh position={[0.78, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.8, 0.36]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.9, -0.16]} receiveShadow>
        <boxGeometry args={[1.5, 1.8, 0.03]} />
        <meshStandardMaterial color="#3f2716" roughness={0.85} />
      </mesh>

      {[0.12, 0.62, 1.12, 1.62].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.06, 0.34]} />
          <meshStandardMaterial color="#784b2a" roughness={0.65} />
        </mesh>
      ))}

      {decoracao.livros && (
        <group>
          <mesh position={[-0.45, 0.28, 0.02]} castShadow>
            <boxGeometry args={[0.07, 0.26, 0.2]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          <mesh position={[-0.36, 0.27, 0.02]} castShadow>
            <boxGeometry args={[0.06, 0.24, 0.2]} />
            <meshStandardMaterial color="#2563eb" roughness={0.6} />
          </mesh>
          <mesh position={[-0.28, 0.29, 0.02]} castShadow>
            <boxGeometry args={[0.07, 0.28, 0.2]} />
            <meshStandardMaterial color="#16a34a" roughness={0.6} />
          </mesh>
          <mesh position={[0.35, 0.77, 0.02]} castShadow>
            <boxGeometry args={[0.07, 0.25, 0.2]} />
            <meshStandardMaterial color="#eab308" roughness={0.6} />
          </mesh>
          <mesh position={[0.44, 0.76, 0.02]} castShadow>
            <boxGeometry args={[0.06, 0.23, 0.2]} />
            <meshStandardMaterial color="#9333ea" roughness={0.6} />
          </mesh>
        </group>
      )}

      {decoracao.objetos && (
        <group>
          <mesh position={[0.38, 0.26, 0.02]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.24, 16]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.35} />
          </mesh>
          <mesh position={[-0.36, 1.26, 0.02]} castShadow>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0.25, 1.76, 0.02]} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function CamaNoQuarto({ pos }: { pos: PosicaoItem3D }) {
  return (
    <group position={[pos.x, 0, pos.z]}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.36, 2.4]} />
        <meshStandardMaterial color="#7e22ce" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.72, -1.12]} castShadow receiveShadow>
        <boxGeometry args={[2.16, 0.85, 0.16]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[-0.48, 0.54, -0.78]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.16, 0.45]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      <mesh position={[0.48, 0.54, -0.78]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.16, 0.45]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function Quarto3D({ dados }: Quarto3DProps) {
  const posicoes = dados.posicoesItens ?? POSICOES_PADRAO_ITENS;
  const decoracaoEstante = dados.estante ?? { livros: false, objetos: false };

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.3, 6.8], fov: 45 }}
      >
        <color attach="background" args={['#090d16']} />
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[6, 6]} />
          <meshStandardMaterial color="#27272a" roughness={0.85} />
        </mesh>

        <ParedeDinamica
          posicao={[0, 1.8, -3]}
          tamanho={[6, 3.6, 0.15]}
          cor={dados.corParedeHex}
        />

        <ParedeDinamica
          posicao={[-3, 1.8, 0]}
          tamanho={[0.15, 3.6, 6]}
          cor={dados.corParedeHex}
        />

        <ParedeDinamica
          posicao={[3, 1.8, 0]}
          tamanho={[0.15, 3.6, 6]}
          cor={dados.corParedeHex}
        />

        <mesh position={[0, 0.06, -2.91]}>
          <boxGeometry args={[5.9, 0.12, 0.04]} />
          <meshStandardMaterial color={dados.corParedeBorda} roughness={0.6} />
        </mesh>

        {dados.itens.porta && (
          <PortaNoQuarto pos={posicoes.porta ?? POSICOES_PADRAO_ITENS.porta} />
        )}
        {dados.itens.janela && (
          <JanelaNoQuarto
            pos={posicoes.janela ?? POSICOES_PADRAO_ITENS.janela}
          />
        )}
        {dados.itens.poster && (
          <PosterComFoto
            fotoUrl={dados.fotoPoster}
            pos={posicoes.poster ?? POSICOES_PADRAO_ITENS.poster}
          />
        )}
        {dados.itens.tv && (
          <TvNaParede
            gifUrl={dados.gifTv}
            pos={posicoes.tv ?? POSICOES_PADRAO_ITENS.tv}
          />
        )}
        {dados.itens.rack && (
          <RackComPs5 pos={posicoes.rack ?? POSICOES_PADRAO_ITENS.rack} />
        )}
        {dados.itens.cama && (
          <CamaNoQuarto pos={posicoes.cama ?? POSICOES_PADRAO_ITENS.cama} />
        )}
        {dados.itens.estante && (
          <EstanteAtrasCama
            pos={posicoes.estante ?? POSICOES_PADRAO_ITENS.estante}
            decoracao={decoracaoEstante}
          />
        )}

        <ControleCameraSincronizado
          rotacaoY={dados.rotacaoY}
          rotacaoX={dados.rotacaoX}
          zoom={dados.zoom}
        />
      </Canvas>
    </div>
  );
}