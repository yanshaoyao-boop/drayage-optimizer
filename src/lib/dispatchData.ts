import { ContainerJob, Driver } from "@/types";
import { addDays, format, differenceInDays } from "date-fns";

export const MOCK_DRIVERS: Driver[] = [
    { id: 'D001', name: 'Mike Chen (陈师傅)', phone: '626-555-0101', licensePlate: '9W29381', status: 'HAULING_LOAD', currentJobId: 'JOB-102', location: 'I-710 N (Near 405)' },
    { id: 'D002', name: 'Jose Rodriguez', phone: '323-555-0102', licensePlate: '8X11223', status: 'IDLE', location: 'Yard (Compton)' },
    { id: 'D003', name: 'Li Zhang (张师傅)', phone: '626-555-0103', licensePlate: '7V99882', status: 'HAULING_EMPTY', currentJobId: 'JOB-105', location: 'Returning to WBCT' },
    { id: 'D004', name: 'Sam Wilson', phone: '310-555-0104', licensePlate: '9K88331', status: 'OFF_DUTY', location: 'Home' },
    { id: 'D005', name: 'Wang Wei (王师傅)', phone: '626-555-0105', licensePlate: '6M77112', status: 'IDLE', location: 'Yard (Compton)' },
];

const TODAY = new Date();

export const MOCK_JOBS: ContainerJob[] = [
    {
        id: 'JOB-101',
        containerNo: 'MSKU9821234',
        masterBL: 'MAEU123456789',
        size: '40',
        type: 'HQ',
        origin: 'LGB',
        destination: 'ONT8',
        eta: format(addDays(TODAY, -3), 'yyyy-MM-dd'),
        lfdTerminal: format(TODAY, 'yyyy-MM-dd'), // Expiring TODAY! (Critical)
        status: 'PENDING',
        customerRef: 'PO-2025-001'
    },
    {
        id: 'JOB-102',
        containerNo: 'TCLU4421123',
        masterBL: 'COSU987654321',
        size: '40',
        type: 'HQ',
        origin: 'LAX',
        destination: 'SBD1',
        eta: format(addDays(TODAY, -1), 'yyyy-MM-dd'),
        lfdTerminal: format(addDays(TODAY, 1), 'yyyy-MM-dd'), // Expiring Tomorrow (High)
        status: 'DISPATCHED',
        assignedDriverId: 'D001',
        customerRef: 'PO-2025-002'
    },
    {
        id: 'JOB-103',
        containerNo: 'CBHU1234567',
        masterBL: 'CMAC123987111',
        size: '20',
        type: 'GP',
        origin: 'LGB',
        destination: 'LGB8',
        eta: format(addDays(TODAY, -2), 'yyyy-MM-dd'),
        lfdTerminal: format(addDays(TODAY, 2), 'yyyy-MM-dd'), // 2 days left (Medium)
        status: 'PENDING',
        customerRef: 'URGENT-SHOES'
    },
    {
        id: 'JOB-104',
        containerNo: 'HDMU1112223',
        masterBL: 'HLCU111222333',
        size: '45',
        type: 'HQ',
        origin: 'LAX',
        destination: 'GYR3', // Remote!
        eta: format(addDays(TODAY, -5), 'yyyy-MM-dd'),
        lfdTerminal: format(addDays(TODAY, -1), 'yyyy-MM-dd'), // Expired! (Demurrage Active)
        status: 'PENDING',
        customerRef: 'REMOTE-TEST',
        potentialDemurrage: 200
    },
    {
        id: 'JOB-105',
        containerNo: 'EMCU9988776',
        masterBL: 'EGLV000111222',
        size: '40',
        type: 'HQ',
        origin: 'LGB',
        destination: 'LAX9',
        eta: format(addDays(TODAY, -4), 'yyyy-MM-dd'),
        lfdTerminal: format(addDays(TODAY, -2), 'yyyy-MM-dd'),
        status: 'EMPTY_RETURNED',
        assignedDriverId: 'D003',
        customerRef: 'COMPLETED-JOB'
    }
];

export const getJobUrgency = (lfd: string): 'Critical' | 'High' | 'Medium' | 'Low' | 'Expired' => {
    const daysLeft = differenceInDays(new Date(lfd), new Date());

    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Critical';
    if (daysLeft <= 1) return 'High';
    if (daysLeft <= 2) return 'Medium';
    return 'Low';
};
