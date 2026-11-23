/**
 * Mediário
 * Caminho: pb_hooks/50_provider_omdb.pb.js
 * Versão do ficheiro: 1.0.0
 * Tipo: Hook PocketBase
 * Domínio: Providers / OMDb
 * Finalidade: Pesquisar e consultar detalhes OMDb sem expor a chave no browser.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
/// <reference path="../pb_data/types.d.ts" />

function omdbKey() {
  const setting = $app.findFirstRecordByFilter(
    "app_settings",
    'chave = "omdb_api_key"',
  );
  const raw = setting.get("valor");
  let value = raw;

  if (raw && typeof raw !== "string" && typeof raw.length === "number") {
    let text = "";
    for (let index = 0; index < raw.length; index += 1) {
      text += String.fromCharCode(raw[index]);
    }
    try { value = JSON.parse(text); } catch (_) { value = text; }
  }

  const key = typeof value === "string"
    ? value
    : value && (value.key || value.value || value.api_key || value.omdb_api_key);
  const normalized = String(key || "").trim().replace(/^"|"$/g, "");
  if (!normalized) {
    throw new BadRequestError("A chave OMDb ainda não está configurada.");
  }
  return normalized;
}

routerAdd("GET", "/api/mediario/providers/omdb/search", (e) => {
  const query = (e.request.url.query().get("query") || "").trim();
  const type = (e.request.url.query().get("type") || "").trim();
  const year = (e.request.url.query().get("year") || "").trim();
  const page = Math.max(1, Math.min(100, parseInt(
    e.request.url.query().get("page") || "1",
    10,
  )));

  if (query.length < 2) {
    throw new BadRequestError("A pesquisa deve ter pelo menos dois caracteres.");
  }

  const typeQuery = ["movie", "series", "episode"].indexOf(type) >= 0
    ? "&type=" + encodeURIComponent(type)
    : "";
  const yearQuery = /^\d{4}$/.test(year)
    ? "&y=" + encodeURIComponent(year)
    : "";
  const response = $http.send({
    url:
      "https:" + "//www.omdbapi.com/?apikey=" + encodeURIComponent(omdbKey()) +
      "&r=json&s=" + encodeURIComponent(query) +
      "&page=" + page + typeQuery + yearQuery,
    method: "GET",
    headers: { accept: "application/json" },
    timeout: 30,
  });

  if (response.statusCode !== 200) {
    throw new BadRequestError(
      "O OMDb respondeu com o estado HTTP " + response.statusCode + ".",
    );
  }
  if (response.json.Response === "False") {
    return e.json(200, {
      page,
      total_results: 0,
      results: [],
      message: response.json.Error || "Nenhum resultado encontrado.",
    });
  }

  return e.json(200, {
    page,
    total_results: parseInt(response.json.totalResults || "0", 10),
    results: (response.json.Search || []).map((item) => ({
      imdb_id: item.imdbID || "",
      title: item.Title || "Sem título",
      year: item.Year || "",
      type: item.Type || "",
      poster_url: item.Poster && item.Poster !== "N/A" ? item.Poster : "",
    })),
  });
});

routerAdd("GET", "/api/mediario/providers/omdb/details/{id}", (e) => {
  const imdbId = e.request.pathValue("id");
  if (!/^tt\d{7,8}$/.test(imdbId)) {
    throw new BadRequestError("Identificador IMDb inválido.");
  }

  const response = $http.send({
    url:
      "https:" + "//www.omdbapi.com/?apikey=" + encodeURIComponent(omdbKey()) +
      "&r=json&plot=full&i=" + encodeURIComponent(imdbId),
    method: "GET",
    headers: { accept: "application/json" },
    timeout: 30,
  });

  if (response.statusCode !== 200) {
    throw new BadRequestError(
      "O OMDb respondeu com o estado HTTP " + response.statusCode + ".",
    );
  }
  if (response.json.Response === "False") {
    throw new BadRequestError(response.json.Error || "O título não foi encontrado no OMDb.");
  }

  const item = response.json;
  return e.json(200, {
    title: item.Title || "",
    year: item.Year || "",
    rated: item.Rated === "N/A" ? "" : item.Rated || "",
    released: item.Released === "N/A" ? "" : item.Released || "",
    runtime: item.Runtime === "N/A" ? "" : item.Runtime || "",
    genres: item.Genre === "N/A" ? [] : String(item.Genre || "").split(", ").filter(Boolean),
    director: item.Director === "N/A" ? "" : item.Director || "",
    writer: item.Writer === "N/A" ? "" : item.Writer || "",
    actors: item.Actors === "N/A" ? "" : item.Actors || "",
    plot: item.Plot === "N/A" ? "" : item.Plot || "",
    languages: item.Language === "N/A" ? [] : String(item.Language || "").split(", ").filter(Boolean),
    countries: item.Country === "N/A" ? [] : String(item.Country || "").split(", ").filter(Boolean),
    awards: item.Awards === "N/A" ? "" : item.Awards || "",
    poster_url: item.Poster && item.Poster !== "N/A" ? item.Poster : "",
    ratings: item.Ratings || [],
    metascore: item.Metascore === "N/A" ? null : parseInt(item.Metascore || "0", 10),
    imdb_rating: item.imdbRating === "N/A" ? null : parseFloat(item.imdbRating || "0"),
    imdb_votes: item.imdbVotes === "N/A" ? null : parseInt(String(item.imdbVotes || "0").replace(/,/g, ""), 10),
    imdb_id: item.imdbID || imdbId,
    type: item.Type || "",
    total_seasons: item.totalSeasons === "N/A" ? null : parseInt(item.totalSeasons || "0", 10) || null,
    box_office: item.BoxOffice === "N/A" ? "" : item.BoxOffice || "",
    production: item.Production === "N/A" ? "" : item.Production || "",
  });
});
