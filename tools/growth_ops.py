"""EC Egypt daily growth report: local source audit, optional public GETs and EC CSV exports.

Python 3.10+, standard library only. No tests, API credentials, account changes,
form submissions, messages, indexing submissions or publishing are executed.
"""
from __future__ import annotations

import argparse
import csv
from datetime import date, datetime, timedelta, timezone
import hashlib
from html.parser import HTMLParser
import json
import math
import os
from pathlib import Path
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://ec-egypt.com'
DEFAULT_OUT = Path.home() / 'EC-Egypt-Analytics' / 'growth-ops'
PAGES = ['index.html', 'about.html', 'products.html', 'contact.html',
         'ar/index.html', 'ar/about.html', 'ar/products.html', 'ar/contact.html']
MAX_BYTES = 2_000_000


def canonical(filename):
    return SITE + '/' + filename.replace('index.html', '')


def write_json(path, value):
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')
    tmp.replace(path)


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = 0
        self.canonicals = []
        self.alternates = {}
        self.description = []
        self.title = ''
        self.noindex = False
        self.images = []
        self.assets = []
        self.schemas = []
        self.lang = None
        self._title = False
        self._schema = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self._title = True
        if tag == 'link':
            if a.get('rel') == 'canonical': self.canonicals.append(a.get('href'))
            if a.get('hreflang'): self.alternates[a['hreflang']] = a.get('href')
            if a.get('rel') in ('stylesheet', 'icon', 'manifest', 'apple-touch-icon'):
                self.assets.append(a.get('href', ''))
        if tag == 'meta':
            if a.get('name') == 'description': self.description.append(a.get('content', ''))
            if a.get('name', '').lower() in ('robots', 'googlebot'):
                self.noindex |= 'noindex' in a.get('content', '').lower()
        if tag == 'img':
            self.images.append(a)
            self.assets.append(a.get('src', ''))
        if tag == 'script':
            if a.get('src'): self.assets.append(a['src'])
            if a.get('type') == 'application/ld+json': self._schema = ''

    def handle_data(self, data):
        if self._title: self.title += data
        if self._schema is not None: self._schema += data

    def handle_endtag(self, tag):
        if tag == 'title': self._title = False
        if tag == 'script' and self._schema is not None:
            self.schemas.append(self._schema)
            self._schema = None


def inspect_html(text, filename, headers=None):
    page = Page()
    page.feed(text)
    issues = []
    if page.h1 != 1: issues.append('h1_count_not_one')
    if page.canonicals != [canonical(filename)]: issues.append('canonical_mismatch')
    if not page.title.strip(): issues.append('missing_title')
    if len(page.description) != 1 or not page.description[0].strip(): issues.append('missing_description')
    if page.noindex or (headers and 'noindex' in headers.get('X-Robots-Tag', '').lower()):
        issues.append('unexpected_noindex')
    english = filename.removeprefix('ar/')
    expected = {'en': canonical(english), 'ar': canonical('ar/' + english), 'x-default': canonical(english)}
    if page.alternates != expected: issues.append('hreflang_mismatch')
    if page.lang != ('ar' if filename.startswith('ar/') else 'en'): issues.append('language_mismatch')
    if any('alt' not in image for image in page.images): issues.append('image_missing_alt')
    if any('width' not in image or 'height' not in image for image in page.images): issues.append('image_missing_dimensions')
    if not page.schemas: issues.append('missing_schema')
    for schema in page.schemas:
        try: json.loads(schema)
        except ValueError: issues.append('invalid_schema_json')
    if 'YOUR_FORM_ID' in text or 'GTM-XXXX' in text: issues.append('placeholder_in_page')
    return page, issues


def local_audit():
    reports, titles = [], {}
    for filename in PAGES:
        source = ROOT / filename
        if not source.exists():
            reports.append({'page': filename, 'issues': ['missing_page']})
            continue
        text = source.read_text(encoding='utf-8')
        page, issues = inspect_html(text, filename)
        if page.title in titles: issues.append('duplicate_title')
        titles[page.title] = filename
        total = source.stat().st_size
        for asset in set(page.assets):
            if urllib.parse.urlsplit(asset).scheme or asset.startswith('//'): continue
            asset_file = (source.parent / urllib.parse.unquote(asset.split('?')[0])).resolve()
            if ROOT not in asset_file.parents:
                issues.append('asset_outside_site')
            elif not asset_file.is_file(): issues.append('missing_asset:' + asset)
            else: total += asset_file.stat().st_size
        if total > 1_500_000: issues.append('local_asset_budget_over_1_5MB')
        reports.append({'page': filename, 'issues': sorted(set(issues)),
                        'local_asset_bytes': total,
                        'size_note': 'All referenced local assets, including lazy images; excludes fonts/network compression.'})
    issues = []
    try:
        urls = [node.text for node in ET.parse(ROOT / 'sitemap.xml').findall('.//{*}loc')]
        if set(urls) != {canonical(p) for p in PAGES} or len(urls) != len(PAGES): issues.append('sitemap_url_mismatch')
    except (OSError, ET.ParseError): issues.append('sitemap_missing_or_invalid')
    robots = (ROOT / 'robots.txt').read_text(encoding='utf-8') if (ROOT / 'robots.txt').exists() else ''
    if 'Sitemap: ' + SITE + '/sitemap.xml' not in robots: issues.append('robots_sitemap_missing')
    reports.append({'page': 'discovery', 'issues': issues})
    return reports


class SiteRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parts = urllib.parse.urlsplit(newurl)
        if parts.scheme != 'https' or parts.hostname not in ('ec-egypt.com', 'www.ec-egypt.com'):
            raise ValueError('Unexpected redirect')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def live_audit():
    results = []
    paths = [p.replace('index.html', '') for p in PAGES] + ['robots.txt', 'sitemap.xml', 'llms.txt', '__ec_growth_missing_page__']
    opener = urllib.request.build_opener(SiteRedirects())
    for path in paths:
        result = {'path': '/' + path, 'issues': []}
        try:
            request = urllib.request.Request(SITE + '/' + path, headers={'User-Agent': 'ECGrowthMonitor/1.0 (owner read-only GET)'})
            try: response = opener.open(request, timeout=20)
            except urllib.error.HTTPError as exc: response = exc
            with response:
                result['status'] = response.code
                body = response.read(MAX_BYTES + 1)
                headers = response.headers
                final = response.url
            expected = 404 if path == '__ec_growth_missing_page__' else 200
            if result['status'] != expected: result['issues'].append('http_expected_' + str(expected))
            if final != SITE + '/' + path: result['issues'].append('unexpected_redirect')
            if len(body) > MAX_BYTES: result['issues'].append('response_too_large')
            elif result['status'] == 200:
                text = body.decode('utf-8', 'replace')
                if path.endswith('.html') or path in ('', 'ar/'):
                    filename = path + 'index.html' if path in ('', 'ar/') else path
                    _, findings = inspect_html(text, filename, headers)
                    result['issues'].extend(findings)
                elif path == 'sitemap.xml': ET.fromstring(text)
        except Exception as exc:
            result['issues'].append('request_failed:' + type(exc).__name__)
        results.append(result)
    return results


def number(value):
    n = float(value)
    if not math.isfinite(n) or n < 0: raise ValueError('Invalid metric')
    return n


def analytics(manifest_path, today):
    result = {'status': 'unavailable', 'gsc': {'status': 'unavailable'}, 'ga4': {'status': 'unavailable'},
              'scope_note': 'Export ownership/hostname are declared in the manifest; no remote permission or export authenticity verification.'}
    if not manifest_path: return result
    try:
        manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
        if manifest.get('site', '').rstrip('/') != SITE: raise ValueError('Wrong site')
    except Exception as exc:
        result['error'] = type(exc).__name__
        return result
    for source, metrics, lag in [('gsc', ['clicks', 'impressions'], 3), ('ga4', ['sessions', 'organic_sessions'], 1)]:
        try:
            config = manifest[source]
            if source == 'gsc' and config.get('property') not in ('sc-domain:ec-egypt.com', SITE + '/'):
                raise ValueError('Wrong property')
            if source == 'ga4' and (config.get('hostname') != 'ec-egypt.com' or not str(config.get('property_id', '')).isdigit()):
                raise ValueError('Missing EC property')
            filename = (manifest_path.parent / config['file']).resolve()
            rows = {}
            with filename.open(encoding='utf-8-sig', newline='') as handle:
                reader = csv.DictReader(handle)
                if not set(['date'] + metrics).issubset(reader.fieldnames or []): raise ValueError('Missing columns')
                for row in reader:
                    day = date.fromisoformat(row['date'])
                    if day in rows: raise ValueError('Duplicate date; use daily totals')
                    rows[day] = {metric: number(row[metric]) for metric in metrics}
                    if source == 'gsc' and rows[day]['clicks'] > rows[day]['impressions']: raise ValueError('Invalid clicks')
                    if source == 'ga4' and rows[day]['organic_sessions'] > rows[day]['sessions']: raise ValueError('Invalid sessions')
            end = today - timedelta(days=lag)
            expected = [end - timedelta(days=n) for n in range(56)]
            missing = [day.isoformat() for day in expected if day not in rows]
            data = {'status': 'partial' if missing else 'ok', 'expected_end': end.isoformat(),
                    'missing_days': missing, 'latest_export_day': max(rows).isoformat() if rows else None}
            if not missing:
                data['comparison'] = {}
                for metric in metrics:
                    recent = sum(rows[d][metric] for d in expected[:28])
                    previous = sum(rows[d][metric] for d in expected[28:])
                    data['comparison'][metric] = {'recent28': recent, 'previous28': previous,
                        'change_pct': round((recent - previous) / previous * 100, 2) if previous else None}
                if source == 'gsc':
                    data['ctr'] = {period: (data['comparison']['clicks'][period] / data['comparison']['impressions'][period]
                                           if data['comparison']['impressions'][period] else None)
                                   for period in ('recent28', 'previous28')}
                data['periods'] = {'recent_start': expected[27].isoformat(), 'recent_end': end.isoformat(),
                                   'previous_start': expected[55].isoformat(), 'previous_end': expected[28].isoformat()}
            result[source] = data
        except Exception as exc:
            result[source] = {'status': 'unavailable', 'error': type(exc).__name__}
    result['status'] = 'ok' if all(result[s]['status'] == 'ok' for s in ('gsc', 'ga4')) else 'partial'
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=DEFAULT_OUT)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--live', action='store_true', help='GET public EC URLs; no submissions')
    mode.add_argument('--offline', action='store_true', help='Local files only (default)')
    parser.add_argument('--imports', type=Path, help='Private manifest for existing EC-only daily CSV exports')
    parser.add_argument('--force', action='store_true', help='Replace today\'s report for this mode')
    args = parser.parse_args()
    out = args.output.resolve()
    if out == ROOT or ROOT in out.parents:
        parser.error('Reports must be outside the website repository')
    out.mkdir(parents=True, exist_ok=True)
    today = date.today()
    mode_name = 'live' if args.live else 'offline'
    report_path = out / (today.isoformat() + '-' + mode_name + '.json')
    lock = out / 'run.lock'
    try: fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        print('Another run or stale run.lock exists. Inspect the process before removing the lock.')
        return 4
    try:
        with os.fdopen(fd, 'w') as handle: handle.write(str(os.getpid()))
        if report_path.exists() and not args.force:
            report = json.loads(report_path.read_text(encoding='utf-8'))
            print(json.dumps({'cached_report': str(report_path), 'exit_code': report['exit_code']}))
            return report['exit_code']
        audit = local_audit()
        live = live_audit() if args.live else []
        data = analytics(args.imports.resolve() if args.imports else None, today)
        alerts = [f'{scope}:{row.get("page", row.get("path"))}:{issue}'
                  for scope, rows in [('local', audit), ('live', live)] for row in rows for issue in row['issues']]
        for source in ('gsc', 'ga4'):
            if data[source]['status'] != 'ok': alerts.append('data:' + source + ':' + data[source]['status'])
            for metric, values in data[source].get('comparison', {}).items():
                if values['previous28'] >= 50 and values['change_pct'] is not None and values['change_pct'] <= -25:
                    alerts.append('decline:' + source + ':' + metric)
        state_path = out / ('state-' + mode_name + '.json')
        old = json.loads(state_path.read_text(encoding='utf-8')) if state_path.exists() else {}
        exit_code = 2 if any(a.startswith(('local:', 'live:')) for a in alerts) else 3 if data['status'] != 'ok' else 0
        fingerprint = hashlib.sha256()
        for filename in PAGES + ['js/main.js', 'js/measurement.js', 'css/style.css', 'sitemap.xml', 'robots.txt']:
            source = ROOT / filename
            if source.exists(): fingerprint.update(filename.encode() + source.read_bytes())
        report = {'version': 1, 'site': SITE, 'day': today.isoformat(), 'mode': mode_name,
                  'created_at': datetime.now(timezone.utc).isoformat(), 'source_sha256': fingerprint.hexdigest(),
                  'local': audit, 'live': live, 'analytics': data, 'alerts': alerts,
                  'new_alerts': sorted(set(alerts) - set(old.get('alerts', []))),
                  'resolved_alerts': sorted(set(old.get('alerts', [])) - set(alerts)), 'exit_code': exit_code,
                  'limitations': ['No browser, Lighthouse, Core Web Vitals, indexing or AI citation verification.',
                                  'No EC credentials or live GA4/GSC API integration are configured.',
                                  'Absent data is unknown, never zero. Local measurement events are not confirmed leads.',
                                  'Offline reports describe source files, not the deployed website.',
                                  'Local JSON-LD parsing is not rich-result eligibility validation.']}
        write_json(report_path, report)
        write_json(out / ('latest-' + mode_name + '.json'), report)
        write_json(state_path, {'alerts': alerts, 'day': today.isoformat()})
        summary = ['# EC Egypt — daily growth report', '', 'Date: ' + report['day'], 'Mode: ' + mode_name,
                   'GA4: ' + data['ga4']['status'], 'GSC: ' + data['gsc']['status'], '', '## New findings',
                   *['- ' + a for a in report['new_alerts']], '', '## Resolved findings',
                   *['- ' + a for a in report['resolved_alerts']], '', '## Limitations',
                   *['- ' + a for a in report['limitations']]]
        (out / ('latest-' + mode_name + '.md')).write_text('\n'.join(summary), encoding='utf-8')
        print(json.dumps({'report': str(report_path), 'exit_code': exit_code, 'analytics': data['status']}))
        return exit_code
    finally:
        lock.unlink(missing_ok=True)


if __name__ == '__main__':
    try: sys.exit(main())
    except Exception as exc:
        print('Report failed: ' + type(exc).__name__, file=sys.stderr)
        sys.exit(4)
