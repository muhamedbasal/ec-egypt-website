/** Materialize existing Arabic translations as static pages; Node 18+, no dependencies.
 * Edit root HTML/data-ar first, then run: node tools/build-locales.mjs
 * This is an authoring command, not a deployment or a test command.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://ec-egypt.com/';
const descriptions = {
  index: 'الشركة المصرية الكندية تستورد وتصدر البقوليات والحبوب لتجار الجملة ومصانع الأغذية في مصر والدول المجاورة. اطلب عرض سعر للحمص والعدس والفول والترمس والأرز.',
  about: 'تعرّف على الشركة المصرية الكندية وفريق استيراد وتصدير البقوليات والحبوب لخدمة تجار الجملة ومصانع الأغذية.',
  products: 'تصفح منتجات الشركة المصرية الكندية: حمص وعدس وفول أسترالي وإنجليزي وليتواني وترمس وأرز بسمتي. استفسر عن الكميات والمواصفات وعرض السعر.',
  contact: 'تواصل مع الشركة المصرية الكندية لطلبات توريد البقوليات والحبوب. جهّز المنتج والكمية ووجهة التسليم وراجع طلب عرض السعر في واتساب.'
};
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const strip = value => decode(value.replace(/<[^>]*>/g, '').trim());
fs.mkdirSync(path.join(root, 'ar'), { recursive: true });

for (const name of Object.keys(descriptions)) {
  let html = fs.readFileSync(path.join(root, name + '.html'), 'utf8');
  const translations = new Map();
  for (const match of html.matchAll(/data-en="([^"]*)"\s+data-ar="([^"]*)"/g)) translations.set(decode(match[1]), decode(match[2]));
  const title = html.match(/data-title-ar="([^"]+)"/)[1];
  const url = site + 'ar/' + (name === 'index' ? '' : name + '.html');
  html = html.replace('<html lang="en" dir="ltr">', '<html lang="ar" dir="rtl">');
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
  html = html.replace(/(<meta name="description" content=")[^"]*/, '$1' + descriptions[name]);
  html = html.replace(/(<link rel="canonical" href=")[^"]*/, '$1' + url);
  html = html.replace(/(<meta property="og:url" content=")[^"]*/, '$1' + url);
  html = html.replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, '$1' + title);
  html = html.replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]*/g, '$1' + descriptions[name]);
  html = html.replace('property="og:locale" content="en_US"', 'property="og:locale" content="ar_EG"');
  html = html.replace('property="og:locale:alternate" content="ar_EG"', 'property="og:locale:alternate" content="en_US"');
  // Translation attributes are only used on text-only elements in these templates.
  html = html.replace(/<(\w+)([^>]*\bdata-ar="([^"]*)"[^>]*)>[^<]*<\/\1>/g,
    (_, tag, attrs, text) => '<' + tag + attrs + '>' + text + '</' + tag + '>');
  html = html.replace(/(<[^>]+\bdata-aria-ar="([^"]*)"[^>]*>)/g,
    (_, tag, label) => tag.replace(/aria-label="[^"]*"/, 'aria-label="' + label + '"'));
  html = html.replace(/(<[^>]+\bdata-ph-ar="([^"]*)"[^>]*>)/g,
    (_, tag, label) => tag.replace(/placeholder="[^"]*"/, 'placeholder="' + label + '"'));
  html = html.replace(/(src|href)="((?:images|css|js)\/[^" ]+|favicon.ico|site.webmanifest)"/g, '$1="../$2"');
  html = html.replace(/<div class="lang-switch"[\s\S]*?<\/div>/,
    '<div class="lang-switch" role="group" aria-label="اللغة">\n' +
    '        <a href="../' + name + '.html" lang="en" hreflang="en">EN</a>\n' +
    '        <a href="' + name + '.html" lang="ar" hreflang="ar" class="is-active" aria-current="true" aria-label="العربية">ع</a>\n      </div>');
  const faq = [...html.matchAll(/<details class="faq__item">([\s\S]*?)<\/details>/g)].map(match => {
    const question = match[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
    const answer = match[1].match(/<div class="faq__a"[^>]*>([\s\S]*?)<\/div>/);
    return { '@type': 'Question', name: strip(question[1]), acceptedAnswer: { '@type': 'Answer', text: strip(answer[1]) } };
  });
  function localize(value, key = '') {
    if (Array.isArray(value)) return value.map(item => localize(item, key));
    if (value && typeof value === 'object') {
      const result = Object.fromEntries(Object.entries(value).map(([k,v]) => [k, localize(v,k)]));
      if (result['@type'] === 'FAQPage') result.mainEntity = faq;
      if (['AboutPage','ContactPage','CollectionPage','WebPage'].includes(result['@type'])) {
        result.inLanguage = 'ar'; result.url = url;
      }
      return result;
    }
    if (typeof value !== 'string') return value;
    if (key === 'item' && value === site) return site + 'ar/';
    if ((key === 'url' || key === 'item') && /^https:\/\/ec-egypt\.com\/(about|contact|products)\.html/.test(value)) return value.replace(site, site + 'ar/');
    return translations.get(value) || ({Home:'الرئيسية',About:'من نحن',Products:'المنتجات',Contact:'تواصل معنا'})[value] || value;
  }
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (_, json) => '<script type="application/ld+json">\n' + JSON.stringify(localize(JSON.parse(json)), null, 2) + '\n  </script>');
  fs.writeFileSync(path.join(root, 'ar', name + '.html'), html);
}
console.log('Wrote four static Arabic pages from the root HTML translations.');
