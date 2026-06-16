/* =============================================
   auth.js — Cadastro, login e logout de usuário.
   Dados persistidos em localStorage como demo front-end.
   TODO: Em produção, use hash de senha (bcrypt) + API segura.
         NUNCA armazene senhas em texto em produção.
   ============================================= */

import { store }  from './store.js';
import { state, saveUser } from './state.js';
import { toast, openModal, closeModal } from './ui.js';
import { t }      from './i18n.js';

/* Retorna o array de usuários cadastrados */
function getUsers() {
  return store.get('cravou_users') ?? [];
}

/* Persiste o array de usuários */
function setUsers(users) {
  store.set('cravou_users', users);
}

/* ---- REGISTRO ---- */
export function register(name, email, password) {
  name    = name.trim();
  email   = email.trim().toLowerCase();
  password = password.trim();

  if (!name || !email || !password) {
    return { ok: false, msg: 'Preencha todos os campos.' };
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { ok: false, msg: 'E-mail já cadastrado.' };
  }

  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  setUsers(users);

  /* Faz login automaticamente após o cadastro */
  state.user = { id: newUser.id, name, email };
  saveUser();
  updateAuthUI();
  return { ok: true };
}

/* ---- LOGIN ---- */
export function login(email, password) {
  email    = email.trim().toLowerCase();
  password = password.trim();

  if (!email || !password) {
    return { ok: false, msg: 'Preencha e-mail e senha.' };
  }

  const users = getUsers();
  const found = users.find(u => u.email === email);

  if (!found)                  return { ok: false, msg: 'Usuário não encontrado.' };
  if (found.password !== password) return { ok: false, msg: 'Senha incorreta.' };

  state.user = { id: found.id, name: found.name, email: found.email };
  saveUser();
  updateAuthUI();
  return { ok: true };
}

/* ---- LOGOUT ---- */
export function logout() {
  state.user = null;
  saveUser();
  updateAuthUI();
  toast('Até logo! 👋', 'info');
  /* Dispara evento para que app.js re-renderize ranking e cards */
  document.dispatchEvent(new CustomEvent('cravou:authchange'));
}

/* ---- ATUALIZA UI ---- */
export function updateAuthUI() {
  const isLogged = !!state.user;

  /* Topbar */
  const btnAuth      = document.getElementById('btn-auth');
  const topbarUser   = document.getElementById('topbar-user');
  const topbarName   = document.getElementById('topbar-username');

  if (btnAuth)    btnAuth.style.display    = isLogged ? 'none' : '';
  if (topbarUser) topbarUser.style.display = isLogged ? 'flex' : 'none';
  if (topbarName) topbarName.textContent   = isLogged ? state.user.name : '';

  /* Sidebar */
  const sidebarUserInfo = document.getElementById('sidebar-user-info');
  const sidebarName     = document.getElementById('sidebar-username');

  if (sidebarUserInfo) sidebarUserInfo.style.display = isLogged ? 'flex' : 'none';
  if (sidebarName)     sidebarName.textContent       = isLogged ? state.user.name : '';
}

/* ---- INICIALIZAÇÃO ---- */
export function initAuth() {
  updateAuthUI();

  /* Botão "Entrar" na topbar abre o modal de auth */
  document.getElementById('btn-auth')?.addEventListener('click', () => {
    openModal('modal-auth');
    showLoginForm();
  });

  /* Link "Usuário" na sidebar */
  document.getElementById('nav-user')?.addEventListener('click', e => {
    e.preventDefault();
    if (state.user) {
      logout();
    } else {
      openModal('modal-auth');
      showLoginForm();
    }
    closeModal('sidebar');
    document.getElementById('sidebar')?.classList.remove('sidebar--open');
    document.getElementById('overlay')?.classList.remove('overlay--visible');
  });

  /* Logout topbar */
  document.getElementById('topbar-logout')?.addEventListener('click', logout);
  document.getElementById('sidebar-logout')?.addEventListener('click', logout);

  /* Tabs login / cadastro */
  document.getElementById('tab-login')?.addEventListener('click', showLoginForm);
  document.getElementById('tab-register')?.addEventListener('click', showRegisterForm);

  /* Form de login */
  document.getElementById('form-login')?.addEventListener('submit', e => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    const result   = login(email, password);

    if (result.ok) {
      closeModal('modal-auth');
      toast(`Bem-vindo, ${state.user.name}! 🎯`, 'success');
      document.dispatchEvent(new CustomEvent('cravou:authchange'));
    } else {
      errEl.textContent = result.msg;
    }
  });

  /* Form de cadastro */
  document.getElementById('form-register')?.addEventListener('submit', e => {
    e.preventDefault();
    const name     = document.getElementById('reg-name').value;
    const email    = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errEl    = document.getElementById('reg-error');
    const result   = register(name, email, password);

    if (result.ok) {
      closeModal('modal-auth');
      toast(`Conta criada! Bem-vindo, ${state.user.name}! 🎉`, 'success');
      document.dispatchEvent(new CustomEvent('cravou:authchange'));
    } else {
      errEl.textContent = result.msg;
    }
  });
}

function showLoginForm() {
  document.getElementById('form-login').classList.remove('auth-form--hidden');
  document.getElementById('form-register').classList.add('auth-form--hidden');
  document.getElementById('tab-login').classList.add('auth-tab--active');
  document.getElementById('tab-register').classList.remove('auth-tab--active');
  document.getElementById('login-error').textContent = '';
}

function showRegisterForm() {
  document.getElementById('form-login').classList.add('auth-form--hidden');
  document.getElementById('form-register').classList.remove('auth-form--hidden');
  document.getElementById('tab-login').classList.remove('auth-tab--active');
  document.getElementById('tab-register').classList.add('auth-tab--active');
  document.getElementById('reg-error').textContent = '';
}
