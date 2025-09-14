// ======================================
// LÓGICA DO PERFIL (CALCULADORA DE GESTAÇÃO)
// ======================================

// Definir a data prevista do parto
const dataParto = new Date("2026-04-04T00:00:00"); // Definido para o fim do dia
const dataInicioGestacao = new Date("2025-06-28T00:00:00"); // Definido como início do dia

// Função para formatar a data (Ex: 04 de Abril de 2026)
function formatarData(data) {
  return data.toLocaleDateString("pt-BR", { year: 'numeric', month: 'long', day: '2-digit' });
}

// Atualizar informações do perfil
function atualizarPerfil() {
  const hoje = new Date();
  
  // 1. Cálculo da Gestação (Progressivo)
  const diffMs = hoje - dataInicioGestacao;
  const diasGestacao = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const semanasGestacao = Math.floor(diasGestacao / 7);
  const diasExtrasGestacao = diasGestacao % 7;

  // 2. Cálculo do Restante (Regressivo)
  const diffMsRestantes = dataParto - hoje;
  const diasRestantes = Math.ceil(diffMsRestantes / (1000 * 60 * 60 * 24)); // Usamos ceil para contagem regressiva
  const semanasRestantes = Math.floor(diasRestantes / 7);
  const diasExtrasRestantes = diasRestantes % 7;

  // Tamanhos aproximados por semana (exemplo simplificado)
  const tamanhos = {
    10: { comprimento: "3.1 cm", peso: "4 g", fruta: "azeitona", animal: "besouro" },
    11: { comprimento: "4.1 cm", peso: "7 g", fruta: "figo", animal: "hamster" },
    12: { comprimento: "5.4 cm", peso: "14 g", fruta: "lima", animal: "ratinho" }, // Peso ajustado (exemplo)
    13: { comprimento: "7.4 cm", peso: "23 g", fruta: "ameixa", animal: "canário" },
    14: { comprimento: "8.7 cm", peso: "43 g", fruta: "limão siciliano", animal: "pardal" },
    15: { comprimento: "10 cm", peso: "70 g", fruta: "maçã", animal: "pássaro" },
    16: { comprimento: "11.6 cm", peso: "100 g", fruta: "abacate", animal: "pomba" },
    // Adicione mais semanas conforme necessário...
    20: { comprimento: "16.4 cm", peso: "300 g", fruta: "banana", animal: "gatinho" },
    25: { comprimento: "34.6 cm", peso: "660 g", fruta: "couve-flor", animal: "pato grande" },
    30: { comprimento: "39.9 cm", peso: "1.3 kg", fruta: "abacaxi", animal: "raposa pequena" },
    35: { comprimento: "46.2 cm", peso: "2.4 kg", fruta: "melancia pequena", animal: "beagle" },
    40: { comprimento: "51.8 cm", peso: "3.5 kg", fruta: "abóbora gigante", animal: "filhote de cachorro" }
  };
  
  // Escolher o tamanho baseado na semana atual
  const tamanhoAtual = tamanhos[semanasGestacao] || { comprimento: "–", peso: "–", fruta: "uma surpresa", animal: "um mistério" };

  // 3. Preencher no HTML com os novos IDs
  
  // Contador Progressivo (Semanas E Dias)
  document.getElementById("gestacao_semanas_dias").innerHTML = 
    `${semanasGestacao} <span class="contador-label-inline">sem</span> e ${diasExtrasGestacao} <span class="contador-label-inline">dias</span>`;

  // Contador Regressivo (Semanas E Dias)
  document.getElementById("contagem_regressiva").innerHTML = 
    `${semanasRestantes} <span class="contador-label-inline">sem</span> e ${diasExtrasRestantes} <span class="contador-label-inline">dias</span>`;

  // Informações secundárias
  document.getElementById("dias_totais").innerText = `(Total de ${diasGestacao} dias de jornada)`;
  document.getElementById("estimativa").innerText = `Data Prevista: ${formatarData(dataParto)}`;
  
  // Tamanho do bebê
  document.getElementById("tamanho").innerText =
    `Comprimento: ${tamanhoAtual.comprimento}, Peso: ${tamanhoAtual.peso} 
    (aprox. do tamanho de ${tamanhoAtual.fruta} ou de um(a) ${tamanhoAtual.animal})`;
}

// Chamar a função de atualização do perfil ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarPerfil();
    setInterval(atualizarPerfil, 1000 * 60 * 60); // Atualiza a cada hora
});


// ======================================
// LÓGICA DOS MOMENTOS (SISTEMA DE COMENTÁRIOS)
// ======================================

// Tenta carregar comentários do localStorage. Se não houver, começa um objeto vazio.
const comentariosData = JSON.parse(localStorage.getItem('momentosComentarios')) || {};

/**
 * Renderiza os comentários salvos para um post específico na tela.
 * @param {string} postId - O ID único do post (ex: "barriga-crescendo")
 */
function renderComentarios(postId) {
  // Encontra a lista (ul) correta, subindo do formulário para o card pai e depois descendo para a lista
  const comentariosLista = document.querySelector(`.comentario-form[data-post-id="${postId}"]`)
                                  .closest('.momento-card')
                                  .querySelector('.comentarios-lista');
  
  if (!comentariosLista) return; // Segurança caso o elemento não exista

  comentariosLista.innerHTML = ''; // Limpa os comentários existentes para não duplicar

  const postComentarios = comentariosData[postId] || [];
  
  postComentarios.forEach(comentario => {
    const li = document.createElement('li');
    // Adiciona o HTML do comentário, tratando os valores para evitar XSS (embora simples aqui)
    const nomeSeguro = document.createTextNode(comentario.nome).textContent;
    const textoSeguro = document.createTextNode(comentario.texto).textContent;
    li.innerHTML = `<strong>${nomeSeguro}:</strong> ${textoSeguro}`;
    comentariosLista.appendChild(li);
  });

  // Scroll para o último comentário se a lista for muito longa
  comentariosLista.scrollTop = comentariosLista.scrollHeight;
}

/**
 * Adiciona um novo comentário aos dados e ao localStorage.
 * @param {string} postId - ID do post.
 * @param {string} nome - Nome do usuário.
 * @param {string} texto - O comentário.
 */
function addComentario(postId, nome, texto) {
  if (!comentariosData[postId]) {
    comentariosData[postId] = []; // Cria o array para este post se for o primeiro comentário
  }
  
  comentariosData[postId].push({ nome, texto, timestamp: new Date().toISOString() });
  
  // Salva a estrutura inteira de comentários no localStorage
  localStorage.setItem('momentosComentarios', JSON.stringify(comentariosData));
  
  // Atualiza a tela
  renderComentarios(postId);
}

// Adiciona event listeners para TODOS os formulários de comentário da página
document.querySelectorAll('.comentario-form').forEach(form => {
  const postId = form.dataset.postId;
  
  // 1. Renderiza comentários existentes assim que a página carregar
  renderComentarios(postId); 

  // 2. Adiciona o listener para o envio (submit) do formulário
  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página
    
    const nomeInput = this.querySelector('.comentario-nome');
    const textoInput = this.querySelector('.comentario-texto');

    const nome = nomeInput.value.trim();
    const texto = textoInput.value.trim();

    if (nome && texto) {
      addComentario(postId, nome, texto);
      // nomeInput.value = ''; // Opcional: manter o nome para comentários múltiplos
      textoInput.value = ''; // Limpa o texto
    } else {
      alert('Por favor, preencha seu nome e o comentário.');
    }
  });
});