// ロマサガ3 キャラクターパラメータ（必要分）
// name は元データ準拠（「一」が長音に使われているものもそのまま）
// sword = 剣レベル初期値
// seiryu, syucho, byakko, genbu, taiyo, tsuki = 蒼龍・朱鳥・白虎・玄武・太陽・月

const RS3_CHAR_DATA = [

  { id: 0,  name: 'ユリアン',      hp: 80,  sword: 2,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:01 },
  { id: 1,  name: 'エレン',        hp: 85,  sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:08 },
  { id: 2,  name: 'サラ',          hp: 70,  sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:07 },
  { id: 3,  name: 'ト一マス',      hp: 75,  sword: 1,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 2,  taiyo: 0,  tsuki: 0,  techtype:06 },
  { id: 4,  name: 'ハリ一ド',      hp: 170, sword: 7,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:01 },
  { id: 5,  name: 'ミカエル',      hp: 145, sword: 2,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 5,  tsuki: 0,  techtype:05 },
  { id: 6,  name: 'モニカ',        hp: 65,  sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:05 },
  { id: 7,  name: 'カタリナ',      hp: 140, sword: 6,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:02 },

  { id: 8,  name: 'レオニ一ド',    hp: 666, sword: 20, seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:05 },
  { id: 9,  name: '少年',          hp: 180, sword: 3,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:09 },
  { id: 10, name: 'ティベリウス',  hp: 90,  sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 9,  taiyo: 4,  tsuki: 0,  techtype:00 },
  { id: 11, name: 'ウォ一ド',      hp: 180, sword: 7,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:02 },
  { id: 12, name: 'ポ一ル',        hp: 120, sword: 2,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:09 },
  { id: 13, name: 'ロビン(細)',        hp: 180, sword: 10, seiryu: 10, syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:05 },
  { id: 14, name: 'ロビン(太)',        hp: 200, sword: 6,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:05 },
  { id: 15, name: 'ミュ一ズ',      hp: 110, sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:00 },
  { id: 16, name: 'シャ一ル',      hp: 240, sword: 10, seiryu: 0,  syucho: 15, byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:10 },
  { id: 17, name: '詩人',          hp: 120, sword: 3,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:01 },
  { id: 18, name: 'タチアナ',      hp: 65,  sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:05 },
  { id: 19, name: 'ヤン ファン',   hp: 250, sword: 5,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 15,  techtype:10 },

  { id: 20, name: 'ウンディ一ネ',  hp: 330, sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 21, taiyo: 0,  tsuki: 0,  techtype:00 },
  { id: 21, name: 'ツィ一 リン',   hp: 160, sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:07 },
  { id: 22, name: 'ハ一マン',      hp: 210, sword: 6,  seiryu: 7,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:03 },
  { id: 23, name: 'フルブライト',  hp: 180, sword: 0,  seiryu: 0,  syucho: 0,  byakko: 5,  genbu: 0,  taiyo: 5,  tsuki: 0,  techtype:00 },
  { id: 24, name: 'バイメイニャン',hp: 300, sword: 0,  seiryu: 27, syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:00 },
  { id: 25, name: 'ノ一ラ',        hp: 140, sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:04 },
  { id: 26, name: 'ブラック',      hp: 210, sword: 6,  seiryu: 7,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:03 },
  { id: 28, name: 'ようせい',      hp: 140, sword: 10, seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:06 },
  { id: 29, name: 'ボストン',      hp: 170, sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 10, taiyo: 0,  tsuki: 0,  techtype:08 },
  { id: 30, name: 'ぞう',          hp: 280, sword: 3,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 0,  taiyo: 0,  tsuki: 0,  techtype:03 },
  { id: 31, name: 'ゆきだるま',    hp: 180, sword: 0,  seiryu: 0,  syucho: 0,  byakko: 0,  genbu: 15, taiyo: 0,  tsuki: 0,  techtype:08 },

];

// ここを必ず入れる！
window.RS3_CHAR_DATA = RS3_CHAR_DATA;