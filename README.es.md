# MarkDownEditor

**Un visor y editor de Markdown rápido y portable para Windows.**
Haz doble clic en un archivo `.md` y simplemente se abre — sin instalación.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-10.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.ko.md) · [English](README.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **Español** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

### ⬇️ [Instalador de Windows](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-Setup-x64.exe) &nbsp;·&nbsp; [ZIP portátil](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip) &nbsp;·&nbsp; <sub>[novedades](https://github.com/jjw1270/MarkdownEditor/releases/latest)</sub>

![Vista previa — interfaz en español](docs/images/es/preview.png)

## Características

- **Portable de forma predeterminada** — descomprime y ejecuta. El runtime de WebView2 viene incluido; la configuración y la caché se guardan junto al exe. Si esa carpeta es de solo lectura, se usa `%TEMP%\MarkDownEditor`.
- **Actualización automática** — la aplicación comprueba silenciosamente GitHub Releases al iniciar; cuando hay una versión nueva, aparece un punto rojo junto a la versión en la barra de título. Haz clic en la versión → **Nueva versión disponible** y actualiza dentro de la aplicación con barra de progreso — la configuración y la sesión se conservan. (La actualización automática — comprobación anónima de versión y descarga solo cuando la inicias — es el único acceso a la red de la aplicación; nunca se envían documentos ni datos personales.)
- **Una ventana, muchas pestañas** — cada archivo se abre como pestaña en una sola ventana (instancia única mediante mutex + named pipe). Las pestañas se reordenan arrastrando y se recorren con `Ctrl+Tab`.
- **Todos los enlaces funcionan** — los enlaces `.md` se abren en una pestaña nueva, los enlaces web en tu navegador, las carpetas en el Explorador y los demás documentos en su aplicación predeterminada. Se admiten anclas entre documentos (`doc.md#sección`).
- **Atrás / Adelante** — botones de la barra de herramientas, `Alt+←`/`Alt+→`, o botones 4/5 del ratón.
- **Renderizado estilo GitHub** — tablas, resaltado de código (sin conexión) y **diagramas mermaid** (sin conexión, adaptados al tema).
- **Barra lateral de índice** — con resaltado de la sección actual según el desplazamiento (scroll-spy).
- **Edición ↔ Vista previa** — `Ctrl+E`, con la posición de desplazamiento sincronizada entre ambos modos.
- **Barra de formato** — aparece en modo edición: negrita, títulos, listas, casillas, cita, código, enlace, tabla, separador — un clic cada uno, **sin necesidad de saber Markdown** (todo se deshace con `Ctrl+Z`).
- **Menús contextuales** — clic derecho en la vista previa (copiar, abrir enlace, copiar dirección, ver imagen, buscar) o en el editor (cortar/copiar/pegar/seleccionar todo).
- **Buscar / Reemplazar** — `Ctrl+F` funciona tanto en la vista previa (resaltado de todas las coincidencias) como en edición; `Ctrl+H` reemplaza en modo edición.
- **Exportar a PDF** — el botón `📄` junto a Guardar, o `Ctrl+P`, siempre en tema claro.
- **Pegar imágenes del portapapeles** — se guardan en una carpeta `images/` junto al documento y el enlace se inserta automáticamente.
- **Recarga automática ante cambios externos** — las ediciones de otros programas (IDE, editor) actualizan la pestaña abierta; tus cambios sin guardar nunca se sobrescriben en silencio.
- **Copia de seguridad automática y recuperación** — los cambios sin guardar se capturan cada 30 s y se ofrecen para recuperar en el siguiente inicio.
- **Restauración de sesión** — al iniciar sin archivo, se reabren las pestañas anteriores. Los archivos recientes están en el botón 🕘.
- **Detección de codificación coreana** — los archivos CP949/EUC-KR sin BOM se abren correctamente junto con UTF-8.
- **Tema oscuro / claro** — se alterna con el botón `🌙`/`☀` de la barra de título, se recuerda entre sesiones e incluye la barra de título de Windows.
- **Interfaz en 10 idiomas** — 한국어, English, 日本語, 简体中文, 繁體中文, Español, Français, Deutsch, Русский, Português. Sigue el idioma del sistema por defecto; cámbialo cuando quieras desde el botón `🌐`.
- **Interfaz compacta estilo Bloc de notas** — pestañas y herramientas integradas en una barra de título personalizada (arrastra la zona vacía para mover, doble clic para maximizar).

![Menú de idiomas](docs/images/es/menu.png)

## 🚀 Instalación

Hay dos paquetes para Windows 10 versión 1809 o posterior y Windows 11 (x64). Ninguno requiere permisos de administrador.

| Paquete | Recomendado para | Tamaño | Runtime y datos |
|---|---|---:|---|
| **[Instalador de Windows](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-Setup-x64.exe)** | Uso diario normal | aprox. 45 MB | Instalación por usuario, WebView2 Evergreen con actualizaciones de seguridad, menú Inicio y «Abrir con». Datos en `%LOCALAPPDATA%\MarkDownEditor`. Solo necesita Internet si falta WebView2; si no puede instalarse el requisito, el instalador muestra un error. |
| **[ZIP portátil](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip)** | USB, uso sin conexión y sin instalación | aprox. 325 MB | Incluye WebView2 Fixed Runtime; los datos quedan junto a la aplicación cuando se puede escribir. |

### Opción portátil

**⬇️ [MarkDownEditor-standalone.zip](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip)** — este enlace apunta **siempre a la versión más reciente**.

| | |
|---|---|
| **Tamaño** | aprox. 325 MB — incluye WebView2 completo para funcionar sin conexión |
| **Requisitos** | Windows 10 u 11, 64 bits. Nada más. |
| **Más** | [Todas las versiones](https://github.com/jjw1270/MarkdownEditor/releases) · [Novedades de esta versión](https://github.com/jjw1270/MarkdownEditor/releases/latest) · [Registro de cambios completo](CHANGELOG.md) |

<details>
<summary><b>¿Prefieres la terminal?</b> Descargar, descomprimir y ejecutar con un bloque de PowerShell</summary>

```powershell
$dest = "$env:LOCALAPPDATA\Programs\MarkDownEditor-Portable"
$zip  = "$env:TEMP\MarkDownEditor-standalone.zip"

Invoke-WebRequest "https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip" -OutFile $zip
Expand-Archive $zip -DestinationPath $dest -Force
Remove-Item $zip

Start-Process "$dest\MarkDownEditor.exe"
```

Para actualizar más adelante, ejecuta el mismo bloque otra vez — o usa el actualizador integrado que se describe abajo.

</details>

### Paso 2 — Descomprimir y ejecutar

Extrae la carpeta en cualquier sitio donde tengas permiso de escritura: `C:\Tools\MarkDownEditor`, el Escritorio, una memoria USB — da igual. Después ejecuta **`MarkDownEditor.exe`**.

La carpeta contiene `MarkDownEditor.exe` más `web/` (la interfaz), `Runtime/` (el WebView2 incluido) y `WebView2Data/` (caché). Mientras se mantengan juntos, puedes mover, copiar o llevarte la carpeta entera a donde quieras.

> **El aviso azul de SmartScreen en el primer arranque es normal.** El ejecutable no está firmado, así que Windows muestra *"Windows protegió su PC"*. Pulsa **Más información → Ejecutar de todas formas**. Solo aparece una vez.
> Si prefieres no ejecutar un binario sin firmar, compilarlo tú mismo son dos comandos — consulta *Compilar desde el código fuente* más abajo.

### Paso 3 — Ponerlo como aplicación predeterminada para `.md` *(esto es lo importante)*

Una vez configurado, doble clic en cualquier archivo Markdown del Explorador y se abre renderizado al instante.

1. Clic derecho en cualquier archivo `.md` del Explorador
2. **Abrir con → Elegir otra aplicación**
3. Selecciona `MarkDownEditor.exe` — si no aparece en la lista, baja y usa **Elegir una aplicación en el PC**
4. Marca **Usar siempre esta aplicación para abrir los archivos .md** y pulsa **Aceptar**

Lo mismo sirve para `.markdown` y `.txt` si quieres abrirlos igual.

### Actualizaciones

Al iniciar, la aplicación consulta GitHub Releases de forma anónima. Tras pulsar **Actualizar**, verifica URL, tamaño, SHA-256, estructura y versión. La edición portátil sustituye el ZIP de forma atómica; la instalada ejecuta el siguiente instalador verificado. Se conservan la configuración y la sesión.

### Desinstalación

- **Edición instalada:** desinstálala desde **Configuración → Aplicaciones → Aplicaciones instaladas**. Se eliminan el programa, los accesos directos y sus entradas «Abrir con»; `%LOCALAPPDATA%\MarkDownEditor` se conserva para una reinstalación segura.
- **Edición portátil:** borra su carpeta; si se ejecutó desde una ubicación de solo lectura, borra también `%TEMP%\MarkDownEditor`.

## Atajos de teclado

| Tecla | Acción |
|------|------|
| `Ctrl+O` | Abrir (selección múltiple) |
| `Ctrl+N` | Nueva pestaña de documento |
| `Ctrl+S` | Guardar |
| `Ctrl+P` | Exportar como PDF |
| `Ctrl+E` | Alternar edición / vista previa |
| `Ctrl+F` / `Ctrl+H` | Buscar / Reemplazar |
| `Ctrl+B` / `Ctrl+I` | Negrita / Cursiva (modo edición, conmutable) |
| `Ctrl+K` | Insertar enlace (modo edición — la dirección queda preseleccionada) |
| `Tab` / `Shift+Tab` | Aumentar / reducir sangría (multilínea) |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Pestaña siguiente / anterior |
| `Ctrl+W` | Cerrar pestaña |
| `Alt+←` / `Alt+→` | Atrás / Adelante |

## Privacidad

- Los documentos se procesan localmente y nunca se suben. No hay telemetría ni identificadores.
- Durante el uso, la red solo sirve para consultar GitHub Releases y descargar una actualización iniciada por ti. En la primera instalación, Setup puede descargar WebView2 de Microsoft si falta en Windows.
- La edición instalada guarda datos en `%LOCALAPPDATA%\MarkDownEditor`; la portátil usa `WebView2Data/` o `%TEMP%\MarkDownEditor` si la ubicación es de solo lectura.
- Una política de seguridad de contenido estricta bloquea scripts, complementos, cambios de URL base y solicitudes automáticas de imágenes remotas. Las imágenes locales se incorporan localmente.

## Compilar desde el código fuente

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

Salida: `src/bin/Release/net10.0-windows/win-x64/publish/MarkDownEditor.exe`.
Coloca la carpeta `web/` (y opcionalmente un WebView2 Fixed Version Runtime como `Runtime/`) junto al exe.

### Arquitectura en un párrafo

El lado C# (WPF) se encarga de la E/S de archivos, la tubería de instancia única y el marco de la ventana; el lado web (JS puro en un único WebView2) posee todos los búferes de documentos y el estado de las pestañas. Ambos se comunican solo mediante `postMessage`. El renderizado usa marked + highlight.js + mermaid, todo incluido para funcionar sin conexión. Para el recorrido completo de funciones, consulta [README.ko.md](README.ko.md) (coreano) o [README.md](README.md) (inglés).

## Comentarios

Los informes de errores y las sugerencias de funciones son bienvenidos en [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) — o haz clic en la etiqueta de versión junto al título dentro de la aplicación (el formulario de error se rellena con tu versión actual).

## Licencia

MIT — consulta [LICENSE](LICENSE). Los componentes de terceros incluidos se listan en
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) (nota: el paquete de mermaid lleva un pequeño parche local documentado).
