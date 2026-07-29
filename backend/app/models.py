from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class LiveTournament(BaseModel):
    id: int
    name: str
    date: str
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


class LiveTeam(BaseModel):
    id: int
    slug: str
    name: str
    league: str
    coach: str
    captain: str
    members: str
    achievements: str
    description: str


class LiveMatch(BaseModel):
    id: int
    sourceUrl: str = ""
    league: str
    round: str
    date: str
    location: str
    home: str
    away: str
    score: str
    pins: str
    status: Literal["odohrané", "plánované", "import"] = "import"
    detailRows: str = ""
    importedAt: str | None = None
    importStatus: Literal["manual", "auto", "edited"] | None = None


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
    paymentStatus: Literal["free", "pending"] = "pending"
    createdAt: str


class RegistrationCreate(BaseModel):
    tournamentId: int
    name: str
    club: str = "Bez klubu"
    email: str
    phone: str = ""
    slot: str
    note: str = ""
    paymentStatus: Literal["free", "pending"] = "pending"


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class CheckoutBody(BaseModel):
    mode: Literal["membership", "tournament"] = "membership"
    name: str | None = None
    amount: float
    email: EmailStr | None = None
    metadata: dict[str, str] = Field(default_factory=dict)

