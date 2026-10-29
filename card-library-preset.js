const INITIAL_CARD_DEFINITIONS = {
  "version": 8,
  "plan": "sense",
  "capturedOn": "2026-10-29",
  "cards": [
    {
      "id": "route-card:存在感",
      "name": "存在感",
      "kind": "mental",
      "preEffects": [
        {
          "id": "74248627-0f12-43ea-8bb2-22700c171d3a",
          "type": "good",
          "value": -2,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": -2,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "effects": [
        {
          "id": "d008432a-3b42-4c1b-9631-cdf1d03d857f",
          "type": "concentration",
          "value": 4,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 4,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "74248627-0f12-43ea-8bb2-22700c171d3a",
            "field": "value",
            "mode": "set",
            "value": -1
          },
          {
            "effectId": "d008432a-3b42-4c1b-9631-cdf1d03d857f",
            "field": "value",
            "mode": "set",
            "value": 5
          }
        ],
        "customs": [
          {
            "id": "cost",
            "name": "好調消費0",
            "patches": [
              {
                "effectId": "74248627-0f12-43ea-8bb2-22700c171d3a",
                "field": "value",
                "mode": "set",
                "value": 0
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [
              {
                "effectId": "d008432a-3b42-4c1b-9631-cdf1d03d857f",
                "field": "value",
                "mode": "add",
                "value": 1
              }
            ],
            "configured": true
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-card:シュプ",
      "name": "シュプ",
      "kind": "active",
      "preEffects": [
        {
          "id": "496e8318-1896-4c5b-9e78-a3667c754da7",
          "type": "concentration",
          "value": -3,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": -3,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "effects": [
        {
          "id": "d13efefd-7af0-4ea5-a0e0-e58581ecdfa4",
          "type": "score",
          "value": 6,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 6,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "45acced1-40b4-4a6b-a4fa-0847ac910336",
          "type": "good",
          "value": 2,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 2,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": false,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "496e8318-1896-4c5b-9e78-a3667c754da7",
            "field": "value",
            "mode": "set",
            "value": -2
          },
          {
            "effectId": "45acced1-40b4-4a6b-a4fa-0847ac910336",
            "field": "value",
            "mode": "set",
            "value": 3
          }
        ],
        "customs": [
          {
            "id": "cost",
            "name": "集中消費1",
            "patches": [
              {
                "effectId": "496e8318-1896-4c5b-9e78-a3667c754da7",
                "field": "value",
                "mode": "set",
                "value": -1
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [
              {
                "effectId": "d13efefd-7af0-4ea5-a0e0-e58581ecdfa4",
                "field": "value",
                "mode": "set",
                "value": 12
              }
            ],
            "configured": true
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-card:情熱ターン",
      "name": "情熱ターン",
      "kind": "active",
      "preEffects": [],
      "effects": [
        {
          "id": "0b4e453f-b7e6-4760-be7d-5d0bf71d4523",
          "type": "score",
          "value": 11,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 11,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "7f73ac8b-d255-48f7-b182-c1a1d975d7e4",
          "type": "concentration",
          "value": 3,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 3,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "0b4e453f-b7e6-4760-be7d-5d0bf71d4523",
            "field": "value",
            "mode": "set",
            "value": 18
          },
          {
            "effectId": "7f73ac8b-d255-48f7-b182-c1a1d975d7e4",
            "field": "value",
            "mode": "set",
            "value": 4
          }
        ],
        "customs": [
          {
            "id": "conc1",
            "name": "集中5",
            "patches": [
              {
                "effectId": "7f73ac8b-d255-48f7-b182-c1a1d975d7e4",
                "field": "value",
                "mode": "set",
                "value": 5
              }
            ]
          },
          {
            "id": "conc2",
            "name": "集中7（2カスタム）",
            "patches": [
              {
                "effectId": "7f73ac8b-d255-48f7-b182-c1a1d975d7e4",
                "field": "value",
                "mode": "set",
                "value": 7
              }
            ]
          },
          {
            "id": "count",
            "name": "パラメータ2回",
            "patches": [
              {
                "effectId": "0b4e453f-b7e6-4760-be7d-5d0bf71d4523",
                "field": "count",
                "mode": "set",
                "value": 2
              }
            ]
          },
          {
            "id": "mixed",
            "name": "集中5・パラメータ2回",
            "patches": [
              {
                "effectId": "7f73ac8b-d255-48f7-b182-c1a1d975d7e4",
                "field": "value",
                "mode": "set",
                "value": 5
              },
              {
                "effectId": "0b4e453f-b7e6-4760-be7d-5d0bf71d4523",
                "field": "count",
                "mode": "set",
                "value": 2
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-card:道筋",
      "name": "道筋",
      "kind": "mental",
      "preEffects": [
        {
          "id": "3efca8a5-3059-4b69-ae7c-f6d24a974a64",
          "type": "good",
          "value": -1,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": -1,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "effects": [
        {
          "id": "07cad7ab-174e-4591-a760-dd6de281864c",
          "type": "concentration",
          "value": 7,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 7,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "07cad7ab-174e-4591-a760-dd6de281864c",
            "field": "value",
            "mode": "set",
            "value": 9
          }
        ],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-card:センブリ",
      "name": "センブリ",
      "kind": "drink",
      "preEffects": [],
      "effects": [
        {
          "id": "0ada111f-922a-4e3d-a671-dcb92f4d7c6c",
          "type": "paramBoost",
          "value": 10,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 10,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": false,
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-card:スポットライト",
      "name": "スポットライト",
      "kind": "mental",
      "preEffects": [],
      "effects": [
        {
          "id": "484b2fac-c993-44ee-be95-e07373e71f8d",
          "type": "good",
          "value": 5,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 5,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "0d44ea0e-d66f-4b68-9f2d-0cda6c9780c0",
          "type": "score",
          "value": 6,
          "count": 0,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 6,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "484b2fac-c993-44ee-be95-e07373e71f8d",
            "field": "value",
            "mode": "set",
            "value": 6
          }
        ],
        "customs": [
          {
            "id": "good1",
            "name": "好調7（1カスタム）",
            "patches": [
              {
                "effectId": "484b2fac-c993-44ee-be95-e07373e71f8d",
                "field": "value",
                "mode": "set",
                "value": 7
              }
            ]
          },
          {
            "id": "good2",
            "name": "好調9（2カスタム）",
            "patches": [
              {
                "effectId": "484b2fac-c993-44ee-be95-e07373e71f8d",
                "field": "value",
                "mode": "set",
                "value": 9
              }
            ]
          },
          {
            "id": "score",
            "name": "パラメータ6",
            "patches": [
              {
                "effectId": "0d44ea0e-d66f-4b68-9f2d-0cda6c9780c0",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          },
          {
            "id": "mixed",
            "name": "好調7・パラメータ6",
            "patches": [
              {
                "effectId": "484b2fac-c993-44ee-be95-e07373e71f8d",
                "field": "value",
                "mode": "set",
                "value": 7
              },
              {
                "effectId": "0d44ea0e-d66f-4b68-9f2d-0cda6c9780c0",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "configured": true,
            "patches": [
              {
                "effectId": "484b2fac-c993-44ee-be95-e07373e71f8d",
                "field": "value",
                "mode": "add",
                "value": 1
              }
            ]
          },
          {
            "id": "triple",
            "name": "+++",
            "configured": true,
            "patches": [
              {
                "effectId": "484b2fac-c993-44ee-be95-e07373e71f8d",
                "field": "value",
                "mode": "add",
                "value": 2
              }
            ]
          }
        ]
      },
      "note": "最終ターンの計算対象は好調と追加パラメータです。元気・体力・カードを引く効果は計算対象外です。"
    },
    {
      "id": "route-card:精神統一",
      "name": "精神統一",
      "kind": "mental",
      "preEffects": [],
      "effects": [
        {
          "id": "9e0efd42-f665-4bce-9ccb-3b6d3509d2f9",
          "type": "concentration",
          "value": 5,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 5,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "4915da1e-57b1-4311-a7e1-8ae0eaaac7b8",
          "type": "concScoreBoost",
          "value": 20,
          "count": 1,
          "concRate": 1,
          "duration": 3,
          "goodThreshold": 15,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 20,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "e9169843-1739-40dd-843d-faca067aff31",
          "type": "score",
          "value": 6,
          "count": 0,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 6,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "9e0efd42-f665-4bce-9ccb-3b6d3509d2f9",
            "field": "value",
            "mode": "set",
            "value": 6
          }
        ],
        "customs": [
          {
            "id": "conc1",
            "name": "集中7（1カスタム）",
            "patches": [
              {
                "effectId": "9e0efd42-f665-4bce-9ccb-3b6d3509d2f9",
                "field": "value",
                "mode": "set",
                "value": 7
              }
            ]
          },
          {
            "id": "conc2",
            "name": "集中9（2カスタム）",
            "patches": [
              {
                "effectId": "9e0efd42-f665-4bce-9ccb-3b6d3509d2f9",
                "field": "value",
                "mode": "set",
                "value": 9
              }
            ]
          },
          {
            "id": "score",
            "name": "パラメータ6",
            "patches": [
              {
                "effectId": "e9169843-1739-40dd-843d-faca067aff31",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          },
          {
            "id": "mixed",
            "name": "集中7・パラメータ6",
            "patches": [
              {
                "effectId": "9e0efd42-f665-4bce-9ccb-3b6d3509d2f9",
                "field": "value",
                "mode": "set",
                "value": 7
              },
              {
                "effectId": "e9169843-1739-40dd-843d-faca067aff31",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [
              {
                "effectId": "9e0efd42-f665-4bce-9ccb-3b6d3509d2f9",
                "field": "value",
                "mode": "add",
                "value": 0
              }
            ],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [
              {
                "effectId": "9e0efd42-f665-4bce-9ccb-3b6d3509d2f9",
                "field": "value",
                "mode": "add",
                "value": 0
              }
            ],
            "configured": false
          }
        ]
      },
      "note": "好調15以下で集中強化20%（3ターン）。++／+++は集中への加算値を入力してください。元気・体力・ドローは計算対象外です。"
    },
    {
      "id": "route-card:始まりの合図",
      "name": "始まりの合図",
      "kind": "mental",
      "preEffects": [],
      "effects": [
        {
          "id": "fd6f5b88-9459-478a-987b-b6bca193e91a",
          "type": "good",
          "value": 5,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 5,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "3e1c5d6e-2fad-47d5-8898-b83290d29ead",
          "type": "score",
          "value": 6,
          "count": 0,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 6,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "fd6f5b88-9459-478a-987b-b6bca193e91a",
            "field": "value",
            "mode": "set",
            "value": 7
          }
        ],
        "customs": [
          {
            "id": "good1",
            "name": "好調8",
            "patches": [
              {
                "effectId": "fd6f5b88-9459-478a-987b-b6bca193e91a",
                "field": "value",
                "mode": "set",
                "value": 8
              }
            ]
          },
          {
            "id": "good2",
            "name": "好調10（2カスタム）",
            "patches": [
              {
                "effectId": "fd6f5b88-9459-478a-987b-b6bca193e91a",
                "field": "value",
                "mode": "set",
                "value": 10
              }
            ]
          },
          {
            "id": "score",
            "name": "パラメータ6",
            "patches": [
              {
                "effectId": "3e1c5d6e-2fad-47d5-8898-b83290d29ead",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          },
          {
            "id": "mixed",
            "name": "好調8・パラメータ6",
            "patches": [
              {
                "effectId": "fd6f5b88-9459-478a-987b-b6bca193e91a",
                "field": "value",
                "mode": "set",
                "value": 8
              },
              {
                "effectId": "3e1c5d6e-2fad-47d5-8898-b83290d29ead",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-card:スリリング",
      "name": "スリリング",
      "kind": "mental",
      "preEffects": [],
      "effects": [
        {
          "id": "aca75709-338c-4ac2-9b7d-c377646535f4",
          "type": "good",
          "value": 5,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 5,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "0fd97d03-bce9-411e-a618-226205a8f580",
          "type": "score",
          "value": 6,
          "count": 0,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 6,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "aca75709-338c-4ac2-9b7d-c377646535f4",
            "field": "value",
            "mode": "set",
            "value": 7
          }
        ],
        "customs": [
          {
            "id": "good",
            "name": "好調9",
            "patches": [
              {
                "effectId": "aca75709-338c-4ac2-9b7d-c377646535f4",
                "field": "value",
                "mode": "set",
                "value": 9
              }
            ]
          },
          {
            "id": "score",
            "name": "パラメータ6",
            "patches": [
              {
                "effectId": "0fd97d03-bce9-411e-a618-226205a8f580",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-card:アドリブ",
      "name": "アドリブ",
      "kind": "active",
      "preEffects": [],
      "effects": [
        {
          "id": "1a8ac174-80df-4bb0-8119-e60084347a56",
          "type": "score",
          "value": 5,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 5,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "908535c2-dd0a-42d2-8efd-7d8c453ba99a",
          "type": "good",
          "value": 3,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 3,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        },
        {
          "id": "60d24c86-9c87-4058-beb3-4e6a3ce4b0cd",
          "type": "concentration",
          "value": 2,
          "count": 0,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 2,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": true,
      "reservedEffects": [],
      "variants": {
        "plus": [
          {
            "effectId": "1a8ac174-80df-4bb0-8119-e60084347a56",
            "field": "value",
            "mode": "set",
            "value": 9
          },
          {
            "effectId": "908535c2-dd0a-42d2-8efd-7d8c453ba99a",
            "field": "value",
            "mode": "set",
            "value": 4
          }
        ],
        "customs": [
          {
            "id": "score1",
            "name": "パラメータ15",
            "patches": [
              {
                "effectId": "1a8ac174-80df-4bb0-8119-e60084347a56",
                "field": "value",
                "mode": "set",
                "value": 15
              }
            ]
          },
          {
            "id": "score2",
            "name": "パラメータ31（2カスタム）",
            "patches": [
              {
                "effectId": "1a8ac174-80df-4bb0-8119-e60084347a56",
                "field": "value",
                "mode": "set",
                "value": 31
              }
            ]
          },
          {
            "id": "good1",
            "name": "好調5",
            "patches": [
              {
                "effectId": "908535c2-dd0a-42d2-8efd-7d8c453ba99a",
                "field": "value",
                "mode": "set",
                "value": 5
              }
            ]
          },
          {
            "id": "good2",
            "name": "好調7（2カスタム）",
            "patches": [
              {
                "effectId": "908535c2-dd0a-42d2-8efd-7d8c453ba99a",
                "field": "value",
                "mode": "set",
                "value": 7
              }
            ]
          },
          {
            "id": "conc",
            "name": "集中2",
            "patches": [
              {
                "effectId": "60d24c86-9c87-4058-beb3-4e6a3ce4b0cd",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          },
          {
            "id": "score-good",
            "name": "パラメータ15・好調5",
            "patches": [
              {
                "effectId": "1a8ac174-80df-4bb0-8119-e60084347a56",
                "field": "value",
                "mode": "set",
                "value": 15
              },
              {
                "effectId": "908535c2-dd0a-42d2-8efd-7d8c453ba99a",
                "field": "value",
                "mode": "set",
                "value": 5
              }
            ]
          },
          {
            "id": "score-conc",
            "name": "パラメータ15・集中2",
            "patches": [
              {
                "effectId": "1a8ac174-80df-4bb0-8119-e60084347a56",
                "field": "value",
                "mode": "set",
                "value": 15
              },
              {
                "effectId": "60d24c86-9c87-4058-beb3-4e6a3ce4b0cd",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          },
          {
            "id": "good-conc",
            "name": "好調5・集中2",
            "patches": [
              {
                "effectId": "908535c2-dd0a-42d2-8efd-7d8c453ba99a",
                "field": "value",
                "mode": "set",
                "value": 5
              },
              {
                "effectId": "60d24c86-9c87-4058-beb3-4e6a3ce4b0cd",
                "field": "count",
                "mode": "set",
                "value": 1
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [
              {
                "effectId": "1a8ac174-80df-4bb0-8119-e60084347a56",
                "field": "value",
                "mode": "set",
                "value": 11
              }
            ],
            "configured": true
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "reservedEffects": [
        {
          "id": "400b9474-70e5-40f0-9170-e804415c7b53",
          "type": "score",
          "value": 5,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 5,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1,
          "delay": 1,
          "repeat": 3,
          "interval": 1,
          "upgradeDelay": 1,
          "upgradeRepeat": 4,
          "upgradeInterval": 1
        }
      ],
      "id": "d3e1e7b9-88ac-4462-bc6f-fc41697e09ce",
      "name": "破竹の勢い",
      "kind": "active",
      "ljReaction": false,
      "preEffects": [],
      "effects": [
        {
          "id": "3b53f701-6482-4560-b8e0-91be2239d3c8",
          "type": "concentration",
          "value": 5,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 7,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "variants": {
        "plus": [
          {
            "effectId": "3b53f701-6482-4560-b8e0-91be2239d3c8",
            "field": "value",
            "mode": "set",
            "value": 7
          },
          {
            "effectId": "3b53f701-6482-4560-b8e0-91be2239d3c8",
            "field": "count",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "3b53f701-6482-4560-b8e0-91be2239d3c8",
            "field": "concRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "3b53f701-6482-4560-b8e0-91be2239d3c8",
            "field": "goodRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "400b9474-70e5-40f0-9170-e804415c7b53",
            "field": "value",
            "mode": "set",
            "value": 5
          },
          {
            "effectId": "400b9474-70e5-40f0-9170-e804415c7b53",
            "field": "count",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "400b9474-70e5-40f0-9170-e804415c7b53",
            "field": "concRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "400b9474-70e5-40f0-9170-e804415c7b53",
            "field": "goodRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "400b9474-70e5-40f0-9170-e804415c7b53",
            "field": "delay",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "400b9474-70e5-40f0-9170-e804415c7b53",
            "field": "repeat",
            "mode": "set",
            "value": 4
          },
          {
            "effectId": "400b9474-70e5-40f0-9170-e804415c7b53",
            "field": "interval",
            "mode": "set",
            "value": 1
          }
        ],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [
              {
                "effectId": "3b53f701-6482-4560-b8e0-91be2239d3c8",
                "field": "value",
                "mode": "set",
                "value": 8
              }
            ],
            "configured": true
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [
              {
                "effectId": "3b53f701-6482-4560-b8e0-91be2239d3c8",
                "field": "value",
                "mode": "set",
                "value": 9
              }
            ],
            "configured": true
          }
        ]
      }
    },
    {
      "reservedEffects": [
        {
          "id": "95ed6a4c-89e2-4378-ab43-6571c7275004",
          "type": "score",
          "value": 38,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 47,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1,
          "delay": 1,
          "repeat": 1,
          "interval": 1,
          "upgradeDelay": 1,
          "upgradeRepeat": 1,
          "upgradeInterval": 1
        },
        {
          "id": "5d4a3dd6-dedc-470a-934d-1b0144088199",
          "type": "score",
          "value": 21,
          "count": 1,
          "concRate": 1,
          "goodRate": 2,
          "upgradeEnabled": false,
          "upgradeValue": 0,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1,
          "delay": 2,
          "repeat": 1,
          "interval": 1,
          "upgradeDelay": 1,
          "upgradeRepeat": 1,
          "upgradeInterval": 1
        }
      ],
      "id": "14e4d93f-dba7-4774-8292-bd1debefc8d9",
      "name": "魅惑のパフォーマンス",
      "kind": "active",
      "ljReaction": false,
      "preEffects": [],
      "effects": [],
      "variants": {
        "plus": [
          {
            "effectId": "95ed6a4c-89e2-4378-ab43-6571c7275004",
            "field": "value",
            "mode": "set",
            "value": 47
          },
          {
            "effectId": "95ed6a4c-89e2-4378-ab43-6571c7275004",
            "field": "count",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "95ed6a4c-89e2-4378-ab43-6571c7275004",
            "field": "concRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "95ed6a4c-89e2-4378-ab43-6571c7275004",
            "field": "goodRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "95ed6a4c-89e2-4378-ab43-6571c7275004",
            "field": "delay",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "95ed6a4c-89e2-4378-ab43-6571c7275004",
            "field": "repeat",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "95ed6a4c-89e2-4378-ab43-6571c7275004",
            "field": "interval",
            "mode": "set",
            "value": 1
          }
        ],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "reservedEffects": [
        {
          "id": "8b4b425c-665a-4f0b-9902-42bc093073b7",
          "type": "score",
          "value": 32,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 40,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1,
          "delay": 1,
          "repeat": 1,
          "interval": 1,
          "upgradeDelay": 1,
          "upgradeRepeat": 1,
          "upgradeInterval": 1
        }
      ],
      "id": "796a12e9-b1a9-4c03-9705-0fc550ca8e09",
      "name": "成就",
      "kind": "active",
      "ljReaction": false,
      "preEffects": [],
      "effects": [
        {
          "id": "4a77a4bc-ccb4-46b1-92f8-8b400dfb60e4",
          "type": "good",
          "value": 4,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 7,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "variants": {
        "plus": [
          {
            "effectId": "4a77a4bc-ccb4-46b1-92f8-8b400dfb60e4",
            "field": "value",
            "mode": "set",
            "value": 7
          },
          {
            "effectId": "4a77a4bc-ccb4-46b1-92f8-8b400dfb60e4",
            "field": "count",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "4a77a4bc-ccb4-46b1-92f8-8b400dfb60e4",
            "field": "concRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "4a77a4bc-ccb4-46b1-92f8-8b400dfb60e4",
            "field": "goodRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "8b4b425c-665a-4f0b-9902-42bc093073b7",
            "field": "value",
            "mode": "set",
            "value": 40
          },
          {
            "effectId": "8b4b425c-665a-4f0b-9902-42bc093073b7",
            "field": "count",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "8b4b425c-665a-4f0b-9902-42bc093073b7",
            "field": "concRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "8b4b425c-665a-4f0b-9902-42bc093073b7",
            "field": "goodRate",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "8b4b425c-665a-4f0b-9902-42bc093073b7",
            "field": "delay",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "8b4b425c-665a-4f0b-9902-42bc093073b7",
            "field": "repeat",
            "mode": "set",
            "value": 1
          },
          {
            "effectId": "8b4b425c-665a-4f0b-9902-42bc093073b7",
            "field": "interval",
            "mode": "set",
            "value": 1
          }
        ],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "208c1fb2-730f-40fb-b549-e53ac8131133",
      "name": "仕切り（アイドル宣言）",
      "kind": "mental",
      "ljReaction": false,
      "preEffects": [],
      "effects": [],
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "e4b5fe9b-66b9-465e-a7fb-16b480a463b5",
      "name": "立ち位置",
      "kind": "active",
      "ljReaction": false,
      "preEffects": [
        {
          "id": "1811cff0-6fa2-495f-bcc0-190af7e8d37e",
          "type": "concentration",
          "value": -3,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": -3,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "effects": [
        {
          "id": "3e21c4bf-9448-4df3-ac75-01ff7713dbeb",
          "type": "score",
          "value": 30,
          "count": 1,
          "concRate": 1,
          "goodRate": 2,
          "upgradeEnabled": false,
          "upgradeValue": 40,
          "upgradeCount": 2,
          "upgradeConcRate": 2,
          "upgradeGoodRate": 1
        }
      ],
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [
          {
            "id": "95f519fc-2308-4ca0-bb64-9d7e7ebd4fa9",
            "name": "回数2",
            "patches": [
              {
                "effectId": "3e21c4bf-9448-4df3-ac75-01ff7713dbeb",
                "field": "count",
                "mode": "set",
                "value": 2
              }
            ]
          }
        ],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "d94b078e-bef5-4957-877b-9f9406a20c14",
      "name": "話題沸騰",
      "kind": "active",
      "ljReaction": false,
      "preEffects": [],
      "effects": [
        {
          "id": "6d13a2c1-027b-47fa-8e65-05dcb58ac12a",
          "type": "score",
          "value": 50,
          "count": 1,
          "concRate": 1,
          "goodRate": 2.5,
          "upgradeEnabled": false,
          "upgradeValue": 60,
          "upgradeCount": 1,
          "upgradeConcRate": 2.5,
          "upgradeGoodRate": 1
        },
        {
          "id": "6268d58d-2389-43fc-a4d2-0582c5c0ec46",
          "type": "paramBoost",
          "value": 30,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 30,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [
              {
                "effectId": "6d13a2c1-027b-47fa-8e65-05dcb58ac12a",
                "field": "value",
                "mode": "set",
                "value": 53
              },
              {
                "effectId": "6d13a2c1-027b-47fa-8e65-05dcb58ac12a",
                "field": "goodRate",
                "mode": "set",
                "value": 3
              }
            ],
            "configured": true
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "bd98d906-2847-4551-a18e-5ca282497531",
      "name": "パラメ倍率-10％",
      "kind": "drink",
      "ljReaction": false,
      "preEffects": [],
      "effects": [
        {
          "id": "aa4fee6a-41fb-4a92-a5d9-a5a2c7d39fb1",
          "type": "paramBoost",
          "value": -10,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": -10,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "abcb9934-6468-4ba9-ba83-cf8f3c66ce82",
      "name": "ブエキ",
      "kind": "drink",
      "preEffects": [],
      "effects": [
        {
          "id": "331b4c22-379e-4c3d-9da8-6db1742f0b3c",
          "type": "paramBoost",
          "value": 30,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 10,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "ljReaction": false,
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "83f7bc2a-4e00-4d48-be76-6234d05e8428",
      "name": "ビタミンドリンク",
      "kind": "drink",
      "ljReaction": false,
      "preEffects": [],
      "effects": [
        {
          "id": "72a4879c-2335-48e1-8d30-5d39eba9aab6",
          "type": "good",
          "value": 3,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 0,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "500ab263-0363-4155-8500-1d448dceaa0b",
      "name": "好調+7",
      "kind": "drink",
      "ljReaction": false,
      "preEffects": [],
      "effects": [
        {
          "id": "ea306970-bfc9-41cd-ba53-0c7dfda985a6",
          "type": "good",
          "value": 7,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 0,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ],
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": [
          {
            "id": "double",
            "name": "++",
            "patches": [],
            "configured": false
          },
          {
            "id": "triple",
            "name": "+++",
            "patches": [],
            "configured": false
          }
        ]
      }
    },
    {
      "id": "route-drink:macchiato",
      "name": "厳選初星マキアート",
      "kind": "drink",
      "preEffects": [],
      "effects": [],
      "ljReaction": false,
      "reservedEffects": [],
      "variants": {
        "plus": [],
        "customs": [],
        "enhancements": []
      },
      "endTurnEffects": [
        {
          "id": "601cbb78-189a-43ed-b3f2-d25303fbc5fb",
          "type": "concentration",
          "value": 1,
          "count": 1,
          "concRate": 1,
          "goodRate": 1,
          "upgradeEnabled": false,
          "upgradeValue": 1,
          "upgradeCount": 1,
          "upgradeConcRate": 1,
          "upgradeGoodRate": 1
        }
      ]
    }
  ]
};

const INITIAL_TOOL_DEFAULTS = {
  "scenario": {
    "previousScore": 340565,
    "showFinalScore": true,
    "remainingTurns": 3,
    "concentration": 87,
    "good": 4,
    "paramBoost": 50,
    "concGainBoost": 0,
    "goodGainBoost": 0,
    "concGainBoostTurns": 1,
    "concGainBoostFresh": false,
    "goodGainBoostTurns": 1,
    "goodGainBoostFresh": false,
    "concScoreBoost": 20,
    "concScoreBoostTurns": 2,
    "superGood": true,
    "multipliers": {
      "vo": 3834,
      "da": 4068,
      "vi": 2786
    },
    "memo": "",
    "negai": {
      "enabled": false,
      "concentration": 1
    },
    "entertainment": {
      "enabled": true,
      "enhanced": true,
      "score": 4,
      "concRate": 1,
      "national": false
    },
    "natsuya": {
      "enabled": true,
      "remaining": 2,
      "interval": 5,
      "score": 4
    },
    "lj": {
      "enabled": true,
      "score": 14,
      "concRate": 1.5,
      "national": false
    },
    "ljPitem": {
      "enabled": true,
      "activeRemaining": 1,
      "uses": 1,
      "concGainBoost": 25
    },
    "tenshin": {
      "enabled": true
    },
    "kyakkou": {
      "enabled": true,
      "upgradeLevel": 1,
      "enhanced": true,
      "national": true,
      "count": 1
    },
    "carryInCards": [],
    "concScoreBoostRows": [
      {
        "percent": 20,
        "turns": 2,
        "fresh": false
      },
      {
        "percent": 0,
        "turns": 3,
        "fresh": true
      },
      {
        "percent": 0,
        "turns": 4,
        "fresh": false
      }
    ]
  },
  "routes": [
    {
      "id": "8bf3d4d7-0760-4568-b3c1-89af56081fd9",
      "name": "ルート1",
      "memo": "",
      "turns": [
        {
          "attribute": "da",
          "cardIds": [
            "route-card:アドリブ",
            "route-card:スリリング",
            "route-card:シュプ",
            "route-card:存在感",
            "route-card:アドリブ"
          ],
          "upgraded": [
            false,
            false,
            false,
            false,
            false
          ],
          "configs": [
            {
              "base": "plus",
              "custom": "good2",
              "enhancement": ""
            },
            {
              "base": "plus",
              "custom": "",
              "enhancement": ""
            },
            {
              "base": "plus",
              "custom": "",
              "enhancement": "double"
            },
            {
              "base": "plus",
              "custom": "cost",
              "enhancement": ""
            },
            {
              "base": "plus",
              "custom": "good2",
              "enhancement": "double"
            }
          ]
        },
        {
          "attribute": "vi",
          "cardIds": [
            "route-card:存在感",
            "route-card:シュプ",
            "route-card:アドリブ"
          ],
          "upgraded": [
            false,
            false,
            false
          ],
          "configs": [
            {
              "base": "plus",
              "custom": "cost",
              "enhancement": ""
            },
            {
              "base": "plus",
              "custom": "",
              "enhancement": ""
            },
            {
              "base": "plus",
              "custom": "good2",
              "enhancement": ""
            }
          ]
        },
        {
          "attribute": "vo",
          "cardIds": [
            "route-card:シュプ",
            "route-card:存在感",
            "route-card:アドリブ"
          ],
          "upgraded": [
            false,
            false,
            false
          ],
          "configs": [
            {
              "base": "plus",
              "custom": "",
              "enhancement": ""
            },
            {
              "base": "plus",
              "custom": "cost",
              "enhancement": ""
            },
            {
              "base": "plus",
              "custom": "good2",
              "enhancement": ""
            }
          ]
        }
      ]
    }
  ],
  "externalOrder": [
    "negai",
    "entertainment"
  ],
  "routeDefaults": {
    "route-card:アドリブ": {
      "base": "plus",
      "custom": "good2"
    },
    "route-card:スリリング": {
      "base": "plus",
      "custom": ""
    },
    "route-card:シュプ": {
      "base": "plus",
      "custom": ""
    },
    "route-card:存在感": {
      "base": "plus",
      "custom": "cost"
    }
  },
  "scenePresets": [
    {
      "id": "8faeded3-5c33-4746-a24f-b922fade607e",
      "name": "実験２",
      "scenario": {
        "previousScore": 340565,
        "showFinalScore": true,
        "remainingTurns": 3,
        "concentration": 87,
        "good": 4,
        "paramBoost": 50,
        "concGainBoost": 0,
        "goodGainBoost": 0,
        "concGainBoostTurns": 1,
        "concGainBoostFresh": false,
        "goodGainBoostTurns": 1,
        "goodGainBoostFresh": false,
        "concScoreBoost": 20,
        "concScoreBoostTurns": 2,
        "superGood": true,
        "multipliers": {
          "vo": 3834,
          "da": 4068,
          "vi": 2786
        },
        "memo": "",
        "negai": {
          "enabled": false,
          "concentration": 1
        },
        "entertainment": {
          "enabled": true,
          "enhanced": true,
          "score": 4,
          "concRate": 1,
          "national": false
        },
        "natsuya": {
          "enabled": true,
          "remaining": 2,
          "interval": 5,
          "score": 4
        },
        "lj": {
          "enabled": true,
          "score": 14,
          "concRate": 1.5,
          "national": false
        },
        "ljPitem": {
          "enabled": true,
          "activeRemaining": 1,
          "uses": 1,
          "concGainBoost": 25
        },
        "tenshin": {
          "enabled": true
        },
        "kyakkou": {
          "enabled": true,
          "upgradeLevel": 1,
          "enhanced": true,
          "national": true,
          "count": 1
        },
        "carryInCards": [],
        "concScoreBoostRows": [
          {
            "percent": 20,
            "turns": 2,
            "fresh": false
          },
          {
            "percent": 0,
            "turns": 3,
            "fresh": true
          },
          {
            "percent": 0,
            "turns": 4,
            "fresh": false
          }
        ]
      },
      "externalOrder": [
        "negai",
        "entertainment"
      ]
    }
  ],
  "ui": {
    "selectedCardId": "d3e1e7b9-88ac-4462-bc6f-fc41697e09ce",
    "selectedRouteId": "8bf3d4d7-0760-4568-b3c1-89af56081fd9",
    "selectedResultRouteId": "8bf3d4d7-0760-4568-b3c1-89af56081fd9",
    "selectedScenePresetId": "8faeded3-5c33-4746-a24f-b922fade607e",
    "activeStep": 0,
    "logDetail": false
  }
};
