/* Chapter 1 — Airplane General, Emergency Equipment, Doors, Windows
   Source: NCA B747-8F Airplane Operations Manual, Chapter 1 (Rev 112, bulletins eff. 1 Oct 2026).
   Inline markup: [[NAME]] = panel nomenclature, {{MSG}} = EICAS message. */
window.B748 = window.B748 || { chapters: {} };
B748.chapters[1] = {
  num: 1,
  title: "Airplane General, Emergency Equipment, Doors, Windows",
  short: "Airplane General",
  source: "AOM Chapter 1 · Rev 112 · bulletins eff. 1 Oct 2026",
  sections: [

  /* ───────────────────────── 1. DIMENSIONS ───────────────────────── */
  {
    id: "dimensions", title: "Dimensions and Turning", ref: "1.10",
    summary: "Principal dimensions, turning radii and the obstacle clearance rule for ground turns.",
    blocks: [
      { t: "facts", items: [
        ["224′ 5″", "Wingspan · 68.4 m"],
        ["250′ 2″", "Overall length · 76.3 m"],
        ["63′ 6″", "Tail height · 19.4 m"],
        ["170 ft", "Wingtip turning radius · 51.8 m"],
        ["172 ft", "Pavement for 180° turn · 52.4 m"],
        ["70°", "Nose gear steering angle"]
      ]},
      { t: "widget", id: "dims" },
      { t: "h", text: "Turning radius" },
      { t: "p", html: "The wingtip swings the largest arc in a turn, so it sets the minimum obstacle clearance path. Every other part of the structure stays inside the wingtip arc." },
      { t: "widget", id: "turn" },
      { t: "table", head: ["Point", "Radius"], rows: [
        ["Nose", "126 ft (38.4 m)"],
        ["Tail", "150 ft (45.7 m)"],
        ["Wingtip", "170 ft (51.8 m)"],
        ["Minimum pavement width, 180° turn", "172 ft (52.4 m)"]
      ]},
      { t: "p", html: "These figures assume the minimum turning radius condition: a slow, continuous turn with minimum thrust on all engines, no differential braking, and body gear steering operating. Nose gear steering angle is 70°." },
      { t: "note", k: "caution", html: "Do not attempt to make a turn away from an obstacle within 15 feet (4.6 m) of the wing tip or within 59 feet (18.0 m) of the nose." }
    ]
  },

  /* ───────────────────────── 2. FLIGHT DECK PANELS ───────────────────────── */
  {
    id: "panels", title: "Flight Deck Panels", ref: "1.20–1.30",
    summary: "Where each panel sits, which chapter covers it, the centre panel placards, and how Boeing push-button switches show their state.",
    blocks: [
      { t: "p", html: "The AOM panel pages are an index: circled numbers on each panel point to the chapter that describes that control. Tap a panel below to see what it holds and where to read about it. The illustrations are representative and may not match the latest configuration exactly; the system description chapters hold the current information." },
      { t: "widget", id: "panelMap" },
      { t: "note", k: "note", html: "Do not touch glass displays with bare hands. This can damage the coating." },
      { t: "h", text: "Centre panel placards" },
      { t: "table", head: ["Flap position", "Placard limit"], cls: "num", rows: [
        ["1", "285 K"], ["5", "265 K"], ["10", "245 K"], ["20", "235 K"], ["25", "210 K"], ["30", "185 K"]
      ]},
      { t: "table", head: ["Landing gear", "Limit"], cls: "num", rows: [
        ["Retract", "270 K / M.82"], ["Extend", "270 K / M.82"], ["Extended", "320 K / M.82"]
      ]},
      { t: "h", text: "Multifunction display formats" },
      { t: "table", head: ["MFD format", "Chapter"], rows: [
        ["Secondary engine display", "7 · Engines, APU"],
        ["Status display (hydraulic, APU and oxygen indications, status messages)", "15 · Warning Systems"],
        ["ELEC synoptic", "6 · Electrical"],
        ["HYD synoptic", "13 · Hydraulics"],
        ["FUEL synoptic", "12 · Fuel"],
        ["DRS (doors) synoptic", "1 · Airplane General"],
        ["ECS synoptic", "2 · Air Systems"],
        ["GEAR synoptic", "14 · Landing Gear"],
        ["FCTL synoptic", "9 · Flight Controls"]
      ]},
      { t: "h", text: "Push-button switches" },
      { t: "p", html: "There are two types, alternate action and momentary action. Both draw attention to system status and faults." },
      { t: "ctrl", name: "Alternate action switch", where: "Throughout", ref: "1.30.1", pos: [
        ["On", "Pushed in, flush with the panel. A mechanical shutter on one half opens to show an illuminated legend such as ON, AUTO or a flow bar."],
        ["Off", "Pushed out, extended. The shutter closes and the legend is hidden. A line means that half of the switch has no label."],
        ["Status half", "Many switches light the other half to show system state, for example PRESS, FAIL, INOP, OFF, MAN or VALVE."]
      ]},
      { t: "ctrl", name: "Momentary action switch", where: "Throughout", ref: "1.30.2", pos: [
        ["Push", "Spring-loaded to extended. Activates or deactivates a system, or resets system logic (for example the master WARNING/CAUTION reset). The switch display shows system status."]
      ]},
      { t: "note", k: "caution", html: "Flight crews should not change switch bulbs. Contact maintenance whenever a bulb needs changing. Changing bulbs with the system powered can cause damage, and bulb changes on the mode control panel may affect system operation in flight." },
      { t: "ctrl", name: "GND TESTS switch", where: "Overhead maintenance panel", ref: "1.30.21", pos: [
        ["ENABLE", "Allows the Central Maintenance Computer to initiate ground tests of airplane systems."],
        ["NORM", "Guard closed. Systems configured for flight."]
      ]}
    ]
  },

  /* ───────────────────────── 3. FLIGHT DECK LIGHTING ───────────────────────── */
  {
    id: "fdlights", title: "Flight Deck Lighting", ref: "1.30.3 · 1.40.3",
    summary: "Panel, flood, dome and localized lighting, what the storm switch overrides, and lighting on standby power.",
    blocks: [
      { t: "p", html: "Flood lights and light plates illuminate the panels. Dome lights provide area lighting. Each pilot has a chart light and a utility light, and map lights provide localized illumination." },
      { t: "h", text: "Storm lights and power loss" },
      { t: "ctrl", name: "STORM lights switch", where: "Overhead panel", ref: "1.30.3", pos: [
        ["ON", "Overrides the normal controls and lights these at maximum brightness: captain's and first officer's (forward panel flood) lights, glareshield lights, aisle stand flood lights, and dome lights."]
      ]},
      { t: "p", html: "If normal electrical power is lost, the flood lights run from standby power. If normal power to the aisle stand integral panel lights is lost, the aisle stand flood light comes on at reduced intensity." },
      { t: "h", text: "Overhead panel controls" },
      { t: "ctrl", name: "CKT BKR / OVHD PANEL lights control", where: "Overhead panel", ref: "1.30.4", pos: [
        ["Rotate", "Circuit breaker panel and overhead panel brightness."]
      ]},
      { t: "ctrl", name: "GLARESHIELD PANEL/FLOOD lights control", where: "Overhead panel", ref: "1.30.4", pos: [
        ["Inner", "Left and right glareshield flood lights."],
        ["Outer", "Glareshield panel and standby magnetic compass lights."]
      ]},
      { t: "ctrl", name: "DOME lights control", where: "Overhead panel", ref: "1.30.5", pos: [
        ["Rotate", "Dome light brightness. Overridden by the storm lights switch."]
      ]},
      { t: "ctrl", name: "AISLE STAND PANEL/FLOOD lights control", where: "Overhead panel", ref: "1.30.5", pos: [
        ["Inner", "Aisle stand flood light brightness."],
        ["Outer", "Aisle stand panel light brightness. Overridden by the storm lights switch."]
      ]},
      { t: "ctrl", name: "IND LTS switch", where: "Overhead panel", ref: "1.30.6", pos: [
        ["TEST", "Spring-loaded. All annunciator lights to full brightness for 10 seconds to check the bulbs, then dims them for as long as the switch is held."],
        ["BRT", "All illuminated annunciator lights at full brightness."],
        ["DIM", "All illuminated annunciator lights at low brightness."]
      ]},
      { t: "h", text: "Glareshield and sidewall controls" },
      { t: "ctrl", name: "Captain's PANEL light controls", where: "Glareshield", ref: "1.30.6", pos: [
        ["Inner", "Captain's and centre panel floodlights. Overridden by the storm switch."],
        ["Outer", "Captain's main panel, left side of the centre panel, and captain's lower auxiliary panel lighting."]
      ]},
      { t: "ctrl", name: "First officer's PANEL light controls", where: "Glareshield", ref: "1.30.7", pos: [
        ["Inner", "First officer's panel floodlights. Overridden by the storm switch."],
        ["Outer", "First officer's main panel, right side of the centre panel, and first officer's lower auxiliary panel lighting."]
      ]},
      { t: "ctrl", name: "MAP light controls", where: "Glareshield (each pilot)", ref: "1.30.8", pos: [
        ["Pull / rotate", "Respective pilot's map light brightness."]
      ]},
      { t: "ctrl", name: "CHART LIGHT controls", where: "Pilot sidewalls", ref: "1.30.8", pos: [
        ["Pull / rotate", "Respective pilot's chart light brightness."]
      ]},
      { t: "ctrl", name: "First observer MAP and PANEL lights", where: "First observer sidewall", ref: "1.30.8", pos: [
        ["MAP", "Pull and rotate for the first observer's map light."],
        ["PANEL", "Rotate for the first observer's panel lights."]
      ]},
      { t: "h", text: "Access and crew rest lighting" },
      { t: "ctrl", name: "FLIGHT DECK ACCESS LTS switches", where: "Upper deck cabin services module, upper deck door, overhead maintenance panel, Main Equipment Center lower hatch", ref: "1.30.9", pos: [
        ["Push (any switch)", "With the ground handling bus powered, lights the path to or from the flight deck: Main Equipment Center lights, the left sidewall light forward of Door 1L, the threshold light at Door 1L, upper deck lights above the crew access ladder, and upper deck dome lights."],
        ["Push again", "Extinguishes the access path lighting."]
      ]},
      { t: "note", k: "fr", html: "The access path runs from the Main Equipment Center and Door 1L on the main deck, up the crew access ladder, to the upper deck. That is why one main deck sidewall light and the ceiling light beside the ladder opening double as flight deck access lights." },
      { t: "ctrl", name: "CREW REST LTS-RH / LTS-LH", where: "Crew rest, inside partition", ref: "1.30.9", pos: [
        ["White", "Respective side crew rest lights are off."],
        ["Push", "Turns on that side's crew rest lights."]
      ]},
      { t: "ctrl", name: "CRW RST LIGHTS and RDG LIGHT", where: "Crew rest, left and right bunks", ref: "1.30.10", pos: [
        ["CRW RST LIGHTS", "White = bunk area lights off. Push to turn on the bunk area lights."],
        ["RDG LIGHT", "White = reading lights off. Push to turn on the bunk reading lights."]
      ]}
    ]
  },

  /* ───────────────────────── 4. MAIN DECK & UPPER DECK LIGHTING ───────────────────────── */
  {
    id: "decklights", title: "Nose, Main Deck and Upper Deck Lighting", ref: "1.30.11 · 1.40.4",
    summary: "Cargo compartment lighting at the nose door panel, the threshold and nose spot lights, and the upper deck cabin services module.",
    blocks: [
      { t: "h", text: "Nose light controls" },
      { t: "p", html: "These four toggles sit on the nose cargo door control panel, below the door controls." },
      { t: "ctrl", name: "THRESHOLD light switch", where: "Nose cargo door control panel", ref: "1.30.11", pos: [
        ["ON", "Lights the two cargo loading ramp lights on the nose cargo door."]
      ]},
      { t: "ctrl", name: "SIDEWALL light switch", where: "Nose cargo door control panel", ref: "1.30.11", pos: [
        ["ON", "Lights the sidewall lights in the main deck cargo area."]
      ]},
      { t: "ctrl", name: "CEILING light switch", where: "Nose cargo door control panel", ref: "1.30.11", pos: [
        ["ON", "Lights the ceiling lights in the main deck cargo area."]
      ]},
      { t: "ctrl", name: "NOSE SPOT LIGHT switch", where: "Nose cargo door control panel", ref: "1.30.12", pos: [
        ["ON", "Lights the nose cargo door spot light."]
      ]},
      { t: "h", text: "How the main deck lights work" },
      { t: "ul", items: [
        "<b>Threshold lights.</b> Two loading ramp lights on the inside of the nose cargo door. They only illuminate with the nose door in the full open position, when they are exposed and light the ramp below the raised nose.",
        "<b>Sidewall lights.</b> Spaced along both sides of the main deck cargo compartment, lighting the sidewall and adjacent floor. The forward left sidewall light is also a flight deck access light.",
        "<b>Ceiling lights.</b> Along the ceiling centreline from the crew ladder to the aft end of the compartment. The one next to the crew ladder opening is also a flight deck access light, and the seven forward ceiling lights also act as threshold lights.",
        "<b>Nose spot light.</b> In the lower left side of the nose cargo door. With the door closed it lights the forward main deck. It is used with the mirror to verify the end locks are raised when cargo is loaded in the forward location."
      ]},
      { t: "note", k: "fr", html: "The main deck ceiling lights are also the visual half of the main deck alert system. They flash on alert triggers and when FASTEN SEAT BELTS is selected ON. See Signs and Main Deck Alert." },
      { t: "h", text: "Upper deck cabin services module" },
      { t: "ctrl", name: "CEILING LTS UPPER DECK", where: "Upper deck cabin services module", ref: "1.30.12", pos: [
        ["Push", "Turns on the upper deck ceiling lights. White light confirms the selection."]
      ]},
      { t: "ctrl", name: "SIDEWALL LTS UPPER DECK", where: "Upper deck cabin services module", ref: "1.30.12", pos: [
        ["Push", "Turns on the upper deck sidewall lights. White light confirms the selection."]
      ]},
      { t: "ctrl", name: "SIDEWALL LTS MAIN DECK", where: "Upper deck cabin services module", ref: "1.30.12", pos: [
        ["Push", "Turns on the main deck sidewall lights. White light confirms the selection."]
      ]},
      { t: "ctrl", name: "CEILING LTS MAIN DECK", where: "Upper deck cabin services module", ref: "1.30.12", pos: [
        ["Push", "Turns on the main deck ceiling lights. White light confirms the selection."]
      ]},
      { t: "ctrl", name: "DOME LIGHTS", where: "Upper deck cabin services module", ref: "1.30.13", pos: [
        ["Push", "Turns on the dome light at the upper deck door and the ceiling dome light. White light confirms the selection."]
      ]},
      { t: "p", html: "The module also carries the cabin [[EMERGENCY LIGHTS]] switch and a [[FLIGHT DECK ACCESS LTS]] switch, covered in their own sections." },
      { t: "p", html: "Service lights are fitted at work areas such as the wheel wells, with switches at each service area." }
    ]
  },

  /* ───────────────────────── 5. EXTERIOR LIGHTING ───────────────────────── */
  {
    id: "extlights", title: "Exterior Lighting", ref: "1.30.13 · 1.40.1",
    summary: "Every exterior light, where it is, and the gear lever and air/ground logic that dims or inhibits it.",
    blocks: [
      { t: "p", html: "Exterior lighting covers the landing, runway turnoff, taxi, strobe, beacon, navigation, marker, logo and wing illumination lights, plus the escape slide emergency lights. Try the switches below; the gear lever and air/ground mode change what you get." },
      { t: "widget", id: "extLights" },
      { t: "h", text: "Switches" },
      { t: "ctrl", name: "OUTBD and INBD LANDING light switches", where: "Overhead panel", ref: "1.30.13", pos: [
        ["ON (L or R)", "Lights the respective wing landing light. Full intensity only with the landing gear lever DOWN."]
      ]},
      { t: "ctrl", name: "RWY TURNOFF light switches", where: "Overhead panel", ref: "1.30.14", pos: [
        ["ON (L or R)", "Lights the respective runway turnoff light. Extinguishes when air/ground sensing is in air mode."]
      ]},
      { t: "ctrl", name: "TAXI lights switch", where: "Overhead panel", ref: "1.30.14", pos: [
        ["ON", "Lights the two taxi lights on the nose landing gear. Extinguishes when air/ground sensing is in air mode."]
      ]},
      { t: "ctrl", name: "BEACON lights switch", where: "Overhead panel", ref: "1.30.15", pos: [
        ["LWR", "Lower red anti-collision beacon only."],
        ["BOTH", "Upper and lower red anti-collision beacons."]
      ]},
      { t: "ctrl", name: "NAV lights switch", where: "Overhead panel", ref: "1.30.15", pos: [
        ["ON", "Red, green and white navigation lights, plus the white wingtip marker lights."]
      ]},
      { t: "ctrl", name: "STROBE, WING and LOGO light switches", where: "Overhead panel", ref: "1.30.15", pos: [
        ["STROBE ON", "Strobe lights."],
        ["WING ON", "Wing leading edge illumination lights."],
        ["LOGO ON", "Logo lights."]
      ]},
      { t: "h", text: "Light by light" },
      { t: "table", head: ["Light", "Location and logic"], rows: [
        ["Landing", "Two in the leading edge of each wing. Bright with the gear lever DOWN and switches ON; dimmed with switches ON and the gear lever not DOWN."],
        ["Runway turnoff", "Two on the nose gear structure, aimed about 65° left and right of the centreline. Ground mode only."],
        ["Taxi", "On the nose landing gear. Ground mode only."],
        ["Strobe", "White anti-collision strobes on each forward wingtip and the tail cone."],
        ["Beacon", "Red anti-collision strobes on the top and bottom of the fuselage."],
        ["Navigation", "Red (left forward wingtip), green (right forward wingtip), white (tail cone)."],
        ["Marker", "Aft-facing, on the underside of each wingtip. Light the wingtip area on the ground."],
        ["Logo", "On the stabilizer, lighting the logo on the vertical tail."],
        ["Wing", "On the fuselage, lighting the wings and engine nacelles."]
      ]}
    ]
  },

  /* ───────────────────────── 6. EMERGENCY LIGHTING ───────────────────────── */
  {
    id: "emerlights", title: "Emergency Lighting", ref: "1.30.15 · 1.40.5",
    summary: "The two emergency lights switches, automatic operation on DC power loss, battery endurance and the EMER LIGHTS advisory.",
    blocks: [
      { t: "facts", items: [
        ["15 min", "Minimum endurance, fully charged battery"],
        ["DC bus 4", "Keeps the remote batteries charged"],
        ["ARMED", "Normal flight deck switch position"]
      ]},
      { t: "widget", id: "emerLights" },
      { t: "ctrl", name: "Flight deck EMER LIGHTS switch", where: "Overhead panel", ref: "1.30.15", pos: [
        ["OFF", "Prevents emergency lights operation if airplane electrical power fails or is turned off."],
        ["ARMED", "Guard closed. All emergency lights illuminate if airplane electrical power fails or is turned off."],
        ["ON", "All emergency lights illuminate."]
      ]},
      { t: "ctrl", name: "Cabin EMERGENCY LIGHTS switch", where: "Upper deck cabin services module", ref: "1.30.16", pos: [
        ["Push (red)", "All emergency lights illuminate, bypassing the flight deck switch."],
        ["Push (extinguished)", "All emergency lights extinguish."]
      ]},
      { t: "h", text: "System" },
      { t: "ul", items: [
        "<b>Interior:</b> door, aisle and exit lights, and luminescent exit signs. Separate battery-powered exit identifier lights are at each cabin exit.",
        "<b>Exterior:</b> an escape slide light and a light below the crew service door that lights the inertia reel landing zone (two places).",
        "<b>Automatic operation:</b> with the system armed, the lights come on if DC power fails or is turned off.",
        "<b>Cabin override:</b> the switch on the upper deck cabin services module activates the system regardless of the flight deck switch position.",
        "<b>Power:</b> remote batteries, kept charged by DC bus 4. A fully charged battery gives at least 15 minutes.",
        "<b>Main deck entry door:</b> its threshold lights illuminate when the emergency lights are activated."
      ]},
      { t: "eicas", rows: [
        ["EMER LIGHTS", "Advisory", "", "Emergency lights switch ARMED and emergency lights on, or emergency lights switch not armed."]
      ]}
    ]
  },

  /* ───────────────────────── 7. SIGNS & MAIN DECK ALERT ───────────────────────── */
  {
    id: "signs", title: "Signs and Main Deck Alert", ref: "1.30.2 · 1.40.3 · 1.45.1",
    summary: "Seat belt sign logic, the main deck alert lights and horns, and how both tie in to supernumerary oxygen.",
    blocks: [
      { t: "p", html: "The freighter's \"cabin\" is the supernumerary area. The seat belt signs serve them, and the main deck alert system reaches anyone on the main cargo deck with flashing ceiling lights and pulsing horns. Move the cabin altitude slider below to see all three systems react together." },
      { t: "widget", id: "cabinAlt" },
      { t: "h", text: "Controls" },
      { t: "ctrl", name: "SEATBELTS selector", where: "Aft aisle stand", ref: "1.30.3", pos: [
        ["OFF", "FASTEN SEAT BELTS and RETURN TO SEAT signs off."],
        ["AUTO", "Signs controlled by altitude and configuration (see logic below)."],
        ["ON", "FASTEN SEAT BELTS and RETURN TO SEAT signs on, and the main deck ceiling lights flash for several seconds."]
      ]},
      { t: "note", k: "note", html: "Any time supernumerary oxygen deploys, the FASTEN SEAT BELTS signs come on and the RETURN TO SEAT signs go off, whatever the selector position." },
      { t: "ctrl", name: "MAIN DECK ALERT switch", where: "Aft aisle stand", ref: "1.30.16", pos: [
        ["Push", "Flashes the main deck ceiling lights and sounds the main deck aural for several seconds. The ON light shows the system is active, then goes out after several seconds when it deactivates."]
      ]},
      { t: "h", text: "FASTEN SEAT BELTS logic in AUTO" },
      { t: "p", html: "The signs illuminate when any one of these is true:" },
      { t: "ul", items: [
        "landing gear not up and locked",
        "flap lever not up",
        "airplane altitude below 10,300 feet",
        "cabin altitude above 10,000 feet"
      ]},
      { t: "ul", items: [
        "With the selector OFF and oxygen ON, the FASTEN SEAT BELTS signs still illuminate.",
        "RETURN TO SEAT signs illuminate with FASTEN SEAT BELTS, except when oxygen is deployed.",
        "A low tone sounds over the PA whenever the FASTEN SEAT BELTS signs come on or go off."
      ]},
      { t: "h", text: "Main deck alert system" },
      { t: "p", html: "Visual and aural alerts on the main cargo deck tell supernumeraries to return to their seats and/or don portable oxygen in case of fire, smoke, depressurization or turbulence. The visual alert is flashing ceiling lights; the aural alert is pulsing horns. Alerts last several seconds." },
      { t: "table", head: ["Trigger", "Ceiling lights flash", "Horns"], rows: [
        ["Cabin altitude reaches 10,000 ft", "Yes", "Yes"],
        ["Smoke detected in the main deck", "Yes", "Yes"],
        ["SUPRNMRY OXY switch selected ON", "Yes", "Yes"],
        ["MAIN DECK ALERT switch selected ON", "Yes", "Yes"],
        ["FASTEN SEAT BELTS selected ON", "Yes", "No"]
      ]},
      { t: "eicas", rows: [
        ["SEATBELTS OFF", "Memo", "", "SEATBELTS selector in OFF position in flight."],
        ["SEATBELTS ON", "Memo", "", "FASTEN BELTS signs manually selected ON."]
      ]}
    ]
  },

  /* ───────────────────────── 8. OXYGEN ───────────────────────── */
  {
    id: "oxygen", title: "Oxygen", ref: "1.30.17 · 1.40.7 · 1.45.3",
    summary: "Crew quick-donning masks and regulators, the supernumerary system and its tail-specific effects, and portable bottles.",
    blocks: [
      { t: "p", html: "There are two independent systems, one for the flight crew and one for the supernumeraries, plus portable cylinders in the cabin for emergency use. Both cylinder pressures show on the EICAS STATUS page." },
      { t: "facts", items: [
        ["~14,000 ft", "Cabin altitude, supernumerary masks drop"],
        ["12,000 ft", "Below this, RESET closes the flow control unit"],
        ["STAT", "Oxygen pressures on the status page"]
      ]},
      { t: "h", text: "Flight crew oxygen" },
      { t: "p", html: "Each crew station has a quick-donning diluter-demand mask. An automatic pressure-breathing regulator on each mask controls flow. After donning, pull the goggle nose piece away from the face to remove the goggles; push them back until they click to replace them." },
      { t: "widget", id: "crewOxy" },
      { t: "ctrl", name: "OXY PR display", where: "EICAS STATUS page", ref: "1.30.17", pos: [
        ["", "Crew and supernumerary (PASS) oxygen cylinder pressure in PSI. Selected with the STAT switch on the display select panel."]
      ]},
      { t: "ctrl", name: "NORMAL / 100% switch", where: "Mask regulator", ref: "1.30.18", pos: [
        ["N", "Air/oxygen mixture on demand. The ratio depends on cabin altitude."],
        ["100%", "100% oxygen on demand, no air mixed in."]
      ]},
      { t: "ctrl", name: "EMERGENCY / test selector", where: "Mask regulator", ref: "1.30.18", pos: [
        ["Normal", "Air/oxygen mixture or 100% on demand, as set by the N/100% switch."],
        ["EMERGENCY", "Rotate in the arrow direction. 100% oxygen under positive pressure at all cabin altitudes, protecting against smoke and harmful vapours. Also used to purge contaminants and clear fogging from the mask lens."],
        ["PRESS TO TEST", "Tests the positive pressure supply to the regulator."]
      ]},
      { t: "note", k: "caution", html: "EMER mode depletes oxygen faster than 100% or NORM. Use EMER only as conditions require." },
      { t: "note", k: "note", html: "Communication in EMER mode may be difficult. Switch to 100% or NORM if conditions allow." },
      { t: "ctrl", name: "Oxygen mask release levers", where: "Mask stowage box", ref: "1.30.19", pos: [
        ["Squeeze and pull", "Unlocks the stowage box doors and releases the mask. Oxygen turns on when the doors open. The flow indicator shows a yellow cross momentarily as the harness inflates. Opening the left door activates the mask microphone."],
        ["Squeeze (right lever)", "Inflates the mask harness."],
        ["Release", "Deflates the harness onto the head and face."]
      ]},
      { t: "ctrl", name: "Oxygen flow indicator", where: "Mask stowage box", ref: "1.30.19", pos: [
        ["Yellow cross", "Oxygen flowing."]
      ]},
      { t: "ctrl", name: "RESET / TEST switch", where: "Mask stowage box, left door", ref: "1.30.20", pos: [
        ["Push, OXY ON not shown", "With the left door closed, turns oxygen on momentarily to test the regulator."],
        ["Push, OXY ON shown", "With the left door closed, turns oxygen off, deactivates the mask microphone and activates the boom microphone."]
      ]},
      { t: "ctrl", name: "OXY ON flag", where: "Mask stowage box, near the left door", ref: "1.30.20", pos: [
        ["In view", "Oxygen supply valve open; oxygen is on."]
      ]},
      { t: "note", k: "note", html: "During the preflight mask check, a pressure decrease may mean the crew oxygen cylinder shutoff valve is closed and oxygen is unavailable." },
      { t: "p", html: "To shut the system off, close the left-hand stowage box door and push and release [[RESET/TEST]]. That shuts off oxygen to the mask, stows the flag, deactivates the mask mic and activates the boom mic. Opening the left door again reactivates oxygen." },
      { t: "h", text: "Donning" },
      { t: "note", k: "note", html: "Remove the headset entirely before donning the mask, to avoid interference between headset and mask." },
      { t: "steps", items: [
        "Grasp and squeeze the regulator's red inflation levers to remove the mask from the stowage box.",
        "Pull the mask out and away from the box, making sure there is plenty of hose extension.",
        "Face inboard to stay clear of flight deck obstructions. Place the inflated harness behind your head with the lower harness tube near the neck. You may need to tilt your head.",
        "With the harness tight to the back of the head, bring the mask down and away from the face, forehead to chin.",
        "Release the inflation levers and guide the mask onto the face.",
        "Adjust for a comfortable, snug fit."
      ]},
      { t: "h", text: "Stowing" },
      { t: "note", k: "warning", html: "During mask stowage, do not push the red inflation lever on the demand regulator. This inflates the harness and can prevent proper deployment later. If the harness inflates during stowage, release the lever to vent the oxygen and start the stowage again." },
      { t: "steps", items: [
        "Fully extend the supply hose from the box. If the system is charged you will hear oxygen filling the hose.",
        "Rotate the mask so the hose is not twisted on itself.",
        "Check the supply hose, microphone cable and harness for damage. The cross straps should cover the manufacturer's location marks on the harness.",
        "Set the regulator to 100% (press the N/100% rocker) and turn the EMERGENCY knob counterclockwise to off.",
        "Coil the hose slack into the recess in the bottom of the box in a figure-eight. Do not tangle or twist it.",
        "Lay the rest of the hose leading to the mask against the side of the box with the retainer mechanism, and press the coil down gently.",
        "Hold the mask by the regulator, goggles end first, with harness, retainer strap and clip, and hose between the face piece and the retainer side of the box.",
        "Make sure the harness is fully deflated and hangs freely.",
        "Engage the retainer strap clip in the retainer mechanism until it clicks.",
        "Insert harness and goggles, then face piece and regulator, without trapping the harness inside the goggles or face piece. Guide the hose down the centre at the same time.",
        "Continue inserting regulator and hose, keeping the hose centred and the lens clear of the box.",
        "Guide the regulator stowage tabs into the box clip stop until they click.",
        "Confirm the dilution control is at 100% (toggle down) and the safety button is in normal (rotated counterclockwise).",
        "Close the doors without catching the hose or retainer strap. The retainer clip should be visible and fully engaged.",
        "Push and release PRESS TO TEST AND RESET on the left door. If charged, you will hear oxygen venting from the hose. Confirm the OXY ON flag disappears.",
        "Press and release PRESS TO TEST on the regulator."
      ]},
      { t: "note", k: "warning", html: "Do not trap the harness inside the goggles or face piece. Do not stow the mask without engaging the retainer clip; a clip that is not fully engaged may prevent the mask from deploying." },
      { t: "note", k: "note", html: "If a lot of hose is left outside the box doors, do not push it in. Remove the mask and repack it." },
      { t: "h", text: "Supernumerary oxygen" },
      { t: "ctrl", name: "SUPRNMRY OXY switch", where: "Overhead panel", ref: "1.30.17", pos: [
        ["RESET", "Spring-loaded toggle. Closes the flow control unit electrically when cabin altitude is below 12,000 feet."],
        ["NORM", "Guard closed. System activates if cabin altitude reaches about 14,000 feet."],
        ["ON", "Spring-loaded toggle. Supernumerary oxygen masks drop."]
      ]},
      { t: "ul", items: [
        "Supplied by bottled gaseous oxygen, feeding oxygen boxes in the passenger and lavatory service units above the supernumerary seats.",
        "Masks drop automatically above about 14,000 feet cabin altitude, or manually with the switch at ON.",
        "Flow to a mask starts when the mask or its streamer is pulled down.",
        "When a mask is no longer needed, set the manifold toggle valve in that oxygen box to CLOSE. This saves oxygen and increases flow to masks still in use.",
        "Select RESET on the overhead switch to reset oxygen flow."
      ]},
      { t: "note", k: "eff", html: "<b>JA15KZ – JA18KZ:</b> when the masks deploy, ceiling lights flash and an aural tone sounds in the crew rest for several seconds.<br><b>JA11KZ – JA14KZ:</b> when the masks deploy, main deck ceiling lights flash and the crew rest ceiling lights illuminate." },
      { t: "h", text: "Portable oxygen" },
      { t: "p", html: "Portable and walk-around bottles are stowed in the supernumerary area. Portable bottles have a disposable mask and safety straps and are for first aid. Walk-around bottles have a full face mask and a larger bottle." },
      { t: "eicas", rows: [
        ["CREW OXY LOW", "Advisory", "", "Crew oxygen pressure low."],
        ["SUPRNRY OXY LO", "Advisory", "", "Supernumerary oxygen pressure low."],
        ["SUPRNMRY OXY ON", "Advisory", "", "Supernumerary oxygen system activated."]
      ]}
    ]
  },

  /* ───────────────────────── 9. EMERGENCY EQUIPMENT ───────────────────────── */
  {
    id: "emerequip", title: "Emergency Equipment", ref: "1.30.20 · 1.45 · 1.50.4",
    summary: "ELTs, fire extinguishers, flashlights, and the escape devices and harnesses for the overhead hatch and upper deck door.",
    blocks: [
      { t: "h", text: "Emergency locator transmitters" },
      { t: "ctrl", name: "ELT switch", where: "Overhead panel", ref: "1.30.20", pos: [
        ["ON", "Transmits the emergency locator signal."],
        ["ARMED", "Guard closed. Transmits if activated by high deceleration forces."],
        ["RESET", "Spring-loaded toggle. Ends transmission."]
      ]},
      { t: "ul", items: [
        "<b>Fixed ELT:</b> fuselage-mounted on the main deck aft overhead. Activates on high deceleration or with the switch ON.",
        "<b>To deactivate:</b> move the switch to RESET momentarily (between 1 and 3 seconds), then back to ARMED.",
        "<b>Supernumerary area:</b> one ELT on the upper deck closet exterior wall, across from the upper deck crew service door."
      ]},
      { t: "eicas", rows: [
        ["ELT ON", "Advisory", "", "The emergency locator transmitter is on."]
      ]},
      { t: "h", text: "Fire extinguishers" },
      { t: "p", html: "Chemical and water extinguishers are on the flight deck, in the supernumerary area and in the main deck cargo area. Directions for use are printed on each extinguisher." },
      { t: "ul", items: [
        "<b>Chemical:</b> liquefied gas agent under pressure that vaporizes on release. Effective on all fire types, used mainly on electrical, fuel and grease fires. The pressure indicator shows acceptable, recharge and overcharged ranges. A safety pin with pull ring prevents accidental discharge.",
        "<b>Water:</b> water with antifreeze, for fabric or paper fires only. To use, remove from stowage, rotate the handle fully clockwise, aim at the base of the fire and press the trigger."
      ]},
      { t: "note", k: "warning", html: "If a chemical fire extinguisher is to be discharged in the flight deck area, all flight crew members must wear oxygen masks and use 100% oxygen with EMERGENCY selected." },
      { t: "note", k: "caution", html: "For electrical fires, remove the power source as soon as possible. Avoid discharging directly on persons because of possible suffocating effects. Do not discharge too close to the fire, as the stream may scatter it. Keep away from the fuel source and avoid breathing vapours, fumes and heated smoke." },
      { t: "note", k: "warning", html: "The water extinguisher contains antifreeze, which makes it unfit for drinking. Do not use it on electrical or grease fires." },
      { t: "h", text: "Flashlights" },
      { t: "p", html: "High-intensity flashlights are stowed throughout the airplane. They switch on automatically when removed from the bracket and only go off when put back. The batteries are not rechargeable." },
      { t: "table", head: ["Condition light", "Meaning"], rows: [
        ["One green flash on test", "Normal battery charge"],
        ["One red flash on test", "Replace the battery"],
        ["Flashes every 10 seconds", "Battery at end of life"]
      ]},
      { t: "h", text: "Escape devices and harnesses" },
      { t: "ul", items: [
        "<b>Eight emergency escape devices</b> are stowed next to the flight deck overhead hatch. Remove one from its holder and exit through the overhead hatch or the upper deck door while holding the handle. Inertia reels limit the descent speed.",
        "An escape device can also be used to evacuate over the slide if the airplane tips tail down.",
        "<b>One emergency descent harness per escape device</b> is stowed in the upper deck cabin. Don the garment, attach its hook to the fastening ring on an escape device handle, and leave through the overhead hatch or upper deck door."
      ]},
      { t: "note", k: "warning", html: "Make sure the descent device is securely fastened to the airplane by pulling sharply on the lanyard before exiting." },
      { t: "steps", items: [
        "Don the garment with the buckles forward.",
        "Put the black strap over the shoulder and tighten.",
        "Tighten the strap.",
        "Hook the snap on the end of the strap to the escape reel.",
        "Hold onto the escape reel and exit through the overhead hatch, using the seats as footholds. Avoid straddling other lines.",
        "On the ground, unhook the red strap and move to a safe area before removing the garment."
      ]},
      { t: "note", k: "note", html: "If evacuating into water, don the garment before the life vest. Do not inflate the vest inside the airplane." }
    ]
  },

  /* ───────────────────────── 10. DOORS & EXITS ───────────────────────── */
  {
    id: "doors", title: "Doors and Exits", ref: "1.30.22 · 1.50.1",
    summary: "The freighter's door inventory, the doors synoptic and EICAS messages, the upper deck door and slide, the overhead hatch and the crew ladder.",
    blocks: [
      { t: "p", html: "The 747-8F has one main deck entry door, one upper deck door and five cargo doors (three lower, the side cargo door and the nose cargo door). It also has two electrical and electronic (E/E) equipment access doors and one flight deck overhead hatch." },
      { t: "note", k: "caution", html: "Do not operate the entry or cargo doors with winds at the door of more than 40 knots. Do not keep doors open when wind gusts are more than 65 knots. Strong winds can damage the airplane structure." },
      { t: "widget", id: "doorsSynoptic" },
      { t: "h", text: "Main deck entry door (1L)" },
      { t: "ctrl", name: "Door operating handle", where: "Main deck entry door", ref: "1.30.23", pos: [
        ["OPEN", "Rotating the handle unlatches the door. The door moves inward, then outward."],
        ["Close", "Rotating the handle latches the door closed."]
      ]},
      { t: "ul", items: [
        "Manually operated with no power assist. Opens from inside or outside.",
        "An escape rope is stowed above the door.",
        "Threshold lights illuminate when the emergency lights are activated.",
        "The hold-open release lever on the body frame disengages when lifted, allowing the door to close."
      ]},
      { t: "h", text: "Upper deck door" },
      { t: "p", html: "The upper deck door is the emergency evacuation door, on the right side of the upper deck." },
      { t: "ctrl", name: "Door handle (interior)", where: "Upper deck door", ref: "1.30.26", pos: [
        ["Pull and rotate clockwise", "Unlocks the latches and swings the door inboard on its upper and lower hinges, toward OPEN. The door then runs aft on upper and lower tracks."]
      ]},
      { t: "ctrl", name: "Door latch manual handle", where: "Upper deck door", ref: "1.30.26", pos: [
        ["Push", "Releases the door from the aft stowed position so it can slide forward on the tracks."]
      ]},
      { t: "ul", items: [
        "<b>From outside:</b> push the tabs to release the handles, then rotate the handles to unlatch and open. The exterior handles must be stowed before moving the door aft on the tracks.",
        "<b>Closing:</b> from either side. Push the door latch manual handle, slide the door forward, then rotate the interior or exterior handle to close and latch it."
      ]},
      { t: "h", text: "Upper deck escape slide" },
      { t: "p", html: "The slide is mounted on tracks parallel to the door and the right bulkhead. Set the platform lock control lever to Unlocked and use the assist handle to move it. It locks in several positions, including forward (in front of the door) and aft (clear of the door)." },
      { t: "steps", items: [
        "Slide in the forward position, crew service door open.",
        "Pull the packboard manual release handle.",
        "Rotate the escape slide out through the open doorway.",
        "The slide inflates automatically. If it does not, pull down on the manual inflation handle."
      ]},
      { t: "note", k: "warning", html: "Use caution when pushing the slide out of the door to avoid falling out of the open door." },
      { t: "note", k: "caution", html: "Do not pull the manual inflation handle unless the packboard is out through the doorway." },
      { t: "note", k: "caution", html: "The escape slide is unusable if the airplane tips tail down on the ground. Use the escape devices instead." },
      { t: "p", html: "Slide components: escape slide pack, packboard, packboard manual release handle, platform lock control, assist handle, chute extension panel, floor tracks and floor ramp; when deployed, the stored gas bottle, chute, girt, manual inflation handle and ramp plate." },
      { t: "h", text: "Flight deck overhead hatch" },
      { t: "ul", items: [
        "Just aft of the overhead panels. Opens from inside or outside.",
        "<b>Inside:</b> rotate the interior handle 180° counterclockwise to unlock, then pull the hatch inward.",
        "<b>Outside:</b> press the release trigger so the exterior handle springs out of its recess, then rotate the handle to unlock."
      ]},
      { t: "note", k: "caution", html: "The overhead hatch is hinged to open inward. Take care to avoid injury when opening it." },
      { t: "h", text: "Upper deck crew access ladder" },
      { t: "p", html: "The ladder is retracted to the ceiling during cargo loading and unloading and extended at all other times. The ladder enclosure must be closed during taxi, takeoff, flight and landing. The stow assist tool is on the side panel next to Door 1L." },
      { t: "note", k: "caution", html: "Always use the handrail when climbing or descending the ladder. Face the ladder when climbing or descending." }
    ]
  },

  /* ───────────────────────── 11. CARGO DOORS ───────────────────────── */
  {
    id: "cargodoors", title: "Cargo Doors", ref: "1.30.29 · 1.50.6",
    summary: "Lower cargo doors, and the side and nose cargo door control panels, lights and lock-out logic.",
    blocks: [
      { t: "h", text: "Lower cargo doors" },
      { t: "ul", items: [
        "Three doors on the right side: forward, aft and bulk. All open upward.",
        "Forward and aft open outward; bulk opens inward.",
        "Forward and aft are normally operated electrically from an exterior panel forward of each door. A light on the panel shows latching. Locking and unlocking is manual, and both can be operated manually if necessary.",
        "The bulk door is opened and closed manually and is counterbalanced."
      ]},
      { t: "h", text: "Side cargo door" },
      { t: "p", html: "The left side cargo door, aft on the main deck, opens from inside or outside when the retainer over the interior latch lock handle is open. Power comes from the <b>main deck cargo handling bus</b>." },
      { t: "widget", id: "sideDoor" },
      { t: "steps", items: [
        "Check the POWER ON light is illuminated.",
        "Extend the interior or exterior latch lock handle. The LATCHED CLOSED light illuminates.",
        "Hold the DOOR CONTROL switch to open. LATCHED CLOSED goes out as the door opens.",
        "DOOR UP illuminates when the door is fully open."
      ]},
      { t: "ctrl", name: "Exterior latch lock handle", where: "Side cargo door exterior panel", ref: "1.30.29", pos: [
        ["Press upper release", "Releases both the exterior and interior latch lock handles."],
        ["Pull down", "Powers the door control switch."]
      ]},
      { t: "ctrl", name: "DOOR CONTROL switch", where: "Interior and exterior panels", ref: "1.30.30", pos: [
        ["Hold", "Powered when POWER ON is lit and the latch lock handle is extended. Hold OPEN / DOOR UP or CLOSE / LATCHED CLOSED to move the door."]
      ]},
      { t: "ctrl", name: "Side door lights", where: "Interior and exterior panels", ref: "1.30.29", pos: [
        ["POWER ON (green)", "Electrical power available to operate the door."],
        ["LATCHED CLOSED (green)", "Latch lock handles released with the door closed and latches engaged."],
        ["DOOR UP (green)", "Door in the full open position."]
      ]},
      { t: "ctrl", name: "RAMP LIGHTS switch", where: "Side cargo door interior panel", ref: "1.30.31", pos: [
        ["ON", "Lights in the upper part of the door light the loading area."],
        ["OFF", "Lights off."]
      ]},
      { t: "p", html: "Both panels also have an interphone jack and a window in the door." },
      { t: "h", text: "Nose cargo door" },
      { t: "p", html: "The nose cargo door is powered by the <b>main deck cargo handling bus</b> and controlled from the nose cargo door and light control panel. A mechanical system operates the door when electrical power is not available." },
      { t: "widget", id: "noseDoor" },
      { t: "ul", items: [
        "With [[SYSTEM POWER]] ON, the POWER ON and LATCHES CLOSED lights illuminate.",
        "Hold [[SYSTEM POWER]] ON and [[DOOR CONTROL]] OPEN to open; hold ON and CLOSE to close.",
        "Release either switch to stop and hold the door at any point.",
        "[[OFF/LOCK TEST]]: control system unpowered, lock-out engaged, LOCK-OUT ENGAGED illuminates, LATCHES CLOSED goes out.",
        "Release the switch and LOCK-OUT ENGAGED goes out. That confirms power is removed and electrical lock-out is engaged.",
        "If power is not removed from the control system, a doors EICAS alert message displays."
      ]},
      { t: "ctrl", name: "SYSTEM POWER switch", where: "Nose cargo door control panel", ref: "1.30.34", pos: [
        ["ON", "Momentary. Powers the control system, makes lamp test and door control available, lights POWER ON. Door operation stops when released."],
        ["OFF / LOCK TEST", "Lock-out engaged; LOCK-OUT ENGAGED light illuminates."]
      ]},
      { t: "ctrl", name: "DOOR CONTROL switch", where: "Nose cargo door control panel", ref: "1.30.34", pos: [
        ["OPEN", "Powers the door actuation system open, with SYSTEM POWER ON."],
        ["CLOSE", "Powers the door actuation system closed, with SYSTEM POWER ON."]
      ]},
      { t: "ctrl", name: "Nose door control panel lights", where: "Nose cargo door control panel", ref: "1.30.33", pos: [
        ["POWER ON (white)", "Main deck cargo handling bus powered and SYSTEM POWER ON."],
        ["LOCK-OUT ENGAGED (green)", "OFF/LOCK TEST selected with the main deck cargo handling bus on AC power."],
        ["LATCHES CLOSED (green)", "All latch pins fully latched."],
        ["DOOR UP (blue)", "Door in the full up position."]
      ]},
      { t: "h", text: "Latch actuator test panel" },
      { t: "ctrl", name: "LATCH SELECT", where: "Latch actuator test panel", ref: "1.30.35", pos: [
        ["1L–8L, 1R–8R", "Selects one of the sixteen latches for test."],
        ["LATCH CLOSED TEST", "Push: LATCH CLOSED light illuminates (green) if the selected latch is closed."],
        ["LATCH OPEN TEST", "Push: LATCH OPEN light illuminates (green) if the selected latch is open."],
        ["LAMP TEST", "Push: both lights illuminate when test power is available."]
      ]},
      { t: "h", text: "Annunciator panels" },
      { t: "p", html: "The latch annunciator and door closed annunciator give closed and latched indication with the control system unpowered." },
      { t: "ctrl", name: "Latch annunciator", where: "Nose cargo door latch annunciator assembly", ref: "1.30.37", pos: [
        ["LATCHED (green)", "Respective latch closed and latched."],
        ["NOT LCHD (amber)", "Respective latch not latched."]
      ]},
      { t: "ctrl", name: "Door closed annunciator", where: "Left and right", ref: "1.30.38", pos: [
        ["CLOSED (green)", "Door closed. Push to test."],
        ["NOT CLOSED (amber)", "Door not closed. Push to test."]
      ]},
      { t: "eicas", rows: [
        ["DOOR SIDE CARGO", "Caution", "Beeper", "Side cargo door not closed, latched and locked condition sensed."],
        ["DOOR NOSE CARGO", "Caution", "Beeper", "Nose cargo door is not closed, latched and locked condition sensed."],
        ["DOOR FWD CARGO", "Caution", "Beeper", "Forward cargo door is not closed and secure."],
        ["DOOR AFT CARGO", "Caution", "Beeper", "Aft cargo door is not closed and secure."],
        ["DOOR BULK CARGO", "Advisory", "", "Bulk cargo door is not closed and secure."]
      ]}
    ]
  },

  /* ───────────────────────── 12. SEATS ───────────────────────── */
  {
    id: "seats", title: "Flight Deck Seats", ref: "1.50.8",
    summary: "Pilot seat adjustments and eye position, and the two observer seats.",
    blocks: [
      { t: "p", html: "There are three seat types: the pilot seats, the first observer seat and the second observer seat." },
      { t: "h", text: "Pilot seats" },
      { t: "ul", items: [
        "Recline, vertical, fore/aft, thigh support and lumbar adjustment.",
        "Adjustable armrests, crotch straps, lap belts, adjustable headrests, and inertia-reel shoulder harnesses with manual locks.",
        "The seats move outboard during the last four inches of aft travel.",
        "Electric and manual controls give fore/aft and vertical adjustment; manual levers handle the rest.",
        "The master ON/OFF switch is behind the lumbar in/out handwheel.",
        "Lumbar and thigh pad support use handwheels. Armrest pitch uses the knob under the armrest, and the armrests stow vertically for access."
      ]},
      { t: "p", html: "Adjust the seat until the eye position indicator balls are level with your eyes and the nearer ball hides the centre ball. The best recline is near or slightly aft of fully upright." },
      { t: "note", k: "warning", html: "When using the manual release lever, make sure seat motion has stopped before releasing the fore/aft lever. Releasing it while the seat is still moving can damage the seat actuator. Manually moving the seat to the forward or aft stop is permissible." },
      { t: "h", text: "Observer seats" },
      { t: "ul", items: [
        "<b>First observer:</b> pedestal-mounted, manual vertical and fore/aft adjustment. Folding armrest on the left, crotch strap, lap belt, adjustable headrest, inertia-reel shoulder harness with manual locks.",
        "<b>Second observer:</b> not adjustable. Folding armrests, crotch strap, lap belt, adjustable headrest, shoulder harness with manual locks."
      ]}
    ]
  },

  /* ───────────────────────── 13. EICAS ───────────────────────── */
  {
    id: "eicas", title: "EICAS Messages", ref: "1.60",
    summary: "Every Chapter 1 alert and memo message with its level, aural and logic.",
    blocks: [
      { t: "p", html: "Cautions are amber with a beeper. Advisories are amber and indented one space, with no aural. Memos are white." },
      { t: "eicas", filter: true, rows: [
        ["CREW OXY LOW", "Advisory", "", "Crew oxygen pressure low."],
        ["DOOR AFT CARGO", "Caution", "Beeper", "Aft cargo door is not closed and secure."],
        ["DOOR BULK CARGO", "Advisory", "", "Bulk cargo door is not closed and secure."],
        ["DOOR ELEC CTR", "Advisory", "", "Electrical equipment door is not closed and secure."],
        ["DOOR ELEC MAIN", "Advisory", "", "Electrical equipment door is not closed and secure."],
        ["DOOR ENTRY L1", "Advisory", "", "Main deck entry door is not closed and secure."],
        ["DOOR F/D OVHD", "Advisory", "", "Flight deck overhead door is not closed and secure."],
        ["DOOR FWD CARGO", "Caution", "Beeper", "Forward cargo door is not closed and secure."],
        ["DOOR NOSE CARGO", "Caution", "Beeper", "Nose cargo door is not closed, latched and locked condition sensed."],
        ["DOOR R UPPER DK", "Advisory", "", "Upper deck door is not closed and secure."],
        ["DOOR SIDE CARGO", "Caution", "Beeper", "Side cargo door not closed, latched and locked condition sensed."],
        ["DOORS ELEC", "Advisory", "", "Both electrical equipment doors are not closed and secure."],
        ["ELT ON", "Advisory", "", "The emergency locator transmitter is on."],
        ["EMER LIGHTS", "Advisory", "", "Emergency lights switch ARMED and emergency lights on, or emergency lights switch not armed."],
        ["SUPRNRY OXY LO", "Advisory", "", "Supernumerary oxygen pressure low."],
        ["SUPRNMRY OXY ON", "Advisory", "", "Supernumerary oxygen system activated."],
        ["SEATBELTS OFF", "Memo", "", "SEATBELTS selector in OFF position in flight."],
        ["SEATBELTS ON", "Memo", "", "FASTEN BELTS signs manually selected ON."]
      ]}
    ]
  }
  ],

  /* ═════════════════════════ QUESTION BANK ═════════════════════════ */
  quiz: [
    { id: "q01", sec: "dimensions", ref: "1.10.2", q: "Which part of the airplane sets the minimum obstacle clearance path in a turn?",
      o: ["Nose", "Tail", "Wingtip", "Outboard engine nacelle"], a: 2,
      why: "The wingtip swings the largest arc (170 ft / 51.8 m). All other structure stays inside it." },
    { id: "q02", sec: "dimensions", ref: "1.10.2", q: "Minimum pavement width for a 180° turn?",
      o: ["150 ft (45.7 m)", "170 ft (51.8 m)", "172 ft (52.4 m)", "190 ft (57.9 m)"], a: 2,
      why: "172 ft (52.4 m). 150 ft is the tail radius and 170 ft the wingtip radius." },
    { id: "q03", sec: "dimensions", ref: "1.10.2", q: "Do not turn away from an obstacle within…",
      o: ["10 ft of the wingtip or 50 ft of the nose", "15 ft of the wingtip or 59 ft of the nose", "20 ft of the wingtip or 60 ft of the nose", "25 ft of the wingtip or 75 ft of the nose"], a: 1,
      why: "15 feet (4.6 m) of the wingtip or 59 feet (18.0 m) of the nose." },
    { id: "q04", sec: "dimensions", ref: "1.10.1", q: "Overall length of the 747-8F?",
      o: ["224 ft 5 in (68.4 m)", "231 ft 10 in (70.7 m)", "243 ft 6 in (74.2 m)", "250 ft 2 in (76.3 m)"], a: 3,
      why: "250 ft 2 in (76.3 m). 224 ft 5 in is the wingspan; 243 ft 6 in is nose to horizontal stabilizer tip." },
    { id: "q05", sec: "dimensions", ref: "1.10.2", q: "Which is NOT an assumption behind the published minimum turning radius?",
      o: ["Body gear steering operating", "No differential braking", "Minimum thrust on all engines", "Asymmetric thrust on the outboard engines"], a: 3,
      why: "The conditions are a slow continuous turn, minimum thrust on all engines, no differential braking, and body gear steering operating." },
    { id: "q06", sec: "dimensions", ref: "1.10.2", q: "Nose and tail turning radii are:",
      o: ["Nose 126 ft, tail 150 ft", "Nose 150 ft, tail 126 ft", "Nose 110 ft, tail 145 ft", "Nose 126 ft, tail 170 ft"], a: 0,
      why: "Nose 126 ft (38.4 m), tail 150 ft (45.7 m), wingtip 170 ft (51.8 m)." },

    { id: "q07", sec: "panels", ref: "1.30.1", q: "An alternate action switch that is pushed out (extended) is:",
      o: ["On, with its legend visible", "Off, with the legend shutter closed", "Faulted", "In test"], a: 1,
      why: "Extended = off; the mechanical shutter closes so the legend is hidden. Pushed in flush = on." },
    { id: "q08", sec: "panels", ref: "1.30.1", q: "A switch bulb has failed. What should the crew do?",
      o: ["Replace it from the spares kit with the system unpowered", "Swap it with an unused bulb on the same panel", "Contact maintenance", "Use IND LTS TEST to reset it"], a: 2,
      why: "Flight crews should not change switch bulbs. Bulb changes can cause damage with the system powered, and changes on the MCP may affect system operation in flight." },
    { id: "q09", sec: "panels", ref: "1.22.3", q: "Flap placard limit for flaps 25?",
      o: ["235 K", "220 K", "210 K", "185 K"], a: 2,
      why: "1-285, 5-265, 10-245, 20-235, 25-210, 30-185." },
    { id: "q10", sec: "panels", ref: "1.22.3", q: "Landing gear extended limit speed?",
      o: ["270 K / M.82", "290 K / M.82", "320 K / M.82", "320 K / M.86"], a: 2,
      why: "Retract and extend 270 K / M.82; extended 320 K / M.82." },
    { id: "q11", sec: "panels", ref: "1.22.5", q: "Which MFD synoptic is covered in Chapter 1?",
      o: ["ECS", "DRS", "STAT", "GEAR"], a: 1,
      why: "DRS (doors) is Chapter 1. ECS is 2, GEAR 14, and the status display is 15." },
    { id: "q12", sec: "panels", ref: "1.30.21", q: "GND TESTS switch at ENABLE:",
      o: ["Allows the Central Maintenance Computer to initiate ground tests", "Tests all annunciator lights", "Enables ground power to the cargo handling bus", "Inhibits EICAS messages on the ground"], a: 0,
      why: "ENABLE lets the CMC initiate ground tests. NORM (guard closed) configures systems for flight." },

    { id: "q13", sec: "fdlights", ref: "1.30.3", q: "Which light is NOT driven to full brightness by the STORM switch?",
      o: ["Dome lights", "Aisle stand flood lights", "Glareshield lights", "Map lights"], a: 3,
      why: "STORM covers the captain's and F/O's (forward panel flood) lights, glareshield lights, aisle stand flood lights and dome lights." },
    { id: "q14", sec: "fdlights", ref: "1.40.3", q: "Normal power to the aisle stand integral panel lights fails. Result?",
      o: ["Aisle stand goes dark until power is restored", "Aisle stand flood light illuminates at reduced intensity", "Storm lights come on automatically", "Emergency lights illuminate"], a: 1,
      why: "The aisle stand flood light comes on at reduced intensity. Flood lights in general run from standby power when normal power is lost." },
    { id: "q15", sec: "fdlights", ref: "1.30.6", q: "IND LTS held at TEST:",
      o: ["Lights all annunciators at full brightness for 10 seconds, then dims them while held", "Lights all annunciators until released", "Tests only master WARNING and CAUTION", "Flashes all annunciators for 5 seconds"], a: 0,
      why: "Full brightness for 10 seconds to check bulbs, then dimmed as long as the switch is held." },
    { id: "q16", sec: "fdlights", ref: "1.30.9", q: "The FLIGHT DECK ACCESS LTS work when which bus is powered?",
      o: ["Main deck cargo handling bus", "Ground handling bus", "DC bus 4", "Standby bus"], a: 1,
      why: "They light the path to or from the flight deck when the ground handling bus is powered." },
    { id: "q17", sec: "fdlights", ref: "1.30.9", q: "Which is NOT lit by the flight deck access lights?",
      o: ["Main Equipment Center lights", "Threshold light at Door 1L", "Upper deck lights above the crew access ladder", "Nose spot light"], a: 3,
      why: "Access lights: MEC lights, left sidewall light forward of 1L, threshold light at 1L, upper deck lights above the ladder, upper deck dome lights." },

    { id: "q18", sec: "decklights", ref: "1.40.4", q: "When do the nose door threshold (ramp) lights illuminate?",
      o: ["Whenever the THRESHOLD switch is ON", "Only with the nose cargo door full open", "Only with the nose door closed", "With emergency lights activated"], a: 1,
      why: "They are on the inside of the nose door and only illuminate, exposed, with the door in the full open position." },
    { id: "q19", sec: "decklights", ref: "1.40.4", q: "The nose spot light is used with the mirror to:",
      o: ["Check the nose door latches", "Verify the end locks are raised with cargo in the forward location", "Inspect the nose gear", "Light the loading ramp"], a: 1,
      why: "It lights the forward main deck with the nose door closed, to verify end locks raised when cargo is loaded forward." },
    { id: "q20", sec: "decklights", ref: "1.40.4", q: "Apart from main deck lighting, the seven forward ceiling lights also act as:",
      o: ["Emergency exit path lights", "Threshold lights", "Flight deck access lights", "Side cargo door ramp lights"], a: 1,
      why: "The seven forward ceiling lights also function as threshold lights. Only the one beside the crew ladder opening is a flight deck access light." },

    { id: "q21", sec: "extlights", ref: "1.40.1", q: "Landing lights ON, gear lever UP. The landing lights are:",
      o: ["Off", "Dimmed", "Full brightness", "Flashing"], a: 1,
      why: "Full brightness needs the gear lever DOWN; with the lever not DOWN they are dimmed." },
    { id: "q22", sec: "extlights", ref: "1.40.1", q: "Runway turnoff lights are aimed about how far from the centreline?",
      o: ["15°", "35°", "65°", "90°"], a: 2,
      why: "About 65° left and right. They are on the nose gear structure and work only in ground mode." },
    { id: "q23", sec: "extlights", ref: "1.30.14", q: "TAXI switch ON after liftoff. The taxi lights:",
      o: ["Stay on until the gear retracts", "Extinguish when air/ground sensing goes to air mode", "Dim", "Stay on until selected OFF"], a: 1,
      why: "Taxi and runway turnoff lights only illuminate with air/ground sensing in ground mode." },
    { id: "q24", sec: "extlights", ref: "1.30.15", q: "BEACON at LWR gives:",
      o: ["Lower red anti-collision beacon only", "Upper and lower beacons", "Lower white strobe", "Beacon at low intensity"], a: 0,
      why: "LWR = lower red beacon only; BOTH = upper and lower." },
    { id: "q25", sec: "extlights", ref: "1.30.15", q: "In addition to the position lights, NAV ON illuminates:",
      o: ["Logo lights", "Wing illumination lights", "White wingtip marker lights", "Runway turnoff lights"], a: 2,
      why: "NAV ON lights the red, green and white navigation lights and the white wingtip marker lights." },
    { id: "q26", sec: "extlights", ref: "1.40.2", q: "Where are the wing illumination lights?",
      o: ["Wingtips", "Engine pylons", "Fuselage", "Horizontal stabilizer"], a: 2,
      why: "On the fuselage, lighting the wings and engine nacelles. Logo lights are on the stabilizer." },
    { id: "q27", sec: "extlights", ref: "1.40.2", q: "White anti-collision strobes are located:",
      o: ["Top and bottom of the fuselage", "Each forward wingtip and the tail cone", "Wingtips only", "Nose gear"], a: 1,
      why: "Strobes: forward wingtips and tail cone. Beacons (red) are top and bottom of the fuselage." },

    { id: "q28", sec: "emerlights", ref: "1.40.5", q: "With EMER LIGHTS ARMED, the emergency lights come on automatically when:",
      o: ["A door is opened in flight", "DC power fails or is turned off", "Cabin altitude exceeds 10,000 ft", "The ELT activates"], a: 1,
      why: "Automatic operation occurs if DC power fails or is turned off with the system armed." },
    { id: "q29", sec: "emerlights", ref: "1.30.16", q: "Flight deck EMER LIGHTS is OFF. Someone pushes the cabin EMERGENCY LIGHTS switch. Result?",
      o: ["Nothing; the flight deck switch inhibits it", "All emergency lights illuminate", "Only main deck lights illuminate", "EMER LIGHTS advisory only"], a: 1,
      why: "The cabin switch on the upper deck cabin services module bypasses the flight deck switch." },
    { id: "q30", sec: "emerlights", ref: "1.40.5", q: "Minimum emergency lighting endurance on a fully charged battery?",
      o: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"], a: 1,
      why: "At least 15 minutes, from remote batteries kept charged by DC bus 4." },
    { id: "q31", sec: "emerlights", ref: "1.40.5", q: "Which bus keeps the emergency lighting batteries charged?",
      o: ["DC bus 1", "DC bus 4", "Main battery bus", "Ground handling bus"], a: 1,
      why: "Battery charge is maintained by DC bus 4." },
    { id: "q32", sec: "emerlights", ref: "1.60.2", q: "The EMER LIGHTS advisory displays when:",
      o: ["The switch is not armed, or it is ARMED and the lights are on", "Battery endurance is below 15 minutes", "Only with the switch ON", "The cabin switch is pushed with power normal"], a: 0,
      why: "Logic: switch ARMED and emergency lights on, or switch not armed (OFF or ON)." },
    { id: "q33", sec: "emerlights", ref: "1.40.5", q: "The exterior emergency light below the crew service door lights:",
      o: ["The nose loading ramp", "The inertia reel landing zone", "The side cargo door sill", "The nose gear"], a: 1,
      why: "Exterior emergency lighting is an escape slide light plus a light illuminating the inertia reel landing zone." },

    { id: "q34", sec: "signs", ref: "1.40.4", q: "In AUTO, FASTEN SEAT BELTS illuminates below what airplane altitude?",
      o: ["10,000 ft", "10,300 ft", "12,000 ft", "14,000 ft"], a: 1,
      why: "Airplane altitude below 10,300 ft. The cabin altitude trigger is above 10,000 ft." },
    { id: "q35", sec: "signs", ref: "1.30.3", q: "Supernumerary oxygen deploys with SEATBELTS OFF. The signs show:",
      o: ["Nothing; the selector is OFF", "FASTEN SEAT BELTS on, RETURN TO SEAT off", "Both FASTEN SEAT BELTS and RETURN TO SEAT on", "RETURN TO SEAT only"], a: 1,
      why: "Whenever supernumerary oxygen deploys, FASTEN SEAT BELTS illuminates and RETURN TO SEAT extinguishes, regardless of selector position." },
    { id: "q36", sec: "signs", ref: "1.45.1", q: "Which event flashes the main deck ceiling lights WITHOUT sounding the horns?",
      o: ["Cabin altitude reaching 10,000 ft", "Smoke detected in the main deck", "FASTEN SEAT BELTS selected ON", "MAIN DECK ALERT switch pushed"], a: 2,
      why: "All four alert triggers give lights and horns. Selecting seat belts ON flashes the ceiling lights only." },
    { id: "q37", sec: "signs", ref: "1.45.1", q: "Which does NOT trigger the main deck alert lights and horns?",
      o: ["SUPRNMRY OXY switch selected ON", "Cabin altitude reaching 10,000 ft", "DOOR SIDE CARGO caution", "Smoke detected in the main deck"], a: 2,
      why: "Triggers: cabin altitude 10,000 ft, main deck smoke, SUPRNMRY OXY ON, MAIN DECK ALERT ON." },
    { id: "q38", sec: "signs", ref: "1.60.2", q: "When is the SEATBELTS OFF memo displayed?",
      o: ["Selector OFF on the ground", "Selector OFF in flight", "Selector AUTO with signs off", "Signs extinguished by AUTO logic"], a: 1,
      why: "SEATBELTS OFF memo: selector in OFF position in flight. SEATBELTS ON memo: signs manually selected ON." },
    { id: "q39", sec: "signs", ref: "1.40.4", q: "What sounds when the FASTEN SEAT BELTS signs change state?",
      o: ["Main deck horns", "A low tone over the PA", "The beeper", "Nothing"], a: 1,
      why: "A low tone sounds over the PA system whenever the signs illuminate or extinguish." },

    { id: "q40", sec: "oxygen", ref: "1.30.17", q: "With SUPRNMRY OXY at NORM, masks drop automatically at a cabin altitude of about:",
      o: ["10,000 ft", "12,000 ft", "14,000 ft", "15,000 ft"], a: 2,
      why: "Approximately 14,000 ft. RESET works below 12,000 ft; the main deck alert fires at 10,000 ft." },
    { id: "q41", sec: "oxygen", ref: "1.30.17", q: "SUPRNMRY OXY to RESET does what?",
      o: ["Re-stows the masks", "Closes the flow control unit electrically, with cabin altitude below 12,000 ft", "Tests the system", "Arms automatic deployment"], a: 1,
      why: "RESET (spring-loaded) closes the flow control unit electrically when cabin altitude is below 12,000 ft." },
    { id: "q42", sec: "oxygen", ref: "1.30.18", q: "Crew regulator at N (normal) supplies:",
      o: ["100% oxygen on demand", "Air/oxygen mixture on demand, ratio depending on cabin altitude", "100% oxygen under positive pressure", "Continuous flow"], a: 1,
      why: "N = diluted air/oxygen on demand; 100% = pure oxygen on demand; EMERGENCY = 100% under positive pressure." },
    { id: "q43", sec: "oxygen", ref: "1.30.18", q: "Rotating the regulator EMERGENCY selector provides:",
      o: ["100% oxygen under positive pressure at all cabin altitudes", "Air/oxygen mix at high flow", "100% on demand above 10,000 ft only", "Oxygen to the boom mic"], a: 0,
      why: "Positive pressure 100% protects against smoke and vapours and purges or defogs the mask, but depletes oxygen faster and makes communication harder." },
    { id: "q44", sec: "oxygen", ref: "1.40.7", q: "During the preflight mask check, oxygen pressure decreases. This may mean:",
      o: ["Normal; the hose is filling", "The crew oxygen cylinder shutoff valve is closed", "The regulator is in EMERGENCY", "The mask is not stowed correctly"], a: 1,
      why: "A pressure decrease during the check may indicate the cylinder shutoff valve is closed and oxygen is unavailable." },
    { id: "q45", sec: "oxygen", ref: "1.30.20", q: "Left door closed and OXY ON flag in view. Pushing RESET/TEST:",
      o: ["Tests the regulator momentarily", "Turns oxygen off, deactivates the mask mic and activates the boom mic", "Inflates the harness", "Selects 100%"], a: 1,
      why: "With OXY ON shown it shuts oxygen off and swaps to the boom mic. With OXY ON not shown it turns oxygen on momentarily to test." },
    { id: "q46", sec: "oxygen", ref: "1.40.7", q: "The mask microphone activates when:",
      o: ["The mask is donned", "The left-hand stowage box door opens", "RESET/TEST is pushed", "EMERGENCY is selected"], a: 1,
      why: "Opening the left-hand door of the stowage box activates the mask microphone." },
    { id: "q47", sec: "oxygen", ref: "1.40.10", q: "Before stowing, set the regulator to:",
      o: ["N, EMERGENCY off", "100%, EMERGENCY off (counterclockwise)", "100%, EMERGENCY on", "N, EMERGENCY on"], a: 1,
      why: "Press the N/100% rocker to 100% and turn the EMERGENCY knob counterclockwise to off." },
    { id: "q48", sec: "oxygen", ref: "1.40.13", q: "Oxygen flow to a supernumerary mask begins when:",
      o: ["The box door opens", "The mask or streamer is pulled down", "Cabin altitude exceeds 14,000 ft", "SUPRNMRY OXY is selected ON"], a: 1,
      why: "Flow begins when the mask or streamer is pulled. Closing the box's manifold toggle valve saves oxygen for masks still in use." },
    { id: "q49", sec: "oxygen", ref: "1.40.13", q: "On JA15KZ–JA18KZ, when supernumerary masks deploy, the crew rest gets:",
      o: ["Ceiling lights on, steady", "Flashing ceiling lights and an aural tone for several seconds", "No indication", "Emergency lights"], a: 1,
      why: "JA15KZ–JA18KZ: ceiling lights flash and a tone sounds in the crew rest. JA11KZ–JA14KZ: main deck ceiling lights flash and the crew rest ceiling lights illuminate." },
    { id: "q50", sec: "oxygen", ref: "1.45.3", q: "Walk-around oxygen bottles differ from the portable (first aid) bottles by having:",
      o: ["A disposable mask", "A full face mask and larger capacity", "Continuous flow only", "No regulator"], a: 1,
      why: "Portable bottles: disposable mask and safety straps, for first aid. Walk-around: full face mask and larger bottle." },
    { id: "q51", sec: "oxygen", ref: "1.30.17", q: "Where are crew and supernumerary oxygen pressures displayed?",
      o: ["ECS synoptic", "EICAS STATUS page", "Overhead panel gauge", "Upper EICAS permanently"], a: 1,
      why: "OXY PR (CREW and PASS) is on the status page, selected with STAT on the display select panel." },

    { id: "q52", sec: "emerequip", ref: "1.45.1", q: "To deactivate the fixed ELT after activation:",
      o: ["Select OFF", "RESET momentarily (1 to 3 seconds), then ARMED", "Hold RESET for 10 seconds", "Pull its circuit breaker"], a: 1,
      why: "Move the switch to RESET momentarily, between 1 and 3 seconds, then ARMED." },
    { id: "q53", sec: "emerequip", ref: "1.45.1", q: "Where is the fixed (fuselage-mounted) ELT?",
      o: ["Upper deck closet", "Main deck aft overhead", "Vertical fin", "Main Equipment Center"], a: 1,
      why: "Main deck aft overhead. The supernumerary-area ELT is on the upper deck closet exterior wall." },
    { id: "q54", sec: "emerequip", ref: "1.45.2", q: "Before discharging a chemical extinguisher on the flight deck:",
      o: ["Open the overhead hatch", "All flight crew don oxygen masks on 100% with EMERGENCY selected", "Depressurize the airplane", "Turn on the STORM lights"], a: 1,
      why: "Warning: all flight crew members wear oxygen masks and use 100% oxygen with emergency selected." },
    { id: "q55", sec: "emerequip", ref: "1.45.2", q: "The water fire extinguisher is used on:",
      o: ["Electrical fires", "Grease fires", "Fabric or paper fires only", "All fire types"], a: 2,
      why: "Fabric or paper only. Rotate the handle fully clockwise, aim at the base, press the trigger. Contains antifreeze." },
    { id: "q56", sec: "emerequip", ref: "1.45.4", q: "A flashlight removed from its bracket:",
      o: ["Must be switched on", "Lights automatically and only goes off when returned to the bracket", "Lights for 15 minutes", "Recharges in the bracket"], a: 1,
      why: "It lights on removal and is extinguished only by replacing it in the bracket. Batteries are not rechargeable." },
    { id: "q57", sec: "emerequip", ref: "1.50.4", q: "How many emergency escape devices are stowed next to the overhead hatch?",
      o: ["4", "6", "8", "10"], a: 2,
      why: "Eight, each with a matching descent harness in the upper deck cabin." },
    { id: "q58", sec: "emerequip", ref: "1.50.4", q: "Before exiting on an escape device:",
      o: ["Inflate the life vest", "Pull sharply on the lanyard to confirm it is secured to the airplane", "Unlock the inertia reel", "Remove the harness"], a: 1,
      why: "Warning: make sure the device is securely fastened by pulling sharply on the lanyard." },

    { id: "q59", sec: "doors", ref: "1.50.1", q: "Door wind limits:",
      o: ["Operate up to 40 kt at the door; do not keep open in gusts above 65 kt", "Operate up to 50 kt; close above 65 kt", "Operate up to 40 kt; close above 50 kt gusts", "Operate up to 30 kt; close above 60 kt gusts"], a: 0,
      why: "Do not operate entry or cargo doors with more than 40 kt at the door; do not keep doors open with gusts over 65 kt." },
    { id: "q60", sec: "doors", ref: "1.50.1", q: "How many cargo doors does the 747-8F have?",
      o: ["3", "4", "5", "6"], a: 2,
      why: "Five: forward, aft and bulk lower doors, plus the side cargo door and the nose cargo door." },
    { id: "q61", sec: "doors", ref: "1.30.23", q: "The main deck entry door:",
      o: ["Is power-assisted", "Is manual with no power assist and moves inward, then outward", "Opens outward only", "Opens from inside only"], a: 1,
      why: "Manual, no power assist. Rotating the handle unlatches it; the door moves inward, then outward." },
    { id: "q62", sec: "doors", ref: "1.50.1", q: "Opening the upper deck door from outside, what must happen before moving the door aft on its tracks?",
      o: ["The slide is moved aft", "The exterior handles are stowed", "The door latch manual handle is pushed", "The interior handle is rotated"], a: 1,
      why: "Push the tabs, rotate the handles to unlatch, and stow the exterior handles before moving the door aft." },
    { id: "q63", sec: "doors", ref: "1.50.2", q: "To use the upper deck door as an emergency exit, the slide must be:",
      o: ["Aft, clear of the door", "Forward, with the crew service door open", "Inflated before the door opens", "Detached from the tracks"], a: 1,
      why: "Slide forward, door open, then pull the packboard manual release and rotate the slide out through the doorway." },
    { id: "q64", sec: "doors", ref: "1.30.28", q: "When may the slide manual inflation handle be pulled?",
      o: ["Any time after the door is open", "Only once the packboard is out through the doorway", "Before releasing the packboard", "Only on the ground"], a: 1,
      why: "Caution: do not pull it unless the packboard is out through the doorway." },
    { id: "q65", sec: "doors", ref: "1.50.3", q: "The overhead hatch is opened from inside by:",
      o: ["Rotating the handle 90° clockwise and pushing it out", "Rotating the handle 180° counterclockwise and pulling the hatch inward", "Pressing the release trigger", "Pulling the red T-handle"], a: 1,
      why: "Rotate the interior handle 180° counterclockwise. The hatch is hinged to open inward." },
    { id: "q66", sec: "doors", ref: "1.30.39", q: "The crew access ladder enclosure must be closed during:",
      o: ["Cargo loading only", "Taxi, takeoff, flight and landing", "Flight only", "Engine start only"], a: 1,
      why: "The ladder is retracted for loading and extended otherwise; its enclosure is closed for taxi, takeoff, flight and landing." },

    { id: "q67", sec: "cargodoors", ref: "1.50.7", q: "Which lower cargo door opens inward?",
      o: ["Forward", "Aft", "Bulk", "None"], a: 2,
      why: "All three open upward; forward and aft open outward, bulk opens inward and is counterbalanced." },
    { id: "q68", sec: "cargodoors", ref: "1.50.7", q: "The side and nose cargo doors are powered by the:",
      o: ["Ground handling bus", "Main deck cargo handling bus", "Ground service bus", "APU battery bus"], a: 1,
      why: "Both draw power from the main deck cargo handling bus." },
    { id: "q69", sec: "cargodoors", ref: "1.30.30", q: "The side cargo door DOOR CONTROL switch is powered when:",
      o: ["POWER ON is lit and the latch lock handle is extended", "The interphone is connected", "LATCHED CLOSED is lit", "Ramp lights are on"], a: 0,
      why: "It is powered with POWER ON illuminated and the latch lock handle extended." },
    { id: "q70", sec: "cargodoors", ref: "1.30.31", q: "The side door LATCHED CLOSED light means:",
      o: ["Handles stowed and door locked", "Latch lock handles released with the door closed and latches engaged", "Door fully open", "Power available"], a: 1,
      why: "It lights when the handles are released with the door closed and latched, and goes out as the door opens." },
    { id: "q71", sec: "cargodoors", ref: "1.30.34", q: "Colour of the nose cargo DOOR UP light?",
      o: ["Green", "White", "Blue", "Amber"], a: 2,
      why: "DOOR UP is blue. POWER ON is white; LATCHES CLOSED and LOCK-OUT ENGAGED are green." },
    { id: "q72", sec: "cargodoors", ref: "1.50.7", q: "How do you stop the nose door partway?",
      o: ["Select OFF/LOCK TEST", "Release either SYSTEM POWER or DOOR CONTROL", "Push LAMP TEST", "Remove cargo handling bus power"], a: 1,
      why: "The door stops and holds at any point when either switch is released." },
    { id: "q73", sec: "cargodoors", ref: "1.50.8", q: "After OFF/LOCK TEST is released, LOCK-OUT ENGAGED goes out. This means:",
      o: ["A lock-out fault", "Power is removed and electrical lock-out is engaged", "The latches have opened", "Cargo handling bus power is lost"], a: 1,
      why: "Its extinguishing on release verifies power is removed and lock-out engaged. If power is not removed, a doors EICAS message displays." },
    { id: "q74", sec: "cargodoors", ref: "1.30.37", q: "The nose door latch and closed annunciators work:",
      o: ["Only with SYSTEM POWER ON", "With the control system unpowered", "Only during LAMP TEST", "Only with the door open"], a: 1,
      why: "They provide closed and latched indication with the control system unpowered." },
    { id: "q75", sec: "cargodoors", ref: "1.50.7", q: "With no electrical power, the nose cargo door:",
      o: ["Cannot be opened", "Is operated by a mechanical system", "Opens on the hot battery bus", "Uses the side door motor"], a: 1,
      why: "A mechanical system operates the door when electrical power is not available." },
    { id: "q76", sec: "cargodoors", ref: "1.30.35", q: "How many latches does the latch actuator test panel select from?",
      o: ["8", "12", "16", "20"], a: 2,
      why: "Sixteen: 1L to 8L and 1R to 8R." },

    { id: "q77", sec: "eicas", ref: "1.60.1", q: "DOOR BULK CARGO is a:",
      o: ["Warning", "Caution with beeper", "Advisory", "Memo"], a: 2,
      why: "Bulk is advisory. Forward, aft, nose and side cargo door messages are cautions with beeper." },
    { id: "q78", sec: "eicas", ref: "1.60.1", q: "Which door message is a caution?",
      o: ["DOOR R UPPER DK", "DOOR ENTRY L1", "DOOR SIDE CARGO", "DOOR F/D OVHD"], a: 2,
      why: "DOOR SIDE CARGO, NOSE CARGO, FWD CARGO and AFT CARGO are cautions. The rest are advisories." },
    { id: "q79", sec: "eicas", ref: "1.60.1", q: "DOORS ELEC indicates:",
      o: ["Either E/E door open", "Both electrical equipment doors not closed and secure", "E/E cooling failure", "Electrical door actuator fault"], a: 1,
      why: "DOORS ELEC = both E/E doors not closed and secure. DOOR ELEC MAIN or DOOR ELEC CTR is a single door." },

    { id: "q80", sec: "seats", ref: "1.50.9", q: "The pilot seats move outboard during:",
      o: ["The first four inches of forward travel", "The last four inches of aft travel", "Full recline", "Vertical adjustment"], a: 1,
      why: "They move outboard in the last four inches of aft travel." },
    { id: "q81", sec: "seats", ref: "1.50.9", q: "Correct eye position is when:",
      o: ["Both balls are visible side by side", "The nearer ball hides the centre ball and both are level with the eye", "The centre ball sits above the nearer one", "The HUD symbol is centred"], a: 1,
      why: "The balls are level with the eye and the centre ball is masked by the nearer ball." },
    { id: "q82", sec: "seats", ref: "1.50.9", q: "Using the manual fore/aft release lever, you must:",
      o: ["Hold the master switch ON", "Make sure motion has stopped before releasing the lever", "Move only to the forward stop", "Recline the seat first"], a: 1,
      why: "Releasing the fore/aft lever while the seat is still moving can damage the seat actuator." }
  ]
};
