#  Android Root Detection Bypass Lab (Frida)

##  Objectif
Ce lab a pour but de :
- Comprendre les techniques de détection de root sur Android
- Utiliser Frida pour intercepter et modifier le comportement d’une application
- Bypasser les mécanismes de détection de root

---

##  Environnement
- Android Emulator (rooté)
- ADB (Android Debug Bridge)
- Frida (version 17.9.1)
- Application test : Root Checker (joeykrim)

---

##  Étapes réalisées

### 1. Configuration de l’environnement
- Installation de Frida sur le PC
- Vérification de la version :
```bash
frida --version
python -c "import frida; print(frida.__version__)"
```

- Ajout de ADB au PATH
- Vérification de la connexion :
```bash
adb devices
```

---

### 2. Lancement de l’émulateur
- Démarrage d’un émulateur Android rooté
- Vérification du root :
```bash
adb shell
su
```

---

### 3. Lancement de frida-server
```bash
adb push frida-server /data/local/tmp/
adb shell chmod 755 /data/local/tmp/frida-server
adb shell
su
/data/local/tmp/frida-server &
```

---

### 4. Vérification de la connexion Frida
```bash
frida-ps -Uai
```

---

### 5. Installation de l’application cible
```bash
adb install com.joeykrim.rootcheck.apk
```

- Lancement de l’application
- Vérification :
 Root détecté

---

### 6. Création du script de bypass

Fichier : `bypass_root.js`

```javascript
Java.perform(function () {

    var RootBinaries = ["su", "busybox"];

    var Runtime = Java.use("java.lang.Runtime");

    Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
        for (var i = 0; i < RootBinaries.length; i++) {
            if (cmd.indexOf(RootBinaries[i]) !== -1) {
                console.log("Blocked command: " + cmd);
                return null;
            }
        }
        return this.exec(cmd);
    };

    var File = Java.use("java.io.File");

    File.exists.implementation = function () {
        var name = this.getAbsolutePath();
        for (var i = 0; i < RootBinaries.length; i++) {
            if (name.indexOf(RootBinaries[i]) !== -1) {
                console.log("Bypass file check: " + name);
                return false;
            }
        }
        return this.exists();
    };

    console.log("Bypass Root OK");
});
```

---

### 7. Injection avec Frida

```bash
frida -U -f com.joeykrim.rootcheck -l bypass_root.js
```

Puis dans la console Frida :
```bash
%resume
```

---

### 8. Résultat

- Avant bypass :
 Root access detected

- Après bypass :
 Root access NOT detected

---

## Techniques utilisées

- Hook Java (Frida)
- Interception de :
  - `Runtime.exec()` → bloque commandes root
  - `File.exists()` → masque fichiers suspects
- Injection dynamique sans modification de l’APK

---

##  Démonstration (captures)

###  1. Configuration et connexion ADB
![ADB Setup](images/adb_setup.png)

###  2. Lancement frida-server
![Frida Server](images/frida_server.png)

###  3. Liste des applications
![Frida PS](images/frida_ps.png)

###  4. Application avant bypass
![Before](images/before.png)

###  5. Logs Frida (bypass actif)
![Frida Logs](images/frida_logs.png)

###  6. Application après bypass
![After](images/after.png)

---


##  Conclusion

Ce lab démontre que :
- Les mécanismes de détection de root peuvent être contournés
- Frida permet une modification dynamique puissante
- Les applications doivent renforcer leurs protections (obfuscation, anti-debug, etc.)

---

