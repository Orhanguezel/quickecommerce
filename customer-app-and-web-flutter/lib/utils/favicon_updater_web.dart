import 'dart:html' as html;

void updateFavicon(String? url) {
  if (url == null || url.trim().isEmpty) return;

  final head = html.document.head;
  if (head == null) return;

  html.LinkElement? link = html.document.querySelector("link[rel='icon']") as html.LinkElement?;
  link ??= html.document.querySelector("link[rel='shortcut icon']") as html.LinkElement?;

  if (link == null) {
    link = html.LinkElement()..rel = 'icon';
    head.append(link);
  }

  link.href = url;
}
