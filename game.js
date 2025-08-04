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
        indiv[id] = null;
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

  let log = "";

  log += "=== Army 1 ===\n";
  for (let id of ids1) {
    const strength = strengths1[id];
    if (strength == null) {
      log += `❌ ${id} not found\n`;
    } else {
      log += `${id}: ${strength.toFixed(2)}\n`;
    }
  }
  log += `Total: ${total1.toFixed(2)}\n\n`;

  log += "=== Army 2 ===\n";
  for (let id of ids2) {
    const strength = strengths2[id];
    if (strength == null) {
      log += `❌ ${id} not found\n`;
    } else {
      log += `${id}: ${strength.toFixed(2)}\n`;
    }
  }
  log += `Total: ${total2.toFixed(2)}\n\n`;

  if (total1 === 0 || total2 === 0) {
    log += "❌ One side has no valid units or strength.";
    return log;
  }

  let winnerIds, loserIds, winnerTotal, loserTotal, winnerName, loserName;
  if (total1 > total2) {
    winnerIds = ids1;
    loserIds = ids2;
    winnerTotal = total1;
    loserTotal = total2;
    winnerName = "Army 1";
    loserName = "Army 2";
  } else if (total2 > total1) {
    winnerIds = ids2;
    loserIds = ids1;
    winnerTotal = total2;
    loserTotal = total1;
    winnerName = "Army 2";
    loserName = "Army 1";
  } else {
    // Draw
    ids1.concat(ids2).forEach(id => {
      if (units[id]) {
        const loss = Math.round(units[id].unit_size * 0.3);
        units[id].unit_size = Math.max(0, units[id].unit_size - loss);
      }
    });
    log += "⚔️ It's a draw! All units lost ~30% of size.";
    return log;
  }

  const ratio = loserTotal / winnerTotal;

  log += `🏆 ${winnerName} wins!\n\n`;

  log += `=== Casualties ===\n`;
  loserIds.forEach(id => {
    const unit = units[id];
    if (unit) {
      const loss = Math.round(unit.unit_size * (0.3 + Math.random() * 0.2));
      log += `💀 ${id} (${loserName}): -${loss} units\n`;
      unit.unit_size = Math.max(0, unit.unit_size - loss);
    }
  });

  winnerIds.forEach(id => {
    const unit = units[id];
    if (unit) {
      const loss = Math.round(unit.unit_size * (0.15 + Math.random() * 0.1) * ratio);
      log += `💥 ${id} (${winnerName}): -${loss} units\n`;
      unit.unit_size = Math.max(0, unit.unit_size - loss);
    }
  });

  log += `\n=== Remaining Units ===\n`;
  ids1.concat(ids2).forEach(id => {
    const unit = units[id];
    if (unit) {
      log += `${id}: ${unit.unit_size} remaining\n`;
    }
  });

  return log;
}

window.runBattle = async function () {
  await loadUnits();

  const army1Raw = document.getElementById("army1").value;
  const army2Raw = document.getElementById("army2").value;

  const ids1 = army1Raw.split(",").map(x => x.trim()).filter(Boolean);
  const ids2 = army2Raw.split(",").map(x => x.trim()).filter(Boolean);

  const terrain = document.getElementById("terrain").value;
  const season = document.getElementById("season").value;
  const weather = document.getElementById("weather").value;

  const result = resolveBattle(ids1, ids2, terrain, season, weather);
  document.getElementById("output").textContent = result;
};

// Example usage after loadUnits()
// await loadUnits();
// const result = resolveBattle(["U1"], ["U2"], "forest", "summer", "clear");
// console.log(result);