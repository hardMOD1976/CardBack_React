/**
 * Authoritative Catalogue Seed Data for Cardback
 * Mirrors PostgreSQL/Prisma relations and provides complete mock for the REST API
 */

import {
  FranchiseDetailResponseDto,
  ManufacturerDetailResponseDto,
  LineDetailResponseDto,
  CharacterDetailResponseDto,
  FigureDetailResponseDto,
  VariantDetailResponseDto,
  ProductReleaseDetailResponseDto,
  OwnedFigure
} from '../types/domain';

export const MANUFACTURERS: ManufacturerDetailResponseDto[] = [
  {
    id: 'mfr-kenner',
    name: 'Kenner Products',
    country: 'United States',
    foundedYear: 1946,
    headquarters: 'Cincinnati, Ohio',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    description: 'Pioneering American toy company famous for revolutionizing action figure scale with 3.75-inch figures in 1977 and securing the license of the century for Star Wars.',
    history: 'Founded in 1946 by Albert, Phillip, and Joseph L. Steiner, Kenner became a titan of toy manufacturing. In 1977, when Mego declined the Star Wars licensing agreement, Kenner took the risk and created the 3.75" action figure format that defined toy collecting for decades.',
    impactOnActionFigures: 'Invented the modern 3.75" action figure standard, blister cardback format with character checklists, and the revolutionary "Early Bird Certificate Package" when figures were not ready in time for Christmas 1977.',
    linesProduced: []
  },
  {
    id: 'mfr-hasbro',
    name: 'Hasbro',
    country: 'United States',
    foundedYear: 1923,
    headquarters: 'Pawtucket, Rhode Island',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
    description: 'One of the largest toy makers in world history, creator of G.I. Joe (the original action figure in 1964), Transformers, and modern Star Wars The Vintage Collection.',
    history: 'Founded in 1923 by the Hassenfeld brothers. Coined the phrase "action figure" in 1964 for G.I. Joe to appeal to boys who wouldn\'t play with "dolls". Acquired Tonka/Kenner in 1991.',
    impactOnActionFigures: 'Coined the term "Action Figure" in 1964, established 6-inch collector scale collector lines like Marvel Legends and Star Wars Black Series, and developed photorealistic FacePrint technology.',
    linesProduced: []
  },
  {
    id: 'mfr-mattel',
    name: 'Mattel',
    country: 'United States',
    foundedYear: 1945,
    headquarters: 'El Segundo, California',
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&auto=format&fit=crop&q=80',
    description: 'Global toy powerhouse behind Masters of the Universe, Barbie, and Hot Wheels. Mastered the 5.5" bulky muscle-bound hero aesthetic.',
    history: 'Founded by Harold Matson and Elliot Handler in 1945. Created Masters of the Universe in 1982 after famously turning down the Star Wars toy license in 1976.',
    impactOnActionFigures: 'Defined the iconic 5.5" muscular fantasy archetype, spring-loaded waist "power punches", and bundled mini-comics that built world lore directly on toy shelves.',
    linesProduced: []
  },
  {
    id: 'mfr-playmates',
    name: 'Playmates Toys',
    country: 'Hong Kong / United States',
    foundedYear: 1966,
    headquarters: 'Costa Mesa, California & Hong Kong',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    description: 'Legendary manufacturer that turned Teenage Mutant Ninja Turtles into a global multibillion-dollar collecting phenomenon starting in 1988.',
    history: 'Partnered with Mirage Studios and Murakami-Wolf-Swenson in 1987 to produce TMNT action figures, which dominated worldwide toy aisles for almost a decade.',
    impactOnActionFigures: 'Mastered rubberized accessories, expressive sculpts, weapons racks connected by plastic sprues, and quirky mutated character rosters.',
    linesProduced: []
  }
];

export const FRANCHISES: FranchiseDetailResponseDto[] = [
  {
    id: 'fran-star-wars',
    name: 'Star Wars',
    slug: 'star-wars',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    headerBannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    description: 'The monumental space opera created by George Lucas that defined contemporary popular culture and single-handedly gave birth to modern action figure collecting.',
    history: 'Debuting on May 25, 1977, Star Wars became an immediate worldwide cultural phenomenon. Its revolutionary merchandising agreement gave George Lucas licensing rights that transformed the entertainment and toy industries forever.',
    actionFigureLoreContext: 'Action figure collecting as an international hobby owes its foundational rules to Star Wars. From Kenner\'s 1977 12-Back cards to modern photoreal Vintage Collection releases, Star Wars established cardback numbering (12-back, 21-back, 65-back), mail-away promos, and variant hunting.',
    originYear: 1977,
    creator: 'George Lucas',
    lines: [],
    keyCharacters: [],
    totalFiguresCount: 0
  },
  {
    id: 'fran-motu',
    name: 'Masters of the Universe',
    slug: 'masters-of-the-universe',
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
    headerBannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    description: 'The epic sword and sorcery sci-fi fantasy universe of Eternia, pitting Prince Adam / He-Man against the evil Lord of Destruction Skeletor.',
    history: 'Created by Mattel in 1981-1982 by a design team led by Mark Taylor and Roger Sweet. It became one of the dominant toy lines of the 1980s, generating billions in revenue and spawning an iconic Filmation animated series.',
    actionFigureLoreContext: 'Famous for the unique 5.5-inch squat sculpt, rotocast heads, spring-loaded torso power punch mechanism, and blister card art painted by legendary fantasy illustrators such as Alfredo Alcala and Rudy Obrero.',
    originYear: 1982,
    creator: 'Mark Taylor & Mattel Design Team',
    lines: [],
    keyCharacters: [],
    totalFiguresCount: 0
  },
  {
    id: 'fran-tmnt',
    name: 'Teenage Mutant Ninja Turtles',
    slug: 'teenage-mutant-ninja-turtles',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    description: 'The beloved quartet of mutant turtles trained in ninjutsu by Master Splinter, defending New York City from the Foot Clan and Shredder.',
    history: 'Conceived in November 1983 by Kevin Eastman and Peter Laird as an underground comic book parody of Daredevil and New Mutants, TMNT blossomed into a global media franchise in 1987.',
    actionFigureLoreContext: 'Playmates\' 1988 line introduced weapon sprues molded in brown plastic, soft-head early production variants, and vivid comic-accurate blister packaging.',
    originYear: 1984,
    creator: 'Kevin Eastman & Peter Laird',
    lines: [],
    keyCharacters: [],
    totalFiguresCount: 0
  },
  {
    id: 'fran-transformers',
    name: 'Transformers',
    slug: 'transformers',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    description: 'Sentient alien robots from the planet Cybertron split into noble Autobots and tyrannical Decepticons, capable of transforming into vehicles and devices.',
    history: 'Created by Hasbro in 1984 by licensing Japanese mecha toy lines Diaclone and Microman from Takara, integrated with lore crafted by Marvel Comics writers Bob Budiansky and Jim Shooter.',
    actionFigureLoreContext: 'Transformers pioneered die-cast metal parts, rub-sign heat-sensitive faction symbols, detailed tech specs decipherable with red decoder film, and multi-tier mechanical engineering.',
    originYear: 1984,
    creator: 'Hasbro & Takara',
    lines: [],
    keyCharacters: [],
    totalFiguresCount: 0
  }
];

export const CHARACTERS: CharacterDetailResponseDto[] = [
  {
    id: 'char-darth-vader',
    name: 'Darth Vader',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    species: 'Cyborg / Human',
    homeworld: 'Tatooine',
    affiliation: 'Galactic Empire / Sith',
    description: 'Once the heroic Jedi Knight Anakin Skywalker, Darth Vader was seduced by the dark side of the Force, becoming a Sith Lord and the fearsome enforcer of Emperor Palpatine.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    firstLoreAppearance: 'Star Wars: Episode IV - A New Hope (1977)',
    firstFigureAppearance: {
      year: 1978,
      figureName: 'Darth Vader',
      lineName: 'Vintage Kenner Star Wars',
      figureId: 'fig-sw-vader-vintage'
    },
    appearancesAcrossLines: [],
    totalFiguresCount: 0,
    variantsCount: 0,
    galleryUrls: [
      'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'char-luke-skywalker',
    name: 'Luke Skywalker',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    species: 'Human',
    homeworld: 'Tatooine',
    affiliation: 'Rebel Alliance / Jedi Order',
    description: 'A farm boy from Tatooine who rose from humble beginnings to become one of the greatest Jedi the galaxy has ever known, redeeming his father Anakin Skywalker.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    firstLoreAppearance: 'Star Wars: Episode IV - A New Hope (1977)',
    firstFigureAppearance: {
      year: 1978,
      figureName: 'Luke Skywalker (Farmboy)',
      lineName: 'Vintage Kenner Star Wars',
      figureId: 'fig-sw-luke-vintage'
    },
    appearancesAcrossLines: [],
    totalFiguresCount: 0,
    variantsCount: 0,
    galleryUrls: [
      'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'char-boba-fett',
    name: 'Boba Fett',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    species: 'Human (Clone)',
    homeworld: 'Kamino',
    affiliation: 'Bounty Hunters Guild',
    description: 'With his customized Mandalorian armor, deadly weaponry, and silent demeanor, Boba Fett became one of the most feared and celebrated bounty hunters in the galaxy.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    firstLoreAppearance: 'Star Wars Holiday Special (1978) / The Empire Strikes Back (1980)',
    firstFigureAppearance: {
      year: 1979,
      figureName: 'Boba Fett',
      lineName: 'Vintage Kenner Star Wars',
      figureId: 'fig-sw-boba-vintage'
    },
    appearancesAcrossLines: [],
    totalFiguresCount: 0,
    variantsCount: 0,
    galleryUrls: [
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'char-he-man',
    name: 'He-Man',
    franchiseId: 'fran-motu',
    franchiseName: 'Masters of the Universe',
    species: 'Human / Eternian',
    homeworld: 'Eternia',
    affiliation: 'Masters of the Universe / Royal Family',
    description: 'The Most Powerful Man in the Universe, defender of Castle Grayskull and the secrets that lie within against the sinister forces of Skeletor.',
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
    firstLoreAppearance: 'DC Comics Masters of the Universe Mini-comic #1 (1982)',
    firstFigureAppearance: {
      year: 1982,
      figureName: 'He-Man',
      lineName: 'Masters of the Universe Vintage',
      figureId: 'fig-motu-heman-82'
    },
    appearancesAcrossLines: [],
    totalFiguresCount: 0,
    variantsCount: 0,
    galleryUrls: [
      'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'char-leonardo',
    name: 'Leonardo',
    franchiseId: 'fran-tmnt',
    franchiseName: 'Teenage Mutant Ninja Turtles',
    species: 'Mutant Turtle',
    homeworld: 'New York City, Earth',
    affiliation: 'Teenage Mutant Ninja Turtles',
    description: 'The disciplined, stoic leader in blue of the four turtle brothers. Wields twin katana swords and studies ninjutsu under the venerable Master Splinter.',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    firstLoreAppearance: 'Teenage Mutant Ninja Turtles #1 (Mirage Studios, May 1984)',
    firstFigureAppearance: {
      year: 1988,
      figureName: 'Leonardo',
      lineName: 'TMNT Vintage 1988',
      figureId: 'fig-tmnt-leo-88'
    },
    appearancesAcrossLines: [],
    totalFiguresCount: 0,
    variantsCount: 0,
    galleryUrls: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'char-optimus-prime',
    name: 'Optimus Prime',
    franchiseId: 'fran-transformers',
    franchiseName: 'Transformers',
    species: 'Cybertronian',
    homeworld: 'Cybertron',
    affiliation: 'Autobots',
    description: 'The selfless and inspiring leader of the Autobots, bearer of the Matrix of Leadership, who fights relentlessly for freedom across the galaxy.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    firstLoreAppearance: 'The Transformers #1 (Marvel Comics, Sept 1984)',
    firstFigureAppearance: {
      year: 1984,
      figureName: 'Optimus Prime',
      lineName: 'Transformers Generation 1',
      figureId: 'fig-tf-optimus-g1'
    },
    appearancesAcrossLines: [],
    totalFiguresCount: 0,
    variantsCount: 0,
    galleryUrls: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

export const LINES: LineDetailResponseDto[] = [
  {
    id: 'line-sw-vintage',
    name: 'Vintage Star Wars (1977–1985)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-kenner',
    manufacturerName: 'Kenner Products',
    startYear: 1977,
    endYear: 1985,
    isActive: false,
    scale: '3.75 inch (1:18)',
    description: 'The historic original 3.75" Kenner line that launched the modern toy industry, spanning the Original Trilogy from 12-Back A to the Power of the Force coin cardbacks.',
    collectorNotes: 'Total of 96 official figures and numerous packaging and weapon sculpt variants. Famous for the original 12 figures, vinyl-cape and telescoping saber variations, and iconic photo blister cards.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-potf2',
    name: 'The Power of the Force 2 (1995–2000)',
    logoUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-kenner',
    manufacturerName: 'Kenner / Hasbro',
    startYear: 1995,
    endYear: 2000,
    isActive: false,
    scale: '3.75 inch (1:18)',
    description: 'The triumphant revival of Star Wars figures in the mid-1990s, recognizable by exaggerated muscular sculpts, bold red cardbacks, green holographic foil cards, and slide viewer Freeze Frames.',
    collectorNotes: 'Famous among collectors for early transition errors, "buff" sculpts (often called "Monkey Face" Leia or bodybuilder Luke), transition stickers, and saber length variants.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-tvc',
    name: 'The Vintage Collection (2010–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2010,
    isActive: true,
    scale: '3.75 inch (1:18)',
    description: 'The premier modern collector line honoring the classic Kenner packaging aesthetic, pairing vintage-styled cardbacks with state-of-the-art super-articulation and photoreal facial printing.',
    collectorNotes: 'Uses continuous "VC" numbering (VC01 to VC300+). Highly prized for unpunched cardbacks, collector-grade bubble seals, and premium soft goods accessories.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-potf-1985',
    name: 'The Power of the Force - Coin Line (1985)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-kenner',
    manufacturerName: 'Kenner Products',
    startYear: 1985,
    endYear: 1985,
    isActive: false,
    scale: '3.75 inch (1:18)',
    description: 'The final vintage Kenner series celebrated for packaging an aluminum collector coin with each figure, including the ultra-rare "Last 17".',
    collectorNotes: 'Coins exist in Category I to IV rarities. Features Yak Face, Imperial Gunner, Luke in Battle Poncho, and Anakin.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-ep1',
    name: 'Episode I: The Phantom Menace (1999)',
    logoUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 1999,
    endYear: 2000,
    isActive: false,
    scale: '3.75 inch (1:18)',
    description: 'Hasbro blister cards with green galactic backing and interactive CommTech chips that played movie voice lines.',
    collectorNotes: 'Look for CommTech Reader bundle and variant holographic droid chips.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-aotc',
    name: 'Episode II: Attack of the Clones - Blue Card (2002–2004)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2002,
    endYear: 2004,
    isActive: false,
    scale: '3.75 inch (1:18)',
    description: 'The iconic "Saga" blue card line featuring Jango Fett, Geonosis Arenas, Clone Troopers, action features, and display stands.',
    collectorNotes: 'Known for dynamic action poses and magnetic battle effects.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-votc',
    name: 'Vintage Original Trilogy Collection / VOTC (2004)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2004,
    endYear: 2005,
    isActive: false,
    scale: '3.75 inch (1:18)',
    description: 'Hasbro milestone line re-introducing original Kenner card designs with modern super-articulation inside premium clamshell cases.',
    collectorNotes: 'Precursor to The Vintage Collection; prized for mint protective shells.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-tac',
    name: '30th Anniversary Collection / TAC (2007)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2007,
    endYear: 2008,
    isActive: false,
    scale: '3.75 inch (1:18)',
    description: 'Celebrating 30 years since 1977, featuring stylized cardbacks, collectible metallic coins, and Ralph McQuarrie concept figures.',
    collectorNotes: 'McQuarrie concept series figures are standout grails.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-retro',
    name: 'Retro Collection (2019–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2019,
    isActive: true,
    scale: '3.75 inch (1:18)',
    description: 'Nostalgic modern line recreating 1970s 5-POA Kenner aesthetic, weathered vintage cardbacks, vinyl capes, and retro stickers.',
    collectorNotes: 'Includes both Original Trilogy recreations and modern Disney+ characters in retro Kenner style.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-tbs',
    name: 'The Black Series 6" (2013–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2013,
    isActive: true,
    scale: '6 inch (1:12)',
    description: 'Hasbro premier 6-inch collector scale line with numbered window boxes, mural spine artwork, cloth cloaks, and high articulation.',
    collectorNotes: 'Color-coded side murals create giant connected mural art on bookshelves.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-mandalorian',
    name: 'The Mandalorian Line (2019–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2019,
    isActive: true,
    scale: '3.75" & 6"',
    description: 'Official Hasbro releases from the Disney+ series starring Din Djarin, Grogu, Moff Gideon, and Bo-Katan Kryze.',
    collectorNotes: 'Features carbonized variants and deluxe creature sets.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-boba-fett',
    name: 'The Book of Boba Fett Line (2021–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2021,
    isActive: true,
    scale: '3.75" & 6"',
    description: 'Figures detailing Boba Fett and Fennec Shand conquering Jabba palace on Tatooine, Cad Bane, and Pyke Syndicate.',
    collectorNotes: 'Includes the deluxe Boba Fett with Throne Room.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-andor',
    name: 'Andor Line (2022–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2022,
    isActive: true,
    scale: '3.75" & 6"',
    description: 'Dedicated releases for Tony Gilroy critically acclaimed spy thriller, starring Cassian Andor, Luthen Rael, Bix Caleen, and Dedra Meero.',
    collectorNotes: 'Tactical outfits and realistic undercover sculpts.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-ahsoka',
    name: 'Ahsoka Line (2023–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2023,
    isActive: true,
    scale: '3.75" & 6"',
    description: 'Celebrating Dave Filoni series with Ahsoka Tano, Grand Admiral Thrawn, Sabine Wren, Hera Syndulla, Shin Hati, and Baylan Skoll.',
    collectorNotes: 'Introduces the Peridea galaxy and Nightsister magic accessories.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-sw-skeleton-crew',
    name: 'Skeleton Crew Line (2024–Present)',
    logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    representativeImageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 2024,
    isActive: true,
    scale: '3.75" & 6"',
    description: 'Hasbro figures for the adventurous coming-of-age Star Wars saga starring Jude Law as Jod Na Nawood.',
    collectorNotes: 'Newest era additions with retro adventure styling.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-motu-vintage',
    name: 'Masters of the Universe Vintage (1982–1988)',
    representativeImageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-motu',
    franchiseName: 'Masters of the Universe',
    manufacturerId: 'mfr-mattel',
    manufacturerName: 'Mattel',
    startYear: 1982,
    endYear: 1988,
    isActive: false,
    scale: '5.5 inch',
    description: 'The seminal 1980s muscle fantasy toyline featuring iconic blister cards illustrated by fantasy painters, rubber-band leg connections, and spring-loaded waist action.',
    collectorNotes: 'Collectors hunt for country-of-origin stamps (Taiwan, Mexico, Spain, France), soft-head vs hard-head variants, and original mini-comics included in bubble packaging.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-tmnt-1988',
    name: 'TMNT Vintage (1988–1997)',
    representativeImageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-tmnt',
    franchiseName: 'Teenage Mutant Ninja Turtles',
    manufacturerId: 'mfr-playmates',
    manufacturerName: 'Playmates Toys',
    startYear: 1988,
    endYear: 1997,
    isActive: false,
    scale: '4.5 inch',
    description: 'Playmates revolutionary comic-to-toy sensation featuring quirky weapon racks, expressive action poses, and vibrant cartoon-style cardbacks.',
    collectorNotes: 'First wave 10-back figures with "soft rubber heads" and unpainted belts command high premiums among vintage toy specialists.',
    totalFiguresCount: 0,
    figures: []
  },
  {
    id: 'line-tf-g1',
    name: 'Transformers Generation 1 (1984–1990)',
    representativeImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
    franchiseId: 'fran-transformers',
    franchiseName: 'Transformers',
    manufacturerId: 'mfr-hasbro',
    manufacturerName: 'Hasbro',
    startYear: 1984,
    endYear: 1990,
    isActive: false,
    scale: 'Various (Vehicle / Robot)',
    description: 'The foundational toyline featuring die-cast metal, real rubber tires, styrofoam tray packaging, and grid-art box illustrations.',
    collectorNotes: 'Look for pre-rubsign 1984 releases, metal vs plastic plate toes on Optimus Prime, and intact tech-spec cards.',
    totalFiguresCount: 0,
    figures: []
  }
];

export const FIGURES: FigureDetailResponseDto[] = [
  {
    id: 'fig-sw-vader-potf2',
    name: 'Darth Vader (POTF2)',
    code: 'POTF2-01',
    year: 1995,
    description: 'Darth Vader as represented in the 1995 Kenner Power of the Force 2 revival, sculpted with the line\'s characteristic broad shoulders, muscular build, and textured vinyl cape.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    character: {
      id: 'char-darth-vader',
      name: 'Darth Vader',
      description: 'The terrifying Sith Lord of the Galactic Empire.',
      imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
      affiliation: 'Galactic Empire'
    },
    line: {
      id: 'line-sw-potf2',
      name: 'The Power of the Force 2 (1995–2000)',
      manufacturerName: 'Kenner / Hasbro',
      startYear: 1995,
      scale: '3.75 inch (1:18)'
    },
    franchise: {
      id: 'fran-star-wars',
      name: 'Star Wars'
    },
    sculptDetails: 'Heavily stylized superheroic muscular physique typical of mid-90s Kenner resurgence; 6 points of articulation (swivel neck, shoulders, waist, and hips).',
    articulationPoints: 6,
    originalAccessories: ['Removable Fabric Cape', 'Red Lightsaber with Hilt Peg'],
    variants: [],
    productReleases: []
  },
  {
    id: 'fig-sw-luke-vintage',
    name: 'Luke Skywalker (Farmboy)',
    code: 'SW-01',
    year: 1978,
    description: 'The original 1978 Kenner release of Luke Skywalker in his white Tatooine tunic, part of the legendary "First 12" action figures.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    character: {
      id: 'char-luke-skywalker',
      name: 'Luke Skywalker',
      description: 'The Tatooine farm boy destined to become a Jedi Knight.',
      imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
      affiliation: 'Rebel Alliance'
    },
    line: {
      id: 'line-sw-vintage',
      name: 'Vintage Star Wars (1977–1985)',
      manufacturerName: 'Kenner Products',
      startYear: 1977,
      scale: '3.75 inch (1:18)'
    },
    franchise: {
      id: 'fran-star-wars',
      name: 'Star Wars'
    },
    sculptDetails: 'Classic 5-points of articulation with arm channel housing the telescoping lightsaber mechanism.',
    articulationPoints: 5,
    originalAccessories: ['Yellow Lightsaber (Telescoping)'],
    variants: [],
    productReleases: []
  },
  {
    id: 'fig-sw-boba-vintage',
    name: 'Boba Fett (Kenner 1979)',
    code: 'SW-21',
    year: 1979,
    description: 'First introduced through the historic 1979 mail-away promotion before arriving on 21-Back retail cards. Renowned for its jetpack, rangefinder helmet, and rocket firing lore.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    character: {
      id: 'char-boba-fett',
      name: 'Boba Fett',
      description: 'The galaxy\'s most cunning and lethal Mandalorian bounty hunter.',
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
      affiliation: 'Bounty Hunters Guild'
    },
    line: {
      id: 'line-sw-vintage',
      name: 'Vintage Star Wars (1977–1985)',
      manufacturerName: 'Kenner Products',
      startYear: 1977,
      scale: '3.75 inch (1:18)'
    },
    franchise: {
      id: 'fran-star-wars',
      name: 'Star Wars'
    },
    sculptDetails: 'Distinctive sculpted jetpack permanently fused to back following child safety retooling that sealed the spring-loaded missile mechanism.',
    articulationPoints: 5,
    originalAccessories: ['Blaster Rifle (Imperial Stormtrooper style in black/blue plastic)'],
    variants: [],
    productReleases: []
  },
  {
    id: 'fig-sw-vader-vintage',
    name: 'Darth Vader (Kenner 1978)',
    code: 'SW-03',
    year: 1978,
    description: 'The foundational original 1978 Kenner 12-Back release of the Sith Lord, featuring a black vinyl cape and arm-extending red lightsaber.',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    character: {
      id: 'char-darth-vader',
      name: 'Darth Vader',
      description: 'The enforcer of the Galactic Empire.',
      imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
      affiliation: 'Galactic Empire'
    },
    line: {
      id: 'line-sw-vintage',
      name: 'Vintage Star Wars (1977–1985)',
      manufacturerName: 'Kenner Products',
      startYear: 1977,
      scale: '3.75 inch (1:18)'
    },
    franchise: {
      id: 'fran-star-wars',
      name: 'Star Wars'
    },
    sculptDetails: '5 points of articulation, right arm contains hollow slot with slide tab for telescoping filament.',
    articulationPoints: 5,
    originalAccessories: ['Black Vinyl Cape with armholes', 'Red Telescoping Saber'],
    variants: [],
    productReleases: []
  },
  {
    id: 'fig-motu-heman-82',
    name: 'He-Man (Mattel 1982)',
    code: 'MOTU-01',
    year: 1982,
    description: 'The original 1982 Mattel 8-back He-Man figure with the battle axe, power sword, battle shield, and spring-loaded twist waist power punch.',
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
    character: {
      id: 'char-he-man',
      name: 'He-Man',
      description: 'The Most Powerful Man in the Universe.',
      imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
      affiliation: 'Masters of the Universe'
    },
    line: {
      id: 'line-motu-vintage',
      name: 'Masters of the Universe Vintage (1982–1988)',
      manufacturerName: 'Mattel',
      startYear: 1982,
      scale: '5.5 inch'
    },
    franchise: {
      id: 'fran-motu',
      name: 'Masters of the Universe'
    },
    sculptDetails: 'Muscular barbarian sculpt with rubber-band internal leg harness and spring-loaded waist action.',
    articulationPoints: 6,
    originalAccessories: ['Power Sword (Gray)', 'Battle Axe (Gray)', 'Battle Shield with clips', 'Removable Armor with red cross'],
    variants: [],
    productReleases: []
  },
  {
    id: 'fig-tmnt-leo-88',
    name: 'Leonardo (Playmates 1988)',
    code: 'TMNT-01',
    year: 1988,
    description: 'The first wave 1988 release of Leonardo with blue bandana and belt initial "L", accompanied by brown weapon sprue rack.',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    character: {
      id: 'char-leonardo',
      name: 'Leonardo',
      description: 'Leader of the TMNT in blue.',
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      affiliation: 'Teenage Mutant Ninja Turtles'
    },
    line: {
      id: 'line-tmnt-1988',
      name: 'TMNT Vintage (1988–1997)',
      manufacturerName: 'Playmates Toys',
      startYear: 1988,
      scale: '4.5 inch'
    },
    franchise: {
      id: 'fran-tmnt',
      name: 'Teenage Mutant Ninja Turtles'
    },
    sculptDetails: 'Pebbled skin texture, shell texture on plastron and carapace, sword scabbards on back of shell belt.',
    articulationPoints: 7,
    originalAccessories: ['Twin Katana Swords', 'Ninja Stars on Tree', 'Punch Dagger', 'Weapons Rack Tree'],
    variants: [],
    productReleases: []
  },
  {
    id: 'fig-tf-optimus-g1',
    name: 'Optimus Prime (Hasbro G1 1984)',
    code: 'TF-01',
    year: 1984,
    description: 'The legendary G1 Commander featuring die-cast metal cab that converts to semi-truck, and an opening command combat deck trailer with Roller vehicle.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    character: {
      id: 'char-optimus-prime',
      name: 'Optimus Prime',
      description: 'Supreme Commander of the Autobots.',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      affiliation: 'Autobots'
    },
    line: {
      id: 'line-tf-g1',
      name: 'Transformers Generation 1 (1984–1990)',
      manufacturerName: 'Hasbro',
      startYear: 1984,
      scale: 'Leader Class (Classic)'
    },
    franchise: {
      id: 'fran-transformers',
      name: 'Transformers'
    },
    sculptDetails: 'Combination of die-cast metal chassis, chromed grill and fuel tanks, and articulated robot joints.',
    articulationPoints: 8,
    originalAccessories: ['Combat Deck Trailer', 'Roller (Blue or Gray)', 'Laser Blaster', 'Gas Hose & Nozzle', 'Missiles (x4)'],
    variants: [],
    productReleases: []
  }
];

export const VARIANTS: VariantDetailResponseDto[] = [
  {
    id: 'var-vader-potf2-long',
    name: 'Darth Vader POTF2 — Long Saber Variant',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    distinguishingFeature: 'Lightsaber blade extends past the figure\'s tray blister edge (~70mm long blade).',
    whyItMatters: 'Kenner initially molded the red lightsaber blade exceptionally long. Soon after the first production batches shipped to retail shelves, Hasbro/Kenner trimmed the mold tool by over 15mm to avoid bent blades and blister punctures. The "Long Saber" represents the pure first run of the 1995 resurgence.',
    identificationGuide: 'Look at the packaged bubble tray: the red blade tip extends all the way into the blister cavity channel past Vader\'s right knee. On loose figures, the blade measures approximately 70mm from hilt guard to tip, compared to ~54mm on the common Short Saber.',
    rarityLevel: 'Rare',
    associatedFigure: {
      id: 'fig-sw-vader-potf2',
      name: 'Darth Vader (POTF2)',
      code: 'POTF2-01',
      imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
      lineName: 'The Power of the Force 2 (1995–2000)',
      franchiseName: 'Star Wars'
    },
    accessoriesSpecific: ['70mm Red Translucent Saber with Long Taper Blade', 'Cloth Textured Cape'],
    historicalDistributionNotes: 'Distributed exclusively in the first shipments to US retailers (Target, Toys "R" Us, Walmart) in late summer 1995 on Red Cardbacks with un-stickered barcode backs.',
    firstAppearanceContext: 'Shipped in August 1995 Case Assortment A.',
    photographs: [
      { url: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80', caption: 'Comparison of Long Saber vs Revised Short Mold' }
    ],
    releasesContainingVariant: []
  },
  {
    id: 'var-vader-potf2-short',
    name: 'Darth Vader POTF2 — Short Saber Standard',
    imageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    distinguishingFeature: 'Revised shorter blade mold (~54mm) sitting comfortably within the plastic tray without bending.',
    whyItMatters: 'The standard commercial version that appeared throughout the remainder of the POTF2 run from late 1995 through 2000.',
    identificationGuide: 'Blade ends well before the blister border; less prone to bending under temperature changes.',
    rarityLevel: 'Common',
    associatedFigure: {
      id: 'fig-sw-vader-potf2',
      name: 'Darth Vader (POTF2)',
      code: 'POTF2-01',
      imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
      lineName: 'The Power of the Force 2 (1995–2000)',
      franchiseName: 'Star Wars'
    },
    accessoriesSpecific: ['54mm Red Translucent Saber with Short Blade', 'Cloth Textured Cape'],
    historicalDistributionNotes: 'Worldwide mass retail release across US, Europe, Japan, and Canada.',
    firstAppearanceContext: 'Introduced October 1995 Case Assortment B onwards.',
    photographs: [],
    releasesContainingVariant: []
  },
  {
    id: 'var-luke-dt',
    name: 'Luke Skywalker — Double-Telescoping (DT) Saber',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    distinguishingFeature: 'Two-piece nesting saber where a thin inner yellow filament pulls out from inside the primary yellow tube.',
    whyItMatters: 'The absolute Holy Grail of vintage action figure collecting. Kenner designed the sabers to extend in two stages, but the fragile thin inner filament broke easily during factory assembly and play. Kenner quickly simplified to a single-piece molded saber, leaving only a tiny handful of early 12-Back A cards with the DT saber.',
    identificationGuide: 'Inspect the right forearm saber slot: if an ultra-thin needle-like inner tip protrudes from the outer tube, it is a genuine DT. Authentic vintage filaments have subtle mold flash and injection dots that differentiate them from modern reproductions.',
    rarityLevel: 'Grail',
    associatedFigure: {
      id: 'fig-sw-luke-vintage',
      name: 'Luke Skywalker (Farmboy)',
      code: 'SW-01',
      imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
      lineName: 'Vintage Star Wars (1977–1985)',
      franchiseName: 'Star Wars'
    },
    accessoriesSpecific: ['Two-piece nested Double-Telescoping Yellow Saber with microscopic locking lip'],
    historicalDistributionNotes: 'Only found on the earliest Kenner 12-Back "A" cards produced in Cincinnati/Hong Kong in early 1978 and early Bird promotional packages.',
    firstAppearanceContext: 'Early 1978 test market runs.',
    photographs: [
      { url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80', caption: 'Microscopic inspection of the inner telescoping tip' }
    ],
    releasesContainingVariant: []
  },
  {
    id: 'var-luke-single',
    name: 'Luke Skywalker — Single Telescoping Saber',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    distinguishingFeature: 'Single solid yellow molded saber with slide notch.',
    whyItMatters: 'The standard production configuration shipped on millions of cards from 1978 to 1985.',
    identificationGuide: 'Solid plastic rod with no separate inner core; standard rounded tip.',
    rarityLevel: 'Common',
    associatedFigure: {
      id: 'fig-sw-luke-vintage',
      name: 'Luke Skywalker (Farmboy)',
      code: 'SW-01',
      imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
      lineName: 'Vintage Star Wars (1977–1985)',
      franchiseName: 'Star Wars'
    },
    accessoriesSpecific: ['One-piece Solid Yellow Telescoping Saber'],
    historicalDistributionNotes: 'Shipped worldwide on 12-Back, 20-Back, 21-Back, 31-Back, 41-Back, and 65-Back Trilogo cards.',
    firstAppearanceContext: 'Late spring 1978 mass production.',
    photographs: [],
    releasesContainingVariant: []
  },
  {
    id: 'var-boba-painted-dart',
    name: 'Boba Fett — Painted Knee Dart Variant',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    distinguishingFeature: 'Small dart projectile on the right knee armor pad is painted bright yellow.',
    whyItMatters: 'Kenner paint operations originally masked and painted the knee dart with yellow paint to match the movie costume before deleting the step to streamline factory efficiency in later production runs.',
    identificationGuide: 'Inspect the right knee pad under good light: look for crisp yellow pigment on the sculpted cylindrical dart launcher.',
    rarityLevel: 'Uncommon',
    associatedFigure: {
      id: 'fig-sw-boba-vintage',
      name: 'Boba Fett (Kenner 1979)',
      code: 'SW-21',
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
      lineName: 'Vintage Star Wars (1977–1985)',
      franchiseName: 'Star Wars'
    },
    accessoriesSpecific: ['Black Blaster Rifle', 'Right Knee Dart Painted Yellow'],
    historicalDistributionNotes: 'Primarily found on early 21-Back cards and mail-away specimens.',
    firstAppearanceContext: '1979 Kenner First Batch.',
    photographs: [],
    releasesContainingVariant: []
  },
  {
    id: 'var-heman-soft-head',
    name: 'He-Man — Soft Rubber Head Variant',
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
    distinguishingFeature: 'Head is rotocast in flexible vinyl rubber, giving it a squishy feel and slightly darker skin tone.',
    whyItMatters: 'The early 1982 Mattel production run used soft hollow rubber heads for He-Man and Skeletor before switching to rigid injection molded plastic. Considered the definitive original 1982 production run.',
    identificationGuide: 'Gently squeeze the head between thumb and forefinger: soft head easily compresses; also features warmer face paint and slightly translucent hair.',
    rarityLevel: 'Rare',
    associatedFigure: {
      id: 'fig-motu-heman-82',
      name: 'He-Man (Mattel 1982)',
      code: 'MOTU-01',
      imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
      lineName: 'Masters of the Universe Vintage (1982–1988)',
      franchiseName: 'Masters of the Universe'
    },
    accessoriesSpecific: ['Power Sword (Soft Plastic)', 'Battle Axe', 'Shield with soft clips'],
    historicalDistributionNotes: 'Found exclusively on early 1982 8-Back cardbacks stamped "Taiwan".',
    firstAppearanceContext: '1982 Initial Retail Waves.',
    photographs: [],
    releasesContainingVariant: []
  }
];

export const PRODUCT_RELEASES: ProductReleaseDetailResponseDto[] = [
  {
    id: 'rel-vader-potf2-us-red',
    name: 'Darth Vader — 1995 POTF2 US Red Card Blister',
    packagingType: 'Standard Carded Blister',
    region: 'United States',
    language: 'English',
    retailerExclusivity: 'General Retail',
    releaseDate: '1995-08-01',
    releaseYear: 1995,
    barcode: '076281695709',
    assortmentNumber: 'Assortment #69570 / No. 69571',
    collectorNotes: 'The iconic "Red Card" that defined the 90s action figure explosion. Back of card features full color photos of the initial 9 figures including Luke Skywalker, Han Solo, Chewbacca, and Stormtrooper.',
    imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    backOfCardImageUrl: 'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=800&auto=format&fit=crop&q=80',
    associatedVariant: {
      id: 'var-vader-potf2-long',
      name: 'Darth Vader POTF2 — Long Saber Variant',
      distinguishingFeature: 'Lightsaber blade extends past the figure tray blister edge.'
    },
    parentFigure: {
      id: 'fig-sw-vader-potf2',
      name: 'Darth Vader (POTF2)',
      code: 'POTF2-01',
      imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
      lineName: 'The Power of the Force 2 (1995–2000)',
      franchiseName: 'Star Wars'
    },
    franchiseName: 'Star Wars',
    lineName: 'The Power of the Force 2 (1995–2000)'
  },
  {
    id: 'rel-luke-12back-a',
    name: 'Luke Skywalker — 1978 Kenner US 12-Back "A" Blister',
    packagingType: '12-Back Carded Blister',
    region: 'United States',
    language: 'English',
    retailerExclusivity: 'General Retail',
    releaseDate: '1978-04-15',
    releaseYear: 1978,
    barcode: '076281382104',
    assortmentNumber: 'No. 38210',
    collectorNotes: 'The legendary "12-Back A" is the holy grail of production cardbacks. Features cross-sell illustrations of the original 12 figures and promotional instructions on how to use the telescoping lightsaber.',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    backOfCardImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    associatedVariant: {
      id: 'var-luke-dt',
      name: 'Luke Skywalker — Double-Telescoping (DT) Saber',
      distinguishingFeature: 'Two-piece nesting saber with fine inner filament.'
    },
    parentFigure: {
      id: 'fig-sw-luke-vintage',
      name: 'Luke Skywalker (Farmboy)',
      code: 'SW-01',
      imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
      lineName: 'Vintage Star Wars (1977–1985)',
      franchiseName: 'Star Wars'
    },
    franchiseName: 'Star Wars',
    lineName: 'Vintage Star Wars (1977–1985)'
  },
  {
    id: 'rel-boba-21back',
    name: 'Boba Fett — 1979 Kenner US 21-Back Carded Blister',
    packagingType: '21-Back Carded Blister',
    region: 'United States',
    language: 'English',
    retailerExclusivity: 'General Retail',
    releaseDate: '1979-09-01',
    releaseYear: 1979,
    barcode: '076281390406',
    assortmentNumber: 'No. 39040',
    collectorNotes: 'The premier store retail appearance of Boba Fett, printed with the dramatic Star Wars logo and yellow name pill badge. The reverse features 21 figures including Hammerhead and Walrus Man.',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    associatedVariant: {
      id: 'var-boba-painted-dart',
      name: 'Boba Fett — Painted Knee Dart Variant',
      distinguishingFeature: 'Knee dart is painted bright yellow.'
    },
    parentFigure: {
      id: 'fig-sw-boba-vintage',
      name: 'Boba Fett (Kenner 1979)',
      code: 'SW-21',
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
      lineName: 'Vintage Star Wars (1977–1985)',
      franchiseName: 'Star Wars'
    },
    franchiseName: 'Star Wars',
    lineName: 'Vintage Star Wars (1977–1985)'
  },
  {
    id: 'rel-heman-8back',
    name: 'He-Man — 1982 Mattel US 8-Back Carded Blister',
    packagingType: '8-Back Carded Blister',
    region: 'United States',
    language: 'English',
    retailerExclusivity: 'General Retail',
    releaseDate: '1982-02-10',
    releaseYear: 1982,
    barcode: '074299049018',
    assortmentNumber: 'No. 5040',
    collectorNotes: 'Cardback features vibrant paintings by Alfredo Alcala illustrating Castle Grayskull and the original 8 Masters figures, packaged with the comic "He-Man and the Power Sword".',
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
    associatedVariant: {
      id: 'var-heman-soft-head',
      name: 'He-Man — Soft Rubber Head Variant',
      distinguishingFeature: 'Head rotocast in flexible vinyl rubber with warmer paint tone.'
    },
    parentFigure: {
      id: 'fig-motu-heman-82',
      name: 'He-Man (Mattel 1982)',
      code: 'MOTU-01',
      imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
      lineName: 'Masters of the Universe Vintage (1982–1988)',
      franchiseName: 'Masters of the Universe'
    },
    franchiseName: 'Masters of the Universe',
    lineName: 'Masters of the Universe Vintage (1982–1988)'
  }
];

// Re-link bidirectional relationships in-memory
export function initRelations(): void {
  // Connect lines to franchise
  FRANCHISES.forEach(f => {
    f.lines = LINES.filter(l => l.franchiseId === f.id).map(l => ({
      id: l.id,
      name: l.name,
      franchiseId: l.franchiseId,
      franchiseName: l.franchiseName,
      manufacturerName: l.manufacturerName,
      startYear: l.startYear,
      endYear: l.endYear,
      isActive: l.isActive,
      imageUrl: l.representativeImageUrl,
      figuresCount: FIGURES.filter(fig => fig.line.id === l.id).length
    }));
    f.keyCharacters = CHARACTERS.filter(c => c.franchiseId === f.id).map(c => ({
      id: c.id,
      name: c.name,
      franchiseName: c.franchiseName,
      imageUrl: c.imageUrl,
      figuresCount: FIGURES.filter(fig => fig.character.id === c.id).length
    }));
    f.totalFiguresCount = FIGURES.filter(fig => fig.franchise.name === f.name).length;
  });

  // Connect lines
  LINES.forEach(l => {
    l.figures = FIGURES.filter(f => f.line.id === l.id).map(f => ({
      id: f.id,
      name: f.name,
      code: f.code,
      imageUrl: f.imageUrl,
      lineId: l.id,
      lineName: l.name,
      characterId: f.character.id,
      characterName: f.character.name,
      year: f.year,
      variantsCount: VARIANTS.filter(v => v.associatedFigure.id === f.id).length,
      releasesCount: PRODUCT_RELEASES.filter(r => r.parentFigure.id === f.id).length
    }));
    l.totalFiguresCount = l.figures.length;
  });

  // Connect manufacturers linesProduced
  MANUFACTURERS.forEach(m => {
    m.linesProduced = LINES.filter(l => l.manufacturerId === m.id).map(l => ({
      id: l.id,
      name: l.name,
      franchiseId: l.franchiseId,
      franchiseName: l.franchiseName,
      manufacturerName: l.manufacturerName,
      startYear: l.startYear,
      endYear: l.endYear,
      isActive: l.isActive,
      imageUrl: l.representativeImageUrl,
      figuresCount: FIGURES.filter(fig => fig.line.id === l.id).length
    }));
  });

  // Connect characters
  CHARACTERS.forEach(c => {
    const figs = FIGURES.filter(f => f.character.id === c.id);
    c.appearancesAcrossLines = figs.map(f => ({
      lineId: f.line.id,
      lineName: f.line.name,
      figureId: f.id,
      figureName: f.name,
      year: f.year,
      imageUrl: f.imageUrl,
      code: f.code
    }));
    c.totalFiguresCount = figs.length;
    c.variantsCount = VARIANTS.filter(v => figs.some(f => f.id === v.associatedFigure.id)).length;
  });

  // Connect figures variants and releases
  FIGURES.forEach(f => {
    f.variants = VARIANTS.filter(v => v.associatedFigure.id === f.id).map(v => ({
      id: v.id,
      name: v.name,
      figureId: f.id,
      figureName: f.name,
      distinguishingFeature: v.distinguishingFeature,
      imageUrl: v.imageUrl,
      isRare: v.rarityLevel === 'Rare' || v.rarityLevel === 'Grail'
    }));
    f.productReleases = PRODUCT_RELEASES.filter(r => r.parentFigure.id === f.id).map(r => ({
      id: r.id,
      name: r.name,
      figureId: f.id,
      variantId: r.associatedVariant.id,
      packagingType: r.packagingType,
      region: r.region,
      releaseYear: r.releaseYear,
      retailer: r.retailerExclusivity,
      imageUrl: r.imageUrl,
      barcode: r.barcode
    }));
  });

  // Connect variants releases
  VARIANTS.forEach(v => {
    v.releasesContainingVariant = PRODUCT_RELEASES.filter(r => r.associatedVariant.id === v.id).map(r => ({
      id: r.id,
      name: r.name,
      figureId: r.parentFigure.id,
      variantId: v.id,
      packagingType: r.packagingType,
      region: r.region,
      releaseYear: r.releaseYear,
      retailer: r.retailerExclusivity,
      imageUrl: r.imageUrl,
      barcode: r.barcode
    }));
  });
}

initRelations();

// Initial demo user collection figures
export const INITIAL_USER_COLLECTION: OwnedFigure[] = [
  {
    id: 'own-001',
    userId: 'user-collector-1',
    figureId: 'fig-sw-vader-potf2',
    figureName: 'Darth Vader (POTF2)',
    figureCode: 'POTF2-01',
    figureImageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&auto=format&fit=crop&q=80',
    lineId: 'line-sw-potf2',
    lineName: 'The Power of the Force 2 (1995–2000)',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    variantId: 'var-vader-potf2-long',
    variantName: 'Long Saber Variant',
    productReleaseId: 'rel-vader-potf2-us-red',
    releasePackaging: 'Standard Carded Blister',
    condition: 'MOC',
    gradingScore: 'AFA 85 (NM+)',
    purchasePrice: 45.00,
    currency: 'USD',
    estimatedValue: 120.00,
    acquisitionDate: '2022-04-12',
    quantity: 1,
    storageLocation: 'Main Acrylic Display Case - Tier 1',
    collectorNotes: 'Flawless unpunched card with crystal clear blister bubble. Long saber verified touching blister edge.',
    isWishlist: false,
    addedAt: '2022-04-12T10:00:00.000Z'
  },
  {
    id: 'own-002',
    userId: 'user-collector-1',
    figureId: 'fig-sw-boba-vintage',
    figureName: 'Boba Fett (Kenner 1979)',
    figureCode: 'SW-21',
    figureImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    lineId: 'line-sw-vintage',
    lineName: 'Vintage Star Wars (1977–1985)',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    variantId: 'var-boba-painted-dart',
    variantName: 'Painted Knee Dart Variant',
    productReleaseId: 'rel-boba-21back',
    releasePackaging: '21-Back Carded Blister',
    condition: 'LOOSE_COMPLETE',
    purchasePrice: 85.00,
    currency: 'USD',
    estimatedValue: 140.00,
    acquisitionDate: '2023-01-18',
    quantity: 1,
    storageLocation: 'Vintage Bounty Hunter Shelf',
    collectorNotes: 'Tight limbs, 95% paint condition, original authentic vintage blaster weapon.',
    isWishlist: false,
    addedAt: '2023-01-18T14:30:00.000Z'
  },
  {
    id: 'own-003',
    userId: 'user-collector-1',
    figureId: 'fig-motu-heman-82',
    figureName: 'He-Man (Mattel 1982)',
    figureCode: 'MOTU-01',
    figureImageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
    lineId: 'line-motu-vintage',
    lineName: 'Masters of the Universe Vintage (1982–1988)',
    franchiseId: 'fran-motu',
    franchiseName: 'Masters of the Universe',
    variantId: 'var-heman-soft-head',
    variantName: 'Soft Rubber Head Variant',
    productReleaseId: 'rel-heman-8back',
    releasePackaging: '8-Back Carded Blister',
    condition: 'LOOSE_COMPLETE',
    purchasePrice: 110.00,
    currency: 'USD',
    estimatedValue: 185.00,
    acquisitionDate: '2023-08-05',
    quantity: 1,
    storageLocation: 'Eternia Castle Display',
    collectorNotes: 'Genuine soft head with spring waist power punch still snappy. Complete with all 3 weapons and armor.',
    isWishlist: false,
    addedAt: '2023-08-05T09:15:00.000Z'
  },
  {
    id: 'own-004',
    userId: 'user-collector-1',
    figureId: 'fig-sw-luke-vintage',
    figureName: 'Luke Skywalker (Farmboy)',
    figureCode: 'SW-01',
    figureImageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    lineId: 'line-sw-vintage',
    lineName: 'Vintage Star Wars (1977–1985)',
    franchiseId: 'fran-star-wars',
    franchiseName: 'Star Wars',
    variantId: 'var-luke-dt',
    variantName: 'Double-Telescoping (DT) Saber',
    productReleaseId: 'rel-luke-12back-a',
    condition: 'MOC',
    purchasePrice: 0,
    currency: 'USD',
    estimatedValue: 8500.00,
    acquisitionDate: '2026-01-01',
    quantity: 1,
    storageLocation: 'Safe Deposit Box / Holy Grail Cabinet',
    collectorNotes: 'Dream acquisition priority: genuine 12-Back DT Luke with authentic two-tier filament.',
    isWishlist: true,
    priority: 'High',
    addedAt: '2024-02-01T12:00:00.000Z'
  }
];
