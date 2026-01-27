// ----------------------
// Common Types

import { ApiResponse } from "./common";

// ----------------------
interface Customer {
  id: string;
}

interface Source {
  amount: number;
  currency: string;
  customer?: Customer;
}

interface PaymentMethod {
  id?: string;
  type: string;
  chain?: string;
  evm_address?: string;
}

interface Destination {
  customer?: Customer;
  payment_method?: PaymentMethod;
}

type Metadata = Record<string, any>;

// ----------------------
// Provider-specific Requests
// ----------------------
export interface BrlaTransferRequest {
  provider: "brla";
  source: Source & { currency: "brla" };
  destination: Destination;
  metadata?: Metadata;
}

export interface StripeTransferRequest {
  provider: "stripe";
  source: Source & { currency: "usd" };
  destination: Destination & {
    customer: Customer;
    payment_method: { id: string; type: "bank" };
  };
  metadata?: Metadata;
  provider_data?: { statement_descriptor?: string };
}

// ----------------------
// Union Request Type
// ----------------------
export type CreateTransferRequest = BrlaTransferRequest | StripeTransferRequest;

// ----------------------
// API Response
// ----------------------

export type CreateTransferResponse = ApiResponse<TransferData>;

export interface TransferData {
  id: string;
  status: string; // e.g., "created"
  type: "transfer";
  source: Source;
  destination: Destination;
  metadata?: Metadata;
  provider: string;
}
