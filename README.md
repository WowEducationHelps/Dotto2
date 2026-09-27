# Do. mobile PWA — fixed

This ZIP contains the existing three-screen demo with repaired mobile splash and installation support. Account creation and login remain placeholders from the original demo.

## Open and install on a phone
1. Extract the ZIP and publish the contents of `do-pwa` to your HTTPS web host (index.html must be at the chosen web URL). Keep media and icons alongside the HTML. Root and subfolder hosting are supported.
2. Open that HTTPS URL directly in Chrome on Android or Safari on iPhone/iPad, not a file manager, ZIP preview, or in-app attachment viewer.
3. Android: tap Install app when available, or Chrome menu → Add to Home screen → Install.
4. iPhone/iPad: Safari → Share → Add to Home Screen → Add. Enable Open as Web App if offered.
5. Let the first online load finish before testing offline.

Opening a downloaded HTML file cannot create an installable PWA. Plain HTTP on a phone's network address is also insufficient; localhost is only a development exception on the same device.

## Repairs
- Silent, fast-start H.264 videos optimized for mobile, with orientation selected explicitly.
- Playback completion controls the transition; loading gets a separate timeout.
- Branded fallback when autoplay is blocked, media fails, or reduced motion is enabled.
- Skip cancels pending timers, so later screens are not unexpectedly reset.
- Install button uses the browser prompt when available and otherwise shows platform instructions.
- Offline video byte-range responses, including partial content and invalid-range handling.
- Video cache failure no longer prevents the shell installing; cache cleanup is limited to this app.
- Stable manifest identity and subfolder-safe paths.

The animated splash runs inside the app after opening. The initial operating-system launch screen is controlled by the browser/OS. A warm resume may retain the existing screen instead of reloading the intro.

## Updates
Upload all files together. Increment CACHE in sw.js whenever assets change. Reload the existing app online after deploying. If an old shortcut still points elsewhere, remove that shortcut and install the correct HTTPS URL.

## Local development
Run `python3 -m http.server 8000` from this folder and visit http://localhost:8000 on that computer. Physical-phone installation requires HTTPS hosting.
