export interface Player {
    rosterUnit: RosterUnit[];
    name: string;
    level: number;
    allyCode: string;
    playerId: string;
    guildId: string;
    guildName: string;
    guildLogoBackground: string;
    guildBannerColor: string;
    guildBannerLogo: string;
    selectedPlayerTitle: SelectedPlayerThing;
    selectedPlayerPortrait: SelectedPlayerThing;
    playerRating: PlayerRating;
}

export interface SelectedPlayerThing {
    id: string;
}

export interface PlayerRating {
    playerSkillRating: PlayerSkillRating;
    playerRankStatus: PlayerRankStatus;
}

export interface PlayerSkillRating {
    skillRating: number;
}

export interface PlayerRankStatus {
    leagueId: string;
    divisionId: number;
}

export interface RosterUnit {
    definitionId: string;
    currentRarity: number;
    currentLevel: number;
    currentTier: number;
    relic?: Relic; // optional
}

export interface Relic {
    currentTier: number;
}

export interface Unit {
    baseId: string;
    categoryId: string[];
    relicDefinition?: RelicDefinition;
    skillReference: Skill[];
    thumbnailName: string;
    unitTier: Tier[];
    crew: Crew[];
    iconPath?: string;
}

export interface RelicDefinition {
    texture: string;
}

export interface Skill {
    skillId: string;
}

export interface Tier {
    tier: number;
    equipmentSet: string[];
}

export interface Crew {
    unitId: string;
}

export interface FullData {
    name: string;
    level: number;
    allyCode: string;
    playerId: string;
    guildId?: string | null;
    guildName?: string | null;
    guildLogoBackground?: string | null;
    guildBannerColor?: string | null;
    guildBannerLogo?: string | null;
    selectedPlayerTitle?: string | null;
    selectedPlayerPortrait?: string | null;
    playerRating?: PlayerRating | null;
    units: DisplayUnit[]
}

export interface DisplayUnit {
    baseId: string;
    categoryId: string[];
    relicDefinition?: RelicDefinition;
    skillReference: Skill[];
    thumbnailName: string;
    unitTier: Tier[];
    crew: Crew[];
    iconPath?: string;
    currentRarity: number;
    currentLevel: number;
    currentTier: number;
    relic: number | null;
    name: string;
}