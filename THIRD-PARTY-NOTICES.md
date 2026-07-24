# Third-Party Notices

MarkDownEditor bundles the following third-party components.

## marked (`src/web/marked.min.js`)

- License: MIT
- https://github.com/markedjs/marked
- Copyright (c) 2011-2018, Christopher Jeffrey; Copyright (c) 2018+, MarkedJS contributors

## highlight.js (`src/web/highlight.min.js`)

- License: BSD 3-Clause
- https://github.com/highlightjs/highlight.js
- Copyright (c) 2006, Ivan Sagalaev and highlight.js contributors

## Mermaid (`src/web/mermaid.min.js`)

- License: MIT
- https://github.com/mermaid-js/mermaid
- Copyright (c) 2014-2022 Knut Sveidqvist

**Note:** the bundled file is locally patched — the default text-wrapping width in
`createText` was changed from `200` to `99999` so that edge labels are not wrapped
at 200px (the `flowchart.wrappingWidth` setting does not reach edge labels).
See the comment above `ensureMermaid()` in `src/web/app.js`. Re-apply the patch
when upgrading the bundle.

## Microsoft Edge WebView2

- SDK package `Microsoft.Web.WebView2` and the WebView2 Fixed Version Runtime
  (`Runtime/` folder in binary releases) are distributed under the Microsoft
  Software License Terms:
  https://learn.microsoft.com/microsoft-edge/webview2/
- The Fixed Version Runtime is redistributed unmodified as permitted by its
  license. It is included only in binary releases, not in this repository.

## .NET Runtime

- Binary releases include the self-contained .NET runtime (MIT License).
- https://github.com/dotnet/runtime
