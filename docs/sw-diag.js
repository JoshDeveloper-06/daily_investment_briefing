/* 임시 진단용 서비스 워커 — 실제 푸시와 무관하다. 원인 규명 후 삭제한다.
 * 모든 단계를 try/catch로 감싸 절대 평가 실패하지 않게 만들고,
 * 어느 단계에서 무엇이 터졌는지 페이지로 되돌려준다. */
self.__diag = { ua: (self.navigator && self.navigator.userAgent) || '?' };

function step(name, fn) {
  try { fn(); self.__diag[name] = 'OK'; }
  catch (e) { self.__diag[name] = 'ERR ' + (e && e.name) + ': ' + (e && e.message); }
}

step('importApp', function () { importScripts('./firebase-app-compat.js'); });
step('importMsg', function () { importScripts('./firebase-messaging-compat.js'); });
step('typeofFirebase', function () { self.__diag.firebaseType = typeof firebase; });
step('initializeApp', function () {
  firebase.initializeApp({
    apiKey: "AIzaSyACozKTF1MAKOGD_SF5dRstZ0fGwkSs-hc",
    authDomain: "hankyoung-briefing.firebaseapp.com",
    projectId: "hankyoung-briefing",
    storageBucket: "hankyoung-briefing.firebasestorage.app",
    messagingSenderId: "768114402518",
    appId: "1:768114402518:web:dfc0b069c0d47833195577",
  });
});
step('messaging', function () { self.__m = firebase.messaging(); });
step('onBackgroundMessage', function () { self.__m.onBackgroundMessage(function () {}); });

self.addEventListener('message', function (e) {
  if (e.ports && e.ports[0]) e.ports[0].postMessage(self.__diag);
});
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
