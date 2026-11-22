/**
 * Mediário
 * Caminho: pb_hooks/40_provider_tmdb.pb.js
 * Versão do ficheiro: 1.1.0
 * Tipo: Hook PocketBase
 * Domínio: Providers e manutenção / TMDB
 * Finalidade: Disponibilizar rotas locais de pesquisa e detalhe TMDB.
 * Responsabilidades:
 * - Ler a chave TMDB v3 em app_settings.
 * - Normalizar formatos antigos do campo JSON valor.
 * - Consultar pesquisa e detalhe no backend.
 * - Não expor nem registar a credencial.
 * Dependências: PocketBase e API TMDB v3.
 * Coleções PocketBase: app_settings.
 * Regras: sem segredos no frontend, audit_log ou metadata_extra.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/mediario/providers/tmdb/search", (e) => {
  const query = (e.request.url.query().get("query") || "").trim();
  const mediaType = (e.request.url.query().get("type") || "multi").trim();
  const page = Math.max(
    1,
    parseInt(e.request.url.query().get("page") || "1", 10),
  );

  if (query.length < 2) {
    throw new BadRequestError("A pesquisa deve ter pelo menos dois caracteres.");
  }

  const setting = $app.findFirstRecordByFilter(
    "app_settings",
    'chave = "tmdb_api_key_v3"',
  );
  const rawValue = setting.get("valor");
  let decodedValue = rawValue;
  let apiKey = "";

  // Os campos JSON do PocketBase são devolvidos por record.get() como bytes.
  if (rawValue && typeof rawValue !== "string" && typeof rawValue.length === "number") {
    let jsonText = "";

    for (let index = 0; index < rawValue.length; index += 1) {
      jsonText += String.fromCharCode(rawValue[index]);
    }

    try {
      decodedValue = JSON.parse(jsonText);
    } catch (error) {
      decodedValue = jsonText;
    }
  }

  if (typeof decodedValue === "string") {
    apiKey = decodedValue;
  } else if (decodedValue) {
    apiKey =
      decodedValue.key ||
      decodedValue.value ||
      decodedValue.api_key ||
      decodedValue.tmdb_api_key_v3 ||
      "";
  }

  apiKey = String(apiKey).trim().replace(/^"|"$/g, "");

  if (!apiKey) {
    throw new BadRequestError("A chave TMDB ainda não está configurada.");
  }

  if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) {
    throw new BadRequestError(
      "A chave TMDB v3 configurada tem um formato inválido.",
    );
  }

  const allowedTypes = ["multi", "movie", "tv", "person"];
  const endpointType = allowedTypes.indexOf(mediaType) >= 0
    ? mediaType
    : "multi";
  const response = $http.send({
    url:
      "https:" + "//api.themoviedb.org/3/search/" + endpointType +
      "?api_key=" + encodeURIComponent(apiKey) +
      "&language=pt-PT&include_adult=false&page=" + page +
      "&query=" + encodeURIComponent(query),
    method: "GET",
    headers: { accept: "application/json" },
    timeout: 30,
  });

  if (response.statusCode !== 200) {
    $app.logger().error(
      "Falha na pesquisa TMDB",
      "status",
      response.statusCode,
      "response",
      String(response.body || ""),
    );

    throw new BadRequestError(
      "O TMDB respondeu com o estado HTTP " +
        response.statusCode +
        ". Consulta o terminal do PocketBase.",
    );
  }

  const results = (response.json.results || []).map((item) => ({
    id: item.id,
    media_type: item.media_type || endpointType,
    title: item.title || item.name || "Sem título",
    original_title: item.original_title || item.original_name || "",
    date: item.release_date || item.first_air_date || "",
    overview: item.overview || "",
    poster_url: item.poster_path
      ? "https:" + "//image.tmdb.org/t/p/w342" + item.poster_path
      : "",
    backdrop_url: item.backdrop_path
      ? "https:" + "//image.tmdb.org/t/p/w780" + item.backdrop_path
      : "",
    vote_average: item.vote_average || 0,
    popularity: item.popularity || 0,
  }));

  return e.json(200, {
    page: response.json.page || page,
    total_pages: response.json.total_pages || 1,
    total_results: response.json.total_results || results.length,
    results: results,
  });
});

routerAdd("GET", "/api/mediario/providers/tmdb/details/{type}/{id}", (e) => {
  const mediaType = e.request.pathValue("type");
  const externalId = e.request.pathValue("id");

  if (["movie", "tv"].indexOf(mediaType) < 0) {
    throw new BadRequestError("O detalhe TMDB suporta apenas filmes e séries.");
  }

  if (!/^\d+$/.test(externalId)) {
    throw new BadRequestError("Identificador TMDB inválido.");
  }

  const setting = $app.findFirstRecordByFilter(
    "app_settings",
    'chave = "tmdb_api_key_v3"',
  );
  const rawValue = setting.get("valor");
  let decodedValue = rawValue;
  let apiKey = "";

  // Os campos JSON do PocketBase são devolvidos por record.get() como bytes.
  if (rawValue && typeof rawValue !== "string" && typeof rawValue.length === "number") {
    let jsonText = "";

    for (let index = 0; index < rawValue.length; index += 1) {
      jsonText += String.fromCharCode(rawValue[index]);
    }

    try {
      decodedValue = JSON.parse(jsonText);
    } catch (error) {
      decodedValue = jsonText;
    }
  }

  if (typeof decodedValue === "string") {
    apiKey = decodedValue;
  } else if (decodedValue) {
    apiKey =
      decodedValue.key ||
      decodedValue.value ||
      decodedValue.api_key ||
      decodedValue.tmdb_api_key_v3 ||
      "";
  }

  apiKey = String(apiKey).trim().replace(/^"|"$/g, "");

  if (!apiKey) {
    throw new BadRequestError("A chave TMDB ainda não está configurada.");
  }

  if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) {
    throw new BadRequestError(
      "A chave TMDB v3 configurada tem um formato inválido.",
    );
  }

  const response = $http.send({
    url:
      "https:" + "//api.themoviedb.org/3/" + mediaType + "/" + externalId +
      "?api_key=" + encodeURIComponent(apiKey) +
      "&language=pt-PT&append_to_response=external_ids",
    method: "GET",
    headers: { accept: "application/json" },
    timeout: 30,
  });

  if (response.statusCode !== 200) {
    $app.logger().error(
      "Falha no detalhe TMDB",
      "status",
      response.statusCode,
      "response",
      String(response.body || ""),
    );

    throw new BadRequestError(
      "O TMDB respondeu com o estado HTTP " +
        response.statusCode +
        ". Consulta o terminal do PocketBase.",
    );
  }

  const item = response.json;
  const externalIds = item.external_ids || {};

  return e.json(200, {
    id: item.id,
    media_type: mediaType,
    title: item.title || item.name || "Sem título",
    original_title: item.original_title || item.original_name || "",
    date: item.release_date || item.first_air_date || "",
    overview: item.overview || "",
    tagline: item.tagline || "",
    runtime: item.runtime || null,
    episode_run_time: item.episode_run_time || [],
    status: item.status || "",
    genres: item.genres || [],
    imdb_id: item.imdb_id || externalIds.imdb_id || "",
    poster_url: item.poster_path
      ? "https:" + "//image.tmdb.org/t/p/w500" + item.poster_path
      : "",
    backdrop_url: item.backdrop_path
      ? "https:" + "//image.tmdb.org/t/p/original" + item.backdrop_path
      : "",
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    popularity: item.popularity || 0,
    original_language: item.original_language || "",
    homepage: item.homepage || "",
  });
});
