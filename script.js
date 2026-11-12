/* ==========================================================
   CONFIGURAÇÃO — edite só esta parte
   ========================================================== */

// Número do WhatsApp, só dígitos: 55 (Brasil) + DDD + número.
// Exemplo: (16) 99123-4567  ->  "5516991234567"
const WHATSAPP_NUMERO = "5516992038705";

// Mensagem que já aparece escrita quando o cliente abre a conversa.
const WHATSAPP_MENSAGEM =
  "Olá! Vi o site do Espaço de Lazer Esmeralda e gostaria de consultar a disponibilidade de datas.";

// Avaliações do Google Maps. Copie o texto EXATAMENTE como está no Google,
// sem alterar nem inventar. A ordem aqui não importa: o site mostra da melhor
// nota para a pior e, com a mesma nota, primeiro as de comentário mais longo.
// Com três ou mais avaliações elas passam em carrossel.
// Modelo ("quando" é opcional, por exemplo "em 2024"):
//   { nome: "Nome da pessoa", estrelas: 5, texto: "Texto da avaliação.", quando: "" },
const AVALIACOES = [
  {
    nome: "Carolina Sanchez",
    estrelas: 5,
    texto: "Amo esse lugar! Muito bem equipado e atendimento excepcional! Atualizaram com aquecedor de piscina, tá ótimo!",
  },
  {
    nome: "João de Souza Nery",
    estrelas: 5,
    texto: "Muito agradável,eu indiquei para vários amigos",
  },
  {
    nome: "Cláudio Vilapiano",
    estrelas: 5,
    texto: "Um cantinho pra lazer perfeito..",
  },
  {
    nome: "Nairta Andrea Santos",
    estrelas: 5,
    texto: "Maravilhoso o Espaço,amei",
  },
  {
    nome: "Márcia Lotti",
    estrelas: 5,
    texto: "Muito agradável",
  },
];

// Nota média e total de avaliações que aparecem na ficha do espaço no Google
// (conferidos em novembro de 2026). Atualize quando mudarem; com null, essa
// linha não aparece no site.
const AVALIACOES_NOTA = 4.7;
const AVALIACOES_TOTAL = 22;

// Link do botão "Ver todas no Google": abre a ficha do espaço no Google Maps.
const AVALIACOES_LINK = "https://www.google.com/maps?cid=6126375490193165085";

/* ========================================================== */


const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const doisDigitos = (n) => String(n).padStart(2, "0");


// Links do WhatsApp: todo elemento com o atributo data-whatsapp
const linkWhatsApp =
  "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(WHATSAPP_MENSAGEM);

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = linkWhatsApp;
  link.target = "_blank";
  link.rel = "noopener";
});

// Telefone mostrado na página, formatado a partir do número acima: (16) 99203-8705
const numeroLocal = WHATSAPP_NUMERO.replace(/^55/, "");
const telefone =
  "(" + numeroLocal.slice(0, 2) + ") " + numeroLocal.slice(2, -4) + "-" + numeroLocal.slice(-4);

document.querySelectorAll("[data-telefone]").forEach((el) => (el.textContent = telefone));


// Ao rolar: cabeçalho fica sólido e o botão flutuante aparece
const header = document.querySelector(".site-header");
const botaoFlutuante = document.querySelector(".wa-float");

function aoRolar() {
  const y = window.scrollY;
  header.classList.toggle("is-solid", y > 40);
  botaoFlutuante.classList.toggle("is-shown", y > 420);
}

aoRolar();
window.addEventListener("scroll", aoRolar, { passive: true });


// Ano no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();


// Esmeralda do topo girando em 3D
// A pedra é um sólido de verdade (lapidação esmeralda: mesa, coroa, cintura e
// pavilhão), desenhado em um <canvas> a cada quadro. Ela gira devagar em torno
// de um eixo inclinado, e cada faceta clareia ou escurece conforme fica de
// frente para a luz. Não usa biblioteca nenhuma, e para de desenhar quando o
// topo sai da tela. Sem JavaScript, ou para quem prefere menos movimento, fica
// o desenho parado que está no HTML.
(function () {
  const palco = document.querySelector(".gem-stage");
  const tela = palco && palco.querySelector(".gem-canvas");
  const ctx = tela && tela.getContext && tela.getContext("2d");
  if (!ctx || semMovimento) return;

  const VOLTA = 18000;                  // tempo de uma volta, em milissegundos
  const INCLINACAO = 20 * Math.PI / 180; // eixo de giro tombado para o lado
  const DE_FRENTE = 12 * Math.PI / 180;  // e um pouco para a frente
  const CAMERA = 1100;                   // distância da câmera (perspectiva suave)

  // A pedra em fatias, da frente para trás. Cada fatia é um octógono:
  // [meia largura, meia altura, chanfro do canto, profundidade]
  const FATIAS = [
    [65, 105, 25, 62],     // mesa (a face da frente)
    [105, 145, 42, 38],    // degrau da coroa
    [140, 180, 60, 6],     // cintura
    [140, 180, 60, -6],
    [100, 140, 40, -48],   // degraus do pavilhão
    [50, 95, 18, -92],
    [12, 58, 5, -114],     // quilha (a face de trás)
  ];

  const pontos = [];
  FATIAS.forEach(([a, b, c, z]) => {
    pontos.push(
      [-a + c, -b, z], [a - c, -b, z], [a, -b + c, z], [a, b - c, z],
      [a - c, b, z], [-a + c, b, z], [-a, b - c, z], [-a, -b + c, z]
    );
  });

  // Faces: a mesa, os degraus entre uma fatia e a seguinte, e a quilha
  const faces = [[0, 1, 2, 3, 4, 5, 6, 7]];
  for (let f = 0; f < FATIAS.length - 1; f++) {
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      faces.push([f * 8 + i, f * 8 + j, (f + 1) * 8 + j, (f + 1) * 8 + i]);
    }
  }
  const ultima = (FATIAS.length - 1) * 8;
  faces.push([7, 6, 5, 4, 3, 2, 1, 0].map((i) => ultima + i));

  const unitario = (v) => {
    const m = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / m, v[1] / m, v[2] / m];
  };
  const escalar = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  // Para cada face, a direção para onde ela aponta (para fora da pedra)
  const normais = faces.map((face) => {
    const [p, q, r] = [pontos[face[0]], pontos[face[1]], pontos[face[2]]];
    const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
    const v = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
    const n = unitario([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
    const centro = face.reduce((s, i) => [s[0] + pontos[i][0], s[1] + pontos[i][1], s[2] + pontos[i][2]], [0, 0, 0]);
    return escalar(n, centro) < 0 ? [-n[0], -n[1], -n[2]] : n;
  });

  // Luz principal (de cima, à esquerda), luz de apoio e direção do reflexo
  const LUZ = unitario([-0.45, -0.65, 0.62]);
  const APOIO = unitario([0.75, 0.25, 0.4]);
  const REFLEXO = unitario([LUZ[0], LUZ[1], LUZ[2] + 1]);

  // Tons de verde, do mais escuro ao mais claro
  const TONS = [[3, 38, 28], [7, 84, 58], [13, 146, 100], [38, 226, 166], [176, 255, 231]];

  function cor(claridade, reflexo, alfa) {
    const x = Math.max(0, Math.min(1, claridade)) * (TONS.length - 1);
    const i = Math.min(TONS.length - 2, Math.floor(x));
    const t = x - i;
    const canal = (k) => {
      const base = TONS[i][k] + (TONS[i + 1][k] - TONS[i][k]) * t;
      return Math.round(base + (255 - base) * reflexo);
    };
    return "rgba(" + canal(0) + "," + canal(1) + "," + canal(2) + "," + alfa + ")";
  }

  let largura = 0;
  let altura = 0;
  let escala = 1;

  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = Math.round(palco.clientWidth * dpr);
    altura = Math.round(palco.clientHeight * dpr);
    tela.width = largura;
    tela.height = altura;
    escala = altura / 490;   // a pedra, inclinada, ocupa uns 90% da altura
    desenhar(performance.now());
  }

  const girados = pontos.map(() => [0, 0, 0]);
  const naTela = pontos.map(() => [0, 0]);
  const normaisGiradas = faces.map(() => [0, 0, 0]);
  const deFrente = faces.map(() => false);

  function desenhar(agora) {
    const giro = agora / VOLTA * Math.PI * 2 - 0.5;
    const [cg, sg] = [Math.cos(giro), Math.sin(giro)];
    const [cf, sf] = [Math.cos(DE_FRENTE), Math.sin(DE_FRENTE)];
    const [ci, si] = [Math.cos(INCLINACAO), Math.sin(INCLINACAO)];

    // Gira em torno do eixo da pedra e depois tomba o eixo
    const girar = (p) => {
      const x1 = p[0] * cg + p[2] * sg;
      const z1 = -p[0] * sg + p[2] * cg;
      const y2 = p[1] * cf - z1 * sf;
      const z2 = p[1] * sf + z1 * cf;
      return [x1 * ci - y2 * si, x1 * si + y2 * ci, z2];
    };

    pontos.forEach((p, i) => {
      const g = girar(p);
      const perto = CAMERA / (CAMERA - g[2]);
      girados[i] = g;
      naTela[i][0] = largura / 2 + g[0] * perto * escala;
      naTela[i][1] = altura / 2 + g[1] * perto * escala;
    });

    ctx.clearRect(0, 0, largura, altura);
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1, escala * 1.6);

    faces.forEach((face, f) => {
      const n = girar(normais[f]);
      const p = girados[face[0]];
      normaisGiradas[f] = n;
      deFrente[f] = n[0] * -p[0] + n[1] * -p[1] + n[2] * (CAMERA - p[2]) > 0;
    });

    // Primeiro as faces de trás, vistas através da pedra; depois as da frente
    for (const frente of [false, true]) {
      faces.forEach((face, f) => {
        if (deFrente[f] !== frente) return;

        const n = normaisGiradas[f];
        const lado = frente ? 1 : -1;
        const luz = Math.max(0, escalar(n, LUZ) * lado);
        const apoio = Math.max(0, escalar(n, APOIO) * lado);
        const reflexo = frente ? Math.pow(Math.max(0, escalar(n, REFLEXO)), 26) * 0.85 : 0;
        const claridade = frente ? 0.14 + 0.78 * luz + 0.26 * apoio : 0.03 + 0.34 * luz + 0.1 * apoio;

        ctx.beginPath();
        face.forEach((i, k) => (k ? ctx.lineTo(naTela[i][0], naTela[i][1]) : ctx.moveTo(naTela[i][0], naTela[i][1])));
        ctx.closePath();
        ctx.fillStyle = cor(claridade, reflexo, frente ? 0.84 : 1);
        ctx.fill();
        ctx.strokeStyle = frente ? "rgba(228, 251, 241, " + (0.34 + 0.4 * luz) + ")" : "rgba(228, 251, 241, 0.1)";
        ctx.stroke();
      });
    }
  }

  // Só desenha enquanto o topo está na tela
  let naVista = true;
  let quadro = 0;

  function ciclo(agora) {
    quadro = 0;
    if (!naVista) return;
    desenhar(agora);
    quadro = requestAnimationFrame(ciclo);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entrada]) => {
      naVista = entrada.isIntersecting;
      if (naVista && !quadro) quadro = requestAnimationFrame(ciclo);
    }).observe(palco);
  }

  if ("ResizeObserver" in window) new ResizeObserver(medir).observe(palco);
  else window.addEventListener("resize", medir);

  medir();
  palco.classList.add("is-3d");
  quadro = requestAnimationFrame(ciclo);
})();


// Faixa de ocasiões: duplica a lista para correr sem emendas
const faixa = document.querySelector(".marquee-track");

if (faixa && !semMovimento) {
  const lista = faixa.querySelector(".marquee-list");
  for (let i = 0; i < 3; i++) {
    const copia = lista.cloneNode(true);
    copia.setAttribute("aria-hidden", "true");
    copia.removeAttribute("aria-label");
    faixa.appendChild(copia);
  }
  faixa.classList.add("is-running");
}


// Animação de entrada ao rolar
const animados = document.querySelectorAll(".reveal, .stagger");

if ("IntersectionObserver" in window && !semMovimento) {
  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("is-visible");
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  animados.forEach((el) => observer.observe(el));
} else {
  animados.forEach((el) => el.classList.add("is-visible"));
}


// Estrelas: devolve o HTML de 5 estrelas, com "nota" delas acesas
function htmlEstrelas(nota) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += '<svg class="icon-fill' + (i > nota ? " is-off" : "") +
      '" aria-hidden="true"><use href="#i-star"/></svg>';
  }
  return html;
}


// Carrossel (usado nas fotos e nas avaliações)
// O item do centro fica em destaque. Dá para arrastar, usar as setas (da tela
// ou do teclado) ou os marcadores embaixo; os itens passam sozinhos e, depois
// do último, o primeiro volta sem emendas. Para isso a fileira é montada três
// vezes e o carrossel sempre para no grupo do meio, que é o dos itens de verdade.
//
// Quem marca o tempo da troca automática é o marcador do item em destaque: ele
// tem uma barrinha com a animação "car-fill" (em style.css) e, quando ela
// enche, vem o próximo. A barrinha para com o mouse em cima, durante o arrasto,
// com o foco do teclado no carrossel, quando ele sai da tela e sempre que o
// código chama segurar().
//
// opcoes: raiz, visor, trilho (elementos), anterior, proxima, pausa (botões),
// oQue (texto do botão de pausa), aoVivo (elemento lido pelo leitor de tela),
// aoTrocar(indice, carrossel) e aoTocar(indice, evento, carrossel), este para
// o toque no item em destaque.
function criarCarrossel(opcoes) {
  const { raiz, visor, trilho } = opcoes;
  const reais = Array.from(trilho.children);
  const total = reais.length;
  const FOCAVEIS = "a[href], button";

  const carrossel = {
    total,
    reais,
    slides: reais,
    atual: 0,
    ir() {},
    mover() {},
    segurar() {},
  };

  // Com um ou dois itens não há o que girar: ficam parados, lado a lado
  if (total < 3) {
    raiz.classList.add("is-static");
    trilho.addEventListener("click", (e) => {
      const slide = e.target.closest("li");
      if (slide && opcoes.aoTocar) opcoes.aoTocar(reais.indexOf(slide), e, carrossel);
    });
    return carrossel;
  }

  function copiaDe(slide) {
    const copia = slide.cloneNode(true);
    copia.setAttribute("aria-hidden", "true");
    copia.querySelectorAll(FOCAVEIS).forEach((el) => (el.tabIndex = -1));
    return copia;
  }

  trilho.prepend(...reais.map(copiaDe));
  trilho.append(...reais.map(copiaDe));

  const slides = Array.from(trilho.children);
  carrossel.slides = slides;

  let pos = total;    // posição na fileira triplicada
  let periodo = 0;    // largura de um grupo de itens
  let atual = -1;     // item em destaque (0 = primeiro)

  // Posição atual da fileira na tela, mesmo no meio de uma animação
  function xAtual() {
    return new DOMMatrixReadOnly(getComputedStyle(trilho).transform).m41;
  }

  // Posição da fileira que deixa o slide "p" no centro
  function xDe(p) {
    const slide = slides[p];
    return visor.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);
  }

  function definirX(x, animar) {
    trilho.style.transition = animar ? "" : "none";
    trilho.style.transform = "translate3d(" + x + "px, 0, 0)";
    if (!animar) void trilho.offsetWidth;
  }

  function marcar() {
    const novo = pos % total;
    if (novo === atual) return;
    atual = novo;
    carrossel.atual = novo;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i % total === novo));
    if (opcoes.aoTrocar) opcoes.aoTrocar(novo, carrossel);
  }

  function irPara(p, animar) {
    // Se o destino cairia em uma cópia, a fileira primeiro salta um grupo inteiro
    // (os itens são idênticos, então ninguém vê) e só depois desliza
    const salto = p >= 2 * total ? -total : p < total ? total : 0;

    if (salto) {
      definirX(xAtual() - Math.sign(salto) * periodo, false);
      p += salto;
    }

    pos = p;
    marcar();
    definirX(xDe(p), animar);
  }

  function mover(passos) {
    irPara(pos + passos, true);
  }

  // Vai até o item pelo caminho mais curto
  function ir(indice) {
    let passos = indice - (pos % total);
    if (passos > total / 2) passos -= total;
    if (passos < -total / 2) passos += total;
    if (passos) mover(passos);
  }

  function medir() {
    periodo = slides[total].offsetLeft - slides[0].offsetLeft;
    definirX(xDe(pos), false);
  }

  raiz.classList.add("is-ready");
  medir();
  marcar();

  if ("ResizeObserver" in window) {
    new ResizeObserver(medir).observe(visor);
  } else {
    window.addEventListener("resize", medir);
  }

  // O foco do teclado em um item não pode deslocar a fileira por conta própria
  visor.addEventListener("scroll", () => {
    if (visor.scrollLeft) visor.scrollLeft = 0;
  });

  if (opcoes.anterior) opcoes.anterior.addEventListener("click", () => mover(-1));
  if (opcoes.proxima) opcoes.proxima.addEventListener("click", () => mover(1));

  raiz.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const focoNoItem = trilho.contains(document.activeElement);
    mover(e.key === "ArrowRight" ? 1 : -1);
    if (!focoNoItem) return;
    const alvo = reais[atual].querySelector(FOCAVEIS);
    if (alvo) alvo.focus({ preventScroll: true });
  });

  // Arrastar com o dedo ou com o mouse
  let arrasto = null;
  let fimDoArrasto = 0;

  visor.addEventListener("dragstart", (e) => e.preventDefault());

  visor.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    arrasto = { id: e.pointerId, inicio: e.clientX, base: 0, andou: 0, ativo: false };
  });

  visor.addEventListener("pointermove", (e) => {
    if (!arrasto || e.pointerId !== arrasto.id) return;

    if (!arrasto.ativo) {
      // O botão do mouse foi solto fora do carrossel antes de o arrasto começar
      if (e.pointerType === "mouse" && !(e.buttons & 1)) {
        arrasto = null;
        return;
      }

      if (Math.abs(e.clientX - arrasto.inicio) < 8) return;
      arrasto.ativo = true;
      arrasto.inicio = e.clientX;
      arrasto.base = xAtual();
      visor.setPointerCapture(e.pointerId);
      raiz.classList.add("is-dragging");
      segurar("arrasto", true);
    }

    arrasto.andou = e.clientX - arrasto.inicio;
    definirX(arrasto.base + arrasto.andou, false);
  });

  function soltarArrasto(e) {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    const { ativo, andou } = arrasto;
    arrasto = null;
    if (!ativo) return;

    fimDoArrasto = performance.now();
    raiz.classList.remove("is-dragging");
    segurar("arrasto", false);

    // Para no item mais perto do centro; um arrasto curto já basta para trocar
    const centro = visor.clientWidth / 2 - xAtual();
    let alvo = pos;
    let menor = Infinity;

    slides.forEach((slide, i) => {
      const distancia = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - centro);
      if (distancia < menor) {
        menor = distancia;
        alvo = i;
      }
    });

    if (alvo === pos && Math.abs(andou) > 40) alvo -= Math.sign(andou);
    irPara(alvo, true);
  }

  visor.addEventListener("pointerup", soltarArrasto);
  visor.addEventListener("pointercancel", soltarArrasto);

  // Toque no item em destaque faz a ação dele; toque em um vizinho traz ele para o centro
  trilho.addEventListener("click", (e) => {
    const slide = e.target.closest("li");
    if (!slide || performance.now() - fimDoArrasto < 350) return;

    if (!slide.classList.contains("is-active")) mover(slides.indexOf(slide) - pos);
    else if (opcoes.aoTocar) opcoes.aoTocar(atual, e, carrossel);
  });

  // Troca automática
  let tocando = !semMovimento;
  const esperas = new Set();

  function segurar(motivo, sim) {
    if (sim) esperas.add(motivo);
    else esperas.delete(motivo);
    raiz.classList.toggle("is-held", esperas.size > 0);
  }

  function atualizarPausa() {
    raiz.classList.toggle("is-playing", tocando);
    // Com os itens passando sozinhos, o leitor de tela não anuncia cada troca
    if (opcoes.aoVivo) opcoes.aoVivo.setAttribute("aria-live", tocando ? "off" : "polite");
    if (!opcoes.pausa) return;
    opcoes.pausa.setAttribute("aria-label", (tocando ? "Pausar" : "Retomar") + " a apresentação " + opcoes.oQue);
    opcoes.pausa.querySelector("use").setAttribute("href", tocando ? "#i-pause" : "#i-play");
  }

  if (opcoes.pausa) {
    opcoes.pausa.hidden = semMovimento;
    opcoes.pausa.addEventListener("click", () => {
      tocando = !tocando;
      atualizarPausa();
    });
  }

  raiz.addEventListener("animationend", (e) => {
    if (e.animationName === "car-fill") mover(1);
  });

  raiz.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") segurar("mouse", true);
  });
  raiz.addEventListener("pointerleave", () => segurar("mouse", false));

  raiz.addEventListener("focusin", (e) => {
    if (e.target.matches(":focus-visible")) segurar("foco", true);
  });
  raiz.addEventListener("focusout", () => segurar("foco", false));

  if ("IntersectionObserver" in window) {
    segurar("fora-da-tela", true);
    new IntersectionObserver(([entrada]) => {
      segurar("fora-da-tela", !entrada.isIntersecting);
    }, { threshold: 0.35 }).observe(visor);
  }

  atualizarPausa();

  carrossel.ir = ir;
  carrossel.mover = mover;
  carrossel.segurar = segurar;
  return carrossel;
}

// Liga os marcadores (miniaturas ou bolinhas) ao item em destaque
function marcarIndicadores(indicadores, indice) {
  indicadores.forEach((indicador, i) => {
    indicador.classList.toggle("is-active", i === indice);
    if (i === indice) indicador.setAttribute("aria-current", "true");
    else indicador.removeAttribute("aria-current");
  });
}


// Avaliações do Google: troca os cartões de carregamento pelos cartões reais
const secaoAvaliacoes = document.getElementById("avaliacoes");
const avCarrossel = document.getElementById("avaliacoes-carrossel");
const avLista = document.getElementById("avaliacoes-lista");
const avPontos = document.getElementById("avaliacoes-pontos");
const CORES_AVATAR = ["#1a73e8", "#9334e6", "#e8710a", "#188038", "#d93025", "#12b5cb"];

function criarAvaliacao(avaliacao, indice) {
  const estrelas = document.createElement("div");
  estrelas.className = "review-stars";
  estrelas.setAttribute("role", "img");
  estrelas.setAttribute("aria-label", avaliacao.estrelas + " de 5 estrelas");
  estrelas.innerHTML = htmlEstrelas(avaliacao.estrelas);

  // Comentários curtos aparecem em letra maior
  const texto = document.createElement("blockquote");
  texto.className = "review-text" +
    (avaliacao.texto.length <= 40 ? " is-short" : avaliacao.texto.length <= 120 ? " is-medium" : "");
  texto.textContent = avaliacao.texto;

  const mais = document.createElement("button");
  mais.className = "review-more";
  mais.type = "button";
  mais.hidden = true;
  mais.textContent = "Ver mais";

  const inicial = document.createElement("span");
  inicial.className = "review-avatar";
  inicial.setAttribute("aria-hidden", "true");
  inicial.style.backgroundColor = CORES_AVATAR[indice % CORES_AVATAR.length];
  inicial.textContent = avaliacao.nome.trim().charAt(0).toUpperCase();

  const nome = document.createElement("strong");
  nome.className = "review-name";
  nome.textContent = avaliacao.nome;

  const origem = document.createElement("span");
  origem.className = "review-meta";
  origem.textContent = "Avaliação no Google" + (avaliacao.quando ? " · " + avaliacao.quando : "");

  const quem = document.createElement("span");
  quem.className = "review-who";
  quem.append(nome, origem);

  const autor = document.createElement("footer");
  autor.className = "review-author";
  autor.append(inicial, quem);
  autor.insertAdjacentHTML("beforeend", '<svg class="review-g" aria-hidden="true"><use href="#i-google"/></svg>');

  const cartao = document.createElement("article");
  cartao.className = "review";
  cartao.insertAdjacentHTML("afterbegin", '<span class="review-quote" aria-hidden="true">“</span>');
  cartao.append(estrelas, texto, mais, autor);

  const slide = document.createElement("li");
  slide.className = "rv-slide";
  slide.append(cartao);
  return slide;
}

const avaliacoesValidas = AVALIACOES
  .filter((a) => a && a.nome && a.texto)
  .map((a) => Object.assign({}, a, { estrelas: Math.max(1, Math.min(5, Math.round(a.estrelas || 5))) }))
  .sort((a, b) => (b.estrelas - a.estrelas) || (b.texto.length - a.texto.length));

if (avaliacoesValidas.length) {
  avLista.replaceChildren(...avaliacoesValidas.map(criarAvaliacao));
  avLista.removeAttribute("aria-busy");
  document.getElementById("avaliacoes-link").href = AVALIACOES_LINK;

  if (AVALIACOES_NOTA && AVALIACOES_TOTAL) {
    document.getElementById("avaliacoes-nota").textContent =
      AVALIACOES_NOTA.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    document.getElementById("avaliacoes-estrelas").innerHTML = htmlEstrelas(Math.round(AVALIACOES_NOTA));
    document.getElementById("avaliacoes-total").textContent =
      AVALIACOES_TOTAL + (AVALIACOES_TOTAL === 1 ? " avaliação" : " avaliações") + " no Google";
    document.getElementById("avaliacoes-resumo").hidden = false;
  }

  // Bolinhas: uma por avaliação
  const pontos = avaliacoesValidas.map((avaliacao, indice) => {
    const ponto = document.createElement("button");
    ponto.type = "button";
    ponto.className = "rv-dot";
    ponto.setAttribute("aria-label", "Avaliação " + (indice + 1) + " de " + avaliacoesValidas.length + ": " + avaliacao.nome);
    ponto.append(document.createElement("span"));
    ponto.addEventListener("click", () => carAvaliacoes.ir(indice));
    return ponto;
  });

  avPontos.append(...pontos);

  const carAvaliacoes = criarCarrossel({
    raiz: avCarrossel,
    visor: avCarrossel.querySelector(".rv-viewport"),
    trilho: avLista,
    anterior: document.getElementById("avaliacoes-anterior"),
    proxima: document.getElementById("avaliacoes-proxima"),
    pausa: document.getElementById("avaliacoes-pausa"),
    oQue: "das avaliações",
    aoTrocar: (indice) => marcarIndicadores(pontos, indice),
    // "Ver mais" abre o texto inteiro (nas três cópias do cartão, para ficarem iguais)
    aoTocar: (indice, e, carrossel) => {
      if (!e.target.closest(".review-more")) return;
      carrossel.slides.forEach((slide, i) => {
        if (i % carrossel.total !== indice) return;
        const aberto = slide.querySelector(".review").classList.toggle("is-open");
        slide.querySelector(".review-more").textContent = aberto ? "Ver menos" : "Ver mais";
      });
    },
  });

  // "Ver mais" só aparece nos textos que não couberam no cartão
  const atualizarVerMais = () => {
    carAvaliacoes.slides.forEach((slide) => {
      if (slide.querySelector(".review").classList.contains("is-open")) return;
      const texto = slide.querySelector(".review-text");
      slide.querySelector(".review-more").hidden = texto.scrollHeight <= texto.clientHeight + 1;
    });
  };

  window.addEventListener("resize", atualizarVerMais);
  window.addEventListener("load", atualizarVerMais);
  atualizarVerMais();
} else {
  // Sem avaliações cadastradas, a seção e o link do menu somem
  secaoAvaliacoes.hidden = true;
  document.querySelectorAll(".nav-avaliacoes").forEach((link) => (link.hidden = true));
}


// O espaço: fotos em carrossel, cada uma com a sua legenda (título e texto, na
// mesma ordem das fotos). Tocar na foto em destaque amplia.
const galeria = document.getElementById("galeria");
const galTrilho = galeria.querySelector(".lux-track");
const galLegendas = Array.from(document.getElementById("galeria-legendas").children);
const galAnuncio = document.getElementById("galeria-anuncio");
const galMinis = document.getElementById("galeria-miniaturas");

const fotos = Array.from(galTrilho.children).map((slide, indice) => {
  const botao = slide.querySelector(".lux-photo");
  const img = botao.querySelector("img");
  const legenda = galLegendas[indice];
  return {
    src: botao.dataset.full || img.src,
    mini: img.getAttribute("src"),
    alt: img.alt,
    titulo: legenda ? legenda.querySelector("h3").textContent : "",
  };
});

// Miniaturas
const miniaturas = fotos.map((foto, indice) => {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "lux-thumb";
  botao.setAttribute("aria-label", "Foto " + (indice + 1) + ": " + foto.titulo);

  const img = document.createElement("img");
  img.src = foto.mini;
  img.alt = "";
  img.loading = "lazy";
  img.draggable = false;

  const barra = document.createElement("span");
  barra.className = "lux-thumb-bar";

  botao.append(img, barra);
  botao.addEventListener("click", () => carGaleria.ir(indice));
  return botao;
});

galMinis.append(...miniaturas);

const carGaleria = criarCarrossel({
  raiz: galeria,
  visor: galeria.querySelector(".lux-viewport"),
  trilho: galTrilho,
  anterior: document.getElementById("galeria-anterior"),
  proxima: document.getElementById("galeria-proxima"),
  pausa: document.getElementById("galeria-pausa"),
  oQue: "das fotos",
  aoVivo: galAnuncio,
  aoTocar: (indice) => abrirFoto(indice),
  aoTrocar: (indice, carrossel) => {
    marcarIndicadores(miniaturas, indice);

    // Só a foto em destaque entra na ordem do Tab
    carrossel.reais.forEach((slide, i) => (slide.querySelector(".lux-photo").tabIndex = i === indice ? 0 : -1));

    // Só a legenda da foto em destaque aparece; as outras continuam na página, escondidas
    galLegendas.forEach((legenda, i) => {
      legenda.classList.toggle("is-active", i === indice);
      if (i === indice) legenda.removeAttribute("aria-hidden");
      else legenda.setAttribute("aria-hidden", "true");
    });

    galAnuncio.textContent = "Foto " + (indice + 1) + " de " + fotos.length + ": " + fotos[indice].titulo;
  },
});

// Cada foto surge quando termina de carregar; até lá fica o esqueleto
carGaleria.slides.forEach((slide) => {
  const botao = slide.querySelector(".lux-photo");
  const img = botao.querySelector("img");
  const pronta = () => botao.classList.add("is-loaded");

  if (img.complete && img.naturalWidth) {
    pronta();
  } else {
    img.addEventListener("load", pronta);
    img.addEventListener("error", pronta);
  }
});

// As fotos (e as cópias) carregam todas de uma vez quando a galeria se aproxima
function carregarFotosDaGaleria() {
  carGaleria.slides.forEach((slide) => (slide.querySelector("img").loading = "eager"));
}

if ("IntersectionObserver" in window) {
  const pertoDaGaleria = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    carregarFotosDaGaleria();
    pertoDaGaleria.disconnect();
  }, { rootMargin: "900px 0px" });
  pertoDaGaleria.observe(galeria);
} else {
  carregarFotosDaGaleria();
}


// Mapa: o esqueleto some quando o mapa do Google termina de carregar
document.querySelectorAll(".map").forEach((mapa) => {
  const moldura = mapa.querySelector("iframe");
  moldura.addEventListener("load", () => mapa.classList.add("is-loaded"));
});


// Visualizador de fotos (lightbox)
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox.querySelector(".lb-img");
const lbTitulo = lightbox.querySelector(".lb-title");
const lbContador = lightbox.querySelector(".lb-count");
const lbAnterior = lightbox.querySelector(".lb-prev");
const lbProxima = lightbox.querySelector(".lb-next");
let fotoAtual = 0;

lbImg.addEventListener("load", () => lightbox.classList.remove("is-loading"));
lbImg.addEventListener("error", () => lightbox.classList.remove("is-loading"));

function mostrarFoto() {
  const foto = fotos[fotoAtual];

  // Anel de carregamento até a versão grande chegar
  if (lbImg.getAttribute("src") !== foto.src) {
    lightbox.classList.add("is-loading");
    lbImg.src = foto.src;
    if (lbImg.complete && lbImg.naturalWidth) lightbox.classList.remove("is-loading");
  }

  lbImg.alt = foto.alt;
  lbTitulo.textContent = foto.titulo;
  lbContador.textContent = doisDigitos(fotoAtual + 1) + " / " + doisDigitos(fotos.length);

  const varias = fotos.length > 1;
  lbAnterior.hidden = !varias;
  lbProxima.hidden = !varias;
}

function abrirFoto(indice) {
  fotoAtual = indice;
  mostrarFoto();
  if (!lightbox.open) lightbox.showModal();
  carGaleria.segurar("ampliada", true);
}

// Ao fechar, o carrossel fica na última foto vista e volta a passar sozinho
lightbox.addEventListener("close", () => {
  carGaleria.ir(fotoAtual);
  carGaleria.segurar("ampliada", false);
});

function trocarFoto(direcao) {
  fotoAtual = (fotoAtual + direcao + fotos.length) % fotos.length;
  mostrarFoto();
}

lbAnterior.addEventListener("click", () => trocarFoto(-1));
lbProxima.addEventListener("click", () => trocarFoto(1));
lightbox.querySelector(".lb-close").addEventListener("click", () => lightbox.close());

// Fechar ao clicar fora da foto
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});

// Setas do teclado
lightbox.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") trocarFoto(-1);
  if (e.key === "ArrowRight") trocarFoto(1);
});

// Deslizar no celular
let toqueInicio = null;

lightbox.addEventListener("touchstart", (e) => {
  toqueInicio = e.touches[0].clientX;
}, { passive: true });

lightbox.addEventListener("touchend", (e) => {
  if (toqueInicio === null) return;
  const distancia = e.changedTouches[0].clientX - toqueInicio;
  if (Math.abs(distancia) > 50 && fotos.length > 1) trocarFoto(distancia < 0 ? 1 : -1);
  toqueInicio = null;
});
