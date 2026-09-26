/**
 * Authoritative Historical Star Wars Lines & Figure Dataset
 * Spanning 1977 Kenner to 2026 Modern Hasbro.
 * Includes:
 * - Vintage Kenner (1977-1985) - 96 Original Figures & Variations
 * - The Power of the Force (1985 Coin Line)
 * - The Power of the Force 2 (1995-2000)
 * - Episode I: The Phantom Menace (1999 CommTech)
 * - Episode II: Attack of the Clones (2002-2004 Blue Card)
 * - Vintage Original Trilogy Collection / VOTC (2004)
 * - 30th Anniversary Collection / TAC (2007)
 * - The Vintage Collection / TVC (2010-Present)
 * - The Black Series 6" (2013-Present)
 * - Retro Collection (2019-Present)
 * - Modern Streaming Lines: The Mandalorian, Andor, Ahsoka, Skeleton Crew, The Book of Boba Fett
 */

export interface SeedLine {
  id: string;
  name: string;
  franchiseId: string;
  manufacturerId: string;
  startYear: number;
  endYear?: number;
  scale: string;
  description: string;
}

export interface SeedFigure {
  id: string;
  name: string;
  code?: string;
  lineId: string;
  year: number;
  barcode?: string;
  description: string;
  imageUrl: string;
  sculptDetails?: string;
  character?: {
    id: string;
    name: string;
    desc: string;
    affiliation?: string;
  };
}

export const STAR_WARS_LINES: SeedLine[] = [
  {
    id: 'line-sw-vintage',
    name: 'Vintage Star Wars Kenner (1977–1985)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-kenner',
    startYear: 1977,
    endYear: 1985,
    scale: '3.75 inch (1:18)',
    description: 'The legendary original Kenner 3.75" toyline featuring the famous 96 action figures across Star Wars, The Empire Strikes Back, and Return of the Jedi.'
  },
  {
    id: 'line-sw-potf-1985',
    name: 'The Power of the Force - Coin Line (1985)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-kenner',
    startYear: 1985,
    endYear: 1985,
    scale: '3.75 inch (1:18)',
    description: 'The final vintage Kenner series celebrated for packaging an aluminum collector coin with each figure, including the ultra-rare "Last 17".'
  },
  {
    id: 'line-sw-potf2',
    name: 'The Power of the Force 2 (1995–2000)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-kenner',
    startYear: 1995,
    endYear: 2000,
    scale: '3.75 inch (1:18)',
    description: 'The massive 1990s Kenner/Hasbro resurgence characterized by muscular sculpts, orange/red cards, green cards, holographic foil, and Freeze Frame slides.'
  },
  {
    id: 'line-sw-ep1',
    name: 'Episode I: The Phantom Menace (1999)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 1999,
    endYear: 2000,
    scale: '3.75 inch (1:18)',
    description: 'Hasbro blister cards with green galactic backing and interactive CommTech chips that played movie voice lines when placed on the CommTech Reader.'
  },
  {
    id: 'line-sw-aotc',
    name: 'Episode II: Attack of the Clones - Blue Card (2002–2004)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2002,
    endYear: 2004,
    scale: '3.75 inch (1:18)',
    description: 'The iconic "Saga" blue blister cardback line featuring Jango Fett, Geonosis Arenas, Clone Troopers, action features, and collectible display stands.'
  },
  {
    id: 'line-sw-votc',
    name: 'Vintage Original Trilogy Collection / VOTC (2004)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2004,
    endYear: 2005,
    scale: '3.75 inch (1:18)',
    description: 'Hasbro landmark line re-introducing original Kenner-style blister card designs with modern super-articulation inside premium clamshell cases.'
  },
  {
    id: 'line-sw-tac',
    name: '30th Anniversary Collection / TAC (2007)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2007,
    endYear: 2008,
    scale: '3.75 inch (1:18)',
    description: 'Celebrating 30 years since 1977, featuring stylized cardbacks, collectible metallic coins, and Ralph McQuarrie concept art figures.'
  },
  {
    id: 'line-sw-tvc',
    name: 'The Vintage Collection / TVC (2010–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2010,
    scale: '3.75 inch (1:18)',
    description: 'The ongoing collector standard with continuous "VC" numbering, Kenner tribute packaging, photoreal face deco, and movie/series accuracy.'
  },
  {
    id: 'line-sw-tbs',
    name: 'The Black Series 6" (2013–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2013,
    scale: '6 inch (1:12)',
    description: 'Hasbro premier 6-inch collector scale line with numbered window boxes, mural spine artwork, cloth cloaks, and high articulation.'
  },
  {
    id: 'line-sw-retro',
    name: 'Retro Collection (2019–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2019,
    scale: '3.75 inch (1:18)',
    description: 'Nostalgic modern line recreating 1970s 5-POA Kenner aesthetic, weathered vintage cardbacks, vinyl capes, and retro stickers.'
  },
  {
    id: 'line-sw-mandalorian',
    name: 'The Mandalorian Line (2019–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2019,
    scale: '3.75" & 6"',
    description: 'Official Hasbro releases from the Disney+ series created by Jon Favreau, starring Din Djarin, Grogu, Moff Gideon, and Bo-Katan Kryze.'
  },
  {
    id: 'line-sw-boba-fett',
    name: 'The Book of Boba Fett Line (2021–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2021,
    scale: '3.75" & 6"',
    description: 'Figures detailing Boba Fett and Fennec Shand conquering Jabba palace on Tatooine, Cad Bane, and the Pyke Syndicate.'
  },
  {
    id: 'line-sw-andor',
    name: 'Andor Line (2022–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2022,
    scale: '3.75" & 6"',
    description: 'Dedicated releases for Tony Gilroy critically acclaimed spy thriller, starring Cassian Andor, Luthen Rael, Bix Caleen, and Dedra Meero.'
  },
  {
    id: 'line-sw-ahsoka',
    name: 'Ahsoka Line (2023–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2023,
    scale: '3.75" & 6"',
    description: 'Celebrating Dave Filoni series with Ahsoka Tano, Grand Admiral Thrawn, Sabine Wren, Hera Syndulla, Shin Hati, and Baylan Skoll.'
  },
  {
    id: 'line-sw-skeleton-crew',
    name: 'Skeleton Crew Line (2024–Present)',
    franchiseId: 'fran-star-wars',
    manufacturerId: 'mfr-hasbro',
    startYear: 2024,
    scale: '3.75" & 6"',
    description: 'Hasbro figures for the upcoming adventurous coming-of-age Star Wars saga starring Jude Law as Jod Na Nawood.'
  }
];

export const STAR_WARS_FIGURES: SeedFigure[] = [
  // ==========================================
  // THE 96 ORIGINAL VINTAGE KENNER FIGURES (1977-1985)
  // ==========================================
  // Wave 1: The Original 12 (1978)
  {
    id: 'fig-sw-luke-1978',
    name: 'Luke Skywalker (Farmboy)',
    code: 'SW-12-01',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382101',
    description: 'The inaugural 1978 Kenner figure of Luke Skywalker in his white Tatooine tunic with telescoping lightsaber.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    sculptDetails: '5 points of articulation; right arm internal channel with sliding yellow telescoping saber.',
    character: { id: 'char-luke-skywalker', name: 'Luke Skywalker', desc: 'The Tatooine farm boy destined to become a Jedi.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-princess-leia-1978',
    name: 'Princess Leia Organa (White Gown)',
    code: 'SW-12-02',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382200',
    description: 'Original 1978 release with white vinyl cape and blue/black imperial blaster pistol.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    sculptDetails: 'Molded classic cinnamon bun hairstyle, white vinyl cape with armholes.',
    character: { id: 'char-leia-organa', name: 'Princess Leia Organa', desc: 'Alderaanian senator and fearless Rebel leader.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-han-solo-1978',
    name: 'Han Solo (Small Head / Large Head)',
    code: 'SW-12-03',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382309',
    description: 'Core smuggler with striped Corellian bloodstripe pants, black vest, and DL-44 blaster.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    sculptDetails: 'Produced in two main head sculpt varieties: original "Small Head" and later 1979 "Large Head".',
    character: { id: 'char-han-solo', name: 'Han Solo', desc: 'Captain of the Millennium Falcon.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-chewbacca-1978',
    name: 'Chewbacca',
    code: 'SW-12-04',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382408',
    description: 'The mighty Wookiee co-pilot towering above standard figures with molded bandolier and Bowcaster.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-chewbacca', name: 'Chewbacca', desc: 'Loyal Wookiee warrior and co-pilot.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-c3po-1978',
    name: 'C-3PO',
    code: 'SW-12-05',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382507',
    description: 'Vacuum-metalized shiny gold protocol droid fluent in over six million forms of communication.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-c3po', name: 'C-3PO', desc: 'Golden protocol droid.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-r2d2-1978',
    name: 'R2-D2 (Solid Dome)',
    code: 'SW-12-06',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382606',
    description: 'Astromech droid with chrome clicker dome that ratchets when rotated and paper sticker body.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-r2d2', name: 'R2-D2', desc: 'Resourceful Astromech droid.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-darth-vader-1978',
    name: 'Darth Vader',
    code: 'SW-12-07',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382705',
    description: 'Dark Lord of the Sith with black vinyl cape and telescoping red lightsaber.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    sculptDetails: 'Sliding red lightsaber filament in right arm, black textured vinyl cape.',
    character: { id: 'char-darth-vader', name: 'Darth Vader', desc: 'Dark Lord of the Sith.', affiliation: 'Galactic Empire' }
  },
  {
    id: 'fig-sw-stormtrooper-1978',
    name: 'Stormtrooper',
    code: 'SW-12-08',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382804',
    description: 'Imperial shock trooper in pristine white armor equipped with standard black Imperial blaster.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-stormtrooper', name: 'Stormtrooper', desc: 'Imperial soldier.', affiliation: 'Galactic Empire' }
  },
  {
    id: 'fig-sw-obiwan-1978',
    name: 'Ben (Obi-Wan) Kenobi',
    code: 'SW-12-09',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281382903',
    description: 'Jedi Master in brown tunic and vinyl cloak, armed with telescoping blue lightsaber.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-obiwan-kenobi', name: 'Obi-Wan Kenobi', desc: 'Legendary Jedi Master.', affiliation: 'Jedi Order' }
  },
  {
    id: 'fig-sw-jawa-1978',
    name: 'Jawa (Vinyl Cape / Cloth Cape)',
    code: 'SW-12-10',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281383009',
    description: 'Tatooine scavenger famous for the legendary ultra-rare early vinyl cape before switching to cloth.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    sculptDetails: 'Initial 12-back production had a brown vinyl cape matching Ben Kenobi; later substituted with brown cloth cape.',
    character: { id: 'char-jawa', name: 'Jawa', desc: 'Tatooine scavenger.', affiliation: 'Independent' }
  },
  {
    id: 'fig-sw-sandperson-1978',
    name: 'Sand People (Tusken Raider)',
    code: 'SW-12-11',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281383108',
    description: 'Fierce desert nomad of Tatooine equipped with gaderffii stick (Gaffi stick).',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-tusken-raider', name: 'Tusken Raider', desc: 'Desert nomad of Tatooine.', affiliation: 'Independent' }
  },
  {
    id: 'fig-sw-death-squad-1978',
    name: 'Death Squad Commander / Star Destroyer Commander',
    code: 'SW-12-12',
    lineId: 'line-sw-vintage',
    year: 1978,
    barcode: '076281383207',
    description: 'Imperial technician with gray tunic and iconic helmet. Card title was renamed to Star Destroyer Commander on later cardbacks.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-imperial-commander', name: 'Death Squad Commander', desc: 'Imperial naval officer.', affiliation: 'Galactic Empire' }
  },

  // 1979 - 20/21 Back additions & Boba Fett
  {
    id: 'fig-sw-boba-fett-1979',
    name: 'Boba Fett (Kenner 1979)',
    code: 'SW-21-01',
    lineId: 'line-sw-vintage',
    year: 1979,
    barcode: '076281392506',
    description: 'The holy grail mail-away bounty hunter figure with molded jetpack and imperial blaster.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    sculptDetails: 'Originally advertised as a rocket-firing figure; replaced with fixed glued missile for child safety.',
    character: { id: 'char-boba-fett', name: 'Boba Fett', desc: 'Deadliest bounty hunter in the galaxy.', affiliation: 'Bounty Hunters Guild' }
  },
  {
    id: 'fig-sw-greedo-1979',
    name: 'Greedo',
    code: 'SW-20-02',
    lineId: 'line-sw-vintage',
    year: 1979,
    barcode: '076281392605',
    description: 'Rodian bounty hunter working for Jabba the Hutt, wearing iconic teal-green space jumpsuit.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-greedo', name: 'Greedo', desc: 'Rodian bounty hunter.', affiliation: 'Hutt Clan' }
  },
  {
    id: 'fig-sw-hammerhead-1979',
    name: 'Hammerhead (Momaw Nadon)',
    code: 'SW-20-03',
    lineId: 'line-sw-vintage',
    year: 1979,
    barcode: '076281392704',
    description: 'Ithorian patron from the Mos Eisley Cantina with dual mouths on either side of his curved neck.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-momaw-nadon', name: 'Hammerhead (Momaw Nadon)', desc: 'Peaceful Ithorian exile.', affiliation: 'Independent' }
  },
  {
    id: 'fig-sw-walrusman-1979',
    name: 'Walrus Man (Ponda Baba)',
    code: 'SW-20-04',
    lineId: 'line-sw-vintage',
    year: 1979,
    barcode: '076281392803',
    description: 'Aquavlish thug whose arm was famously sliced by Obi-Wan Kenobi in the Mos Eisley Cantina.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-ponda-baba', name: 'Walrus Man (Ponda Baba)', desc: 'Cantina brawler.', affiliation: 'Underworld' }
  },
  {
    id: 'fig-sw-snaggletooth-1979',
    name: 'Snaggletooth (Blue / Red Zutton)',
    code: 'SW-20-05',
    lineId: 'line-sw-vintage',
    year: 1979,
    barcode: '076281392902',
    description: 'Famous Sears exclusive Blue Snaggletooth (tall, silver boots) vs standard blister card Red Snaggletooth.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-snaggletooth', name: 'Snaggletooth (Zutton)', desc: 'Snivvian artist and wanderer.', affiliation: 'Independent' }
  },

  // The Empire Strikes Back (1980-1982) Highlights
  {
    id: 'fig-sw-yoda-1980',
    name: 'Yoda (Orange Snake / Brown Snake)',
    code: 'ESB-31-01',
    lineId: 'line-sw-vintage',
    year: 1980,
    barcode: '076281397006',
    description: 'Grand Master of the Jedi Order with soft cloth robe, cane, snake, and belt.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-yoda', name: 'Yoda', desc: 'Grand Master of the Jedi Council.', affiliation: 'Jedi Order' }
  },
  {
    id: 'fig-sw-lando-1980',
    name: 'Lando Calrissian (Smile / Teeth)',
    code: 'ESB-31-02',
    lineId: 'line-sw-vintage',
    year: 1980,
    barcode: '076281397105',
    description: 'Baron Administrator of Cloud City with detailed vinyl cape with blue printed interior lining.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-lando-calrissian', name: 'Lando Calrissian', desc: 'Baron Administrator of Cloud City.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-snowtrooper-1980',
    name: 'Imperial Stormtrooper (Hoth Battle Gear)',
    code: 'ESB-31-03',
    lineId: 'line-sw-vintage',
    year: 1980,
    barcode: '076281397204',
    description: 'Hoth assault Snowtrooper with cowl cape, backpack, and heavy blaster rifle.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-snowtrooper', name: 'Snowtrooper', desc: 'Cold weather assault stormtrooper.', affiliation: 'Galactic Empire' }
  },
  {
    id: 'fig-sw-bossk-1980',
    name: 'Bossk (Bounty Hunter)',
    code: 'ESB-31-04',
    lineId: 'line-sw-vintage',
    year: 1980,
    barcode: '076281397303',
    description: 'Trandoshan tracker in yellow flight suit with mortar gun rifle.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-bossk', name: 'Bossk', desc: 'Trandoshan bounty hunter.', affiliation: 'Bounty Hunters Guild' }
  },
  {
    id: 'fig-sw-ig88-1980',
    name: 'IG-88 (Assassin Droid)',
    code: 'ESB-31-05',
    lineId: 'line-sw-vintage',
    year: 1980,
    barcode: '076281397402',
    description: 'Lethal chrome Phlutdroid assassin droid with long sniper rifle and sidearm.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-ig88', name: 'IG-88', desc: 'Feared assassin droid.', affiliation: 'Bounty Hunters Guild' }
  },

  // Return of the Jedi (1983-1984) Highlights
  {
    id: 'fig-sw-luke-jedi-1983',
    name: 'Luke Skywalker (Jedi Knight Outfit)',
    code: 'ROTJ-65-01',
    lineId: 'line-sw-vintage',
    year: 1983,
    barcode: '076281703104',
    description: 'Luke in black Jedi garments, snap cloak, and blue or green lightsaber (mold variant).',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-luke-skywalker', name: 'Luke Skywalker', desc: 'Jedi Knight of the New Republic.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-biker-scout-1983',
    name: 'Biker Scout',
    code: 'ROTJ-65-02',
    lineId: 'line-sw-vintage',
    year: 1983,
    barcode: '076281703203',
    description: 'Imperial Scout Trooper patrolling the forest moon of Endor with boot holster miniature pistol.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-scout-trooper', name: 'Biker Scout', desc: 'Endor scout trooper.', affiliation: 'Galactic Empire' }
  },
  {
    id: 'fig-sw-royal-guard-1983',
    name: 'Emperor Royal Guard',
    code: 'ROTJ-65-03',
    lineId: 'line-sw-vintage',
    year: 1983,
    barcode: '076281703302',
    description: 'Silent crimson-robed elite bodyguard of Emperor Palpatine with force pike.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-royal-guard', name: 'Emperor Royal Guard', desc: 'Personal bodyguard to the Emperor.', affiliation: 'Galactic Empire' }
  },

  // 1985 The Power of the Force "Last 17" Highlights
  {
    id: 'fig-sw-yakface-1985',
    name: 'Yak Face (Saelt-Marae)',
    code: 'POTF-92-01',
    lineId: 'line-sw-potf-1985',
    year: 1985,
    barcode: '076281715404',
    description: 'The most legendary grail of the vintage line. Unreleased on cards in the US, distributed primarily in Canada and Europe (Tri-Logo).',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-yak-face', name: 'Yak Face (Saelt-Marae)', desc: 'Yarkora informant in Jabba Court.', affiliation: 'Hutt Clan' }
  },
  {
    id: 'fig-sw-anakin-1985',
    name: 'Anakin Skywalker (Vintage Last 17)',
    code: 'POTF-92-02',
    lineId: 'line-sw-potf-1985',
    year: 1985,
    barcode: '076281715503',
    description: 'Redeemed spirit of Anakin Skywalker as portrayed by Sebastian Shaw, released on POTF coin card and mail-away.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-anakin-skywalker', name: 'Anakin Skywalker', desc: 'The Chosen One, redeemed.', affiliation: 'Jedi Order' }
  },

  // ==========================================
  // THE POWER OF THE FORCE 2 (1995-2000)
  // ==========================================
  {
    id: 'fig-sw-vader-potf2',
    name: 'Darth Vader (POTF2 Red Card)',
    code: 'POTF2-84185',
    lineId: 'line-sw-potf2',
    year: 1995,
    barcode: '076281841851',
    description: 'The 1995 revival Darth Vader featuring the iconic muscular superhero build and red cardback.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-darth-vader', name: 'Darth Vader', desc: 'Dark Lord of the Sith.', affiliation: 'Galactic Empire' }
  },
  {
    id: 'fig-sw-luke-potf2-longsaber',
    name: 'Luke Skywalker (POTF2 Long Saber Variant)',
    code: 'POTF2-84180',
    lineId: 'line-sw-potf2',
    year: 1995,
    barcode: '076281841806',
    description: 'Muscular farmboy Luke with the coveted transitional "Long Saber" reaching past his shoulder.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-luke-skywalker', name: 'Luke Skywalker', desc: 'Hero of the Rebellion.', affiliation: 'Rebel Alliance' }
  },

  // ==========================================
  // EPISODE I: THE PHANTOM MENACE (1999)
  // ==========================================
  {
    id: 'fig-sw-maul-ep1',
    name: 'Darth Maul (Jedi Duel)',
    code: 'EP1-84071',
    lineId: 'line-sw-ep1',
    year: 1999,
    barcode: '076281840717',
    description: 'Sith apprentice with double-bladed red lightsaber and green CommTech voice chip.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-darth-maul', name: 'Darth Maul', desc: 'Sith Lord wielding double-bladed saber.', affiliation: 'Sith' }
  },
  {
    id: 'fig-sw-quigon-ep1',
    name: 'Qui-Gon Jinn (Jedi Master)',
    code: 'EP1-84072',
    lineId: 'line-sw-ep1',
    year: 1999,
    barcode: '076281840724',
    description: 'Wise Jedi Master who discovered Anakin Skywalker on Tatooine, with green lightsaber and CommTech chip.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-quigon-jinn', name: 'Qui-Gon Jinn', desc: 'Maverick Jedi Master.', affiliation: 'Jedi Order' }
  },

  // ==========================================
  // EPISODE II: ATTACK OF THE CLONES (2002-2004 BLUE CARD)
  // ==========================================
  {
    id: 'fig-sw-jango-aotc',
    name: 'Jango Fett (Kamino Escape - Blue Card)',
    code: 'SAGA-02-13',
    lineId: 'line-sw-aotc',
    year: 2002,
    barcode: '076930848578',
    description: 'Legendary blue blister card issue with dual WESTAR-34 blasters, removable helmet, and magnetic grapple hook.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-jango-fett', name: 'Jango Fett', desc: 'Mandalorian bounty hunter and clone template.', affiliation: 'Bounty Hunters Guild' }
  },
  {
    id: 'fig-sw-clone-trooper-aotc',
    name: 'Clone Trooper (Red Captain - Blue Card)',
    code: 'SAGA-02-49',
    lineId: 'line-sw-aotc',
    year: 2002,
    barcode: '076930849209',
    description: 'Phase I Grand Army of the Republic Clone Captain in red field rank armor markings.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-clone-captain', name: 'Clone Trooper Captain', desc: 'Phase I clone officer.', affiliation: 'Galactic Republic' }
  },

  // ==========================================
  // VOTC & 30TH ANNIVERSARY COLLECTION (2004 / 2007)
  // ==========================================
  {
    id: 'fig-sw-boba-votc',
    name: 'Boba Fett (VOTC Vintage Clamshell)',
    code: 'VOTC-06',
    lineId: 'line-sw-votc',
    year: 2004,
    barcode: '076930852087',
    description: 'Super-articulated Boba Fett in classic Kenner cardback encased in premium protective clamshell.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-boba-fett', name: 'Boba Fett', desc: 'Bounty hunter extraordinaire.', affiliation: 'Bounty Hunters Guild' }
  },
  {
    id: 'fig-sw-mcquarrie-vader-tac',
    name: 'Concept Art Darth Vader (30th Anniversary Collection)',
    code: 'TAC-07-28',
    lineId: 'line-sw-tac',
    year: 2007,
    barcode: '076930873426',
    description: 'Direct translation of Ralph McQuarrie 1975 concept painting, packaged with gold 30th collector coin.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-darth-vader', name: 'Darth Vader (Concept)', desc: 'Ralph McQuarrie conceptual design.', affiliation: 'Galactic Empire' }
  },

  // ==========================================
  // THE VINTAGE COLLECTION & RETRO COLLECTION
  // ==========================================
  {
    id: 'fig-sw-boba-vc09',
    name: 'Boba Fett (TVC VC09)',
    code: 'VC09',
    lineId: 'line-sw-tvc',
    year: 2010,
    barcode: '065356952758',
    description: 'The benchmark modern super-articulated Return of the Jedi Boba Fett on authentic Kenner-style card.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-boba-fett', name: 'Boba Fett', desc: 'Bounty hunter.', affiliation: 'Bounty Hunters Guild' }
  },
  {
    id: 'fig-sw-retro-mando',
    name: 'The Mandalorian (Retro Collection Kenner Style)',
    code: 'RETRO-MANDO-01',
    lineId: 'line-sw-retro',
    year: 2021,
    barcode: '501099387201',
    description: 'Din Djarin rendered as if created by Kenner in 1979: 5 points of articulation with simulated cardback wear sticker.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-din-djarin', name: 'Din Djarin', desc: 'The Mandalorian.', affiliation: 'Children of the Watch' }
  },

  // ==========================================
  // THE BLACK SERIES 6" (2013-Present)
  // ==========================================
  {
    id: 'fig-sw-tbs-mando-beskar',
    name: 'The Mandalorian (Beskar Armor 6" Black Series)',
    code: 'TBS-MANDO-01',
    lineId: 'line-sw-tbs',
    year: 2020,
    barcode: '501099373516',
    description: 'Full shimmering Beskar armor 6-inch figure with Amban phase-pulse blaster rifle, jetpack, and blaster pistol.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-din-djarin', name: 'Din Djarin', desc: 'The Mandalorian in Beskar.', affiliation: 'Children of the Watch' }
  },
  {
    id: 'fig-sw-tbs-grogu',
    name: 'Grogu (The Child 6" Scale)',
    code: 'TBS-GROGU-01',
    lineId: 'line-sw-tbs',
    year: 2020,
    barcode: '501099373523',
    description: 'The beloved Force-sensitive youngling with bone broth bowl, Razor Crest control knob, and frog.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-grogu', name: 'Grogu', desc: 'Force-sensitive foundling.', affiliation: 'Mandalorian / Jedi' }
  },

  // ==========================================
  // MODERN STREAMING LINES (MANDALORIAN, BOBA FETT, ANDOR, AHSOKA, SKELETON CREW)
  // ==========================================
  {
    id: 'fig-sw-mando-bokatankryze',
    name: 'Bo-Katan Kryze (The Mandalorian TVC VC226)',
    code: 'VC226',
    lineId: 'line-sw-mandalorian',
    year: 2022,
    barcode: '501099395213',
    description: 'Nite Owls leader with photoreal portrait of Sackhoff, removable helmet, and dual blasters.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-bokatan', name: 'Bo-Katan Kryze', desc: 'Regent and leader of Mandalore.', affiliation: 'Mandalorians' }
  },
  {
    id: 'fig-sw-boba-daimyo',
    name: 'Boba Fett (Tatooine Daimyo / Throne Room)',
    code: 'VC254',
    lineId: 'line-sw-boba-fett',
    year: 2022,
    barcode: '501099411241',
    description: 'Boba Fett as Lord of Mos Espa, featuring removable helmet with lowered rangefinder, gaffi stick, and cloth kama.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-boba-fett', name: 'Boba Fett', desc: 'Daimyo of Mos Espa.', affiliation: 'Boba Fett Syndicate' }
  },
  {
    id: 'fig-sw-cad-bane-tbobf',
    name: 'Cad Bane (The Book of Boba Fett 6")',
    code: 'TBS-BOBA-05',
    lineId: 'line-sw-boba-fett',
    year: 2023,
    barcode: '501099415898',
    description: 'The ruthless Duros gunslinger hire by the Pyke Syndicate with breathing tubes, duster coat, and twin blasters.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-cad-bane', name: 'Cad Bane', desc: 'Notorious Duros mercenary.', affiliation: 'Pyke Syndicate' }
  },
  {
    id: 'fig-sw-cassian-andor',
    name: 'Cassian Andor (Aldhani Mission TVC VC261)',
    code: 'VC261',
    lineId: 'line-sw-andor',
    year: 2023,
    barcode: '501099416208',
    description: 'Cassian in his tactical winter gear from the Aldhani garrison heist in the acclaimed Andor series.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-cassian-andor', name: 'Cassian Andor', desc: 'Rebel Intelligence operative.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-luthen-rael-andor',
    name: 'Luthen Rael (Coruscant Antiquities Dealer 6")',
    code: 'TBS-ANDOR-02',
    lineId: 'line-sw-andor',
    year: 2023,
    barcode: '501099416215',
    description: 'The mastermind behind the early Rebel network, equipped with cloaked trench coat and custom modular blaster.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-luthen-rael', name: 'Luthen Rael', desc: 'Architect of the Rebel Alliance.', affiliation: 'Rebel Alliance' }
  },
  {
    id: 'fig-sw-ahsoka-tano-series',
    name: 'Ahsoka Tano (Ahsoka Series TVC VC302)',
    code: 'VC302',
    lineId: 'line-sw-ahsoka',
    year: 2023,
    barcode: '501099614210',
    description: 'Former Jedi Padawan in grey tunic wielding dual white curved-hilt lightsabers on Kenner cardback.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-ahsoka-tano', name: 'Ahsoka Tano', desc: 'Ronin Jedi seeking Ezra Bridger.', affiliation: 'Independent' }
  },
  {
    id: 'fig-sw-thrawn-ahsoka',
    name: 'Grand Admiral Thrawn (Peridea Exile 6")',
    code: 'TBS-AHSOKA-04',
    lineId: 'line-sw-ahsoka',
    year: 2024,
    barcode: '501099618522',
    description: 'The Chiss tactical genius returning from Peridea with gold-repaired Imperial uniform and red eyes.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-thrawn', name: 'Grand Admiral Thrawn', desc: 'Heir to the Empire.', affiliation: 'Imperial Remnant' }
  },
  {
    id: 'fig-sw-baylan-skoll',
    name: 'Baylan Skoll (Mercenary 6")',
    code: 'TBS-AHSOKA-05',
    lineId: 'line-sw-ahsoka',
    year: 2024,
    barcode: '501099618539',
    description: 'Former Jedi turned armored mercenary with distinctive broadsword orange lightsaber blade.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-baylan-skoll', name: 'Baylan Skoll', desc: 'Armored Force wielder.', affiliation: 'Independent' }
  },
  {
    id: 'fig-sw-skeleton-crew-jod',
    name: 'Jod Na Nawood (Skeleton Crew TVC VC330)',
    code: 'VC330',
    lineId: 'line-sw-skeleton-crew',
    year: 2024,
    barcode: '501099622109',
    description: 'The mysterious Force-wielding explorer from Star Wars: Skeleton Crew portrayed by Jude Law.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: { id: 'char-jod-na-nawood', name: 'Jod Na Nawood', desc: 'Rambling explorer of the Unknown Regions.', affiliation: 'Independent' }
  }
];
