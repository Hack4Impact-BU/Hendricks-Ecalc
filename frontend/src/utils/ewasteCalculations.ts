import { DeviceInfo } from "../pages/deviceInfoSubmission";

//interface for material composition of a device, used for both material weight and CO2 emissions calculations
export interface MaterialComposition {
    ferrousMetal: number;
    aluminum: number;
    copper: number;
    otherMetals: number;
    plastic: number;
    pcb: number; 
    flatPanelDisplayModule: number;
    crtGlassAndLead: number;
    battery: number;
}

//maps devices to their respective categories
const deviceToCategory: Map<string, string> = new Map([
    ["CPU", "CPU"],
    ["Smartphone", "portable devices"],
    ["Tablet", "portable devices"],
    ["Laptop", "portable devices"],
    ["Modern Monitor", "flat panel displays"],
    ["Laptop Screen", "flat panel displays"],
    ["CRT Monitor (Older, Not In Laptop)", "CRT displays"],
    ["Mouse", "electronic peripherals"],
    ["Keyboard", "electronic peripherals"],
    ["External Hard Drive", "electronic peripherals"],
    ["Charger", "electronic peripherals"],
    ["Printer", "hard copy devices"],
    ["Scanner", "hard copy devices"],
    ["Copier", "hard copy devices"],
]);

//co2 emissions are per short ton of the device weight
const categoryToCO2Emissions: Map<string, number> = new Map([
    ["CPU", 0.4],
    ["portable devices", 0.88],
    ["flat panel displays", 0.73],
    ["CRT displays", 0.63],
    ["electronic peripherals", 2.22],
    ["hard copy devices", 1.91],
]);

//material composition is in percentage of the device weight
const categoryToMaterialComposition: Map<string, MaterialComposition> = new Map([
    [
      "CPU",
      {
        ferrousMetal: 59,
        aluminum: 11,
        copper: 4,
        otherMetals: 2,
        plastic: 12,
        pcb: 14,
        flatPanelDisplayModule: 0,
        crtGlassAndLead: 0,
        battery: 18,
      },
    ],
    [
      "portable devices",
      {
        ferrousMetal: 7,
        aluminum: 12,
        copper: 2,
        otherMetals: 4,
        plastic: 27,
        pcb: 14,
        flatPanelDisplayModule: 16,
        crtGlassAndLead: 0,
        battery: 0,
      },
    ],
    [
      "flat panel displays",
      {
        ferrousMetal: 37,
        aluminum: 7,
        copper: 0,
        otherMetals: 0,
        plastic: 22,
        pcb: 6,
        flatPanelDisplayModule: 26,
        crtGlassAndLead: 0,
        battery: 0,
      },
    ],
    [
      "CRT displays",
      {
        ferrousMetal: 5,
        aluminum: 3,
        copper: 0,
        otherMetals: 0,
        plastic: 0,
        pcb: 1,
        flatPanelDisplayModule: 0,
        crtGlassAndLead: 59,
        battery: 0,
      },
    ],
    [
      "electronic peripherals",
      {
        ferrousMetal: 2,
        aluminum: 0,
        copper: 26,
        otherMetals: 0,
        plastic: 8,
        pcb: 0,
        flatPanelDisplayModule: 0,
        crtGlassAndLead: 0,
        battery: 0,
      },
    ],
    [
      "hard copy devices",
      {
        ferrousMetal: 37,
        aluminum: 0,
        copper: 1,
        otherMetals: 0,
        plastic: 59,
        pcb: 3,
        flatPanelDisplayModule: 0,
        crtGlassAndLead: 0,
        battery: 0,
      },
    ],
]);

//takes in a device and returns the weight composition of materials saved
export function calculateMaterialComposition(device: DeviceInfo): MaterialComposition {
    const weightComposition: MaterialComposition = {
        ferrousMetal: 0,
        aluminum: 0,
        copper: 0,
        otherMetals: 0,
        plastic: 0,
        pcb: 0,
        flatPanelDisplayModule: 0,
        crtGlassAndLead: 0,
        battery: 0,
    };
    const currentDevice: DeviceInfo = device;
    const category: string | undefined = deviceToCategory.get(currentDevice.device);
    if (!category) {
        return weightComposition;
    }

    const materialComposition: MaterialComposition | undefined = categoryToMaterialComposition.get(category);
    if (materialComposition) {
        weightComposition.ferrousMetal = (Number(currentDevice.weight) * materialComposition.ferrousMetal) / 100;
        weightComposition.aluminum = (Number(currentDevice.weight) * materialComposition.aluminum) / 100;
        weightComposition.copper = (Number(currentDevice.weight) * materialComposition.copper) / 100;
        weightComposition.otherMetals = (Number(currentDevice.weight) * materialComposition.otherMetals) / 100;
        weightComposition.plastic = (Number(currentDevice.weight) * materialComposition.plastic) / 100;
        weightComposition.pcb = (Number(currentDevice.weight) * materialComposition.pcb) / 100;
        weightComposition.flatPanelDisplayModule = (Number(currentDevice.weight) * materialComposition.flatPanelDisplayModule) / 100;
        weightComposition.crtGlassAndLead = (Number(currentDevice.weight) * materialComposition.crtGlassAndLead) / 100;
        weightComposition.battery = (Number(currentDevice.weight) * materialComposition.battery) / 100;
    }

    return weightComposition;
}

//takes in a device and returns the amount of CO2 emissions saved
export function calculateCO2Emissions(device: DeviceInfo): number {
    const lbsToShortTon: number = 2000;
    const weight: number = Number(device.weight);
    const category: string | undefined = deviceToCategory.get(device.device);
    if (!category) {
        return 0;
    }
    const co2Emissions: number | undefined = categoryToCO2Emissions.get(category);
    if (!co2Emissions) {
        return 0;
    }
    return weight / lbsToShortTon * co2Emissions * lbsToShortTon;
}