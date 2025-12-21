
const fs = require('fs');

function parseJsonLines(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/).filter(Boolean); // Código original
  return lines.map(line => JSON.parse(line));
}

function extractMetrics(jsonLines) {
  const metrics = {};
  for (const obj of jsonLines) {
    if (obj.type === 'Metric' && obj.data) {
      metrics[obj.data.name] = { ...obj.data };
    }
  }
  return metrics;
}

function renderMetricTable(metrics) {
  let rows = '';
  for (const [name, metric] of Object.entries(metrics)) {
    rows += `<tr><td>${name}</td><td>${metric.type || ''}</td><td>${metric.avg || ''}</td><td>${metric.min || ''}</td><td>${metric.max || ''}</td><td>${metric.p95 || ''}</td></tr>`;
  }
  return `<table border=\"1\" cellpadding=\"5\" cellspacing=\"0\">\n    <tr><th>Métrica</th><th>Tipo</th><th>Média</th><th>Mínimo</th><th>Máximo</th><th>P95</th></tr>\n    ${rows}\n  </table>`;
}

function main() {
  const input = process.argv[2] || 'resultado.json';
  const output = process.argv[3] || 'report.html';
  if (!fs.existsSync(input)) {
    console.error('Arquivo de resultado não encontrado:', input);
    process.exit(1);
  }
  const jsonLines = parseJsonLines(input);
  const metrics = extractMetrics(jsonLines);
  const summary = renderMetricTable(metrics);
  const html = `<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Relatório de Performance K6</title>\n  <style>body{font-family:sans-serif;}table{border-collapse:collapse;}th,td{padding:4px 8px;}</style>\n</head>\n<body>\n  <h1>Relatório de Performance K6</h1>\n  <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>\n  <h2>Métricas</h2>\n  ${summary}\n  <h2>Resumo</h2>\n  <pre>${JSON.stringify(metrics, null, 2)}</pre>\n</body>\n</html>`;
  fs.writeFileSync(output, html, 'utf-8');
  console.log('Relatório HTML gerado em:', output);
}

main();
