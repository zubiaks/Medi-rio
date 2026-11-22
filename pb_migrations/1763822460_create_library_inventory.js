/**
 * Projeto: Mediário
 * Migração: criar sessões e itens de inventário da Biblioteca física
 * Esquema de destino: PocketBase 1.1.0
 * Data: 2026-11-22
 *
 * Cria:
 * - inventarios
 * - inventario_itens
 *
 * O rollback remove primeiro os itens e depois as sessões, preservando a
 * ordem das dependências entre coleções.
 *
 * Mediário
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const copies = app.findCollectionByNameOrId("exemplares");

  const inventories = new Collection({
    name: "inventarios",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "nome",
        type: "text",
        required: true,
        max: 200,
      },
      {
        name: "estado",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["Preparação", "Em curso", "Concluído", "Cancelado"],
      },
      { name: "iniciado_em", type: "date", required: false },
      { name: "concluido_em", type: "date", required: false },
      { name: "total_previsto", type: "number", min: 0, onlyInt: true },
      { name: "total_verificado", type: "number", min: 0, onlyInt: true },
      { name: "encontrados", type: "number", min: 0, onlyInt: true },
      { name: "nao_localizados", type: "number", min: 0, onlyInt: true },
      { name: "localizacao_incorrecta", type: "number", min: 0, onlyInt: true },
      { name: "dados_incompletos", type: "number", min: 0, onlyInt: true },
      { name: "notas", type: "text", required: false, max: 5000 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE INDEX `idx_inventarios_estado_inicio` ON `inventarios` (`estado`, `iniciado_em`)",
      "CREATE INDEX `idx_inventarios_created` ON `inventarios` (`created`)",
    ],
  });

  app.save(inventories);

  const inventoryItems = new Collection({
    name: "inventario_itens",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "inventario",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: inventories.id,
        cascadeDelete: true,
      },
      {
        name: "exemplar",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: copies.id,
        cascadeDelete: false,
      },
      {
        name: "estado",
        type: "select",
        required: true,
        maxSelect: 1,
        values: [
          "Por verificar",
          "Encontrado",
          "Não localizado",
          "Localização incorrecta",
          "Dados incompletos",
        ],
      },
      { name: "localizacao_esperada", type: "text", required: false, max: 200 },
      { name: "localizacao_encontrada", type: "text", required: false, max: 200 },
      { name: "verificado_em", type: "date", required: false },
      { name: "observacoes", type: "text", required: false, max: 5000 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_inventario_item_unico` ON `inventario_itens` (`inventario`, `exemplar`)",
      "CREATE INDEX `idx_inventario_item_estado` ON `inventario_itens` (`inventario`, `estado`)",
      "CREATE INDEX `idx_inventario_item_verificado` ON `inventario_itens` (`verificado_em`)",
    ],
  });

  return app.save(inventoryItems);
}, (app) => {
  const items = app.findCollectionByNameOrId("inventario_itens");
  app.delete(items);

  const inventories = app.findCollectionByNameOrId("inventarios");
  return app.delete(inventories);
});
