function buscarProcessosDetalhadosTJBA() {
  const url = "https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search";
  const apiKey = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
  const cidade = "TEIXEIRA DE FREITAS";
  const representante = "DEFENSORIA PÚBLICA DO ESTADO DA BAHIA";

  const payload = {
    query: {
      bool: {
        must: [
          { match_phrase: { representanteProcessual: representante } },
          { match_phrase: { municipio: cidade } }
        ]
      }
    },
    _source: [
      "numeroProcesso",
      "partes.nome",
      "dataAjuizamento",
      "valorCausa",
      "representanteProcessual",
      "classe.nome",
      "movimentos",
      "orgaoJulgador.nome"
    ],
    size: 100
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RESULTADO") || SpreadsheetApp.getActiveSpreadsheet().insertSheet("RESULTADO");
  sheet.clearContents();
  sheet.appendRow([
    "Número do Processo",
    "Nome da Parte",
    "Data da Distribuição",
    "Valor da Causa",
    "Representante",
    "Categoria do Processo",
    "Última Movimentação",
    "Órgão Julgador",
    "Cidade"
  ]);

  if (json.hits && json.hits.hits.length > 0) {
    json.hits.hits.forEach(hit => {
      const p = hit._source;
      const numero = p.numeroProcesso || "—";
      const parte = (p.partes && p.partes[0]?.nome) || "—";
      const data = p.dataAjuizamento || "—";
      const valor = p.valorCausa || "—";
      const representante = p.representanteProcessual || "—";
      const categoria = p.classe?.nome || "—";
      const orgao = p.orgaoJulgador?.nome || "—";

      let ultimaMov = "—";
      if (p.movimentos && p.movimentos.length > 0) {
        const mov = p.movimentos[p.movimentos.length - 1];
        const dataMov = mov.dataHora?.substring(0, 10); // YYYY-MM-DD
        const nomeMov = mov.nome || "—";
        ultimaMov = `${dataMov} - ${nomeMov}`;
      }

      sheet.appendRow([numero, parte, data, valor, representante, categoria, ultimaMov, orgao, cidade]);
    });
  } else {
    sheet.appendRow(["Nenhum processo encontrado."]);
  }
}
