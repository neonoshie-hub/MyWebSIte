import { Menu } from './menu.js';


class Game extends Phaser.Scene {

  constructor() {
    super('Game');
  }

  init() {
    this.resetRuntimeState();
  }

  resetRuntimeState() {
    this.isGameOver = false;
    this.gameOverUI = null;
    this.victoryTriggered = false;
    this.victoryUI = null;
    this.activeDialogueVoiceKey = null;
    this.timer = null;
    this.timerText = null;
    this.lastDamageTime = 0;
    this.lastAttackTime = 0;
    this.codeInputActive = false;
    this.code_1_2_InputActive = false;
    this.code_3_4_KeyListener = null;
    this.code_1_2_KeyListener = null;
  }

  handleSceneShutdown() {
    this.clearGameOverScreen();
    this.clearVictoryScreen();
    this.hideDialogue();

    if (this.code_3_4_KeyListener) {
      this.input.keyboard.off('keydown', this.code_3_4_KeyListener);
      this.code_3_4_KeyListener = null;
    }

    if (this.code_1_2_KeyListener) {
      this.input.keyboard.off('keydown', this.code_1_2_KeyListener);
      this.code_1_2_KeyListener = null;
    }

    if (this.timer) {
      this.timer.remove();
      this.timer = null;
    }

    this.sound.stopAll();
    this.isGameOver = false;
    this.victoryTriggered = false;
  }

  preload() {
    this.load.spritesheet("player", "./src/assets/Images/Brownie.png", { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet("enemy", "./src/assets/Images/Papyrus.png", { frameWidth: 30, frameHeight: 64 });
    this.load.spritesheet("EpDown", "./src/assets/Images/EpDown.png", { frameWidth: 512, frameHeight: 1024 });
    this.load.spritesheet("EpUp", "./src/assets/Images/EpUp.png", { frameWidth: 512, frameHeight: 1024 });
    this.load.spritesheet("EpLeft", "./src/assets/Images/EpLeft.png", { frameWidth: 512, frameHeight: 1024 });
    this.load.spritesheet("EpRight", "./src/assets/Images/EpRight.png", { frameWidth: 512, frameHeight: 1024 });

    //Sons du jeu
    this.load.audio('attackSound', './src/assets/Sons/Sword1.m4a');
    this.load.audio('WalkingSound', './src/assets/Sons/Walking.mp3');
    this.load.audio('AmbiantSound', './src/assets/Sons/Ambiant.mp3');
    this.load.audio('BirdAtDawn', './src/assets/Sons/BirdAtDawn.mp3');
    this.load.audio('Slicing', './src/assets/Sons/Slicing.mp3');
    this.load.audio('Damage', './src/assets/Sons/Damage.mp3');
    this.load.audio('landslide', './src/assets/Sons/Landslide.mp3');
    this.load.audio('Key', './src/assets/Sons/Key.mp3');
    this.load.audio('WindSound', './src/assets/Sons/WindSound.m4a');
    this.load.audio('item recupere', './src/assets/Sons/item recupere.m4a');
    this.load.audio('teleporteur', './src/assets/Sons/teleport.mp3');
    this.load.audio('CrystalSound', './src/assets/Sons/CrystalSound.mp3');
    this.load.audio('asgore talking', './src/assets/Sons/asgore talking.mp3');
    this.load.audio('sans talking', './src/assets/Sons/sans talking.m4a');
    this.load.audio('toriel talking', './src/assets/Sons/toriel talking.m4a');
    this.load.audio('sans talking1', './src/assets/Sons/sans talking1.m4a');
    
    //Map
    const tilesPath = './src/assets/Tiles/Pixel Art Top Down - Basic v1.2.3/Texture/';
    this.load.image('crystal_anime', tilesPath + 'crystal sprite sheet anime.png');
    this.load.image('SpriteSheetUn', tilesPath + 'SpriteSheetUn.png');
    this.load.image('TX_Plant_Shadow', tilesPath + 'TX Plant with Shadow.png');
    this.load.image('TX_Plant', tilesPath + 'TX Plant.png');
    this.load.image('TX_Player_Tileset', tilesPath + 'TX Player.png');
    this.load.image('TX_Props_Shadow', tilesPath + 'TX Props with Shadow.png');
    this.load.image('TX_Props', tilesPath + 'TX Props.png');
    this.load.image('TX_Shadow_Plant', tilesPath + 'TX Shadow Plant.png');
    this.load.image('TX_Shadow', tilesPath + 'TX Shadow.png');
    this.load.image('TX_Struct', tilesPath + 'TX Struct.png');
    this.load.image('TX_Tileset_Grass', tilesPath + 'TX Tileset Grass.png');
    this.load.image('TX_Tileset_Stone', tilesPath + 'TX Tileset Stone Ground.png');
    this.load.image('TX_Tileset_Wall', tilesPath + 'TX Tileset Wall.png');
    this.load.image('Water', tilesPath + 'Water.png');
    this.load.image('WaterFountain', tilesPath + 'WaterFountain.png');
    this.load.image('Undertale', tilesPath + 'undertale spritesheet complete.png');
    this.load.image('Potion', './src/assets/Images/Potion.png');
    this.load.image('Pickaxe', './src/assets/Images/pickaxe.png');
    this.load.image('Crystal', './src/assets/Images/Crystal.png');
    
    //Brume
    this.load.image('Brume1', './src/assets/Images/Brume1.png');
    
    // Charger les images des PNJ
    this.load.image('PNJ1', './src/assets/Images/PNJ1.png');
    this.load.image('PNJ3', './src/assets/Images/PNJ3.png');
    this.load.image('PNJ9', './src/assets/Images/PNJ9.png');
    this.load.image('pickaxe coupe', './src/assets/Images/pickaxe coupe.png');
    // Charger l'image de la potion
    this.load.image('potion', './src/assets/Images/Potion.png');
  

    this.load.tilemapTiledJSON('carte', './src/assets/LoopQuestalex.json');

  }

  create() {
    this.resetRuntimeState();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this);

    //Incorporation de la map:
    const carteDuNiveau = this.add.tilemap("carte");

    const tilesetConfigs = [
      { name: "TX Plant", key: "TX_Plant" },
      { name: "TX Tileset Grass", key: "TX_Tileset_Grass" },
      { name: "TX Tileset Wall", key: "TX_Tileset_Wall" },
      { name: "TX Struct", key: "TX_Struct" },
      { name: "TX Shadow Plant", key: "TX_Shadow_Plant" },
      { name: "TX Props", key: "TX_Props" },
      { name: "Water", key: "Water" },
      { name: "TX Shadow", key: "TX_Shadow" },
      { name: "TX Tileset Stone Ground", key: "TX_Tileset_Stone" },
      { name: "WaterFountain", key: "WaterFountain" },
      { name: "TX Player", key: "TX_Player_Tileset" },
      { name: "SpriteSheetUn", key: "SpriteSheetUn" },
      { name: "crystal_anime", key: "crystal_anime" },
      { name: "Undertale", key: "Undertale" },
      { name: "Brume1", key: "Brume1" }
    ];

    const tilesets = tilesetConfigs
      .map(({ name, key }) => {
        const ts = carteDuNiveau.addTilesetImage(name, key);
        if (!ts) {
          console.warn(`Tileset introuvable dans la map : ${name} (cl� charg�e : ${key})`);
        }
        return ts;
      })
      .filter(Boolean);

    console.log('Tilesets charg�s dans la map :', carteDuNiveau.tilesets.map(t => t.name));

    const map_sol_eau = carteDuNiveau.createLayer("map_sol_eau", tilesets);
    const map_contour_mur = carteDuNiveau.createLayer("map_contour_mur", tilesets);
    const map_deco = carteDuNiveau.createLayer("map_deco", tilesets);
    const map_item_ombre = carteDuNiveau.createLayer("map_item_ombre", tilesets);
    this.map_pont_1_6 = carteDuNiveau.createLayer("map_pont_1_6", tilesets);
    this.map_pont_1_2 = carteDuNiveau.createLayer("map_pont_1_2", tilesets);
    const map_pont_2_3 = carteDuNiveau.createLayer("map_pont_2_3", tilesets);
    this.map_pont_3_4 = carteDuNiveau.createLayer("map_pont_3_4", tilesets);
    this.map_pont_4_5 = carteDuNiveau.createLayer("map_pont_4_5", tilesets);
    const map_pont_5_6 = carteDuNiveau.createLayer("map_pont_5_6", tilesets);
    const map_pont_7_8 = carteDuNiveau.createLayer("map_pont_7_8", tilesets);
    const map_pont_8_9 = carteDuNiveau.createLayer("map_pont_8_9", tilesets);
    const ajustement_pont_3_4 = carteDuNiveau.createLayer("ajustement_pont_3_4", tilesets);
    const map_pont_6_7 = carteDuNiveau.createLayer("map_pont_6_7", tilesets);
    this.map_pontbis_1_2 = carteDuNiveau.createLayer("pontbis_1_2", tilesets);

    map_deco.setDepth(10003);
    this.map_pont_3_4.setDepth(10001);
    this.map_pontbis_1_2.setDepth(10005);

    this.map_pont_repare = this.map_pont_3_4;      // pont reconstruit
this.map_pont_casse = ajustement_pont_3_4;     // pont cassé

this.map_pont_casse.setDepth(10001);
this.map_pont_repare.setDepth(10002);

// État initial
this.map_pont_casse.setVisible(true);
this.map_pont_repare.setVisible(false);

// collisions initiales
this.map_pont_casse.setCollisionByProperty({ estSolide: true });
this.map_pont_repare.setCollisionByProperty({ estSolide: false });

    map_contour_mur.setCollisionByProperty({ estSolide: true });
    map_deco.setCollisionByProperty({ estSolide: true });
    this.map_pont_1_6.setCollisionByProperty({ estSolide: true });
    this.map_pont_1_2.setCollisionByProperty({ estSolide: true });
    this.map_pontbis_1_2.setCollisionByProperty({ estSolide: true });

    // Variables pour le dialogue (AVANT la création des PNJ!)
    this.dialogueActive = false;
    this.dialogueText = null;
    this.dialogueBubble = null;
    this.pnj1Sprite = null;
    this.pnj1DialogueZone = null;
    this.pnj1DialogueShown = false;
    this.pnj3Sprite = null;
    this.pnj3DialogueZone = null;
    this.pnj3DialogueShown = false;
    this.pnj3DialoguesBeforeCode = [
      "Mmmmhh (occupé a regarder au loin)"
    ];
    this.pnj3DialoguesAfterCode = [
      "Bonjour étranger... cela fait bien longtemps que je n'ai vu un visage nouveau en ces terres... Tu sembles perdu... Ce n'est pas étonnant... Beaucoup se retrouvent bloqués ici, sans comprendre comment avancer...... Vois-tu, le pont qui relie notre point d'arrivée aux terres des squelettes était autrefois ouvert mais le temps et l'oubli ont fait leur oeuvre...... Selon les anciennes légendes, ce passage était lié aux peintures de chats disséminées dans le monde... Un lien étrange, mais puissant. . . . . . . . . Ah! Oui, j'y pense... Si tu es bloqué dans les profondeurs, sache qu'il existait autrefois des téléporteurs pour traverser ces zones... Mais ils sont désormais inactifs... Peut-être qu'un crystal pourrait raviver leur pouvoir. "
    ];
    this.pnj3DialogueBeforeIndex = 0;
    this.pnj3DialogueAfterIndex = 0;
    this.pnj9Sprite = null;
    this.pnj9DialogueZone = null;
    this.pnj9DialogueShown = false;
    
    // Zone de dialogue � 2490, 1480
    this.specialDialogueZone = null;
    this.specialDialogueShown = false;
    this.specialDialoguesBeforeCode = [
      "Eh… attends une seconde. T'as entendu ça, hein ? Ouais… c'est normal. J'suis juste là… Hehe… ça me rappelle une vieille porte. Le genre où tu parles avec quelqu'un que tu vois pas, juste pour échanger des blagues pendant des heures… Dis… tu pourrais m'aider ? Y a un mécanisme dans le coin. Un truc planqué, comme toujours. J'ai essayé de comprendre comment ça marche… mais bon… j'ai peut-être raté un détail. Ou deux. Ça a sûrement un lien avec ces vieux puits. Quand tu l'auras trouvé, dépose le code sur le banc à droite. On verra si t'es du genre observateur… ou pas."
    ];
    this.specialDialoguesAfterCode = [
      "Merci l'ami. Je savais que t'y arriverais."
    ];
    this.specialDialogueBeforeIndex = 0;
    this.specialDialogueAfterIndex = 0;
    
    // Zone de code pour porte_3_4 (2641, 1520)
    this.codeZone_3_4 = null;
    this.codeZone_3_4_Shown = false;
    this.code_3_4_Input = '';
    this.code_3_4_KeyListener = null;
    this.code_3_4_Display = null;
    this.codeInputActive = false;  // Flag pour tracker si code input est actif
    this.codeZone_1_2 = null;
    this.codeZone_1_2_Shown = false;
    this.code_1_2_Input = '';
    this.code_1_2_KeyListener = null;
    this.code_1_2_Display = null;
    this.code_1_2_InputActive = false;
    this.code_1_2_Correct = '3';
    this.openedState = {
      porte_1_2: false,
      porte_2_3: false,
      porte_4_5: false,
      cleRecuperee: false,
      pontRepare: false,
      teleporteursActifs: false,
      codePonts12Valide: false
    };

    //Objets et PNJ:
    const PNJ_parcelle_1 = carteDuNiveau.getObjectLayer('PNJ_parcelle_1');
    const PNJ_parcelle_3 = carteDuNiveau.getObjectLayer('PNJ_parcelle_3');
    const PNJ_parcelle_9 = carteDuNiveau.getObjectLayer('PNJ_parcelle_9');
    const porte_1_2 = carteDuNiveau.getObjectLayer('porte_1_2');
    const porte_2_3 = carteDuNiveau.getObjectLayer('porte_2_3');
    const porte_3_4 = carteDuNiveau.getObjectLayer('porte_3_4');
    const porte_4_5 = carteDuNiveau.getObjectLayer('porte_4_5');

    this.pnjs = this.physics.add.staticGroup();

    // Cr�er PNJ 1
    if (PNJ_parcelle_1) {
      PNJ_parcelle_1.objects.forEach(obj => {
        if (obj.name === 'obj_pnj1') {
          this.pnj1Sprite = this.add.sprite(obj.x + obj.width/2, obj.y + obj.height/2, 'PNJ1');
          this.physics.add.existing(this.pnj1Sprite, true);
          this.pnjs.add(this.pnj1Sprite);
          
          // Zone de dialogue autour du PNJ 1
          this.pnj1DialogueZone = this.add.zone(obj.x + obj.width/2, obj.y + obj.height/2, 150, 150);
          this.physics.add.existing(this.pnj1DialogueZone);
          this.pnj1DialogueZone.body.setAllowGravity(false);
          this.pnj1DialogueZone.body.moves = false;
          
          console.log('PNJ 1 cr�� �', obj.x, obj.y);
        }
      });
    }

    // Cr�er PNJ 3
    if (PNJ_parcelle_3) {
      PNJ_parcelle_3.objects.forEach(obj => {
        if (obj.name === 'obj_pnj3') {
          this.pnj3Sprite = this.add.sprite(obj.x + obj.width/2, obj.y + obj.height/2, 'PNJ3');
          this.physics.add.existing(this.pnj3Sprite, true);
          this.pnjs.add(this.pnj3Sprite);
          
          // Zone de dialogue autour du PNJ 3
          this.pnj3DialogueZone = this.add.zone(obj.x + obj.width/2, obj.y + obj.height/2, 150, 150);
          this.physics.add.existing(this.pnj3DialogueZone);
          this.pnj3DialogueZone.body.setAllowGravity(false);
          this.pnj3DialogueZone.body.moves = false;
          
          console.log('PNJ 3 cr�� �', obj.x, obj.y);
        }
      });
    }

    // Cr�er PNJ 9
    if (PNJ_parcelle_9) {
      PNJ_parcelle_9.objects.forEach(obj => {
        if (obj.name === 'obj_pnj9') {
          this.pnj9Sprite = this.add.sprite(obj.x + obj.width/2, obj.y + obj.height/2, 'PNJ9');
          this.physics.add.existing(this.pnj9Sprite, true);
          this.pnjs.add(this.pnj9Sprite);
          
          // Zone de dialogue autour du PNJ 9
          this.pnj9DialogueZone = this.add.zone(obj.x + obj.width/2, obj.y + obj.height/2, 80, 80);
          this.physics.add.existing(this.pnj9DialogueZone);
          this.pnj9DialogueZone.body.setAllowGravity(false);
          this.pnj9DialogueZone.body.moves = false;
          
          console.log('PNJ 9 cr�� �', obj.x, obj.y);
        }
      });
    }

    // Groupe pour les brumes avec collision
    this.brumes = this.physics.add.staticGroup();

    // Cr�er brume porte 1_2
    if (porte_1_2) {
      porte_1_2.objects.forEach(obj => {
        const brume = this.add.sprite(obj.x + obj.width/2, obj.y + obj.height/2, 'Brume1');
        brume.setScale(0.25);
        brume.setDepth(10004);
        this.physics.add.existing(brume, true); // Static body
        brume.body.setSize(obj.width, obj.height);
        this.brumes.add(brume);
        this.brume_porte_1_2 = brume; // Store reference for lever interaction
        console.log('Brume porte 1_2 cr��e �', obj.x, obj.y);
      });
    }

    // Cr�er brume porte 2_3
    if (porte_2_3) {
      porte_2_3.objects.forEach(obj => {
        const brume = this.add.sprite(obj.x + obj.width/2, obj.y + obj.height/2, 'Brume1');
        brume.setScale(0.25);
        brume.setDepth(10004);
        this.physics.add.existing(brume, true); // Static body
        brume.body.setSize(obj.width, obj.height);
        this.brumes.add(brume);
        this.brume_porte_2_3 = brume; // Store reference for lever interaction
        console.log('Brume porte 2_3 cr��e �', obj.x, obj.y);
      });
    }

    // Cr�er brume porte 3_4
    if (porte_3_4) {
      porte_3_4.objects.forEach(obj => {
        const brume = this.add.sprite(obj.x + obj.width/2, obj.y + obj.height/2, 'Brume1');
        brume.setScale(0.25);
        brume.setDepth(10004);
        this.physics.add.existing(brume, true); // Static body
        brume.body.setSize(obj.width, obj.height);
        this.brumes.add(brume);
        this.brume_porte_3_4 = brume; // Store reference for code input
        console.log('Brume porte 3_4 cr��e �', obj.x, obj.y);
      });
    }

    // Cr�er brume porte 4_5
    if (porte_4_5) {
      porte_4_5.objects.forEach(obj => {
        const brume = this.add.sprite(obj.x + obj.width/2, obj.y + obj.height/2, 'Brume1');
        brume.setScale(0.25);
        brume.setDepth(10004);
        this.physics.add.existing(brume, true); // Static body
        brume.body.setSize(obj.width, obj.height);
        this.brumes.add(brume);
        this.brume_porte_4_5 = brume; // Store reference for code input
        console.log('Brume porte 4_5 cr��e �', obj.x, obj.y);
      });
    }

    //Partie Joueur:
  this.player = this.physics.add.sprite(582, 500, "player");
    this.player.body.setSize(24, 24);//hitbox
    this.player.body.setOffset(10, 24);
    this.player.setDepth(10002);
    
    //Sauvegarde de la position d'apparition du joueur
    this.spawnX = this.player.x;
    this.spawnY = this.player.y;

    // ===== ZONE DE DIALOGUE (2490, 1480) =====
    this.specialDialogueZone = this.add.zone(2490, 1480, 200, 200);
    this.physics.add.existing(this.specialDialogueZone);
    this.specialDialogueZone.body.setAllowGravity(false);
    this.specialDialogueZone.body.moves = false;

    // ===== ZONE DE CODE POUR PORTE 3_4 (2641, 1520) =====
    this.codeZone_3_4 = this.add.zone(2641, 1520, 60, 60);
    this.physics.add.existing(this.codeZone_3_4);
    this.codeZone_3_4.body.setAllowGravity(false);
    this.codeZone_3_4.body.moves = false;

    // ===== MINI ZONE CODE PONTS 1_2 / 1_6 (778, 2448) =====
    this.codeZone_1_2 = this.add.zone(778, 2448, 12, 12);
    this.physics.add.existing(this.codeZone_1_2);
    this.codeZone_1_2.body.setAllowGravity(false);
    this.codeZone_1_2.body.moves = false;

    // Zone bouton cach� (parcelle 1)
this.bushButtonZone = this.add.zone(420, 350, 25, 25);
this.physics.add.existing(this.bushButtonZone);
this.bushButtonZone.body.setAllowGravity(false);
this.bushButtonZone.body.moves = false;

// flag interaction
this.canInteractBush = false;

// overlap joueur
this.physics.add.overlap(this.player, this.bushButtonZone, () => {
    this.canInteractBush = true;
});
    
// ===== BOUTON 2 INDEPENDANT =====
this.bushButtonZone2 = this.add.zone(1400, 740, 25, 25);
this.physics.add.existing(this.bushButtonZone2);
this.bushButtonZone2.body.setAllowGravity(false);
this.bushButtonZone2.body.moves = false;

this.canInteractBush2 = false;

// overlap joueur bouton 2
this.physics.add.overlap(this.player, this.bushButtonZone2, () => {
    this.canInteractBush2 = true;
}, null, this);

// ===== ZONE DIALOGUE CODE (pour porte 4_5) =====

// ===== CLEF INDEPENDANTE =====
this.keyZone = this.add.zone(1700, 350, 25, 25);
this.physics.add.existing(this.keyZone);
this.keyZone.body.setAllowGravity(false);
this.keyZone.body.moves = false;

this.keyItemSprite = this.add.image(1700, 350, 'pickaxe coupe');
this.keyItemSprite.setScale(0.1);
this.keyItemSprite.setDepth(5000);

this.canTakeKey = false;

this.hasKey = false;

// ===== ZONE PONT A REPARER =====
this.bridgeRepairZone = this.add.zone(2710, 1010, 50, 50);
this.physics.add.existing(this.bridgeRepairZone);
this.bridgeRepairZone.body.setAllowGravity(false);
this.bridgeRepairZone.body.moves = false;

this.canRepairBridge = false;
this.bridgeRepaired = false;

// ===== CHECKPOINT SPAWN =====
this.spawnCheckpointZone = this.add.zone(1635, 1560, 120, 120);
this.physics.add.existing(this.spawnCheckpointZone);
this.spawnCheckpointZone.body.setAllowGravity(false);
this.spawnCheckpointZone.body.moves = false;
this.spawnCheckpointActivated = false;

// ===== POTION DE TEMPS =====
this.potionZone = this.add.zone(400, 2872, 40, 40);
this.physics.add.existing(this.potionZone);
this.potionZone.body.setAllowGravity(false);
this.potionZone.body.moves = false;
this.potionCollected = false;

// Sprite visible de la potion
this.potionSprite = this.add.sprite(400, 2872, 'potion');
this.potionSprite.setScale(0.05);
this.potionSprite.setDepth(10000);

// ===== CRYSTAL =====
this.crystalZone = this.add.zone(382, 776, 40, 40);
this.physics.add.existing(this.crystalZone);
this.crystalZone.body.setAllowGravity(false);
this.crystalZone.body.moves = false;

// Sprite visible du crystal
this.crystalSprite = this.add.sprite(382, 776, 'Crystal');
this.crystalSprite.setScale(0.08);
this.crystalSprite.setDepth(10000);

this.canActivateTeleporters = false;
this.teleportersEnabled = false;

// ===== TELEPORTEURS =====
this.teleporterAZone = this.add.zone(1068, 2540, 40, 40);
this.physics.add.existing(this.teleporterAZone);
this.teleporterAZone.body.setAllowGravity(false);
this.teleporterAZone.body.moves = false;

this.teleporterBZone = this.add.zone(1313, 2539, 40, 40);
this.physics.add.existing(this.teleporterBZone);
this.teleporterBZone.body.setAllowGravity(false);
this.teleporterBZone.body.moves = false;

this.teleportCooldownUntil = 0;

// ===== TELEPORTEURS TOUJOURS ACTIFS =====
this.teleporterCZone = this.add.zone(2043, 2600, 40, 40);
this.physics.add.existing(this.teleporterCZone);
this.teleporterCZone.body.setAllowGravity(false);
this.teleporterCZone.body.moves = false;

this.teleporterDZone = this.add.zone(2287, 2600, 40, 40);
this.physics.add.existing(this.teleporterDZone);
this.teleporterDZone.body.setAllowGravity(false);
this.teleporterDZone.body.moves = false;

this.teleportCDCooldownUntil = 0;

    this.cursors = this.input.keyboard.createCursorKeys();
    //Camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.0); //Zoom
    this.playerHealth = 3; // Sant� du joueur
    this.lastDirection = 'down'; // Direction par d�faut
    this.healthText = this.add.text(10, 60, '', { fontSize: '32px', fill: '#ff0000' });
    this.healthText.setScrollFactor(0);
    this.healthText.setScale(1 / this.cameras.main.zoom);
    this.healthText.setOrigin(0, 0);
    this.healthText.setDepth(100000);
    updateHealthDisplay(this);

    // Afficher la pickaxe en interface (au niveau du 4e coeur)
    this.pickaxeDisplay = this.add.sprite(145, 56, 'Pickaxe');
    this.pickaxeDisplay.setScrollFactor(0);
    this.pickaxeDisplay.setScale(0.2);
    this.pickaxeDisplay.setOrigin(0, 0);
    this.pickaxeDisplay.setDepth(100000);
    this.pickaxeDisplay.setVisible(false); // Cach�e jusqu'� r�cup�ration



    this.anims.create({
      key: "walk_down",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "walk_right",
      frames: this.anims.generateFrameNumbers("player", { start: 6, end: 8 }),
      frameRate: 8,
      repeat: -1
    }); 
   this.anims.create({
      key: "walk_left",
      frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "walk_up",
      frames: this.anims.generateFrameNumbers("player", { start: 9, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
    // Animations d'attaque directionnelles
    this.anims.create({
      key: "attack_down",
      frames: this.anims.generateFrameNumbers("EpDown"),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: "attack_up",
      frames: this.anims.generateFrameNumbers("EpUp"),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: "attack_left",
      frames: this.anims.generateFrameNumbers("EpLeft"),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: "attack_right",
      frames: this.anims.generateFrameNumbers("EpRight"),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: "attack",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
      frameRate: 15,
      repeat: 0
    });
    // Animations ennemis
    this.anims.create({
      key: "enemy_walk_down",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "enemy_walk_right",
      frames: this.anims.generateFrameNumbers("enemy", { start: 6, end: 8 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "enemy_walk_left",
      frames: this.anims.generateFrameNumbers("enemy", { start: 3, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "enemy_walk_up",
      frames: this.anims.generateFrameNumbers("enemy", { start: 9, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
  //Partie Combat:
    this.enemies = this.physics.add.group();
    // Sauvegarder les positions spawn des ennemis
    this.enemySpawnPositions = [
      { x: 500, y: 1400 },
      { x: 550, y: 1440 },
      { x: 540, y: 1700 },
      { x: 520, y: 1660 },
      { x: 580, y: 1660 },
      { x: 470, y: 1680 },
      { x: 610, y: 1690 },
      { x: 640, y: 1700 },
      { x: 450, y: 1670 },
      { x: 560, y: 1760 }
    ];

    // Ajouter les ennemis avec une hitbox verticale r�duite
    this.enemySpawnPositions.forEach((pos) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      this.configureEnemy(enemy);
    });

    // Collision entre joueur / ennemis et les murs
    this.physics.add.collider(this.player, map_contour_mur);
    this.physics.add.collider(this.player, map_deco);
    this.physics.add.collider(this.player, this.map_pont_1_6);
    this.physics.add.collider(this.player, this.map_pont_1_2);
    this.physics.add.collider(this.player, this.map_pontbis_1_2);

    this.physics.add.collider(this.player, this.map_pont_4_5);
    this.physics.add.collider(this.enemies, map_contour_mur);
    this.physics.add.collider(this.enemies, map_deco);
    this.physics.add.collider(this.enemies, this.map_pont_1_6);
    this.physics.add.collider(this.enemies, this.map_pont_1_2);
    this.physics.add.collider(this.enemies, this.map_pontbis_1_2);
this.physics.add.collider(this.player, this.map_pont_casse);
this.physics.add.collider(this.player, this.map_pont_repare);
this.physics.add.collider(this.enemies, this.map_pont_casse);
this.physics.add.collider(this.enemies, this.map_pont_repare);

    this.physics.add.collider(this.enemies, this.map_pont_4_5);

    // Collision entre joueur et PNJ (blocage physique)
    this.physics.add.collider(this.player, this.pnjs);

    // Collision entre joueur et brumes (blocage physique)
    this.physics.add.collider(this.player, this.brumes);

    // Collision entre joueur et ennemis
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      // Cooldown de d�g�ts (ne prendre des d�g�ts qu'une fois par seconde)
      if (this.time.now - this.lastDamageTime < 1000) {
        return;
      }
      this.lastDamageTime = this.time.now;
      
      this.sound.play('Damage', { volume: 0.6 });
      // Surbrillance rouge au joueur
      this.player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        this.player.clearTint();
      });
      this.playerHealth--;
      updateHealthDisplay(this);
      if (this.playerHealth <= 0) {
        this.showGameOverScreen();
      }
    }, null, this);
    // Touche pour attaquer
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // Touche pour interagir
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
     this.interactKeyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
     this.interactKeyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
     this.interactKeyY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
      this.interactKeyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    // Initialiser les sons
    this.birdAtDawnMusic = this.sound.add('BirdAtDawn', { loop: true, volume: 0.7 });
    this.ambiantSound = this.sound.add('AmbiantSound', { loop: true, volume: 0.3 });
    this.birdAtDawnMusic.play();
    this.ambiantSound.play();
    this.isWalking = false;
    this.lastDamageTime = 0;
    this.lastAttackTime = 0;
    
  //Partie Timer:
    this.timerText = this.add.text(15, 20, 'Time: 60', { fontSize: '32px', fill: '#fff' });
    this.timerText.setScrollFactor(0);
    this.timerText.setScale(1 / this.cameras.main.zoom);
    this.timerText.setOrigin(0, 0);
    this.timerText.setDepth(100000);
    this.timer = this.time.addEvent({
      delay: 50000,
      callback: () => {
        this.showGameOverScreen();
      },
      callbackScope: this
    });
    this.bushActivated = false;
// texte bouton 1
    this.interactionText = this.add.text(400, 550, '', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 },
    align: 'center'
}).setOrigin(0.5);

this.interactionText.setScrollFactor(0); // reste a l'écran
this.interactionText.setDepth(100004);
this.interactionText.setVisible(false);
  }
  

  showGameOverScreen() {
    if (this.isGameOver) {
      return;
    }

    // Mettre en pause le jeu
    this.hideDialogue();
    this.physics.pause();
    this.isGameOver = true;
    
    // Cr�er un fond semi-transparent
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    overlay.setScrollFactor(0);
    overlay.setDepth(100000);
    
    // Texte "Game Over"
    let gameOverText = this.add.text(400, 250, 'Vous êtes mort !', { fontSize: '64px', fill: '#ffffff', fontStyle: 'bold' });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setDepth(100001);
    gameOverText.setScale(1 / this.cameras.main.zoom);
    
    // Bouton "Continuer"
    let continueButton = this.add.text(400, 350, 'Continuer', { fontSize: '32px', fill: '#fff', backgroundColor: '#333', padding: { x: 20, y: 10 } });
    continueButton.setOrigin(0.5);
    continueButton.setScrollFactor(0);
    continueButton.setDepth(100001);
    continueButton.setScale(1 / this.cameras.main.zoom);
    continueButton.setInteractive();
    continueButton.on('pointerdown', () => {
      this.clearGameOverScreen();
      this.respawnPlayer();
    });
     // Bouton Menu
    let menuButton = this.add.text(400, 420, 'Menu', {
        fontSize: '28px',
        fill: '#fff',
        backgroundColor: '#333',
        padding: { x: 20, y: 10 }
    });
    menuButton.setOrigin(0.5);
    menuButton.setScrollFactor(0);
    menuButton.setDepth(100001);
    menuButton.setScale(1 / this.cameras.main.zoom);
    menuButton.setInteractive();

    this.gameOverUI = [overlay, gameOverText, continueButton, menuButton];

    menuButton.on('pointerdown', () => {
        this.clearGameOverScreen();
      this.isGameOver = false;
        this.scene.stop('Game');
        this.scene.start('Menu');
    });
  }

  clearGameOverScreen() {
    if (!this.gameOverUI) {
      return;
    }

    this.gameOverUI.forEach((element) => {
      if (element && element.active) {
        element.destroy();
      }
    });

    this.gameOverUI = null;
  }

  clearVictoryScreen() {
    if (!this.victoryUI) {
      return;
    }

    this.victoryUI.forEach((element) => {
      if (element && element.active) {
        element.destroy();
      }
    });

    this.victoryUI = null;
  }

  applyEnemyHit(enemy, direction) {
    // D�cr�menter la santé
    enemy.health--;
    
    // Knockback
    let knockbackForce = 300;
    if (direction === 'down') {
      enemy.setVelocity(0, knockbackForce);
    } else if (direction === 'up') {
      enemy.setVelocity(0, -knockbackForce);
    } else if (direction === 'right') {
      enemy.setVelocity(knockbackForce, 0);
    } else if (direction === 'left') {
      enemy.setVelocity(-knockbackForce, 0);
    }
    
    // Surbrillance rouge
    enemy.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      if (enemy.active) {
        enemy.clearTint();
      }
    });
    
    // D�truire si la sant� atteint 0
    if (enemy.health <= 0) {
      this.time.delayedCall(100, () => {
        enemy.destroy();
      });
    }
  }

  configureEnemy(enemy) {
    enemy.setOrigin(0.5, 1.2);
    enemy.health = 2;

    if (enemy.body) {
      const hitboxHeight = 40;
      enemy.body.setSize(enemy.body.width, hitboxHeight);
      enemy.body.setOffset(0, 64 - hitboxHeight);
    }
  }

  respawnPlayer() {
    this.clearGameOverScreen();
    this.playerHealth = 3;
    this.player.setPosition(this.spawnX, this.spawnY);
    this.lastDirection = 'down';
    this.player.setVelocity(0);
    this.player.anims.stop();
    updateHealthDisplay(this);
    this.lastDamageTime = 0;
    
    // Respawner les ennemis aux positions spawn
    this.enemies.clear(true, true);
    for (let i = 0; i < this.enemySpawnPositions.length; i++) {
      let pos = this.enemySpawnPositions[i];
      let enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      this.configureEnemy(enemy);
    }

    // R�appliquer l'�tat du monde pour garder les �l�ments d�j� ouverts
    this.restoreOpenedState();
    
    // Reprendre le jeu
    this.physics.resume();
    this.isGameOver = false;
    
    if (this.timer) {
      this.timer.remove();
    }
    this.timer = this.time.addEvent({
      delay: 50000,
      callback: () => {
        this.showGameOverScreen();
      },
      callbackScope: this
    });

    // R�initialiser la potion si elle a �t� collect�e
    if (this.potionCollected) {
      this.potionZone = this.add.zone(400, 2872, 40, 40);
      this.physics.add.existing(this.potionZone);
      this.potionZone.body.setAllowGravity(false);
      this.potionZone.body.moves = false;
      this.potionCollected = false;
      this.potionSprite = this.add.sprite(400, 2872, 'potion');
      this.potionSprite.setScale(0.05);
      this.potionSprite.setDepth(10000);
    }

  }

  restoreOpenedState() {
    if (!this.openedState) return;

    if (this.openedState.porte_1_2) {
      if (this.map_pont_1_2) {
        this.map_pont_1_2.setVisible(false);
        this.map_pont_1_2.setCollisionByProperty({ estSolide: true }, false);
      }
      if (this.brume_porte_1_2) {
        this.brume_porte_1_2.setVisible(false);
        if (this.brume_porte_1_2.body) {
          this.brume_porte_1_2.body.enable = false;
        }
      }
      if (this.bushButtonZone) {
        this.bushButtonZone.destroy();
        this.bushButtonZone = null;
      }
    }

    if (this.openedState.porte_2_3) {
      if (this.map_pont_2_3) {
        this.map_pont_2_3.setVisible(false);
        this.map_pont_2_3.setCollisionByProperty({ estSolide: true }, false);
      }
      if (this.brume_porte_2_3) {
        this.brume_porte_2_3.setVisible(false);
        if (this.brume_porte_2_3.body) {
          this.brume_porte_2_3.body.enable = false;
        }
      }
      if (this.bushButtonZone2) {
        this.bushButtonZone2.destroy();
        this.bushButtonZone2 = null;
      }
    }

    if (this.openedState.porte_4_5) {
      if (this.map_pont_4_5) {
        this.map_pont_4_5.setVisible(false);
        this.map_pont_4_5.setCollisionByProperty({ estSolide: true }, false);
      }
      if (this.brume_porte_4_5) {
        this.brume_porte_4_5.setVisible(false);
        if (this.brume_porte_4_5.body) {
          this.brume_porte_4_5.body.enable = false;
        }
      }
    }

    if (this.openedState.cleRecuperee) {
      this.hasKey = true;
      if (this.keyZone) {
        this.keyZone.destroy();
        this.keyZone = null;
      }
      if (this.keyItemSprite) {
        this.keyItemSprite.destroy();
        this.keyItemSprite = null;
      }
    }

    if (this.openedState.pontRepare) {
      this.bridgeRepaired = true;
      if (this.map_pont_repare) {
        this.map_pont_repare.setVisible(true);
        this.map_pont_repare.setCollisionByProperty({ estSolide: false });
      }
      if (this.map_pont_casse) {
        this.map_pont_casse.setVisible(false);
        this.map_pont_casse.setCollisionByProperty({ estSolide: true }, false);
      }
    }

    if (this.openedState.teleporteursActifs) {
      this.teleportersEnabled = true;
    }

    if (this.openedState.codePonts12Valide) {
      if (this.map_pontbis_1_2) {
        this.map_pontbis_1_2.setVisible(false);
        this.map_pontbis_1_2.setCollisionByProperty({ estSolide: true }, false);
      }
      if (this.map_pont_1_2) {
        this.map_pont_1_2.setVisible(false);
        this.map_pont_1_2.setCollisionByProperty({ estSolide: true }, false);
      }
      if (this.map_pont_1_6) {
        this.map_pont_1_6.setVisible(false);
        this.map_pont_1_6.setCollisionByProperty({ estSolide: true }, false);
      }
    }
  }

  update() {
    this.timerText.setText('Timer: ' + Math.ceil(this.timer.getRemainingSeconds()));

    const timeLeft = Math.ceil(this.timer.getRemainingSeconds());

if (timeLeft <= 10) {
    if (timeLeft % 2 === 0) {
        this.timerText.setColor('#ff0000'); // rouge
    } else {
        this.timerText.setColor('#ffffff'); // blanc
    }
} else {
    this.timerText.setColor('#ffffff'); // normal avant les 10 derni�res secondes
}

    // Checkpoint: met � jour le spawn quand le joueur entre dans la zone
    if (this.spawnCheckpointZone && !this.spawnCheckpointActivated && this.physics.overlap(this.player, this.spawnCheckpointZone)) {
      this.spawnX = 1632;
      this.spawnY = 1550;
      this.spawnCheckpointActivated = true;
      console.log('Checkpoint activ�: nouveau spawn � (1635, 1562)');

      const checkpointText = this.add.text(400, 80, 'Nouveau Spawn', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 6 }
      }).setOrigin(0.5);
      checkpointText.setScrollFactor(0);
      checkpointText.setDepth(100002);
      this.time.delayedCall(1200, () => {
        if (checkpointText && checkpointText.active) {
          checkpointText.destroy();
        }
      });

      // Zone � usage unique
      this.spawnCheckpointZone.body.enable = false;
      this.spawnCheckpointZone.destroy();
      this.spawnCheckpointZone = null;
    }

    // V�rifier l'interaction avec PNJ 1 (dialogue automatique)
    if (this.pnj1DialogueZone) {
      let isOverlapping = this.physics.overlap(this.player, this.pnj1DialogueZone);
      if (isOverlapping) {
        if (!this.pnj1DialogueShown && !this.dialogueActive) {
          console.log('Dialogue PNJ 1 d�clench�!');
          this.pnj1DialogueShown = true;
          this.showDialogue("Bienvenue aventurier ! J'espère que ton voyage dans Loop Quest se passe bien. J'ai remarqué que certains buissons cachent peut-être quelque chose. Si tu fouilles un peu, tu pourrais trouver de quoi t'aider à avancer ou traverser des zones bloquées. Ouvre bien l'oeil !", 3000, 40, {
            voiceKey: 'toriel talking',
            voiceVolume: 0.5
          });
        }
      } else {
        this.pnj1DialogueShown = false;
      }
    }

    // V�rifier l'interaction avec PNJ 3 (dialogue automatique)
    if (this.pnj3DialogueZone) {
      let isOverlapping = this.physics.overlap(this.player, this.pnj3DialogueZone);
      if (isOverlapping) {
        if (!this.pnj3DialogueShown && !this.dialogueActive) {
          console.log('Dialogue PNJ 3 d�clench�!');
          this.pnj3DialogueShown = true;
          const pnj3Dialogue = this.getNextPnj3Dialogue();
          const isAfterCode4 = this.openedState && this.openedState.porte_4_5;
          if (pnj3Dialogue) {
            if (isAfterCode4) {
              this.showDialogue(pnj3Dialogue, 3000, 90, {
                bubbleWidth: 700,
                bubbleHeight: 160,
                bubbleY: 450,
                voiceKey: 'asgore talking',
                voiceVolume: 0.9
              });
            } else {
              this.showDialogue(pnj3Dialogue, 3000, 90, {
                voiceKey: 'asgore talking',
                voiceVolume: 0.9
              });
            }
          }
        }
      } else {
        this.pnj3DialogueShown = false;
      }
    }

    // V�rifier l'interaction avec PNJ 9 (dialogue automatique)
    if (this.pnj9DialogueZone) {
      let isOverlapping = this.physics.overlap(this.player, this.pnj9DialogueZone);
      if (isOverlapping) {
        if (!this.pnj9DialogueShown && !this.dialogueActive) {
          console.log('Dialogue PNJ 9 d�clench�!');
          this.pnj9DialogueShown = true;
          this.showDialogue("Eh ! salut, étranger. J'vois que t'as un petit problème... Ce genre de truc qui te colle à la peau et qui te laisse pas respirer... Un timer, hein ? Pas vraiment le genre de malédiction qu'on oublie facilement. T'inquiète... T'es pas le premier à te retrouver coincé avec ça. Et bon... j'peux peut-être te filer un coup de main. Après tout... Ce serait dommage que ton aventure s'arrête pile à l'heure, non ?", 3000, 40, { bubbleWidth: 660, bubbleHeight: 150, bubbleY: 515, voiceKey: 'sans talking1', voiceVolume: 0.6, onComplete: () => { this.triggerVictory(); } });
        }
      } else {
        this.pnj9DialogueShown = false;
      }
    }

    // V�rifier l'interaction avec la zone de dialogue (2490, 1480)
    if (this.specialDialogueZone) {
      let isOverlapping = this.physics.overlap(this.player, this.specialDialogueZone);
      if (isOverlapping) {
        if (!this.specialDialogueShown && !this.dialogueActive) {
          console.log('Dialogue sp�cial d�clench�!');
          this.specialDialogueShown = true;
          const specialDialogue = this.getNextSpecialDialogue();
          if (specialDialogue) {
            this.showDialogue(
              specialDialogue,
              3000,
              40,
              {
                bubbleHeight: 150,
                bubbleY: 515,
                voiceKey: 'sans talking1',
                voiceVolume: 0.6
              }
            );
          }
        }
      } else {
        this.specialDialogueShown = false;
      }
    }

    // V�rifier l'interaction avec la zone de code pour porte 3_4 (2641, 1520)
    if (this.codeZone_3_4) {
      let isOverlapping = this.physics.overlap(this.player, this.codeZone_3_4);
      if (isOverlapping) {
        if (!this.codeZone_3_4_Shown) {
          console.log('Merci beaucoup! Tiens tu peux passer normalement!');
          this.codeZone_3_4_Shown = true;
          this.startCodeInput_3_4();
        }
      } else {
        this.codeZone_3_4_Shown = false;
        this.code_3_4_Input = '';
        this.codeInputActive = false;
        
        // D�truire l'affichage du code quand on quitte la zone
        if (this.code_3_4_Display) {
          this.code_3_4_Display.destroy();
          this.code_3_4_Display = null;
        }
        
        // Arr�ter l'�couteur de clavier
        if (this.code_3_4_KeyListener) {
          this.input.keyboard.off('keydown', this.code_3_4_KeyListener);
          this.code_3_4_KeyListener = null;
        }
      }
    }

    // V�rifier l'interaction avec la mini zone de code ponts (778, 2448)
    if (this.codeZone_1_2) {
      let isOverlapping = this.physics.overlap(this.player, this.codeZone_1_2);
      if (isOverlapping) {
        if (!this.codeZone_1_2_Shown && !this.openedState.codePonts12Valide) {
          this.codeZone_1_2_Shown = true;
          this.startCodeInput_1_2();
        }
      } else {
        this.codeZone_1_2_Shown = false;
        this.code_1_2_Input = '';
        this.code_1_2_InputActive = false;

        if (this.code_1_2_Display) {
          this.code_1_2_Display.destroy();
          this.code_1_2_Display = null;
        }

        if (this.code_1_2_KeyListener) {
          this.input.keyboard.off('keydown', this.code_1_2_KeyListener);
          this.code_1_2_KeyListener = null;
        }
      }
    }

    // V�rifier si on est dans aucune zone de dialogue - si oui, d�truire le dialogue
    let inAnyDialogueZone = 
      this.physics.overlap(this.player, this.pnj1DialogueZone) ||
      this.physics.overlap(this.player, this.pnj3DialogueZone) ||
      this.physics.overlap(this.player, this.pnj9DialogueZone) ||
      this.physics.overlap(this.player, this.specialDialogueZone);
    
    if (!inAnyDialogueZone && this.dialogueBubble) {
      // On a quitt� toutes les zones, d�truire le dialogue
      this.hideDialogue();
    }

  
    // Attaque avec espace (avec cooldown)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.time.now - this.lastAttackTime > 300) {
      this.lastAttackTime = this.time.now;
      // Animation d'effet d'�p�e
      let effect;
      if (this.lastDirection === 'down') {
        effect = this.add.sprite(this.player.x, this.player.y + 38, 'EpDown');
        effect.setOrigin(0.5, 0.5);
        effect.setDepth(10);
        effect.setScale(0.15);
        effect.play('attack_down');
      } else if (this.lastDirection === 'up') {
        effect = this.add.sprite(this.player.x, this.player.y - 38, 'EpUp');
        effect.setOrigin(0.5, 0.5);
        effect.setDepth(10);
        effect.setScale(0.15);
        effect.play('attack_up');
      } else if (this.lastDirection === 'left') {
        effect = this.add.sprite(this.player.x - 38, this.player.y, 'EpLeft');
        effect.setOrigin(0.5, 0.5);
        effect.setDepth(10);
        effect.setScale(0.15);
        effect.play('attack_left');
      } else if (this.lastDirection === 'right') {
        effect = this.add.sprite(this.player.x + 38, this.player.y, 'EpRight');
        effect.setOrigin(0.5, 0.5);
        effect.setDepth(10);
        effect.setScale(0.15);
        effect.play('attack_right');
      }
      if (effect) {
        effect.on('animationcomplete', () => effect.destroy());
      }
      this.player.play("attack");
      this.sound.play('attackSound', { volume: 0.6 });
      
      let attackRange = 100;
      let attackWidth = 50;
      this.enemies.children.each(enemy => {
        let dx = enemy.x - this.player.x;
        let dy = enemy.y - this.player.y;
        if (this.lastDirection === 'down' && dy > 0 && dy < attackRange && Math.abs(dx) < attackWidth) {
          this.sound.play('Slicing', { volume: 0.6 });
          this.applyEnemyHit(enemy, this.lastDirection);
        } else if (this.lastDirection === 'up' && dy < 0 && dy > -attackRange && Math.abs(dx) < attackWidth) {
          this.sound.play('Slicing', { volume: 0.6 });
          this.applyEnemyHit(enemy, this.lastDirection);
        } else if (this.lastDirection === 'right' && dx > 0 && dx < attackRange && Math.abs(dy) < attackWidth) {
          this.sound.play('Slicing', { volume: 0.6 });
          this.applyEnemyHit(enemy, this.lastDirection);
        } else if (this.lastDirection === 'left' && dx < 0 && dx > -attackRange && Math.abs(dy) < attackWidth) {
          this.sound.play('Slicing', { volume: 0.6 });
          this.applyEnemyHit(enemy, this.lastDirection);
        }
      });
    }
    this.player.setVelocity(0);
    if (this.victoryTriggered) return;
    // Mouvements du joueur
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown) {
      vx = -200;
      this.lastDirection = 'left';
    }
    if (this.cursors.right.isDown) {
      vx = 200;
      this.lastDirection = 'right';
    }
    if (this.cursors.up.isDown) {
      vy = -200;
      this.lastDirection = 'up';
    }
    if (this.cursors.down.isDown) {
      vy = 200;
      this.lastDirection = 'down';
    }
// ===== INTERACTIONS : bouton 1 + bouton 2 + clef =====

// reset des �tats
this.canInteractBush = false;
this.canInteractBush2 = false;
this.canTakeKey = false;
this.canRepairBridge = false;
this.canActivateTeleporters = false;

// d�tection des zones
if (this.bushButtonZone && this.physics.overlap(this.player, this.bushButtonZone)) {
    this.canInteractBush = true;
}

if (this.bushButtonZone2 && this.physics.overlap(this.player, this.bushButtonZone2)) {
    this.canInteractBush2 = true;
}

if (this.keyZone && this.physics.overlap(this.player, this.keyZone)) {
    this.canTakeKey = true;
}
if (this.bridgeRepairZone && this.physics.overlap(this.player, this.bridgeRepairZone)) {
    this.canRepairBridge = true;
}

if (this.openedState.codePonts12Valide && this.crystalZone && this.physics.overlap(this.player, this.crystalZone)) {
    this.canActivateTeleporters = true;
}

// ===== TELEPORTEURS =====
if (this.teleportersEnabled && this.time.now >= this.teleportCooldownUntil) {
  if (this.teleporterAZone && this.physics.overlap(this.player, this.teleporterAZone)) {
    this.player.setPosition(1313, 2539);
    this.player.setVelocity(0, 0);
    vx = 0;
    vy = 0;
    this.sound.play('teleporteur', { volume: 0.8 });
    this.teleportCooldownUntil = this.time.now + 4000;
  }
  else if (this.teleporterBZone && this.physics.overlap(this.player, this.teleporterBZone)) {
    this.player.setPosition(1068, 2540);
    this.player.setVelocity(0, 0);
    vx = 0;
    vy = 0;
    this.sound.play('teleporteur', { volume: 0.8 });
    this.teleportCooldownUntil = this.time.now + 4000;
  }
}

// ===== TELEPORTEURS TOUJOURS ACTIFS (C <-> D) =====
if (this.time.now >= this.teleportCDCooldownUntil) {
  if (this.teleporterCZone && this.physics.overlap(this.player, this.teleporterCZone)) {
    this.player.setPosition(2287, 2600);
    this.player.setVelocity(0, 0);
    vx = 0;
    vy = 0;
    this.sound.play('teleporteur', { volume: 0.8 });
    this.teleportCDCooldownUntil = this.time.now + 4000;
  }
  else if (this.teleporterDZone && this.physics.overlap(this.player, this.teleporterDZone)) {
    this.player.setPosition(2043, 2600);
    this.player.setVelocity(0, 0);
    vx = 0;
    vy = 0;
    this.sound.play('teleporteur', { volume: 0.8 });
    this.teleportCDCooldownUntil = this.time.now + 4000;
  }
}

// ===== POTION DE TEMPS =====
if (this.potionZone && !this.potionCollected && this.physics.overlap(this.player, this.potionZone)) {
    console.log('Potion collect�e! +80 secondes');
    this.potionCollected = true;
    
    // Ajouter 80 secondes au timer
    if (this.timer) {
        this.timer.delay += 80000;
    }
    
    // D�truire la zone et le sprite de la potion
    this.potionZone.body.enable = false;
    this.potionZone.destroy();
    this.potionZone = null;
    if (this.potionSprite) {
        this.potionSprite.destroy();
        this.potionSprite = null;
    }
}

if (this.openedState.codePonts12Valide && !this.teleportersEnabled && this.canActivateTeleporters && Phaser.Input.Keyboard.JustDown(this.interactKeyH)) {
    this.teleportersEnabled = true;
    this.openedState.teleporteursActifs = true;
  this.sound.play('CrystalSound', { volume: 0.7 });
    console.log('T�l�porteurs activ�s');
}

// affichage UNIQUE du texte
if (this.canInteractBush) {
    this.interactionText.setText("C'est un interrrupteur" +"\n"+ "Appuyer sur E");
    this.interactionText.setVisible(true);
}
else if (this.canInteractBush2) {
    this.interactionText.setText("C'est un interrrupteur" +"\n"+ "Appuyer sur R");
    this.interactionText.setVisible(true);
}
else if (this.canTakeKey) {
    this.interactionText.setText("On dirait qu'il y a quelque chose ici..." + "\n" + "Appuyer sur T");
    this.interactionText.setVisible(true);
}
else if (this.canRepairBridge && !this.hasKey) {
    this.interactionText.setText("Besoin d'une pioche pour réparer le pont");
    this.interactionText.setVisible(true);
}
else if (this.canRepairBridge && this.hasKey && !this.bridgeRepaired) {
    this.interactionText.setText("Réparer le pont en appuyant sur Y");
    this.interactionText.setVisible(true);
}
else if (this.canActivateTeleporters && !this.teleportersEnabled) {
  this.interactionText.setText("C'est un Crystal"+"\n"+ "Appuyer sur H");
  this.interactionText.setVisible(true);
}
else {
    this.interactionText.setVisible(false);
}
// interaction bouton 1
if (this.bushButtonZone && Phaser.Input.Keyboard.JustDown(this.interactKey) && this.canInteractBush) {

    console.log("bouton 1 activ�");
    // Faire dispara�tre la porte 1_2
    if (this.map_pont_1_2) {
        this.map_pont_1_2.setVisible(false);
      this.map_pont_1_2.setCollisionByProperty({ estSolide: true }, false);
    }

    // Faire dispara�tre la brume de la porte 1_2
    if (this.brume_porte_1_2) {
        this.brume_porte_1_2.setVisible(false);
        this.brume_porte_1_2.body.enable = false;
    }

    this.sound.play('WindSound', { volume: 0.8 });
    this.cameras.main.shake(200, 0.004);

    this.openedState.porte_1_2 = true;

    this.bushButtonZone.body.enable = false;
    this.bushButtonZone.destroy();
    this.bushButtonZone = null;
}

// interaction bouton 2
if (this.bushButtonZone2 && Phaser.Input.Keyboard.JustDown(this.interactKeyR) && this.canInteractBush2) {

    console.log("bouton 2 activ�");

    // Faire dispara�tre la porte 2_3
    if (this.map_pont_2_3) {
        this.map_pont_2_3.setVisible(false);
      this.map_pont_2_3.setCollisionByProperty({ estSolide: true }, false);
    }

    // Faire dispara�tre la brume de la porte 2_3
    if (this.brume_porte_2_3) {
        this.brume_porte_2_3.setVisible(false);
        this.brume_porte_2_3.body.enable = false;
    }

    this.sound.play('WindSound', { volume: 0.8 });
    this.cameras.main.shake(200, 0.004);

    this.openedState.porte_2_3 = true;

    this.bushButtonZone2.body.enable = false;
    this.bushButtonZone2.destroy();
    this.bushButtonZone2 = null;
}

// interaction clef
if (this.keyZone && Phaser.Input.Keyboard.JustDown(this.interactKeyT) && this.canTakeKey) {

    console.log("cl� r�cup�r�e");

    this.hasKey = true;
    this.openedState.cleRecuperee = true;
    
    // Afficher la pickaxe en interface
    if (this.pickaxeDisplay) {
        this.pickaxeDisplay.setVisible(true);
    }
    
    this.sound.play('item recupere', { volume: 1.7});

    if (this.keyItemSprite) {
        this.keyItemSprite.destroy();
        this.keyItemSprite = null;
    }

    this.keyZone.body.enable = false;
    this.keyZone.destroy();
    this.keyZone = null;
}

// interaction pont a reparer
if (
    this.bridgeRepairZone &&
    Phaser.Input.Keyboard.JustDown(this.interactKeyY) &&
    this.canRepairBridge &&
    this.hasKey &&
    !this.bridgeRepaired
) {
    console.log("pont r�par�");

    this.bridgeRepaired = true;
  this.openedState.pontRepare = true;

if (this.map_pont_repare) {
    this.map_pont_repare.setVisible(true);
    this.map_pont_repare.setCollisionByProperty({ estSolide: false });
}

if (this.map_pont_casse) {
    this.map_pont_casse.setVisible(false);
    this.map_pont_casse.setCollisionByProperty({ estSolide: true }, false);
}

    // Supprimer la pickaxe de l'interface
    if (this.pickaxeDisplay) {
        this.pickaxeDisplay.destroy();
        this.pickaxeDisplay = null;
    }

    this.sound.play('landslide', { volume: 0.5 });
    this.cameras.main.shake(200, 0.004);
}
    // Normaliser la v�locit� pour �viter d'aller plus vite en diagonale
    if (vx !== 0 && vy !== 0) {
      vx /= Math.sqrt(2);
      vy /= Math.sqrt(2);
    }
    
    this.player.setVelocity(vx, vy);
    // Animation selon direction principale
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) > Math.abs(vy)) {
        if (vx > 0) this.player.play("walk_right", true);
        else this.player.play("walk_left", true);
      } else {
        if (vy > 0) this.player.play("walk_down", true);
        else this.player.play("walk_up", true);
      }
      // Jouer le son de marche en boucle
      if (!this.isWalking) {
        this.sound.play('WalkingSound', { loop: true, volume: 0.25 });
        this.isWalking = true;
      }
    } else {
      // Arr�ter le son de marche
      if (this.isWalking) {
        this.sound.stopByKey('WalkingSound');
        this.isWalking = false;
      }
      this.player.anims.stop();
      if (this.lastDirection === 'down') this.player.setFrame(1);
      else if (this.lastDirection === 'right') this.player.setFrame(7);
      else if (this.lastDirection === 'left') this.player.setFrame(4);
      else if (this.lastDirection === 'up') this.player.setFrame(10);
    }
      // Mouvement des ennemis
      this.enemies.children.each(enemy => {
          let dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
          if (dist < 200) {
              // Poursuivre le joueur
              let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
              enemy.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
          } else {
              // Balade al�atoire
              if (Math.random() < 0.005) { // 0.5% chance par frame
                  enemy.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(-30, 30));
              }
          }        // Animation selon direction
          let vx = enemy.body.velocity.x;
          let vy = enemy.body.velocity.y;
          if (Math.abs(vx) > 5 || Math.abs(vy) > 5) {
              if (Math.abs(vx) > Math.abs(vy)) {
                  if (vx > 0) enemy.play("enemy_walk_right", true);
                  else enemy.play("enemy_walk_left", true);
              } else {
                  if (vy > 0) enemy.play("enemy_walk_down", true);
                  else enemy.play("enemy_walk_up", true);
              }
          } else {
              enemy.anims.stop();
              enemy.setFrame(1); // idle
          }    });
  }

  getNextPnj3Dialogue() {
    const afterCode4 = this.openedState && this.openedState.porte_4_5;
    const dialogues = afterCode4 ? this.pnj3DialoguesAfterCode : this.pnj3DialoguesBeforeCode;

    if (!dialogues || dialogues.length === 0) {
      return '';
    }

    if (afterCode4) {
      const index = Math.min(this.pnj3DialogueAfterIndex, dialogues.length - 1);
      const line = dialogues[index];
      if (this.pnj3DialogueAfterIndex < dialogues.length - 1) {
        this.pnj3DialogueAfterIndex++;
      }
      return line;
    }

    const index = Math.min(this.pnj3DialogueBeforeIndex, dialogues.length - 1);
    const line = dialogues[index];
    if (this.pnj3DialogueBeforeIndex < dialogues.length - 1) {
      this.pnj3DialogueBeforeIndex++;
    }
    return line;
  }

  getNextSpecialDialogue() {
    const afterCode4 = this.openedState && this.openedState.porte_4_5;
    const dialogues = afterCode4 ? this.specialDialoguesAfterCode : this.specialDialoguesBeforeCode;

    if (!dialogues || dialogues.length === 0) {
      return '';
    }

    if (afterCode4) {
      const index = Math.min(this.specialDialogueAfterIndex, dialogues.length - 1);
      const line = dialogues[index];
      if (this.specialDialogueAfterIndex < dialogues.length - 1) {
        this.specialDialogueAfterIndex++;
      }
      return line;
    }

    const index = Math.min(this.specialDialogueBeforeIndex, dialogues.length - 1);
    const line = dialogues[index];
    if (this.specialDialogueBeforeIndex < dialogues.length - 1) {
      this.specialDialogueBeforeIndex++;
    }
    return line;
  }

  // Afficher le dialogue typewriter
  showDialogue(text, duration = 3000, charSpeed, options = {}) {
    console.log('showDialogue appel� avec:', text);
    
    // Nettoyer les anciens dialogues avant d'en cr�er un nouveau
    this.hideDialogue();
    
    this.dialogueActive = true;
    
    // Cr�er le fond de la bulle de dialogue (rectangle)
    const bubbleX = options.bubbleX ?? 400;
    const bubbleY = options.bubbleY ?? 550;
    const bubbleWidth = options.bubbleWidth ?? 750;
    const bubbleHeight = options.bubbleHeight ?? 80;
    const dialogueFont = options.font ?? '16px Arial';
    const voiceKey = options.voiceKey ?? null;
    const voiceVolume = options.voiceVolume ?? 0.7;
    this.activeDialogueVoiceKey = voiceKey;
    
    this.dialogueBubble = this.add.rectangle(
      bubbleX, 
      bubbleY, 
      bubbleWidth, 
      bubbleHeight, 
      0x1a1a1a
    );
    this.dialogueBubble.setStrokeStyle(2, 0xffffff);
    this.dialogueBubble.setScrollFactor(0); // Rester sur la cam�ra
    this.dialogueBubble.setDepth(100001); // Au-dessus de tout
    
    // Cr�er l'objet texte pour la bulle
    this.dialogueText = this.add.text(
      bubbleX - bubbleWidth/2 + 20, 
      bubbleY - bubbleHeight/2 + 15, 
      '', 
      {
        font: dialogueFont,
        fill: '#ffffff',
        wordWrap: { width: bubbleWidth - 40 }
      }
    );
    this.dialogueText.setScrollFactor(0);
    this.dialogueText.setDepth(100002); // Au-dessus de la bulle
    
    // Animer le texte caract�re par caract�re (typewriter effect)
    let currentIndex = 0;
    let isDialogueActive = true;
    let voiceLetterCount = 0;
    
    const charCallback = () => {
      if (!isDialogueActive || !this.dialogueText || currentIndex >= text.length) {
        // Quand le texte est compl�tement affich�, garder le dialogue visible
        if (currentIndex >= text.length && isDialogueActive) {
          isDialogueActive = false;
          if (voiceKey) {
            this.sound.stopByKey(voiceKey);
            this.activeDialogueVoiceKey = null;
          }
          if (typeof options.onComplete === 'function') {
            this.time.delayedCall(800, options.onComplete, [], this);
          }
        }
        return;
      }

      // Effet vocal: rejouer le son � chaque nouvelle lettre affich�e.
      if (voiceKey) {
        const nextChar = text[currentIndex];
        if (/\p{L}|\p{N}/u.test(nextChar)) {
          voiceLetterCount++;
          if (voiceLetterCount % 2 === 0) {
            this.sound.stopByKey(voiceKey);
            this.sound.play(voiceKey, { volume: voiceVolume });
          }
        }
      }
      
      this.dialogueText.setText(text.substring(0, currentIndex + 1));
      currentIndex++;
      this.time.delayedCall(charSpeed, charCallback); // charSpeed ms par caract�re
    };
    charCallback();
  }

  hideDialogue() {
    if (this.dialogueBubble) {
      this.dialogueBubble.destroy();
      this.dialogueBubble = null;
    }

    if (this.dialogueText) {
      this.dialogueText.destroy();
      this.dialogueText = null;
    }

    if (this.activeDialogueVoiceKey) {
      this.sound.stopByKey(this.activeDialogueVoiceKey);
      this.activeDialogueVoiceKey = null;
    }

    this.dialogueActive = false;
  }


  triggerVictory() {
    if (this.victoryTriggered) return;
    this.victoryTriggered = true;
    if (this.timer) { this.timer.paused = true; }
    if (this.timerText) { this.timerText.setVisible(false); }
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    overlay.setScrollFactor(0);
    overlay.setDepth(200000);
    const title = this.add.text(400, 220, 'Tu es enfin libéré', { font: 'bold 36px Arial', fill: '#f5d76e', align: 'center' }).setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(200001);
    const msg = this.add.text(400, 310, "La malédiction est brisée.\nLe temps ne te pourchasse plus.\nTu peux enfin respirer.", { font: '22px Arial', fill: '#ffffff', align: 'center', lineSpacing: 10 }).setOrigin(0.5);
    msg.setScrollFactor(0);
    msg.setDepth(200001);
    const sub = this.add.text(400, 410, '\u2014 Fin \u2014', { font: 'italic 18px Arial', fill: '#aaaaaa', align: 'center' }).setOrigin(0.5);
    sub.setScrollFactor(0);
    sub.setDepth(200001);
    const menuButton = this.add.text(400, 485, 'Menu', {
      fontSize: '28px',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    menuButton.setScrollFactor(0);
    menuButton.setDepth(200001);
    menuButton.setInteractive();
    this.victoryUI = [overlay, title, msg, sub, menuButton];
    menuButton.on('pointerdown', () => {
      this.clearVictoryScreen();
      this.victoryTriggered = false;
      this.scene.stop('Game');
      this.scene.start('Menu');
    });
  }
  startCodeInput_1_2() {
    if (this.code_1_2_KeyListener) {
      this.input.keyboard.off('keydown', this.code_1_2_KeyListener);
      this.code_1_2_KeyListener = null;
    }
this.code_1_2_Display = this.add.text(
  400,
  550,
  'On dirait que ces pierres attendent\nque vous disiez quelque chose...',
  {
    font: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 },
    align: 'center'
  }
).setOrigin(0.5);
    this.code_1_2_Display.setScrollFactor(0);
    this.code_1_2_Display.setDepth(100001);

    this.code_1_2_InputActive = true;
    this.code_1_2_Input = '';

    this.code_1_2_KeyListener = (event) => {
      if (this.code_1_2_InputActive) {
        this.handleCodeInput_1_2(event);
      }
    };
    this.input.keyboard.on('keydown', this.code_1_2_KeyListener);
  }

  handleCodeInput_1_2(event) {
    if (event.repeat || !event.key) return;

    const key = event.key;

    if (key >= '0' && key <= '9' && this.code_1_2_Input.length < 1) {
      event.preventDefault();
      this.code_1_2_Input = key;
      this.updateCodeDisplay_1_2();
      this.validateCode_1_2();
    }

    if (key === 'Backspace' && this.code_1_2_Input.length > 0) {
      event.preventDefault();
      this.code_1_2_Input = '';
      this.updateCodeDisplay_1_2();
    }
  }

  updateCodeDisplay_1_2() {
    if (this.code_1_2_Display) {
      const display = 'Code (1 chiffre): ' + (this.code_1_2_Input || '_');
      this.code_1_2_Display.setText(display);
    }
  }

  validateCode_1_2() {
    if (this.code_1_2_KeyListener) {
      this.input.keyboard.off('keydown', this.code_1_2_KeyListener);
      this.code_1_2_KeyListener = null;
    }

    if (this.code_1_2_Input === this.code_1_2_Correct) {
      if (this.map_pontbis_1_2) {
        this.map_pontbis_1_2.setVisible(false);
        this.map_pontbis_1_2.setCollisionByProperty({ estSolide: true }, false);
      }

      if (this.map_pont_1_2) {
        this.map_pont_1_2.setVisible(false);
        this.map_pont_1_2.setCollisionByProperty({ estSolide: true }, false);
      }

      if (this.map_pont_1_6) {
        this.map_pont_1_6.setVisible(false);
        this.map_pont_1_6.setCollisionByProperty({ estSolide: true }, false);
      }

      this.openedState.codePonts12Valide = true;
      this.sound.play('landslide', { volume: 0.5 });
      this.cameras.main.shake(200, 0.004);
      this.showDialogue('Code correct: passage ouvert.', 1400, 25);
    } else {
      this.showDialogue('Code incorrect.', 1200, 25);
    }

    if (this.code_1_2_Display) {
      this.code_1_2_Display.destroy();
      this.code_1_2_Display = null;
    }

    this.code_1_2_Input = '';
    this.code_1_2_InputActive = false;
    this.codeZone_1_2_Shown = false;
  }

  startCodeInput_3_4() {
    // Si l'�couteur existe d�j�, le retirer
    if (this.code_3_4_KeyListener) {
      this.input.keyboard.off('keydown', this.code_3_4_KeyListener);
      this.code_3_4_KeyListener = null;
    }
    
    // Cr�er juste un texte minimaliste en bas � gauche
this.code_3_4_Display = this.add.text(
  400,
  550,
  'Code: ____',
  {
    font: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 },
    align: 'center'
  }
).setOrigin(0.5);
    this.code_3_4_Display.setScrollFactor(0);
    this.code_3_4_Display.setDepth(100001);
    
    // Activer le code input
    this.codeInputActive = true;
    this.code_3_4_Input = '';
    
    // Cr�er le nouvel �couteur du clavier
    this.code_3_4_KeyListener = (event) => {
      if (this.codeInputActive) {
        this.handleCodeInput_3_4(event);
      }
    };
    this.input.keyboard.on('keydown', this.code_3_4_KeyListener);
  }

  handleCodeInput_3_4(event) {
    // Ignorer les touches non valides et les r�p�titions
    if (event.repeat || !event.key) return;
    
    const key = event.key;
    
    // Seulement les chiffres 0-9
    if (key >= '0' && key <= '9' && this.code_3_4_Input.length < 4) {
      event.preventDefault();
      this.code_3_4_Input += key;
      this.updateCodeDisplay_3_4();

      // Valider automatiquement d�s que 4 chiffres sont saisis
      if (this.code_3_4_Input.length === 4) {
        this.validateCode_3_4();
      }
    }
    
    // Backspace pour supprimer
    if (key === 'Backspace' && this.code_3_4_Input.length > 0) {
      event.preventDefault();
      this.code_3_4_Input = this.code_3_4_Input.slice(0, -1);
      this.updateCodeDisplay_3_4();
    }
    
    // Enter pour valider
    if (key === 'Enter' && this.code_3_4_Input.length === 4) {
      event.preventDefault();
      this.validateCode_3_4();
    }
  }

  updateCodeDisplay_3_4() {
    if (this.code_3_4_Display) {
      const display = 'Code: ' + '*'.repeat(this.code_3_4_Input.length) + '_'.repeat(4 - this.code_3_4_Input.length);
      this.code_3_4_Display.setText(display);
    }
  }

  validateCode_3_4() {
    // Arr�ter l'�couteur de clavier
    if (this.code_3_4_KeyListener) {
      this.input.keyboard.off('keydown', this.code_3_4_KeyListener);
      this.code_3_4_KeyListener = null;
    }
    
    if (this.code_3_4_Input === '2143') {
      console.log('Code correct pour porte 3_4!');
      
      // D�truire l'affichage
      if (this.code_3_4_Display) {
        this.code_3_4_Display.destroy();
        this.code_3_4_Display = null;
      }
      
      // Message de succ�s
      this.showDialogue('Porte d�verrouill�e! Vous pouvez passer.', 2000, 30);
      
      // D�verrouiller la porte 4_5 - rendre invisible et d�sactiver les collisions
      if (this.map_pont_4_5) {
        this.map_pont_4_5.setVisible(false);
        this.map_pont_4_5.setCollisionByProperty({ estSolide: true }, false);
      }
      
      if (this.brume_porte_4_5) {
        this.brume_porte_4_5.setVisible(false);
        this.brume_porte_4_5.body.enable = false;
      }

      this.openedState.porte_4_5 = true;
      
      this.sound.play('WindSound', { volume: 0.8 });
      this.cameras.main.shake(200, 0.004);
      
      this.code_3_4_Input = '';
      this.codeZone_3_4_Shown = false;
      
    } else {
      console.log('Code incorrect pour porte 3_4!');
      
      // D�truire l'affichage en erreur
      if (this.code_3_4_Display) {
        this.code_3_4_Display.destroy();
        this.code_3_4_Display = null;
      }
      
      // Message d'erreur
      this.showDialogue('Code incorrect! Essayez encore.', 1500, 30);
      
      this.code_3_4_Input = '';
      this.codeZone_3_4_Shown = false;
    }
    this.dialogueActive = false;
  }

}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [Menu, Game]
};

new Phaser.Game(config);

function updateHealthDisplay(scene) {
  let hearts = '';
  for (let i = 0; i < scene.playerHealth; i++) {
    hearts += '❤️';
  }
  scene.healthText.setText(hearts);
}
