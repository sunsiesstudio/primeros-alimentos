package com.sunsiesstudio.primerosalimentos;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/** Guarda una imagen (PNG en base64) directamente en la galería. */
@CapacitorPlugin(name = "SaveImage")
public class SaveImagePlugin extends Plugin {
    @PluginMethod
    public void save(PluginCall call) {
        String b64 = call.getString("data");
        String name = call.getString("name", "primeros-alimentos-" + System.currentTimeMillis() + ".png");
        if (b64 == null) { call.reject("bad_image"); return; }
        try {
            byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentResolver cr = getContext().getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.Images.Media.DISPLAY_NAME, name);
                v.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                v.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Primeros Alimentos");
                Uri uri = cr.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v);
                if (uri == null) { call.reject("error"); return; }
                try (OutputStream os = cr.openOutputStream(uri)) { os.write(bytes); }
            } else {
                File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "Primeros Alimentos");
                if (!dir.exists()) dir.mkdirs();
                File f = new File(dir, name);
                try (FileOutputStream os = new FileOutputStream(f)) { os.write(bytes); }
                android.media.MediaScannerConnection.scanFile(getContext(), new String[]{f.getAbsolutePath()}, new String[]{"image/png"}, null);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
