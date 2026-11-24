# Aturan ProGuard untuk Indah Mom & Baby Spa
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.indahmombabyspa.app.** { *; }
-dontwarn androidx.work.**
