/* 웹푸시 서비스 워커 — 브라우저가 닫혀 있거나 사이트가 백그라운드일 때 알림을 받는다.
 *
 * ⚠️ 이 파일은 **사이트 루트(docs/)에 그대로 배포돼야** 한다. 서비스 워커는 자기 파일이
 *    놓인 경로 이하만 제어할 수 있어서, 하위 폴더에 두면 브리핑 페이지를 못 잡는다.
 *    GitHub Pages 프로젝트 사이트라 실제 스코프는 /daily_investment_briefing/ 이며,
 *    사이트 전체가 그 아래 있으므로 문제없다.
 *
 * ⚠️ **배포 게이트 주의** — SKILL.md 5-2단계의 게이트는 docs/에 .html·feed.xml 외
 *    파일이 있으면 배포를 중단시킨다. 이 파일(.js)이 예외로 등록돼 있어야 한다.
 *    게이트를 손볼 때 이 파일을 빠뜨리면 웹푸시가 조용히 죽는다.
 *
 * ⚠️ 서비스 워커에서는 firebase_config.py를 읽을 수 없다(파이썬이 아니라 브라우저다).
 *    그래서 config가 여기에 중복으로 박혀 있다. **firebase_config.py를 고치면 이 파일도
 *    같이 고쳐야 한다** — 한쪽만 바꾸면 어긋난다.
 *
 * SDK는 compat 빌드를 쓴다. 서비스 워커에서는 ESM import가 제약이 많아
 * importScripts + compat 조합이 가장 안전하다(Firebase 공식 문서 방식).
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyACozKTF1MAKOGD_SF5dRstZ0fGwkSs-hc",
  authDomain: "hankyoung-briefing.firebaseapp.com",
  projectId: "hankyoung-briefing",
  storageBucket: "hankyoung-briefing.firebasestorage.app",
  messagingSenderId: "768114402518",
  appId: "1:768114402518:web:dfc0b069c0d47833195577",
});

const messaging = firebase.messaging();

// 백그라운드 수신. 발송 스크립트가 data-only로 보내므로 여기서 직접 알림을 띄운다.
// (notification 페이로드를 같이 보내면 브라우저가 자동으로 한 번 더 띄워 중복된다.)
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || '한국경제 시황 브리핑', {
    body: d.body || '새 브리핑이 올라왔습니다.',
    icon: d.icon || undefined,
    tag: d.tag || 'briefing',      // 같은 tag는 덮어써서 알림이 쌓이지 않는다
    data: { url: d.url || '/daily_investment_briefing/' },
  });
});

// 알림 클릭 → 이미 열려 있는 탭이 있으면 그 탭을 살리고, 없으면 새로 연다.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url)
    || '/daily_investment_briefing/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes('/daily_investment_briefing/') && 'focus' in c) return c.focus();
      }
      return clients.openWindow(target);
    })
  );
});
