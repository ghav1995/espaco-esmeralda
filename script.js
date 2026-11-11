/* ==========================================================
   CONFIGURAÇÃO — edite só esta parte
   ========================================================== */

// Número do WhatsApp, só dígitos: 55 (Brasil) + DDD + número.
// Exemplo: (16) 99123-4567  ->  "5516991234567"
const WHATSAPP_NUMERO = "5516900000000";

// Mensagem que já aparece escrita quando o cliente abre a conversa.
const WHATSAPP_MENSAGEM =
  "Olá! Vi o site do Espaço de Lazer Esmeralda e gostaria de consultar a disponibilidade de datas.";

// Quantas fotos procurar na pasta images/ (foto-1.jpg, foto-2.jpg, ...).
// Fotos que não existirem são ignoradas automaticamente.
const TOTAL_FOTOS = 12;

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
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  animados.forEach((el) => observer.observe(el));
} else {
  animados.forEach((el) => el.classList.add("is-visible"));
}


// Galeria: procura images/foto-1.jpg ... foto-N.jpg e mostra as que existirem
const secaoFotos = document.getElementById("fotos");
const galeria = document.getElementById("galeria");
const fotos = [];

function verificarFoto(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const tentativas = [];
for (let i = 1; i <= TOTAL_FOTOS; i++) {
  tentativas.push(verificarFoto("images/foto-" + i + ".jpg"));
}

Promise.all(tentativas).then((resultado) => {
  resultado.filter(Boolean).forEach((src) => fotos.push(src));
  if (!fotos.length) return;

  fotos.forEach((src, indice) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "gallery-item";
    botao.setAttribute("aria-label", "Ampliar foto " + (indice + 1));

    const img = document.createElement("img");
    img.src = src;
    img.alt = "Foto " + (indice + 1) + " do Espaço de Lazer Esmeralda";
    img.decoding = "async";

    botao.appendChild(img);
    botao.addEventListener("click", () => abrirFoto(indice));
    galeria.appendChild(botao);
  });

  secaoFotos.hidden = false;
  document.querySelectorAll(".nav-fotos").forEach((link) => (link.hidden = false));
});


// Visualizador de fotos (lightbox)
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox.querySelector(".lb-img");
const lbContador = lightbox.querySelector(".lb-count");
const lbAnterior = lightbox.querySelector(".lb-prev");
const lbProxima = lightbox.querySelector(".lb-next");
let fotoAtual = 0;

function mostrarFoto() {
  lbImg.src = fotos[fotoAtual];
  lbImg.alt = "Foto " + (fotoAtual + 1) + " de " + fotos.length + " do Espaço de Lazer Esmeralda";
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
