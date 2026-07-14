// Mandrágora — Web Push: botón de activar notificaciones + suscripción
(function () {
  var VAPID_PUBLIC_KEY = 'BGzBEECV_PlkO2WBn8ix-_4EzUNLm5hbRIeua55CJ0biqjHqijCL0I4jbTLH1sfCbjh-KrW9vjzbb6vO8Wp6DNo';
  var SUBSCRIBE_ENDPOINT = '/api/push-subscribe';

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  function subscribeUser() {
    return navigator.serviceWorker.ready
      .then(function (reg) {
        return reg.pushManager.getSubscription().then(function (existing) {
          if (existing) return existing;
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        });
      })
      .then(function (sub) {
        return fetch(SUBSCRIBE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub }),
        }).then(function () {
          localStorage.setItem('mandragora-push', 'subscribed');
          return true;
        });
      })
      .catch(function (err) {
        console.error('Error al suscribirse a notificaciones:', err);
        return false;
      });
  }

  function createButton() {
    var btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Activar notificaciones');
    btn.setAttribute('title', 'Activar notificaciones');
    btn.innerHTML = '&#128276;';
    btn.style.cssText = [
      'position:fixed', 'bottom:5.5rem', 'right:1.5rem', 'z-index:9998',
      'width:48px', 'height:48px', 'border-radius:50%',
      'background:var(--c-gold, #c9a227)', 'color:#0a0a0a', 'border:none',
      'font-size:1.3rem', 'cursor:pointer', 'box-shadow:0 4px 14px rgba(0,0,0,0.35)',
      'display:grid', 'place-items:center', 'transition:transform 0.2s ease',
    ].join(';');
    btn.onmouseenter = function () { btn.style.transform = 'scale(1.08)'; };
    btn.onmouseleave = function () { btn.style.transform = 'scale(1)'; };

    btn.addEventListener('click', function () {
      btn.disabled = true;
      btn.innerHTML = '&hellip;';
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          subscribeUser().then(function (ok) {
            if (!ok) localStorage.setItem('mandragora-push', 'error');
            btn.remove();
          });
        } else {
          localStorage.setItem('mandragora-push', 'denied');
          btn.remove();
        }
      });
    });

    document.body.appendChild(btn);
  }

  function init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
    if (localStorage.getItem('mandragora-push') === 'denied') return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createButton);
    } else {
      createButton();
    }
  }

  init();
})();
