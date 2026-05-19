/**
 * ==========================================================================
 * JAVASCRIPT INTERACTIVO - PROGRAMA DE BECAS GEVISIÓN
 * Lógica Completa, Validaciones en Tiempo Real, Calculadoras y Canvas
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de componentes
  initHeader();
  initHeroSlogan();
  initStatsCounter();
  initRequirementsChecklist();
  initMultiStepForm();
  initDocumentUpload();
  initTombolaCalculator();
  initFinanceTabs();
  initConfetti();
  init3DTilt();
  initCoverflowGallery();
  
  // Lucide Icons (si está disponible, o usamos los SVGs inline del HTML)
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/* ==========================================================================
   1. CONTROL DE NAVEGACIÓN Y HEADER
   ========================================================================== */
function initHeader() {
  const header = document.querySelector("header");
  const toggle = document.querySelector(".mobile-nav-toggle");
  const navLinks = document.querySelectorAll(".nav-menu a");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initHeroSlogan() {
  const sloganEl = document.getElementById("heroSlogan");
  if (!sloganEl) return;

  const slogans = [
    "De la comunidad, para la comunidad",
    "Dona una beca, apoya un talento"
  ];
  let index = 0;

  setInterval(() => {
    sloganEl.classList.add("changing");
    setTimeout(() => {
      index = (index + 1) % slogans.length;
      sloganEl.textContent = slogans[index];
      sloganEl.classList.remove("changing");
    }, 350);
  }, 3200);
}

/* ==========================================================================
   2. CONTADORES ANIMADOS DE ESTADÍSTICAS
   ========================================================================== */
function initStatsCounter() {
  const stats = document.querySelectorAll(".stat-num");
  
  const animateStats = (entry) => {
    if (entry.isIntersecting) {
      const target = entry.target;
      const targetValue = parseFloat(target.getAttribute("data-target"));
      const isPercent = target.getAttribute("data-percent") === "true";
      const isCurrency = target.getAttribute("data-currency") === "true";
      
      let start = 0;
      const duration = 2000; // 2 segundos
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = targetValue / steps;
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= targetValue) {
          clearInterval(timer);
          formatValue(targetValue, isPercent, isCurrency, target);
        } else {
          formatValue(start, isPercent, isCurrency, target);
        }
      }, stepTime);
      
      observer.unobserve(target); // Animar solo una vez
    }
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => animateStats(entry));
  }, { threshold: 0.5 });
  
  stats.forEach(stat => observer.observe(stat));
  
  function formatValue(val, isPercent, isCurrency, element) {
    if (isPercent) {
      element.textContent = `${Math.round(val)}%`;
    } else if (isCurrency) {
      element.textContent = `${Math.round(val).toLocaleString()} XAF`;
    } else {
      element.textContent = Math.round(val).toLocaleString();
    }
  }
}

/* ==========================================================================
   3. CHECKLIST INTERACTIVA DE REQUISITOS
   ========================================================================== */
function initRequirementsChecklist() {
  const items = document.querySelectorAll(".req-item");
  
  items.forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
}

function initDocumentUpload() {
  const uploadArea = document.getElementById("uploadArea");
  const input = document.getElementById("documentUpload");
  const status = document.getElementById("uploadStatus");
  if (!uploadArea || !input || !status) return;

  const updateStatus = (files) => {
    const count = files ? files.length : 0;
    if (!count) return;
    uploadArea.classList.add("has-files");
    status.textContent = `${count} archivo(s) preparados para revisión del comité`;
  };

  uploadArea.addEventListener("click", () => input.click());
  uploadArea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });
  input.addEventListener("change", () => updateStatus(input.files));

  ["dragenter", "dragover"].forEach(eventName => {
    uploadArea.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadArea.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    uploadArea.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadArea.classList.remove("drag-over");
    });
  });

  uploadArea.addEventListener("drop", (event) => {
    updateStatus(event.dataTransfer.files);
  });
}

/* ==========================================================================
   4. FORMULARIO MULTIETAPA (MULTISTEP FORM) CON FIRMA DIGITAL
   ========================================================================== */
function initMultiStepForm() {
  const form = document.getElementById("scholarshipForm");
  if (!form) return;

  const steps = Array.from(document.querySelectorAll(".form-step-content"));
  const indicators = Array.from(document.querySelectorAll(".step-indicator"));
  const progressBar = document.querySelector(".step-progress-bar");
  
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnSubmit = document.getElementById("btnSubmit");
  const successScreen = document.getElementById("successScreen");
  
  let currentStep = 0;
  
  // Configurar Firma en Canvas
  const canvas = document.getElementById("signaturePad");
  let ctx = null;
  let drawing = false;
  let signatureHasInk = false;

  if (canvas) {
    ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#38bdf8"; // Color azul claro para combinar
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    
    // Soporte táctil y ratón para dibujar
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    
    canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
      e.preventDefault();
    });
    canvas.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      draw({ clientX: touch.clientX, clientY: touch.clientY });
      e.preventDefault();
    });
    canvas.addEventListener("touchend", stopDrawing);
  }

  function startDrawing(e) {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    signatureHasInk = true;
    canvas.closest(".signature-container")?.classList.remove("signature-error");
  }

  function stopDrawing() {
    drawing = false;
  }

  const btnClearSig = document.getElementById("clearSig");
  if (btnClearSig) {
    btnClearSig.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      signatureHasInk = false;
    });
  }

  // Tarjetas de Selección Exclusiva (Rango de Ingresos)
  const bracketCards = document.querySelectorAll(".radio-bracket-card");
  bracketCards.forEach(card => {
    card.addEventListener("click", () => {
      bracketCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const radio = card.querySelector("input[type='radio']");
      if (radio) radio.checked = true;
    });
  });

  // Casillas de Verificación Grandes (Situación Social)
  const socialCards = document.querySelectorAll(".checkbox-card");
  socialCards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("selected");
      const checkbox = card.querySelector("input[type='checkbox']");
      if (checkbox) checkbox.checked = !checkbox.checked;
    });
  });

  // Navegación con Transiciones 3D de Cubo
  let isTransitioning = false;

  function updateFormState(direction) {
    if (isTransitioning) return;
    
    if (!direction) {
      // Inicialización simple
      steps.forEach((step, idx) => {
        step.classList.toggle("active", idx === currentStep);
      });
    } else {
      isTransitioning = true;
      const prevStepIdx = direction === "next" ? currentStep - 1 : currentStep + 1;
      const prevStep = steps[prevStepIdx];
      const activeStep = steps[currentStep];
      
      // Aplicar clases de animación 3D
      if (direction === "next") {
        prevStep.classList.remove("active");
        prevStep.classList.add("exit-left");
        
        activeStep.classList.add("enter-right");
        activeStep.classList.add("active");
        
        setTimeout(() => {
          activeStep.classList.remove("enter-right");
          prevStep.classList.remove("exit-left");
          isTransitioning = false;
        }, 600);
      } else {
        prevStep.classList.remove("active");
        prevStep.classList.add("exit-right");
        
        activeStep.classList.add("enter-left");
        activeStep.classList.add("active");
        
        setTimeout(() => {
          activeStep.classList.remove("enter-left");
          prevStep.classList.remove("exit-right");
          isTransitioning = false;
        }, 600);
      }
    }
    
    // Actualizar barra de progreso superior
    const progressPercent = (currentStep / (steps.length - 1)) * 100;
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }
    
    // Actualizar bolitas de los pasos
    indicators.forEach((ind, idx) => {
      ind.classList.toggle("active", idx === currentStep);
      ind.classList.toggle("completed", idx < currentStep);
    });
    
    // Control de botones
    btnPrev.style.display = currentStep === 0 ? "none" : "inline-flex";
    
    if (currentStep === steps.length - 1) {
      btnNext.style.display = "none";
      btnSubmit.style.display = "inline-flex";
    } else {
      btnNext.style.display = "inline-flex";
      btnSubmit.style.display = "none";
    }
  }

  function validateStep(stepIdx) {
    const stepEl = steps[stepIdx];
    const requiredInputs = stepEl.querySelectorAll("[required]");
    let isValid = true;
    
    requiredInputs.forEach(input => {
      if (!input.value.trim() || !input.checkValidity()) {
        isValid = false;
        input.style.borderColor = "#ef4444"; // Borde rojo
        input.addEventListener("input", function clearError() {
          input.style.borderColor = "";
          input.removeEventListener("input", clearError);
        });
      }
    });
    
    // Validar selección de tutor en paso 3
    if (stepIdx === 2) {
      const radioChecked = stepEl.querySelector("input[type='radio']:checked");
      if (!radioChecked) {
        isValid = false;
        const grid = stepEl.querySelector(".radio-bracket-grid");
        grid.style.border = "1px solid #ef4444";
        grid.style.borderRadius = "14px";
        bracketCards.forEach(card => {
          card.addEventListener("click", function clearGridError() {
            grid.style.border = "";
            bracketCards.forEach(c => c.removeEventListener("click", clearGridError));
          });
        });
      }
    }

    if (stepIdx === 5 && canvas && !signatureHasInk) {
      isValid = false;
      canvas.closest(".signature-container")?.classList.add("signature-error");
    }
    
    return isValid;
  }

  btnNext.addEventListener("click", () => {
    if (isTransitioning) return;
    if (validateStep(currentStep)) {
      currentStep++;
      updateFormState("next");
    }
  });

  btnPrev.addEventListener("click", () => {
    if (isTransitioning) return;
    if (currentStep > 0) {
      currentStep--;
      updateFormState("prev");
    }
  });

  // Envío del Formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (isTransitioning) return;
    if (!validateStep(currentStep)) return;
    
    // Simular el envío con éxito
    form.style.display = "none";
    successScreen.style.display = "block";
    
    // Rellenar recibo digital
    const nombre = document.getElementById("fullName").value;
    const dip = document.getElementById("dipNum").value;
    const carrera = document.getElementById("career").value;
    const gpa = document.getElementById("gpa").value;
    
    document.getElementById("recName").textContent = nombre;
    document.getElementById("recDIP").textContent = dip;
    document.getElementById("recCareer").textContent = carrera;
    document.getElementById("recGPA").textContent = `${gpa} / 10`;
    
    // Generar un código único
    const uniqueCode = `GEV-${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById("recCode").textContent = uniqueCode;

    const downloadReceipt = document.getElementById("downloadReceipt");
    if (downloadReceipt) {
      downloadReceipt.onclick = () => {
        const receipt = [
          "PROGRAMA DE BECAS GEVISION - AAUCA",
          "RESGUARDO DIGITAL DE SOLICITUD",
          `Codigo: ${uniqueCode}`,
          `Postulante: ${nombre}`,
          `DIP/Pasaporte: ${dip}`,
          `Carrera: ${carrera}`,
          `Promedio: ${gpa} / 10`,
          `Fecha: ${new Date().toLocaleString("es-GQ")}`,
          "",
          "Este comprobante confirma la recepcion digital simulada de la postulacion."
        ].join("\n");
        const blob = new Blob([receipt], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${uniqueCode}-recibo-gevision.txt`;
        link.click();
        URL.revokeObjectURL(url);
      };
    }
    
    // Lanzar confeti!
    triggerConfetti();
  });

  // Inicializar estado del form
  updateFormState();
}

/* ==========================================================================
   5. CALCULADORA INTERACTIVA DE TÓMBOLA
   ========================================================================== */
function initTombolaCalculator() {
  const qtyNum = document.getElementById("qtyNum");
  const btnMinus = document.getElementById("btnMinus");
  const btnPlus = document.getElementById("btnPlus");
  const calcPrice = document.getElementById("calcPrice");
  const promoBox = document.getElementById("promoBox");
  
  if (!qtyNum) return;
  
  const pricePerTicket = 1000;
  
  const updatePrice = () => {
    let qty = parseInt(qtyNum.textContent);
    let total = qty * pricePerTicket;
    calcPrice.textContent = `${total.toLocaleString()} XAF`;
    
    // Mostrar promoción a partir de 3 papeletas
    if (qty >= 3) {
      promoBox.classList.remove("hidden");
    } else {
      promoBox.classList.add("hidden");
    }
  };
  
  btnMinus.addEventListener("click", () => {
    let qty = parseInt(qtyNum.textContent);
    if (qty > 1) {
      qtyNum.textContent = qty - 1;
      updatePrice();
    }
  });
  
  btnPlus.addEventListener("click", () => {
    let qty = parseInt(qtyNum.textContent);
    qtyNum.textContent = qty + 1;
    updatePrice();
  });
  
  // Botones de compra simulados
  const btnBuyTombola = document.getElementById("btnBuyTombola");
  if (btnBuyTombola) {
    btnBuyTombola.addEventListener("click", () => {
      let qty = parseInt(qtyNum.textContent);
      alert(`¡Felicidades! Has reservado ${qty} papeleta(s) para la Tómbola Solidaria. Monto a abonar en el campus: ${(qty * pricePerTicket).toLocaleString()} XAF.`);
      triggerConfetti();
    });
  }
  
  // Botón de compra de Concierto
  const btnBuyConcert = document.getElementById("btnBuyConcert");
  if (btnBuyConcert) {
    btnBuyConcert.addEventListener("click", () => {
      alert("¡Entrada Reservada con éxito! Se ha generado tu Brazalete Digital Simbólico. Puedes retirarlo en el Anfiteatro de la Facultad de Medicina.");
      triggerConfetti();
    });
  }
}

/* ==========================================================================
   6. PESTAÑAS DE TABLAS DE FINANZAS Y PROGRESO DE TRANSPARENCIA
   ========================================================================== */
function initFinanceTabs() {
  const tabs = document.querySelectorAll(".table-tab");
  const tables = document.querySelectorAll(".financial-table");
  const progressBarFill = document.getElementById("progressBarFill");
  
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTable = tab.getAttribute("data-table");
      
      tabs.forEach(t => t.classList.remove("active"));
      tables.forEach(t => t.classList.remove("active"));
      
      tab.classList.add("active");
      document.getElementById(targetTable).classList.add("active");
    });
  });
  
  // Animar la barra de progreso de transparencia al entrar a la vista
  const animateProgressBar = (entry) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        progressBarFill.style.width = "60%"; // Recaudación actual: 350k de 585k (aprox. 60%)
      }, 300);
      progressObserver.unobserve(entry.target);
    }
  };
  
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => animateProgressBar(entry));
  }, { threshold: 0.2 });
  
  if (progressBarFill) {
    progressObserver.observe(progressBarFill);
  }
  
  // Selector de donaciones preestablecidas
  const presetBtns = document.querySelectorAll(".preset-btn");
  const donationInput = document.getElementById("donationInput");
  
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      donationInput.value = btn.getAttribute("data-val");
    });
  });
  
  const btnDonate = document.getElementById("btnDonate");
  if (btnDonate) {
    btnDonate.addEventListener("click", () => {
      let val = donationInput.value;
      if (val && val > 0) {
        alert(`¡Gracias por tu inmenso corazón! Has iniciado una donación voluntaria de ${parseInt(val).toLocaleString()} XAF para apoyar el talento estudiantil. Recibirás detalles de transferencia.`);
        triggerConfetti();
      }
    });
  }
}

/* ==========================================================================
   7. ANIMACIÓN DE CONFETI VIBRANTE (VANILLA JS EMITTER)
   ========================================================================== */
let confettiActive = false;

function initConfetti() {
  const style = document.createElement("style");
  style.textContent = `
    .confetti-particle {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      border-radius: 4px;
      animation: confettiFall 4s linear forwards;
    }
    @keyframes confettiFall {
      0% {
        transform: translateY(-50px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(105vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

function triggerConfetti() {
  if (confettiActive) return;
  confettiActive = true;
  
  const colors = ["#0052FF", "#3b82f6", "#00d2ff", "#ffffff", "#8ab4f8", "#1a73e8"];
  const particleCount = 120;
  
  for (let i = 0; i < particleCount; i++) {
    createParticle(colors);
  }
  
  setTimeout(() => {
    confettiActive = false;
  }, 4000);
}

function createParticle(colors) {
  const particle = document.createElement("div");
  particle.className = "confetti-particle";
  
  // Tamaño aleatorio
  const width = Math.random() * 8 + 6;
  const height = Math.random() * 14 + 8;
  
  // Color aleatorio
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Posición inicial y retraso aleatorio
  const left = Math.random() * 100;
  const delay = Math.random() * 0.8;
  const duration = Math.random() * 2 + 2;
  
  particle.style.width = `${width}px`;
  particle.style.height = `${height}px`;
  particle.style.backgroundColor = color;
  particle.style.left = `${left}vw`;
  particle.style.top = `-20px`;
  particle.style.animationDelay = `${delay}s`;
  particle.style.animationDuration = `${duration}s`;
  
  document.body.appendChild(particle);
  
  // Eliminar elemento después de que termine la animación
  setTimeout(() => {
    particle.remove();
  }, (duration + delay) * 1000);
}

/* ==========================================================================
   8. EFECTO DE INCLINACIÓN 3D INTERACTIVO (MOUSE TILT PHYSICS)
   ========================================================================== */
function init3DTilt() {
  const tiltElements = document.querySelectorAll('[data-tilt], .team-member, .beca-card, .stat-card, .price-card, .channel-card');
  
  tiltElements.forEach(el => {
    // Si no tiene el atributo data-tilt, se lo agregamos dinámicamente
    if (!el.hasAttribute('data-tilt')) {
      el.setAttribute('data-tilt', '');
    }
    
    // Asegurar que tenga la clase para soportar la transformación
    el.classList.add('tilt-3d');
    
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Calcular ángulos de inclinación (máx 8 grados en X e Y)
      const angleX = ((yc - y) / yc) * 8;
      const angleY = ((x - xc) / xc) * 8;
      
      el.style.setProperty('--rx', `${angleX}deg`);
      el.style.setProperty('--ry', `${angleY}deg`);
      el.style.setProperty('--sc', '1.02');
      
      // Coordenadas en porcentaje para el brillo (glare) dinámico
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      el.style.setProperty('--mx', `${pctX}%`);
      el.style.setProperty('--my', `${pctY}%`);
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--sc', '1');
    });
  });
  
  // Agregar soporte interactivo para mover el visual-3d-card con parallax
  const heroCard = document.getElementById('hero3DCard');
  if (heroCard) {
    heroCard.addEventListener('mousemove', e => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Ángulo de inclinación mayor en el hero (12 grados)
      const angleX = ((yc - y) / yc) * 12;
      const angleY = ((x - xc) / xc) * 12;
      
      heroCard.style.setProperty('--rx', `${angleX}deg`);
      heroCard.style.setProperty('--ry', `${angleY}deg`);
      heroCard.style.setProperty('--sc', '1.03');
      
      heroCard.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
      heroCard.style.setProperty('--my', `${(y / rect.height) * 100}%`);
    });
  }
}

/* ==========================================================================
   9. GALERÍA MULTIMEDIA 3D (COVERFLOW CAROUSEL)
   ========================================================================== */
function initCoverflowGallery() {
  const track = document.getElementById('coverflowTrack');
  if (!track) return;
  
  const slides = Array.from(track.getElementsByClassName('coverflow-slide'));
  const prevBtn = document.getElementById('coverflowPrev');
  const nextBtn = document.getElementById('coverflowNext');
  const dotsContainer = document.getElementById('coverflowDots');
  
  if (slides.length === 0) return;
  
  let activeIndex = Math.floor(slides.length / 2); // Comenzar en el medio
  
  // Generar indicadores dinámicos (dots)
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `coverflow-dot ${idx === activeIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        activeIndex = idx;
        updateCoverflow();
      });
      dotsContainer.appendChild(dot);
    });
  }
  
  function updateCoverflow() {
    const dots = dotsContainer ? Array.from(dotsContainer.children) : [];
    
    slides.forEach((slide, idx) => {
      const offset = idx - activeIndex;
      
      if (offset === 0) {
        // Slide Activa (Al frente)
        slide.style.transform = 'translate3d(0, 0, 100px) rotateY(0deg) scale(1.02)';
        slide.style.opacity = '1';
        slide.style.zIndex = '10';
        slide.style.pointerEvents = 'auto';
        slide.classList.add('active');
      } else if (offset < 0) {
        // Slides a la Izquierda
        const translate = offset * 115;
        const rotate = 35;
        slide.style.transform = `translate3d(${translate}px, 0, -80px) rotateY(${rotate}deg) scale(0.85)`;
        slide.style.opacity = Math.max(0.15, 1 + (offset * 0.35));
        slide.style.zIndex = `${10 + offset}`;
        slide.style.pointerEvents = 'none';
        slide.classList.remove('active');
      } else {
        // Slides a la Derecha
        const translate = offset * 115;
        const rotate = -35;
        slide.style.transform = `translate3d(${translate}px, 0, -80px) rotateY(${rotate}deg) scale(0.85)`;
        slide.style.opacity = Math.max(0.15, 1 - (offset * 0.35));
        slide.style.zIndex = `${10 - offset}`;
        slide.style.pointerEvents = 'none';
        slide.classList.remove('active');
      }
    });
    
    // Actualizar dots
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  }
  
  // Soporte de navegación por teclado y clics directos
  slides.forEach((slide, idx) => {
    slide.addEventListener('click', () => {
      if (idx !== activeIndex) {
        activeIndex = idx;
        updateCoverflow();
      }
    });
  });
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + slides.length) % slides.length;
      updateCoverflow();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeIndex = (activeIndex + 1) % slides.length;
      updateCoverflow();
    });
  }
  
  // Inicializar vista
  updateCoverflow();
  
  // Auto rotación suave cada 6 segundos
  let autoPlayInterval = setInterval(() => {
    activeIndex = (activeIndex + 1) % slides.length;
    updateCoverflow();
  }, 6000);
  
  // Pausar auto rotación en interacción del ratón
  const stopAutoPlay = () => {
    clearInterval(autoPlayInterval);
  };
  
  track.addEventListener('mouseenter', stopAutoPlay);
  if (prevBtn) prevBtn.addEventListener('click', stopAutoPlay);
  if (nextBtn) nextBtn.addEventListener('click', stopAutoPlay);
}
