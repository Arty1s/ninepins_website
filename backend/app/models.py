from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class LiveTournament(BaseModel):
    id: int
    name: str
    date: str
    dateFrom: str = ""
    dateTo: str = ""
    time: str
    status: str
    location: str
    capacity: str
    fee: str
    entryType: Literal["free", "paid"] = "free"
    description: str
    lanes: str
    paymentUrl: str = ""
    type: Literal["upcoming", "current", "past"] = "upcoming"


class LiveLeague(BaseModel):
    id: int
    name: str
    season: str
    teams: str
    status: str
    leader: str


class LivePlayer(BaseModel):
    id: int
    name: str
    team: str
    role: str
    average: str
    externalPlayerId: int | None = None
    externalLeagueId: int | None = None
    externalTeamId: int | None = None
    season: str = ""
    category: str = ""
    profileUrl: str = ""
    matches: int | None = None
    totalPerformance: int | None = None
    bestPerformance: int | None = None
    full: int | None = None
    clearing: int | None = None
    faults: int | None = None
    sourceUrl: str = ""
    rosterKey: str = ""


class LiveMember(BaseModel):
    id: int
    name: str
    email: str
    team: str
    role: Literal["admin", "coach", "player", "member"]
    memberSince: str
    membershipStatus: Literal["paid", "unpaid", "pending"]
    lastPayment: str
    nextPayment: str
    authProvider: str = "manual"
    avatarUrl: str = ""


class LiveTeam(BaseModel):
    id: int
    slug: str
    name: str
    league: str
    externalLeagueId: int | None = None
    externalTeamId: int | None = None
    category: str = ""
    season: str = ""
    sourceUrl: str = ""
    isHlohovecTeam: bool = True
    coach: str
    captain: str
    members: str
    achievements: str
    description: str
    standing: str = ""
    matchesPlayed: int | None = None
    wins: int | None = None
    draws: int | None = None
    losses: int | None = None
    points: int | None = None


class MatchPlayerStat(BaseModel):
    name: str
    externalPlayerId: int | None = None
    profileUrl: str = ""
    full: int | None = None
    clearing: int | None = None
    faults: int | None = None
    total: int | None = None
    point: float | None = None


class MatchTeamStats(BaseModel):
    name: str
    logoUrl: str = ""
    players: list[MatchPlayerStat] = Field(default_factory=list)
    fullTotal: int | None = None
    clearingTotal: int | None = None
    faultsTotal: int | None = None
    pinsTotal: int | None = None
    pointsTotal: float | None = None


class LiveMatch(BaseModel):
    id: int
    sourceUrl: str = ""
    league: str
    competition: str = ""
    season: str = ""
    round: str
    date: str
    location: str
    home: str
    away: str
    externalLeagueId: int | None = None
    homeExternalTeamId: int | None = None
    awayExternalTeamId: int | None = None
    score: str
    pins: str
    status: str = "import"
    detailRows: str = ""
    homeTeam: MatchTeamStats | None = None
    awayTeam: MatchTeamStats | None = None
    importKey: str = ""
    importedAt: str | None = None
    importStatus: Literal["manual", "auto", "edited"] | None = None
    adminLocked: bool = False


class LiveStandingRow(BaseModel):
    id: int
    league: str
    category: str
    season: str
    team: str
    externalLeagueId: int | None = None
    externalTeamId: int | None = None
    position: int | None = None
    matchesPlayed: int | None = None
    wins: int | None = None
    draws: int | None = None
    losses: int | None = None
    score: str = ""
    pins: str = ""
    points: int | None = None
    isHlohovecTeam: bool = False


class LiveGalleryAlbum(BaseModel):
    id: int
    slug: str
    title: str
    category: Literal["zapasy", "turnaje", "podujatia", "zakulisie"]
    date: str
    description: str
    coverImage: str
    photos: str
    featured: bool = False


class LiveClubData(BaseModel):
    tournaments: list[LiveTournament] = Field(default_factory=list)
    leagues: list[LiveLeague] = Field(default_factory=list)
    players: list[LivePlayer] = Field(default_factory=list)
    members: list[LiveMember] = Field(default_factory=list)
    teams: list[LiveTeam] = Field(default_factory=list)
    matches: list[LiveMatch] = Field(default_factory=list)
    standings: list[LiveStandingRow] = Field(default_factory=list)
    gallery: list[LiveGalleryAlbum] = Field(default_factory=list)


class TournamentRegistration(BaseModel):
    id: int
    tournamentId: int
    name: str
    club: str = "Bez klubu"
    email: str
    phone: str = ""
    slot: str
    note: str = ""
    paymentStatus: Literal["free", "pending", "paid", "refunded", "cancelled"] = "pending"
    createdAt: str
    userEmail: str = ""
    cancelledAt: str | None = None
    cancellationStatus: Literal["active", "cancelled", "refund_due", "no_refund"] = "active"


class RegistrationCreate(BaseModel):
    tournamentId: int
    name: str
    club: str = "Bez klubu"
    email: str
    phone: str = ""
    slot: str
    note: str = ""
    paymentStatus: Literal["free", "pending", "paid", "refunded", "cancelled"] = "pending"
    userEmail: str = ""


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class CheckoutBody(BaseModel):
    mode: Literal["membership", "tournament"] = "membership"
    name: str | None = None
    amount: float
    email: EmailStr | None = None
    metadata: dict[str, str] = Field(default_factory=dict)


class MemberEnsureBody(BaseModel):
    email: EmailStr
    name: str = ""
    provider: str = "google"
    avatarUrl: str = ""


class RegistrationCancelBody(BaseModel):
    email: EmailStr | None = None
