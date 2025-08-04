import json
import random

# === UNIT DEFINITIONS ===
def load_units(filename="units.json"):
    with open(filename, "r") as file:
        return json.load(file)

def save_units(units, filename="units.json"):
    with open(filename, "w") as file:
        json.dump(units, file, indent=2)
units = load_units()

# === BONUS CALCULATION ===
def get_bonus(unit, terrain, season, weather):
    bonus = 1.0
    if unit["preferred_terrain"] == "plains" and terrain == "plains":
        bonus += 0.2
    if unit["preferred_terrain"] == "plains" and terrain == "forest":
        bonus += 0.1
    if unit["preferred_terrain"] == "plains" and terrain == "taiga":
        bonus += 0.05
    if unit["preferred_terrain"] == "plains" and terrain == "mountain":
        bonus += -0.025
    if unit["preferred_terrain"] == "plains" and terrain == "desert":
        bonus += -0.025
    if unit["preferred_terrain"] == "plains" and terrain == "rainforest":
        bonus += -0.025
    if unit["preferred_terrain"] == "forest" and terrain == "forest":
        bonus += 0.2
    if unit["preferred_terrain"] == "forest" and terrain == "plains":
        bonus += 0.1
    if unit["preferred_terrain"] == "forest" and terrain == "taiga":
        bonus += 0.05
    if unit["preferred_terrain"] == "forest" and terrain == "mountain":
        bonus += -0.025
    if unit["preferred_terrain"] == "forest" and terrain == "desert":
        bonus += -0.025
    if unit["preferred_terrain"] == "forest" and terrain == "rainforest":
        bonus += -0.025
    if unit["preferred_terrain"] == "taiga" and terrain == "taiga":
        bonus += 0.2
    if unit["preferred_terrain"] == "taiga" and terrain == "forest":
        bonus += 0.1
    if unit["preferred_terrain"] == "taiga" and terrain == "tundra":
        bonus += 0.05
    if unit["preferred_terrain"] == "taiga" and terrain == "mountain":
        bonus += -0.025
    if unit["preferred_terrain"] == "taiga" and terrain == "desert":
        bonus += -0.025
    if unit["preferred_terrain"] == "taiga" and terrain == "rainforest":
        bonus += -0.025
    if unit["preferred_terrain"] == "tundra" and terrain == "tundra":
        bonus += 0.2
    if unit["preferred_terrain"] == "tundra" and terrain == "taiga":
        bonus += 0.05
    if unit["preferred_terrain"] == "tundra" and terrain == "plains":
        bonus += 0.05
    if unit["preferred_terrain"] == "tundra" and terrain == "mountain":
        bonus += -0.025
    if unit["preferred_terrain"] == "tundra" and terrain == "desert":
        bonus += -0.025
    if unit["preferred_terrain"] == "tundra" and terrain == "rainforest":
        bonus += -0.03
    if unit["preferred_terrain"] == "mountain" and terrain == "mountain":
        bonus += 0.2
    if unit["preferred_terrain"] == "mountain" and terrain == "plains":
        bonus += 0.05
    if unit["preferred_terrain"] == "mountain" and terrain == "desert":
        bonus += -0.025
    if unit["preferred_terrain"] == "mountain" and terrain == "tundra":
        bonus += -0.025
    if unit["preferred_terrain"] == "mountain" and terrain == "rainforest":
        bonus += -0.025
    if unit["preferred_terrain"] == "rainforest" and terrain == "rainforest":
        bonus += 0.2
    if unit["preferred_terrain"] == "rainforest" and terrain == "forest":
        bonus += 0.1
    if unit["preferred_terrain"] == "rainforest" and terrain == "desert":
        bonus += -0.025
    if unit["preferred_terrain"] == "rainforest" and terrain == "tundra":
        bonus += -0.03
    if unit["preferred_terrain"] == "rainforest" and terrain == "mountain":
        bonus += -0.03
    if unit["preferred_terrain"] == "desert" and terrain == "desert":
        bonus += 0.2
    if unit["preferred_terrain"] == "desert" and terrain == "plains":
        bonus += 0.075
    if unit["preferred_terrain"] == "desert" and terrain == "mountain":
        bonus += -0.025
    if unit["preferred_terrain"] == "desert" and terrain == "rainforest":
        bonus += -0.025
    if unit["climate"] == "arctic" and season == "winter":
        bonus += 0.1
    if unit["climate"] == "arctic" and season == "summer":
        bonus += -0.025
    if unit["climate"] == "arid" and season == "summer":
        bonus += 0.1
    if unit["climate"] == "arid" and season == "winter":
        bonus += -0.025
    if unit["weather"] == "clear" and weather == "clear":
        bonus += 0.05
    if unit["weather"] == "rainlight" and weather == "rainlight":
        bonus += 0.05
    if unit["weather"] == "rainlight" and weather == "rainheavy":
        bonus += 0.025
    if unit["weather"] == "rainheavy" and weather == "rainheavy":
        bonus += 0.05
    if unit["weather"] == "rainheavy" and weather == "rainlight":
        bonus += 0.05
    if unit["weather"] == "snow" and weather == "snow":
        bonus += 0.05
    if unit["weather"] == "snow" and weather == "blizzard":
        bonus += 0.025
    if unit["weather"] == "blizzard" and weather == "blizzard":
        bonus += 0.05
    if unit["weather"] == "blizzard" and weather == "snow":
        bonus += 0.025
    if unit["weather"] == "clear" and weather == "blizzard":
        bonus += -0.05
    if unit["weather"] == "clear" and weather == "snow":
        bonus += -0.025
    if unit["weather"] == "rainlight" and weather == "snow":
        bonus += -0.025
    if unit["weather"] == "rainlight" and weather == "blizzard":
        bonus += -0.05
    if unit["weather"] == "rainheavy" and weather == "blizzard":
        bonus += -0.01
    if unit["unit_type"] == "troops":
        bonus += 0.0
    if unit["unit_type"] == "heavy":
        bonus += 2
    if unit["unit_type"] == "air":
        bonus += 0.7
    if unit["unit_type"] == "naval":
        bonus += 0.0
    if unit["unit_type"] == "special":
        bonus += 0.3
    
    return bonus

# === STRENGTH CALCULATION ===
def calculate_strength(unit, terrain, season, weather):
    size = unit["unit_size"]
    base = unit["tech_level"] * unit["power_level"] * (size ** 0.5)
    bonus = get_bonus(unit, terrain, season, weather)
    rng = random.uniform(0.85, 1.15)
    return base * bonus * rng

# === BATTLE LOGIC ===
def resolve_battle(ids1, ids2, terrain, season, weather, units):
    def get_strengths(unit_ids):
        total = 0
        indiv = {}
        for uid in unit_ids:
            if uid not in units:
                print(f"❌ Unit {uid} not found.")
                continue
            strength = calculate_strength(units[uid], terrain, season, weather)
            total += strength
            indiv[uid] = strength
        return total, indiv

    total1, strengths1 = get_strengths(ids1)
    total2, strengths2 = get_strengths(ids2)

    print(f"\n📊 Army 1 total strength: {round(total1)}")
    for uid, val in strengths1.items():
        u = units[uid]
        print(f" - {uid} ({u['unit_type']}, {u['country']}): {round(val)}")

    print(f"\n📊 Army 2 total strength: {round(total2)}")
    for uid, val in strengths2.items():
        u = units[uid]
        print(f" - {uid} ({u['unit_type']}, {u['country']}): {round(val)}")

    if total1 == 0 or total2 == 0:
        return "❌ One side has no valid units or total strength is 0."

    if total1 > total2:
        winner_ids = ids1
        loser_ids = ids2
        winner_total = total1
        loser_total = total2
    elif total2 > total1:
        winner_ids = ids2
        loser_ids = ids1
        winner_total = total2
        loser_total = total1
    else:
        # Draw: 30% loss for all
        print("\n⚔️ It's a draw! Both sides suffer ~30% losses.")
        for uid in ids1 + ids2:
            if uid in units:
                unit = units[uid]
                loss = round(unit["unit_size"] * 0.3)
                unit["unit_size"] = max(0, unit["unit_size"] - loss)
                print(f" - {uid} lost {loss}, now has {unit['unit_size']}")
        return "⚔️ It's a draw!"

    ratio = loser_total / winner_total

    print("\n💥 Casualties:")
    for uid in loser_ids:
        if uid in units:
            unit = units[uid]
            loss = round(unit["unit_size"] * random.uniform(0.3, 0.5))
            unit["unit_size"] = max(0, unit["unit_size"] - loss)
            print(f" - ❌ {uid} lost {loss}, now has {unit['unit_size']}")

    for uid in winner_ids:
        if uid in units:
            unit = units[uid]
            loss = round(unit["unit_size"] * random.uniform(0.15, 0.25) * ratio)
            unit["unit_size"] = max(0, unit["unit_size"] - loss)
            print(f" - ✅ {uid} lost {loss}, now has {unit['unit_size']}")

    return f"\n🏆 {' + '.join(winner_ids)} wins!"

# === MAIN INTERFACE ===
def main():
    print("=== CALLISTAL BATTLE SIMULATOR ===\n")
    
    units = load_units()
    print("Available units:", ', '.join(units.keys()))

    ids1 = input("\nEnter units for Army 1 (comma-separated): ").strip().upper().split(",")
    ids2 = input("Enter units for Army 2 (comma-separated): ").strip().upper().split(",")
    terrain = input("Enter terrain (forest, taiga, rainforest, desert, plains, tundra, mountain): ").strip().lower()
    season = input("Enter season (summer or winter): ").strip().lower()
    weather = input("Enter weather (clear, clouds, rainlight, rainheavy, snow, haillight, hailheavy, blizzard): ").strip().lower()

    result = resolve_battle(ids1, ids2, terrain, season, weather, units)
    print(result)
    try:
        save_units(units, filename="units.json")
        print("Units saved successfully.")
    except Exception as e:
        print(f"Failed to save units!")

# === RUN THE PROGRAM ===
if __name__ == "__main__":
    main()