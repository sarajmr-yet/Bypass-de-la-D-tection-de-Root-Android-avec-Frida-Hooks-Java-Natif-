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

    console.log("Bypass Root OK ");
});