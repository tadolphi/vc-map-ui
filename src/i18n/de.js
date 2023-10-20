const messages = {
  navbar: {
    maps: {
      CesiumMap: '3D-Karte aktivieren',
      OpenlayersMap: '2D-Karte aktivieren',
      ObliqueMap: 'Schrägluftbildkarte aktivieren',
    },
    menu: {
      tooltip: 'Menü',
    },
    share: {
      tooltip: 'Aktuellen Kartenausschnitt teilen',
    },
  },
  content: {
    title: 'Inhalte',
    empty: 'Aktuell sind keine Einträge verfügbar.',
    search: {
      placeholder: 'Elemente suchen',
    },
    infoAction: {
      title: 'Weitere Informationen',
    },
    viewpointAction: {
      title: 'Zur Ansicht springen',
    },
    styleAction: {
      title: 'Stilauswahl öffnen',
    },
    layerExtentAction: {
      name: 'Auf Ebene zoomen',
      title: 'Auf Ebenenausdehnung zoomen',
    },
  },
  navigation: {
    obliqueLeftTooltip: 'Ansicht nach links drehen',
    obliqueRightTooltip: 'Ansicht nach rechts drehen',
    zoomInTooltip: 'Hineinzoomen',
    zoomOutTooltip: 'Herauszoomen',
    pitchTooltip: 'Kameraneigung: {0}°',
    overviewMapTooltip: 'Übersichtskarte',
    homeButton: 'Zur Startansicht springen',
  },
  categoryManager: {
    title: 'Mein Arbeitsbereich',
    tooltip: 'Mein Arbeitsbereich',
  },
  collectionManager: {
    more: 'Weitere anzeigen...',
    empty: 'Es gibt noch keine Einträge.',
  },
  components: {
    pin: 'Fenster andocken',
    close: 'Fenster schließen',
    apply: 'Anwenden',
    cancel: 'Abbrechen',
    vcsFormSection: {
      help: 'Hilfe anzeigen',
    },
    vcsTable: {
      key: 'Name',
      value: 'Wert',
    },
    vcsDataTable: {
      searchbarPlaceholder: 'Name, Wert, ...',
      itemsPerPage: 'pro Seite',
      ofItems: 'von',
      nextPage: 'Nächste Seite',
      formerPage: 'Vorherige Seite',
      noDataPlaceholder: 'Keine Daten verfügbar',
      noResultsPlaceholder: 'Keine übereinstimmenden Einträge gefunden',
    },
    style: {
      fill: 'Füllung',
      stroke: 'Linie',
      reset: 'Zurücksetzen',
      lineWidth: 'Linienbreite',
      type: 'Typ',
      points: 'Points',
      radius: 'Radius',
      radius2: 'Radius2',
      angle: 'Winkel',
      rotation: 'Rotation',
      scale: 'Skalierung',
      opacity: 'Deckkraft',
      image: 'Symbol',
      icon: 'Icon',
      presets: 'Vorlagen',
      shape: 'Form',
      circle: 'Kreis',
      square: 'Quadrat',
      rectangle: 'Rechteck',
      triangle: 'Dreieck',
      star: 'Stern',
      cross: 'Kreuz',
      x: 'X',
      custom: 'Benutzerdefiniert',
      bold: 'Fett',
      italic: 'Kursiv',
      text: 'Text',
      enterText: 'Text hier eingeben',
      offset: 'Versatz',
    },
    vectorProperties: {
      header: 'Vektor Eigenschaften',
      altitudeMode: 'Höhenmodus',
      clampToGround: 'Auf Gelände legen',
      absolute: 'Absolut',
      relativeToGround: 'Relativ zum Gelände',
      groundLevel: 'Geländehöhe',
      classificationType: 'Klassifizierung',
      none: 'Keine',
      both: 'Beide',
      cesium3DTile: '3D Tiles',
      terrain: 'Gelände',
      heightAboveGround: 'Höhe über Gelände',
      allowPicking: 'Auswahl erlauben',
      scaleByDistance: 'Distanzskalierung',
      eyeOffset: 'Blick Versatz',
      storeys: 'Stockwerke',
      storeyHeights: 'Stockwerkshöhe(n)',
      aboveGround: 'Über Grund',
      belowGround: 'Unter Grund',
      modelUrl: 'Modell URL',
      modelHeading: 'Modell Ausrichtung',
      modelPitch: 'Modell Neigung',
      modelRoll: 'Modell Rotation',
      baseUrl: 'Basis URL',
      extrudedHeight: 'Extrusion',
      skirt: 'Skirts',
      modelScale: 'Modell Skalierung',
    },
    validation: {
      allowedRange: 'Erlaubter Wertebereich',
      notValid: 'Eingabe nicht gültig',
      required: 'Eingabe ist erforderlich',
    },
  },
  settings: {
    title: 'Einstellungen',
    tooltip: 'Einstellungen',
    languageSelector: 'Sprache',
    theme: {
      title: 'Farbschema',
      dark: 'Dunkel',
      light: 'Hell',
    },
  },
  help: {
    title: 'Hilfe',
    tooltip: 'Externe Hilfeseite in neuem Browser Tab öffnen',
  },
  featureInfo: {
    activateToolTitle: 'Informationswerkzeug aktivieren',
    deactivateToolTitle: 'Informationswerkzeug deaktivieren',
  },
  legend: {
    title: 'Legende',
    tooltip: 'Legende',
    empty: 'Aktuell sind keine Legendeneinträge verfügbar.',
    openInNew: 'In neuem Browser Tab öffnen',
    defaultLabelText: 'Text',
  },
  search: {
    title: 'Suche',
    tooltip: 'Suche',
    select: 'Suchergebnis auswählen',
    placeholder: 'Suche nach Adresse oder Ort/Sehenswürdigkeit',
    zoomToFeatureAction: 'Auf Ergebnis zoomen',
    zoomToAll: 'Auf alle Ergebnisse zoomen',
  },
  toolbox: {
    flight: 'Flug',
    miscellaneous: 'Verschiedenes',
  },
  footer: {
    title: 'Fußzeile',
    attributions: {
      title: 'Attributionen',
      tooltip: 'Öffne Attributionsfenster',
      empty: 'Aktuell sind keine Attributionseinträge verfügbar.',
    },
  },
  notification: {
    error: 'Fehler',
    warning: 'Warnung',
    information: 'Information',
    success: 'Erfolg',
  },
  datePicker: {
    today: 'Heute',
  },
  list: {
    renameAction: {
      title: 'Element umbenennen',
    },
  },
};

export default messages;
