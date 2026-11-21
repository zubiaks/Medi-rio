# Repositórios necessários

Adicionar a `src/domain/repositories.ts`:

```ts
export const streamLinkRepository = new PocketBaseRepository<StreamLinkRecord>("stream_links");
export const tvCategoryRepository = new PocketBaseRepository<TvCategoryRecord>("categorias_tv");
export const countryRepository = new PocketBaseRepository<NamedRecord>("paises");
export const languageRepository = new PocketBaseRepository<NamedRecord>("idiomas");
export const tagRepository = new PocketBaseRepository<NamedRecord>("tags");
```
