package com.indahmombabyspa.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineLayout: LinearLayout
    private lateinit var btnRetry: Button

    private var hasPageError = false

    // Launcher untuk izin notifikasi pada Android 13+ (API 33+)
    private val requestNotificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                // Izin notifikasi diberikan oleh pengguna
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupNotificationChannel()
        setupNotificationPermission()
        setupWorkManager()
        setupBackNavigation()
        setupWebView()

        loadWebApp()
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        progressBar = findViewById(R.id.progressBar)
        offlineLayout = findViewById(R.id.offlineLayout)
        btnRetry = findViewById(R.id.btnRetry)

        // Palette Warna SwipeRefreshLayout: Deep Plum & Warm Gold
        swipeRefreshLayout.setColorSchemeResources(
            R.color.deep_plum,
            R.color.warm_gold,
            R.color.deep_plum_dark
        )

        swipeRefreshLayout.setOnRefreshListener {
            if (isNetworkAvailable()) {
                hasPageError = false
                webView.reload()
            } else {
                swipeRefreshLayout.isRefreshing = false
                showOfflineView(true)
            }
        }

        btnRetry.setOnClickListener {
            if (isNetworkAvailable()) {
                hasPageError = false
                showOfflineView(false)
                webView.reload()
            } else {
                Toast.makeText(this, "Internet belum terhubung, silakan cek kembali.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        // Tambahkan identifier aplikasi pada User-Agent
        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent IndahMomBabySpaApp/1.0"

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress in 1..99) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false

                if (!hasPageError) {
                    showOfflineView(false)
                }
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    hasPageError = true
                    swipeRefreshLayout.isRefreshing = false
                    showOfflineView(true)
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                return handleExternalUri(url)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url == null) return false
                return handleExternalUri(url)
            }
        }
    }

    private fun handleExternalUri(url: String): Boolean {
        val uri = Uri.parse(url)
        val scheme = uri.scheme?.lowercase() ?: ""
        val host = uri.host?.lowercase() ?: ""

        // 1. WhatsApp Intent (wa.me, api.whatsapp.com, whatsapp://)
        if (scheme == "whatsapp" || host == "wa.me" || host.contains("api.whatsapp.com")) {
            return try {
                val waIntent = Intent(Intent.ACTION_VIEW, uri)
                startActivity(waIntent)
                true
            } catch (e: Exception) {
                Toast.makeText(this, "Aplikasi WhatsApp tidak ditemukan di perangkat.", Toast.LENGTH_SHORT).show()
                true
            }
        }

        // 2. Telepon / Dial (tel:)
        if (scheme == "tel") {
            return try {
                startActivity(Intent(Intent.ACTION_DIAL, uri))
                true
            } catch (e: Exception) {
                false
            }
        }

        // 3. Email (mailto:)
        if (scheme == "mailto") {
            return try {
                startActivity(Intent(Intent.ACTION_SENDTO, uri))
                true
            } catch (e: Exception) {
                false
            }
        }

        // 4. Google Maps (maps.google.com, maps.app.goo.gl, geo:)
        if (scheme == "geo" || host.contains("maps.google.com") || host.contains("maps.app.goo.gl") || url.contains("google.com/maps")) {
            return try {
                val mapIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage("com.google.android.apps.maps")
                }
                startActivity(mapIntent)
                true
            } catch (e: Exception) {
                try {
                    // Fallback ke browser jika aplikasi Maps bawaan tidak ada
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    true
                } catch (e2: Exception) {
                    false
                }
            }
        }

        // 5. URL Internal Aplikasi (indahmombabyspa.com) -> Tetap muat di WebView
        val appBaseHost = Uri.parse(BuildConfig.WEB_BASE_URL).host ?: "indahmombabyspa.com"
        if (host.endsWith(appBaseHost) || host.contains("indahmombabyspa")) {
            return false
        }

        // 6. Tautan Eksternal Lainnya (Instagram, TikTok, dll.) -> Buka di browser eksternal
        return try {
            val externalIntent = Intent(Intent.ACTION_VIEW, uri)
            startActivity(externalIntent)
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun loadWebApp() {
        if (isNetworkAvailable()) {
            hasPageError = false
            showOfflineView(false)
            webView.loadUrl(BuildConfig.WEB_BASE_URL)
        } else {
            hasPageError = true
            showOfflineView(true)
        }
    }

    private fun showOfflineView(show: Boolean) {
        if (show) {
            offlineLayout.visibility = View.VISIBLE
            swipeRefreshLayout.visibility = View.GONE
        } else {
            offlineLayout.visibility = View.GONE
            swipeRefreshLayout.visibility = View.VISIBLE
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun setupNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permissionStatus = ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            )
            if (permissionStatus != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun setupNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = getString(R.string.notif_channel_id)
            val channelName = getString(R.string.notif_channel_name)
            val channelDesc = getString(R.string.notif_channel_desc)

            val channel = NotificationChannel(
                channelId,
                channelName,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = channelDesc
                enableLights(true)
                lightColor = ContextCompat.getColor(this@MainActivity, R.color.warm_gold)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun setupWorkManager() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val periodicWorkRequest = PeriodicWorkRequestBuilder<ClinicNotificationWorker>(
            15, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            "ClinicNotificationWork",
            ExistingPeriodicWorkPolicy.KEEP,
            periodicWorkRequest
        )
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager =
            getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onDestroy() {
        webView.stopLoading()
        webView.destroy()
        super.onDestroy()
    }
}
