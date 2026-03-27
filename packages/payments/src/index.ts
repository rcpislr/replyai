import crypto from 'crypto';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod, SubscriptionPlan } from '@replyai/shared';

export const PayTRConfigSchema = z.object({
  merchantId: z.string(),
  merchantKey: z.string(),
  merchantSalt: z.string(),
  testMode: z.boolean().default(true),
});

export const PayTRPaymentRequestSchema = z.object({
  tenantId: z.string().uuid(),
  amount: z.number().int().min(100),
  email: z.string().email(),
  userId: z.string().uuid(),
  plan: z.nativeEnum(SubscriptionPlan),
  callbackUrl: z.string().url(),
});

export interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
}

export interface PayTRPaymentRequest {
  tenantId: string;
  amount: number;
  email: string;
  userId: string;
  plan: SubscriptionPlan;
  callbackUrl: string;
}

export interface PayTRPaymentResponse {
  status: 'success' | 'failed';
  token: string;
  redirectUrl?: string;
  error?: string;
}

export interface PayTRCallbackData {
  status: string;
  amount: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  merchantOid: string;
  paymentType: string;
  cardLastFour: string;
  cardBrand: string;
  binNumber: string;
  userId: string;
  transactionId: string;
  token: string;
}

export class PayTRGateway {
  private merchantId: string;
  private merchantKey: string;
  private merchantSalt: string;
  private testMode: boolean;

  constructor(config: PayTRConfig) {
    this.merchantId = config.merchantId;
    this.merchantKey = config.merchantKey;
    this.merchantSalt = config.merchantSalt;
    this.testMode = config.testMode;
  }

  static fromDb(settings: Record<string, string>): PayTRGateway {
    return new PayTRGateway({
      merchantId: settings.PAYTR_MERCHANT_ID || '',
      merchantKey: settings.PAYTR_MERCHANT_KEY || '',
      merchantSalt: settings.PAYTR_MERCHANT_SALT || '',
      testMode: settings.PAYTR_TEST_MODE === 'true',
    });
  }

  async createPaymentLink(request: PayTRPaymentRequest): Promise<PayTRPaymentResponse> {
    const merchantOid = `PAY-${uuidv4().slice(0, 8).toUpperCase()}`;
    const amount = request.amount;
    const amountStr = amount.toString();

    const dataString = `${this.merchantId}${merchantOid}${request.email}${amountStr}${request.callbackUrl}${request.callbackUrl}`;
    const paytrHash = crypto
      .createHmac('sha256', this.merchantKey)
      .update(dataString)
      .digest('base64');

    const formData = new URLSearchParams();
    formData.append('merchant_id', this.merchantId);
    formData.append('merchant_oid', merchantOid);
    formData.append('email', request.email);
    formData.append('payment_type', 'card');
    formData.append('currency', 'TRY');
    formData.append('amount', amountStr);
    formData.append('installment_count', '1');
    formData.append('payment_amount', amountStr);
    formData.append('user_ip', process.env.SERVER_IP || '127.0.0.1');
    formData.append('merchant_ok_url', request.callbackUrl);
    formData.append('merchant_fail_url', request.callbackUrl);
    formData.append('user_basket', JSON.stringify([[`${request.plan} Plan`, amount]]));
    formData.append('debug_on', this.testMode ? '1' : '0');
    formData.append('test_mode', this.testMode ? '1' : '0');
    formData.append('paytr_token', paytrHash);
    formData.append('client_lang', 'tr');

    try {
      const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json() as any;

      if (data.status === 'success') {
        return {
          status: 'success',
          token: data.token,
          redirectUrl: `https://www.paytr.com/odeme/api/${data.token}`,
        };
      }

      return {
        status: 'failed',
        token: '',
        error: data.reason || 'Payment failed',
      };
    } catch (error) {
      return {
        status: 'failed',
        token: '',
        error: String(error),
      };
    }
  }

  verifyCallback(data: Record<string, string>): boolean {
    const { status, amount, merchantOid, hash } = data;

    const hashString = `${merchantOid}${status}${amount}${this.merchantSalt}`;
    const expectedHash = crypto
      .createHmac('sha256', this.merchantKey)
      .update(hashString)
      .digest('base64');

    return hash === expectedHash;
  }
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  IBAN: string;
  accountHolder: string;
  isActive: boolean;
}

export interface BankTransferRequest {
  tenantId: string;
  amount: number;
  email: string;
  userId: string;
  plan: SubscriptionPlan;
  dueDate: Date;
}

export class BankTransferService {
  private bankAccounts: BankAccount[] = [];

  constructor(bankAccounts: BankAccount[] = []) {
    this.bankAccounts = bankAccounts;
  }

  static fromDb(accounts: BankAccount[]): BankTransferService {
    return new BankTransferService(accounts);
  }

  async createTransferRequest(request: BankTransferRequest): Promise<{
    id: string;
    bankAccounts: Omit<BankAccount, 'id'>[];
    amount: number;
    dueDate: Date;
    instructions: string;
  }> {
    const transferId = `HAVALE-${uuidv4().slice(0, 8).toUpperCase()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    return {
      id: transferId,
      bankAccounts: this.bankAccounts.map(({ id, ...rest }) => rest),
      amount: request.amount,
      dueDate,
      instructions: `Lütfen açıklama kısmına "${transferId}" yazınız. 48 saat içinde ödeme yapılmazsa talep iptal edilir.`,
    };
  }

  async verifyTransfer(proof: string, amount: number, transferId: string): Promise<boolean> {
    return true;
  }
}

export interface SubscriptionPricing {
  [SubscriptionPlan.STARTER]: { monthly: number; yearly: number };
  [SubscriptionPlan.GROWTH]: { monthly: number; yearly: number };
  [SubscriptionPlan.PRO]: { monthly: number; yearly: number };
}

export const SUBSCRIPTION_PRICING: SubscriptionPricing = {
  [SubscriptionPlan.STARTER]: { monthly: 0, yearly: 0 },
  [SubscriptionPlan.GROWTH]: { monthly: 499, yearly: 4499 },
  [SubscriptionPlan.PRO]: { monthly: 1499, yearly: 13499 },
};

export function getPlanPrice(plan: SubscriptionPlan, paymentMethod: PaymentMethod): number {
  if (paymentMethod === 'byok') return 0;
  return SUBSCRIPTION_PRICING[plan].monthly;
}
