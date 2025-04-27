interface deviceFormOptionsType {
    [key: string]: {
        [key: string]: string[];
    };
}
  
export const deviceFormOptions: deviceFormOptionsType = {
    "CPU": {
        "Intel": [
            "Core i3-12100",
            "Core i5-12400",
            "Core i7-12700",
            "Core i9-12900",
            "Core i3-13100",
            "Core i5-13400",
            "Core i7-13700",
            "Core i9-13900",
        ],
        "AMD": [
            "Ryzen 3 5300G",
            "Ryzen 5 5600G",
            "Ryzen 7 5700G",
            "Ryzen 9 5900X",
            "Ryzen 3 4100",
            "Ryzen 5 4500",
            "Ryzen 7 4700G",
            "Ryzen 9 5900X3D",
            "Ryzen 5 5600X",
            "Ryzen 7 5800X",
            "Ryzen 9 5950X",
        ]
    },

    "Smartphone": {
        "Apple": [
            "iPhone 14",
            "iPhone 14 Plus",
            "iPhone 14 Pro",
            "iPhone 14 Pro Max",
            "iPhone SE",
            "iPhone 13 Pro",
        ],
        "Samsung": [
            "Galaxy S23",
            "Galaxy S23+",
            "Galaxy S23 Ultra",
            "Galaxy Z Flip4",
            "Galaxy Z Fold4",
            "Galaxy A53",
            "Galaxy A73",
            "Galaxy M53",
            "Galaxy M33",
            "Galaxy F23"
        ],
        "Google": [
            "Pixel 7",
            "Pixel 7 Pro",
            "Pixel 6a",
            "Pixel 6",
            "Pixel 5a",
            "Pixel 5",
            "Pixel 4a",
            "Pixel 4a 5G",
            "Pixel 4",
            "Pixel 3a",
        ],
        "OnePlus": [
            "OnePlus 11",
            "OnePlus 10 Pro",
            "OnePlus 9",
            "OnePlus 9 Pro",
            "OnePlus Nord 2",
            "OnePlus Nord CE 2",
            "OnePlus Nord N200",
            "OnePlus 8T",
            "OnePlus 8 Pro",
            "OnePlus 7T",
        ],
        "Xiaomi": [
            "Mi 12",
            "Mi 12 Pro",
            "Mi 11",
            "Mi 11 Ultra",
            "Redmi Note 11",
            "Redmi Note 11 Pro",
            "Poco F4 GT",
            "Poco X4 Pro",
            "Xiaomi 12T Pro",
            "Xiaomi Mix 4"
        ],
        "Huawei": [
            "P50 Pro",
            "Mate 40 Pro",
            "P40 Pro",
            "Nova 8",
            "P30 Pro",
            "Mate 30 Pro",
            "P20 Pro",
            "Honor 50",
            "Honor 70",
            "Honor Magic4"
        ],
    },
    "Tablet": {
        "Apple": [
            "iPad Pro 12.9-inch",
            "iPad Pro 11-inch",
            "iPad Air (5th generation)",
            "iPad (10th generation)",
            "iPad mini (6th generation)",
        ],
        "Samsung": [
            "Galaxy Tab S8",
            "Galaxy Tab S8+",
            "Galaxy Tab S8 Ultra",
            "Galaxy Tab A7 Lite",
            "Galaxy Tab S6 Lite",
        ],
        "Microsoft": [
            "Surface Pro 8",
            "Surface Go 3",
            "Surface Duo 2",
            "Surface Book 3",
            "Surface Studio 2",
        ],
        "Lenovo": [
            "Tab P11 Pro",
            "Tab P11 Plus",
            "Yoga Tab 13",
            "Tab M10 Plus",
        ],
        "Huawei": [
            "MatePad Pro 12.6",
            "MatePad 11",
            "MatePad T10s",
        ],
    },
    "Laptop": {
        "Apple": [
            "MacBook Air",
            "MacBook Pro 13-inch",
            "MacBook Pro 14-inch",
            "MacBook Pro 16-inch",
        ],
        "Samsung": [
            "Galaxy Book Pro",
            "Galaxy Book Pro 360",
            "Galaxy Book Odyssey",
            "Galaxy Chromebook 4",
            "Galaxy A53"
        ],
        "Dell": [
            "XPS 13",
            "XPS 15",
            "XPS 17",
            "Inspiron 15 5000",
            "Inspiron 15 7000",
            "Latitude 7420",
            "Latitude 9520",
            "Precision 3550",
            "Alienware m15",
            "Alienware m17"
        ],
        "HP": [
            "Spectre x360",
            "Envy x360",
            "Pavilion 15",
            "EliteBook 840",
            "Elite Dragonfly",
            "Omen 15",
            "Omen 17",
            "ProBook 450",
            "ZBook Create G7",
            "HP Stream 14"
        ],
        "Lenovo": [
            "ThinkPad X1 Carbon",
            "ThinkPad X1 Yoga",
            "ThinkPad T14",
            "ThinkPad P1",
            "ThinkPad E14",
            "IdeaPad 3",
            "IdeaPad 5",
            "Legion 5",
            "Yoga Slim 7i",
            "Yoga 9i"
        ],
        "ASUS": [
            "ZenBook 13",
            "ZenBook 14",
            "ZenBook Pro Duo",
            "ROG Zephyrus G14",
            "ROG Zephyrus S15",
            "ASUS TUF Gaming F15",
            "VivoBook S15",
            "Chromebook Flip",
            "ROG Strix Scar 15",
            "Zenfone 8"
        ],
        "Acer": [
            "Swift 3",
            "Swift 5",
            "Aspire 5",
            "Predator Helios 300",
            "Nitro 5",
            "Chromebook 514",
            "ConceptD 7",
            "Spin 5",
            "Enduro N3",
            "TravelMate P6"
        ],
        "Microsoft": [
            "Surface Laptop 4",
            "Surface Laptop Studio",
            "Surface Pro 8",
            "Surface Pro 7+",
            "Surface Go 3",
            "Surface Duo 2",
            "Surface Book 3",
            "Surface Studio 2",
            "Surface Pro X",
            "Surface Hub 2S"
        ],
        "Huawei": [
            "MateBook X Pro",
            "MateBook 14",
            "MateBook D 14",
            "MateBook 13",
            "MateBook E",
        ],
        "Xiaomi": [
            "Mi Notebook Pro 14",
            "Mi Notebook Air 12.5",
            "RedmiBook 14",
            "RedmiBook Pro 15",
        ]
    },
    "Modern Monitor": {
        "Dell": [
            "UltraSharp U2720Q",
            "UltraSharp U3219Q",
            "P2720DC",
            "S2721QS",
            "P3221D",
        ],
        "LG": [
            "UltraFine 5K",
            "UltraWide 34WN80C-B",
            "27UK850-W",
            "32UN880-B",
            "27GL850-B",
        ],
        "Samsung": [
            "Odyssey G9",
            "Odyssey G7",
            "Smart Monitor M8",
            "Smart Monitor M7",
            "Smart Monitor M5"
        ],
        "ASUS": [
            "ProArt PA32UCX-PK",
            "ROG Swift PG32UQX",
            "ProArt PA27ACM",
            "ProArt PA32UC-K",
        ]
    },
    "Laptop Screen": {

    },
    "CRT Monitor (Older, Not In Laptop)": {

    },
    "Mouse": {
        "Logitech": [
            "MX Master 3",
            "MX Anywhere 3",
            "G502 HERO",
            "G Pro Wireless",
            "M720 Triathlon",
            "M330 Silent Plus",
            "M590 Multi-Device Silent",
        ],
        "Razer": [
            "DeathAdder V2",
            "Basilisk V3",
            "Viper Ultimate",
            "Naga X",
            "Huntsman Mini",
        ],
        "Corsair": [
            "Dark Core RGB SE",
        ],
    },
    "Keyboard": {
        "Logitech": [
            "MX Keys",
            "G915 TKL",
            "K380",
            "K780",
            "G613",
        ],
        "Razer": [
            "BlackWidow V3",
            "Huntsman Elite",
            "Ornata V2",
            "BlackWidow Lite",
            "Huntsman Mini",
        ],
        "Corsair": [
            "K95 RGB Platinum",
            "K70 RGB MK.2",
            "K55 RGB",
        ],
    },
    "External Hard Drive": {
        "Seagate": [
            "Expansion Portable",
            "Backup Plus Slim",
            "One Touch SSD",
            "Game Drive for PS4",
            "Game Drive for Xbox",
        ],
        "Western Digital": [
            "My Passport",
            "My Book",
            "Elements Portable",
            "My Passport SSD",
            "WD Black P50 Game Drive SSD",
        ],
        "Samsung": [
            "T7 Portable SSD",
            "T5 Portable SSD",
            "X5 Portable SSD",
        ],
    },
    "Charger": {
    
    },
    "Printer": {
        "HP": [
            "LaserJet Pro M404dn",
            "LaserJet Pro MFP M428fdw",
            "OfficeJet Pro 9015e",
            "Envy 6055e",
            "DeskJet 4155e",
        ],
        "Canon": [
            "PIXMA TR8620",
            "PIXMA G6020",
            "imageCLASS MF445dw",
            "imageCLASS LBP6030w",
        ],
        "Brother": [
            "HL-L2350DW",
            "MFC-L3770CDW",
            "MFC-J995DW",
        ],
    },
    "Scanner": {

    },
    "Copier": {

    },
};

export const deviceTypes: string[] = [
    "CPU",
    "Smartphone",
    "Tablet",
    "Laptop",
    "Modern Monitor",
    "Laptop Screen",
    "CRT Monitor (Older, Not In Laptop)",
    "Mouse",
    "Keyboard",
    "External Hard Drive",
    "Charger",
    "Printer",
    "Scanner",
    "Copier"
];