# Correção final dos testes com Teleport

Os componentes funcionais não foram alterados. Os quatro testes de componentes passam a montar `<Teleport>` como stub local, mantendo o conteúdo dentro de `wrapper.element`. Isso permite usar `wrapper.get`, `wrapper.text` e `axe.run(wrapper.element)` de forma consistente.
