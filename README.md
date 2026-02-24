# Podcast Alarm App (팟캐스트 알람 앱)

이 앱은 백그라운드 환경에서 정해진 시간에 오디오(기상 알람 및 팟캐스트)를 재생하는 크로스 플랫폼(iOS / Android) 알람 애플리케이션입니다.
Firebase Storage 연동을 통해 원격 오디오 파일을 다운로드하거나 기기 내 저장된 개인 오디오 파일을 선택하여 **앱이 종료되거나 백그라운드에 있는 상태에서도 네이티브 수준의 알람 및 재생**을 지원합니다.

---

## 🚀 주요 기능 (Features)

1. **완벽한 백그라운드 재생 지원**
   - **Android:** 지정된 알람 시간에 기기가 Doze 모드(초절전 상태)이거나 앱이 완전히 종료(Killed)된 상태여도 백그라운드 오디오 세션을 깨워 사용자 개입 없이 즉시 연속 재생합니다.
   - **iOS:** 애플 정책을 준수하여 22초 미만의 커스텀 로컬 푸시 알람음으로 잠을 먼저 깨운 뒤, 사용자가 푸시 알림을 **터치(Tap)**하여 앱으로 진입하는 순간 팟캐스트 목록 연속 재생을 이어갑니다.

2. **다중 소스 오디오 지원 (Firebase & Local)**
   - `Firebase Storage (gs://)` 경로의 오디오 파일을 알람 설정 시 기기에 자동으로 다운로드(캐싱)하여 네트워크가 끊어진 상태에서도 문제없이 재생합니다.
   - `expo-document-picker`를 활용하여 사용자의 스마트폰에 저장된 오디오 파일(MP3, WAV 등)을 직접 골라 재생 목록에 통합할 수 있습니다.

3. **고급 오디오 제어 경험**
   - 잠금 화면(Lock Screen) 미디어 컨트롤, 에어팟/블루투스 이어폰을 통한 재생/일시정지/다음곡 넘기기 등을 `react-native-track-player`를 통해 네이티브 수준에서 제어합니다.

4. **직관적인 알람 설정 UI**
   - 휠(Wheel) 스크롤 방식의 직관적인 타임피커(`react-native-date-picker`) 및 요일 선택 토글 버튼.

---

## 🛠 필수 선행 조건 (Prerequisites)

이 프로젝트는 시스템의 핵심 권한인 `AlarmManager`, 백그라운드 미디어 세션, 로컬 기반 푸시 알림 기능을 깊게 제어합니다.
따라서 **Expo Go 앱에서는 동작하지 않으며, 반드시 네이티브 코드가 포함된 Expo Prebuild(커스텀 데브 클라이언트) 환경을 사용해야 합니다.**

**요구 환경:**
- Node.js 18 이상
- npm 또는 yarn
- Xcode (iOS 빌드 및 커스텀 오디오 파일 삽입용)
- Android Studio (Android 빌드 및 에뮬레이터용)

---

## 📦 설치 및 세팅 (Installation & Setup)

1. **패키지 설치 및 네이티브 코드 생성 (Prebuild)**
   ```bash
   npm install
   npx expo prebuild --clean
   ```

2. **Firebase 프로젝트 연동 구성**
   - `firebaseConfig.js` 파일을 열어 본인의 Firebase 설정 정보(`apiKey`, `projectId` 등)를 기입하세요.
   - Firebase Console의 Storage 규칙에서 파일 읽기/다운로드가 허용되어 있는지 확인해야 합니다 (권한 이슈 발생 시 403 Forbidden 주의).

3. **🚨 [중요] iOS 커스텀 알람 소리 설정**
   iOS 정책상 알림이 올 때 울리는 30초 이하의 소리는 앱을 빌드할 때 파일이 내부에 존재해야 합니다.
   - 맥에서 생성된 `ios/PodcastAlarm.xcworkspace` 파일을 Xcode로 엽니다.
   - 22초 이하의 `wakeup-sound.wav` (이름 정확히 일치) 오디오 파일을 드래그 앤 드롭으로 프로젝트 탐색기에 넣습니다.
   - 모달 창이 뜰 때 반드시 **"Copy items if needed"** 및 **"Add to targets" (현재 앱 이름 체크)** 항목을 선택해야 알람음으로 동작합니다.

---

## ▶️ 실행 방법 (Running the App)

Expo Prebuild로 뽑아낸 네이티브 폴더(`/android`, `/ios`)를 바탕으로 빌드해야만 알람이 울립니다. 
USB로 연결된 실 기기를 사용하시기를 적극 권장합니다. (특히 백그라운드 테스트의 경우 시뮬레이터에서 제한이 많음)

**Android 빌드 및 실행**
```bash
npx expo run:android
```

**iOS 빌드 및 실행**
```bash
npx expo run:ios
```

---

## 🧪 알람 기능 테스트 시나리오

1. **앱 초기화**
   앱을 켜면 필요한 알림 전송 권한 및 백그라운드 권한을 요청합니다. 권한을 허용합니다.
2. **알람 세팅**
   UI 화면의 휠 피커로 현재 시간보다 1분 혹은 2분 뒤로 시간을 맞추고, 반복할 요일을 선택한 뒤 **[저장하기]** 버튼을 누릅니다.
   > *Firebase Storage나 로컬 내부 저장소의 파일이 캐싱/복사되어 백그라운드 재생 목록으로 구성됩니다.*
3. **앱 종료 및 대기**
   - **Android:** 앱을 스와이프하여 완전히 종료(Kill) 하거나, 뒤로 가기로 백그라운드로 내린 후 화면을 꺼버립니다. 시간이 되면 `Notifee`를 통해 사용자 개입 없이 시스템 음악이 흘러나옵니다.
   - **iOS:** 앱을 백그라운드로 보내고 기기를 잠급니다. 알람 시간이 되면 `wakeup-sound.wav` 소리와 함께 푸시 알림이 화면을 깨웁니다. **그 알림을 터치하고 들어오는 순간** 준비된 팟캐스트 재생이 시작됩니다.

---

## 🌐 웹 버전 지원 (Web Platform Support)

이 프로젝트는 이제 웹 브라우저에서도 실행 가능합니다.

- **오디오 엔진:** 웹 환경 호환성 및 안정성을 위해 `react-native-track-player` 대신 Expo의 공식 `expo-av` 라이브러리로 오디오 엔진이 교체되었습니다.
- **알람 동작 방식:** 웹 브라우저는 백그라운드 푸시 알람(OS Native Notification) 권한이 없으므로, **웹에서는 데모 목적으로 알람 저장 시 즉시 재생**되도록 분기 처리되어 체험할 수 있습니다.
- **UI 호환성:** 안드로이드 및 iOS에서 사용되는 네이티브 타임 피커는 웹 환경에서 호환되지 않으므로, 웹 브라우저에서는 표준 `<input type="time">` 렌더링으로 자동 대체하여 작동합니다.

**웹으로 실행 및 빌드하기:**
```bash
npx expo start --web
# 프로덕션 빌드 폴더 생성 (dist)
npx expo export --platform web 
```

---

## 📚 주요 라이브러리 구조
- **[@notifee/react-native](https://notifee.app):** 기기 OS별 강력한 로컬 알림, Android Doze 모드 관리 트리거.
- **[react-native-track-player](https://react-native-track-player.js.org/):** 오디오 세션 유지, 재생 목록 관리, 잠금화면 컨트롤.
- **[Firebase Storage (firebase/storage)](https://firebase.google.com/):** 클라우드에 올려둔 팟캐스트/오디오 다운로드 대역 확보.
- **[expo-document-picker / expo-file-system](https://docs.expo.dev/):** 개인 오디오 파일을 앱의 캐시에 복사하여 재생 루트 부여.
- **[react-native-date-picker](https://github.com/henninghall/react-native-date-picker):** 휠 기반의 직관적인 UI 피커 설계.

---

## 🚫 문제 해결 가이드 (Troubleshooting)

- **소리가 나지 않거나 (Android) 알림이 오지 않아요:**
  최신 안드로이드 13(API 33) 이상, 안드로이드 14 등에서는 `POST_NOTIFICATIONS` 및 `SCHEDULE_EXACT_ALARM` 권한이 매우 엄격합니다. 기기의 설정 앱 -> 애플리케이션 -> 해당 앱 -> **알람 및 리마인더 / 알림 권한**이 허용되어 있는지 확인해야 합니다.
- **iOS에서 알림은 뜨는데 기본 띠링(트라이톤) 소리만 납니다:**
  Xcode에서 `.wav` 파일을 추가할 때 Target 체크를 누락했거나, 이름이 `wakeup-sound.wav`로 일치하지 않기 때문입니다.
- **Firebase에서 파일을 받아올 수 없습니다 (Network Error):**
  Firebase Storage 규칙(Rules)이 잠겨있거나 올바르지 않은 `gs://` 주소가 들어있기 때문입니다. 콘솔을 확인해주세요.
