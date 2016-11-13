package com.zmxv.RNSound;

import android.annotation.SuppressLint;
import android.content.res.AssetFileDescriptor;
import android.content.res.Resources;
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
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.module.annotations.ReactModule;

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
    public void prepare(final ReadableMap source, final Integer key, final Callback callback) {
        final Uri uri = Uri.parse(source.getString("uri"));

        MediaPlayer player = new MediaPlayer();
        player.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mp) {
                WritableMap props = Arguments.createMap();
                props.putDouble("duration", mp.getDuration() * .001);
                callback.invoke(null, props);
            }
        });
        player.setOnErrorListener(new OnErrorListener() {
            @Override
            public boolean onError(MediaPlayer mp, int what, int extra) {
                Log.e(TAG, "Got error " + what + " extra " + extra);
                return false;
            }
        });

        String dataSourceUriString = uri.toString();
        if (uri.isRelative()) {
            String name = uri.getPath();
            if (name.indexOf(".") > 0) {
                name = name.substring(0, name.lastIndexOf("."));
            }

            ReactApplicationContext context = getReactApplicationContext();
            Resources res = context.getResources();

            final String packageName = context.getPackageName();
            String type = "raw";
            int id = 0;

            id = res.getIdentifier(name, type, packageName);
            if (id == 0) {
                // Because strange programmers at Facebook ((
                // react-native packager copy all types of resources to drawables
                type = "drawable";
                id = res.getIdentifier(name, type, packageName);
            }
            if (id == 0) {
                type = "unknown";
                String msg = "Can't find resource for " + type + "/" + name;
                Log.e(TAG, msg);
                callback.invoke(createJSError(msg));
                return;
            }

            try {
                AssetFileDescriptor fd = res.openRawResourceFd(id);
                player.setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
                fd.close();
            }
            catch (Exception e) {
                Log.e(TAG, "can't set data source: " + e.toString());
                callback.invoke(createJSError(e.getMessage()));
                return;
            }
        }
        else {
            try {
                player.setDataSource(uri.toString());
            }
            catch (Exception e) {
                Log.e(TAG, "can't set data source: " + e.toString());
                callback.invoke(createJSError(e.getMessage()));
                return;
            }
        }


        playerPool.put(key, player);
        player.prepareAsync();
    }

    private WritableMap createJSError(final String message) {
        WritableMap err = Arguments.createMap();
        err.putInt("code", -1);
        err.putString("message", message);
        return err;
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
        // stub
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = MapBuilder.newHashMap();
        constants.put("IsAndroid", true);
        return constants;
    }
}
