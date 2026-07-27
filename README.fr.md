# MarkDownEditor

**Un visualiseur et éditeur Markdown rapide et portable pour Windows.**
Double-cliquez sur un fichier `.md` et il s'ouvre, tout simplement — aucune installation requise.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · **Français** · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português (Brasil)](README.pt-BR.md)

![Aperçu — thème clair](docs/images/preview-light.png)

## Points forts

- **Portable** — décompressez et lancez. Le runtime WebView2 est inclus ; les paramètres et le cache restent à côté de l'exe, sans laisser de traces sur le système.
- **Mise à jour automatique** — l'application vérifie discrètement GitHub Releases au démarrage ; quand une nouvelle version est disponible, le badge `!` à côté du titre s'illumine. Mettez à jour directement dans l'application avec une barre de progression — paramètres et session sont conservés. (Cette vérification est le seul accès réseau de l'application ; aucun document ni donnée personnelle n'est jamais envoyé.)
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

## Premiers pas

1. Téléchargez `MarkDownEditor-standalone.zip` depuis Releases et **décompressez-le où vous voulez**.
2. Lancez `MarkDownEditor.exe`. Il n'y a pas d'installateur.
3. (Facultatif) Définissez-le comme application par défaut pour `.md` : clic droit sur un fichier `.md` → *Ouvrir avec* → *Choisir une autre application* → sélectionnez `MarkDownEditor.exe` et cochez *Toujours*.

> **Note SmartScreen** — le binaire n'est pas signé, Windows peut donc afficher un avertissement « éditeur inconnu » au premier lancement. Choisissez *Informations complémentaires → Exécuter quand même*, ou compilez depuis les sources (ci-dessous).

### Prérequis

- Windows 10 / 11 (64 bits)
- Aucune installation de WebView2 nécessaire — un runtime en version fixe est inclus. (Les builds sans le bundle utilisent le runtime Evergreen installé sur le système.)

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

Le côté C# (WPF) gère les E/S de fichiers, le tube d'instance unique et le cadre de la fenêtre ; le côté web (JS pur dans un unique WebView2) possède tous les tampons de documents et l'état des onglets. Les deux ne communiquent que par `postMessage`. Le rendu utilise marked + highlight.js + mermaid, le tout embarqué pour un usage hors ligne. Pour le tour complet des fonctionnalités, voir [README.md](README.md) (coréen) ou [README.en.md](README.en.md) (anglais).

## Retours

Signalements de bugs et propositions de fonctionnalités sont les bienvenus sur [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) — ou cliquez sur le numéro de version à côté du titre dans l'application (le formulaire de bug est prérempli avec votre version actuelle).

## Licence

MIT — voir [LICENSE](LICENSE). Les composants tiers embarqués sont listés dans
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) (note : le bundle mermaid contient un petit correctif local documenté).
