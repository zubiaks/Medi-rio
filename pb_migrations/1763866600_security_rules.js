/** Mediário | ZIP 11B — regras de segurança das coleções críticas. */
migrate((app) => {
  const authenticated = "@request.auth.id != ''";
  const editor = "@request.auth.role = 'admin' || @request.auth.role = 'editor'";
  const admin = "@request.auth.role = 'admin'";

  const apply = (name, rules) => {
    let collection;
    try {
      collection = app.findCollectionByNameOrId(name);
    } catch (_) {
      return;
    }
    for (const [key, value] of Object.entries(rules)) collection[key] = value;
    app.save(collection);
  };

  apply("app_settings", {
    listRule: admin,
    viewRule: admin,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });
  apply("audit_log", {
    listRule: admin,
    viewRule: admin,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });
  apply("sync_jobs", {
    listRule: editor,
    viewRule: editor,
    createRule: editor,
    updateRule: editor,
    deleteRule: admin,
  });
  apply("titulos_versoes", {
    listRule: editor,
    viewRule: editor,
    createRule: editor,
    updateRule: null,
    deleteRule: admin,
  });
  apply("fontes_externas", {
    listRule: authenticated,
    viewRule: authenticated,
    createRule: editor,
    updateRule: editor,
    deleteRule: editor,
  });

  for (const name of [
    "titulos", "pessoas", "creditos", "temporadas", "episodios",
    "titulos_alternativos", "colecoes", "streams",
  ]) {
    apply(name, {
      listRule: authenticated,
      viewRule: authenticated,
      createRule: editor,
      updateRule: editor,
      deleteRule: editor,
    });
  }
}, (_app) => {
  // Rollback não destrutivo. Reabrir regras de produção exige revisão manual.
});
