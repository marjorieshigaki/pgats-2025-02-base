const fs = require('fs');


function renderMetricTable(metrics) {
  let rows = '';
  for (const metric of metrics) {
    rows += `<tr><td>${metric.metric || ''}</td><td>${metric.type || ''}</td><td>${metric.value || ''}</td><td>${metric.tags ? JSON.stringify(metric.tags) : ''}</td></tr>`;
  }
  return `<table border="1" cellpadding="5" cellspacing="0">
    <tr><th>Métrica</th><th>Tipo</th><th>Valor</th><th>Tags</th></tr>
    ${rows}
  </table>`;
}


function main() {
  const input = process.argv[2] || 'resultado.json';
  const output = process.argv[3] || 'report.html';
  if (!fs.existsSync(input)) {
    console.error('Arquivo de resultado não encontrado:', input);
    process.exit(1);
  }
  const lines = fs.readFileSync(input, 'utf-8').split('\n').filter(Boolean);
  const metrics = [];
  const checks = [];
  for (const line of lines) {
    const obj = JSON.parse(line);
    if (obj.type === 'Metric') {
      metrics.push(obj);
    }
    if (obj.type === 'Point' && obj.metric === 'checks') {
      checks.push(obj);
    }
  }
  const summary = renderMetricTable(metrics);
  const checksTable = `<table border="1" cellpadding="5" cellspacing="0">
    <tr><th>Check</th><th>Passou?</th><th>Tempo</th></tr>
    ${checks.map(c => `<tr><td>${c.tags.check || ''}</td><td>${c.tags.status || ''}</td><td>${c.data.time || ''}</td></tr>`).join('')}
  </table>`;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Performance K6</title>
  <style>body{font-family:sans-serif;}table{border-collapse:collapse;}th,td{padding:4px 8px;}</style>
</head>
<body>
  <h1>Relatório de Performance K6</h1>
  <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
  <h2>Métricas</h2>
  ${summary}
  <h2>Checks</h2>
  ${checksTable}
</body>
</html>`;
  fs.writeFileSync(output, html, 'utf-8');
  console.log('Relatório HTML gerado em:', output);
}

main();
