/**
 * Mediário | ZIP 11A
 * Cria ou completa a coleção de autenticação `users`.
 * Compatível com a API de migrações JS do PocketBase moderno.
 */
migrate((app) => {
  let collection;
  try {
    collection = app.findCollectionByNameOrId("users");
  } catch (_) {
    collection = new Collection({
      type: "auth",
      name: "users",
      listRule: "id = @request.auth.id || @request.auth.role = 'admin'",
      viewRule: "id = @request.auth.id || @request.auth.role = 'admin'",
      createRule: null,
      updateRule: "id = @request.auth.id || @request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      manageRule: "@request.auth.role = 'admin'",
      authRule: "estado = '' || estado = 'ativo'",
      passwordAuth: { enabled: true, identityFields: ["email"] },
    });
  }

  const ensure = (name, field) => {
    if (!collection.fields.getByName(name)) collection.fields.add(field);
  };

  ensure("nome", new TextField({ name: "nome", max: 120 }));
  ensure("estado", new SelectField({
    name: "estado",
    required: false,
    maxSelect: 1,
    values: ["ativo", "pendente", "bloqueado"],
  }));
  ensure("role", new SelectField({
    name: "role",
    required: false,
    maxSelect: 1,
    values: ["admin", "editor", "utilizador", "leitor"],
  }));
  ensure("avatar", new FileField({
    name: "avatar",
    maxSelect: 1,
    maxSize: 5242880,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  }));
  ensure("ultimo_acesso", new DateField({ name: "ultimo_acesso" }));

  collection.listRule = "id = @request.auth.id || @request.auth.role = 'admin'";
  collection.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'";
  collection.createRule = null;
  collection.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  collection.manageRule = "@request.auth.role = 'admin'";
  collection.authRule = "estado = '' || estado = 'ativo'";
  app.save(collection);
}, (_app) => {
  // Rollback deliberadamente não destrutivo: uma coleção de autenticação pode
  // já conter contas reais. Reverter campos deve ser uma decisão administrativa.
});
