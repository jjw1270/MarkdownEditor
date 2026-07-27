# MarkDownEditor

**Un visualiseur et éditeur Markdown rapide et portable pour Windows.**
Double-cliquez sur un fichier `.md` et il s'ouvre, tout simplement — aucune installation requise.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.ko.md) · [English](README.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · **Français** · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

### ⬇️ [Télécharger pour Windows](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip) &nbsp;·&nbsp; <sub>.zip, ~331 Mo · décompressez et lancez · [nouveautés](https://github.com/jjw1270/MarkdownEditor/releases/latest)</sub>

![Aperçu — thème clair](docs/images/preview-light.png)

## Points forts

- **Portable** — décompressez et lancez. Le runtime WebView2 est inclus ; les paramètres et le cache restent à côté de l'exe, sans laisser de traces sur le système.
- **Mise à jour automatique** — l'application vérifie discrètement GitHub Releases au démarrage ; quand une nouvelle version est disponible, une pastille rouge apparaît à côté de la version dans la barre de titre. Cliquez sur la version → **Nouvelle version disponible** et mettez à jour directement dans l'application avec une barre de progression — paramètres et session sont conservés. (La mise à jour automatique — vérification de version anonyme et téléchargement uniquement si vous la lancez — est le seul accès réseau de l'application ; aucun document ni donnée personnelle n'est jamais envoyé.)
- **Une fenêtre, plusieurs onglets** — chaque fichier s'ouvre dans un onglet d'une fenêtre unique (instance unique via mutex + named pipe). Les onglets se réordonnent par glisser-déposer et se parcourent avec `Ctrl+Tab`.
- **Tous les liens fonctionnent** — les liens `.md` s'ouvrent dans un nouvel onglet, les liens web dans votre navigateur, les dossiers dans l'Explorateur, les autres documents dans leur application par défaut. Les ancres entre documents (`doc.md#section`) sont prises en charge.
- **Précédent / Suivant** — boutons de la barre d'outils, `Alt+←`/`Alt+→`, ou boutons 4/5 de la souris.
- **Rendu façon GitHub** — tableaux, coloration syntaxique (hors ligne) et **diagrammes mermaid** (hors ligne, adaptés au thème).
- **Sommaire latéral** — avec mise en évidence de la section en cours de lecture (scroll-spy).
- **Édition ↔ Aperçu** — `Ctrl+E`, avec position de défilement synchronisée entre les deux modes.
- **Barre de mise en forme** — visible en mode édition : gras, titres, listes, cases à cocher, citation, code, lien, tableau, séparateur — un clic chacun, **aucune connaissance de Markdown requise** (tout est annulable avec `Ctrl+Z`).
- **Menus contextuels** — clic droit dans l'aperçu (copier, ouvrir le lien, copier l'adresse, afficher l'image, rechercher) ou dans l'éditeur (couper/copier/coller/tout sélectionner).
- **Rechercher / Remplacer** — `Ctrl+F` fonctionne dans l'aperçu (surlignage de toutes les correspondances) comme en édition ; `Ctrl+H` remplace en mode édition.
- **Export PDF** — le bouton `📄` à côté d'Enregistrer, ou `Ctrl+P`, toujours en thème clair.
- **Coller des images du presse-papiers** — enregistrées dans un dossier `images/` à côté du document, lien inséré automatiquement.
- **Rechargement automatique en cas de modification externe** — les modifications d'autres programmes (IDE, éditeur) actualisent l'onglet ouvert ; vos modifications non enregistrées ne sont jamais écrasées en silence.
- **Sauvegarde automatique et récupération** — les modifications non enregistrées sont capturées toutes les 30 s et proposées à la récupération au démarrage suivant.
- **Restauration de session** — lancé sans fichier, l'application rouvre les onglets précédents. Les fichiers récents sont accessibles via le bouton 🕘.
- **Détection de l'encodage coréen** — les fichiers CP949/EUC-KR sans BOM s'ouvrent correctement, comme l'UTF-8.
- **Thème sombre / clair** — bascule avec le bouton `🌙`/`☀` de la barre de titre, mémorisé entre les sessions, barre de titre Windows comprise.
- **Interface en 10 langues** — 한국어, English, 日本語, 简体中文, 繁體中文, Español, Français, Deutsch, Русский, Português. Suit la langue du système par défaut ; changez à tout moment via le bouton `🌐`.
- **Interface compacte façon Bloc-notes** — onglets et outils intégrés dans une barre de titre personnalisée (faites glisser la zone vide pour déplacer, double-cliquez pour agrandir).

![Menu des langues](docs/images/menu.png)

## 🚀 Installation

Pas d'installateur, pas de droits administrateur, aucune dépendance. Téléchargez, décompressez, lancez.

### Étape 1 — Télécharger

**⬇️ [MarkDownEditor-standalone.zip](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip)** — ce lien pointe **toujours vers la dernière version**.

| | |
|---|---|
| **Taille** | ~331 Mo — un runtime WebView2 complet est inclus, c'est pourquoi il n'y a rien d'autre à installer |
| **Prérequis** | Windows 10 ou 11, 64 bits. Rien d'autre. |
| **Plus** | [Toutes les versions](https://github.com/jjw1270/MarkdownEditor/releases) · [Nouveautés de cette version](https://github.com/jjw1270/MarkdownEditor/releases/latest) · [Journal des modifications complet](CHANGELOG.md) |

<details>
<summary><b>Vous préférez le terminal ?</b> Télécharger, décompresser et lancer en un bloc PowerShell</summary>

```powershell
$dest = "$env:LOCALAPPDATA\Programs\MarkDownEditor"
$zip  = "$env:TEMP\MarkDownEditor-standalone.zip"

Invoke-WebRequest "https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip" -OutFile $zip
Expand-Archive $zip -DestinationPath $dest -Force
Remove-Item $zip

Start-Process "$dest\MarkDownEditor.exe"
```

Pour mettre à jour plus tard, relancez le même bloc — ou utilisez simplement la mise à jour intégrée décrite ci-dessous.

</details>

### Étape 2 — Décompresser et lancer

Extrayez le dossier n'importe où vous avez le droit d'écrire : `C:\Tools\MarkDownEditor`, le Bureau, une clé USB — peu importe. Lancez ensuite **`MarkDownEditor.exe`**.

Le dossier contient `MarkDownEditor.exe` ainsi que `web/` (l'interface), `Runtime/` (le WebView2 embarqué) et `WebView2Data/` (le cache). Tant qu'ils restent ensemble, vous pouvez déplacer, copier ou emporter le dossier entier où vous voulez.

> **La fenêtre bleue SmartScreen au premier lancement est normale.** L'exécutable n'est pas signé, Windows affiche donc *« Windows a protégé votre ordinateur »*. Cliquez sur **Informations complémentaires → Exécuter quand même**. Cela n'apparaît qu'une fois.
> Si vous préférez ne pas exécuter un binaire non signé, le compiler vous-même tient en deux commandes — voir *Compiler depuis les sources* plus bas.

### Étape 3 — En faire l'application par défaut pour `.md` *(c'est tout l'intérêt)*

Une fois cela réglé, un double-clic sur n'importe quel fichier Markdown dans l'Explorateur l'ouvre rendu, instantanément.

1. Clic droit sur un fichier `.md` dans l'Explorateur
2. **Ouvrir avec → Choisir une autre application**
3. Sélectionnez `MarkDownEditor.exe` — s'il n'apparaît pas, descendez et utilisez **Choisir une application sur ce PC**
4. Cochez **Toujours utiliser cette application pour ouvrir les fichiers .md**, puis **OK**

La même chose fonctionne pour `.markdown` et `.txt` si vous le souhaitez.

### Mises à jour

Vous n'aurez pas besoin de revenir ici. Au démarrage, l'application interroge les releases GitHub et affiche un **point rouge** à côté du numéro de version dans la barre de titre dès qu'une version plus récente existe. Cliquez sur la version → **Mettre à jour** : le téléchargement se fait avec une barre de progression, l'application se remplace elle-même et redémarre — vos réglages, vos onglets ouverts et votre session sont conservés.

### Désinstallation

Supprimez le dossier. C'est toute la procédure : rien n'a été écrit dans le registre, dans `%AppData%` ni dans *Applications et fonctionnalités*. (Si vous aviez défini l'association de fichiers, Windows vous demandera simplement de choisir une nouvelle application par défaut à la prochaine ouverture d'un `.md`.)

### Vérifier le téléchargement *(facultatif)*

```powershell
Get-FileHash MarkDownEditor-standalone.zip -Algorithm SHA256
```

Le SHA-256 attendu de chaque version publiée est consigné dans le manifeste winget, dans [`packaging/winget/<version>/jjw1270.MarkDownEditor.installer.yaml`](packaging/winget).

## Raccourcis clavier

| Touche | Action |
|------|------|
| `Ctrl+O` | Ouvrir (sélection multiple) |
| `Ctrl+N` | Nouvel onglet de document |
| `Ctrl+S` | Enregistrer |
| `Ctrl+P` | Exporter en PDF |
| `Ctrl+E` | Basculer édition / aperçu |
| `Ctrl+F` / `Ctrl+H` | Rechercher / Remplacer |
| `Ctrl+B` / `Ctrl+I` | Gras / Italique (mode édition, bascule) |
| `Ctrl+K` | Insérer un lien (mode édition — l'adresse est présélectionnée) |
| `Tab` / `Shift+Tab` | Indenter / Désindenter (multiligne) |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Onglet suivant / précédent |
| `Ctrl+W` | Fermer l'onglet |
| `Alt+←` / `Alt+→` | Précédent / Suivant |

## Compiler depuis les sources

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

Sortie : `src/bin/Release/net9.0-windows/win-x64/publish/MarkDownEditor.exe`.
Placez le dossier `web/` (et éventuellement un WebView2 Fixed Version Runtime nommé `Runtime/`) à côté de l'exe.

### L'architecture en un paragraphe

Le côté C# (WPF) gère les E/S de fichiers, le tube d'instance unique et le cadre de la fenêtre ; le côté web (JS pur dans un unique WebView2) possède tous les tampons de documents et l'état des onglets. Les deux ne communiquent que par `postMessage`. Le rendu utilise marked + highlight.js + mermaid, le tout embarqué pour un usage hors ligne. Pour le tour complet des fonctionnalités, voir [README.ko.md](README.ko.md) (coréen) ou [README.md](README.md) (anglais).

## Retours

Signalements de bugs et propositions de fonctionnalités sont les bienvenus sur [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) — ou cliquez sur le numéro de version à côté du titre dans l'application (le formulaire de bug est prérempli avec votre version actuelle).

## Licence

MIT — voir [LICENSE](LICENSE). Les composants tiers embarqués sont listés dans
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) (note : le bundle mermaid contient un petit correctif local documenté).
