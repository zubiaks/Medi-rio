/** Mediário | ZIP 12A — listas persistentes por utilizador. */
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  let lists;
  try { lists = app.findCollectionByNameOrId("listas"); } catch (_) {
    lists = new Collection({
      type: "base",
      name: "listas",
      listRule: "proprietario = @request.auth.id || visibilidade = 'publica' || @request.auth.role = 'admin'",
      viewRule: "proprietario = @request.auth.id || visibilidade = 'publica' || @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && @request.body.proprietario = @request.auth.id",
      updateRule: "proprietario = @request.auth.id || @request.auth.role = 'admin'",
      deleteRule: "proprietario = @request.auth.id || @request.auth.role = 'admin'",
    });
    lists.fields.add(new RelationField({ name: "proprietario", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true }));
    lists.fields.add(new TextField({ name: "nome", required: true, max: 120 }));
    lists.fields.add(new TextField({ name: "descricao", max: 500 }));
    lists.fields.add(new SelectField({ name: "tipo", required: true, maxSelect: 1, values: ["manual", "smart"] }));
    lists.fields.add(new TextField({ name: "cor", max: 20 }));
    lists.fields.add(new BoolField({ name: "fixada" }));
    lists.fields.add(new JSONField({ name: "regra", maxSize: 65536 }));
    lists.fields.add(new SelectField({ name: "visibilidade", required: true, maxSelect: 1, values: ["privada", "partilhada", "publica"] }));
    lists.indexes = ["CREATE INDEX idx_listas_owner_name ON listas (proprietario, nome)"];
    app.save(lists);
  }

  let items;
  try { items = app.findCollectionByNameOrId("listas_itens"); } catch (_) {
    items = new Collection({
      type: "base",
      name: "listas_itens",
      listRule: "lista.proprietario = @request.auth.id || lista.visibilidade = 'publica' || @request.auth.role = 'admin'",
      viewRule: "lista.proprietario = @request.auth.id || lista.visibilidade = 'publica' || @request.auth.role = 'admin'",
      createRule: "lista.proprietario = @request.auth.id || @request.auth.role = 'admin'",
      updateRule: "lista.proprietario = @request.auth.id || @request.auth.role = 'admin'",
      deleteRule: "lista.proprietario = @request.auth.id || @request.auth.role = 'admin'",
    });
    items.fields.add(new RelationField({ name: "lista", required: true, maxSelect: 1, collectionId: lists.id, cascadeDelete: true }));
    items.fields.add(new SelectField({ name: "entidade", required: true, maxSelect: 1, values: ["titles", "people", "collections", "episodes", "streams", "aliases", "sources"] }));
    items.fields.add(new TextField({ name: "entidade_id", required: true, max: 64 }));
    items.fields.add(new TextField({ name: "titulo_cache", required: true, max: 300 }));
    items.fields.add(new TextField({ name: "subtitulo_cache", max: 500 }));
    items.fields.add(new URLField({ name: "imagem_cache" }));
    items.fields.add(new NumberField({ name: "ordem", min: 0, onlyInt: true }));
    items.fields.add(new DateField({ name: "adicionado_em" }));
    items.indexes = ["CREATE UNIQUE INDEX idx_lista_entidade_item ON listas_itens (lista, entidade, entidade_id)", "CREATE INDEX idx_lista_ordem ON listas_itens (lista, ordem)"];
    app.save(items);
  }

  try { app.findCollectionByNameOrId("listas_atividades"); } catch (_) {
    const activity = new Collection({
      type: "base",
      name: "listas_atividades",
      listRule: "lista.proprietario = @request.auth.id || @request.auth.role = 'admin'",
      viewRule: "lista.proprietario = @request.auth.id || @request.auth.role = 'admin'",
      createRule: "lista.proprietario = @request.auth.id || @request.auth.role = 'admin'",
      updateRule: null,
      deleteRule: "lista.proprietario = @request.auth.id || @request.auth.role = 'admin'",
    });
    activity.fields.add(new RelationField({ name: "lista", required: true, maxSelect: 1, collectionId: lists.id, cascadeDelete: true }));
    activity.fields.add(new SelectField({ name: "tipo", required: true, maxSelect: 1, values: ["created", "updated", "duplicated", "deleted", "refreshed", "converted", "imported", "restored", "migrated"] }));
    activity.fields.add(new TextField({ name: "mensagem", max: 500 }));
    activity.fields.add(new JSONField({ name: "snapshot_anterior", maxSize: 1048576 }));
    activity.fields.add(new JSONField({ name: "snapshot_posterior", maxSize: 1048576 }));
    activity.indexes = ["CREATE INDEX idx_list_activity ON listas_atividades (lista, created)"];
    app.save(activity);
  }
}, (_app) => {
  // Rollback não destrutivo para proteger listas criadas após a migração.
});
