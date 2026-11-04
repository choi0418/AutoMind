/**
 * AutoMind Service Worker
 * 앱 파일 캐싱 및 오프라인 구동을 지원합니다.
 */

const CACHE_NAME = 'automind-v1';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// 서비스 워커 설치 시 리소스 캐싱
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 기존 캐시 정기 관리 및 활성화
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 가로채기 (오프라인 지원)
self.addEventListener('fetch', (e) => {
  // 구글 Apps Script API 요청은 캐시하지 않고 항상 네트워크 요청
  if (e.request.url.includes('script.google.com')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});