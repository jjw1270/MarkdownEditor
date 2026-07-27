# MarkDownEditor

**Um visualizador e editor de Markdown rápido e portátil para Windows.**
Dê um duplo clique em um arquivo `.md` e ele simplesmente abre — sem instalação.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.ko.md) · [English](README.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · **Português (Brasil)**

### ⬇️ [Baixar para Windows](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip) &nbsp;·&nbsp; <sub>.zip, ~331 MB · descompacte e execute · [novidades](https://github.com/jjw1270/MarkdownEditor/releases/latest)</sub>

![Prévia — tema claro](docs/images/preview-light.png)

## Destaques

- **Portátil** — descompacte e execute. O runtime do WebView2 vem incluído; configurações e cache ficam ao lado do exe, sem deixar rastros no sistema.
- **Atualização automática** — o aplicativo verifica silenciosamente o GitHub Releases ao iniciar; quando há uma nova versão, um ponto vermelho aparece ao lado da versão na barra de título. Clique na versão → **Nova versão disponível** e atualize dentro do próprio aplicativo com barra de progresso — configurações e sessão são preservadas. (A atualização automática — verificação anônima de versão e download apenas quando você a inicia — é o único acesso à rede do aplicativo; nenhum documento ou dado pessoal é enviado.)
- **Uma janela, várias abas** — cada arquivo abre como aba em uma única janela (instância única via mutex + named pipe). As abas podem ser reordenadas arrastando e alternadas com `Ctrl+Tab`.
- **Todos os links funcionam** — links `.md` abrem em nova aba, links da web no navegador, pastas no Explorer e outros documentos em seus aplicativos padrão. Âncoras entre documentos (`doc.md#seção`) são suportadas.
- **Voltar / Avançar** — botões da barra de ferramentas, `Alt+←`/`Alt+→` ou botões 4/5 do mouse.
- **Renderização no estilo GitHub** — tabelas, destaque de código (offline) e **diagramas mermaid** (offline, integrados ao tema).
- **Barra lateral de sumário** — com destaque da seção atual conforme a rolagem (scroll-spy).
- **Edição ↔ Visualização** — `Ctrl+E`, com posição de rolagem sincronizada entre os dois modos.
- **Barra de formatação** — aparece no modo de edição: negrito, títulos, listas, caixas de seleção, citação, código, link, tabela, divisor — um clique cada, **sem precisar saber Markdown** (tudo desfeito com `Ctrl+Z`).
- **Menus de contexto** — clique direito na visualização (copiar, abrir link, copiar endereço, ver imagem, localizar) ou no editor (recortar/copiar/colar/selecionar tudo).
- **Localizar / Substituir** — `Ctrl+F` funciona na visualização (destaque de todas as ocorrências) e na edição; `Ctrl+H` substitui no modo de edição.
- **Exportar para PDF** — o botão `📄` ao lado de Salvar, ou `Ctrl+P`, sempre no tema claro.
- **Colar imagens da área de transferência** — salvas em uma pasta `images/` ao lado do documento, com o link inserido automaticamente.
- **Recarga automática em alterações externas** — edições de outros programas (IDE, editor) atualizam a aba aberta; suas alterações não salvas nunca são sobrescritas em silêncio.
- **Backup automático e recuperação** — alterações não salvas são capturadas a cada 30 s e oferecidas para recuperação na próxima inicialização.
- **Restauração de sessão** — ao iniciar sem arquivo, as abas anteriores são reabertas. Arquivos recentes ficam no botão 🕘.
- **Detecção de codificação coreana** — arquivos CP949/EUC-KR sem BOM abrem corretamente, assim como UTF-8.
- **Tema escuro / claro** — alternado pelo botão `🌙`/`☀` da barra de título, lembrado entre execuções, incluindo a barra de título do Windows.
- **Interface em 10 idiomas** — 한국어, English, 日本語, 简体中文, 繁體中文, Español, Français, Deutsch, Русский, Português. Segue o idioma do sistema por padrão; troque a qualquer momento pelo botão `🌐`.
- **Interface compacta estilo Bloco de Notas** — abas e ferramentas integradas em uma barra de título personalizada (arraste a área vazia para mover, duplo clique para maximizar).

![Menu de idiomas](docs/images/menu.png)

## 🚀 Instalação

Sem instalador, sem privilégios de administrador, sem dependências. Baixe, descompacte e execute.

### Passo 1 — Baixar

**⬇️ [MarkDownEditor-standalone.zip](https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip)** — este link aponta **sempre para a versão mais recente**.

| | |
|---|---|
| **Tamanho** | ~331 MB — um runtime completo do WebView2 vem embutido, por isso não há mais nada para instalar |
| **Requisitos** | Windows 10 ou 11, 64 bits. Nada além disso. |
| **Mais** | [Todas as versões](https://github.com/jjw1270/MarkdownEditor/releases) · [Novidades desta versão](https://github.com/jjw1270/MarkdownEditor/releases/latest) · [Changelog completo](CHANGELOG.md) |

<details>
<summary><b>Prefere o terminal?</b> Baixar, descompactar e abrir com um bloco de PowerShell</summary>

```powershell
$dest = "$env:LOCALAPPDATA\Programs\MarkDownEditor"
$zip  = "$env:TEMP\MarkDownEditor-standalone.zip"

Invoke-WebRequest "https://github.com/jjw1270/MarkdownEditor/releases/latest/download/MarkDownEditor-standalone.zip" -OutFile $zip
Expand-Archive $zip -DestinationPath $dest -Force
Remove-Item $zip

Start-Process "$dest\MarkDownEditor.exe"
```

Para atualizar depois, rode o mesmo bloco novamente — ou use o atualizador embutido descrito abaixo.

</details>

### Passo 2 — Descompactar e executar

Extraia a pasta em qualquer lugar onde você tenha permissão de escrita: `C:\Tools\MarkDownEditor`, a Área de Trabalho, um pen drive — tanto faz. Depois execute **`MarkDownEditor.exe`**.

A pasta contém `MarkDownEditor.exe` mais `web/` (a interface), `Runtime/` (o WebView2 embutido) e `WebView2Data/` (cache). Mantendo tudo junto, você pode mover, copiar ou levar a pasta inteira para onde quiser.

> **A tela azul do SmartScreen na primeira execução é esperada.** O executável não é assinado, então o Windows exibe *"O Windows protegeu o seu PC"*. Clique em **Mais informações → Executar assim mesmo**. Isso aparece só uma vez.
> Se preferir não executar um binário sem assinatura, compilar você mesmo são dois comandos — veja *Compilar a partir do código-fonte* abaixo.

### Passo 3 — Tornar padrão para arquivos `.md` *(é aqui que está a graça)*

Feito isso, dois cliques em qualquer arquivo Markdown no Explorador abrem o documento já renderizado.

1. Clique direito em qualquer arquivo `.md` no Explorador
2. **Abrir com → Escolher outro aplicativo**
3. Selecione `MarkDownEditor.exe` — se não estiver na lista, role para baixo e use **Escolher um aplicativo no computador**
4. Marque **Sempre usar este aplicativo para abrir arquivos .md** e clique em **OK**

Vale o mesmo para `.markdown` e `.txt`, se você quiser.

### Atualizações

Você não vai precisar voltar aqui. Ao iniciar, o aplicativo consulta as releases do GitHub e mostra um **ponto vermelho** ao lado do número da versão na barra de título quando há uma versão mais nova. Clique na versão → **Atualizar**: ele baixa com barra de progresso, se substitui e reinicia — suas configurações, abas abertas e sessão continuam intactas.

### Desinstalação

Apague a pasta. É todo o procedimento — nada foi gravado no registro, em `%AppData%` ou em *Aplicativos e recursos*. (Se você tinha definido a associação de arquivos, o Windows apenas pedirá um novo aplicativo padrão na próxima vez que abrir um `.md`.)

## Atalhos de teclado

| Tecla | Ação |
|------|------|
| `Ctrl+O` | Abrir (seleção múltipla) |
| `Ctrl+N` | Nova aba de documento |
| `Ctrl+S` | Salvar |
| `Ctrl+P` | Exportar como PDF |
| `Ctrl+E` | Alternar edição / visualização |
| `Ctrl+F` / `Ctrl+H` | Localizar / Substituir |
| `Ctrl+B` / `Ctrl+I` | Negrito / Itálico (modo de edição, alternável) |
| `Ctrl+K` | Inserir link (modo de edição — o endereço fica pré-selecionado) |
| `Tab` / `Shift+Tab` | Aumentar / diminuir recuo (várias linhas) |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Próxima / aba anterior |
| `Ctrl+W` | Fechar aba |
| `Alt+←` / `Alt+→` | Voltar / Avançar |

## Compilando do código-fonte

```powershell
cd src
dotnet publish -c Release -r win-x64 --self-contained true `
  -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

Saída: `src/bin/Release/net9.0-windows/win-x64/publish/MarkDownEditor.exe`.
Coloque a pasta `web/` (e opcionalmente um WebView2 Fixed Version Runtime como `Runtime/`) ao lado do exe.

### Arquitetura em um parágrafo

O lado C# (WPF) cuida da E/S de arquivos, do pipe de instância única e da moldura da janela; o lado web (JS puro em um único WebView2) possui todos os buffers de documentos e o estado das abas. Os dois se comunicam apenas via `postMessage`. A renderização usa marked + highlight.js + mermaid, tudo empacotado para uso offline. Para o tour completo de recursos, veja [README.ko.md](README.ko.md) (coreano) ou [README.md](README.md) (inglês).

## Feedback

Relatos de bugs e sugestões de recursos são bem-vindos no [GitHub Issues](https://github.com/jjw1270/MarkdownEditor/issues/new/choose) — ou clique no rótulo de versão ao lado do título dentro do aplicativo (o formulário de bug já vem preenchido com sua versão atual).

## Licença

MIT — veja [LICENSE](LICENSE). Os componentes de terceiros incluídos estão listados em
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) (nota: o pacote do mermaid carrega um pequeno patch local documentado).
