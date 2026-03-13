---
title: "웹뷰(WebView)란? 모바일 앱 안의 웹 브라우저"
shortTitle: "웹뷰 개념"
date: "2026-03-13"
tags: ["webview", "hybrid-app", "mobile-development", "cross-platform"]
category: "Frontend"
summary: "모바일 앱 내에 포함된 웹 브라우저로, 웹 페이지를 앱의 일부처럼 동작시킵니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/207"
references: ["https://developer.android.com/guide/webapps/webview", "https://developer.apple.com/documentation/webkit/wkwebview", "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"]
---

## 웹뷰(WebView)란?

웹뷰는 모바일 앱 내에 포함된 웹 브라우저 컴포넌트입니다. 네이티브 앱 내부에서 웹 페이지를 불러와서 마치 앱의 일부처럼 동작하도록 만들어 줍니다. 안드로이드에서는 `WebView`, iOS에서는 `WKWebView`를 통해 구현할 수 있습니다.

웹뷰는 하이브리드 앱 개발의 핵심 기술로, HTML, CSS, JavaScript로 작성된 웹 페이지를 앱 내부에서 실행할 수 있게 해줍니다. 이를 통해 하나의 웹 코드베이스로 다양한 플랫폼에서 동일한 UI와 기능을 제공할 수 있습니다.

웹뷰를 사용하면 업데이트가 자유롭다는 큰 장점이 있습니다. 네이티브 앱은 스토어 심사를 거쳐야 업데이트를 배포할 수 있지만, 웹뷰 콘텐츠는 서버에서 직접 업데이트할 수 있어 빠른 배포가 가능합니다.

## 핵심 개념

### 1. 웹뷰의 동작 원리

웹뷰는 네이티브 앱 내부에서 웹 브라우저 엔진을 실행하는 컴포넌트입니다.

```javascript
// 안드로이드 WebView 설정 예시
WebView webView = findViewById(R.id.webview);
WebSettings webSettings = webView.getSettings();
webSettings.setJavaScriptEnabled(true);
webView.loadUrl("https://example.com");

// 네이티브와 웹 간 브릿지 설정
webView.addJavascriptInterface(new WebAppInterface(this), "Android");
```

```javascript
// JavaScript에서 네이티브 함수 호출
function showNativeToast() {
    Android.showToast("웹에서 네이티브 함수 호출!");
}
```

웹뷰는 웹 콘텐츠를 렌더링하면서도 네이티브 코드와 양방향 통신할 수 있는 브릿지를 제공합니다.

### 2. 하이브리드 앱 개발의 장단점

**장점:**
- **개발 효율성**: 하나의 웹 코드로 여러 플랫폼 지원
- **빠른 업데이트**: 스토어 심사 없이 즉시 업데이트 가능
- **유지보수**: 웹 기술 스택으로 일관된 개발 환경

```javascript
// React Native WebView 사용 예시
import { WebView } from 'react-native-webview';

function MyWebView() {
  return (
    <WebView
      source={{ uri: 'https://myapp.com' }}
      onMessage={(event) => {
        console.log('웹에서 받은 메시지:', event.nativeEvent.data);
      }}
      injectedJavaScript={`
        window.ReactNativeWebView.postMessage('Hello from web!');
      `}
    />
  );
}
```

**단점:**
- **성능 제약**: 복잡한 애니메이션이나 연산에서 네이티브 대비 성능 저하
- **보안 취약점**: XSS 공격이나 악성 스크립트 삽입 위험
- **네이티브 기능 제한**: 카메라, GPS 등 하드웨어 접근에 제약

### 3. 웹뷰와 PWA의 차이점

웹뷰는 네이티브 앱 내의 컴포넌트인 반면, PWA는 독립적인 웹 애플리케이션입니다.

```json
// PWA manifest.json 예시
{
  "name": "My PWA",
  "short_name": "MyPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

```javascript
// PWA 서비스 워커 예시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-pwa-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
        '/offline.html'
      ]);
    })
  );
});
```

PWA는 웹 표준만으로 앱 수준의 경험을 제공하며, 스토어 등록 없이도 설치 가능합니다.

### 4. 웹뷰 보안 고려사항

웹뷰는 외부 콘텐츠를 로드하므로 보안에 특별한 주의가 필요합니다.

```javascript
// 안전한 웹뷰 설정
WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setAllowFileAccess(false);  // 파일 접근 차단
settings.setAllowContentAccess(false);  // 콘텐츠 접근 차단

// URL 검증
webView.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url.startsWith("https://trusted-domain.com")) {
            return false;  // 신뢰할 수 있는 도메인만 허용
        }
        return true;  // 다른 URL은 차단
    }
});
```

콘텐츠 보안 정책(CSP)과 HTTPS 사용, 신뢰할 수 있는 도메인 검증이 필수적입니다.

## 정리

| 구분 | 웹뷰 | 네이티브 앱 | PWA |
|------|------|-------------|-----|
| **개발 언어** | HTML/CSS/JS | Swift/Kotlin | HTML/CSS/JS |
| **성능** | 중간 | 높음 | 중간 |
| **업데이트** | 즉시 가능 | 스토어 심사 필요 | 즉시 가능 |
| **플랫폼 지원** | 하이브리드 | 플랫폼별 개발 | 브라우저 지원 |
| **오프라인 기능** | 제한적 | 완전 지원 | 서비스 워커로 지원 |
| **하드웨어 접근** | 브릿지 필요 | 직접 접근 | Web API 제한 |

웹뷰는 빠른 개발과 크로스 플랫폼 지원이 필요한 경우 유용하지만, 성능과 보안을 신중히 고려해야 합니다. 단순한 콘텐츠 표시나 자주 업데이트되는 기능에는 웹뷰가, 복잡한 네이티브 기능이 필요한 경우에는 네이티브 개발이 더 적합합니다.