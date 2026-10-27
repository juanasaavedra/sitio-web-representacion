const filterButtons = [...document.querySelectorAll('.filter-button')];
const proposalCards = [...document.querySelectorAll('.proposal-card')];
function setFilter(filter) {
  const selected = ['todas', 'practica', 'formacion'].includes(filter) ? filter : 'todas';
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  proposalCards.forEach((card) => {
    card.hidden = selected !== 'todas' && card.dataset.axis !== selected;
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

document.querySelectorAll('[data-filter-link]').forEach((link) => {
  link.addEventListener('click', () => setFilter(link.dataset.filterLink));
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mainNav.classList.toggle('open', open);
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    mainNav.classList.remove('open');
  });
});

setFilter('todas');

const SUPABASE_URL = 'https://xsycxwihmcmsaoykvgxn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZRh43BSCWmOGTLOZmtq8RA_00PuInzA';
const signupForm = document.querySelector('#signup-form');
const formStatus = document.querySelector('#form-status');
const submitButton = signupForm.querySelector('button[type="submit"]');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!signupForm.reportValidity()) return;

  const formData = new FormData(signupForm);
  if (formData.get('sitio')) return;

  const payload = {
    nombre: String(formData.get('nombre')).trim(),
    telefono: String(formData.get('telefono')).trim(),
    carrera: String(formData.get('carrera'))
  };

  if (!payload.nombre || !payload.telefono || !payload.carrera) {
    formStatus.textContent = 'Completa todos los campos para continuar.';
    formStatus.dataset.state = 'error';
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector('span:first-child').textContent = 'Enviando…';
  formStatus.textContent = '';
  delete formStatus.dataset.state;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/contactos`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Supabase insert failed:', response.status, details);
      throw new Error(response.status === 401 || response.status === 403 || response.status === 404
        ? 'No se pudo guardar. Revisa los permisos de inserción (RLS) y la tabla contactos en Supabase.'
        : 'No se pudo completar el registro. Intenta de nuevo en un momento.');
    }

    formStatus.textContent = '¡Listo! Recibimos tus datos. Nos pondremos en contacto para compartirte el plan y las propuestas.';
    formStatus.dataset.state = 'success';
    signupForm.reset();
  } catch (error) {
    formStatus.textContent = error instanceof TypeError
      ? 'No logramos conectar. Intenta de nuevo cuando tengas conexión.'
      : error.message;
    formStatus.dataset.state = 'error';
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector('span:first-child').textContent = 'Enviar mis datos';
  }
});
