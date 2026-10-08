package com.akviso.threatintel;

import android.app.Activity;
import android.os.Bundle;
import android.Manifest;
import android.content.pm.PackageManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import java.util.Locale;
import java.util.Set;

public class MainActivity extends Activity {
    private static final String PORTAL_URL =
        "https://akvisomr-eng.github.io/threat-intelligence-portal/";

    private WebView webView;
    private TextToSpeech tts;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (android.os.Build.VERSION.SDK_INT >= 23 &&
            checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 1001);
        }

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(new Locale("id", "ID"));
                if (android.os.Build.VERSION.SDK_INT >= 21) {
                    Set<Voice> voices = tts.getVoices();
                    if (voices != null) {
                        for (Voice voice : voices) {
                            Locale l = voice.getLocale();
                            if ("id".equalsIgnoreCase(l.getLanguage()) &&
                                "ID".equalsIgnoreCase(l.getCountry()) &&
                                !voice.isNetworkConnectionRequired()) {
                                tts.setVoice(voice);
                                break;
                            }
                        }
                    }
                }
            }
        });

        webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        webView.addJavascriptInterface(new AURAVoice(), "AURAVoice");
        setContentView(webView);
        webView.loadUrl(PORTAL_URL);
    }

    private final class AURAVoice {
        @JavascriptInterface
        public void speak(String text) {
            runOnUiThread(() -> {
                if (tts == null || text == null || text.trim().isEmpty()) return;
                tts.stop();
                tts.setLanguage(new Locale("id", "ID"));
                tts.setSpeechRate(0.96f);
                tts.setPitch(1.0f);
                if (android.os.Build.VERSION.SDK_INT >= 21) {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "AURA_ID");
                } else {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
                }
            });
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> {
                if (tts != null) tts.stop();
            });
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
