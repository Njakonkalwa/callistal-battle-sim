// This will be a JavaScript version of your battle simulator
// It will rely on a units.json file stored locally or fetched remotely
// You need to integrate it with HTML inputs for user interaction

let units = {};

async function loadUnits() {
  const response = await fetch('units.json');
  units = await response.json();
}

function getBonus(unit, terrain, season, weather) {
  let bonus = 1.0;

  const terrainBonusMap = {
    "plains": { "plains": 0.2, "forest": 0.1, "taiga": 0.05, "mountain": -0.025, "desert": -0.025, "rainforest": -0.025 },
    "forest": { "forest": 0.2, "plains": 0.1, "taiga": 0.05, "mountain": -0.025, "desert": -0.025, "rainforest": -0.025 },
    "taiga": { "taiga": 0.2, "forest": 0.1, "tundra": 0.05, "mountain": -0.025, "desert": -0.025, "rainforest": -0.025 },
    "tundra": { "tundra": 0.2, "taiga": 0.05, "plains": 0.05, "mountain": -0.025, "desert": -0.025, "rainforest": -0.03 },
    "mountain": { "mountain": 0.2, "plains": 0.05, "desert": -0.025, "tundra": -0.025, "rainforest": -0.025 },
    "rainforest": { "rainforest": 0.2, "forest": 0.1, "desert": -0.025, "tundra": -0.03, "mountain": -0.03 },
    "desert": { "desert": 0.2, "plains": 0.075, "mountain": -0.025, "rainforest": -0.025 }
  };

  const seasonBonus = {
    "arctic": { "winter": 0.1, "summer": -0.025 },
    "arid": { "summer": 0.1, "winter": -0.025 }
  };

  const weatherBonus = {
    "clear": { "clear": 0.05, "blizzard": -0.05, "snow": -0.025 },
    "rainlight": { "rainlight": 0.05, "rainheavy": 0.025, "snow": -0.025, "blizzard": -0.05 },
    "rainheavy": { "rainheavy": 0.05, "rainlight": 0.05, "blizzard": -0.01 },
    "snow": { "snow": 0.05, "blizzard": 0.025 },
    "blizzard": { "blizzard": 0.05, "snow": 0.025 }
  };

  bonus += terrainBonusMap[unit.preferred_terrain]?.[terrain] || 0;
  bonus += seasonBonus[unit.climate]?.[season] || 0;
  bonus += weatherBonus[unit.weather]?.[weather] || 0;

  const unitTypeBonus = {
    "troops": 0.0,
    "heavy": 2.0,
    "air": 0.7,
    "naval": 0.0,
    "special": 0.3
  };

  bonus += unitTypeBonus[unit.unit_type] || 0;

  return bonus;
}

function calculateStrength(unit, terrain, season, weather) {
  const size = unit.unit_size;
  const base = unit.tech_level * unit.power_level * Math.sqrt(size);
  const bonus = getBonus(unit, terrain, season, weather);
  const rng = 0.85 + Math.random() * 0.3; // [0.85, 1.15]
  return base * bonus * rng;
}

function resolveBattle(ids1, ids2, terrain, season, weather) {
  function getStrengths(unitIds) {
    let total = 0;
    let indiv = {};
    for (let id of unitIds) {
      const unit = units[id];
      if (!unit) {
        console.log(`❌ Unit ${id} not found.`);
        continue;
      }
      const strength = calculateStrength(unit, terrain, season, weather);
      total += strength;
      indiv[id] = strength;
    }
    return { total, indiv };
  }

  const { total: total1, indiv: strengths1 } = getStrengths(ids1);
  const { total: total2, indiv: strengths2 } = getStrengths(ids2);

  if (total1 === 0 || total2 === 0) return "❌ One side has no valid units or strength.";

  let winnerIds, loserIds, winnerTotal, loserTotal;

  if (total1 > total2) {
    winnerIds = ids1;
    loserIds = ids2;
    winnerTotal = total1;
    loserTotal = total2;
  } else if (total2 > total1) {
    winnerIds = ids2;
    loserIds = ids1;
    winnerTotal = total2;
    loserTotal = total1;
  } else {
    ids1.concat(ids2).forEach(id => {
      if (units[id]) {
        const loss = Math.round(units[id].unit_size * 0.3);
        units[id].unit_size = Math.max(0, units[id].unit_size - loss);
      }
    });
    return "⚔️ It's a draw! All units lost ~30%.";
  }

  const ratio = loserTotal / winnerTotal;

  loserIds.forEach(id => {
    if (units[id]) {
      const loss = Math.round(units[id].unit_size * (0.3 + Math.random() * 0.2));
      units[id].unit_size = Math.max(0, units[id].unit_size - loss);
    }
  });

  winnerIds.forEach(id => {
    if (units[id]) {
      const loss = Math.round(units[id].unit_size * (0.15 + Math.random() * 0.1) * ratio);
      units[id].unit_size = Math.max(0, units[id].unit_size - loss);
    }
  });

  return `🏆 ${winnerIds.join(" + ")} wins!`;
}

window.runBattle = async function () {
  await loadUnits(); // make sure units are loaded

  const army1 = document.getElementById("army1").value.split(",").map(x => x.trim());
  const army2 = document.getElementById("army2").value.split(",").map(x => x.trim());
  const terrain = document.getElementById("terrain").value;
  const season = document.getElementById("season").value;
  const weather = document.getElementById("weather").value;

  const result = resolveBattle(army1, army2, terrain, season, weather);
  document.getElementById("output").textContent = result;
};

// Example usage after loadUnits()
// await loadUnits();
// const result = resolveBattle(["U1"], ["U2"], "forest", "summer", "clear");
// console.log(result);