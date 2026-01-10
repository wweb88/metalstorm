import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const html = readFileSync('C:/Users/nelso/Downloads/ESTADISTICAS.html', 'utf8');
const $ = load(html);

const planes = [];
$('.PlaneStatRow__PlaneNameContainer-sc-1wry7yv-0').each((_, el) => {
  const name = $(el).find('.PlaneStatRow__PlaneNameSpan-sc-1wry7yv-3').text().trim();
  const subName = $(el).find('.PlaneStatRow__PlaneDesignationSpan-sc-1wry7yv-4').text().trim();
  const type = $(el).find('.PlaneStatRow__RoleDiv-sc-1wry7yv-5').text().trim();
  const image = $(el).find('.PlaneIcon__PlaneImg-sc-dzceij-2').attr('src') || '';
  planes.push({ name, subName, type, image });
});

console.log(JSON.stringify(planes, null, 2));