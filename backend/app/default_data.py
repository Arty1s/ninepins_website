from app.models import LiveClubData


DEFAULT_CLUB_DATA = LiveClubData(
    tournaments=[
        {
            "id": 1,
            "name": "KK Hlohovec Open 2025",
            "date": "21. jún 2025",
            "time": "18:00",
            "status": "Registrácia otvorená",
            "location": "Kolkáreň Hlohovec",
            "capacity": "64 hráčov",
            "fee": "15 €",
            "entryType": "paid",
            "description": "Otvorený turnaj pre registrovaných aj rekreačných hráčov.",
            "lanes": "4",
            "paymentUrl": "",
            "type": "upcoming",
        },
        {
            "id": 2,
            "name": "Memoriál KKHC",
            "date": "18. júl 2026",
            "time": "10:00",
            "status": "Pripravuje sa",
            "location": "Bernolákova 720",
            "capacity": "48 hráčov",
            "fee": "12 €",
            "entryType": "paid",
            "description": "Klubový memoriál s kapacitou podľa obsadenosti dráh.",
            "lanes": "4",
            "paymentUrl": "",
            "type": "upcoming",
        },
    ],
    leagues=[
        {"id": 1, "name": "Mestská liga Hlohovec", "season": "2026/2027", "teams": "12", "status": "Pripravuje sa", "leader": "-"}
    ],
    players=[
        {"id": 1, "name": "Michaela Vavrová", "team": "KK Hlohovec", "role": "Hráčka", "average": "čaká na import"},
        {"id": 2, "name": "Peter Kováč", "team": "Prvá liga", "role": "Hráč", "average": "612"},
    ],
    members=[
        {
            "id": 1,
            "name": "Michaela Vavrová",
            "email": "michaela@kkhlohovec.sk",
            "team": "KK Hlohovec",
            "role": "player",
            "memberSince": "2026-07-22",
            "membershipStatus": "pending",
            "lastPayment": "-",
            "nextPayment": "Po aktivácii členstva",
        },
        {
            "id": 2,
            "name": "Admin",
            "email": "admin@kkhlohovec.sk",
            "team": "Administrácia klubu",
            "role": "admin",
            "memberSince": "2026-07-22",
            "membershipStatus": "paid",
            "lastPayment": "-",
            "nextPayment": "-",
        },
    ],
    teams=[
        {"id": 1, "slug": "dorastenecka-liga", "name": "Dorastenecká liga", "league": "Mládež a rozvoj", "coach": "Tréner doplní admin", "captain": "Kapitán dorastu doplní admin", "members": "", "achievements": "", "description": "Mladí hráči a hráčky, ktorí sa učia techniku a klubové hodnoty."},
        {"id": 2, "slug": "zenska-extraliga", "name": "Ženská extraliga", "league": "Najvyššia ženská súťaž", "coach": "Trénerka doplní admin", "captain": "Kapitánka doplní admin", "members": "", "achievements": "", "description": "Ženský tím reprezentujúci Hlohovec v najvyššej súťaži."},
        {"id": 3, "slug": "prva-liga", "name": "Prvá liga", "league": "Súťažné družstvo", "coach": "Tréner doplní admin", "captain": "Kapitán doplní admin", "members": "Michaela Vavrová", "achievements": "", "description": "Skúsený súťažný tím postavený na pravidelnom tréningu."},
        {"id": 4, "slug": "druha-liga", "name": "Druhá liga", "league": "Seniorská liga", "coach": "Tréner doplní admin", "captain": "Kapitán doplní admin", "members": "", "achievements": "", "description": "Tím prepájajúci skúsených hráčov s novými členmi."},
        {"id": 5, "slug": "tretia-liga", "name": "Tretia liga", "league": "Rozvojová súťaž", "coach": "Tréner doplní admin", "captain": "Kapitán doplní admin", "members": "", "achievements": "", "description": "Priestor pre členov, ktorí chcú pravidelne hrávať."},
    ],
    matches=[
        {"id": 101, "sourceUrl": "", "league": "1. KL západ 2025/2026", "round": "18. kolo", "date": "11.05.2026", "location": "Hlohovec", "home": "KK Hlohovec", "away": "TJ Rakovice", "score": "6 : 2", "pins": "3372 : 3291", "status": "odohrané", "importStatus": "manual", "detailRows": ""},
        {"id": 102, "sourceUrl": "", "league": "1. KL západ 2025/2026", "round": "17. kolo", "date": "04.05.2026", "location": "Hlohovec", "home": "KK Hlohovec", "away": "KK Trstená", "score": "7 : 1", "pins": "3398 : 3230", "status": "odohrané", "importStatus": "manual", "detailRows": ""},
        {"id": 103, "sourceUrl": "", "league": "1. KL západ 2025/2026", "round": "16. kolo", "date": "27.04.2026", "location": "Hlohovec", "home": "KK Hlohovec", "away": "KK Inter Bratislava", "score": "5 : 3", "pins": "3301 : 3250", "status": "odohrané", "importStatus": "manual", "detailRows": ""},
        {"id": 104, "sourceUrl": "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A", "league": "Extraliga muži 2025/2026", "round": "22. kolo", "date": "18.04.2026", "location": "Žarnovica", "home": "KO Žarnovica", "away": "KKZ Hlohovec A", "score": "7.0 : 1.0", "pins": "3 586 : 3 372", "status": "odohrané", "importStatus": "manual", "detailRows": "Jančovič Martin | 629 | Novosad Róbert | 537\nNasvetr Dalibor | 574 | Poláčik Roman | 588"},
    ],
    gallery=[
        {"id": 1, "slug": "kk-hlohovec-podbrezova", "title": "KK Hlohovec - SK Železiarne Podbrezová", "category": "zapasy", "date": "12. máj 2024", "description": "Domáci zápas a atmosféra v kolkárni.", "coverImage": "/images/gallery-1.jpg", "photos": "/images/gallery-1.jpg, /images/gallery-2.jpg, /images/gallery-3.jpg", "featured": True}
    ],
)

