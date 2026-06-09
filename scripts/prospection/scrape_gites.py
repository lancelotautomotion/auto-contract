#!/usr/bin/env python3
"""
Sourcing de leads pour Kordia.

Interroge la Google Places API (New) pour trouver des gites / locations
saisonnieres par departement, recupere leur site web puis extrait l'email
de contact PRO publie publiquement sur le site (page contact / mentions
legales). Sortie : un CSV pret a importer dans l'outil d'envoi.

Usage :
    export GOOGLE_PLACES_API_KEY="..."
    python scrape_gites.py --departements "Dordogne,Luberon,Finistere" --out leads.csv

Conformite : ne collecte que des adresses professionnelles publiees
publiquement, dans un cadre de prospection B2B liee au metier du
destinataire (CNIL). Ajoute toujours un lien de desinscription a l'envoi.
"""

import argparse
import csv
import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACES_FIELDS = (
    "places.displayName,places.formattedAddress,"
    "places.websiteUri,places.nationalPhoneNumber,nextPageToken"
)

USER_AGENT = (
    "Mozilla/5.0 (compatible; KordiaProspection/1.0; +https://kordia.fr)"
)
REQUEST_TIMEOUT = 12
POLITE_DELAY = 1.0  # secondes entre deux requetes sortantes

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

# Pages susceptibles de contenir l'email de contact, par priorite.
CONTACT_HINTS = ("contact", "mentions-legales", "mentions", "legal", "apropos", "a-propos")

# Domaines / motifs a ignorer (faux positifs courants).
EMAIL_BLOCKLIST = (
    "example.com", "domain.com", "email.com", "sentry.io", "wixpress.com",
    "wix.com", "godaddy.com", "squarespace.com", "jimdo.com", "sentry-next.wixpress.com",
    "@2x", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
)


def search_places(query, api_key, max_results=60):
    """Recherche textuelle Google Places (avec pagination)."""
    results = []
    page_token = None
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": PLACES_FIELDS,
    }
    while len(results) < max_results:
        body = {"textQuery": query, "languageCode": "fr", "regionCode": "FR"}
        if page_token:
            body["pageToken"] = page_token
        resp = requests.post(
            PLACES_SEARCH_URL, json=body, headers=headers, timeout=REQUEST_TIMEOUT
        )
        if resp.status_code != 200:
            print(f"  ! Places API {resp.status_code}: {resp.text[:200]}", file=sys.stderr)
            break
        data = resp.json()
        results.extend(data.get("places", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
        time.sleep(POLITE_DELAY)
    return results[:max_results]


def fetch(url):
    try:
        resp = requests.get(
            url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT
        )
        if resp.status_code == 200 and "text/html" in resp.headers.get("Content-Type", ""):
            return resp.text
    except requests.RequestException:
        return None
    return None


def clean_emails(raw):
    out = set()
    for e in raw:
        e = e.strip().strip(".").lower()
        if any(bad in e for bad in EMAIL_BLOCKLIST):
            continue
        out.add(e)
    return out


def extract_emails_from_html(html, base_url):
    """Recupere les emails d'une page : mailto en priorite, puis texte brut."""
    soup = BeautifulSoup(html, "html.parser")
    found = set()
    for a in soup.find_all("a", href=True):
        if a["href"].lower().startswith("mailto:"):
            addr = a["href"][7:].split("?")[0]
            found.update(EMAIL_RE.findall(addr))
    found.update(EMAIL_RE.findall(soup.get_text(" ")))
    return clean_emails(found), soup


def find_contact_links(soup, base_url):
    links = []
    host = urlparse(base_url).netloc
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full = urljoin(base_url, href)
        if urlparse(full).netloc != host:
            continue
        label = (href + " " + a.get_text(" ")).lower()
        if any(h in label for h in CONTACT_HINTS):
            links.append(full)
    seen, ordered = set(), []
    for l in links:
        if l not in seen:
            seen.add(l)
            ordered.append(l)
    return ordered[:3]


def find_email_for_site(website):
    """Visite l'accueil puis jusqu'a 3 pages contact/legales."""
    html = fetch(website)
    if not html:
        return None
    emails, soup = extract_emails_from_html(html, website)
    if emails:
        return sorted(emails)[0]
    for link in find_contact_links(soup, website):
        time.sleep(POLITE_DELAY)
        sub_html = fetch(link)
        if not sub_html:
            continue
        sub_emails, _ = extract_emails_from_html(sub_html, link)
        if sub_emails:
            return sorted(sub_emails)[0]
    return None


def run(departements, queries_per_dept, out_path, api_key, max_per_query):
    seen_domains = set()
    rows = []
    for dept in departements:
        for tpl in queries_per_dept:
            query = tpl.format(dept=dept)
            print(f"> Recherche : {query}")
            places = search_places(query, api_key, max_results=max_per_query)
            print(f"  {len(places)} resultats")
            for p in places:
                website = p.get("websiteUri")
                if not website:
                    continue
                domain = urlparse(website).netloc.lower().replace("www.", "")
                if not domain or domain in seen_domains:
                    continue
                seen_domains.add(domain)
                time.sleep(POLITE_DELAY)
                email = find_email_for_site(website)
                if not email:
                    continue
                rows.append({
                    "nom": p.get("displayName", {}).get("text", ""),
                    "departement": dept,
                    "adresse": p.get("formattedAddress", ""),
                    "telephone": p.get("nationalPhoneNumber", ""),
                    "site": website,
                    "email": email,
                })
                print(f"    + {email}  ({domain})")

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["nom", "departement", "adresse", "telephone", "site", "email"]
        )
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nTermine : {len(rows)} leads avec email -> {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Sourcing de gites pour Kordia")
    parser.add_argument(
        "--departements", required=True,
        help="Liste separee par des virgules, ex: 'Dordogne,Luberon,Finistere'",
    )
    parser.add_argument("--out", default="leads.csv", help="Fichier CSV de sortie")
    parser.add_argument(
        "--max-par-requete", type=int, default=60,
        help="Nb max de resultats Places par requete (max 60)",
    )
    args = parser.parse_args()

    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        sys.exit("Erreur : variable d'environnement GOOGLE_PLACES_API_KEY manquante.")

    departements = [d.strip() for d in args.departements.split(",") if d.strip()]
    queries_per_dept = [
        "gite {dept}",
        "location saisonniere {dept}",
        "chambre d'hotes {dept}",
    ]
    run(departements, queries_per_dept, args.out, api_key, args.max_par_requete)


if __name__ == "__main__":
    main()
