package com.indahmombabyspa.app

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class ClinicNotificationWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        private const val TAG = "ClinicNotifWorker"
        private const val PREFS_NAME = "indah_spa_worker_prefs"
        private const val KEY_LAST_STATUS = "last_operational_status"
        private const val KEY_LAST_ANNOUNCEMENT_ID = "last_announcement_id"
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val supabaseUrl = BuildConfig.SUPABASE_URL
        val supabaseAnonKey = BuildConfig.SUPABASE_ANON_KEY

        // Lewati jika Supabase belum dikonfigurasi (placeholder)
        if (supabaseUrl.isBlank() ||
            supabaseUrl.contains("your-project-ref") ||
            supabaseAnonKey.contains("your-anon-key-here")
        ) {
            Log.d(TAG, "Supabase belum dikonfigurasi. Melewati pengecekan notifikasi background.")
            return@withContext Result.success()
        }

        try {
            checkOperationalStatus(supabaseUrl, supabaseAnonKey)
            checkLatestAnnouncement(supabaseUrl, supabaseAnonKey)
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Gagal sinkronisasi data klinik dari Supabase: ${e.message}", e)
            Result.retry()
        }
    }

    /**
     * Mengecek perubahan status operasional klinik (open, busy_homecare, closed_today)
     */
    private fun checkOperationalStatus(baseUrl: String, anonKey: String) {
        val endpoint = "$baseUrl/rest/v1/clinic_settings?key=eq.clinic_operational_status&select=key,operational_status,operational_note"
        val responseText = executeHttpGet(endpoint, anonKey) ?: return

        try {
            val jsonArray = JSONArray(responseText)
            if (jsonArray.length() == 0) return

            val item = jsonArray.getJSONObject(0)
            val currentStatus = item.optString("operational_status", "open")
            val operationalNote = item.optString("operational_note", "").trim()

            val lastStatus = prefs.getString(KEY_LAST_STATUS, null)

            // Jika ada perubahan status operasional
            if (lastStatus != null && lastStatus != currentStatus) {
                when (currentStatus) {
                    "busy_homecare" -> {
                        val body = if (operationalNote.isNotEmpty()) {
                            operationalNote
                        } else {
                            "Bidan sedang melayani homecare di luar klinik. Konsultasi dan reservasi tetap dilayani via WhatsApp."
                        }
                        showNotification(
                            notificationId = 101,
                            title = "🚐 Sedang Layanan Homecare",
                            message = body
                        )
                    }
                    "closed_today" -> {
                        val body = if (operationalNote.isNotEmpty()) {
                            operationalNote
                        } else {
                            "Klinik libur/tutup sementara hari ini. Reservasi untuk jadwal hari berikutnya tetap dibuka."
                        }
                        showNotification(
                            notificationId = 102,
                            title = "🗓️ Klinik Tutup Sementara Hari Ini",
                            message = body
                        )
                    }
                    "open" -> {
                        if (lastStatus == "closed_today" || lastStatus == "busy_homecare") {
                            showNotification(
                                notificationId = 103,
                                title = "✨ Indah Mom & Baby Spa Buka Normal",
                                message = "Klinik siap melayani Mom & Si Kecil dengan penuh kasih sayang. Silakan reservasi slot Anda!"
                            )
                        }
                    }
                }
            }

            // Simpan status terbaru ke SharedPreferences
            prefs.edit().putString(KEY_LAST_STATUS, currentStatus).apply()

        } catch (e: Exception) {
            Log.e(TAG, "Gagal memproses JSON operational status: ${e.message}")
        }
    }

    /**
     * Mengecek pengumuman / tips terbaru dari Bidan yang aktif
     */
    private fun checkLatestAnnouncement(baseUrl: String, anonKey: String) {
        val endpoint = "$baseUrl/rest/v1/clinic_announcements?is_active=eq.true&order=created_at.desc&limit=1&select=id,title,message,category,created_at"
        val responseText = executeHttpGet(endpoint, anonKey) ?: return

        try {
            val jsonArray = JSONArray(responseText)
            if (jsonArray.length() == 0) return

            val item: JSONObject = jsonArray.getJSONObject(0)
            val announcementId = item.getString("id")
            val title = item.optString("title", "Pengumuman Klinik").trim()
            val message = item.optString("message", "").trim()
            val category = item.optString("category", "info").lowercase()

            val lastAnnouncementId = prefs.getString(KEY_LAST_ANNOUNCEMENT_ID, null)

            // Jika pengumuman baru terbit dan ID berbeda dari yang tersimpan
            if (lastAnnouncementId != announcementId) {
                val prefix = when (category) {
                    "holiday" -> "🗓️ Info Libur: "
                    "health_tip" -> "💡 Tips Bidan: "
                    else -> "📢 Info Bidan: "
                }

                showNotification(
                    notificationId = announcementId.hashCode(),
                    title = "$prefix$title",
                    message = message
                )

                // Simpan ID pengumuman terakhir
                prefs.edit().putString(KEY_LAST_ANNOUNCEMENT_ID, announcementId).apply()
            }

        } catch (e: Exception) {
            Log.e(TAG, "Gagal memproses JSON pengumuman: ${e.message}")
        }
    }

    /**
     * Menampilkan Push Notification native Android
     */
    private fun showNotification(notificationId: Int, title: String, message: String) {
        val channelId = context.getString(R.string.notif_channel_id)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setColor(ContextCompat.getColor(context, R.color.deep_plum))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notificationId, notification)
    }

    /**
     * Helper HTTP GET ringan tanpa library pihak ketiga
     */
    private fun executeHttpGet(urlString: String, anonKey: String): String? {
        var connection: HttpURLConnection? = null
        return try {
            val url = URL(urlString)
            connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 15000
                readTimeout = 15000
                setRequestProperty("apikey", anonKey)
                if (anonKey.startsWith("eyJ")) {
                    setRequestProperty("Authorization", "Bearer $anonKey")
                }
            }

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val sb = StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    sb.append(line)
                }
                reader.close()
                sb.toString()
            } else {
                Log.w(TAG, "HTTP GET gagal: Response code $responseCode untuk $urlString")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception saat HTTP GET: ${e.message}")
            null
        } finally {
            connection?.disconnect()
        }
    }
}