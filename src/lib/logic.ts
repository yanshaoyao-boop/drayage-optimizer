import { Warehouse, QuoteParams, QuoteResult, Port } from "@/types";
import warehouseData from "@/data/us_warehouses.json";

export const PORTS: Port[] = [
    { code: "LGB", name: "Long Beach (长滩港)", address: "1300 Pier B St", city: "Long Beach", state: "CA", region: "West" },
    { code: "LAX", name: "Los Angeles (洛杉矶港)", address: "444 S Flower St", city: "Los Angeles", state: "CA", region: "West" },
    { code: "OAK", name: "Oakland (奥克兰港)", address: "530 Water St", city: "Oakland", state: "CA", region: "West" },
    { code: "SAV", name: "Savannah (萨凡纳港)", address: "2 Main St", city: "Garden City", state: "GA", region: "East" },
    { code: "NYNJ", name: "New York/NJ (纽约新泽西港)", address: "1210 Corbin St", city: "Elizabeth", state: "NJ", region: "East" },
    { code: "HOU", name: "Houston (休斯顿港)", address: "111 East Loop North", city: "Houston", state: "TX", region: "South" }
];

// Mock distances matrix as fallback
const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
    "LGB": { "ONT8": 75, "LAX9": 65, "LGB8": 80, "SBD1": 85, "FAT1": 240, "SMF3": 410, "OAK4": 380, "GYR3": 380, "LAS7": 280, "FTW1": 1400, "MDW2": 2100, "ABE8": 2800, "BHM1": 2000, "CLT2": 2400 },
    "LAX": { "ONT8": 80, "LAX9": 70, "LGB8": 85, "SBD1": 90, "FAT1": 235, "SMF3": 405, "OAK4": 375, "GYR3": 385, "LAS7": 285, "FTW1": 1405, "MDW2": 2105, "ABE8": 2805, "BHM1": 2005, "CLT2": 2405 },
    "OAK": { "FAT1": 160, "SMF3": 85, "OAK4": 65, "ONT8": 400, "LAX9": 390 },
    "SAV": { "BHM1": 350, "CLT2": 250, "ABE8": 750, "FTW1": 1000 },
    "NYNJ": { "ABE8": 65, "CLT2": 600, "BHM1": 950 },
    "HOU": { "FTW1": 260, "BHM1": 650, "CLT2": 1000 }
};

/**
 * Fetch real distance from Google Maps API
 * Note: Key should be kept on the server side in a real app
 */
export const getRealDistance = async (origin: string, destAddr: string): Promise<{ miles: number, durationHours: number } | null> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_KEY_HERE") return null;

    try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destAddr)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
            const element = data.rows[0].elements[0];
            const meters = element.distance.value;
            const seconds = element.duration.value;

            return {
                miles: Math.round(meters * 0.000621371), // meters to miles
                durationHours: seconds / 3600
            };
        }
    } catch (err) {
        console.error("Google Maps API Error:", err);
    }
    return null;
};

export const getEnrichedWarehouses = (): Warehouse[] => {
    return warehouseData.map((wh) => {
        const isCritical = wh.code === 'ONT8' || wh.code === 'LAX9' || wh.code === 'SBD1';
        const isCongested = (wh.code.charCodeAt(2) % 4 === 0);

        let congestion: Warehouse['congestionLevel'] = 'Low';
        let waitTime = 45;

        if (isCritical) {
            congestion = 'Critical';
            waitTime = 300 + Math.floor(Math.random() * 120);
        } else if (isCongested) {
            congestion = 'High';
            waitTime = 150 + Math.floor(Math.random() * 90);
        } else if (wh.code.charCodeAt(1) % 2 === 0) {
            congestion = 'Medium';
            waitTime = 90 + Math.floor(Math.random() * 30);
        }

        return { ...wh, congestionLevel: congestion, avgWaitTimeMins: waitTime };
    });
};

// Smart Heuristic for Option B
// City Hub Distance Map (Miles from major ports)
const HUB_DISTANCE_MAP: Record<string, Record<string, number>> = {
    'LGB': {
        'Moreno Valley': 75, 'Fontana': 65, 'Rialto': 70, 'San Bernardino': 75,
        'Redlands': 80, 'Ontario': 55, 'Chino': 45, 'Jurupa Valley': 55,
        'Eastvale': 50, 'Perris': 85, 'Tracy': 360, 'Stockton': 370,
        'Phoenix': 370, 'Goodyear': 360, 'Las Vegas': 280, 'North Las Vegas': 285
    },
    'LAX': {
        'Moreno Valley': 80, 'Fontana': 70, 'Rialto': 75, 'San Bernardino': 80,
        'Redlands': 85, 'Ontario': 60, 'Chino': 50, 'Jurupa Valley': 60,
        'Eastvale': 55, 'Perris': 90, 'Tracy': 350, 'Stockton': 360,
        'Phoenix': 380, 'Goodyear': 370, 'Las Vegas': 290, 'North Las Vegas': 295
    },
    'OAK': {
        'Tracy': 55, 'Stockton': 70, 'Lathrop': 60, 'Patterson': 85,
        'Sacramento': 90, 'Fresno': 160
    },
    'SAV': {
        'Pooler': 15, 'Port Wentworth': 10, 'Savannah': 5,
        'Charlotte': 250, 'Atlanta': 250, 'Macon': 170
    },
    'NYNJ': {
        'Elizabeth': 5, 'Newark': 8, 'Edison': 25, 'Cranbury': 45,
        'Robbinsville': 55, 'Burlington': 65, 'Allentown': 90
    },
    'HOU': {
        'Houston': 15, 'Pasadena': 10, 'Baytown': 25, 'Dallas': 240,
        'Fort Worth': 250, 'Irving': 245
    }
};

const estimateHeuristicDistance = (port: Port, wh: Warehouse): number => {
    // 1. Precise Hub Mapping
    const portHubs = HUB_DISTANCE_MAP[port.code];
    if (portHubs && portHubs[wh.city]) {
        return portHubs[wh.city];
    }

    // 2. Fallback to existing logic if exact city not found
    if (port.state === wh.state) {
        if (port.state === 'CA') {
            const portIsSoCal = ['LGB', 'LAX'].includes(port.code);
            const whZipPrefix = parseInt(wh.zip.substring(0, 2));
            const whIsSoCal = whZipPrefix >= 90 && whZipPrefix <= 93;
            if (portIsSoCal === whIsSoCal) return 70; // Avg local
            return 380;
        }
        return 60;
    }

    // Regional Logic
    if (port.state === 'CA' && ['NV', 'AZ'].includes(wh.state)) return 320;
    if (port.region === 'East' && wh.region === 'East') return 180;

    return 1000; // Default Long Haul
};

export const calculateQuote = (params: QuoteParams, realData?: { miles: number, durationHours: number }): QuoteResult => {
    let miles = realData?.miles;
    let driveHours = realData?.durationHours;

    if (!miles || !driveHours) {
        // Smart Estimation Strategy (Option B)
        const port = PORTS.find(p => p.code === params.origin);
        const wh = warehouseData.find(w => w.code === params.destinationCode);

        if (port && wh) {
            miles = estimateHeuristicDistance(port, wh);
        } else {
            miles = 150; // Fallback if data missing
        }

        // Assume average truck speed of 50mph for estimation + buffer
        driveHours = miles / 50;
    }

    // 1. Vehicle Type Multipliers
    let fuelPerMile = 1.35;
    let driverHourly = 48;
    let vehicleSurcharge = 0; // e.g. Chassis fee for containers

    switch (params.vehicleType) {
        case 'CONTAINER_40':
        case 'CONTAINER_20':
            fuelPerMile = 1.55;
            driverHourly = 52;
            vehicleSurcharge = 150; // Bridge/Chassis/Gate fees
            break;
        case 'DRY_VAN_53':
            fuelPerMile = 1.45;
            driverHourly = 50;
            break;
        case 'BOX_TRUCK_26':
            fuelPerMile = 0.95;
            driverHourly = 42;
            break;
    }

    // 2. Handling Method Impact
    let handlingFee = 0;
    let extraWaitHours = 0;

    if (params.handlingMethod === 'FLOOR_LOADED') {
        handlingFee = 250; // Labor cost for floor loading
        extraWaitHours = 3; // Typically adds 3 hours to unload
    } else {
        handlingFee = 0;
        extraWaitHours = 0;
    }

    // 3. Time Calculation
    const wh = getEnrichedWarehouses().find(w => w.code === params.destinationCode);
    const baseWaitHours = (wh?.avgWaitTimeMins || 60) / 60;
    const totalWaitHours = baseWaitHours + extraWaitHours;
    const estimatedTotalHours = driveHours + totalWaitHours;

    // 4. Cost Calculation
    const fuelCost = miles * fuelPerMile;
    const driverCost = estimatedTotalHours * driverHourly;
    const baseCost = fuelCost + driverCost + vehicleSurcharge;

    // 5. Surcharges (Detention)
    // 5. Surcharges (Detention)
    const freeWaitTime = 2;
    let congestionSurcharge = 0;
    if (totalWaitHours > freeWaitTime) {
        congestionSurcharge = (totalWaitHours - freeWaitTime) * 85;
    }

    // 6. Advanced Fees Calculation
    const chassisDailyRate = 35;
    const chassisFee = (params.chassisDays || 0) * chassisDailyRate;

    let overweightFee = 0;
    if (params.isOverweight) {
        // Tri-axle cost or permit fee
        overweightFee = 150 + (miles * 0.50);
    }

    let hazmatFee = 0;
    if (params.isHazmat) {
        hazmatFee = 250;
    }

    let prePullFee = 0;
    if (params.isPrePull) {
        prePullFee = 150 + 35; // Pull charge + 1 day storage/chassis
    }

    // Remote Area Surcharge
    let remoteSurcharge = 0;
    if (wh?.isRemote) {
        remoteSurcharge = 180 + (miles * 0.15);
    }

    const totalCost = baseCost + congestionSurcharge + handlingFee + remoteSurcharge + chassisFee + overweightFee + hazmatFee + prePullFee;
    const recommendedPrice = totalCost * 1.30;

    return {
        baseCost: baseCost - fuelCost,
        fuelSurcharge: fuelCost,
        congestionSurcharge,
        handlingFee,
        // New Fees
        chassisFee,
        overweightFee,
        hazmatFee,
        prePullFee,
        remoteSurcharge,

        totalCost,
        recommendedPrice,
        distanceMiles: miles,
        estimatedHours: estimatedTotalHours
    };
};
