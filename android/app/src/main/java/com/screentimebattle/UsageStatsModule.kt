package com.screentimebattle

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.Calendar

class UsageStatsModule(private val ctx: ReactApplicationContext) :
    ReactContextBaseJavaModule(ctx) {

  override fun getName() = "UsageStats"

  @Suppress("DEPRECATION")
  @ReactMethod
  fun hasPermission(promise: Promise) {
    val ops = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = ops.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
    promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
  }

  @ReactMethod
  fun openSettings() {
    ctx.startActivity(
      Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
  }

  // Foreground time per app since local midnight, computed from raw activity
  // events (resumed / paused). Unlike queryAndAggregateUsageStats this never
  // includes time from before midnight, background audio, or foreground services.
  @ReactMethod
  fun getTodayUsage(promise: Promise) {
    try {
      val now = System.currentTimeMillis()
      val start = Calendar.getInstance().apply {
        set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
      }.timeInMillis

      val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      // Look back 24h so apps already open at midnight are tracked correctly.
      val events = usm.queryEvents(start - 24L * 60 * 60 * 1000, now)
      val ev = UsageEvents.Event()

      val open = HashMap<String, HashSet<String>>() // pkg -> open activity classes
      val since = HashMap<String, Long>()           // pkg -> when it came to the foreground
      val total = HashMap<String, Long>()           // pkg -> ms of foreground time today
      var screenOn = true

      fun close(pkg: String, end: Long) {
        val s = since.remove(pkg) ?: return
        val a = maxOf(s, start)
        if (end > a) total[pkg] = (total[pkg] ?: 0L) + (end - a)
      }

      while (events.hasNextEvent()) {
        events.getNextEvent(ev)
        val pkg = ev.packageName ?: ""
        val cls = ev.className ?: ""
        when (ev.eventType) {
          1 -> { // ACTIVITY_RESUMED / MOVE_TO_FOREGROUND
            if (pkg.isNotEmpty()) {
              val set = open.getOrPut(pkg) { HashSet() }
              if (set.isEmpty()) since[pkg] = ev.timeStamp
              set.add(cls)
            }
          }
          2 -> { // ACTIVITY_PAUSED / MOVE_TO_BACKGROUND
            val set = open[pkg]
            if (set != null) {
              set.remove(cls)
              if (set.isEmpty()) close(pkg, ev.timeStamp)
            }
          }
          16, 26 -> { // screen off, or shutdown: end every open session
            for (p in open.keys.toList()) {
              open[p]!!.clear()
              close(p, ev.timeStamp)
            }
            screenOn = false
          }
          15 -> screenOn = true // screen on
        }
      }
      // whatever is in the foreground right now
      if (screenOn) {
        for (p in open.keys.toList()) {
          if (open[p]!!.isNotEmpty()) close(p, now)
        }
      }

      val pm = ctx.packageManager
      val out = Arguments.createArray()
      for ((pkg, ms) in total) {
        val minutes = (ms / 60000).toInt()
        if (minutes < 1 || pkg == ctx.packageName) continue
        if (pm.getLaunchIntentForPackage(pkg) == null) continue
        val label = try {
          pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
        } catch (e: Exception) {
          continue
        }
        out.pushMap(Arguments.createMap().apply {
          putString("name", label); putInt("minutes", minutes)
        })
      }
      promise.resolve(out)
    } catch (e: Exception) {
      promise.reject("USAGE_ERROR", e)
    }
  }
}