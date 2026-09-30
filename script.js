// ==========================================================================
// Gerador de Ingresso para Conferência - Lógica JavaScript
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM - Formulário
  const ticketForm = document.getElementById('ticket-form');
  const formSection = document.getElementById('form-section');
  const formHeaderText = document.getElementById('form-header-text');
  
  // Elementos do DOM - Upload de Avatar
  const uploadArea = document.getElementById('upload-area');
  const avatarInput = document.getElementById('avatar-input');
  const uploadPrompt = document.getElementById('upload-prompt');
  const uploadPreviewWrapper = document.getElementById('upload-preview-wrapper');
  const avatarPreviewImg = document.getElementById('avatar-preview-img');
  const btnRemoveAvatar = document.getElementById('btn-remove-avatar');
  const btnChangeAvatar = document.getElementById('btn-change-avatar');
  const avatarHint = document.getElementById('avatar-hint');
  const avatarHintText = document.getElementById('avatar-hint-text');

  // Elementos do DOM - Inputs de Texto
  const fullNameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('email');
  const githubInput = document.getElementById('github-user');

  // Elementos de Mensagem de Erro
  const nameHint = document.getElementById('name-hint');
  const emailHint = document.getElementById('email-hint');
  const githubHint = document.getElementById('github-hint');

  // Elementos do DOM - Resultado do Ingresso Gerado
  const ticketSection = document.getElementById('ticket-section');
  const ticketHeaderText = document.getElementById('ticket-header-text');
  const congratsName = document.getElementById('congrats-name');
  const congratsEmail = document.getElementById('congrats-email');
  const ticketUserAvatar = document.getElementById('ticket-user-avatar');
  const ticketUserName = document.getElementById('ticket-user-name');
  const ticketUserHandle = document.getElementById('ticket-user-handle');
  const ticketNumber = document.getElementById('ticket-number');

  // Armazenamento da foto em Base64 ou URL
  let userAvatarUrl = '';

  // ------------------------------------------------------------------------
  // LÓGICA DE UPLOAD DE AVATAR (Drag and Drop / Clique)
  // ------------------------------------------------------------------------
  uploadArea.addEventListener('click', (e) => {
    // Evita abrir se clicou nos botões de remover/trocar
    if (e.target.id === 'btn-remove-avatar' || e.target.id === 'btn-change-avatar') return;
    avatarInput.click();
  });

  // Eventos de Drag & Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('dragover');
    });
  });

  uploadArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleAvatarFile(files[0]);
    }
  });

  avatarInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleAvatarFile(e.target.files[0]);
    }
  });

  // Função para processar o arquivo de imagem selecionado
  function handleAvatarFile(file) {
    // Validação de formato (JPG ou PNG)
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showAvatarError('Only JPG or PNG images are allowed.');
      return;
    }

    // Validação de tamanho (máximo 500KB = 500 * 1024 bytes)
    const maxSizeInBytes = 500 * 1024;
    if (file.size > maxSizeInBytes) {
      showAvatarError('File too large. Please upload an image under 500KB.');
      return;
    }

    // Converter a imagem do upload pra Base64 pra conseguir mostrar a previa na tela sem precisar de backend
    const reader = new FileReader();
    reader.onload = (e) => {
      userAvatarUrl = e.target.result;
      avatarPreviewImg.src = userAvatarUrl;
      uploadPrompt.classList.add('hidden');
      uploadPreviewWrapper.classList.remove('hidden');
      resetAvatarHint();
    };
    reader.readAsDataURL(file);
  }

  // Botões de Remover / Alterar Imagem
  btnRemoveAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    resetAvatarUpload();
  });

  btnChangeAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarInput.click();
  });

  function resetAvatarUpload() {
    userAvatarUrl = '';
    avatarInput.value = '';
    avatarPreviewImg.src = '';
    uploadPreviewWrapper.classList.add('hidden');
    uploadPrompt.classList.remove('hidden');
    resetAvatarHint();
  }

  function showAvatarError(message) {
    avatarHint.classList.add('error-hint');
    avatarHintText.textContent = message;
  }

  function resetAvatarHint() {
    avatarHint.classList.remove('error-hint');
    avatarHintText.textContent = 'Upload your photo (JPG or PNG, max size: 500KB).';
  }

  // ------------------------------------------------------------------------
  // LÓGICA DE VALIDAÇÃO DO FORMULÁRIO
  // ------------------------------------------------------------------------
  ticketForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // 1. Validar Avatar
    if (!userAvatarUrl) {
      showAvatarError('Please upload an avatar image.');
      isValid = false;
    }

    // 2. Validar Nome Completo
    const fullNameValue = fullNameInput.value.trim();
    if (!fullNameValue) {
      showFieldError(fullNameInput, nameHint, 'Please enter your full name.');
      isValid = false;
    } else {
      clearFieldError(fullNameInput, nameHint);
    }

    // 3. Validar E-mail (Regex)
    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailRegex.test(emailValue)) {
      showFieldError(emailInput, emailHint, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput, emailHint);
    }

    // 4. Validar Usuário do GitHub
    let githubValue = githubInput.value.trim();
    if (!githubValue) {
      showFieldError(githubInput, githubHint, 'Please enter your GitHub username.');
      isValid = false;
    } else {
      clearFieldError(githubInput, githubHint);
      // Garantir formato @usuario
      if (!githubValue.startsWith('@')) {
        githubValue = '@' + githubValue;
      }
    }

    // Se tudo for válido, gerar o ingresso dinamicamente!
    if (isValid) {
      generateTicket({
        name: fullNameValue,
        email: emailValue,
        github: githubValue,
        avatar: userAvatarUrl
      });
    }
  });

  // Funções Auxiliares de Erro para Campos de Texto
  function showFieldError(inputEl, hintEl, message) {
    inputEl.classList.add('input-error');
    hintEl.classList.remove('hidden');
    hintEl.classList.add('error-hint');
    const textSpan = hintEl.querySelector('.hint-text');
    if (textSpan) textSpan.textContent = message;
  }

  function clearFieldError(inputEl, hintEl) {
    inputEl.classList.remove('input-error');
    hintEl.classList.add('hidden');
    hintEl.classList.remove('error-hint');
  }

  // Limpar erro ao digitar nos campos
  [fullNameInput, emailInput, githubInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
    });
  });

  // ------------------------------------------------------------------------
  // LÓGICA DE GERAÇÃO DINÂMICA DO INGRESSO
  // ------------------------------------------------------------------------
  function generateTicket(data) {
    // Esconder formulário e cabeçalho do formulário
    formSection.classList.add('hidden');
    formHeaderText.classList.add('hidden');

    // Preencher dados na tela de sucesso
    congratsName.textContent = data.name;
    congratsEmail.textContent = data.email;

    // Preencher dados dentro do cartão de ingresso
    ticketUserName.textContent = data.name;
    ticketUserHandle.textContent = data.github;
    ticketUserAvatar.src = data.avatar;

    // Gerar um numero aleatorio de 5 digitos pro codigo do ingresso nao ficar estatico
    const randomTicketNum = '#' + Math.floor(10000 + Math.random() * 90000);
    ticketNumber.textContent = randomTicketNum;

    // Mostrar cabeçalho de parabéns e cartão do ingresso
    ticketHeaderText.classList.remove('hidden');
    ticketSection.classList.remove('hidden');

    // Rolar a tela suavemente para o topo do ingresso
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
