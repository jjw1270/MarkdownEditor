# MarkDownEditor

**Un visor y editor de Markdown rápido y portable para Windows.**
Haz doble clic en un archivo `.md` y simplemente se abre — sin instalación.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **Español** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

![Vista previa — tema claro](docs/images/preview-light.png)

## Características

- **Portable** — descomprime y ejecuta. El runtime de WebView2 viene incluido; la configuración y la caché se guardan junto al exe, sin dejar rastros en el sistema.
- **Actualización automática** — la aplicación comprueba silenciosamente GitHub Releases al iniciar; cuando hay una versión nueva, la insignia `!` junto al título se ilumina. Actualiza dentro de la aplicación con barra de progreso — la configuración y la sesión se conservan. (Esta comprobación es el único acceso a la red de la aplicación; nunca se envían documentos ni datos personales.)
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

![Menú de idiomas](docs/images/menu.png)

## Primeros pasos

1. Descarga `MarkDownEditor-standalone.zip` desde Releases y **descomprímelo donde quieras**.
2. Ejecuta `MarkDownEditor.exe`. No hay instalador.
3. (Opcional) Establécelo como aplicación predeterminada para `.md`: clic derecho en un archivo `.md` → *Abrir con* → *Elegir otra aplicación* → selecciona `MarkDownEditor.exe` y marca *Siempre*.

> **Nota sobre SmartScreen** — el binario no está firmado, por lo que Windows puede mostrar un aviso de "editor desconocido" la primera vez. Elige *Más información → Ejecutar de todas formas*, o compílalo desde el código fuente (abajo).

### Requisitos

- Windows 10 / 11 (64 bits)
- No hace falta instalar WebView2 — se incluye un runtime de versión fija. (Las compilaciones sin él usan el runtime Evergreen instalado en el sistema.)

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

## Compilar desde el código fuente

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

Salida: `src/bin/Release/net9.0-windows/win-x64/publish/MarkDownEditor.exe`.
Coloca la carpeta `web/` (y opcionalmente un WebView2 Fixed Version Runtime como `Runtime/`) junto al exe.

### Arquitectura en un párrafo

El lado C# (WPF) se encarga de la E/S de archivos, la tubería de instancia única y el marco de la ventana; el lado web (JS puro en un único WebView2) posee todos los búferes de documentos y el estado de las pestañas. Ambos se comunican solo mediante `postMessage`. El renderizado usa marked + highlight.js + mermaid, todo incluido para funcionar sin conexión. Para el recorrido completo de funciones, consulta [README.md](README.md) (coreano) o [README.en.md](README.en.md) (inglés).

## Comentarios

Los informes de errores y las sugerencias de funciones son bienvenidos en [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) — o haz clic en la etiqueta de versión junto al título dentro de la aplicación (el formulario de error se rellena con tu versión actual).

## Licencia

MIT — consulta [LICENSE](LICENSE). Los componentes de terceros incluidos se listan en
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) (nota: el paquete de mermaid lleva un pequeño parche local documentado).
