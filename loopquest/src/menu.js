export class Menu extends Phaser.Scene {

  constructor() {
    super('Menu');
  }

  preload() {
    this.load.audio('BalatroTheme', './src/assets/Sons/BalatroTheme.mp3');
  }

  create() {
    // Titre du menu
    this.add.text(400, 55, 'Loop Quest', { fontSize: '50px', fill: '#fff' }).setOrigin(0.5);

    // Jouer la musique du menu
    this.sound.play('BalatroTheme', { loop: true, volume: 0.5 });

    // ===== ZONE DE TEXTE DÉFILANT (entre titre et bouton) =====
    const boxX = 400;
    const boxY = 210;
    const boxW = 560;
    const boxH = 140;

    // Fond de la zone
    const bg = this.add.rectangle(boxX, boxY, boxW, boxH, 0x000000);

    // Contenu du texte défilant
    const scrollContent =
"Il y a longtemps, ce monde était habité.\n\n" +
"Une civilisation s'y est éteinte.\n\n" +
"Il n'en reste que des ruines et des mécanismes cachés.\n\n" +
"Sois curieux si tu veux avancer.\n\n" +
"Mais fais attention, étranger.\n\n" +
"Ceux qui arrivent ici sont maudits.\n\n" +
"Le temps leur est compté.";

    // Texte centré, placé juste sous la zone visible
    this.scrollText = this.add.text(
      boxX,
      boxY + boxH / 2 + 10,
      scrollContent,
      {
        fontSize: '18px',
        fill: '#cccccc',
        wordWrap: { width: boxW - 40 },
        align: 'center',
        lineSpacing: 5
      }
    );
    this.scrollText.setOrigin(0.5, 0);

    // Masque pour clipper le texte dans la boîte
    const mask = this.add.graphics();
    mask.fillRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH);
    this.scrollText.setMask(mask.createGeometryMask());

    // Vitesse de défilement (px/s)
    this.scrollSpeed = 20;
    this.scrollBoxTop = boxY - boxH / 2;
    this.scrollTextStartY = boxY + boxH / 2 + 10;

    // Bouton pour démarrer le jeu
    let startButton = this.add.text(400, 340, 'Commencer le Jeu', { fontSize: '34px', fill: '#fff' }).setOrigin(0.5).setInteractive();
    startButton.on('pointerdown', () => {
      this.sound.stopAll();
      this.scene.start('Game');
    });

    // Instructions courtes
    this.add.text(400, 410, 'Flèches: bouger  |  Espace: attaquer  |  E/R/T/Y/H: interagir', { fontSize: '16px', fill: '#a8a6a6' }).setOrigin(0.5);

      // Crédits en bas
      this.add.text(400, 470, 'Par  Maxence • Nael • Alexandre • Neo', { fontSize: '20px', fill: '#c0bebe', fontStyle: 'italic' }).setOrigin(0.5);
    }

  update(time, delta) {
    if (!this.scrollText) return;
    this.scrollText.y -= this.scrollSpeed * (delta / 1000);
    // Repartir du bas quand le texte est entièrement sorti par le haut
    if (this.scrollText.y + this.scrollText.height < this.scrollBoxTop) {
      this.scrollText.y = this.scrollTextStartY;
    }
  }

}