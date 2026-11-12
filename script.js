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
// Modelo ("quando" é opcional, por exemplo "em 2024"):
//   { nome: "Nome da pessoa", estrelas: 5, texto: "Texto da avaliação.", quando: "" },
const AVALIACOES = [
  {
    nome: "Carolina Sanchez",
    estrelas: 5,
    texto: "Amo esse lugar! Muito bem equipado e atendimento excepcional! Atualizaram com aquecedor de piscina, tá ótimo!",
  },
  {
    nome: "Márcia Lotti",
    estrelas: 5,
    texto: "Muito agradável",
  },
  {
    nome: "kleber Ricardo Ramos",
    estrelas: 4,
    texto: "Bom",
  },
];

// Nota média e total de avaliações que aparecem na ficha do espaço no Google.
// Enquanto ficarem como null, essa linha não aparece no site.
const AVALIACOES_NOTA = null;   // exemplo: 4.8
const AVALIACOES_TOTAL = null;  // exemplo: 12

// Link do botão "Ver todas no Google". Troque pelo link da ficha do espaço no
// Google Maps (botão Compartilhar > Copiar link) para abrir direto nas avaliações.
const AVALIACOES_LINK =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Espaço de lazer Esmeralda, Ribeirão Preto - SP");

/* ========================================================== */


const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


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


// Avaliações do Google: troca os cartões de carregamento pelos cartões reais
const secaoAvaliacoes = document.getElementById("avaliacoes");
const listaAvaliacoes = document.getElementById("avaliacoes-lista");
const avAnterior = document.getElementById("avaliacoes-anterior");
const avProxima = document.getElementById("avaliacoes-proxima");
const CORES_AVATAR = ["#1a73e8", "#9334e6", "#e8710a", "#188038", "#d93025", "#12b5cb"];

function criarAvaliacao(avaliacao, indice) {
  const cartao = document.createElement("article");
  cartao.className = "review";

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

  const topo = document.createElement("header");
  topo.className = "review-top";
  topo.append(inicial, quem);
  topo.insertAdjacentHTML("beforeend", '<svg class="review-g" aria-hidden="true"><use href="#i-google"/></svg>');

  const estrelas = document.createElement("div");
  estrelas.className = "review-stars";
  estrelas.setAttribute("role", "img");
  estrelas.setAttribute("aria-label", avaliacao.estrelas + " de 5 estrelas");
  estrelas.innerHTML = htmlEstrelas(avaliacao.estrelas);

  const texto = document.createElement("blockquote");
  texto.className = "review-text";
  texto.textContent = avaliacao.texto;

  const mais = document.createElement("button");
  mais.className = "review-more";
  mais.type = "button";
  mais.hidden = true;
  mais.textContent = "Ver mais";
  mais.addEventListener("click", () => {
    const aberto = cartao.classList.toggle("is-open");
    mais.textContent = aberto ? "Ver menos" : "Ver mais";
  });

  cartao.append(topo, estrelas, texto, mais);
  return cartao;
}

// "Ver mais" só aparece nos textos que não couberam no cartão
function atualizarVerMais() {
  listaAvaliacoes.querySelectorAll(".review:not(.is-skeleton)").forEach((cartao) => {
    if (cartao.classList.contains("is-open")) return;
    const texto = cartao.querySelector(".review-text");
    cartao.querySelector(".review-more").hidden = texto.scrollHeight <= texto.clientHeight + 1;
  });
}

function atualizarSetasAvaliacoes() {
  const sobra = listaAvaliacoes.scrollWidth - listaAvaliacoes.clientWidth;
  const temMais = sobra > 4;
  avAnterior.hidden = !temMais;
  avProxima.hidden = !temMais;
  avAnterior.disabled = listaAvaliacoes.scrollLeft <= 4;
  avProxima.disabled = listaAvaliacoes.scrollLeft >= sobra - 4;
}

function rolarAvaliacoes(direcao) {
  const cartao = listaAvaliacoes.querySelector(".review");
  if (!cartao) return;
  const passo = cartao.offsetWidth + parseFloat(getComputedStyle(listaAvaliacoes).columnGap || 0);
  listaAvaliacoes.scrollBy({ left: direcao * passo, behavior: semMovimento ? "auto" : "smooth" });
}

function ajustarAvaliacoes() {
  atualizarVerMais();
  atualizarSetasAvaliacoes();
}

const avaliacoesValidas = AVALIACOES
  .filter((a) => a && a.nome && a.texto)
  .map((a) => Object.assign({}, a, { estrelas: Math.max(1, Math.min(5, Math.round(a.estrelas || 5))) }))
  .sort((a, b) => (b.estrelas - a.estrelas) || (b.texto.length - a.texto.length));

if (avaliacoesValidas.length) {
  listaAvaliacoes.replaceChildren(...avaliacoesValidas.map(criarAvaliacao));
  listaAvaliacoes.removeAttribute("aria-busy");
  document.getElementById("avaliacoes-link").href = AVALIACOES_LINK;

  if (AVALIACOES_NOTA && AVALIACOES_TOTAL) {
    document.getElementById("avaliacoes-nota").textContent =
      AVALIACOES_NOTA.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    document.getElementById("avaliacoes-estrelas").innerHTML = htmlEstrelas(Math.round(AVALIACOES_NOTA));
    document.getElementById("avaliacoes-total").textContent =
      AVALIACOES_TOTAL + (AVALIACOES_TOTAL === 1 ? " avaliação" : " avaliações");
    document.getElementById("avaliacoes-resumo").hidden = false;
  }

  avAnterior.addEventListener("click", () => rolarAvaliacoes(-1));
  avProxima.addEventListener("click", () => rolarAvaliacoes(1));
  listaAvaliacoes.addEventListener("scroll", atualizarSetasAvaliacoes, { passive: true });
  window.addEventListener("resize", ajustarAvaliacoes);
  window.addEventListener("load", ajustarAvaliacoes);
  ajustarAvaliacoes();
} else {
  // Sem avaliações cadastradas, a seção e o link do menu somem
  secaoAvaliacoes.hidden = true;
  document.querySelectorAll(".nav-avaliacoes").forEach((link) => (link.hidden = true));
}


// Galeria: cada foto surge quando termina de carregar; até lá fica o esqueleto
const itensGaleria = Array.from(document.querySelectorAll(".gallery-item"));

const fotos = itensGaleria.map((item) => {
  const img = item.querySelector("img");
  return { src: item.dataset.full || img.src, alt: img.alt };
});

itensGaleria.forEach((item, indice) => {
  const img = item.querySelector("img");
  const pronta = () => item.classList.add("is-loaded");

  if (img.complete && img.naturalWidth) {
    pronta();
  } else {
    img.addEventListener("load", pronta);
    img.addEventListener("error", pronta);
  }

  item.addEventListener("click", () => abrirFoto(indice));
});


// Mapa: o esqueleto some quando o mapa do Google termina de carregar
document.querySelectorAll(".map").forEach((mapa) => {
  const moldura = mapa.querySelector("iframe");
  moldura.addEventListener("load", () => mapa.classList.add("is-loaded"));
});


// Visualizador de fotos (lightbox)
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox.querySelector(".lb-img");
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
  lbContador.textContent = (fotoAtual + 1) + " / " + fotos.length;

  const varias = fotos.length > 1;
  lbAnterior.hidden = !varias;
  lbProxima.hidden = !varias;
}

function abrirFoto(indice) {
  fotoAtual = indice;
  mostrarFoto();
  if (!lightbox.open) lightbox.showModal();
}

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
