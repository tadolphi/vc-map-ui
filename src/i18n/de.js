import { de } from 'vuetify/locale';

const messages = {
  $vuetify: {
    ...de,
    dataIterator: {
      ...de.dataIterator,
      rowsPerPageText: 'Elemente pro Seite:',
      pageText: '{0}-{1} von {2}',
    },
  },
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
    locator: {
      errorAccess: 'Der Zugriff auf Ihre Position wurde verweigert.',
      errorCurrentPosition:
        'Ihre momentane Position konnte leider nicht erfasst werden.',
      errorConnection:
        'Während dem ermitteln Ihrer Position wurde die Verbindung verloren',
      errorPosition: 'Ihre Position kann leider nicht erfasst werden',
    },
  },
  categoryManager: {
    title: 'Mein Arbeitsbereich',
    tooltip: 'Mein Arbeitsbereich',
  },
  collectionManager: {
    more: 'Alle anzeigen...',
    less: 'Weniger anzeigen...',
    empty: 'Es gibt noch keine Einträge.',
  },
  components: {
    pin: 'Fenster andocken',
    close: 'Fenster schließen',
    add: 'Hinzufügen',
    apply: 'Anwenden',
    cancel: 'Abbrechen',
    import: {
      submit: 'Importieren',
      fileDrop: 'Dateien hierher ziehen',
      failure: 'Datei {fileName} konnte nicht gelesen werden.',
      predicateFailure: '{0} Feature entsprechen nicht den Anforderungen.',
      addFailure: '{0} Feature existieren bereits.',
      featuresAdded: '{0} Feature importiert.',
      nothingAdded: 'Es konnten keine Feature importiert werden.',
    },
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
      shape: 'Form',
      presets: 'Vorlagen',
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
    flight: {
      general: 'Flug Einstellungen',
      name: 'Name (ID)',
      title: 'Titel',
      titlePlaceholder: 'Titel des Kameraflugs',
      interpolation: 'Interpolation',
      duration: 'Gesamtflugdauer',
      spline: 'Spline',
      linear: 'Linear',
      loop: 'Schleife',
      anchors: 'Stützpunkte',
      hidePath: 'Flugpfadvisualisierung',
      addAnchor: 'Aktuelle Ansicht als Stützpunkt hinzufügen',
      removeAnchor: 'Stützpunkt entfernen',
      editAnchor: 'Stützpunkt bearbeiten',
      zoomToAnchor: 'Auf Stützpunkt zoomen',
      noAnchor: 'Es sind noch keine Stützpunkte definiert.',
      invalidDuration: 'Die Gesamtflugzeit muss größer als Null sein!',
      zoom: 'Auf Ausdehnung zoomen',
      export: 'Flug exportieren',
      exportPath: 'Flugpfad exportieren',
    },
    splashScreen: {
      name: 'Splash Screen',
      checkBoxText:
        'Bitte akzeptieren sie die [Bedingungen](https://vc.systems/) um Fortzufahren',
      buttonTitle: 'Weiter',
    },
    customScreen: {
      name: 'Benutzerdefinierter Screen',
    },
    viewpoint: {
      name: 'Name (ID)',
      title: 'Titel',
      titlePlaceholder: 'Titel der Ansicht',
      groundPosition: 'Bodenposition',
      cameraPosition: 'Kameraposition',
      distance: 'Distanz',
      heading: 'Azimut',
      pitch: 'Neigung',
      roll: 'Querneigung',
      animate: 'Animation',
      duration: 'Animationsdauer',
      general: 'Allgemeine Einstellungen',
      positionAndOrientation: 'Position & Orientierung',
      updateFromView: 'Aktuelle Kartenposition übernehmen',
      sync: 'Synchronisieren der Kamera einschalten',
      syncOff: 'Synchronisation zum Editieren ausschalten',
      finiteNumber: 'Nur finite Zahlen sind zulässig!',
      positiveNumber: 'Nur positive Zahlen sind zulässig!',
    },
    coordinate: {
      outOfRange: 'Wert außerhalb des zulässigen Bereichs!',
    },
    extent: {
      title: 'Ausdehnung',
      projection: 'Projektion',
      min: 'Min',
      max: 'Max',
      show: 'Ausdehnung in Karte anzeigen',
      hide: 'Ausdehnung in Karte ausblenden',
      create: 'Neue Ausdehnung in Karte zeichnen',
      zoom: 'Auf Ausdehnung zoomen',
      invalid: 'Koordinaten ergeben keine valide Ausdehnung!',
      editVertices: 'Ecken bearbeiten',
      translate: 'Ausdehnung verschieben',
      toggle: 'Extent an-/ausschalten',
    },
    editor: {
      translate: 'Objekt verschieben',
      rotate: 'Objekt rotieren',
      scale: 'Objekt skalieren',
      extrude: 'Objekt extrudieren',
      header: 'Transformieren',
      placeOnTerrain: 'Auf Gelände plazieren',
      cw: '90° rechtsherum drehen',
      ccw: '90° linksherum drehen',
      angle: 'Winkel',
      edit: 'Geometrie editieren',
      modifyHeader: 'Editieren',
      modifyInfo:
        'Klicke die Symbole in der Überschrift um die selektierten Geometrien zu editieren.',
      styleHeader: 'Stil',
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
    displayQuality: {
      title: 'Anzeigequalität',
      level: {
        low: 'Niedrige',
        medium: 'Mittlere',
        high: 'Hohe',
      },
    },
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
    imprint: {
      title: 'Impressum',
      tooltip: 'Öffne Impressumsfenster',
    },
    dataProtection: {
      title: 'Datenschutz',
      tooltip: 'Öffne Datenschutzfenster',
    },
    positionDisplay: {
      title: 'Positionsanzeige',
      projection: 'Projektionsauswahl',
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
    selectAll: 'Alle selektieren',
    clearSelection: 'Selektion aufheben',
    renameItem: 'Element umbenennen',
    deleteItem: 'Element löschen',
    editItem: 'Element editieren',
    import: 'Importieren',
    export: 'Selektion exportieren',
    delete: 'Selektion löschen',
    edit: 'Selektion editieren',
  },
  flight: {
    player: 'Player',
    playTooltip: 'Diesen Flug abspielen',
    pauseTooltip: 'Diesen Flug an dieser Stelle pausieren',
    stopTooltip: 'Diesen Flug stoppen',
    forwardFastTooltip: 'Schnelles Vorspulen',
    backwardFastTooltip: 'Schnelles Zurückspulen',
    forwardStepTooltip: 'Schritt vorwärts zur nächsten Position',
    backwardStepTooltip: 'Schritt rückwärts zur letzten Position',
  },
};

export default messages;
