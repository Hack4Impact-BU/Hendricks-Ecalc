interface ManufacturerModels {
    [manufacturer: string]: string[];
}
  
export const manufacturers: ManufacturerModels = {
    "Apple": [
        "MacBook Air",
        "MacBook Pro 13-inch",
        "MacBook Pro 14-inch",
        "MacBook Pro 16-inch",
        "iPhone 14",
        "iPhone 14 Plus",
        "iPhone 14 Pro",
        "iPhone 14 Pro Max",
        "iPhone SE",
        "iPhone 13 Pro"
    ],
    "Samsung": [
        "Galaxy S23",
        "Galaxy S23+",
        "Galaxy S23 Ultra",
        "Galaxy Z Flip4",
        "Galaxy Z Fold4",
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
        "P50 Pro",
        "Mate 40 Pro",
        "P40 Pro",
        "Mate 30 Pro",
        "Nova 8"
    ],
    "Xiaomi": [
        "Mi Notebook Pro 14",
        "Mi Notebook Air 12.5",
        "RedmiBook 14",
        "RedmiBook Pro 15",
        "Mi 11",
        "Mi 11 Ultra",
        "Mi 11X",
        "Redmi Note 11",
        "Redmi Note 11 Pro",
        "Xiaomi 12T Pro"
    ]
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