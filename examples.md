# Examples

## Race

### Values

* Height is in inches
* Weight is in lbs.
* Speed is in feet
* In languages `"Any"` means any language.
* In abilityBonus `"Choice": [{"Any": 1}, {"Cha": 1, "Int": 1}]` means any ability + 1 and cha or int + 1

_Subraces should be added like normal races with a extra `mainRace` property for naming purposes._

#### Main Race

```json
"Human": {
    "source": "ABC",
    "age": 123,
    "abilityBonus": {
        "Str": 1,
        "Dex": 1,
        "Con": 1,
        "Int": 1,
        "Wis": 1,
        "Cha": 1
    },
    "languages": [
        "Common",
        "Any"
    ],
    "height": {
        "size": "Medium",
        "base": 40,
        "mod": "2d6"
    },
    "weight": {
        "base": 95,
        "mod": "2d4"
    },
    "speed": 30
},
```

#### Subrace

```json
"Special Human": {
    "source": "ABC",
    "mainRace": "Human",
    "age": 123,
    "abilityBonus": {
        "Str": 1,
        "Dex": 1,
        "Con": 1,
        "Int": 1,
        "Wis": 1,
        "Cha": 1
    },
    "languages": [
        "Common",
        "Any"
    ],
    "height": {
        "size": "Medium",
        "base": 40,
        "mod": "2d6"
    },
    "weight": {
        "base": 95,
        "mod": "2d4"
    },
    "speed": 30
},
```

## Classes

### Values

* In skills `Any` means any skill

```json
"Bard": {
    "source": "PHB",
    "hp": "1d8",
    "proficiencies": {
        "Armor": [
            "Light Armor"
        ],
        "Weapons": [
            "Simple Weapons",
            "Hand Crossbows",
            "Longswords",
            "Rapiers",
            "Shortswords"
        ],
        "Tools": [
            "Musical Instrument",
            "Musical Instrument",
            "Musical Instrument"
        ],
        "Saving Throws": [
            "Dex",
            "Cha"
        ],
        "Skills": [
            ["Any"],
            ["Any"],
            ["Any"]
        ]
    },
    "subclasses": {
        "College of Lore": {
            "source": "PHB"
        }
    }
},
```
