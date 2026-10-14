import { LevelDefinition } from '../types/game';

export const LEVELS: LevelDefinition[] = [
  // =========================================================================
  // SEVİYE 1: İLK ADIMLAR (10 Platform)
  // Temel kontrolleri ve zıplama ritmini öğreten uzun, akıcı bir başlangıç parkuru.
  // =========================================================================
  {
    id: 1,
    name: 'İlk Adımlar',
    difficulty: 'Çok Kolay',
    tip: 'Basılı tutarak güç topla. 10 platformu aş ve bayrağa ulaş!',
    previewLengthRatio: 1.0,
    targetParAttempts: 1,
    platforms: [
      { id: 'l1-p1', x: 40, y: 460, width: 85, height: 48, type: 'standard', isStart: true },
      { id: 'l1-p2', x: 200, y: 460, width: 80, height: 48, type: 'standard' },
      { id: 'l1-p3', x: 360, y: 460, width: 80, height: 48, type: 'standard' },
      { id: 'l1-p4', x: 520, y: 460, width: 85, height: 48, type: 'standard' },
      { id: 'l1-p5', x: 685, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l1-p6', x: 840, y: 460, width: 80, height: 48, type: 'standard' },
      { id: 'l1-p7', x: 1000, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l1-p8', x: 1160, y: 460, width: 80, height: 48, type: 'standard' },
      { id: 'l1-p9', x: 1320, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l1-p10', x: 1485, y: 460, width: 95, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 2: RİTİM VE MESAFE (10 Platform)
  // Kısa ve uzun zıplamaların bir arada olduğu, değişken şarj kontrolü.
  // =========================================================================
  {
    id: 2,
    name: 'Ritim ve Mesafe',
    difficulty: 'Kolay',
    tip: 'Geniş aralıklarda daha uzun basılı tut!',
    previewLengthRatio: 0.95,
    targetParAttempts: 2,
    platforms: [
      { id: 'l2-p1', x: 40, y: 460, width: 80, height: 48, type: 'standard', isStart: true },
      { id: 'l2-p2', x: 195, y: 460, width: 75, height: 48, type: 'standard' }, // gap ~100
      { id: 'l2-p3', x: 380, y: 460, width: 70, height: 48, type: 'standard' }, // gap ~135 (uzun)
      { id: 'l2-p4', x: 530, y: 460, width: 75, height: 48, type: 'standard' }, // gap ~95
      { id: 'l2-p5', x: 700, y: 460, width: 70, height: 48, type: 'standard' }, // gap ~120
      { id: 'l2-p6', x: 850, y: 460, width: 75, height: 48, type: 'standard' }, // gap ~100
      { id: 'l2-p7', x: 1030, y: 460, width: 70, height: 48, type: 'standard' }, // gap ~130
      { id: 'l2-p8', x: 1185, y: 460, width: 75, height: 48, type: 'standard' }, // gap ~95
      { id: 'l2-p9', x: 1360, y: 460, width: 70, height: 48, type: 'standard' }, // gap ~125
      { id: 'l2-p10', x: 1530, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 3: HASSAS İNİŞLER (11 Platform)
  // Dar pembe platformlar devreye giriyor. Milimetrik kontrol gerekli!
  // =========================================================================
  {
    id: 3,
    name: 'Hassas İnişler',
    difficulty: 'Kolay',
    tip: 'Pembe platformlar çok dar! Tam ortaya nişan al.',
    previewLengthRatio: 0.9,
    targetParAttempts: 3,
    platforms: [
      { id: 'l3-p1', x: 40, y: 460, width: 80, height: 48, type: 'standard', isStart: true },
      { id: 'l3-p2', x: 200, y: 460, width: 50, height: 48, type: 'narrow' },
      { id: 'l3-p3', x: 360, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l3-p4', x: 520, y: 460, width: 48, height: 48, type: 'narrow' },
      { id: 'l3-p5', x: 675, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l3-p6', x: 835, y: 460, width: 48, height: 48, type: 'narrow' },
      { id: 'l3-p7', x: 990, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l3-p8', x: 1150, y: 460, width: 46, height: 48, type: 'narrow' },
      { id: 'l3-p9', x: 1300, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l3-p10', x: 1460, y: 460, width: 48, height: 48, type: 'narrow' },
      { id: 'l3-p11', x: 1615, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 4: ZIPLATAN YAYLAR (11 Platform)
  // Trambolin/Yaylı zıplatıcı platformlar tanıtılıyor!
  // =========================================================================
  {
    id: 4,
    name: 'Zıplatan Yaylar',
    difficulty: 'Orta',
    tip: 'Sarı yaylı platformlar PIKO\'yu otomatik olarak havaya fırlatır!',
    previewLengthRatio: 0.85,
    targetParAttempts: 3,
    platforms: [
      { id: 'l4-p1', x: 40, y: 460, width: 80, height: 48, type: 'standard', isStart: true },
      { id: 'l4-p2', x: 195, y: 460, width: 65, height: 48, type: 'bounce', bounceForce: 530 },
      { id: 'l4-p3', x: 375, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l4-p4', x: 535, y: 460, width: 50, height: 48, type: 'narrow' },
      { id: 'l4-p5', x: 695, y: 460, width: 65, height: 48, type: 'bounce', bounceForce: 530 },
      { id: 'l4-p6', x: 880, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l4-p7', x: 1040, y: 460, width: 50, height: 48, type: 'narrow' },
      { id: 'l4-p8', x: 1200, y: 460, width: 65, height: 48, type: 'bounce', bounceForce: 530 },
      { id: 'l4-p9', x: 1385, y: 460, width: 75, height: 48, type: 'standard' },
      { id: 'l4-p10', x: 1545, y: 460, width: 50, height: 48, type: 'narrow' },
      { id: 'l4-p11', x: 1710, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 5: DİKENLİ YOLCULUK (12 Platform / Engel)
  // Platform aralarında elektrikli lazer ve dikenler! Üzerlerinden aşman gerekir.
  // =========================================================================
  {
    id: 5,
    name: 'Dikenli Yolculuk',
    difficulty: 'Orta',
    tip: 'Kırmızı lazer ve dikenlerin üzerinden zıpla! Dokunursan çarpılırsın.',
    previewLengthRatio: 0.8,
    targetParAttempts: 4,
    platforms: [
      { id: 'l5-p1', x: 40, y: 460, width: 80, height: 48, type: 'standard', isStart: true },
      // Engel 1
      { id: 'l5-hz1', x: 180, y: 465, width: 35, height: 25, type: 'hazard', hazardConfig: { type: 'laser', width: 35, height: 25 } },
      { id: 'l5-p2', x: 260, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l5-p3', x: 420, y: 460, width: 50, height: 48, type: 'narrow' },
      // Engel 2
      { id: 'l5-hz2', x: 535, y: 465, width: 40, height: 25, type: 'hazard', hazardConfig: { type: 'spikes', width: 40, height: 25 } },
      { id: 'l5-p4', x: 625, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l5-p5', x: 785, y: 460, width: 50, height: 48, type: 'narrow' },
      // Engel 3
      { id: 'l5-hz3', x: 895, y: 465, width: 40, height: 25, type: 'hazard', hazardConfig: { type: 'laser', width: 40, height: 25 } },
      { id: 'l5-p6', x: 985, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l5-p7', x: 1145, y: 460, width: 50, height: 48, type: 'narrow' },
      { id: 'l5-p8', x: 1300, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l5-p9', x: 1470, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 6: DANS EDEN ADALAR (12 Platform)
  // Hem yatay hareket eden hem de asansör gibi dikey inip çıkan platformlar!
  // =========================================================================
  {
    id: 6,
    name: 'Dans Eden Adalar',
    difficulty: 'Orta',
    tip: 'Mavi adalar yatay, açık mavi adalar dikey hareket eder. Zamanlamayı kolla!',
    previewLengthRatio: 0.75,
    targetParAttempts: 4,
    platforms: [
      { id: 'l6-p1', x: 40, y: 460, width: 75, height: 48, type: 'standard', isStart: true },
      // Yatay hareketli
      { id: 'l6-p2', x: 200, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 180, maxX: 250, speed: 45, direction: 1 } },
      { id: 'l6-p3', x: 380, y: 460, width: 70, height: 48, type: 'standard' },
      // Dikey hareketli asansör
      { id: 'l6-p4', x: 535, y: 460, width: 65, height: 48, type: 'vertical_moving', verticalMoveConfig: { minY: 430, maxY: 480, speed: 35, direction: 1 } },
      { id: 'l6-p5', x: 690, y: 460, width: 70, height: 48, type: 'standard' },
      // Yatay hareketli 2
      { id: 'l6-p6', x: 860, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 830, maxX: 900, speed: 48, direction: -1 } },
      { id: 'l6-p7', x: 1040, y: 460, width: 50, height: 48, type: 'narrow' },
      // Dikey hareketli 2
      { id: 'l6-p8', x: 1195, y: 460, width: 65, height: 48, type: 'vertical_moving', verticalMoveConfig: { minY: 425, maxY: 475, speed: 38, direction: -1 } },
      { id: 'l6-p9', x: 1355, y: 460, width: 70, height: 48, type: 'standard' },
      // Yatay hareketli 3
      { id: 'l6-p10', x: 1525, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 1500, maxX: 1570, speed: 50, direction: 1 } },
      { id: 'l6-p11', x: 1700, y: 460, width: 50, height: 48, type: 'narrow' },
      { id: 'l6-p12', x: 1860, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 7: HAYALET ADALAR (12 Platform)
  // Yanıp sönen, kaybolup beliren mor holografik hayalet platformlar!
  // =========================================================================
  {
    id: 7,
    name: 'Hayalet Adalar',
    difficulty: 'Zor',
    tip: 'Mor platformlar belirli aralıklarla yok olur! Görünürken üstüne bas.',
    previewLengthRatio: 0.7,
    targetParAttempts: 5,
    platforms: [
      { id: 'l7-p1', x: 40, y: 460, width: 75, height: 48, type: 'standard', isStart: true },
      // Hayalet platform 1
      { id: 'l7-p2', x: 195, y: 460, width: 65, height: 48, type: 'disappearing', disappearConfig: { visibleDuration: 1.4, invisibleDuration: 1.1, timer: 1.4, isVisible: true } },
      { id: 'l7-p3', x: 360, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l7-p4', x: 515, y: 460, width: 50, height: 48, type: 'narrow' },
      // Hayalet platform 2
      { id: 'l7-p5', x: 670, y: 460, width: 65, height: 48, type: 'disappearing', disappearConfig: { visibleDuration: 1.3, invisibleDuration: 1.0, timer: 1.3, isVisible: true } },
      { id: 'l7-p6', x: 835, y: 460, width: 70, height: 48, type: 'standard' },
      // Hareketli
      { id: 'l7-p7', x: 1000, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 980, maxX: 1040, speed: 45, direction: 1 } },
      // Hayalet platform 3
      { id: 'l7-p8', x: 1175, y: 460, width: 65, height: 48, type: 'disappearing', disappearConfig: { visibleDuration: 1.4, invisibleDuration: 1.1, timer: 1.4, isVisible: true } },
      { id: 'l7-p9', x: 1340, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l7-p10', x: 1500, y: 460, width: 48, height: 48, type: 'narrow' },
      // Hayalet platform 4
      { id: 'l7-p11', x: 1655, y: 460, width: 65, height: 48, type: 'disappearing', disappearConfig: { visibleDuration: 1.3, invisibleDuration: 1.0, timer: 1.3, isVisible: true } },
      { id: 'l7-p12', x: 1820, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 8: ÇÖKÜŞ VE TELAŞ (13 Platform)
  // Çatırdayan ve 1.5s içinde çöken platformlar, yaylar ve dar hedefler!
  // =========================================================================
  {
    id: 8,
    name: 'Çöküş ve Telaş',
    difficulty: 'Zor',
    tip: 'Turuncu zeminler indikten 1.5 sn sonra çöker! Durma, hemen zıpla!',
    previewLengthRatio: 0.65,
    targetParAttempts: 5,
    platforms: [
      { id: 'l8-p1', x: 40, y: 460, width: 75, height: 48, type: 'standard', isStart: true },
      // Çatırdayan 1
      { id: 'l8-p2', x: 195, y: 460, width: 70, height: 48, type: 'crumbling', crumbleDelay: 1.5 },
      { id: 'l8-p3', x: 360, y: 460, width: 70, height: 48, type: 'standard' },
      // Çatırdayan 2
      { id: 'l8-p4', x: 520, y: 460, width: 70, height: 48, type: 'crumbling', crumbleDelay: 1.5 },
      // Yaylı trambolin
      { id: 'l8-p5', x: 685, y: 460, width: 65, height: 48, type: 'bounce', bounceForce: 530 },
      { id: 'l8-p6', x: 870, y: 460, width: 70, height: 48, type: 'standard' },
      { id: 'l8-p7', x: 1030, y: 460, width: 48, height: 48, type: 'narrow' },
      // Çatırdayan 3
      { id: 'l8-p8', x: 1180, y: 460, width: 70, height: 48, type: 'crumbling', crumbleDelay: 1.5 },
      { id: 'l8-p9', x: 1345, y: 460, width: 70, height: 48, type: 'standard' },
      // Hareketli
      { id: 'l8-p10', x: 1515, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 1490, maxX: 1555, speed: 45, direction: 1 } },
      // Çatırdayan 4
      { id: 'l8-p11', x: 1685, y: 460, width: 70, height: 48, type: 'crumbling', crumbleDelay: 1.5 },
      { id: 'l8-p12', x: 1850, y: 460, width: 48, height: 48, type: 'narrow' },
      { id: 'l8-p13', x: 2005, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 9: RÜZGARLI VADİ (13 Platform / Engel + Rüzgar Akımları)
  // Havaya kaldıran rüzgar akımları + lazer bariyerleri + hareketli adalar!
  // =========================================================================
  {
    id: 9,
    name: 'Rüzgarlı Vadi',
    difficulty: 'Usta',
    tip: 'Mavi rüzgar akımları PIKO\'yu havada yükseltir! Rüzgarı arkana al.',
    previewLengthRatio: 0.55,
    targetParAttempts: 6,
    windZones: [
      { id: 'w1', x: 280, y: 340, width: 85, height: 160, forceY: -550 },
      { id: 'w2', x: 910, y: 340, width: 90, height: 160, forceY: -550 },
      { id: 'w3', x: 1570, y: 340, width: 90, height: 160, forceY: -550 },
    ],
    platforms: [
      { id: 'l9-p1', x: 40, y: 460, width: 75, height: 48, type: 'standard', isStart: true },
      { id: 'l9-p2', x: 195, y: 460, width: 50, height: 48, type: 'narrow' },
      // Rüzgar akımı w1 (280-365) sonrasına konan ada:
      { id: 'l9-p3', x: 395, y: 460, width: 70, height: 48, type: 'standard' },
      // Lazer engeli
      { id: 'l9-hz1', x: 505, y: 465, width: 35, height: 25, type: 'hazard', hazardConfig: { type: 'laser', width: 35, height: 25 } },
      { id: 'l9-p4', x: 580, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 560, maxX: 620, speed: 45, direction: 1 } },
      { id: 'l9-p5', x: 745, y: 460, width: 48, height: 48, type: 'narrow' },
      { id: 'l9-p6', x: 885, y: 460, width: 70, height: 48, type: 'standard' },
      // Rüzgar akımı w2 sonrasındaki ada:
      { id: 'l9-p7', x: 1045, y: 460, width: 65, height: 48, type: 'bounce', bounceForce: 530 },
      { id: 'l9-p8', x: 1230, y: 460, width: 70, height: 48, type: 'standard' },
      // Lazer engeli 2
      { id: 'l9-hz2', x: 1340, y: 465, width: 35, height: 25, type: 'hazard', hazardConfig: { type: 'laser', width: 35, height: 25 } },
      { id: 'l9-p9', x: 1415, y: 460, width: 50, height: 48, type: 'narrow' },
      // Rüzgar akımı w3 sonrasındaki ada:
      { id: 'l9-p10', x: 1690, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 1670, maxX: 1730, speed: 48, direction: -1 } },
      { id: 'l9-p11', x: 1860, y: 460, width: 90, height: 48, type: 'standard', isFinish: true },
    ],
  },

  // =========================================================================
  // SEVİYE 10: BÜYÜK ŞAMPİYONLUK GAUNTLETİ (14 Platform / Engel)
  // Büyük Şampiyonluk Finali! Trambolinler, çatırdayanlar, hareketliler,
  // lazerler, rüzgar akımları, dar hedefler ve altın bayrak!
  // =========================================================================
  {
    id: 10,
    name: 'Büyük Gauntlet',
    difficulty: 'Usta',
    tip: 'Büyük Şampiyonluk Parkuru! 14 engeli aş ve PIKO\'yu efsane yap!',
    previewLengthRatio: 0.45,
    targetParAttempts: 8,
    windZones: [
      { id: 'w10-1', x: 740, y: 340, width: 85, height: 160, forceY: -550 },
      { id: 'w10-2', x: 1640, y: 340, width: 85, height: 160, forceY: -550 },
    ],
    platforms: [
      { id: 'l10-p1', x: 40, y: 460, width: 75, height: 48, type: 'standard', isStart: true },
      // 1. Yatay hareketli
      { id: 'l10-p2', x: 195, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 175, maxX: 235, speed: 45, direction: 1 } },
      // 2. Dar
      { id: 'l10-p3', x: 365, y: 460, width: 48, height: 48, type: 'narrow' },
      // 3. Çatırdayan
      { id: 'l10-p4', x: 515, y: 460, width: 65, height: 48, type: 'crumbling', crumbleDelay: 1.5 },
      // 4. Lazer engeli
      { id: 'l10-hz1', x: 625, y: 465, width: 35, height: 25, type: 'hazard', hazardConfig: { type: 'laser', width: 35, height: 25 } },
      // 5. Trambolin yay (rüzgar tüneline fırlatır)
      { id: 'l10-p5', x: 695, y: 460, width: 65, height: 48, type: 'bounce', bounceForce: 530 },
      // 6. Rüzgar tüneli çıkışındaki ada
      { id: 'l10-p6', x: 890, y: 460, width: 70, height: 48, type: 'standard' },
      // 7. Dikey hareketli asansör
      { id: 'l10-p7', x: 1050, y: 460, width: 65, height: 48, type: 'vertical_moving', verticalMoveConfig: { minY: 430, maxY: 480, speed: 40, direction: 1 } },
      // 8. Hayalet platform
      { id: 'l10-p8', x: 1215, y: 460, width: 65, height: 48, type: 'disappearing', disappearConfig: { visibleDuration: 1.3, invisibleDuration: 1.0, timer: 1.3, isVisible: true } },
      // 9. Çatırdayan ada
      { id: 'l10-p9', x: 1375, y: 460, width: 65, height: 48, type: 'crumbling', crumbleDelay: 1.5 },
      // 10. Lazer engeli 2
      { id: 'l10-hz2', x: 1485, y: 465, width: 35, height: 25, type: 'hazard', hazardConfig: { type: 'spikes', width: 35, height: 25 } },
      // 11. Dar platform
      { id: 'l10-p10', x: 1555, y: 460, width: 46, height: 48, type: 'narrow' },
      // 12. Rüzgar tüneli 2 çıkışındaki hareketli ada
      { id: 'l10-p11', x: 1765, y: 460, width: 65, height: 48, type: 'moving', moveConfig: { minX: 1740, maxX: 1810, speed: 50, direction: -1 } },
      // 13. Son dar viraj
      { id: 'l10-p12', x: 1940, y: 460, width: 45, height: 48, type: 'narrow' },
      // 14. Efsanevi Bitiş Platformu!
      { id: 'l10-p13', x: 2095, y: 460, width: 95, height: 48, type: 'standard', isFinish: true },
    ],
  },
];
