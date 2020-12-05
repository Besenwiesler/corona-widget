# Fork

Fork von [incident-Widget von tzschies](https://github.com/tzschies/incidence) mit geringfügigen Anpassungen und kosmetischen Änderungen.

# Screenshots

Widget in Größe Medium:

<img src=screenshotMedium.jpg>

Widget in Größe Small:

<img src=screenshotSmall.jpg>

# Beschreibung

COVID-19-Fallzahlen-Widget für iOS innerhalb Deutschlands 🇩🇪.

Skript zeigt Informationen wie die Anzahl der Neuinfizierten, Geheilten und Todesfälle (sowie R-Faktor) an.
Es kann per Parameter eingestellt werden, ob die Zahlen für Landkreis, Bundesland oder Deutschland angezeigt werden sollen. Außerdem kann ein eigener Name für Landkreis oder Bundesland über Parameter konfiguriert werden.

# Installation

Source
- Quellcode <b>corona.js</b> in Scriptable als neues Script hinzufügen.
- Widget hinzufügen und über Parameter konfigurieren (siehe Abschnitt unten).

# Konfiguration über Parameter

Parameter werden über eine kommaseparierte Liste übergeben wie folgt:

Gebiet, [LAT, LON, Name]

Erklärung:

- Gebiet
  - 0: Landkreis
  - 1: Bundesland
  - 2: Deutschland
- LAT: Breitengrad (optionaler Parameter)
- LON: Längengrad (optionaler Parameter)
- Name: Eigene Bezeichnung des Landkreises/Bundeslands (optionaler Parameter)

Beispiele:
- lokaler Landkreis (Ortung via GPS): ""
- lokales Bundesland (Ortung via GPS): "1"
- fest eingestelltes Bundesland Bayern: "1,48.96,12.38"
- fest eingestellter Landkreis Regensburg mit eigenem Namen: "1,48.96,12.38,LK Regensburg"
- Deutschland: "2"

# Angezeigte Informationen

Als Widget in Größe Small werden folgende Informationen angezeigt: 
-  Inzidenz mit Trend Pfeil 
    Der Trendpfeil bestimmt sich durch den geschätzten (!) R-Faktor. Dieser wird direkt darunter angezeigt. Ist der R-Faktor zwischen 0,95 und 1,05 bleibt die Inzidenz in etwa konstant (→), ist der R-Faktor zwischen 1,05 und 1,1 steigt die Inzidenz leicht (↗), über 1,1 steigt sie stark (↑). Ist der R-Fakor zwischen 0,9 und 0,95 sinkt die Inzidenz leicht (↘), unter 0,9 sinkt sie stark (↓). 
- Geschätzter R-Faktor. 
    Der R-Faktor soll die Zahl derer angeben, die von einem Infizierten angesteckt werden. D.h. ein R-Faktor von 2 bedeutet ein Infizierter steckt im Durchschnitt 2 weitere Menschen an. Der R-Faktor wird unter der Annahme geschätzt, dass zwischen Ansteckung und selbst ansteckbar im Durchschnitt 3,5 Tage vergehen. Außerdem werden die durchschnittlichen Neuinfizierte über 7 Tage gemittelt (um statistische Effekte am Wochenende zu eliminieren). Beispiel: Vor 7 Tagen gab es im 7-Tage Schnitt 4 Neuinfektionen. Heute gibt es im 7-Tage-Schnitt 16 Neuinfektionen. Unter der Annahme der 3,5 Tage und einem R-Faktor von 2 haben die 4 Neuinfektionen nach 3,5 Tagen also 8 Personen angesteckt, welche nach weiteren 3,5 Tagen 16 Personen angesteckt haben. Der R-Faktor berechnet sich dann also aus R=Wurzel(Neuinfektionen_heute/Neuinfektionen_vor7Tagen) = Wurzel(16/4) = 2
    Dies ist nur eine grobe Schätzung, um die ungefähre Dynamik der Pandemie anzugeben und den Trend zu bestimmen!
- Inzidenz-Graph-Verlauf der letzten 4 Wochen

Als Widget in Größe Medium werden auf der rechten Seite weitere Informationen angezeigt: 
- 🔴: Neuinfizierte am heutigen Tag im Landkreis/Bundesland/Deutschland (in Klammern die Gesamtzahl der jeweiligen Region)
- 🟢: Neugenesene am heutigen Tag im Landkreis/Bundesland/Deutschland (in Klammern die Gesamtzahl der jeweiligen Region)
- 🪦: Neue Todesfälle am heutigen Tag im Landkreis/Bundesland/Deutschland (in Klammern die Gesamtzahl der jeweiligen Region)
- 📈: Aktive Fälle im Landkreis/Bundesland/Deutschland im Sinne von Neuinfizierte minus Neugenesene minus Todesfälle (in Klammern die Differenz des heutigen Tages)
- 🏥: Anzahl der COVID-19-Patienten, die im Krankenhaus behandelt werden im Landkreis/Bundesland/Deutschland (in Klammern der relative Anteil zu den aktuell Infizierten)
- 🫁: Anzahl der COVID-19-Patienten, die im Krankenhaus beatmet werden im Landkreis/Bundesland/Deutschland (in Klammern der relative Anteil zu den aktuell Infizierten)
- 🛌: Anzahl freier Intensivbetten im Landkreis/Bundesland/Deutschland (relativer Anteil der Gesamtintensivbetten)

Zahlenwerte werden wie folgt gerundet und abgekürzt dargestellt:
- 4- bis 6-stellige Werte werden mit "K" gerundet und abgekürzt dargestellt.
  - Beispiel: "123456" wird zu "123 K"
- 7-stellige Werte werden mit "M" gerundet und abgekürzt dargestellt.
  - Beispiel: "1234567" wird zu "1.23 M"
