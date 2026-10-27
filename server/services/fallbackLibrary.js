/**
 * Curated Fallback Mystery Library
 * Provides certified, fully validated fair-play mysteries across Easy, Medium, and Hard difficulties.
 * Every case in this library strictly satisfies:
 * - Easy: 3 suspects, 5 clues, 2 hints
 * - Medium: 4 suspects, 7 clues, 3 hints
 * - Hard: 5 suspects, 9 clues, 3 hints
 */

export const FALLBACK_MYSTERIES = {
  easy: [
    {
      title: "The Missing Venetian Diamond",
      story: {
        synopsis: "During a violent thunderstorm over the Grand Canal, the priceless 100-carat Venetian Blue Diamond disappeared from its hermetically sealed glass pedestal in the Palazzo Moretti private gallery. The perimeter infrared lasers remained active, but the pedestal alarm had been manually disarmed from an internal maintenance toggle switch at 10:15 PM.",
        victim: "Countess Isabella Moretti (Theft Victim)",
        crimeScene: "Palazzo Moretti Private Gallery & Archive",
        crimeType: "High-Value Jewel Larceny",
        timeOfCrime: "10:15 PM during thunderstorm power surge"
      },
      suspects: [
        {
          id: "suspect_1",
          name: "Enzo Rossi",
          role: "Head Curator & Gemologist",
          alibi: "Claims he was in the downstairs restoration lab cataloging Renaissance manuscripts with his assistant until 11:00 PM.",
          motive: "Facing massive debts from antique auction speculations and had his appraisal credentials secretly flagged.",
          relationship: "Chief curator for 8 years and key holder to the display archives.",
          demeanor: "Visibly agitated, repeatedly checking his pocket watch and adjusting his spectacles."
        },
        {
          id: "suspect_2",
          name: "Matteo Bianchi",
          role: "Security Systems Technician",
          alibi: "States he was on the ground-floor patrol inspecting exterior canal flood gates during the storm.",
          motive: "Recently reprimanded and scheduled for contract termination at the end of the month.",
          relationship: "Contract security technician with electronic badge override clearance.",
          demeanor: "Defensive, crossing his arms and speaking in clipped, technical jargon."
        },
        {
          id: "suspect_3",
          name: "Sienna Bellini",
          role: "Private Secretary & Estate Manager",
          alibi: "Claims she was in the library reviewing the estate insurance policy amendments with the Countess's attorney.",
          motive: "Discovered the Countess planned to replace her with an international trust firm.",
          relationship: "Personal confidante and secretary for 5 years.",
          demeanor: "Poised, soft-spoken, holding a leather-bound appointment agenda."
        }
      ],
      clues: [
        {
          id: "clue_1",
          title: "Shattered Pedestal Switch Panel",
          location: "Main Display Pedestal",
          description: "The glass case was opened with an authorized mechanical vault key #3 rather than smashed. The silent sensor wire was snipped with specialized diamond-edged shears."
        },
        {
          id: "clue_2",
          title: "Jeweler's Loupe with Trace Fibers",
          location: "Curator's Archive Desk",
          description: "A 20x magnification loupe wrapped in blue velvet lint identical to the display case cushion, carrying microscopic calcium carbonate dust."
        },
        {
          id: "clue_3",
          title: "Maintenance Keyring Log",
          location: "Security Office Key Vault",
          description: "Key #3 was officially checked out by Enzo Rossi at 09:30 PM under the recorded pretext of 'cleaning the optical mounts'."
        },
        {
          id: "clue_4",
          title: "Smudged Wet Shoe Impression",
          location: "Gallery Balcony Door",
          description: "Size 9 Italian leather dress shoe imprint in damp marble dust, inconsistent with Matteo's size 11 tactical work boots."
        },
        {
          id: "clue_5",
          title: "Encrypted Insurance Inquiry Draft",
          location: "Restoration Workshop Desk Drawer",
          description: "A handwritten draft asking a black-market Swiss buyer about valuation for an 'uncut 100-carat blue gem', dated three days prior in Enzo's distinct calligraphy."
        }
      ],
      hints: [
        {
          id: "hint_1",
          text: "Examine who officially checked out Key #3 that night and possessed the specialized tools to open the optical mount."
        },
        {
          id: "hint_2",
          text: "Compare the shoe size found on the gallery balcony floor against the footwear worn by the security guard and the curator."
        }
      ],
      solution: {
        culpritId: "suspect_1",
        culpritName: "Enzo Rossi",
        motiveExplanation: "Enzo Rossi was on the verge of financial ruin after borrowing against counterfeit antique auctions. Selling the Venetian Blue Diamond to his black-market Swiss contact would settle his creditors.",
        solutionBreakdown: "Enzo checked out mechanical Key #3 under the guise of optical maintenance. During the storm power surge, he used his diamond-edged jeweler shears to snip the secondary alarm wire, took the gemstone, and staged the balcony door to imply an outside cat burglar. His size 9 leather loafers left damp tracks on the marble floor, and the blue velvet fibers on his personal loupe confirm he handled the display cushion.",
        crucialClueIds: ["clue_1", "clue_3", "clue_5"]
      }
    }
  ],

  medium: [
    {
      title: "The Midnight Gala Cyanide Toast",
      story: {
        synopsis: "During Lord Alistair Sterling's 60th birthday gala, he raised a vintage 1947 champagne flute to address his prominent guests. Moments after his first sip, he collapsed clutching his throat. An aroma of bitter almonds lingered around his glass. The storm outside knocked out the conservatory power grid shortly beforehand.",
        victim: "Lord Alistair Sterling",
        crimeScene: "Sterling Grand Ballroom & Private Conservatory",
        crimeType: "Poisoning Homicide",
        timeOfCrime: "11:45 PM during the anniversary toast"
      },
      suspects: [
        {
          id: "suspect_1",
          name: "Lady Genevieve Sterling",
          role: "Spouse & Heiress",
          alibi: "Claims she was greeting guests by the grand foyer staircase with the chamber orchestra.",
          motive: "Furious over a recent codicil disinheriting her in favor of Alistair's secret prodigy.",
          relationship: "Wife of 22 years",
          demeanor: "Composed yet visibly tense, clutching a pearl handkerchief."
        },
        {
          id: "suspect_2",
          name: "Dr. Julian Mercer",
          role: "Personal Physician & Biochemist",
          alibi: "Claims he was upstairs fetching Alistair's angina medicine from the suite.",
          motive: "Alistair uncovered illegal off-book pharmaceutical patents under the hospital wing.",
          relationship: "Lifelong physician and research trustee",
          demeanor: "Analytical, guarded, checking his wristwatch incessantly."
        },
        {
          id: "suspect_3",
          name: "Marcus 'Jax' Finch",
          role: "Sommelier & Caterer",
          alibi: "States he was opening champagne reserves in the basement wine cellar.",
          motive: "Heavily indebted to loan sharks; caught skimming vintage bottles last quarter.",
          relationship: "Head hospitality contractor",
          demeanor: "Nervous, hands shaking slightly while polishing glassware."
        },
        {
          id: "suspect_4",
          name: "Elena Ramos",
          role: "Private Secretary & Archivist",
          alibi: "Claims she was monitoring the silent auction bids in the East Salon.",
          motive: "Discovered Alistair planned to terminate her and seal the archive logs.",
          relationship: "Chief of Staff for 6 years",
          demeanor: "Quiet, observant, holding a leather executive notebook."
        }
      ],
      clues: [
        {
          id: "clue_1",
          title: "Shattered Crystal Flute",
          location: "Grand Ballroom Dais",
          description: "Crystalline residue with noticeable almond scent. Chemical swab confirms crystalline potassium cyanide applied to the inner rim."
        },
        {
          id: "clue_2",
          title: "Dispenser Dropper Bottle",
          location: "Conservatory Orchid Planter",
          description: "A dark amber dropper vial labeled 'Digitalis Tincture' disguised inside soil; chemical residue matches the cyanide on the flute."
        },
        {
          id: "clue_3",
          title: "Torn Cufflink Thread",
          location: "Conservatory Power Fuse Box",
          description: "A monogrammed silk surgical thread snagged on the circuit breaker latch, matching physician lab coat stitching."
        },
        {
          id: "clue_4",
          title: "Cellar Inventory Log",
          location: "Basement Wine Vault",
          description: "Wine logbook indicates bottle #47 was uncorked by Marcus at 11:20 PM under the direct supervision of Dr. Mercer."
        },
        {
          id: "clue_5",
          title: "Encrypted Telegram Draft",
          location: "Library Desk Blotter",
          description: "Drafted wire stating: 'Medical audit finalized. License revocation and federal referral at dawn.' Addressed to Dr. Mercer."
        },
        {
          id: "clue_6",
          title: "Muddy Garden Loafers",
          location: "Rear Scullery Exit",
          description: "Wet loafers size 11 with greenhouse fertilizer and crushed orchid petals along the welt."
        },
        {
          id: "clue_7",
          title: "Altered Medication Vial",
          location: "Upstairs Master Bedroom",
          description: "Standard angina pills intact, but the emergency nitroglycerin spray bottle was drained and wiped with solvent."
        }
      ],
      hints: [
        {
          id: "hint_1",
          text: "Pay close attention to who had clinical access to toxic reagents and knew the victim's exact medical routine."
        },
        {
          id: "hint_2",
          text: "Look closely at the forensic evidence recovered around the conservatory fuse box and the orchid planter."
        },
        {
          id: "hint_3",
          text: "The draft wire on the library desk reveals whose career Lord Alistair was going to terminate at dawn."
        }
      ],
      solution: {
        culpritId: "suspect_2",
        culpritName: "Dr. Julian Mercer",
        motiveExplanation: "Lord Alistair had completed an independent medical audit proving Dr. Mercer engaged in illegal biochemical patents, which would have stripped his medical license and resulted in criminal prosecution.",
        solutionBreakdown: "Dr. Mercer excused himself under the guise of fetching heart medicine. Instead, he made his way to the conservatory fuse box, cutting the power while leaving a torn surgical cufflink thread on the toggle. In the darkness, he used his amber dropper bottle to coat Lord Alistair's champagne flute with potassium cyanide, then stashed the empty dropper inside an orchid planter.",
        crucialClueIds: ["clue_2", "clue_3", "clue_5"]
      }
    }
  ],

  hard: [
    {
      title: "Sabotage at Neon Heights Penthouse",
      story: {
        synopsis: "Tech magnate Vikram Chen was found deceased inside the hermetically sealed vault of his smart penthouse. The neural security system went dark for exactly 180 seconds. Physical security locks were bypassed using a master encrypted biometric keycard.",
        victim: "Vikram Chen, Quantum AI Magnate",
        crimeScene: "Sub-penthouse Autonomous AI Server Chamber",
        crimeType: "Exsanguination by Industrial Laser Severance",
        timeOfCrime: "02:15 AM during automated backup cycle"
      },
      suspects: [
        {
          id: "suspect_1",
          name: "Maya Lin",
          role: "Lead AI Systems Architect",
          alibi: "Claims she was monitoring the server latency remotely from the guest pod.",
          motive: "Vikram was about to sell her humanitarian open-source neural engine to a foreign military contractor.",
          relationship: "Co-founder & Chief Engineer",
          demeanor: "Cold, highly analytical, refuses to look at the crime scene logs."
        },
        {
          id: "suspect_2",
          name: "Cole Vance",
          role: "Head of Private Security",
          alibi: "States he was patrolling the lower sky-deck perimeter on level 45.",
          motive: "Scheduled to be replaced by fully automated combat drones next Monday.",
          relationship: "Head of security for 5 years",
          demeanor: "Defensive, tactical posture, uniform immaculate."
        },
        {
          id: "suspect_3",
          name: "Sloan Sterling",
          role: "Venture Capital Partner",
          alibi: "Sleeping in the guest quarters with noise-cancelling neural implants.",
          motive: "Invested $80M that Vikram diverted to an unauthorized offshore shell account.",
          relationship: "Primary venture backer",
          demeanor: "Aggressive, anxious, demanding his legal counsel."
        },
        {
          id: "suspect_4",
          name: "Dr. Kira Thorne",
          role: "Cybernetic Specialist & Surgeon",
          alibi: "Calibrating biometric diagnostics in the med-bay suite.",
          motive: "Vikram suppressed her whistleblowing report regarding lethal sensor glitches.",
          relationship: "Personal physician & biomedical advisor",
          demeanor: "Empathetic, troubled, nervous speech pattern."
        },
        {
          id: "suspect_5",
          name: "Dante Rossi",
          role: "Autonomous Drone Operator",
          alibi: "Performing drone maintenance on the exterior landing pad.",
          motive: "Blamed for a lethal test crash that ruined his professional flight certification.",
          relationship: "Contract drone flight engineer",
          demeanor: "Quiet, twitchy, smell of electrical solder on his jacket."
        }
      ],
      clues: [
        {
          id: "clue_1",
          title: "De-authorized Keycard",
          location: "Ventilation Shaft Grille",
          description: "A high-clearance executive keycard cloned with firmware build 4.19, unique to Maya Lin's private developer terminal."
        },
        {
          id: "clue_2",
          title: "Overridden Laser Cutter",
          location: "Server Bay Perimeter",
          description: "The maintenance laser was manually re-calibrated from 20 watts to 2000 watts using root console access credentials."
        },
        {
          id: "clue_3",
          title: "Burnt Microcontroller Bypass",
          location: "Security Junction 4",
          description: "A hardware bypass dongle manufactured exclusively in Maya's private rapid-prototyping lab."
        },
        {
          id: "clue_4",
          title: "Encrypted USB Repository",
          location: "Under the Server Subfloor",
          description: "Contains an unauthorized full repository clone titled 'Neural-Engine-Defense-Contract-REVOKED'."
        },
        {
          id: "clue_5",
          title: "Security Drone Flight Log",
          location: "Sky-Deck Docking Bay",
          description: "Logs confirm Cole Vance's patrol never deviated from the outer terrace perimeter during the blackout."
        },
        {
          id: "clue_6",
          title: "Smartwatch Biometric Spike",
          location: "Victim's Left Wrist",
          description: "Vikram's heart rate spiked at 02:14 AM upon recognizing someone with authorized retinal clearance entering the chamber."
        },
        {
          id: "clue_7",
          title: "Wiped Terminal Shell History",
          location: "Desk Hologram Station",
          description: "Terminal history was wiped with script 'maya_cleanup.sh' run at 02:22 AM from root subnet."
        },
        {
          id: "clue_8",
          title: "Silicone Fingerprint Sleeve",
          location: "Recycling Waste Chute",
          description: "A discarded synthetic dermal glove replicating Vikram's right thumb print."
        },
        {
          id: "clue_9",
          title: "Cloud Backup Log Snapshot",
          location: "Offsite Mirror Node",
          description: "Snapshot shows an unauthorized 40TB transfer of neural source code initiated from guest pod terminal."
        }
      ],
      hints: [
        {
          id: "hint_1",
          text: "The security breach required root firmware access and deep familiarity with laser calibration safety thresholds."
        },
        {
          id: "hint_2",
          text: "Check who had a motive directly tied to the defense contract sale and the skills to create custom bypass dongles."
        },
        {
          id: "hint_3",
          text: "Look at the terminal scripts and cloned firmware versions found near the ventilation shaft."
        }
      ],
      solution: {
        culpritId: "suspect_1",
        culpritName: "Maya Lin",
        motiveExplanation: "Vikram secretly signed a contract to sell Maya's life work—a humanitarian open-source AI engine—to a defense conglomerate, betraying their founding charter.",
        solutionBreakdown: "Maya utilized her proprietary firmware dongle to trigger a 180-second localized blindspot in the server chamber. She entered with a cloned keycard, altered the laser cutter safety thresholds from 20 watts to a lethal 2000 watts, and triggered the beam when Vikram approached the console. She then attempted to purge her traces with a cleanup script before downloading the repository.",
        crucialClueIds: ["clue_1", "clue_3", "clue_7"]
      }
    }
  ]
};

/**
 * Get a certified fallback mystery for the given difficulty
 *
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @param {string} [premiseHint] - Optional premise to match theme
 * @returns {object} A deep-cloned validated mystery
 */
export function getFallbackMystery(difficulty = 'medium', premiseHint = '') {
  const normalized = (difficulty || '').toLowerCase().trim();
  const pool = FALLBACK_MYSTERIES[normalized] || FALLBACK_MYSTERIES.medium;
  
  // Pick matching template or default to first
  const selected = pool[0];
  
  // Deep clone to prevent any state mutation
  const cloned = JSON.parse(JSON.stringify(selected));

  // If user provided a custom premise, customize the title smoothly without invalidating the narrative
  if (premiseHint && premiseHint.trim().length >= 5) {
    const cleanPremise = premiseHint.trim();
    if (cleanPremise.length <= 40) {
      cloned.title = `The Case of ${cleanPremise}`;
    }
  }

  return cloned;
}
