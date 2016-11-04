package com.zmxv.RNSound;

import android.annotation.SuppressLint;
import android.content.Context;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.module.annotations.ReactModule;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@ReactModule(name="RNSound")
class RNSoundModule extends ReactContextBaseJavaModule {

    @SuppressLint("UseSparseArrays")
    private static final Map<Integer, MediaPlayer> playerPool = new HashMap<>();

    private static final String TAG = "RNSound";

    RNSoundModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNSound";
    }

    @ReactMethod
    public void prepare(final String fileName, final Integer key, final Callback callback) {
        MediaPlayer player = createMediaPlayer(fileName);
        if (player == null) {
            WritableMap e = Arguments.createMap();
            e.putInt("code", -1);
            e.putString("message", "resource not found");
            callback.invoke(e);
            return;
        }
        playerPool.put(key, player);
        WritableMap props = Arguments.createMap();
        props.putDouble("duration", player.getDuration() * .001);
        callback.invoke(null, props);
    }

    private MediaPlayer createMediaPlayer(final String fileName) {
        Context context = getReactApplicationContext();

        int res = context.getResources().getIdentifier(fileName, "raw", context.getPackageName());
        if (res != 0) {
            return MediaPlayer.create(context, res);
        }
        File file = new File(fileName);
        if (file.exists()) {
            Uri uri = Uri.fromFile(file);
            return MediaPlayer.create(context, uri);
        }
        return null;
    }

    @ReactMethod
    public void play(final Integer key, final Callback callback) {
        MediaPlayer player = playerPool.get(key);
        if (player == null) {
            callback.invoke(false);
            return;
        }
        if (player.isPlaying()) {
            return;
        }
        player.setOnCompletionListener(new OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mp) {
                if (!mp.isLooping()) {
                    callback.invoke(true);
                }
            }
        });
        player.setOnErrorListener(new OnErrorListener() {
            @Override
            public boolean onError(MediaPlayer mp, int what, int extra) {
                callback.invoke(false);
                return true;
            }
        });
        player.start();
    }

    @ReactMethod
    public void pause(final Integer key) {
        MediaPlayer player = playerPool.get(key);
        if (player != null && player.isPlaying()) {
            player.pause();
        }
    }

    @ReactMethod
    public void stop(final Integer key) {
        MediaPlayer player = playerPool.get(key);
        if (player != null && player.isPlaying()) {
            player.pause();
            player.seekTo(0);
        }
    }

    @ReactMethod
    public void release(final Integer key) {
        MediaPlayer player = playerPool.get(key);
        if (player != null) {
            player.release();
            playerPool.remove(key);
        }
    }

    @ReactMethod
    public void setVolume(final Integer key, final Float left, final Float right) {
        MediaPlayer player = playerPool.get(key);
        if (player != null) {
            player.setVolume(left, right);
        }
    }

    @ReactMethod
    public void setLooping(final Integer key, final Boolean looping) {
        MediaPlayer player = playerPool.get(key);
        if (player != null) {
            player.setLooping(looping);
        }
    }

    @ReactMethod
    public void setCurrentTime(final Integer key, final Float sec) {
        MediaPlayer player = playerPool.get(key);
        if (player != null) {
            player.seekTo(Math.round(sec * 1000));
        }
    }

    @ReactMethod
    public void getCurrentTime(final Integer key, final Callback callback) {
        MediaPlayer player = playerPool.get(key);
        if (player == null) {
            callback.invoke(-1, false);
            return;
        }
        callback.invoke(player.getCurrentPosition() * .001, player.isPlaying());
    }

    @ReactMethod
    public void enable(final Boolean enabled) {
        Log.d(TAG, "enable called with arg=" + enabled.toString());
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = MapBuilder.newHashMap();
        constants.put("IsAndroid", true);
        return constants;
    }
}
