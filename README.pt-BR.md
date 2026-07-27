# MarkDownEditor

**Um visualizador e editor de Markdown rápido e portátil para Windows.**
Dê um duplo clique em um arquivo `.md` e ele simplesmente abre — sem instalação.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078d6)
![.NET](https://img.shields.io/badge/.NET-9.0-512bd4)
![Languages](https://img.shields.io/badge/UI-10%20languages-2ea44f)
[![Release](https://img.shields.io/github/v/release/jjw1270/MarkdownEditor?include_prereleases)](https://github.com/jjw1270/MarkdownEditor/releases)
[![Downloads](https://img.shields.io/github/downloads/jjw1270/MarkdownEditor/total?color=success)](https://github.com/jjw1270/MarkdownEditor/releases)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · **Português (Brasil)**

![Prévia — tema claro](docs/images/preview-light.png)

## Destaques

- **Portátil** — descompacte e execute. O runtime do WebView2 vem incluído; configurações e cache ficam ao lado do exe, sem deixar rastros no sistema.
- **Atualização automática** — o aplicativo verifica silenciosamente o GitHub Releases ao iniciar; quando há uma nova versão, o selo `!` ao lado do título se acende. Atualize dentro do próprio aplicativo com barra de progresso — configurações e sessão são preservadas. (Essa verificação de versão é o único acesso à rede do aplicativo; nenhum documento ou dado pessoal é enviado.)
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

## Primeiros passos

1. Baixe `MarkDownEditor-standalone.zip` em Releases e **descompacte onde quiser**.
2. Execute `MarkDownEditor.exe`. Não há instalador.
3. (Opcional) Defina como aplicativo padrão para `.md`: clique direito em um arquivo `.md` → *Abrir com* → *Escolher outro aplicativo* → selecione `MarkDownEditor.exe` e marque *Sempre*.

> **Nota sobre o SmartScreen** — o binário não é assinado, então o Windows pode exibir um aviso de "fornecedor desconhecido" na primeira execução. Escolha *Mais informações → Executar assim mesmo*, ou compile a partir do código-fonte (abaixo).

### Requisitos

- Windows 10 / 11 (64 bits)
- Não é preciso instalar o WebView2 — um runtime de versão fixa vem incluído. (Builds sem o pacote usam o runtime Evergreen instalado no sistema.)

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

O lado C# (WPF) cuida da E/S de arquivos, do pipe de instância única e da moldura da janela; o lado web (JS puro em um único WebView2) possui todos os buffers de documentos e o estado das abas. Os dois se comunicam apenas via `postMessage`. A renderização usa marked + highlight.js + mermaid, tudo empacotado para uso offline. Para o tour completo de recursos, veja [README.md](README.md) (coreano) ou [README.en.md](README.en.md) (inglês).

## Licença

MIT — veja [LICENSE](LICENSE). Os componentes de terceiros incluídos estão listados em
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) (nota: o pacote do mermaid carrega um pequeno patch local documentado).
