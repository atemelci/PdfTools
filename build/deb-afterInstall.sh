#!/bin/bash
# Custom .deb post-install for PDF Tools.
#
# This replaces electron-builder's default script for one reason: the default
# only gives chrome-sandbox the SUID bit (mode 4755) when the kernel has NO
# user namespaces. Ubuntu 23.10+ ships user namespaces but restricts them for
# unprivileged apps via AppArmor, so at runtime Chromium falls back to the
# setuid sandbox and aborts unless chrome-sandbox is 4755. We therefore set it
# unconditionally. Everything else mirrors the default script.

# Symlink the launcher into PATH (prefer update-alternatives when available).
if type update-alternatives 2>/dev/null >&1; then
    if [ -L '/usr/bin/pdf-tools' -a -e '/usr/bin/pdf-tools' -a "`readlink '/usr/bin/pdf-tools'`" != '/etc/alternatives/pdf-tools' ]; then
        rm -f '/usr/bin/pdf-tools'
    fi
    update-alternatives --install '/usr/bin/pdf-tools' 'pdf-tools' '/opt/PDF-Tools/pdf-tools' 100 || ln -sf '/opt/PDF-Tools/pdf-tools' '/usr/bin/pdf-tools'
else
    ln -sf '/opt/PDF-Tools/pdf-tools' '/usr/bin/pdf-tools'
fi

# Always give chrome-sandbox root ownership + the SUID bit so the sandbox
# works even when unprivileged user namespaces are restricted.
chown root:root '/opt/PDF-Tools/chrome-sandbox' 2>/dev/null || true
chmod 4755 '/opt/PDF-Tools/chrome-sandbox' 2>/dev/null || true

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi
