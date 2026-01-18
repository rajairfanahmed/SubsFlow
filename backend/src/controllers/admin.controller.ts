import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Payment } from '../models/payment.model';
import { StatusCodes } from 'http-status-codes';

// Simple CSV sanitizer to prevent CSV injection and handle commas
const escapeCsv = (field: any) => {
    if (field === null || field === undefined) {
        return '';
    }
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

export class AdminController {
    /**
     * Stream all users as CSV
     */
    static async exportUsers(req: Request, res: Response): Promise<void> {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');

        // Write Header
        res.write('id,name,email,role,status,createdAt\n');

        // Create Cursor
        const cursor = User.find({}, { passwordHash: 0, __v: 0 }).cursor();

        cursor.on('data', (doc) => {
             const row = [
                doc._id,
                doc.name,
                doc.email,
                doc.role,
                doc.status || 'active',
                doc.createdAt ? new Date(doc.createdAt).toISOString() : ''
             ].map(escapeCsv).join(',');
             
             res.write(row + '\n');
        });

        cursor.on('end', () => {
            res.end();
        });

        cursor.on('error', (err) => {
            console.error("Export Stream Error:", err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
        });
    }

    /**
     * Stream all payments as CSV
     */
    static async exportPayments(req: Request, res: Response): Promise<void> {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="payments-export.csv"');

        res.write('id,userId,amount,currency,status,stripePaymentIntentId,createdAt\n');

        const cursor = Payment.find({}).populate('userId', 'email name').cursor();

        cursor.on('data', (doc: any) => {
             const row = [
                doc._id,
                doc.userId?.email || 'deleted-user',
                doc.amount,
                doc.currency,
                doc.status,
                doc.stripePaymentIntentId,
                doc.createdAt ? new Date(doc.createdAt).toISOString() : ''
             ].map(escapeCsv).join(',');
             
             res.write(row + '\n');
        });

        cursor.on('end', () => {
            res.end();
        });
        
        cursor.on('error', (err) => {
             console.error("Export Stream Error:", err);
             res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
        });
    }
}
